"""Ask audio-capable models to transcribe a short range verbatim (stutters, fillers and repeats included).

Usage (from the video folder): python3 scripts/listen.py AUDIO A-B [A-B ...]
"""
import base64
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
key = next(l.split("=", 1)[1].strip().strip("\"'") for l in (REPO / ".env").read_text().splitlines() if l.startswith("OPENROUTER_API_KEY="))
MODELS = ["google/gemini-2.5-pro", "google/gemini-2.5-flash", "openai/gpt-4o-audio-preview"]
PROMPT = ("Transcribe this short Spanish (Peru) audio clip EXACTLY as spoken, word by word. Keep every repetition, false start, "
          "filler (eh, este) and cut-off word; do not clean up or complete anything. Answer with the transcription only.")
for span in sys.argv[2:]:
    a, b = map(float, span.split("-"))
    wav = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", sys.argv[1], "-ac", "1", "-ar", "16000", "-f", "wav", "-"],
                         capture_output=True).stdout
    for model in MODELS:
        body = {"model": model, "messages": [{"role": "user", "content": [
            {"type": "text", "text": PROMPT}, {"type": "input_audio", "input_audio": {"data": base64.b64encode(wav).decode(), "format": "wav"}}]}]}
        req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", data=json.dumps(body).encode(),
                                     headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                print(span, model, "→", json.load(r)["choices"][0]["message"]["content"].strip())
        except Exception as exc:  # a model that is unavailable must not hide the others
            print(span, model, "error", type(exc).__name__)
