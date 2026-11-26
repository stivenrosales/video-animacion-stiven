"""Build work/board.html: the Koan "cercano" mockboard over this video's real frames.

Run from the video folder: python3 scripts/board.py
"""
KIT = "../../skills/talking-head-reel/assets/styles/koan/"
s = open(KIT + "style-board.html", encoding="utf-8").read()
head = s[:s.index("<main>")]
head = head.replace('url("assets/', 'url("../' + KIT + "assets/")
head = head.replace("Koan · reels cercanos (v2)", "SFX ElevenLabs · mockboard Koan")
EXTRA = """
  /* --- adaptations for this footage: bright daylight + white polo --- */
  .floor { position:absolute; inset:0; background:linear-gradient(0deg, rgba(26,26,24,.82) 0%, rgba(26,26,24,.6) 20%, rgba(26,26,24,0) 44%); }
  .word { top:1405px; }
  .word.big { top:1345px; }
  .win { left:80px; right:80px; padding:44px 50px 50px; }
  .win .bar { font-size:26px; margin-bottom:36px; }
  .row { font-size:36px; padding:22px 0; }
  .tagbox { position:absolute; left:0; right:0; top:300px; display:flex; justify-content:center; }
  .tag { font-family:var(--mono); font-size:24px; letter-spacing:1px; text-transform:uppercase; color:var(--arena); background:rgba(26,26,24,.82); font-size:28px; padding:16px 26px 17px; border-radius:999px; display:flex; gap:14px; align-items:center; animation: rise var(--T) infinite var(--ease); }
  .tag i { width:12px; height:12px; border-radius:50%; background:var(--moss-light); }
  .wave { display:flex; gap:10px; align-items:center; justify-content:center; height:300px; }
  .wave b { width:14px; border-radius:14px; background:var(--arena); height:calc(var(--h) * 1px); transform-origin:50% 50%; animation: bar 1.2s infinite ease-in-out; animation-delay:calc(var(--n) * -0.09s); }
  .wave.moss b { background:var(--moss-light); }
  .wave.flat b { background:var(--mute); border-radius:2px; animation:none; }
  .wave.sm { height:190px; gap:9px; justify-content:flex-start; } .wave.sm b { width:13px; height:calc(var(--h) * .6px); }
  @keyframes bar { 0%,100% { transform:scaleY(.45) } 50% { transform:scaleY(1) } }
  .ab { display:flex; flex-direction:column; gap:14px; padding:26px 0; border-top:1.5px solid #2E2E2A; opacity:0; animation: rise var(--T) infinite var(--ease); animation-delay:var(--d); }
  .ab:first-of-type { border-top:0; }
  .ab span { font-family:var(--mono); font-size:32px; color:var(--mute); letter-spacing:.5px; }
  .ab em { font-style:normal; color:var(--moss-light); }
  .ab span { display:flex; align-items:center; gap:16px; } .ab span img { height:40px; } .ab span img.el { height:26px; }
  .brand { position:absolute; left:0; right:0; top:300px; text-align:center; animation: rise var(--T) infinite var(--ease); } .brand img { height:54px; }
</style>"""
head = head.replace("</style>", EXTRA, 1)

F = "board/"
RICH = [30, 70, 120, 190, 260, 300, 240, 170, 210, 150, 95, 130, 80, 50, 30, 18]
FLAT = [60, 180, 180, 180, 180, 60, 60, 180, 180, 60, 60, 60, 180, 60, 60, 60]


def bars(hs, cls=""):
    inner = "".join(f'<b style="--h:{h};--n:{i}"></b>' for i, h in enumerate(hs))
    return f'<div class="wave {cls}">{inner}</div>'


def words(ws, cls=""):
    spans = []
    for i, w in enumerate(ws):
        big = ' class="bigw"' if (w.isupper() and len(w) > 3 and not cls) else ""
        spans.append(f'<span style="--i:{i}"{big}>{w}</span>')
    return f'<div class="word {cls}"><span class="stack">{"".join(spans)}</span></div>'


def fig(inner, title, note):
    return (f'<figure><div class="frame"><div class="screen">{inner}</div></div>'
            f"<figcaption><b>{title}</b><span>{note}</span></figcaption></figure>")


def cam(f, c=""):
    return f'<img class="cam {c}" src="{F}{f}" alt=""><div class="floor"></div>'


