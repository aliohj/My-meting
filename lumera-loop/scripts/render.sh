#!/usr/bin/env bash
# Lumera screen loop: 16:9, ~7.6s, seamless loop, no audio.
# Usage: ./render.sh <path/to/c1.mp4> <out_dir>
#   c1.mp4 = dji_mimo_20261025_155556_0585_1793000936144_video.mp4 (Google Drive)
set -euo pipefail
SRC=${1:?source clip}; OUT=${2:-.}
mkdir -p "$OUT"
# Screen-only framing: the LED panel's 4 inner corners (measured by hand, inset
# a few px past the bezel) are warped to fill the frame, so no wall/street shows.
# Camera framing differs slightly before/after ~54s, so two corner sets.
# perspective order: TL:TR:BL:BR, relative to crop=1300:800:200:500.
EARLY="crop=1300:800:200:500,perspective=134:176:1231:91:120:687:1212:647:interpolation=cubic"
AREEG="crop=1300:800:200:500,perspective=134:176:1219:91:120:687:1200:647:interpolation=cubic"
LATE="crop=1300:800:200:500,perspective=73:250:1163:129:72:760:1165:681:interpolation=cubic"
V="scale=1920:1080:flags=lanczos,fps=30,setsar=1,format=yuv420p"
# start  dur  crop    shot
SHOTS=(
  "63.0 2.0 $LATE"   # AR: افضل عائد استثمار
  "16.8 0.9 $EARLY"  # Green Innova
  "22.3 0.9 $EARLY"  # Alya
  "38.3 0.9 $EARLY"  # drinks
  "50.3 0.9 $AREEG"  # Areeg AlSanabis
  "67.5 2.0 $LATE"   # EN: Your brand on the road
)
inputs=(); filt=""; i=0
for s in "${SHOTS[@]}"; do
  read -r ss d c <<<"$s"
  inputs+=(-ss "$ss" -t "$d" -i "$SRC")
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
