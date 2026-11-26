"""Generate small sumi-e ink icons with Kie.ai GPT Image 2.5 (image-to-image, a Koan kit element as brush reference).

Usage: python3 scripts/kie_ink.py [--only altavoz,moneda] [--resolution 1K]; then python3 scripts/ink_mask.py
Reads KIE_API_KEY from the environment or ~/cartas-sofia/.env. Outputs to work/ink/<id>-flare.png.
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
    "A single small icon painted in Japanese sumi-e ink, exactly in the brush style of the reference image: a few "
    "confident black brush strokes with visible dry-brush texture and slightly uneven edges, flat black ink only. "
    "Pure white background, the icon centered with generous empty margin around it. Minimalist and calm. "
    "No text, no letters, no color, no gray wash, no shading, no shadow, no frame, no paper texture, no signature."
)
REFERENCE_NOTE = (
    "The attached image is only a reference for the brush style and line weight; do not reproduce its subject."
)
# Small ink marks that appear next to the caption when he names the thing.
SHOTS = {
    "altavoz": ("foco.png", "Subject: a simple loudspeaker cone seen from the side with three curved sound waves coming out of it."),
    "moneda": ("foco.png", "Subject: a single round coin drawn as one brush circle with a small simple mark in its center."),
    "destello": ("foco.png", "Subject: one four-pointed sparkle star with two much smaller sparkles next to it."),
    "claqueta": ("foco.png", "Subject: a simple film clapperboard, slightly open."),
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
        f'--{boundary}\r\nContent-Disposition: form-data; name="uploadPath"\r\n\r\nvideo-refs/ink\r\n'.encode(),
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
    out_dir = ROOT / "work" / "ink"
    out_dir.mkdir(parents=True, exist_ok=True)

    tasks = {}
    for shot in ids:
        cover, scene = SHOTS[shot]
        src = ROOT / "ref" / "ink" / cover
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
