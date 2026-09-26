#!/usr/bin/env bash
# Open Remotion Studio for one video. Usage: tools/studio.sh <slug fragment>   e.g. tools/studio.sh opus
set -euo pipefail
cd "$(dirname "$0")/.."
dir=$(ls -d videos/*"$1"* | tail -1)
exec npx remotion studio "$dir/src/index.ts" --public-dir="$dir/public"
