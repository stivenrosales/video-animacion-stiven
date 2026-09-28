"""Build the fine-cut plan, render the edited video and remap word captions."""
import json
import re
import subprocess
import sys

SRC = sys.argv[1]
OUT_VIDEO = sys.argv[2]
OUT_CAPTIONS = sys.argv[3]

START, END = 15.30, 108.90  # keep the last clean take of the hook (third one)
LAST_WORD_END = 108.40  # "empresa?" ends here; the breath after it stays uncut
PAD = 0.07  # breathing room kept on each side of a silence
MANUAL_CUTS = [(19.50, 20.80)]  # filler: "Bueno, decía,"

silences = []
log = subprocess.run(
    ["ffmpeg", "-v", "info", "-i", "audio.wav", "-af",
     "silencedetect=noise=-34dB:d=0.22", "-f", "null", "-"],
    capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
for s, e in zip(starts, ends):
    if e - s > 2 * PAD + 0.05:
        silences.append((s + PAD, e - PAD))

cuts = sorted(silences + MANUAL_CUTS)
merged = []
for s, e in cuts:
    if merged and s <= merged[-1][1]:
        merged[-1] = (merged[-1][0], max(merged[-1][1], e))
    else:
        merged.append((s, e))

keeps, cursor = [], START
for s, e in merged:
    if s >= LAST_WORD_END:  # trailing silences stay: the ending needs a breath, and past END they would swallow the final keep
        break
    if s > cursor:
        keeps.append((cursor, s))
    cursor = max(cursor, e)
if cursor < END:
    keeps.append((cursor, END))
keeps = [(a, b) for a, b in keeps if b - a > 0.08]


def remap(t):
    acc = 0.0
    for a, b in keeps:
        if a <= t <= b:
            return acc + (t - a)
        acc += b - a
    return None


# Words from whisper tokens (subword tokens without leading space are glued).
data = json.load(open("words.json"))
words = []
for seg in data["transcription"]:
    for tok in seg["tokens"]:
        text = tok["text"]
        if text.startswith("[_") or not text.strip():
            continue
        t0, t1 = tok["offsets"]["from"] / 1000, tok["offsets"]["to"] / 1000
        if text.startswith(" ") or not words or text.strip() in ",.":
            if text.strip() in ",." and words:
                words[-1]["text"] += text.strip()
                continue
            words.append({"text": text.strip(), "start": t0, "end": t1})
        else:
            words[-1]["text"] += text
            words[-1]["end"] = t1

FIX = {"Jeff": "Jev", "clod": "Claude", "chatGPT,": "ChatGPT,", "vapi": "Vapi",
       "lm": "LLM", "chatbots": "chatbots"}
fixed = []
for w in words:
    w["text"] = FIX.get(w["text"], w["text"])
    if w["text"] == "m" and fixed and fixed[-1]["text"] == "l":
        fixed[-1]["text"] = "LLM"
        fixed[-1]["end"] = w["end"]
        continue
    fixed.append(w)

# Drop words inside manual cuts, remap the rest.
captions = []
for w in fixed:
    mid = (w["start"] + w["end"]) / 2
    if any(a <= mid <= b for a, b in MANUAL_CUTS):
        continue
    s = remap(w["start"]) or remap(w["start"] + 0.08)
    e = remap(w["end"]) or remap(w["end"] - 0.08)
    if s is None:
        continue
    if e is None or e <= s:
        e = s + 0.2
    captions.append({"text": " " + w["text"], "startMs": round(s * 1000),
                     "endMs": round(e * 1000), "timestampMs": round(s * 1000),
                     "confidence": None})
# Keep monotonic
for i in range(1, len(captions)):
    if captions[i]["startMs"] < captions[i - 1]["startMs"]:
        captions[i]["startMs"] = captions[i - 1]["startMs"]
json.dump(captions, open(OUT_CAPTIONS, "w"), ensure_ascii=False, indent=1)

acc, bounds = 0.0, []
for a, b in keeps:
    acc += b - a
    bounds.append(round(acc, 3))
json.dump(bounds[:-1], open("cuts.json", "w"))
if "--plan" in sys.argv:
    sys.exit(0)
total = sum(b - a for a, b in keeps)
print(f"segments={len(keeps)} duration={total:.2f}s (from {END-START:.2f}s)")
for c in captions:
    print(f'{c["startMs"]/1000:6.2f} {c["text"]}')

parts, labels = [], []
F = 0.012
for i, (a, b) in enumerate(keeps):
    d = b - a
    parts.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{i}]")
    parts.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,"
                 f"afade=t=in:d={F},afade=t=out:st={d-F:.3f}:d={F}[a{i}]")
    labels.append(f"[v{i}][a{i}]")
parts.append("".join(labels) + f"concat=n={len(keeps)}:v=1:a=1[vc][ac]")
parts.append("[vc]scale=1440:2560,fps=30,format=yuv420p[vo]")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", SRC, "-filter_complex",
                ";".join(parts), "-map", "[vo]", "-map", "[ac]", "-c:v", "libx264",
                "-crf", "12", "-preset", "fast", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-c:a", "aac", "-b:a", "192k",
                OUT_VIDEO], check=True)
