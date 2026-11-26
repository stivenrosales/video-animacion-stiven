"""Show Whisper word tokens and micro-silences of a source range, to place a cut edge.

Usage: python3 tools/zoom.py <video-dir> A B
"""
import json
import re
import subprocess
import sys

d, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
toks = []
for seg in json.load(open(f"{d}/work/words.json"))["transcription"]:
    for t in seg["tokens"]:
        t0 = t["offsets"]["from"] / 1000
        if a <= t0 <= b and not t["text"].startswith("[_"):
            toks.append(f"{t0:.2f}{t['text']}")
print(" ".join(toks))
log = subprocess.run(["ffmpeg", "-v", "info", "-ss", str(a), "-to", str(b), "-i", f"{d}/work/audio.wav",
                      "-af", "silencedetect=noise=-32dB:d=0.04", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
s = [float(x) + a for x in re.findall(r"silence_start: ([0-9.]+)", log)]
e = [float(x) + a for x in re.findall(r"silence_end: ([0-9.]+)", log)]
print("sil:", " ".join(f"{x:.2f}-{y:.2f}" for x, y in zip(s, e)))
