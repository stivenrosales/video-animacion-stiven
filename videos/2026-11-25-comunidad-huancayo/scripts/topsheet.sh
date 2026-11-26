#!/bin/sh
# Head-clearance sheet: the top band (y 220-700 of 1920) of a preview at the given seconds. scripts/topsheet.sh IN.mp4 OUT.jpg t1 t2 ...
in=$1; out=$2; shift 2; d=$(mktemp -d); i=0
for t in "$@"; do i=$((i+1)); f=$(printf "%s/%03d.jpg" "$d" $i); ffmpeg -v error -y -ss "$t" -i "$in" -frames:v 1 -vf "crop=iw*0.6:ih*0.25:iw*0.2:ih*0.115,scale=324:240" "$f"; done
ffmpeg -v error -y -pattern_type glob -i "$d/*.jpg" -vf "tile=8x$(( (i+7)/8 ))" -frames:v 1 "$out"; rm -r "$d"
