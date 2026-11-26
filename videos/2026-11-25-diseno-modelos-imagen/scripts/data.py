"""Build src/words.json: one caption per word on the edited timeline.

Times: OpenRouter Whisper turbo on short chunks of the edited audio (scripts/words_chunks.py → work/words-chunks.json).
Whisper drags words into the pauses, so a word that starts in a pause snaps to the next speech island
(work/fine-islands.json, pauses of 0.07 s or more).
Text: TEXT below, read against work/islands-edit.txt and several transcription passes; one line per chunk, and the
word count must match Whisper's. "_" drops a word Whisper invented; "+word@12.34" adds one it skipped;
"word@12.34" pins a word Whisper misplaced (checked with scripts/rms.py).
Usage (from the video folder): python3 scripts/data.py
"""
import json

TEXT = [
    # this pass invents "y la" at the end of the first chunk and skips "Y bueno," (both checked on work/islands-edit.txt)
    "Hace@0.3 poco escuché esta charla de diseño y vibe coding y me pareció muy importante que resalte la parte estética _ _",
    "en las aplicaciones que desarrollamos o en las páginas web. +Y@9.49 +bueno,@9.59",
    # "a Claude en las referencias": two passes hear "en", two hear "y" (flagged in the report)
    "viendo el flujo de trabajo que tenía, mi límite estético era lo que le pedía a Claude en las referencias. Sin embargo, descubrí que",
    "si usamos modelos de imagen, podemos imaginar cosas más interesantes.",
    "Como por ejemplo, las webs que he diseñado, estas que están aquí.",
    # Whisper puts "Las" on the "eh…" at 24.3 and drags the next words into the pauses: pinned to their islands (scripts/rms.py)
    "Las@24.92 hice iterando entre Opus, pedía@26.84 con@27.56 un prompt a@28.22 Image 2.6, _",
    "y después reimaginaba esto y hacía como un bucle de tres veces para@33.73 ver diferentes opciones.",
    "Con esto, los resultados que he obtenido, la verdad es que son",
    "muy buenos para al menos lo que yo he estado haciendo antes. Y@42.31 creo@42.73 que es un buen flujo que tú también podrías aplicar.",
    # the "eh" at 46.65 has no caption
    "Para usar este modelo, lo@47.17 usé mediante la",
    "API de Kie, que es un proveedor tipo Higgsfield, pero mucho más barato",  # heard "Kia"
    "para modelos de imagen y video, pues por 5 dólares tienes como, no sé, 100@56.1 imágenes que generar. Y eso está genial. Entonces,",
    # the first "¿Qué opinas?" is cut (scripts/cut.py): he asks it again as the last line
    "si deseas probarlo, lo puedes hacer desde ahí. ¿Y tú? ¿El@61.2 criterio estético para las webs y para las aplicaciones son importantes también para ti? ¿Qué@64.98 opinas?",
]
MERGE = {("vibe", "coding"), ("Image", "2.6,"), ("5", "dólares"), ("¿Y", "tú?"), ("¿Qué", "opinas?")}
END = 66.18

islands = json.load(open("work/fine-islands.json"))
chunks = json.load(open("work/words-chunks.json"))["chunks"]
assert len(TEXT) == len(chunks), (len(TEXT), len(chunks))


def snap(t):
    """A word cannot start in a pause: move it to the island it belongs to."""
    for a, b in islands:
        if a <= t < b:
            return t
        if t < a:
            return a
    return t


out = []
for line, ws in zip(TEXT, chunks):
    toks = line.split()
    assert len([x for x in toks if not x.startswith("+")]) == len(ws), (line, len(ws))
    k = 0
    for tok in toks:
        if tok.startswith("+"):
            word, at = tok[1:].split("@")
            out.append({"t": float(at), "e": float(at) + 0.12, "w": word, "heard": ""})
            continue
        t, e, heard = ws[k]
        k += 1
        if "@" in tok:
            tok, at = tok.split("@")
            out.append({"t": float(at), "e": float(at) + 0.2, "w": tok, "heard": heard})
        elif tok != "_":
            out.append({"t": snap(t), "e": e, "w": tok, "heard": heard})
assert all(x["t"] <= y["t"] + 0.2 for x, y in zip(out, out[1:])), [(x, y) for x, y in zip(out, out[1:]) if x["t"] > y["t"] + 0.2]
merged = []
for w in out:
    if merged and (merged[-1]["w"], w["w"]) in MERGE:
        merged[-1] = {**merged[-1], "e": w["e"], "w": merged[-1]["w"] + " " + w["w"], "heard": merged[-1]["heard"] + " " + w["heard"]}
    else:
        merged.append(w)
for x, y in zip(merged, merged[1:]):
    if y["t"] <= x["t"] + 0.09:
        y["t"] = round(x["t"] + 0.1, 2)
    x["e"] = min(max(x["e"], x["t"] + 0.08), y["t"])
merged[-1]["e"] = min(merged[-1]["e"], END)
strip = lambda s: s.strip(" ,.:¿?").lower()
for w in merged:
    if strip(w["w"]) != " ".join(strip(h) for h in w["heard"].split()) and w["heard"]:
        print(f"  {w['t']:6.2f} heard «{w['heard']}» → shown «{w['w']}»")
json.dump([{"t": round(w["t"], 2), "e": round(w["e"], 2), "w": w["w"]} for w in merged], open("src/words.json", "w"), ensure_ascii=False, indent=0)
print(len(merged), "words")
print(" ".join(f"{w['t']:.2f}:{w['w']}" for w in merged))
