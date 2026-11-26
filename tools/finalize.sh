#!/usr/bin/env bash
# Full-quality render of one video and delivery to finals/: chunked render, mix renormalized to -14 LUFS
# with a 0.3 s fade out, then finals/<folder>.mp4.
# Usage: tools/finalize.sh <slug fragment> <CompositionId>
set -euo pipefail
cd "$(dirname "$0")/.."
dir=$(ls -d videos/*"$1"* | tail -1)
nice -n 10 tools/render-chunks.sh "$1" "$2"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dir/out/raw.mp4")
ffmpeg -v error -y -i "$dir/out/raw.mp4" -vn -ar 48000 "$dir/work/mix.wav"
python3 "$dir/scripts/voice.py" "$dir/work/mix.wav" "$dir/work/mixn.wav" --raw >/dev/null
st=$(python3 -c "print(round($dur-0.3,3))")
mkdir -p finals
ffmpeg -v error -y -i "$dir/out/raw.mp4" -i "$dir/work/mixn.wav" -map 0:v -map 1:a -c:v copy \
  -af "afade=t=out:st=$st:d=0.3" -c:a aac -b:a 256k -movflags +faststart "finals/$(basename "$dir").mp4"
ffmpeg -i "finals/$(basename "$dir").mp4" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
ls -lh "finals/$(basename "$dir").mp4" | awk '{print $5, $9}'
