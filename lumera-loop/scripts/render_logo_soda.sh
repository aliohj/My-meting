#!/usr/bin/env bash
# 6s seamless loop: animated white Lumera logo (fast) -> green Dream soft-drink ad (fast)
#                   -> 1s logo tail (logo fades back to white).
# The LAST frame is made identical to the FIRST frame, so the loop point has no jump.
# Usage: ./render_logo_soda.sh <logo_clip.mp4> <out_dir>
#   logo_clip.mp4 = Drive file 13rjXqD7Mca3J2SUvPd0LSbOLget2HW7S (vertical, 86s, handheld)
# Each part is tracked separately (camera pose differs) and mapped to the same
# straight-screen 1920x1080 framing.
set -euo pipefail
SRC=${1:?logo clip}; OUT=${2:-.}; mkdir -p "$OUT"
HERE=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
# part A: logo animation 5.0s..12.25s (ref pose: t=10.6); also provides the tail
python3 "$HERE/track_screen.py" "$SRC" "$TMP/a.mp4" 5.0 7.25 0.10 0.15 10.6 358,797 1475,714 345,1328 1460,1292
# part B: green Dream ad 28.55s..36.75s (ref pose: t=33.5)
python3 "$HERE/track_screen.py" "$SRC" "$TMP/b.mp4" 28.55 8.2 0.10 0.15 33.5 462,797 1582,716 444,1327 1565,1291
# A 3.0x (2.417s) + B 3.174x (2.583s) + C = A's last 3.25s at 3.25x (1.0s)  = 6.0s
ffmpeg -y -v error -i "$TMP/a.mp4" -i "$TMP/b.mp4" -i "$TMP/a.mp4" -filter_complex \
  "[0:v]setpts=PTS/3.0,fps=30[a];[1:v]setpts=PTS/3.174,fps=30[b];[2:v]trim=start=4.0,setpts=(PTS-STARTPTS)/3.25,fps=30[c];[a][b][c]concat=n=3:v=1:a=0[o]" \
  -map "[o]" -an -t 6 -c:v libx264 -preset fast -crf 10 -pix_fmt yuv420p "$TMP/main.mp4"
# last frame := first frame: cross-fade the tail (already ~white) into a still of frame 0
ffmpeg -y -v error -i "$TMP/main.mp4" -vf "select=eq(n\,0)" -frames:v 1 "$TMP/f0.png"
ffmpeg -y -v error -i "$TMP/main.mp4" -loop 1 -framerate 30 -t 0.5 -i "$TMP/f0.png" -filter_complex \
  "[0:v]fps=30,settb=1/30,format=yuv420p,setsar=1[m];[1:v]fps=30,settb=1/30,format=yuv420p,setsar=1[s];[m][s]xfade=transition=fade:duration=0.2:offset=5.7[x];[x]trim=end_frame=180,setpts=PTS-STARTPTS[o]" \
  -map "[o]" -an -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/lumera-logo-soda-loop-1080p.mp4"
ffmpeg -y -v error -i "$OUT/lumera-logo-soda-loop-1080p.mp4" -vf scale=1280:720:flags=lanczos -an \
  -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart "$OUT/lumera-logo-soda-loop-720p.mp4"
