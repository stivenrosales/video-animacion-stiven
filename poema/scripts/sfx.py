"""Synthesize the ambient pad + SFX bus from timeline.json (no external samples).

Usage: python3 sfx.py ../timeline.json ../work/sfx.wav
"""
import json
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(7)
tl = json.load(open(sys.argv[1]))
N = int(tl["duration"] * SR)
bus = np.zeros((N, 2))


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f):
    return sosfilt(butter(2, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f):
    return sosfilt(butter(2, f, btype="high", fs=SR, output="sos"), x)


def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    bus[i : i + len(sig), 0] += sig * np.sqrt(0.5 * (1 - pan))
    bus[i : i + len(sig), 1] += sig * np.sqrt(0.5 * (1 + pan))


def partials(freqs, amps, decay, dur):
    t = t_axis(dur)
    out = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / (decay * (1 - 0.4 * k / len(freqs))))
              for k, (f, a) in enumerate(zip(freqs, amps)))
    return out * np.minimum(1, t / 0.004)


def chime(p=1.0):
    return partials([1046 * p, 1568 * p, 2093 * p, 3136 * p], [1, 0.5, 0.35, 0.15], 1.4, 3.0)


def bell(p=1.0):
    f = 523 * p
    return partials([f, 2.0 * f, 2.76 * f, 5.4 * f], [1, 0.45, 0.3, 0.12], 2.2, 4.0)


def sparkle():
    out = np.zeros(int(1.2 * SR))
    for k in range(9):
        s = partials([rng.uniform(2500, 6500)], [1], 0.12, 0.4) * rng.uniform(0.4, 1)
        i = int(k * 0.07 * SR + rng.uniform(0, 0.03) * SR)
        out[i : i + len(s)] += s[: len(out) - i]
    return out


def whoosh(dur=0.6):
    t = t_axis(dur)
    n = rng.standard_normal(len(t))
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    lo, mid, hi = bp(n, 150, 600), bp(n, 600, 2000), bp(n, 2000, 6000)
    x = t / dur
    return (lo * (1 - x) + mid * np.sin(np.pi * x) + hi * x * 0.6) * env * 1.6


def comet(dur=1.2):
    t = t_axis(dur)
    base = whoosh(dur) * 0.7
    shimmer = hp(rng.standard_normal(len(t)), 5000) * 0.15 * np.sin(np.pi * t / dur)
    return base + shimmer


def paper():
    t = t_axis(0.45)
    n = bp(rng.standard_normal(len(t)), 1500, 7000)
    return n * (np.abs(np.sin(t * 60)) ** 3) * np.exp(-t * 4) * 0.8


def knock():
    out = np.zeros(int(0.9 * SR))
    for k in range(3):
        t = t_axis(0.25)
        th = np.sin(2 * np.pi * 110 * t * (1 - 0.3 * t)) * np.exp(-t * 28)
        th += lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 60) * 0.5
        i = int(k * 0.2 * SR)
        out[i : i + len(th)] += th
    return out


def heart():
    out = np.zeros(int(0.7 * SR))
    for k, (f, a) in enumerate([(55, 1.0), (48, 0.7)]):
        t = t_axis(0.35)
        s = np.sin(2 * np.pi * f * t) * np.exp(-t * 14) * a
        i = int(k * 0.18 * SR)
        out[i : i + len(s)] += s
    return out * 1.6


def boom():
    t = t_axis(2.2)
    f = 60 * np.exp(-t * 1.2) + 32
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.0)
    s += lp(rng.standard_normal(len(t)), 250) * np.exp(-t * 3) * 0.6
    return s * np.minimum(1, t / 0.01)


def shatter():
    t = t_axis(1.0)
    n = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 9) * 0.8
    return n + np.pad(sparkle(), (0, 0))[: len(t)] * 0.8


