"""Ask an audio-capable model to describe a sound file (a check when nobody can listen). Usage: python3 scripts/describe.py FILE [A B]"""
import base64, json, subprocess, sys, urllib.request
from pathlib import Path
REPO = Path(__file__).resolve().parents[3]
key = next(l.split("=", 1)[1].strip().strip("\"'") for l in (REPO / ".env").read_text().splitlines() if l.startswith("OPENROUTER_API_KEY="))
src = sys.argv[1]
rng = ["-ss", sys.argv[2], "-to", sys.argv[3]] if len(sys.argv) > 3 else []
mp3 = "work/tx/describe.mp3"
subprocess.run(["ffmpeg", "-v", "error", "-y", *rng, "-i", src, "-ac", "1", "-ar", "32000", "-b:a", "64k", mp3], check=True)
body = {"model": "google/gemini-2.5-pro", "messages": [{"role": "user", "content": [
    {"type": "text", "text": "Describe this audio precisely in 3 short lines: (1) what it sounds like (instruments or physical source), "
     "(2) defects: noise, hiss, clipping, vocals, abrupt changes, silence at the start, (3) mood and tempo if it is music."},
    {"type": "input_audio", "input_audio": {"data": base64.b64encode(open(mp3, "rb").read()).decode(), "format": "mp3"}}]}]}
req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", json.dumps(body).encode(), {"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
print(src, "→", json.load(urllib.request.urlopen(req, timeout=180))["choices"][0]["message"]["content"].strip())
