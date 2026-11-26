"""Build src/words.json: one caption per word on the edited timeline.

Source: work/words-edit.json (OpenRouter Whisper turbo on the edited audio, scripts/words_edit.py). Whisper skipped two
stretches on the whole take (11.9–30.2 and 58.4–60.0), so they come from separate chunks (work/words-gap-<offset>.json).
Whisper also stretches the first word after a pause back into the pause, so that word starts at its speech island
(work/islands-edit.txt). Every word was read against work/islands-edit.txt and three transcriptions of the source.
"""
import json
import re


def load(path, offset=0.0):
    return [{"t": w["start"] + offset, "e": w["end"] + offset, "w": w["word"].strip()} for w in json.load(open(path))["words"]]


main = load("work/words-edit.json")
g1 = load("work/words-gap-11.0.json", 11.0)
g2 = load("work/words-gap-20.0.json", 20.0)
g3 = load("work/words-gap-57.6.json", 57.6)
words = ([w for w in main if w["t"] < 11.0] + [w for w in g1 if 11.0 <= w["t"] < 19.9] + [w for w in g2 if 19.9 <= w["t"] < 30.1]
         + [w for w in main if 30.1 <= w["t"] < 58.4] + [w for w in g3 if 58.4 <= w["t"] < 59.9] + [w for w in main if w["t"] >= 59.9])

# (rounded start, heard) → shown. He says "el API oficial" both times (three models agree on the source chunks).
FIX_AT = {(1.72, "lápide"): "API", (32.54, "la"): "el", (32.66, "app"): "API", (61.0, "pagar"): "apagar", (47.9, "si"): "sí",
          (34.34, "cuál"): "¿cuál", (35.14, "respuesta"): "respuesta?"}
FIX = {"whatsapp": "WhatsApp", "apis": "APIs", "api": "API", "waja": "WAHA", "manychat": "ManyChat", "evolution": "Evolution"}
MERGE = {("evolution", "api"): "Evolution API", ("¿qué", "opinas?"): "¿qué opinas?"}

out = []
for w in words:
    text = w["w"].strip(".,").lower()
    text = FIX_AT.get((round(w["t"], 2), text), text)
    core = text.strip("¿?")
    if core in FIX:
        text = text.replace(core, FIX[core])
    out.append({"t": w["t"], "e": w["e"], "w": text})
merged = []
for w in out:
    key = (merged[-1]["w"].lower(), w["w"].lower()) if merged else None
    if key in MERGE:
        merged[-1] = {"t": merged[-1]["t"], "e": w["e"], "w": MERGE[key]}
    else:
        merged.append(w)

# First word after each pause: start at the speech island, not inside the pause.
islands = [tuple(map(float, m.groups())) for m in re.finditer(r"^\s*([\d.]+)-\s*([\d.]+)", open("work/islands-edit.txt").read(), re.M)]
for (_, prev_end), (start, _) in zip(islands, islands[1:]):
    late = [w for w in merged if prev_end - 0.45 <= w["t"] < start - 0.04]
    if not late:
        continue
    first = late[-1] if late[-1]["e"] > prev_end else None  # the word that straddles the pause belongs to the next island
    if first:
        first["t"] = start
        first["e"] = max(first["e"], start + 0.1)
# Read against the islands: "y" is its own tiny island (42.06) and "para" was glued to "empresas".
START_AT = {(42.38, "y"): 42.06, (42.46, "en"): 42.38, (65.54, "para"): 65.38}
for w in merged:
    w["t"] = START_AT.get((round(w["t"], 2), w["w"]), w["t"])
for a, b in zip(merged, merged[1:]):
    if b["t"] <= a["t"]:
        b["t"] = a["t"] + 0.1
    a["e"] = min(a["e"], b["t"])
merged = [{"t": round(w["t"], 2), "e": round(max(w["e"], w["t"] + 0.08), 2), "w": w["w"]} for w in merged]
json.dump(merged, open("src/words.json", "w"), ensure_ascii=False, indent=0)
print(" ".join(w["w"] for w in merged))
print(" ".join(f"{w['t']}:{w['w']}" for w in merged))
