"""Audio-only render of the fine cut (light, no video encode): work/audio.wav → work/edit16.wav + work/keeps.json.

Runs the keep-list part of scripts/cut.py, so both always agree. Usage (from the video folder): python3 scripts/edit_audio.py
"""
import json
import os
import subprocess
import sys

plan = open("scripts/cut.py").read().split("def remap")[0]
os.chdir("work")
sys.argv = ["cut.py", "src.mp4", "-", "-"]
ns = {}
exec(plan, ns)
keeps = ns["keeps"]
F = 0.012
parts, labels = [], []
for i, (a, b) in enumerate(keeps):
    parts.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d={F},afade=t=out:st={b - a - F:.3f}:d={F}[a{i}]")
    labels.append(f"[a{i}]")
parts.append("".join(labels) + f"concat=n={len(keeps)}:v=0:a=1[ac]")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "audio.wav", "-filter_complex", ";".join(parts), "-map", "[ac]", "edit16.wav"], check=True)
acc, rows = 0.0, []
for a, b in keeps:
    rows.append([round(a, 3), round(b, 3), round(acc, 3)])
    acc += b - a
json.dump(rows, open("keeps.json", "w"))
print(f"segments={len(keeps)} duration={acc:.2f}s")
for a, b in ns["MANUAL_CUTS"]:
    at = next((o + (a - s) for s, e, o in rows if s <= a <= e + 0.01), None)
    print(f"  cut {a:.2f}-{b:.2f} lands at edit {at:.2f}" if at is not None else f"  cut {a:.2f}-{b:.2f} starts inside a silence")