def train(dur):
    t = t_axis(dur)
    rumble = lp(np.cumsum(rng.standard_normal(len(t))) * 0.02, 160)
    rumble /= np.max(np.abs(rumble)) + 1e-9
    out = rumble * 0.8
    k = 0.0
    while k < dur - 0.2:
        for off in (0, 0.11):
            c = bp(rng.standard_normal(int(0.05 * SR)), 900, 3200) * np.exp(-t_axis(0.05) * 70)
            i = int((k + off) * SR)
            out[i : i + len(c)] += c * 0.9
        k += 0.42
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.8  # pass-by swell
    return out * env


def tick(dur, rate=1.0):
    out = np.zeros(int(dur * SR))
    step = 0.5 / rate
    k, alt = 0.0, 0
    while k < dur - 0.05:
        f = 2400 if alt % 2 == 0 else 1800
        c = bp(rng.standard_normal(int(0.03 * SR)), f * 0.8, f * 1.2) * np.exp(-t_axis(0.03) * 120)
        i = int(k * SR)
        out[i : i + len(c)] += c
        k += step
        alt += 1
    return out * 1.4


def sand(dur):
    t = t_axis(dur)
    n = hp(rng.standard_normal(len(t)), 4000)
    grain = 0.6 + 0.4 * np.abs(np.sin(t * 37)) * np.abs(np.sin(t * 11))
    return n * grain * np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.5) * 0.35


GEN = {
    "chime": lambda c: chime(c.get("pitch", 1)),
    "bell": lambda c: bell(c.get("pitch", 1)),
    "sparkle": lambda c: sparkle(),
    "whoosh": lambda c: whoosh(c.get("dur", 0.6)),
    "comet": lambda c: comet(c.get("dur", 1.2)),
    "paper": lambda c: paper(),
    "knock": lambda c: knock(),
    "heart": lambda c: heart(),
    "boom": lambda c: boom(),
    "shatter": lambda c: shatter(),
    "train": lambda c: train(c.get("dur", 2.5)),
    "tick": lambda c: tick(c.get("dur", 2), c.get("rate", 1)),
    "sand": lambda c: sand(c.get("dur", 3)),
}

for i, cue in enumerate(tl["sfx"]):
    sig = GEN[cue["type"]](cue)
    sig = sig / (np.max(np.abs(sig)) + 1e-9)
    pan = 0.0 if cue["type"] in ("boom", "heart", "train", "tick") else float(rng.uniform(-0.35, 0.35))
    place(sig, cue["at"], cue["gain"] * 0.5, pan)

# Ambient pad: detuned sines per chord, crossfaded, low-passed, with a slow swell.
t = np.arange(N) / SR
pad = np.zeros((N, 2))
chords = tl["chords"]
for ci, ch in enumerate(chords):
    a = ch["at"]
    b = chords[ci + 1]["at"] if ci + 1 < len(chords) else tl["duration"]
    w = np.clip((t - a + 0.6) / 1.2, 0, 1) * np.clip((b - t + 0.6) / 1.2, 0, 1)
    for note in ch["notes"]:
        f = 440 * 2 ** ((note - 69) / 12)
        for side, det in ((0, 0.997), (1, 1.003)):
            pad[:, side] += w * (np.sin(2 * np.pi * f * det * t) + 0.18 * np.sin(4 * np.pi * f * det * t))
pad[:, 0] = lp(pad[:, 0], 1800)
pad[:, 1] = lp(pad[:, 1], 1800)
swell = 0.75 + 0.25 * np.sin(2 * np.pi * t / 9)
fade = np.clip(t / 2.0, 0, 1) * np.clip((tl["duration"] - t) / 2.5, 0, 1)
pad *= (swell * fade)[:, None]
pad /= np.max(np.abs(pad)) + 1e-9
bus += pad * 0.22

bus /= max(1.0, np.max(np.abs(bus)) / 0.95)
wavfile.write(sys.argv[2], SR, (bus * 32767).astype(np.int16))
print("sfx bus written", bus.shape, f"peak={np.max(np.abs(bus)):.2f}")
