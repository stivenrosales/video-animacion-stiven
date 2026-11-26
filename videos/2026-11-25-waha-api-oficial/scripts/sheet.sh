#!/bin/sh
# Contact sheet of a preview at the given seconds: scripts/sheet.sh IN.mp4 OUT.jpg t1 t2 ...  (8 per row, 270 px wide)
in=$1; out=$2; shift 2; d=$(mktemp -d); i=0; args=""
for t in "$@"; do i=$((i+1)); f=$(printf "%s/%03d.jpg" "$d" $i); ffmpeg -v error -y -ss "$t" -i "$in" -frames:v 1 -vf scale=270:480 "$f"; done
ffmpeg -v error -y -pattern_type glob -i "$d/*.jpg" -vf "tile=8x$(( (i+7)/8 ))" -frames:v 1 "$out"; rm -r "$d"
