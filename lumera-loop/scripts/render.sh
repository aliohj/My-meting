#!/usr/bin/env bash
# Lumera screen loop: 16:9, ~7.6s, seamless loop, no audio.
#   day AR ad  ->  fast-cut night montage of client ads  ->  day EN ad
#
# Usage: ./render.sh <day.mp4> <night.mp4> <quartz.mp4> <out_dir>
#        VARIANT=short ./render.sh ...   -> 4.5s: day AR -> day Dream drinks -> day EN
#   day.mp4    = dji_mimo_20261025_155556_0585_1793000936144_video.mp4 (Drive)
#   night.mp4  = Drive file 1IGM12R86KnsQ5f6fwQc-J4Pzdc1g4tk- (sped-up night shot)
#   quartz.mp4 = VID-20261031-WA0139.mp4 (Quartz jewellery ad creative)
set -euo pipefail
DAY=${1:?day clip}; NIGHT=${2:?night clip}; QUARTZ=${3:?quartz creative}; OUT=${4:-.}
mkdir -p "$OUT"
HERE=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

# Framing: each screen's 4 inner corners (TL TR BL BR, source px, measured by
# hand) are expanded by a margin through the screen homography (quad.py) and
# warped to fill the frame: the screen ends up straight and centred, with its
# frame and a little wall around it. In the output the screen itself occupies
# x 160..1760, y 125..955 (MX=0.10, MY=0.15).
MX=0.10; MY=0.15
SX=160; SY=125; SW=1600; SH=830
warp(){ # warp <band_w> <band_h> <band_y> x0 y0 x1 y1 x2 y2 x3 y3
  local bw=$1 bh=$2 by=$3; shift 3; local q
  q=$(python3 "$HERE/quad.py" "$MX" "$MY" "$@" | awk -F: -v by="$by" '{for(i=2;i<=NF;i+=2)$i-=by; OFS=":"; $1=$1; print}')
  echo "crop=$bw:$bh:0:$by,perspective=$q:interpolation=cubic"; }
DAY_LATE=$(warp 1728 1100 400  261 736 1375 615 260 1272 1377 1193)
DAY_EARLY=$(warp 1728 1100 400 322 664 1445 579 308 1199 1428 1159)
NIGHT_W=$(warp 1080 800 0       134 265 942 212 131 635 943 602)
V="scale=1920:1080:flags=lanczos,fps=30,setsar=1,format=yuv420p"

# Shot list:  kind  source-start  duration  [extra]
#   day   : day clip, stabilised (vidstab tripod) — camera settles ~63.6s
#   night : night clip (already fast-cut, sped-up footage)
#   comp  : Quartz creative composited onto the night screen
#   dayad : day clip, earlier camera position (client ads part), tripod-steady
VARIANT=${VARIANT:-full}
if [[ $VARIANT == short ]]; then
SHOTS=(
  "day   63.7  1.5"   # AR: افضل عائد استثمار
  "dayad 38.3  1.5"   # Dream soft drinks (bottles -> light streaks)
  "day   67.5  1.5"   # EN: Your brand on the road
)
NAME=lumera-screen-loop-short
else
NAME=lumera-screen-loop
SHOTS=(
  "day   63.7  1.8"   # AR: افضل عائد استثمار
  "night 11.167 0.60" # fried chicken      (night frames 335-352)
  "comp  3.9   0.45"  # Quartz butterfly
  "night 5.333 0.70"  # perfume            (frames 160-180)
  "comp  7.2   0.45"  # Quartz ring
  "night 7.200 0.70"  # Dream soft drinks  (frames 216-236)
  "night 11.767 0.63" # tea                (frames 353-371)
  "comp  10.0  0.45"  # Quartz bracelet
  "day   67.5  1.8"   # EN: Your brand on the road
)
fi

inputs=(); filt=""; i=0; n=0
for s in "${SHOTS[@]}"; do
  read -r kind ss d <<<"$s"
  case $kind in
    day)
      # Lock the camera: every frame aligned to the first, on the screen/wall band only.
      band=${DAY_LATE%%,perspective*}
      ffmpeg -y -v error -ss "$ss" -t "$d" -i "$DAY" \
        -vf "$band,vidstabdetect=tripod=1:shakiness=4:accuracy=15:result=$TMP/$i.trf" -f null -
      ffmpeg -y -v error -ss "$ss" -t "$d" -i "$DAY" \
        -vf "$band,vidstabtransform=tripod=1:input=$TMP/$i.trf:optzoom=0:crop=keep:interpol=bicubic" \
        -c:v libx264 -preset fast -crf 8 -pix_fmt yuv420p "$TMP/$i.mp4"
      inputs+=(-i "$TMP/$i.mp4")
      filt+="[$n:v]${DAY_LATE#*,},$V,trim=duration=$d,setpts=PTS-STARTPTS[v$i];"; n=$((n+1)) ;;
    dayad)
      inputs+=(-ss "$ss" -t "$d" -i "$DAY")
      filt+="[$n:v]$DAY_EARLY,$V,trim=duration=$d,setpts=PTS-STARTPTS[v$i];"; n=$((n+1)) ;;
    night)
      inputs+=(-ss "$ss" -t "$d" -i "$NIGHT")
      filt+="[$n:v]$NIGHT_W,$V,trim=duration=$d,setpts=PTS-STARTPTS[v$i];"; n=$((n+1)) ;;
    comp)
      # Plate: night wall around the screen (a still stretch of the night clip),
      # screen area replaced by the creative, with a soft LED glow spilling out.
      inputs+=(-ss 3.0 -t "$d" -i "$NIGHT" -ss "$ss" -t "$d" -i "$QUARTZ")
      filt+="[$n:v]$NIGHT_W,$V,trim=duration=$d,setpts=PTS-STARTPTS,format=gbrp[p$i];"
      filt+="[$((n+1)):v]fps=30,scale=$SW:-2:flags=lanczos,crop=$SW:$SH,eq=brightness=0.03:saturation=1.05,trim=duration=$d,setpts=PTS-STARTPTS,split[c$i][g$i];"
      filt+="[g$i]pad=1920:1080:$SX:$SY:black,scale=240:135,gblur=sigma=5,scale=1920:1080:flags=bicubic,format=gbrp[gl$i];"
      filt+="[p$i][gl$i]blend=all_mode=screen:all_opacity=0.35:shortest=1[pg$i];"
      filt+="[pg$i]format=yuv420p[pgy$i];[pgy$i][c$i]overlay=$SX:$SY:shortest=1,format=yuv420p[v$i];"
      n=$((n+2)) ;;
  esac
  i=$((i+1))
done
for ((k=0;k<i;k++)); do filt+="[v$k]"; done
filt+="concat=n=$i:v=1:a=0[out]"

ffmpeg -y -v error "${inputs[@]}" -filter_complex "$filt" -map "[out]" -an \
  -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart \
  "$OUT/$NAME-1080p.mp4"
ffmpeg -y -v error -i "$OUT/$NAME-1080p.mp4" -vf scale=1280:720:flags=lanczos -an \
  -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart \
  "$OUT/$NAME-720p.mp4"
