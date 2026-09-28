"""Convert whisper-cli full JSON (-ojf) of the EDITED audio into Remotion Caption[] JSON.

Usage: python3 captions.py ewords.json ../src/captions.json
Edit FIX to correct brand names Whisper mishears.
"""
import json
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
FIX = {"Cloud": "Claude", "Claud": "Claude", "Borisand": "Vorssaint", "click": "clic",
       "olvides": "olvidas", "define": "defines"}  # per-video corrections
# Position-specific fixes by start time in seconds ("" drops the word).
FIX_AT = {46.01: "le", 24.72: ""}

data = json.load(open(SRC))
words = []
for seg in data["transcription"]:
    for tok in seg["tokens"]:
        text = tok["text"]
        if text.startswith("[_") or not text.strip():
            continue
        start, end = tok["offsets"]["from"], tok["offsets"]["to"]
        if text.startswith(" ") or not words:
            words.append([text.strip(), start, end])
        else:  # subword token: glue to previous word
            words[-1][0] += text
            words[-1][2] = end

out = []
for i, (w, start, end) in enumerate(words):
    core = w.strip("¿?¡!,.")
    if core in FIX:
        w = w.replace(core, FIX[core])
    at = FIX_AT.get(round(start / 1000, 2))
    if at is not None:
        if not at:
            continue
        w = w.replace(core, at)
    nxt = words[i + 1][1] if i + 1 < len(words) else start + 500
    out.append({"text": " " + w, "startMs": start, "endMs": min(max(end, start + 120), nxt),
                "timestampMs": start, "confidence": None})
json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
print(f"{len(out)} words")
