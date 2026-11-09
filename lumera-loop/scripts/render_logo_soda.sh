#!/usr/bin/env bash
# 5s loop: animated white Lumera logo (fast) -> green Dream soft-drink ad (fast).
# Usage: ./render_logo_soda.sh <logo_clip.mp4> <out_dir>
#   logo_clip.mp4 = Drive file 13rjXqD7Mca3J2SUvPd0LSbOLget2HW7S (vertical, 86s, handheld)
# Both parts come from that clip; each is tracked separately (camera pose differs between
# them) and mapped to the same straight-screen 1920x1080 framing.
set -euo pipefail
SRC=${1:?logo clip}; OUT=${2:-.}; mkdir -p "$OUT"
HERE=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
# part A: logo animation 5.0s..12.25s (ref pose: t=10.6)
python3 "$HERE/track_screen.py" "$SRC" "$TMP/a.mp4" 5.0 7.25 0.10 0.15 10.6 358,797 1475,714 345,1328 1460,1292
# part B: green Dream ad 28.55s..36.75s (ref pose: t=33.5)
python3 "$HERE/track_screen.py" "$SRC" "$TMP/b.mp4" 28.55 8.2 0.10 0.15 33.5 462,797 1582,716 444,1327 1565,1291
# A at 3.0x (2.417s) + B at 3.174x (2.583s) = 5.0s
ffmpeg -y -v error -i "$TMP/a.mp4" -i "$TMP/b.mp4" -filter_complex \
  "[0:v]setpts=PTS/3.0,fps=30[a];[1:v]setpts=PTS/3.174,fps=30[b];[a][b]concat=n=2:v=1:a=0[o]" -map "[o]" -an -t 5 \
  -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/lumera-logo-soda-5s-1080p.mp4"
ffmpeg -y -v error -i "$OUT/lumera-logo-soda-5s-1080p.mp4" -vf scale=1280:720:flags=lanczos -an \
  -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart "$OUT/lumera-logo-soda-5s-720p.mp4"
