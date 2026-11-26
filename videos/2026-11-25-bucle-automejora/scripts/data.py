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
    "Hace poco escuché un video de Platzi, de Freddy de Platzi,",
    "que recomendaba recopilar mucha información para decirle a la IA que vaya mejorando los procesos internos de la empresa.",
    "Pero todo esto solo es posible si tienes información de tu empresa. Y así la IA como que coge la información, la lee,",
    "propone procesos de mejora, las implementa y después al siguiente día vuelve a hacer lo mismo:",
    "coge la información, mejora y así como que es un bucle de automejora brutal.",
    "Sin embargo, creo que una empresa de Latinoamérica funciona todo con WhatsApp o reuniones virtuales.",
    "Y si quieres mejorar esos procesos, a veces pasan de manera invisible.",
    "Por eso yo conecté todos mis canales de WhatsApp,",
    "mis grupos de WhatsApp y además mis chats de WhatsApp",
    # heard "MSP" and "Sandbox/Sendbox"
    "hacia una fuente de información mediante un MCP. Lo puedes usar, se llama Zenbox y es totalmente gratis. Y también usé",
    "WAHA para poder conectarme a los grupos y que de ahí tenga toda la trazabilidad y@51.15 también los audios y las imágenes.",
    "Entonces toda la información está también de los grupos y los chats personales.",
    "Y también uso Google para grabar todas mis reuniones. Entonces, todas mis reuniones de venta están transcritas con Whisper,",  # he says "transcritos"
    # the faint "y" Whisper hears at 61.5 is a 75 ms blip, not a word
    "_ otra vez alimentando toda mi base de datos en CRM. Con toda esa información, yo la última semana me había olvidado que lo había configurado, pero le pregunté:",
    "¿qué está pasando?, ¿qué está funcionando?, ¿qué no está funcionando?, y es",
    "muy genial el insight que te propone, porque depende de todas mis vendedoras que hicieron ciertas cosas, me puso",  # heard "todos mis vendedoras/vendedores"
    "qué cosas realmente funcionan y qué cosas no, qué cosas están haciendo perder dinero. Y gracias a eso, generé infografías, les envié y tenemos el feedback completo.",  # heard "genera… envíe"
    "Ahora va a ser una regla hacer esto cada semana para recolectar información y ver si han mejorado o no han hecho eso.",
    "Entonces, gracias a Claude Code y estas herramientas de inteligencia artificial, podemos mejorar cualquier negocio gracias@97.75 a@98.03",  # heard "Cloud Code", "pueden/podemos"
    "_ también las fuentes de información que vamos recopilando, que ya no se pierden ni de@101.63 reuniones,@101.75 ni@102.50 de@102.60 chats,@102.78 ni@103.13 de nada.",
    "¿Y tú? ¿Qué opinas? ¿Cómo quieres optimizar tu empresa?",
]
MERGE = {("Claude", "Code"), ("¿Y", "tú?"), ("¿Qué", "opinas?")}
END = 107.05

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
