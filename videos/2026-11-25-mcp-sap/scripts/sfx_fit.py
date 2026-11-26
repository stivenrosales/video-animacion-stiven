"""Peak-match the new ElevenLabs effects to -3 dB, trim leading silence and print each onset list.

Usage (from the video folder): python3 scripts/sfx_fit.py   (work/sfx/<name>-a.mp3 → public/<out>.mp3)
"""
import subprocess

import numpy as np

FILES = {"enchufe-a": "plug", "golpe-a": "thud", "marca-a": "check"}
for src, dst in FILES.items():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"work/sfx/{src}.mp3", "-ac", "1", "-ar", "44100", "-f", "f32le", "-"],
                         capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    peak = np.abs(x).max()
    first = np.nonzero(np.abs(x) > peak * 0.05)[0][0] / 44100
    lead = max(first - 0.01, 0)
    gain = 20 * np.log10(0.708 / peak)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{lead:.3f}", "-i", f"work/sfx/{src}.mp3", "-af", f"volume={gain:.1f}dB",
                    "-b:a", "192k", f"public/{dst}.mp3"], check=True)
    y = x[int(lead * 44100):]
    win = 441  # 10 ms
    env = np.array([np.abs(y[i:i + win]).max() for i in range(0, len(y) - win, win)]) / peak
    onsets = [round(i * 0.01, 2) for i in range(1, len(env)) if env[i] > 0.3 and env[i - 1] <= 0.3]
    print(dst, f"gain {gain:+.1f} dB, lead cut {lead:.2f}s, len {len(y)/44100:.2f}s, peak at {np.abs(y).argmax()/44100:.2f}s, onsets {onsets}")
