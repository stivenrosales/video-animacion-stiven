"""Synthesize SFX candidates (3 variants per category) and an audition page.

Usage: python3 sfx_samples.py OUT_DIR
Writes OUT_DIR/<id>.wav for every candidate and OUT_DIR/index.html to listen and pick.
"""
import base64
import io
import sys
import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def pink(n):
    # Voss-McCartney approximation via 1/f filtering of white noise.
    white = RNG.standard_normal(n)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, white)


def band(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lowpass(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, fs=SR, output="sos"), x)


def highpass(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def swept_band(x, f0, f1, q=1.4, curve=1.0):
    """Band-pass with a cutoff that glides from f0 to f1 (processed in short blocks)."""
    out = np.zeros_like(x)
    block = 256
    n = len(x)
    zi = None
    for i in range(0, n, block):
        p = (i / n) ** curve
        fc = f0 * (f1 / f0) ** p
        bw = fc / q
        sos = signal.butter(2, [max(30, fc - bw / 2), min(SR / 2 - 100, fc + bw / 2)], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    return out


def env_ad(n, attack, decay_tau):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = np.exp(-np.clip(t - attack, 0, None) / decay_tau)
    return a * d


def bell_env(n, peak=0.55):
    x = np.linspace(0, 1, n)
    up = np.clip(x / peak, 0, 1) ** 2
    down = np.clip((1 - x) / (1 - peak), 0, 1) ** 1.6
    return np.minimum(up, down) * np.sin(np.pi * np.clip(x, 0, 1)) ** 0.3


def glide_sine(dur, f0, f1, tau, curve=0.35):
    t = t_axis(dur)
    f = f1 + (f0 - f1) * np.exp(-t / (dur * curve))
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * np.exp(-t / tau)


def modal(dur, f, partials, taus, gains):
    t = t_axis(dur)
    y = np.zeros_like(t)
    for p, tau, g in zip(partials, taus, gains):
        y += g * np.sin(2 * np.pi * f * p * t) * np.exp(-t / tau)
    return y


def room(x, wet=0.15, size=0.72):
    """Small Schroeder reverb so tails sound produced instead of dry."""
    pad = np.concatenate([x, np.zeros(int(SR * 0.45))])
    y = np.zeros_like(pad)
    for d_ms, g in [(29.7, size), (37.1, size - 0.02), (41.1, size - 0.04), (43.7, size - 0.06)]:
        d = int(SR * d_ms / 1000)
        b = np.zeros(d + 1); b[0] = 1
        a = np.zeros(d + 1); a[0] = 1; a[d] = -g
        y += signal.lfilter(b, a, pad)
    for d_ms, g in [(5.0, 0.7), (1.7, 0.7)]:
        d = int(SR * d_ms / 1000)
        b = np.zeros(d + 1); b[0] = -g; b[d] = 1
        a = np.zeros(d + 1); a[0] = 1; a[d] = -g
        y = signal.lfilter(b, a, y)
    y = lowpass(y, 6000)
    return (1 - wet) * pad + wet * y / 4


def finish(x, peak_db=-6.0, fade_ms=6):
    x = x - np.mean(x)
    n = int(SR * fade_ms / 1000)
    if len(x) > 2 * n:
        x[-n:] *= np.linspace(1, 0, n)
        x[:8] *= np.linspace(0, 1, 8)
    # Trim trailing near-silence.
    idx = np.where(np.abs(x) > np.max(np.abs(x)) * 0.002)[0]
    x = x[: idx[-1] + int(SR * 0.02)] if len(idx) else x
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)


# ---------- candidates ----------

def whoosh_air():
    n = int(SR * 0.42)
    x = swept_band(pink(n), 500, 2400, q=1.2, curve=0.8) * bell_env(n, 0.6)
    return finish(lowpass(x, 7000), -8)


def whoosh_warm():
    n = int(SR * 0.5)
    x = pink(n)
    x = swept_band(x, 260, 900, q=0.9, curve=0.6) * bell_env(n, 0.5)
    return finish(lowpass(x, 2500), -8)


def whoosh_glass():
    n = int(SR * 0.46)
    x = swept_band(pink(n), 700, 3200, q=1.6, curve=0.9) * bell_env(n, 0.62)
    t = t_axis(0.46)
    shimmer = np.sin(2 * np.pi * 2637 * t) * (1 + 0.3 * np.sin(2 * np.pi * 11 * t)) * bell_env(n, 0.7) * 0.05
    return finish(room(lowpass(x, 8000) * 0.9 + shimmer, 0.2), -8)


def pop_soft():
    y = glide_sine(0.16, 720, 380, 0.035, 0.25)
    click = highpass(RNG.standard_normal(len(y)), 2000) * env_ad(len(y), 0.0005, 0.0015) * 0.08
    return finish(room(lowpass(y + click, 5000), 0.12), -6)


def pop_bubble():
    y = glide_sine(0.14, 520, 1250, 0.04, 0.3)
    return finish(room(lowpass(y, 6000), 0.12), -6)


def pop_wood():
    y = modal(0.14, 1150, [1, 2.46, 3.98], [0.03, 0.012, 0.006], [1, 0.35, 0.18])
    return finish(room(y, 0.1), -6)


def click_trackpad():
    n = int(SR * 0.12)
    y = np.zeros(n)
    for at, g in [(0.0, 1.0), (0.068, 0.45)]:
        i = int(SR * at)
        m = int(SR * 0.012)
        burst = band(RNG.standard_normal(m), 1400, 4200) * env_ad(m, 0.0003, 0.0018)
        body = np.sin(2 * np.pi * 520 * np.arange(m) / SR) * env_ad(m, 0.0003, 0.003) * 0.4
        y[i:i + m] += g * (burst + body)
    return finish(y, -5)


def click_tick():
    m = int(SR * 0.05)
    y = np.sin(2 * np.pi * 3800 * np.arange(m) / SR) * env_ad(m, 0.0002, 0.004)
    y += highpass(RNG.standard_normal(m), 3000) * env_ad(m, 0.0001, 0.0008) * 0.3
    return finish(y, -7)


def click_thock():
    m = int(SR * 0.09)
    t = np.arange(m) / SR
    y = np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.018)
    y += band(RNG.standard_normal(m), 1200, 3000) * env_ad(m, 0.0002, 0.003) * 0.5
    return finish(lowpass(y, 4500), -5)


