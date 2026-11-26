"""Word timestamps of the EDITED audio (work/edit.mp3) → work/words-edit.json, via OpenRouter Whisper turbo.

Usage (from the video folder): python3 scripts/words_edit.py [IN.mp3 OUT.json]
"""
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
src, dst = (sys.argv[1], sys.argv[2]) if len(sys.argv) > 2 else ("work/edit.mp3", "work/words-edit.json")
key = next(l.split("=", 1)[1].strip().strip("\"'") for l in (REPO / ".env").read_text().splitlines() if l.startswith("OPENROUTER_API_KEY="))
subprocess.run(["curl", "-sS", "-m", "120", "https://openrouter.ai/api/v1/audio/transcriptions",
                "-H", f"Authorization: Bearer {key}", "-F", f"file=@{src}", "-F", "model=openai/whisper-large-v3-turbo",
                "-F", "language=es", "-F", "response_format=verbose_json", "-F", "timestamp_granularities[]=word",
                "-o", dst], check=True)
