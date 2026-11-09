#!/usr/bin/env bash
# Lumera screen loop: 16:9, ~7.6s, seamless loop, no audio.
# Usage: ./render.sh <path/to/c1.mp4> <out_dir>
#   c1.mp4 = dji_mimo_20261025_155556_0585_1793000936144_video.mp4 (Google Drive)
set -euo pipefail
SRC=${1:?source clip}; OUT=${2:-.}
mkdir -p "$OUT"
# Camera framing differs slightly before/after ~54s, so two crop boxes.
EARLY="crop=1600:900:110:455"
LATE="crop=1600:900:50:510"
V="scale=1920:1080:flags=lanczos,fps=30,setsar=1,format=yuv420p"
# start  dur  crop    shot
SHOTS=(
  "63.0 2.0 $LATE"   # AR: افضل عائد استثمار
  "16.8 0.9 $EARLY"  # Green Innova
  "22.3 0.9 $EARLY"  # Alya
  "38.3 0.9 $EARLY"  # drinks
  "50.3 0.9 $EARLY"  # Areeg AlSanabis
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