def keys(style):
    times = np.cumsum([0.0, 0.085, 0.07, 0.105, 0.078, 0.092, 0.074])
    n = int(SR * (times[-1] + 0.12))
    y = np.zeros(n)
    for k, at in enumerate(times):
        i = int(SR * at)
        g = 10 ** (RNG.uniform(-2.5, 0) / 20)
        m = int(SR * 0.03)
        lo, hi = (1800, 5200) if style != "soft" else (900, 2600)
        burst = band(RNG.standard_normal(m), lo * RNG.uniform(0.9, 1.1), hi) * env_ad(m, 0.0003, 0.0022 if style != "soft" else 0.003)
        thump = np.sin(2 * np.pi * RNG.uniform(260, 340) * np.arange(m) / SR) * env_ad(m, 0.0004, 0.004) * 0.35
        y[i:i + m] += g * (burst + thump)
        if style == "mech":
            j = i + int(SR * 0.032)
            if j + m < n:
                y[j:j + m] += g * 0.4 * band(RNG.standard_normal(m), 2500, 7000) * env_ad(m, 0.0002, 0.0012)
    return finish(y, -8)


def check_up():
    a = modal(0.12, 1175, [1, 3], [0.045, 0.01], [1, 0.12])
    b = modal(0.22, 1568, [1, 3], [0.07, 0.012], [1, 0.12])
    y = np.zeros(int(SR * 0.3))
    y[: len(a)] += a
    i = int(SR * 0.055)
    y[i:i + len(b)] += b[: len(y) - i]
    return finish(room(y, 0.15), -8)


def check_drop():
    y = glide_sine(0.25, 1300, 1680, 0.07, 0.15)
    y += modal(0.25, 1680, [4.0], [0.01], [0.15])
    return finish(room(y, 0.15), -8)


