"""Synthesize the sound design for ClaudeGlow from src/timeline.json -> work/sfx-raw.wav.

Usage: python3 scripts/sound.py && ffmpeg ... loudnorm (see README of this folder)
"""
import json
import pathlib

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src/timeline.json").read_text())
SR = 48000
FPS = T["fps"]
DUR = T["duration"] / FPS
rng = np.random.default_rng(7)
out = np.zeros((int(SR * (DUR + 0.01)), 2))


def at(frame):
    return int(frame / FPS * SR)


def t_(sec):
    return np.arange(int(sec * SR)) / SR


def band(x, lo=None, hi=None, order=2):
    if lo and hi:
        sos = butter(order, [lo, hi], "bandpass", fs=SR, output="sos")
    elif lo:
        sos = butter(order, lo, "highpass", fs=SR, output="sos")
    else:
        sos = butter(order, hi, "lowpass", fs=SR, output="sos")
    return sosfilt(sos, x)


def put(sig, frame, gain=1.0, pan=0.0):
    i = at(frame)
    if sig.ndim == 1:
        sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    n = min(len(sig), len(out) - i)
    if n > 0:
        out[i : i + n] += sig[:n] * gain


def sweep_lp(noise, f0, f1, curve):
    """One-pole lowpass whose cutoff moves f0 -> f1 following curve (0..1 array)."""
    y = np.zeros_like(noise)
    fc = f0 * (f1 / f0) ** curve
    a = np.exp(-2 * np.pi * fc / SR)
    acc = 0.0
    for i, v in enumerate(noise):
        acc = (1 - a[i]) * v + a[i] * acc
        y[i] = acc
    return y


def boom(sec=1.6, f0=110, f1=38):
    t = t_(sec)
    ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 9)) / SR
    sub = np.sin(ph) * np.exp(-t * 2.6)
    hit = band(rng.standard_normal(len(t)), hi=900) * np.exp(-t * 28) * 0.8
    return np.tanh(1.6 * (sub + hit)) * 0.9


def shimmer(sec=1.4, base=1200, n=9):
    t = t_(sec)
    s = np.zeros_like(t)
    for k in range(n):
        f = base * (1 + k * 0.37) * rng.uniform(0.98, 1.02)
        d = rng.uniform(0.0, 0.25)
        env = np.clip((t - d) * 40, 0, 1) * np.exp(-np.clip(t - d, 0, None) * rng.uniform(3, 6))
        s += np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * env / n
    air = band(rng.standard_normal(len(t)), 5000, 12000) * np.exp(-t * 4) * np.clip(t * 20, 0, 1) * 0.25
    return s + air


def whoosh(sec=0.6, peak=0.55, hi=5000, lo=300, strength=1.0):
    t = t_(sec)
    x = t / sec
    env = np.where(x < peak, (x / peak) ** 2.2, np.exp(-(x - peak) * 9))
    curve = np.where(x < peak, x / peak, 1 - (x - peak) / (1 - peak))
    n = rng.standard_normal(len(t))
    s = sweep_lp(n, lo, hi, curve) * env
    s = band(s, lo=120)
    left = s * (0.8 + 0.2 * np.sin(x * np.pi))
    right = s * (1.0 - 0.2 * np.sin(x * np.pi))
    return np.stack([left, right], 1) * 1.8 * strength


def key(g=1.0):
    t = t_(0.05)
    click = band(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t * 400)
    body = np.sin(2 * np.pi * rng.uniform(1700, 2600) * t) * np.exp(-t * 160) * 0.35
    thock = np.sin(2 * np.pi * rng.uniform(180, 240) * t) * np.exp(-t * 90) * 0.5
    return (click + body + thock) * g * rng.uniform(0.7, 1.0)


def mouse_click():
    t = t_(0.06)
    a = band(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t * 600)
    s = a.copy()
    d = int(0.012 * SR)
    s[d:] += a[:-d] * 0.6
    return s + np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 250) * 0.3


