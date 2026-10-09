#!/usr/bin/env bash
# Chunked full-quality render: bundle once, render independent muted video chunks, join them
# without re-encoding, then add the audio mix. Re-running only renders missing chunks, so a
# fix costs one chunk (~30 s) instead of the whole video.
#
# Usage: tools/render-chunks.sh <slug fragment> <CompositionId> [chunk seconds=10] [seconds to redo, e.g. "49-53,70"]
#   tools/render-chunks.sh mcp McpReel              # first full render → out/raw.mp4
#   tools/render-chunks.sh mcp McpReel 10 49-53     # re-render only the chunks touching 49–53 s
set -euo pipefail
cd "$(dirname "$0")/.."
dir=$(ls -d videos/*"$1"* | tail -1)
comp=$2
chunk_sec=${3:-10}
redo=${4:-}
out="$dir/out/chunks"
mkdir -p "$out"

npx remotion bundle "$dir/src/index.ts" --public-dir="$dir/public" --out-dir="$dir/out/bundle" --log=error >/dev/null
read -r fps frames < <(npx remotion compositions "$dir/out/bundle" 2>/dev/null | awk -v c="$comp" '$1 == c { print $2, $4 }')
[ -n "${frames:-}" ] || { echo "composition $comp not found" >&2; exit 1; }
cf=$((chunk_sec * fps))
n=$(((frames + cf - 1) / cf))

# Chunks to force-render: every chunk overlapping one of the requested seconds or ranges.
force=" "  # macOS ships bash 3.2 (no associative arrays): keep " 3 4 " style membership
if [ -n "$redo" ]; then
  IFS=',' read -ra parts <<<"$redo"
  for p in "${parts[@]}"; do
    a=${p%-*}; b=${p#*-}
    for ((i = $(python3 -c "print(int($a*$fps)//$cf)"); i <= $(python3 -c "print(int($b*$fps)//$cf)"); i++)); do force="$force$i "; done
  done
fi

list="$out/list.txt"
: >"$list"
for ((i = 0; i < n; i++)); do
  s=$((i * cf))
  e=$(((i + 1) * cf - 1))
  ((e >= frames)) && e=$((frames - 1))
  f=$(printf "chunk-%03d.mp4" "$i")
  if [ ! -s "$out/$f" ] || [[ "$force" == *" $i "* ]]; then
    echo "render chunk $i/$((n - 1)) frames $s-$e"
    npx remotion render "$dir/out/bundle" "$comp" "$out/$f" --frames="$s-$e" --muted \
      --image-format=png --crf=14 --x264-preset=slow --color-space=bt709 --concurrency=8 --log=error
  fi
  echo "file '$f'" >>"$list"
done

ffmpeg -v error -y -f concat -safe 0 -i "$list" -c copy "$out/video.mp4"
npx remotion render "$dir/out/bundle" "$comp" "$out/audio.wav" --codec=wav --log=error
ffmpeg -v error -y -i "$out/video.mp4" -i "$out/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k "$dir/out/raw.mp4"
got=$(ffprobe -v error -select_streams v -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$dir/out/raw.mp4")
echo "raw.mp4: $got frames (expected $frames)"