def check_glass():
    y = modal(0.5, 2093, [1, 2.76, 5.4], [0.16, 0.05, 0.02], [1, 0.25, 0.08])
    return finish(room(y, 0.2), -10)


def success_marimba():
    def mar(f):
        return modal(0.7, f, [1, 3.93, 9.2], [0.22, 0.05, 0.015], [1, 0.3, 0.08])
    a, b = mar(659.3), mar(987.8)
    y = np.zeros(int(SR * 0.9))
    y[: len(a)] += a * 0.85
    i = int(SR * 0.12)
    y[i:i + len(b)] += b[: len(y) - i]
    return finish(room(y, 0.18), -6)


def success_bell():
    y = np.zeros(int(SR * 1.2))
    for k, f in enumerate([1046.5, 1318.5, 1568.0]):
        s = modal(1.0, f, [1, 2.0, 3.01], [0.35, 0.12, 0.05], [1, 0.2, 0.08])
        i = int(SR * 0.065 * k)
        y[i:i + len(s)] += s[: len(y) - i] * (0.8 + 0.1 * k)
    return finish(room(y, 0.22), -7)


def success_pluck():
    def ks(f, dur=0.9):
        n = int(SR * dur)
        p = int(SR / f)
        buf = RNG.uniform(-1, 1, p)
        out = np.zeros(n)
        for i in range(n):
            out[i] = buf[i % p]
            buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
        return lowpass(out, 3500) * np.exp(-np.arange(n) / SR / 0.5)
    a, b = ks(392.0), ks(587.3)
    y = np.zeros(int(SR * 1.1))
    y[: len(a)] += a * 0.8
    i = int(SR * 0.11)
    y[i:i + len(b)] += b[: len(y) - i]
    return finish(room(y, 0.18), -6)


def lapse_ticks():
    n = int(SR * 1.5)
    y = np.zeros(n)
    at, gap = 0.0, 0.18
    while at < 1.45:
        i = int(SR * at)
        m = int(SR * 0.02)
        s = modal(0.02, 2400, [1, 2.7], [0.003, 0.0015], [1, 0.3])
        y[i:i + m] += s[: max(0, min(m, n - i))] * (0.6 + 0.4 * at / 1.5)
        at += gap
        gap = max(0.028, gap * 0.86)
    return finish(y, -9)


def lapse_riser():
    n = int(SR * 1.5)
    x = swept_band(pink(n), 350, 3200, q=1.1, curve=1.2)
    e = np.clip(np.linspace(0, 1, n) ** 1.8, 0, 1)
    e[-int(SR * 0.06):] *= np.linspace(1, 0, int(SR * 0.06))
    return finish(lowpass(x * e, 7000), -9)


def lapse_tonal():
    t = t_axis(1.5)
    f = 300 * (3.0 ** (t / 1.5))
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.004 * np.sin(2 * np.pi * 5 * t))) / SR
    y = (np.sin(ph) + 0.35 * np.sin(2 * ph)) * np.clip(t / 1.2, 0, 1) ** 1.5
    y[-int(SR * 0.08):] *= np.linspace(1, 0, int(SR * 0.08))
    n = swept_band(pink(len(t)), 500, 2500, curve=1.2) * np.clip(t / 1.4, 0, 1) ** 2 * 0.4
    return finish(room(lowpass(y * 0.25 + n, 5000), 0.15), -9)


