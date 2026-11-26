"""Transcribe short ranges of an audio file with word times (OpenRouter Whisper turbo), to check a doubtful spot.

Usage (from the video folder): python3 scripts/probe.py AUDIO A-B [A-B ...]
"""
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
key = next(l.split("=", 1)[1].strip().strip("\"'") for l in (REPO / ".env").read_text().splitlines() if l.startswith("OPENROUTER_API_KEY="))
for span in sys.argv[2:]:
    a, b = map(float, span.split("-"))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-to", str(b), "-i", sys.argv[1], "-ac", "1", "-ar", "16000",
                    "-af", "apad=pad_dur=0.8", "work/probe.mp3"], check=True)
    out = subprocess.run(["curl", "-sS", "-m", "120", "https://openrouter.ai/api/v1/audio/transcriptions", "-H", f"Authorization: Bearer {key}",
                          "-F", "file=@work/probe.mp3", "-F", "model=openai/whisper-large-v3-turbo", "-F", "language=es",
                          "-F", "response_format=verbose_json", "-F", "timestamp_granularities[]=word"], capture_output=True, text=True).stdout
    try:
        print(span, " ".join(f"{w['start'] + a:.2f}:{w['word'].strip()}" for w in json.loads(out).get("words", [])))
    except ValueError:
        print(span, "api error")
