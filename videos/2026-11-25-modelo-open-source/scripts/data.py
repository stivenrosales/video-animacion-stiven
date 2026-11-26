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
    # heard "Cloud Code" (always); "bueno, tres" is his own correction and stays
    "Estas semanas he estado desarrollando varias aplicaciones con Claude Code, y principalmente dos me salieron muy bien, bueno, tres,",
    "pero dos son como que de código abierto. Y justamente de eso quiero hablar: cómo se podría plantear el modelo de negocio de estas aplicaciones",
    "que ahora sale mucho más rápido, y@14.66 la verdad es que cualquiera puede hacerlo. Entonces,",
    "he pensado que un buen modelo es hacerlo open source. O sea, básicamente",
    # Whisper hears "te regalo tú el código"; Gemini (pro and flash) hears "todo el código", which is what the sentence means
    "te regalo todo el código, tú ves cómo lo he hecho, y si te sirve, instálalo tú, porque en realidad tú también lo puedes hacer.",
    "Sin embargo, si quieres ahorrarte algunos pasos extra como",
    "no comprarte un servidor, o básicamente que yo lo gestione por ti, o te dé algunas aplicaciones de IA,",  # heard "ya lo gestione"
    # heard "Topicade" for "tu API key" (large-v3: "tu API", Gemini: "tu API key")
    "que igual en la aplicación open source también la tienes, solo es poner@38.02 tu·API·key.@38.26 Creo que este modelo de negocio podría funcionar de manera interesante.",
    "Te cuento que también lo hice con Polar.sh,@43.72 _ que es una buena pasarela de pago",
    "y muy fácil de configurar. Justamente está optimizado para este tipo de aplicaciones.",
    # the "que" Whisper adds after "crees" is not there: he says "o crees ya de facto que"
    "Pero mi duda va más si este es el modelo más óptimo, si esta es la mejor manera de obtener ingresos de estas aplicaciones, o crees _",
    "ya@57.86 de facto que ni siquiera se puede obtener ingresos. La verdad es que yo lo voy a intentar, y si quieres probarlas, aquí está: es Zenbox@63.50 y otra es Propi.",  # heard "SendBox"
    "Son aplicaciones que yo las usé, las creé porque las necesito. Pero cuéntame tú:",
    "¿cómo piensas tú monetizar tu aplicación? ¿O piensas que es una buena idea o no es una buena idea? Porque ahora ya todos pueden hacer su software gracias a Claude·Code.",
    "Déjame en los comentarios.",
]
MERGE = {("Claude", "Code,")}
END = 80.28

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
json.dump([{"t": round(w["t"], 2), "e": round(w["e"], 2), "w": w["w"].replace("·", " ")} for w in merged], open("src/words.json", "w"), ensure_ascii=False, indent=0)
print(len(merged), "words")
print(" ".join(f"{w['t']:.2f}:{w['w']}" for w in merged))
