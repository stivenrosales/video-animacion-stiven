"""Example web designs with Kie.ai GPT Image 2.6 (text to image), shown in the reel as "ejemplo" (never as client work).

Usage: python3 scripts/kie_examples.py   → work/examples/<id>.png (3:2). No real brand names, no people.
Reads KIE_API_KEY from the environment or ~/cartas-sofia/.env.
"""
import json
import os
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.kie.ai/api/v1/jobs"
MODEL = "gpt-image-2-6/flare-text-to-image"
COMMON = ("A flat, front-facing screenshot of the hero section of a website landing page for a small handmade ceramics studio, "
          "filling the whole image edge to edge. No device frame, no browser window, no perspective, no hands, no people. "
          "A top navigation bar with the words: Inicio, Piezas, Taller, Contacto. The main headline reads exactly: \"Cerámica hecha a mano\". "
          "One short line of smaller text under it and one call-to-action button that reads \"Ver piezas\". No logo, no brand name, "
          "no other text. Professional, polished web design with a clear visual identity.")
SUBJECTS = {
    "web-1": "Art direction: warm editorial. Cream paper background, large elegant serif headline in dark brown, generous white space, "
             "a studio photograph of three matte clay vases in terracotta and sand tones on the right, thin hairlines, muted earthy palette.",
    "web-2": "Art direction: bold dark. Near-black background, huge condensed sans-serif headline in off-white, one vivid cobalt blue accent color, "
             "a dramatic spot-lit photograph of a single glossy blue glazed bowl, strong grid, high contrast, modern and confident.",
    "web-3": "Art direction: playful and colorful. Soft pastel peach background with rounded organic blobs in mint, mustard and lilac, a friendly rounded "
             "sans-serif headline, a flat hand-drawn illustration of colorful mugs and plates instead of a photo, rounded pill button, cheerful.",
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
    key = api_key()
    out = ROOT / "work" / "examples"
    out.mkdir(parents=True, exist_ok=True)
    tasks = {}
    for sub, direction in SUBJECTS.items():
        dst = out / f"{sub}.png"
        if dst.exists():
            continue
        res = call(f"{API}/createTask", key, {"model": MODEL, "input": {
            "prompt": f"{COMMON}\n\n{direction}", "aspect_ratio": "3:2", "resolution": "1K"}})
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
