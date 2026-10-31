#!/usr/bin/env bash
# Overlay the Quartz logo in the bottom-right corner with soft fades.
# The corner logo fades out before the video's own end card (logo at ~13.5s).
#   ./scripts/render.sh            -> native 854x480 master
#   ./scripts/render.sh 1080       -> 1920x1080 version (logo rendered natively at 1080p)
set -euo pipefail
RES=${1:-native}
IN=assets/source-video.mp4
FADE_IN_START=0.4;  FADE_IN_DUR=0.8
FADE_OUT_START=12.7; FADE_OUT_DUR=0.6

if [[ "$RES" == "1080" ]]; then
  K=2.25; LOGO_W=675; OUT=output/quartz-video-logo-1080p.mp4
  PRE="[0:v]scale=1920:1080:flags=lanczos,setsar=1[base]"
else
  K=1; LOGO_W=300; OUT=output/quartz-video-logo.mp4
  PRE="[0:v]null[base]"
fi
BUG=$(mktemp --suffix=.png)
python3 -I scripts/make_logo_bug.py assets/quartz-logo.png "$BUG" "$LOGO_W" >/dev/null
PAD=$(python3 -c "print(round(24*$LOGO_W/200))")
MX=$(python3 -c "print(round(30*$K))"); MY=$(python3 -c "print(round(26*$K))")
LOGO_H=$(python3 -c "from PIL import Image; print(Image.open('$BUG').height - 2*$PAD)")

ffmpeg -hide_banner -loglevel error -y -i "$IN" -loop 1 -framerate 24 -i "$BUG" \
  -filter_complex "$PRE;[1:v]format=rgba,\
fade=t=in:st=${FADE_IN_START}:d=${FADE_IN_DUR}:alpha=1,\
fade=t=out:st=${FADE_OUT_START}:d=${FADE_OUT_DUR}:alpha=1[logo];\
[base][logo]overlay=x=W-${MX}-${LOGO_W}-${PAD}:y=H-${MY}-${LOGO_H}-${PAD}:shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 0:a -c:v libx264 -preset slow -crf 16 -profile:v high \
  -c:a copy -movflags +faststart "$OUT"
rm -f "$BUG"
echo "$OUT"
