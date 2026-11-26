"""Generate SFX candidates (A/B/C per category) with ElevenLabs and an audition page.

Usage (from the video folder): python3 scripts/sfx_eleven.py [category ...]
Writes work/sfx/<category>-<a|b|c>.mp3 and work/sfx/index.html. Needs ELEVENLABS_API_KEY in the repo .env.
Existing files are kept, so re-running only fills what is missing; delete a file to regenerate it.
"""
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
OUT = Path("work/sfx")
API = "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192"
# v3 follows multi-part prompts better, sounds more natural and clips less on chimes (ElevenLabs docs, 2026-11).
# Prompt it with a physical action, object, setting and performance, not a sound category:
# "a small brass chime brushed once with a fingertip, close microphone, quiet studio" beats "soft sparkle shimmer".
MODEL = "eleven_text_to_sound_v3"
LETTERS = "abcdef"
# Clips of a real Ali Abdaal Short (ref/ali), cut around effects an audio model located: the listening reference.
REFS = [("1.8", "whoosh grave"), ("8.5", "swish suave"), ("46.8", "whoosh de transición"), ("57.4", "swoosh de mensaje"),
        ("68.8", "swish con campanita"), ("14.8", "tres pops de lista"), ("32.1", "clic y tecleo")]

# (seconds, prompt influence, loop, prompt)
CANDIDATES = {
    "whoosh": {
        "title": "Whoosh · desplazamientos",
        "note": "Suena cuando dices «whoosh» y al entrar cada corte a fondo oscuro.",
        "a": (1.0, 0.4, False, "Fast airy cinematic whoosh passing by, smooth air movement, soft natural tail, clean high fidelity sound design, no music"),
        "b": (1.2, 0.4, False, "Deep soft whoosh with a low sub swell, fabric swish through the air, elegant and warm, premium trailer sound design, no music"),
        "c": (0.8, 0.5, False, "Short crisp paper swish whoosh, light and quick, subtle, modern minimal motion graphics sound, no music"),
    },
    "transicion": {
        "title": "Transición",
        "note": "Suena cuando dices «como las transiciones» y al volver de un corte a tu cara.",
        "a": (1.5, 0.4, False, "Smooth cinematic transition riser into a soft impact, airy swell that resolves gently, elegant, high fidelity, no music"),
        "b": (1.2, 0.4, False, "Reverse cymbal swell into a soft muted thud, quick clean scene transition, warm and controlled, no music"),
        "c": (1.0, 0.5, False, "Glassy shimmer sweep transition, delicate high sparkle with soft air, calm and minimal, no music"),
        # Round 2: Ali Abdaal's palette (dry, warm, 250-400 ms, soft attack, far below the voice)
        "d": (0.5, 0.6, False, "Warm low soft whoosh, about 350 milliseconds, soft attack and tapered tail, completely dry, subtle and clean, no reverb, no music"),
        "e": (0.5, 0.6, False, "Quick light air swish like a card sliding into place, about 250 milliseconds, mid frequency, soft attack, short tail, dry, no music"),
        "f": (0.7, 0.6, False, "Soft short swish ending in a gentle bright chime, about 400 milliseconds, crisp but quiet, slight reverb, modern app feel, no music"),
    },
    "clic": {
        "title": "Clic · detalles de interfaz",
        "note": "Suena en cada fila que aparece en la ventana de la API.",
        "a": (0.5, 0.6, False, "Single soft interface click, warm rounded pop, close microphone, satisfying, very clean"),
        "b": (0.5, 0.6, False, "Single mechanical keyboard key press, soft thock, close and dry, high fidelity"),
        "c": (0.6, 0.6, False, "Single gentle wooden tap with tiny bright tick on top, minimal notification, dry and clean"),
        # Round 2: the direction of B (keyboard key), refined
        "d": (0.5, 0.7, False, "Single soft thocky mechanical keyboard key press, lubed linear switch, deep rounded thock, close and dry, premium, high fidelity"),
        "e": (0.5, 0.7, False, "Single keyboard key press and release, soft muted click-clack, dry, close microphone, high fidelity, no room sound"),
        "f": (0.8, 0.7, False, "Three quick soft mechanical keyboard key presses, muted deep thock, dry and close, satisfying typing, high fidelity"),
    },
    # Ali-style detail palette (approved approach 2026-11-26: many varied effects, far below the voice)
    "pop": {
        "title": "Pop", "note": "Palabra grande, pulsos de etiqueta y filas que aparecen.",
        "a": (0.5, 0.7, False, "Single soft bubble pop, mid-bright, about 80 milliseconds, fast attack and tight tail, completely dry, clean modern interface sound"),
    },
    "campanita": {
        "title": "Campanita", "note": "Cuando aparece el nombre de la idea y cuando algo queda «listo».",
        "a": (0.9, 0.6, False, "Subtle soft bright chime, single gentle bell-like note with smooth short tail, slight reverb, calm positive notification, quiet"),
    },
    "ventana": {
        "title": "Swoosh de ventana", "note": "Cuando entra una ventana en los cortes a fondo oscuro.",
        "a": (0.5, 0.6, False, "Short bright message swoosh, about 180 milliseconds, fast attack and short tail, dry, like a chat message being sent, clean"),
    },
    "tecleo": {
        "title": "Tecleo", "note": "Mientras se escribe el texto en la ventana de la API.",
        "a": (0.9, 0.7, False, "Short burst of fast typing on a soft mechanical keyboard, about 700 milliseconds, muted deep thock keys, dry and close, high fidelity"),
    },
    "brillo": {
        "title": "Brillito", "note": "Cuando dices «detalle»: tenue y medido. A era sintético (descartado); B, C y D nombran un instrumento real.",
        "a": (0.9, 0.6, False, "Very subtle soft sparkle shimmer, tiny delicate high glittering twinkle, gentle and short, quiet, clean, slight air, no melody"),
        "b": (1.2, 0.6, False, "A small brass bar chime tree brushed gently once with a fingertip, recorded with a close microphone in a quiet studio, soft and short, natural decay"),
        "c": (1.2, 0.6, False, "A single quiet note on a glockenspiel struck gently with a soft rubber mallet, close microphone in a quiet room, warm and natural decay"),
        "d": (1.2, 0.6, False, "Tiny glass wind chimes touched lightly once, two or three delicate notes, close microphone in a quiet room, natural and gentle"),
    },
    "entrada": {
        "title": "Entrada a pantalla oscura", "note": "Un solo sonido cuando el video corta a la pantalla sin tu cara. Grabaciones de objetos reales, secas.",
        "a": (0.8, 0.6, False, "A large sheet of heavy paper swiped once quickly through the air close to the microphone, soft low whoosh, dry studio recording, no echo"),
        "b": (0.8, 0.6, False, "A thick fabric curtain pulled aside quickly once, soft low airy swish, close microphone, dry room, no echo"),
        "c": (0.8, 0.6, False, "A hand passing once close by a microphone, gentle low air movement, short and soft, dry quiet room"),
    },
    "fondo": {
        "title": "Sonido de fondo",
        "note": "Entra bajito cuando dices «sonidos de fondo» y sigue hasta el final.",
        "a": (20.0, 0.4, True, "Warm calm ambient pad, soft analog synth chords evolving slowly, peaceful and modern, no drums, no vocals"),
        "b": (20.0, 0.4, True, "Mellow lo-fi background loop, soft electric piano chords with gentle vinyl texture and a very quiet slow beat, relaxed, no vocals"),
        "c": (20.0, 0.4, True, "Airy minimal atmosphere, soft felt piano notes with long reverb over a quiet warm drone, calm and spacious, no drums, no vocals"),
    },
}