CATEGORIES = [
    ("transicion", "Transición de modo", "Cuando cambias entre CÁMARA, PANEL y ANIMACIÓN (11 veces en el video).", [
        ("A", "Aire suave", whoosh_air), ("B", "Swoosh cálido", whoosh_warm), ("C", "Cristal", whoosh_glass)]),
    ("aparicion", "Aparición", "Cuando entra un elemento clave: el flyer, los logos, la tarjeta de Vorssaint.", [
        ("A", "Pop suave", pop_soft), ("B", "Burbuja", pop_bubble), ("C", "Madera", pop_wood)]),
    ("clic", "Clic", "El clic en el switch de Vorssaint (46 s) y en «Correr workflow» (68 s).", [
        ("A", "Trackpad", click_trackpad), ("B", "Tick fino", click_tick), ("C", "Thock", click_thock)]),
    ("tecleo", "Tecleo", "Cuando se escribe el plan.md y los indicadores.", [
        ("A", "Laptop", lambda: keys("laptop")), ("B", "Suave", lambda: keys("soft")), ("C", "Mecánico ligero", lambda: keys("mech"))]),
    ("check", "Check ✓", "Cuando se marca un paso del checklist o un indicador.", [
        ("A", "Tick ascendente", check_up), ("B", "Gota", check_drop), ("C", "Cristal", check_glass)]),
    ("exito", "Éxito", "Cuando el workflow termina: «tu trabajo está terminado» (72 s).", [
        ("A", "Marimba", success_marimba), ("B", "Campana", success_bell), ("C", "Pluck cálido", success_pluck)]),
    ("timelapse", "Timelapse 8 h", "Mientras el reloj corre las 8 horas (70–72 s).", [
        ("A", "Tic-tac que acelera", lapse_ticks), ("B", "Riser de aire", lapse_riser), ("C", "Riser tonal", lapse_tonal)]),
]


def level_match(x, rms_db=-24.0, ceiling_db=-3.0):
    """Audition at similar loudness so the choice is about character, not volume."""
    rms = np.sqrt(np.mean(x ** 2)) + 1e-12
    g = 10 ** (rms_db / 20) / rms
    g = min(g, 10 ** (ceiling_db / 20) / (np.max(np.abs(x)) + 1e-12))
    return x * g


def to_wav_bytes(x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)
    return buf.getvalue()


PAGE = """<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Muestras de sonido</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--bg:#FAF9F5;--card:#fff;--ink:#141413;--muted:#6B6A65;--line:#E9E6DC;--clay:#D97757;--chip:#EFEEEA}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 Inter,system-ui,-apple-system,sans-serif}
main{max-width:860px;margin:0 auto;padding:40px 16px 80px}
h1{font:500 40px/1.15 "Source Serif 4",Georgia,serif;margin:0 0 6px}h1 span{color:var(--clay)}
p.lead{color:var(--muted);margin:0 0 28px}
section{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:20px 22px;margin:0 0 16px;box-shadow:0 4px 24px rgba(20,20,19,.04)}
h2{font:500 24px/1.2 "Source Serif 4",Georgia,serif;margin:0}small{display:block;color:var(--muted);margin:4px 0 14px}
.row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
button{all:unset;cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;background:var(--bg);border:1px solid var(--line)}
button:hover{background:#F3F1EA}button.on{border-color:var(--clay);background:#FBF1EC}
.k{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--chip);font-weight:600}
button.on .k{background:var(--clay);color:#fff}
.all{margin:0 0 24px}.all button{display:inline-flex}
@media(max-width:560px){.row{grid-template-columns:1fr}}
</style></head><body><main>
<h1>Muestras de <span>sonido</span></h1>
<p class="lead">Toca cada opción y dime una letra por categoría (por ejemplo: Transición A, Aparición C…). En el video van a sonar mucho más bajo que aquí, por debajo de tu voz.</p>
__SECTIONS__
</main><script>
let cur=null;document.querySelectorAll('button[data-src]').forEach(b=>b.onclick=()=>{if(cur)cur.pause();
document.querySelectorAll('button.on').forEach(x=>x.classList.remove('on'));b.classList.add('on');cur=new Audio(b.dataset.src);cur.play()});
</script></body></html>"""


def main():
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    sections = []
    for cid, title, desc, variants in CATEGORIES:
        buttons = []
        for letter, name, fn in variants:
            data = to_wav_bytes(level_match(fn()))
            (out / f"{cid}-{letter}.wav").write_bytes(data)
            uri = "data:audio/wav;base64," + base64.b64encode(data).decode()
            buttons.append(f'<button data-src="{uri}"><span class="k">{letter}</span>{name}</button>')
        sections.append(f"<section><h2>{title}</h2><small>{desc}</small><div class=\"row\">{''.join(buttons)}</div></section>")
    (out / "index.html").write_text(PAGE.replace("__SECTIONS__", "\n".join(sections)))
    print(f"wrote {sum(len(c[3]) for c in CATEGORIES)} samples to {out}")


if __name__ == "__main__":
    main()
