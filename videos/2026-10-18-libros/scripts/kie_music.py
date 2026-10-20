"""Generate an instrumental background bed with Kie.ai Suno (ai-music-api/generate).

Usage: python3 scripts/kie_music.py [--only lofi,piano]
Outputs work/music/<id>-<n>.mp3 (two tracks per task). Log: work/kie-log.jsonl.
"""
import argparse
import json
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from kie import API, ROOT, api_key, request_json  # noqa: E402

BEDS = {
    "lofi": ("Paginas tranquilas",
             "calm lo-fi hip hop instrumental, warm Rhodes piano, soft vinyl texture, gentle brushed drums, mellow bass, "
             "78 bpm, cozy study mood, sparse arrangement that leaves room for a voice-over, steady, no build-ups"),
    "piano": ("Biblioteca al sol",
              "minimal warm acoustic instrumental, soft felt piano and light plucked guitar, subtle shaker, 90 bpm, "
              "optimistic and curious, YouTube educational background music, sparse, steady, no drops"),
}
NEGATIVE = "vocals, singing, choir, heavy drums, EDM drop, distorted guitar, dramatic build-up, loud lead melody"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--duration", type=int, default=90)
    args = ap.parse_args()
    key = api_key()
    out = ROOT / "work" / "music"
    out.mkdir(parents=True, exist_ok=True)
    tasks = {}
    for bid in [s for s in args.only.split(",") if s] or list(BEDS):
        title, style = BEDS[bid]
        payload = {"model": "ai-music-api/generate", "input": {
            "custom_mode": True, "instrumental": True, "model": "V6", "title": title, "style": style,
            "negative_tags": NEGATIVE, "duration": args.duration}}
        res = request_json(f"{API}/createTask", key, json.dumps(payload).encode(), "application/json")
        if res.get("code") != 200:
            print(bid, "createTask failed:", res)
            continue
        tasks[bid] = res["data"]["taskId"]
        print(bid, "task", tasks[bid])
    deadline = time.time() + 900
    while tasks and time.time() < deadline:
        time.sleep(10)
        for bid, tid in list(tasks.items()):
            data = request_json(f"{API}/recordInfo?taskId={tid}", key).get("data") or {}
            state = data.get("state")
            if state == "success":
                info = data.get("resultJson") or data.get("response") or {}
                if isinstance(info, str):
                    info = json.loads(info)
                for n, clip in enumerate(info.get("data") or []):
                    dest = out / f"{bid}-{n}.mp3"
                    urllib.request.urlretrieve(clip.get("audio_url") or clip.get("stream_audio_url"), dest)
                    print(bid, "->", dest.relative_to(ROOT), clip.get("duration"))
                with open(ROOT / "work" / "kie-log.jsonl", "a") as log:
                    log.write(json.dumps({"music": bid, "task": tid, "result": info}) + "\n")
                del tasks[bid]
            elif state == "fail":
                print(bid, "failed:", data.get("failCode"), data.get("failMsg"))
                del tasks[bid]
    for bid in tasks:
        print(bid, "timed out")


if __name__ == "__main__":
    main()
