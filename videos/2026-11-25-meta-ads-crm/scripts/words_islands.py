"""Word timestamps island by island → work/words-islands.json ({island start: [[t, e, word], ...]}).

Each speech island of the edit (work/islands-edit-fine.txt) is transcribed alone, so its word times cannot
drift into a neighbouring pause. Usage (from the video folder): python3 scripts/words_islands.py
"""
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
key = next(l.split("=", 1)[1].strip().strip("\"'") for l in (REPO / ".env").read_text().splitlines() if l.startswith("OPENROUTER_API_KEY="))
src = Path("work/islands-edit-fine.txt").read_text()
islands = [(float(a), float(b)) for a, b in re.findall(r"^\s*([\d.]+)-\s*([\d.]+)", src, re.M)]


def one(span):
    a, b = span
    mp3 = f"work/isl-{a}.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(a - 0.05, 0):.2f}", "-to", f"{b + 0.05:.2f}", "-i", "work/editm16.wav",
                    "-af", "apad=pad_dur=0.8", mp3], check=True)
    out = subprocess.run(["curl", "-sS", "-m", "120", "https://openrouter.ai/api/v1/audio/transcriptions",
                          "-H", f"Authorization: Bearer {key}", "-F", f"file=@{mp3}", "-F", "model=openai/whisper-large-v3-turbo",
                          "-F", "language=es", "-F", "response_format=verbose_json", "-F", "timestamp_granularities[]=word"],
                         capture_output=True, text=True).stdout
    Path(mp3).unlink()
    off = max(a - 0.05, 0)
    return str(a), [[round(w["start"] + off, 2), round(w["end"] + off, 2), w["word"].strip()] for w in json.loads(out).get("words", [])]


with ThreadPoolExecutor(6) as ex:
    res = dict(ex.map(one, islands))
json.dump(res, open("work/words-islands.json", "w"), ensure_ascii=False, indent=0)
for a, ws in res.items():
    print(a, " ".join(f"{t}:{w}" for t, _, w in ws))
