"""Word timestamps of the edited audio, chunk by chunk → work/words-chunks.json and work/fine-islands.json.

Whisper drifts on long takes, so the edit (work/edit16.wav) is split at its own pauses into chunks of 8 s or less
(always at the widest pause near the middle) and each chunk is transcribed alone (OpenRouter Whisper turbo).
Usage (from the video folder): python3 scripts/words_chunks.py
"""
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
SRC = "work/edit16.wav"
key = next(l.split("=", 1)[1].strip().strip("\"'") for l in (REPO / ".env").read_text().splitlines() if l.startswith("OPENROUTER_API_KEY="))
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", SRC], capture_output=True, text=True).stdout)
log = subprocess.run(["ffmpeg", "-v", "info", "-i", SRC, "-af", "silencedetect=noise=-34dB:d=0.07", "-f", "null", "-"], capture_output=True, text=True).stderr
sil = list(zip(map(float, re.findall(r"silence_start: ([0-9.]+)", log)), map(float, re.findall(r"silence_end: ([0-9.]+)", log))))
islands, cur = [], 0.0
for s, e in sil:
    if s - cur > 0.05:
        islands.append([round(cur, 3), round(s, 3)])
    cur = e
if dur - cur > 0.05:
    islands.append([round(cur, 3), round(dur, 3)])
json.dump(islands, open("work/fine-islands.json", "w"))


def split(a, b):
    if b - a <= 8:
        return [a]
    inner = [(e - s, (s + e) / 2) for s, e in sil if a + (b - a) * 0.2 < s and e < b - (b - a) * 0.2]
    if not inner:
        return [a]
    m = max(inner)[1]
    return split(a, m) + split(m, b)


bounds = split(0.0, dur) + [dur]


def one(span):
    a, b = span
    mp3 = f"work/tx/chunk-{a:.2f}.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", SRC, "-af", "apad=pad_dur=0.6", mp3], check=True)
    for _ in range(3):
        out = subprocess.run(["curl", "-sS", "-m", "120", "https://openrouter.ai/api/v1/audio/transcriptions",
                              "-H", f"Authorization: Bearer {key}", "-F", f"file=@{mp3}", "-F", "model=openai/whisper-large-v3-turbo",
                              "-F", "language=es", "-F", "response_format=verbose_json", "-F", "timestamp_granularities[]=word"],
                             capture_output=True, text=True).stdout
        try:
            return [[round(w["start"] + a, 2), round(w["end"] + a, 2), w["word"].strip()] for w in json.loads(out)["words"]]
        except (ValueError, KeyError):
            continue
    raise SystemExit(f"chunk {a}: {out[:200]}")


with ThreadPoolExecutor(6) as ex:
    chunks = list(ex.map(one, zip(bounds, bounds[1:])))
json.dump({"bounds": bounds, "chunks": chunks}, open("work/words-chunks.json", "w"), ensure_ascii=False)
for a, ws in zip(bounds, chunks):
    print(f"--- {a:.2f} ({len(ws)})")
    print(" ".join(f"{t}:{w}" for t, _, w in ws))
