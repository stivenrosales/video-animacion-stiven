"""Hand-drawn icon options with Kie.ai GPT Image 2.6 (text to image): several line styles x subjects.

Usage: python3 scripts/kie_icons.py [--styles a,b] [--subjects altavoz,destello]
Writes work/icons/<style>-<subject>.png (black line on white); scripts/ink_mask.py-style masking is done in the board.
Reads KIE_API_KEY from the environment or ~/cartas-sofia/.env.
"""
import argparse
import json
import os
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.kie.ai/api/v1/jobs"
MODEL = "gpt-image-2-6/flare-text-to-image"
COMMON = ("A single small icon, black line drawing on a pure white background, centered with generous empty margin. "
          "Outline only, no fill, no shading, no color, no gray, no text, no letters, no frame, no shadow. Simple and calm.")
STYLES = {
    "a": ("Rotulador", "Drawn by hand with a thick black felt-tip marker: one bold rounded line of even weight, slightly wobbly, friendly doodle."),
    "b": ("Lapicero fino", "Drawn by hand with a fine black ballpoint pen: thin loose sketchy line with a few overlapping double strokes, like a quick notebook sketch."),
    "c": ("Lápiz", "Drawn by hand with a soft dark pencil: medium line with visible grainy graphite texture and uneven pressure, like a sketchbook drawing."),
    "d": ("Trazo limpio", "Drawn by hand as a clean monoline whiteboard sketch: medium even stroke, simple geometric shapes with slightly imperfect hand-drawn corners."),
}
SUBJECTS = {
    "taco": "Subject: one single Mexican taco seen from the side: a folded curved tortilla shell with a little lettuce and filling peeking out of the top. Very simple.",
    "laptop": "Subject: a simple open laptop computer seen from the front, slightly from above, empty screen.",
    "reloj": "Subject: a simple round wall clock with two hands, no numbers.",
    "cadena": "Subject: two oval chain links side by side that have just come apart, with a small gap between them and two tiny dash marks at the break.",
    "nota": "Subject: a small square sticky note with one corner slightly curled, with a simple check mark drawn on it. Very simple.",
    "luna": "Subject: a simple crescent moon with two tiny stars next to it.",
}


def api_key():
    key = os.environ.get("KIE_API_KEY", "")
    if not key:
        for line in (Path.home() / "cartas-sofia" / ".env").read_text().splitlines():
            k, _, v = line.partition("=")
            if k.strip() == "KIE_API_KEY":
                key = v.strip().strip('"')
    return key


def call(url, key, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json",
                                          "User-Agent": "video-tools/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--styles", default=",".join(STYLES))
    ap.add_argument("--subjects", default="taco,laptop,reloj,luna")
    args = ap.parse_args()
    key = api_key()
    out = ROOT / "work" / "icons"
    out.mkdir(parents=True, exist_ok=True)
    tasks = {}
    for st in args.styles.split(","):
        for sub in args.subjects.split(","):
            dst = out / f"{st}-{sub}.png"
            if dst.exists():
                continue
            res = call(f"{API}/createTask", key, {"model": MODEL, "input": {
                "prompt": f"{COMMON}\n\n{STYLES[st][1]}\n\n{SUBJECTS[sub]}", "aspect_ratio": "1:1", "resolution": "1K"}})
            tid = (res.get("data") or {}).get("taskId")
            print(dst.name, "task" if tid else f"FAILED {res}", flush=True)
            if tid:
                tasks[dst] = tid
    start, credits = time.time(), 0
    while tasks and time.time() - start < 900:
        time.sleep(8)
        for dst, tid in list(tasks.items()):
            data = call(f"{API}/recordInfo?taskId={tid}", key).get("data") or {}
            if data.get("state") not in ("success", "fail"):
                continue
            if data["state"] == "success":
                urllib.request.urlretrieve(json.loads(data["resultJson"])["resultUrls"][0], dst)
                credits += data.get("creditsConsumed") or 0
                print(dst.name, "ok", data.get("creditsConsumed"), flush=True)
            else:
                print(dst.name, "fail", data.get("failMsg"), flush=True)
            del tasks[dst]
    print("credits", credits)


if __name__ == "__main__":
    main()
