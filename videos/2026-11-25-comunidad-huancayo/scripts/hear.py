"""Second opinion on a doubtful word: ask an audio-capable model for a verbatim transcript of a short range.

Usage (from the video folder): python3 scripts/hear.py AUDIO A B [MODEL]
"""
import base64
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
src, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
model = sys.argv[4] if len(sys.argv) > 4 else "google/gemini-2.5-pro"
key = next(l.split("=", 1)[1].strip().strip("\"'") for l in (REPO / ".env").read_text().splitlines() if l.startswith("OPENROUTER_API_KEY="))
mp3 = f"work/tx/hear-{a:.2f}-{b:.2f}.mp3"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src, "-ac", "1", "-ar", "16000", mp3], check=True)
body = {"model": model, "messages": [{"role": "user", "content": [
    {"type": "text", "text": "Transcribe este audio en español peruano palabra por palabra, exactamente como se dice, "
     "incluyendo titubeos, repeticiones y palabras cortadas. No corrijas ni resumas. Devuelve solo la transcripción."},
    {"type": "input_audio", "input_audio": {"data": base64.b64encode(open(mp3, "rb").read()).decode(), "format": "mp3"}}]}]}
req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", json.dumps(body).encode(),
                             {"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
try:
    out = json.load(urllib.request.urlopen(req, timeout=120))
    print(f"[{a:.2f}-{b:.2f}] {out['choices'][0]['message']['content'].strip()}")
except Exception as e:  # noqa: BLE001
    print("error", str(e)[:200])
