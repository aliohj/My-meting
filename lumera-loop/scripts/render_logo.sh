#!/usr/bin/env bash
# Lumera logo-animation loop (white background, wave + LUMERA reveal), 16:9, 7.5s.
# Usage: ./render_logo.sh <logo_clip.mp4> <out_dir>
#   logo_clip.mp4 = Drive file 13rjXqD7Mca3J2SUvPd0LSbOLget2HW7S (vertical, 86s)
# The ad plays 4.75s -> 12.25s in that clip: it starts and ends on a plain white
# screen, so it loops cleanly. This clip was NOT shot on a tripod (the camera pans
# ~150px in the first 2s, then drifts), so track_screen.py follows the screen and
# holds it still; same straight-screen framing (screen + bezel + a little wall) as render.sh.
# Corners = screen corners in the source frame at t=10.6s (the reference pose).
set -euo pipefail
SRC=${1:?logo clip}; OUT=${2:-.}; mkdir -p "$OUT"
HERE=$(cd "$(dirname "$0")" && pwd)
python3 "$HERE/track_screen.py" "$SRC" "$OUT/lumera-logo-loop-1080p.mp4" 4.75 7.5 0.10 0.15 10.6 \
  358,797 1475,714 345,1328 1460,1292
ffmpeg -y -v error -i "$OUT/lumera-logo-loop-1080p.mp4" -vf scale=1280:720:flags=lanczos -an \
  -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart "$OUT/lumera-logo-loop-720p.mp4"

# 5s version: drop the empty white lead-in (first 0.25s), then play the rest 1.45x faster.
# Still starts/ends on plain white, so it still loops cleanly.
python3 "$HERE/track_screen.py" "$SRC" "$OUT/.tmp-logo.mp4" 5.0 7.25 0.10 0.15 10.6 \
  358,797 1475,714 345,1328 1460,1292
ffmpeg -y -v error -i "$OUT/.tmp-logo.mp4" -an -vf "setpts=PTS/1.45,fps=30" -t 5 \
  -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/lumera-logo-loop-5s-1080p.mp4"
ffmpeg -y -v error -i "$OUT/lumera-logo-loop-5s-1080p.mp4" -vf scale=1280:720:flags=lanczos -an \
  -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart "$OUT/lumera-logo-loop-5s-720p.mp4"
rm -f "$OUT/.tmp-logo.mp4"
