"""Generate SFX candidates with Kie.ai Suno Sounds (ai-music-api/sounds).

Usage: python3 scripts/kie_sfx.py [--only whoosh,pop] [--model V5_5]
Outputs work/sfx/kie-<id>-<n>.mp3 (each task returns one or more clips). Log: work/kie-log.jsonl.
"""
import argparse
import json
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from kie import API, ROOT, api_key, request_json  # noqa: E402

SOUNDS = {
    "whoosh": "A single soft, airy whoosh, short and gentle, like a sheet of paper sliding past the microphone. "
              "Clean studio recording, no music, no melody, no reverb tail, under one second.",
    "pop": "A single soft, warm UI pop, like a cork gently released or a bubble popping, rounded and friendly. "
           "Clean, dry, no music, no melody, very short.",
    "paper": "A single crisp page turn of a hardcover book, close and intimate, dry room. No music, no melody.",
}

DURATION = {"whoosh": 0.8, "pop": 0.5, "paper": 1.0}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--model", default="V5_5")
    ap.add_argument("--engine", choices=["suno", "eleven"], default="suno")
    args = ap.parse_args()
    key = api_key()
    out = ROOT / "work" / "sfx"
    out.mkdir(parents=True, exist_ok=True)
    ids = [s for s in args.only.split(",") if s] or list(SOUNDS)
    tasks = {}
    for sid in ids:
        if args.engine == "eleven":  # ElevenLabs SFX v2 on Kie (not in their docs index, but createTask accepts it)
            payload = {"model": "elevenlabs/sound-effect-v2",
                       "input": {"text": SOUNDS[sid], "duration_seconds": DURATION[sid], "prompt_influence": 0.6}}
        else:
            payload = {"model": "ai-music-api/sounds", "input": {"model": args.model, "prompt": SOUNDS[sid], "sound_loop": False}}
        res = request_json(f"{API}/createTask", key, json.dumps(payload).encode(), "application/json")
        if res.get("code") != 200:
            print(sid, "createTask failed:", res)
            continue
        tasks[sid] = res["data"]["taskId"]
        print(sid, "task", tasks[sid])
    deadline = time.time() + 600
    while tasks and time.time() < deadline:
        time.sleep(8)
        for sid, tid in list(tasks.items()):
            data = request_json(f"{API}/recordInfo?taskId={tid}", key).get("data") or {}
            state = data.get("state") or data.get("status")
            if state in ("success", "SUCCESS"):
                info = data.get("resultJson") or data.get("response") or {}
                if isinstance(info, str):
                    info = json.loads(info)
                clips = info.get("data") or info.get("sunoData") or info.get("resultUrls") or []
                for n, clip in enumerate(clips):
                    url = clip if isinstance(clip, str) else (clip.get("audio_url") or clip.get("audioUrl") or clip.get("stream_audio_url"))
                    dest = out / f"{'eleven' if args.engine == 'eleven' else 'kie'}-{sid}-{n}.mp3"
                    urllib.request.urlretrieve(url, dest)
                    print(sid, "->", dest.relative_to(ROOT), clip.get("duration") if isinstance(clip, dict) else "")
                with open(ROOT / "work" / "kie-log.jsonl", "a") as log:
                    log.write(json.dumps({"sfx": sid, "task": tid, "result": info}) + "\n")
                del tasks[sid]
            elif state in ("fail", "FAILED", "failed", "error"):
                print(sid, "failed:", json.dumps(data)[:400])
                del tasks[sid]
    for sid in tasks:
        print(sid, "timed out")


if __name__ == "__main__":
    main()