def riser(sec):
    t = t_(sec)
    x = t / sec
    n = rng.standard_normal(len(t))
    s = sweep_lp(n, 400, 9000, x ** 1.5) * (x ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(220 + 440 * x ** 2) / SR) * (x ** 2) * 0.15
    return band(s, lo=200) * 0.9 + tone


def impact(scale=1.0):
    b = boom(1.4, 140, 45) * 0.8
    t = t_(1.4)
    crack = band(rng.standard_normal(len(t)), 1500, 10000) * np.exp(-t * 35) * 0.5
    return (b + crack) * scale


def pad():
    t = t_(DUR + 0.01)
    s = np.zeros_like(t)
    for f, g in [(55, 0.5), (82.4, 0.35), (110, 0.3), (164.8, 0.12), (220, 0.08)]:
        lfo = 1 + 0.003 * np.sin(2 * np.pi * 0.3 * t + f)
        s += g * np.sin(2 * np.pi * f * np.cumsum(lfo) / SR)
    s = band(s, hi=900)
    env = np.clip(t / 1.2, 0, 1) * (0.55 + 0.45 * np.clip((t - T["word1"] / FPS) * 3, 0, 1))
    env *= np.clip((DUR - t) / 0.35, 0, 1)
    return s * env * 0.12


# ---- cue sheet ----
put(pad(), 0)
put(boom(), T["ignite"], 0.9)
put(shimmer(1.6, 1300), T["ignite"] + 2, 0.18)
put(shimmer(1.2, 1500), T["claude"], 0.28)
put(whoosh(0.5, 0.6, 3500, 300, 0.5), T["greet"] - 6, 0.6)
put(whoosh(0.55, 0.6, 3000, 250, 0.6), T["box"] - 6, 0.6)
put(whoosh(0.5, 0.65, 6000, 300, 0.9), T["typeStart"] - 22, 0.7)

n = len(T["prompt"])
for i in range(n):
    fr = T["typeStart"] + i * (T["typeEnd"] - T["typeStart"]) / n
    if T["prompt"][i] != " ":
        put(key(), fr, 0.32, pan=rng.uniform(-0.2, 0.2))
    else:
        put(key(1.4), fr, 0.32)

put(whoosh(0.35, 0.7, 7000, 400, 1.0), T["click"] - 18, 0.75)
put(mouse_click(), T["click"], 0.7)
put(shimmer(0.9, 2000, 6), T["click"] + 1, 0.22)
put(whoosh(0.45, 0.45, 8000, 300, 1.3), T["whip"] - 6, 0.95)

for i in range(16):
    put(key(0.7), T["code"] + i * 2.4, 0.18, pan=rng.uniform(-0.3, 0.3))
    put(key(0.5), T["code"] + i * 2.4 + 4, 0.14, pan=rng.uniform(-0.3, 0.3))
put(riser((T["word1"] - T["code"]) / FPS), T["code"], 0.32)

put(impact(1.0), T["word1"], 0.85)
put(whoosh(0.3, 0.7, 5000, 300, 0.8), T["word2"] - 14, 0.6)
put(impact(0.65), T["word2"], 0.7)
put(boom(1.8, 120, 36), T["spark"], 1.0)
put(shimmer(1.8, 1100, 12), T["spark"], 0.35)

# small room reverb on everything but the pad's low end
ir_t = t_(1.1)
ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t * 5.5)[:, None]
ir[:, 0] = band(ir[:, 0], hi=6000)
ir[:, 1] = band(ir[:, 1], hi=6000)
wet = np.stack([fftconvolve(out[:, c], ir[:, c])[: len(out)] for c in range(2)], 1)
mix = out + wet * 0.035
mix *= np.clip((DUR - np.arange(len(mix)) / SR) / 0.3, 0, 1)[:, None]
mix /= np.abs(mix).max() * 1.12

(ROOT / "work").mkdir(exist_ok=True)
wavfile.write(ROOT / "work/sfx-raw.wav", SR, mix.astype(np.float32))
print("wrote work/sfx-raw.wav", round(len(mix) / SR, 3), "s")
