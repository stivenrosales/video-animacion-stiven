"""Build src/words.json: one caption per word on the edited timeline.

Times: each speech island of the edit transcribed alone (scripts/words_islands.py → work/words-islands.json, pauses of
0.07 s or more from work/islands-edit-fine.txt), so no word drifts into a pause; the first word of an island starts at
the island. Text: read against work/islands-edit.txt, the islands and two audio models (scripts/listen.py).
Whisper heard "cloud" (Claude), "MSP" (MCP), "Artable/Usuertable" (uso Airtable), "Clotco" (Claude Code) and dropped
"mi CRM" after "hasta"; those words are placed by hand from the whole-take word times (work/words-edit.json).

Usage (from the video folder): python3 scripts/data.py
"""
import json

# (island start, island end, "time:word ...") — a word without a time starts where the previous one ends (merged caption).
ISLANDS = [
    (0.13, 0.94, "0.13:como 0.24:todos 0.42:saben"),
    (1.04, 3.28, "1.04:Facebook 1.37:y 1.63:Meta_Ads 2.11:ya 2.19:se 2.31:puede 2.47:conectar 2.85:a 2.93:tu 3.03:Claude"),
    (3.41, 4.24, "3.41:mediante 3.66:el 3.82:MCP"),
    (4.79, 6.74, "4.79:sin 4.90:embargo 5.24:quise 5.38:llevar 5.64:esto 5.90:un 6.04:poquito 6.22:más_allá"),
    (6.91, 10.91, "6.91:para 7.06:que 7.32:no 7.60:solo 7.82:pueda 8.16:ver 8.28:las 8.48:métricas 9.06:y 9.18:publicaciones 9.74:de 9.96:ads 10.26:en 10.50:Meta"),
    (11.08, 12.83, "11.08:sino 11.21:que 11.33:también 11.49:conectarlos 12.11:con 12.27:un 12.39:CRM"),
    (13.11, 16.57, "13.11:en 13.18:mi 13.30:caso 13.50:uso 13.70:Airtable 13.98:como 14.26:un 14.40:CRM 14.78:porque 15.00:ahí 15.16:están 15.26:mis 15.42:clientes 15.84:y 15.96:todo 16.10:lo 16.20:demás"),
    (16.70, 17.28, "16.70:y 16.78:quería"),
    (17.45, 18.30, "17.45:hacer 17.62:la 17.78:trazabilidad"),
    (18.46, 18.95, "18.46:total"),
    (19.10, 20.21, "19.10:desde 19.49:Meta"),
    (20.36, 25.30, "20.36:hasta 20.65:mi 20.85:CRM 21.30:para 21.44:ver 21.60:quiénes 22.04:están 22.22:llegando 22.72:quiénes 22.88:están 23.04:comprando 23.56:de 23.72:qué 23.90:publicidad 24.38:están 24.56:llegando"),
    (25.41, 27.30, "25.41:y 25.50:creo 25.60:que 25.74:ahora 25.86:es 25.98:totalmente 26.24:posible 26.66:con 26.94:Claude_Code"),
    (27.45, 29.36, "27.45:no 27.64:usas 27.92:el 28.04:MCP 28.40:como 28.60:tal 28.90:sino 29.10:la"),
    (29.53, 29.90, "29.53:API"),
    (30.11, 30.75, "30.11:de 30.22:Meta"),
    (30.90, 33.25, "30.90:y 30.97:en 31.07:un 31.21:solo 31.41:software 31.79:puedes 32.13:ver 32.29:las 32.49:métricas 33.03:de"),
    (33.41, 35.38, "33.41:quiénes 33.68:te 33.76:han 33.86:comprado 34.38:cuánto 34.60:te 34.70:han 34.80:comprado"),
    (35.53, 37.60, "35.53:y 35.62:la 35.82:verdad 35.98:es 36.08:que 36.16:esto 36.42:me 36.50:ha 36.58:funcionado 36.92:muy 37.30:bien"),
    (37.70, 43.95, "37.70:que 37.79:lo 38.05:he 38.33:implementado 38.81:en 38.89:mi 38.97:empresa 39.35:y 39.63:ahora 39.77:es 39.87:totalmente 40.17:gratis 40.57:en 40.69:este 40.85:repositorio 41.33:público 41.61:si 41.85:quieres 42.05:usarlo 42.47:para 42.71:ver 42.97:tus 43.13:métricas"),
    (44.08, 45.35, "44.08:y 44.15:tener 44.31:un 44.45:panel 44.69:de 44.87:dashboard"),
    (45.57, 45.95, "45.57:para 45.72:ver"),
    (46.13, 47.50, "46.13:qué 46.22:está 46.34:funcionando 46.86:y 47.10:qué 47.31:no"),
    (47.67, 48.22, "47.67:lo 47.76:puedes 47.88:usar 48.06:ahí"),
]

out = []
for a, b, text in ISLANDS:
    toks = [x.split(":") for x in text.split()]
    for i, (t, w) in enumerate(toks):
        nxt = float(toks[i + 1][0]) if i + 1 < len(toks) else b
        t = float(t)
        assert a <= t < nxt <= b + 0.001, (a, t, w)
        out.append({"t": round(t, 2), "e": round(max(nxt, t + 0.08), 2), "w": w.replace("_", " ")})
assert all(x["t"] < y["t"] for x, y in zip(out, out[1:]))
json.dump(out, open("src/words.json", "w"), ensure_ascii=False, indent=0)
print(len(out), "words:", " ".join(w["w"] for w in out))
