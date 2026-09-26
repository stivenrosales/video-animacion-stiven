#!/usr/bin/env bash
# Full-quality render of one video into its out/raw.mp4.
# Usage: tools/render.sh <slug fragment> <CompositionId>   e.g. tools/render.sh opus OpusReel
set -euo pipefail
cd "$(dirname "$0")/.."
dir=$(ls -d videos/*"$1"* | tail -1)
mkdir -p "$dir/out"
exec npx remotion render "$dir/src/index.ts" "$2" "$dir/out/raw.mp4" --public-dir="$dir/public" \
  --image-format=png --crf=14 --x264-preset=slow --color-space=bt709 --concurrency=8
