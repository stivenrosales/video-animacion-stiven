"""Voice polish for social: gentle cleanup + two-pass loudnorm to -14 LUFS.

Usage: python3 voice.py IN.wav OUT.wav [--raw]   (--raw skips the cleanup chain)
"""
import json
import re
import subprocess
import sys

CHAIN = ",".join([
    "highpass=f=80",                                   # wind / handling rumble
    "afftdn=nr=10:nf=-50:tn=1",                        # light broadband denoise
    "equalizer=f=250:t=q:w=1.2:g=-2",                  # less mud
    "equalizer=f=3500:t=q:w=1.0:g=2.5",                # presence
    "treble=g=2:f=9000",                               # air
    "deesser=i=0.3",
    "acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=2",
])
TARGET = "I=-14:TP=-1.5:LRA=11"

src, dst = sys.argv[1], sys.argv[2]
pre = "" if "--raw" in sys.argv else CHAIN + ","
log = subprocess.run(["ffmpeg", "-i", src, "-af", f"{pre}loudnorm={TARGET}:print_format=json",
                      "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^}]+\}", log).group())
second = (f"loudnorm={TARGET}:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
          f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}"
          f":offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
                f"{pre}{second},alimiter=limit=0.84:level=false", "-ar", "48000", dst + ".tmp.wav"], check=True)

# loudnorm falls back short when true peak binds; close the gap with gain into the limiter.
log = subprocess.run(["ffmpeg", "-i", dst + ".tmp.wav", "-af", "ebur128", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
measured = float(re.findall(r"I:\s+(-?[0-9.]+) LUFS", log)[-1])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", dst + ".tmp.wav", "-af",
                f"volume={-14 - measured:.2f}dB,alimiter=limit=0.84:attack=2:release=40:level=false",
                "-ar", "48000", dst], check=True)
subprocess.run(["rm", dst + ".tmp.wav"])
