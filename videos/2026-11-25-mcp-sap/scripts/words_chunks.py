"""Word timestamps of the edited audio in chunks split at pauses → work/words-chunk-<offset>.json.

Whisper drifts on long takes; short chunks that start at a speech island keep the word times honest.
Usage (from the video folder): python3 scripts/words_chunks.py
"""
import subprocess

BOUNDS = [0.0, 10.40, 22.07, 33.88, 44.32, 56.55, 62.73]  # pauses of work/islands-edit.txt
for a, b in zip(BOUNDS, BOUNDS[1:]):
    mp3 = f"work/chunk-{a}.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-to", str(b), "-i", "work/edit.mp3", "-af", "apad=pad_dur=0.6", mp3], check=True)
    subprocess.run(["python3", "scripts/words_edit.py", mp3, f"work/words-chunk-{a}.json"], check=True)
