"""Build src/words.json: one caption per word on the edited timeline.

Text: read against work/islands-edit.txt, work/islands-edit-fine.txt and four transcription models on short chunks.
Times: OpenRouter Whisper turbo on six chunks of the edited audio (scripts/words_chunks.py). Whisper drags words into
the pauses, so every word is held inside its own speech island (islands-edit-fine.txt, pauses of 0.07 s or more):
the first word of a group starts at the island, later ones keep Whisper's time when it falls inside.
"""
import json

BOUNDS = [0.0, 10.40, 22.07, 33.88, 44.32, 56.55]
api = []
for off in BOUNDS:
    api += [(w["start"] + off, w["end"] + off, w["word"].strip(" .,").lower()) for w in json.load(open(f"work/words-chunk-{off}.json"))["words"]]

# (island start, island end, what he says). "_" drops a word Whisper invented; the word count must match Whisper's.
GROUPS = [
    (0.00, 3.41, "ahora que todos estamos desarrollando software con Claude Code"),
    (3.51, 4.40, "y haciendo"),
    (4.67, 6.67, "cualquier herramienta en realidad que nos imaginemos,"),
    (6.81, 8.24, "creo que es muy importante tener buenas"),
    (8.32, 9.67, "prácticas desde el sentido de la"),
    (9.77, 10.32, "usabilidad"),
    (10.48, 11.94, "si bien nuestra UI,"),
    (12.11, 12.87, "nuestras pantallas"),
    (12.94, 13.95, "pueden verse hermosas"),
    (14.46, 15.95, "y realmente fáciles de usar,"),
    (16.11, 19.08, "creo que ahora estamos migrando mucho a usar los softwares"),
    (19.22, 20.21, "mediante el MCP,"),
    (20.35, 21.02, "mediante"),
    (21.13, 21.99, "el chat de Claude"),
    (22.15, 24.81, "por ejemplo, hace poco hice un MCP para SAP"),
    (24.95, 26.12, "porque muchas personas"),
    (26.26, 28.82, "no querían usar SAP dentro"),  # he says "dentro de… del software": the caption shows the clean reading
    (29.13, 33.79, "del software como tal porque tiene varias pantallas, varias configuraciones, y yo la verdad _ que no tengo mucha experiencia con SAP"),
    (33.97, 35.30, "vi y simplemente me abrumé"),
    (35.46, 36.54, "pero mediante"),
    (36.69, 38.09, "el MCP que le creé a SAP,"),
    (38.23, 39.84, "conectándole a Claude o a ChatGPT,"),
    (40.10, 40.70, "las operaciones"),
    (40.82, 43.56, "eran mucho más fáciles entonces, si estás construyendo un software"),
    (43.70, 44.24, "nuevo,"),
    (44.40, 45.46, "creo que sería genial"),
    (45.60, 47.00, "que tengas en consideración"),
    (47.33, 47.95, "hacerlo"),
    (48.04, 49.12, "MCP friendly"),
    (49.32, 51.86, "para que cualquier IA también lo pueda operar así tu usuario"),
    (52.01, 52.40, "decide:"),
    (52.49, 55.19, "quiero operarlo desde la plataforma como tal, con sus botones"),
    (55.28, 56.47, "y sus casillas,"),
    (56.64, 58.10, "o quiero usarlo desde"),
    (58.20, 58.38, "Claude,"),
    (58.54, 59.52, "que también puede ser muy fácil"),
    (60.07, 60.76, "y eso te recomiendo"),
    (60.88, 61.19, "pero tú,"),
    (61.33, 61.77, "¿qué opinas?"),
]
MERGE = {("Claude", "Code"), ("¿qué", "opinas?")}

out, k = [], 0
for a, b, text in GROUPS:
    toks = text.split()
    for i, tok in enumerate(toks):
        t, e, heard = api[k]
        k += 1
        if tok == "_":
            continue
        t = a if i == 0 else min(max(t, a), b - 0.1)
        out.append({"t": t, "e": min(max(e, t + 0.1), b), "w": tok, "heard": heard})
assert k == len(api), (k, len(api))
merged = []
for w in out:
    if merged and (merged[-1]["w"], w["w"]) in MERGE:
        merged[-1] = {**merged[-1], "e": w["e"], "w": merged[-1]["w"] + " " + w["w"], "heard": merged[-1]["heard"] + " " + w["heard"]}
    else:
        merged.append(w)
for x, y in zip(merged, merged[1:]):
    if y["t"] <= x["t"] + 0.09:
        y["t"] = x["t"] + 0.1
    x["e"] = min(x["e"], y["t"])
for w in merged:
    shown = w["w"].strip(",.:¿?").lower()
    if shown != w["heard"].strip("¿?"):
        print(f"  {w['t']:6.2f} heard «{w['heard']}» → shown «{w['w']}»")
json.dump([{"t": round(w["t"], 2), "e": round(max(w["e"], w["t"] + 0.08), 2), "w": w["w"]} for w in merged], open("src/words.json", "w"), ensure_ascii=False, indent=0)
print(" ".join(f"{w['t']:.2f}:{w['w']}" for w in merged))
