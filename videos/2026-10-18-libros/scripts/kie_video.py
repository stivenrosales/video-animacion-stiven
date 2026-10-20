"""Animate a B-roll still with Kie.ai Seedance 2.5 (first frame = the still).

Usage: python3 scripts/kie_video.py <shot> [--duration 5] [--resolution 720p] [--aspect 1:1]
Stills come from public/broll/<shot>-flare.png; clips land in public/broll/<shot>.mp4.
"""
import argparse
import json
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from kie import API, ROOT, api_key, request_json, upload  # noqa: E402

MODEL = "bytedance/seedance-2-5"
MOTION = {
    "grokking": (
        "Hand-drawn ink storybook animation that keeps the exact black ink cross-hatched style of the image. "
        "The rabbit traces the shortest path through the maze with its finger while the coral line draws itself "
        "along the route, reaching the exit with a small coral glow. The fox nods. Gentle slow camera push-in, "
        "paper texture stays still, subtle boiling ink lines like hand-drawn animation. No text, no new characters."
    ),
    "ai": (
        "The owl slowly turns its head and blinks, feathers ruffle in a soft breeze; the glowing coral threads "
        "pulse with light travelling node to node like data. Slow cinematic dolly-in, dusk light, floating dust. "
        "No text, no people."
    ),
    "git": (
        "Slow cinematic crane shot rising past the tree; the branches gently sway and small coral orbs light up one "
        "by one where branches merge, like commits being made. Golden hour clouds drift. No text, no people."
    ),
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("shot", choices=MOTION)
    parser.add_argument("--duration", type=int, default=5)
    parser.add_argument("--resolution", default="720p")
    parser.add_argument("--aspect", default="1:1")
    args = parser.parse_args()
    key = api_key()

    frame = upload(ROOT / "public" / "broll" / f"{args.shot}-flare.png", key)
    payload = {"model": MODEL, "input": {
        "prompt": MOTION[args.shot], "first_frame_url": frame, "generate_audio": False,
        "resolution": args.resolution, "aspect_ratio": args.aspect, "duration": args.duration}}
    result = request_json(f"{API}/createTask", key, json.dumps(payload).encode(), "application/json")
    task_id = (result.get("data") or {}).get("taskId")
    if not task_id:
        sys.exit(f"create failed: {result}")
    print(f"[{args.shot}] task {task_id}", flush=True)

    delay, start = 10, time.time()
    while time.time() - start < 1800:
        time.sleep(delay)
        data = request_json(f"{API}/recordInfo?taskId={task_id}", key).get("data") or {}
        if data.get("state") in ("success", "fail"):
            break
        delay = min(delay * 1.3, 30)
    entry = {"shot": args.shot, "model": MODEL, "task": task_id, "state": data.get("state"),
             "credits": data.get("creditsConsumed"), "seconds": data.get("costTime"), "duration": args.duration}
    if data.get("state") == "success":
        url = json.loads(data["resultJson"])["resultUrls"][0]
        target = ROOT / "public" / "broll" / f"{args.shot}.mp4"
        urllib.request.urlretrieve(url, target)
        entry["file"] = str(target.relative_to(ROOT))
    else:
        entry["error"] = data.get("failMsg") or data.get("state")
    print(entry)
    with (ROOT / "work" / "kie-log.jsonl").open("a") as f:
        f.write(json.dumps(entry) + "\n")


if __name__ == "__main__":
    main()
