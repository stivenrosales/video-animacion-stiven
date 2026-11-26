#!/bin/sh
# Voice + proxies for the Koan kit (run from the video folder, after public/edited-raw.mp4 exists).
# master audio → -3 dB copy → DeepFilterNet → voice.py --raw (-14 LUFS) → public/edited.mp4, public/proxy.mp4, b-roll proxy.
set -e
ffmpeg -v error -y -i public/edited-raw.mp4 -vn -ar 48000 -ac 1 work/voice-in.wav
ffmpeg -v error -y -i work/voice-in.wav -af volume=-3dB work/voice-in3.wav
mkdir -p work/dfn
nice -n 10 ~/.local/dfn/deep-filter-0.5.6-aarch64-apple-darwin -a 20 -o work/dfn work/voice-in3.wav
python3 scripts/voice.py work/dfn/voice-in3.wav work/voice-dfn.wav --raw
ffmpeg -v error -y -i public/edited-raw.mp4 -i work/voice-dfn.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest public/edited.mp4
nice -n 10 ffmpeg -v error -y -i public/edited.mp4 -vf scale=720:1280 -c:v libx264 -crf 20 -preset fast -g 15 -c:a copy public/proxy.mp4
# b-roll: his own Clawd figurine (videos/_inbox/2026-11-25-jhey/vid-10.mp4, SDR 1080x1920), muted; all-keyframe-ish for seeking
nice -n 10 ffmpeg -v error -y -i ../_inbox/2026-11-25-jhey/vid-10.mp4 -an -c:v libx264 -crf 14 -preset fast -g 15 -pix_fmt yuv420p public/clawd.mp4
nice -n 10 ffmpeg -v error -y -i public/clawd.mp4 -vf scale=720:1280 -c:v libx264 -crf 20 -preset fast -g 15 public/clawd-proxy.mp4