figs = [
    fig(cam("f-2.0.jpg") + words(["ahora", "que", "todos", "editan", "con", "IA"]),
        "1 · Tú, a cámara (0–7 s)",
        "Casi todo el reel es esto: tu cara y una palabra a la vez. Adaptación a tu toma: como hay sol y polo blanco, va un degradado sumi suave abajo para que la palabra se lea."),
    fig(cam("f-6.5.jpg", "cut2") + words(["para", "que", "no", "te", "parezcas", "AL RESTO"]),
        "2 · Zoom por corte + palabra que pesa",
        "En cada corte alterna el encuadre normal y uno 12 % más cerca, de golpe. Una sola palabra grande en todo el gancho."),
    fig('<div class="cut"></div><div class="fig" style="top:560px;">' + bars(RICH, "moss")
        + '<div class="sub" style="margin-top:60px;">sound effects</div></div>'
        + words(["que", "son", "los", "sound", "effects", "effects"]),
        "3 · Corte: de qué va (10–13 s)",
        "Pantalla sumi y un solo elemento: la onda del sonido que está sonando en ese momento, en musgo. Se mueve con el audio real."),
    fig(cam("f-15.0.jpg") + '<div class="tagbox"><div class="tag"><i></i>SFX · whoosh</div></div>'
        + words(["como", "los", "whoosh", "como", "las", "transiciones"]),
        "4 · Etiqueta de sonido (13–21 s)",
        "Cuando dices «como los que estás escuchando aquí», suena el efecto y arriba, centrada, aparece qué es. Nada más en pantalla."),
    fig('<div class="cut"></div><div class="win" style="top:400px;"><div class="bar"><i></i><i></i><i></i>&nbsp;el mismo whoosh</div>'
        '<div class="ab" style="--d:.2s"><span><img src="../public/claude.png" alt=""><u style="text-decoration:none;color:var(--arena)">Claude</u>&nbsp;· generado con código</span>' + bars(FLAT, "flat sm") + "</div>"
        '<div class="ab" style="--d:1.6s"><span><img class="el" src="../public/elevenlabs-logo-white.svg" alt="ElevenLabs"></span>' + bars(RICH, "moss sm") + "</div></div>"
        + words(["no", "suenan", "como", "estos", "otros", "otros"]),
        "5 · Antes y después (21–26 s)",
        "Una ventana recta con dos ondas: primero el efecto que Claude genera con código (gris, cuadrado), luego el de ElevenLabs (musgo), cada uno con su logo oficial. Entran uno por uno, cada uno con su sonido."),
    fig('<div class="cut"></div><div class="brand"><img src="../public/elevenlabs-logo-white.svg" alt="ElevenLabs"></div><div class="win" style="top:470px;">'
        '<div class="bar"><i></i><i></i><i></i>&nbsp;POST /v1/sound-generation</div>'
        '<div class="row" style="--d:.2s"><span>text</span><em>"soft paper whoosh"</em></div>'
        '<div class="row" style="--d:.7s"><span>duration</span><span>0.6 s</span></div>'
        '<div class="row" style="--d:1.4s"><span>→ whoosh.mp3</span><em>listo</em></div></div>'
        + words(["la", "API", "de", "Eleven", "Labs", "Labs"]),
        "6 · La herramienta (26–34 s)",
        "La llamada real que usé para generar los sonidos de este mismo video, con el logo oficial de ElevenLabs arriba."),
    fig(cam("f-31.0.jpg") + '<div class="tagbox"><div class="tag"><i></i>Fondo · ambiente</div></div>'
        + words(["y", "también", "sonidos", "de", "fondo", "fondo"]),
        "7 · Sonido de fondo (34–37 s)",
        "Entra una cama de ambiente muy bajita justo cuando la nombras, con su etiqueta. Se queda hasta el final."),
    fig(cam("f-47.0.jpg") + words(["¿Y", "TÚ?", "¿Y", "TÚ?", "cómo", "editas"], "moss big"),
        "8 · Cierre (46–49 s)",
        "Tú haciendo la pregunta. La palabra en musgo, sin tarjeta final ni logo."),
    fig(f'<img class="cam" src="{F}f-47.0.jpg" alt="" style="animation:none"><div class="shade"></div>'
        '<div class="cover-t">Que no suene<br><span class="m">a IA.</span></div><div class="crop"></div>',
        "9 · Portada",
        "Tu cara y dos líneas. La línea punteada es el recorte 3:4 de la cuadrícula."),
]
body = """<main><header><h1>SFX ElevenLabs · mockboard Koan</h1>
<p>Estilo Koan «cercano», en su versión sobria: tu cara manda, una palabra a la vez y solo cuatro gráficos en 49 segundos, cada uno explicando lo que dices en ese momento. Colores: sumi, arena y un solo acento musgo. Sin stickers, sin paneles sobre tu cara, sin rebotes.</p></header>
<div class="grid">""" + "\n".join(figs) + """</div>
<div class="rules">
<div class="card"><h3>Ritmo</h3><ul><li>Cámara ~36 s de 49. Gráficos: 3 cortes a sumi + 2 etiquetas.</li><li>Zoom solo por corte (normal / 12 %), nunca animado.</li><li>Subtítulo: una palabra, arena, sin chip.</li></ul></div>
<div class="card"><h3>Sonido (siguiente paso)</h3><ul><li>Un whoosh suave por corte a sumi, no en cada palabra.</li><li>El antes/después: efecto sintético vs ElevenLabs.</li><li>Ambiente de fondo desde el segundo 34.</li><li>Te paso candidatos A/B/C para elegir.</li></ul></div>
<div class="card"><h3>Lo que adapté a tu toma</h3><ul><li>Degradado sumi abajo: sin él, la palabra arena se pierde en el polo blanco.</li><li>Subtítulo más abajo (y 1405, al borde de la zona segura) para no tapar tus manos.</li><li>Etiquetas en píldora oscura: el fondo es muy claro para texto suelto.</li></ul></div>
</div></main></body></html>"""
open("work/board.html", "w", encoding="utf-8").write(head + body)
print("work/board.html")
