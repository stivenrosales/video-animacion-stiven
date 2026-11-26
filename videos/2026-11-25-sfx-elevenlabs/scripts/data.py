"""Build src/words.json (one caption per word, edited timeline) and src/waves.json (bar shapes of each SFX)."""
import json
import subprocess

import numpy as np

FIX = {"clot": "Claude", "eleven": "Eleven", "labs": "Labs", "api": "API", "apk": "API", "claude": "Claude"}
words = json.load(open("work/words-edit.json"))["words"]
gap = [dict(w, start=w["start"] + 25.7, end=w["end"] + 25.7) for w in json.load(open("work/words-gap.json"))["words"]]
lo, hi = 25.9, 30.0  # Whisper skipped this sentence on the whole take; filled from a separate chunk
words = [w for w in words if not lo <= w["start"] < hi] + [w for w in gap if lo <= w["start"] < hi + 0.3 and not w["word"].strip().lower().startswith("que")]
words.sort(key=lambda w: w["start"])
out = []
for w in words:
    text = w["word"].strip().strip(".,").lower()
    text = FIX.get(text.strip("¿?"), text) if text.strip("¿?") in FIX else text
    out.append({"t": round(w["start"], 2), "e": round(w["end"], 2), "w": text})
i = next(k for k, w in enumerate(out) if w["w"] == "Eleven")
labs = next(w for w in out if w["w"] == "Labs")
out[i] = {"t": out[i]["t"], "e": labs["e"], "w": "ElevenLabs"}
out.remove(labs)
json.dump(out, open("src/words.json", "w"), ensure_ascii=False, indent=0)
print(" ".join(f"{w['t']}:{w['w']}" for w in out if 25 < w["t"] < 31))


def shape(path, n=22):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float)
    env = np.abs(x)
    loud = np.nonzero(env > env.max() * 0.03)[0]
    x = x[loud[0]:loud[-1] + 1]  # shape only the audible part
    parts = np.array_split(x, n)
    rms = np.array([np.sqrt((p ** 2).mean()) for p in parts])
    return [round(float(v), 3) for v in rms / rms.max()]


json.dump({"pro": shape("public/whoosh.mp3"), "code": shape("public/whoosh-code.wav")}, open("src/waves.json", "w"))
print(json.load(open("src/waves.json")))
