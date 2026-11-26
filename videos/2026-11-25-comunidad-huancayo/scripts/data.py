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
    "Hace unas semanas en Huancayo hubo un evento de tecnología muy genial. Y lo digo así en Huancayo porque en realidad",
    "todo se hace en la capital, en Lima, normalmente. Y me volvió a recordar",
    # heard "Knockout/nocaut": he says "no-code"
    "lo importante que es crear comunidad. Estas personas que vinieron a visitarnos son otros builders que hacen cosas con IA, cosas con no-code,",
    "o en realidad hacen cosas. Y lo genial es que ellos comparten lo que aprenden.",
    "Y creo que mucho de ese espíritu es de este canal, que es compartir lo que queramos.",
    # heard "cloth/clot/club": the Clawd figurine he is holding
    "Y en ese evento lo que más me emocionó, una de las cosas, porque fueron varias cosas que me emocionaron, aparte de ver a mis amigos, que también me regalaron este Clawd,",
    # "como" between "intención" and "de" is in two of four passes and in the 25 ms RMS scan (36.90-37.03)
    "que está genial. Y pues, esa intención +como@36.9 de@37.1 compartir@37.22 como que todos los desarrolladores",
    "que hacen código o que crean sus propias herramientas, las hacen open source,",
    "porque creen que eso también ayudaría a otras personas, no necesariamente monetizando. O sea, genial, se puede monetizar, pero no es como la",
    "la primera motivación, sino es crear cosas que funcionan. Porque primero a ellos les funciona,",
    "y es como: oye, me funcionó, quizá te pueda también funcionar a ti.",
    # 66.46 heard "tardes/tarde de": unclear word, not shown
    "Y eso es lo que hablaron en este evento, también cosas como que ellos que construyeron en las empresas donde trabajaron, cómo conseguir _ trabajos.",
    # heard "es todo": "estuvo"
    "Y estuvo _ muy orientado a estudiantes",
    # heard "Guadamamarca/Guamamarca/Huancamarca": Plaza Huamanmarca, Huancayo
    "y vinieron a aprender, lo cual estaba genial. Además fue en la Plaza Huamanmarca, donde las personas entraron y todo eso. Obviamente hay cosas por mejorar,",
    "pero creo que este tipo de iniciativas es excelente porque junta personas que nos apasiona crear y normalmente lo hacemos en solitario, +o~sea,@84.33",
    "básicamente yo no salgo de casa",
    "porque estoy con Claude~Code. Pero es genial salir",  # heard "CloudCode/Clotco"
    "o hacer reuniones donde decimos: oye, construí esto, me pasó esto, yo encontré esta herramienta, y eso es genial.",
    "¿Y tú qué opinas? ¿Estás en alguna comunidad de código, programación o vibe~coding? Cuéntame en los comentarios.",  # heard "bytecoding"
]
MERGE = {("¿Y", "tú")}
END = 102.71

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
json.dump([{"t": round(w["t"], 2), "e": round(w["e"], 2), "w": w["w"].replace("~", " ")} for w in merged], open("src/words.json", "w"), ensure_ascii=False, indent=0)
print(len(merged), "words")
print(" ".join(f"{w['t']:.2f}:{w['w']}" for w in merged))
