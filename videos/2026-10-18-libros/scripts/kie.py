"""Generate B-roll stills with Kie.ai GPT Image 2.5 (image-to-image, the real cover as reference).

Usage: python3 scripts/kie.py [--only git,ai] [--model flare|sunburst] [--resolution 2K]
Reads KIE_API_KEY from the environment or ~/cartas-sofia/.env. Outputs to public/broll/<id>.png.
"""
import argparse
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.kie.ai/api/v1/jobs"
UPLOAD_URLS = ["https://kieai.redpandaai.co/api/file-stream-upload", "https://api.kie.ai/api/file-stream-upload"]
MODELS = {"flare": "gpt-image-2-5-flare-image-to-image", "sunburst": "gpt-image-2-5-sunburst-image-to-image"}

STYLE = (
    "Cinematic editorial B-roll still for a vertical social video, in the style of a high-end motion-design reel: "
    "soft cinematic lighting, gentle depth of field, subtle film grain, soft bloom, warm peach and coral accents, "
    "clean composition with breathing room. No people, no hands, no text, no letters, no logos, no watermarks."
)
REFERENCE_NOTE = (
    "The attached image is a reference (a book cover or a previous still of this series). Use it ONLY for the world, "
    "palette and rendering style; do not reproduce it, its typography or its layout."
)
SHOTS = {
    "ai": ("aieng-cover.jpg",
           "The tawny owl from the cover, rendered as a detailed lifelike creature, perches on a mossy branch at dusk. "
           "Around it float thin glowing coral threads that connect small luminous nodes, like a neural network woven "
           "through the forest air. Peach and lavender sky, volumetric haze."),
    "grokking": ("grokking-ai-cover.png",
                 "The world of the cover drawn in the same black ink cross-hatched illustration style: the rabbit and "
                 "fox characters stand around a giant hand-drawn maze on a paper floor, one rabbit pointing at the "
                 "shortest path, which is highlighted in a single coral line. Black ink on off-white paper, only coral "
                 "as accent, looks like a page from an illustrated storybook."),
    "rails": ("@git-flare.png",
              "Miniature paper-craft railway tracks across a soft rolling paper landscape; the main track splits into "
              "several branches that later merge back into one, like a version-control graph seen from above at a low "
              "angle. Tiny glowing coral lanterns mark every junction. Golden hour, soft clouds, painterly 3D."),
    "boats": ("@git-flare.png",
              "Several small origami paper boats sail side by side down separate streams that merge into one wide calm "
              "river, travelling together toward the sunset. Teamwork mood, golden hour, painterly cinematic 3D."),
    "llm": ("@ai-flare.png",
            "A huge soft cloud made of glowing coral threads and luminous nodes floats in a dusk sky; thin glowing "
            "cables descend from it to a row of small floating blank glass app windows above a calm landscape. "
            "Feels like a giant language model powering apps. Peach and lavender sky."),
    "fast": ("@git-flare.png",
             "A paper-craft landscape of hills, trees and tiny houses rushing past at high speed with strong horizontal "
             "motion-blur streaks, as seen from the window of a fast train, with long coral light trails. Energetic."),
    "python": ("python-cover.jpg",
               "A friendly cartoon python snake made of layered cut paper, coiled calmly around a small stack of "
               "books on a desk, smiling, in the yellow and blue palette of the cover. Soft studio light, cozy."),
    "arcade": ("python-cover.jpg",
               "A small retro arcade cabinet built from paper and cardboard cutouts on a desk; its screen glows with a "
               "simple pixel-art game (little aliens and a ship) in the yellow and blue palette of the cover. Playful."),
    "git": ("git-cover.jpg",
            "A giant ancient tree on a gentle hill whose branches split and merge again like version-control branches; "
            "small glowing coral orbs sit where branches merge, like commits. Golden hour, soft clouds, painterly "
            "cinematic 3D look, calm and magical."),
    # Graphic elements for the Ali split (RAW: skip the cinematic STYLE prefix), keyed out of white later.
    "doodles": ("grokking-ai-cover.png",
                "RAW:A sheet of six small separate hand-drawn ink doodles, in the black pen cross-hatching style of the "
                "attached cover, evenly spaced on a pure white background with lots of empty space between them: a small "
                "maze with a dotted path, a binary search tree of circles, a tiny rabbit pointing, a decision flowchart "
                "with arrows, a little graph of connected nodes, a magnifying glass over a grid. Black ink only, one "
                "single coral accent line in the maze path. No shading on the background, no text, no letters."),
    "aliens": ("python-cover.jpg",
               "RAW:Pixel-art game sprites in the style of the classic 'Alien Invasion' game from Python Crash Course, "
               "evenly spaced on a pure white background: one small spaceship (yellow and blue, pointing up), five small "
               "friendly green aliens with antennae in a row, and a few short yellow bullet dashes. Crisp 16-bit pixel "
               "art, hard pixel edges, no anti-aliasing blur, no shadows, no text, no letters."),
}


