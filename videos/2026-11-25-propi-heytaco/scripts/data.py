"""Build src/words.json: one caption per word on the edited timeline.

Source: work/words-edit.json (OpenRouter Whisper turbo on the edited audio, scripts/words_edit.py). Whisper skipped the
last sentence on the whole take, so it comes from a separate chunk (work/words-gap.json) placed with a 50 ms RMS scan.
Every word was read against work/islands-edit.txt.
"""
import json

FIX = {"propit": "Propi", "propi": "Propi", "heytaco": "HeyTaco"}
MERGE = {("hey", "taco"): "HeyTaco", ("cloud", "code"): "Claude Code"}
# Whisper glues a word that follows a pause to the previous one; starts taken from the speech islands.
START_AT = {7.22: 7.55, 7.62: 7.74, 26.12: 26.66, 34.48: 34.71, 54.84: 54.98, 55.04: 55.08, 55.14: 55.24}
TAIL = [  # "…por gusto cuando podrías ya construirlas con Claude Code?"
    (57.88, 57.98, "por"), (57.98, 58.22, "gusto"), (58.3, 58.5, "cuando"), (58.5, 58.78, "podrías"), (58.78, 58.95, "ya"),
    (58.95, 59.42, "construirlas"), (59.42, 59.6, "con"), (59.62, 60.0, "Claude Code?"),
]

words = [w for w in json.load(open("work/words-edit.json"))["words"] if w["start"] < 57.6]
out = []
for w in words:
    text = w["word"].strip().strip(".,").lower()
    core = text.strip("¿?")
    if core in FIX:
        text = text.replace(core, FIX[core])
    start = START_AT.get(round(w["start"], 2), w["start"])
    out.append({"t": round(start, 2), "e": round(max(w["end"], start + 0.1), 2), "w": text})
merged = []
for w in out:
    key = (merged[-1]["w"].lower(), w["w"].lower()) if merged else None
    if key in MERGE:
        merged[-1] = {"t": merged[-1]["t"], "e": w["e"], "w": MERGE[key]}
    else:
        merged.append(w)
merged += [{"t": t, "e": e, "w": w} for t, e, w in TAIL]
for a, b in zip(merged, merged[1:]):
    a["e"] = min(a["e"], b["t"])
json.dump(merged, open("src/words.json", "w"), ensure_ascii=False, indent=0)
print(" ".join(w["w"] for w in merged))
print(" ".join(f"{w['t']}:{w['w']}" for w in merged))
