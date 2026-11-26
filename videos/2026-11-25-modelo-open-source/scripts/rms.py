"""25 ms RMS scan of a range of an audio file (dBFS per window), to place a cut edge in a real gap.

Usage (from the video folder): python3 scripts/rms.py AUDIO A B
"""
import subprocess
import sys

import numpy as np

src, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", src, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                     capture_output=True).stdout
x = np.frombuffer(raw, np.float32)
n = 400
row = []
for i in range(0, len(x) - n + 1, n):
    db = 20 * np.log10(max(np.sqrt(np.mean(x[i:i + n] ** 2)), 1e-6))
    row.append(f"{a + i / 16000:.3f}:{db:4.0f}")
for i in range(0, len(row), 8):
    print("  ".join(row[i:i + 8]))
