#!/usr/bin/env bash
# 5s seamless loop of the green Dream soft-drink ad ONLY, at natural speed (1x).
# 5s is reached by cutting scenes (hard cuts between different scenes of the ad), not by
# speeding it up. The last frame is made identical to the first frame.
# Usage: ./render_soda.sh <logo_clip.mp4> <out_dir>
#   logo_clip.mp4 = Drive file 13rjXqD7Mca3J2SUvPd0LSbOLget2HW7S (vertical, 86s, handheld;
#   the green ad plays 28.5s..36.8s in it)
set -euo pipefail
SRC=${1:?clip}; OUT=${2:-.}; mkdir -p "$OUT"
HERE=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
# track + straighten the screen (ref pose t=33.5); b.mp4 time 0 = source 28.55s
CLEAN=1 python3 "$HERE/track_screen.py" "$SRC" "$TMP/b.mp4" 28.55 8.2 0.10 0.15 33.5 462,797 1582,716 444,1327 1565,1291
# scene list (b.mp4 time, duration):
#   apple glow -> flying apples | ribbon splash | bottle tilt | burst reveals bottle
#   | label close-up | splash with apple | hero shot            = 5.0s
SEG=("0.04 1.06" "1.6 0.5" "2.15 0.65" "3.05 0.5" "4.15 0.55" "5.95 0.6" "7.0 1.1")
F=""; C=""; i=0
for s in "${SEG[@]}"; do read -r a d <<<"$s"
  F+="[0:v]trim=start=$a:duration=$d,setpts=PTS-STARTPTS,fps=30[s$i];"; C+="[s$i]"; i=$((i+1)); done
ffmpeg -y -v error -i "$TMP/b.mp4" -filter_complex "${F}${C}concat=n=$i:v=1:a=0[o]" -map "[o]" -an \
  -c:v libx264 -preset fast -crf 10 -pix_fmt yuv420p "$TMP/main.mp4"
# last frame := first frame: cross-fade the end into a still of frame 0
ffmpeg -y -v error -i "$TMP/main.mp4" -vf "select=eq(n\,0)" -frames:v 1 "$TMP/f0.png"
ffmpeg -y -v error -i "$TMP/main.mp4" -loop 1 -framerate 30 -t 0.5 -i "$TMP/f0.png" -filter_complex \
  "[0:v]fps=30,settb=1/30,format=yuv420p,setsar=1[m];[1:v]fps=30,settb=1/30,format=yuv420p,setsar=1[s];[m][s]xfade=transition=fade:duration=0.2:offset=4.7[x];[x]trim=end_frame=150,setpts=PTS-STARTPTS[o]" \
  -map "[o]" -an -c:v libx264 -preset slow -crf 14 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/lumera-soda-loop-5s-1080p.mp4"
ffmpeg -y -v error -i "$OUT/lumera-soda-loop-5s-1080p.mp4" -vf scale=1280:720:flags=lanczos -an \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart "$OUT/lumera-soda-loop-5s-720p.mp4"
