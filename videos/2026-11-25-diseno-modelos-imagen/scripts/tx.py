"""Transcribe a short range of an audio file with word times (OpenRouter Whisper turbo), to verify a cut edge.

Usage (from the video folder): python3 scripts/tx.py AUDIO A B [MODEL]
"""
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
src, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
model = sys.argv[4] if len(sys.argv) > 4 else "openai/whisper-large-v3-turbo"
key = next(l.split("=", 1)[1].strip().strip("\"'") for l in (REPO / ".env").read_text().splitlines() if l.startswith("OPENROUTER_API_KEY="))
mp3 = f"work/tx/{a:.2f}-{b:.2f}.mp3"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src, "-ac", "1", "-ar", "16000",
                "-af", "apad=pad_dur=0.8", mp3], check=True)
out = subprocess.run(["curl", "-sS", "-m", "120", "https://openrouter.ai/api/v1/audio/transcriptions",
                      "-H", f"Authorization: Bearer {key}", "-F", f"file=@{mp3}", "-F", f"model={model}", "-F", "language=es",
                      "-F", "response_format=verbose_json", "-F", "timestamp_granularities[]=word"], capture_output=True, text=True).stdout
try:
    d = json.loads(out)
    ws = d.get("words") or []
    print(f"[{a:.2f}-{b:.2f}] {d.get('text', '').strip()}")
    if ws:
        print("   " + " ".join(f"{w['start'] + a:.2f}:{w['word'].strip()}" for w in ws))
except ValueError:
    print("api error", out[:200])
