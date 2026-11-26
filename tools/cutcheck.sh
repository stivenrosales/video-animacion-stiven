#!/bin/sh
# Render a video's fine cut and re-transcribe it island by island.
# Usage: tools/cutcheck.sh <video-dir> [--master]
# Default is a light 720p preview (out/cut-preview.mp4) for approving the cuts;
# --master renders public/edited-raw.mp4 at 1440x2560 crf 12 (slow, do it after approval).
set -e
cd "$1/work"
if [ "$2" = "--master" ]; then
  nice -n 15 python3 ../scripts/cut.py src.mp4 ../public/edited-raw.mp4 /dev/null | head -1
  OUT=../public/edited-raw.mp4
else
  sed 's/scale=1440:2560/scale=720:1280/; s/"-crf", "12"/"-crf", "24"/; s/"-preset", "fast"/"-preset", "veryfast"/' ../scripts/cut.py > cut-preview.py
  nice -n 15 python3 cut-preview.py src.mp4 ../out/cut-preview.mp4 /dev/null | head -1
  OUT=../out/cut-preview.mp4
fi
ffmpeg -v error -y -i "$OUT" -ac 1 -ar 16000 edit16.wav
python3 -u ../../../tools/islands.py edit16.wav 0.15 > islands-edit.txt