def api_key() -> str:
    key = os.environ.get("KIE_API_KEY", "")
    env = Path.home() / "cartas-sofia" / ".env"
    if not key and env.exists():
        for line in env.read_text().splitlines():
            name, _, value = line.partition("=")
            if name.strip() == "KIE_API_KEY":
                key = value.strip().strip('"')
    if not key:
        sys.exit("KIE_API_KEY is missing")
    return key


def request_json(url: str, key: str, body: bytes | None = None, content_type: str | None = None) -> dict:
    headers = {"Authorization": f"Bearer {key}", "User-Agent": "libros-reel/1.0"}
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=body, headers=headers, method="POST" if body else "GET")
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as err:
        return {"code": err.code, "msg": err.read().decode(errors="replace")[:500]}


def upload(path: Path, key: str) -> str:
    boundary = uuid.uuid4().hex
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    body = b"".join([
        f'--{boundary}\r\nContent-Disposition: form-data; name="uploadPath"\r\n\r\nlibros-reel/refs\r\n'.encode(),
        f'--{boundary}\r\nContent-Disposition: form-data; name="fileName"\r\n\r\n{path.name}\r\n'.encode(),
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{path.name}"\r\n'
        f"Content-Type: {mime}\r\n\r\n".encode() + path.read_bytes() + b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ])
    for url in UPLOAD_URLS:
        result = request_json(url, key, body, f"multipart/form-data; boundary={boundary}")
        if result.get("code") == 200 and (result.get("data") or {}).get("downloadUrl"):
            return result["data"]["downloadUrl"]
    raise RuntimeError(f"upload failed for {path.name}: {result}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only")
    parser.add_argument("--model", choices=MODELS, default="flare")
    parser.add_argument("--resolution", default="2K")
    parser.add_argument("--aspect", default="1:1")
    args = parser.parse_args()
    key = api_key()
    ids = args.only.split(",") if args.only else list(SHOTS)
    out_dir = ROOT / "public" / "broll"
    out_dir.mkdir(parents=True, exist_ok=True)

    tasks = {}
    for shot in ids:
        cover, scene = SHOTS[shot]
        src = ROOT / "public" / "broll" / cover[1:] if cover.startswith("@") else ROOT / "ref" / "books" / cover
        ref = upload(src, key)
        payload = {"model": MODELS[args.model], "input": {
            "prompt": scene[4:] + "\n\n" + REFERENCE_NOTE if scene.startswith("RAW:") else f"{STYLE}\n\n{REFERENCE_NOTE}\n\n{scene}", "input_urls": [ref],
            "aspect_ratio": args.aspect, "resolution": args.resolution}}
        result = request_json(f"{API}/createTask", key, json.dumps(payload).encode(), "application/json")
        task_id = (result.get("data") or {}).get("taskId")
        if not task_id:
            print(f"[{shot}] create failed: {result}")
            continue
        print(f"[{shot}] task {task_id}")
        tasks[shot] = task_id

    log = ROOT / "work" / "kie-log.jsonl"
    delay, start = 4, time.time()
    while tasks and time.time() - start < 900:
        time.sleep(delay)
        for shot, task_id in list(tasks.items()):
            data = request_json(f"{API}/recordInfo?taskId={task_id}", key).get("data") or {}
            if data.get("state") not in ("success", "fail"):
                continue
            entry = {"shot": shot, "model": args.model, "task": task_id, "state": data["state"],
                     "credits": data.get("creditsConsumed"), "seconds": data.get("costTime")}
            if data["state"] == "success":
                url = json.loads(data["resultJson"])["resultUrls"][0]
                target = out_dir / f"{shot}-{args.model}.png"
                urllib.request.urlretrieve(url, target)
                entry["file"] = str(target.relative_to(ROOT))
            else:
                entry["error"] = data.get("failMsg")
            print(entry)
            with log.open("a") as f:
                f.write(json.dumps(entry) + "\n")
            del tasks[shot]
        delay = min(delay * 1.4, 20)


if __name__ == "__main__":
    main()
