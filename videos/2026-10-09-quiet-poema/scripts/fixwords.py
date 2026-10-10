"""Post-fix src/words.json: merge/rename mis-heard words by matching consecutive word sequences."""
import json
P = "src/words.json"
w = json.load(open(P))
# (sequence as said by Whisper, replacement words — same count or fewer; extras are merged into the last)
RULES = [
    (["las", "ruas", "dos", "doradores,"], ["la", "Rua", "dos", "Douradores,"]),
    (["la", "rúa", "dos", "doradores."], ["la", "Rua", "dos", "Douradores."]),
    (["elancia"], ["el ansia"]),
    (["despojar", "a"], ["despojara"]),
    (["en", "por", "menor,"], ["en", "pormenor,"]),
    (["valgue"], ["valga"]),
    (["Sergio"], ["Sérgio"]),
    (["lleva,"], ["lleva"]),
    (["utilizo"], ["utilizo,"]),
    (["explotado"], ["explotado,"]),
]
txt = lambda i: w[i]["text"].strip()
i, out = 0, []
while i < len(w):
    for seq, rep in RULES:
        if [txt(i + k) if i + k < len(w) else None for k in range(len(seq))] == seq:
            if seq == ["explotado"] and (i + 1 >= len(w) or txt(i + 1) != "Soares,"):
                continue
            grp = w[i:i + len(seq)]
            for k, r in enumerate(rep):
                e = dict(grp[k]); e["text"] = " " + r
                if k == len(rep) - 1: e["endMs"] = grp[-1]["endMs"]
                out.append(e)
            i += len(seq); break
    else:
        out.append(w[i]); i += 1
json.dump(out, open(P, "w"), ensure_ascii=False, indent=1)
print(len(out), "words")
