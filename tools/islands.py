"""Transcribe each speech island (audio between pauses) on its own.

Whisper smooths over stumbles and repeated starts when it hears a whole take;
short islands expose them. Uses Whisper large-v3-turbo through OpenRouter when
OPENROUTER_API_KEY is set (env or the repo .env), 8 islands at a time; otherwise
the local whisper-cli model, one at a time.

Usage: python3 tools/islands.py AUDIO.wav [GAP]
"""
import json
import os
import re
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TURBO = os.path.expanduser("~/Library/Application Support/whisper-models/ggml-large-v3-turbo.bin")
SMALL = os.path.expanduser("~/Library/Application Support/Screen Studio/models/ggml-small.bin")
LOCAL_MODEL = TURBO if os.path.exists(TURBO) else SMALL
API = "https://openrouter.ai/api/v1/audio/transcriptions"
API_MODEL = "openai/whisper-large-v3-turbo"


def api_key():
    key = os.environ.get("OPENROUTER_API_KEY")
    env = os.path.join(REPO, ".env")
    if not key and os.path.exists(env):
        for line in open(env):
            if line.startswith("OPENROUTER_API_KEY="):
                key = line.split("=", 1)[1].strip().strip("\"'")
    return key


def find_islands(src, gap):
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
    log = subprocess.run(["ffmpeg", "-v", "info", "-i", src, "-af",
                          f"silencedetect=noise=-34dB:d={gap}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
    islands, cursor = [], 0.0
    for s, e in zip(starts, ends):
        if s - cursor > 0.12:
            islands.append((cursor, s))
        cursor = e
    if dur - cursor > 0.12:
        islands.append((cursor, dur))
    return islands


def transcribe(src, a, b, tmp, key):
    ext = "mp3" if key else "wav"
    chunk = os.path.join(tmp, f"{a:.3f}.{ext}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(a - 0.06, 0):.3f}", "-to", f"{b + 0.06:.3f}",
                    "-i", src, "-ac", "1", "-ar", "16000", "-af", "apad=pad_dur=1", chunk], check=True)
    if not key:
        out = subprocess.run(["whisper-cli", "-m", LOCAL_MODEL, "-l", "es", "-np", "-nt", chunk],
                             capture_output=True, text=True).stdout
        return out.strip().replace("\n", " ")
    for _ in range(3):
        out = subprocess.run(["curl", "-sS", "-m", "60", API, "-H", f"Authorization: Bearer {key}",
                              "-F", f"file=@{chunk}", "-F", f"model={API_MODEL}", "-F", "language=es"],
                             capture_output=True, text=True).stdout
        try:
            return json.loads(out)["text"].strip()
        except (ValueError, KeyError):
            continue
    return f"<api error: {out[:120]}>"


def main():
    src = sys.argv[1]
    gap = float(sys.argv[2]) if len(sys.argv) > 2 else 0.30
    key = api_key()
    islands = find_islands(src, gap)
    with tempfile.TemporaryDirectory() as tmp, ThreadPoolExecutor(8 if key else 1) as pool:
        texts = pool.map(lambda ab: transcribe(src, ab[0], ab[1], tmp, key), islands)
        for (a, b), text in zip(islands, texts):
            print(f"{a:7.2f}-{b:7.2f}  {text}", flush=True)


if __name__ == "__main__":
    main()
