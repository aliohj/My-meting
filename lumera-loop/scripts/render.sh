#!/usr/bin/env bash
# Lumera screen loop: 16:9, ~7s, seamless loop, no audio.
# Usage: ./render.sh <path/to/c1.mp4> <out_dir>
#   c1.mp4 = dji_mimo_20261025_155556_0585_1793000936144_video.mp4 (Google Drive)
set -euo pipefail
SRC=${1:?source clip}; OUT=${2:-.}
mkdir -p "$OUT"
# Framing: the LED panel's 4 inner corners (TL TR BL BR, full-frame px,
# measured by hand) are expanded by a margin through the screen's homography
# (quad.py), then warped to fill the frame. Result: the screen is straightened
# and centred, with its frame and a little wall visible around it.
# Camera framing differs slightly before/after ~54s, so separate corner sets.
MX=${MX:-0.10}; MY=${MY:-0.15}
HERE=$(cd "$(dirname "$0")" && pwd)
warp(){ # crop a band first (y 400..1500) to keep the warp cheap
  local q; q=$(python3 "$HERE/quad.py" "$MX" "$MY" "$@" | awk -F: '{for(i=2;i<=NF;i+=2)$i-=400; OFS=":"; $1=$1; print}')
  echo "crop=1728:1100:0:400,perspective=$q:interpolation=cubic"; }
EARLY=$(warp 322 664 1445 579 308 1199 1428 1159)
AREEG=$(warp 322 664 1433 579 308 1199 1416 1159)
LATE=$(warp 261 736 1375 615 260 1272 1377 1193)
V="scale=1920:1080:flags=lanczos,fps=30,setsar=1,format=yuv420p"
# start  dur  crop    shot
SHOTS=(
  "63.7 2.0 $LATE stab"  # AR: افضل عائد استثمار (camera settles ~63.6s)
  "38.3 3.0 $EARLY"  # Dream soft drinks
  "67.5 2.0 $LATE stab"  # EN: Your brand on the road
)
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
BAND="crop=1728:1100:0:400"
inputs=(); filt=""; i=0
for s in "${SHOTS[@]}"; do
  read -r ss d c stab <<<"$s"
  if [[ "${stab:-}" == stab ]]; then
    # Lock the camera: vidstab in tripod mode (every frame aligned to the first),
    # run on the screen/wall band only so passing cars don't affect it.
    ffmpeg -y -v error -ss "$ss" -t "$d" -i "$SRC" \
      -vf "$BAND,vidstabdetect=tripod=1:shakiness=4:accuracy=15:result=$TMP/$i.trf" -f null -
    ffmpeg -y -v error -ss "$ss" -t "$d" -i "$SRC" \
      -vf "$BAND,vidstabtransform=tripod=1:input=$TMP/$i.trf:optzoom=0:crop=keep:interpol=bicubic" \
      -c:v libx264 -preset fast -crf 8 -pix_fmt yuv420p "$TMP/$i.mp4"
    inputs+=(-i "$TMP/$i.mp4"); c=${c#"$BAND,"}
  else
    inputs+=(-ss "$ss" -t "$d" -i "$SRC")
  fi
  filt+="[$i:v]$c,$V,trim=duration=$d,setpts=PTS-STARTPTS[v$i];"
  i=$((i+1))
done
for ((k=0;k<i;k++)); do filt+="[v$k]"; done
filt+="concat=n=$i:v=1:a=0[out]"
ffmpeg -y -v error "${inputs[@]}" -filter_complex "$filt" -map "[out]" -an \
  -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart \
  "$OUT/lumera-screen-loop-1080p.mp4"
ffmpeg -y -v error -i "$OUT/lumera-screen-loop-1080p.mp4" -vf scale=1280:720:flags=lanczos -an \
  -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart \
  "$OUT/lumera-screen-loop-720p.mp4"