def api_key():
    for line in open(REPO / ".env"):
        if line.startswith("ELEVENLABS_API_KEY="):
            return line.split("=", 1)[1].strip().strip("\"'")
    raise SystemExit("ELEVENLABS_API_KEY missing in .env")


def generate(job):
    cat, letter, (dur, influence, loop, prompt) = job
    dst = OUT / f"{cat}-{letter}.mp3"
    if dst.exists():
        return f"{dst.name} kept"
    body = {"text": prompt, "duration_seconds": dur, "prompt_influence": influence, "model_id": MODEL, "loop": loop}
    code = subprocess.run(["curl", "-sS", "-m", "180", "-o", str(dst), "-w", "%{http_code}", "-H", f"xi-api-key: {KEY}",
                           "-H", "Content-Type: application/json", "-d", json.dumps(body), API],
                          capture_output=True, text=True).stdout
    if code != "200":
        err = dst.read_text(errors="replace")[:200]
        dst.unlink()
        return f"{dst.name} FAILED {code} {err}"
    return f"{dst.name} ok"


def page():
    rows = []
    for cat, c in CANDIDATES.items():
        cards = "".join(
            f'<div class="card"><b>{letter.upper()}</b><audio controls preload="auto" src="{cat}-{letter}.mp3"'
            f'{" loop" if c[letter][2] else ""}></audio><p>{c[letter][3]}</p></div>'
            for letter in LETTERS if letter in c and (OUT / f"{cat}-{letter}.mp3").exists())
        rows.append(f'<section><h2>{c["title"]}</h2><p class="note">{c["note"]}</p><div class="row">{cards}</div></section>')
    refs = "".join(f'<div class="card"><b style="font-size:17px">{name}</b><audio controls preload="auto" src="ref-ali-{t}.mp3"></audio></div>'
                   for t, name in REFS if (OUT / f"ref-ali-{t}.mp3").exists())
    html = f"""<!doctype html><html lang="es"><meta charset="utf-8"><title>SFX · candidatos ElevenLabs</title>
<style>
body{{margin:0;background:#1A1A18;color:#E4DFD3;font-family:system-ui,sans-serif;padding:44px 28px 80px;max-width:1180px;margin:auto}}
h1{{font-weight:600;letter-spacing:-1px;margin:0 0 6px}} h2{{font-weight:600;margin:44px 0 4px;color:#8FA85A}}
.note,.lead{{color:#8C877C;margin:0 0 16px;line-height:1.5}} .row{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}}
.card{{background:#222220;border-radius:20px;padding:20px;box-shadow:0 0 0 1.5px #2E2E2A}} .card b{{font-size:26px}}
.card p{{color:#8C877C;font-size:13px;line-height:1.45;margin:12px 0 0}} audio{{width:100%;margin-top:12px}}
</style>
<h1>SFX · candidatos ElevenLabs</h1>
<p class="lead">Todos generados con el modelo de efectos de ElevenLabs. Elige una letra por categoría (o dime «ninguno» y pruebo otros). Debajo de cada uno está el prompt exacto que usé.</p>
<section><h2>Referencia · Ali Abdaal (Short real, con su voz)</h2><p class="note">Recortes de 2.6 s alrededor de cada efecto: el efecto cae a los 0.6 s. Son secos, cortos y muy por debajo de la voz.</p><div class="row">{refs}</div></section>
{"".join(rows)}</html>"""
    (OUT / "index.html").write_text(html, encoding="utf-8")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    KEY = api_key()
    cats = sys.argv[1:] or list(CANDIDATES)
    jobs = [(cat, letter, CANDIDATES[cat][letter]) for cat in cats for letter in LETTERS if letter in CANDIDATES[cat]]
    with ThreadPoolExecutor(4) as pool:
        for line in pool.map(generate, jobs):
            print(line)
    page()
    print(OUT / "index.html")
