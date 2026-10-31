#!/usr/bin/env bash
# Overlay the Quartz logo in the bottom-right corner with soft fades.
# The corner logo fades out before the video's own end card (logo at ~13.5s).
set -euo pipefail
IN=${1:-assets/source-video.mp4}
BUG=${2:-assets/quartz-logo-bug.png}
OUT=${3:-output/quartz-video-logo.mp4}
FADE_IN_START=0.4;  FADE_IN_DUR=0.8
FADE_OUT_START=12.7; FADE_OUT_DUR=0.6

ffmpeg -hide_banner -y -i "$IN" -loop 1 -framerate 24 -i "$BUG" \
  -filter_complex "[1:v]format=rgba,\
fade=t=in:st=${FADE_IN_START}:d=${FADE_IN_DUR}:alpha=1,\
fade=t=out:st=${FADE_OUT_START}:d=${FADE_OUT_DUR}:alpha=1[logo];\
[0:v][logo]overlay=x=W-w-6:y=H-h-2:shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 0:a -c:v libx264 -preset slow -crf 16 -profile:v high \
  -c:a copy -movflags +faststart "$OUT"
