"""Generate instrumental background music candidates with Suno via Kie.ai.

Usage: python3 scripts/suno.py   (reads KIE_API_KEY from env or ~/cartas-sofia/.env)
Writes work/music/<variant>-<n>.mp3
"""
import json
import os
import pathlib
import sys
import time
import urllib.request

API = "https://api.kie.ai/api/v1/jobs"
OUT = pathlib.Path(__file__).resolve().parent.parent / "work" / "music"

VARIANTS = {
    # He picked the mellow lo-fi ElevenLabs bed; Ali Abdaal's beds are soft and stay far under the voice.
    "lofi": "mellow lo-fi background for a talking video, 82 bpm, soft electric piano chords, warm sub bass, "
            "gentle brushed drums, light vinyl texture, calm and optimistic, steady with no big changes, clean mix",
    "acoustic": "soft acoustic background for a talking video, 90 bpm, fingerpicked nylon guitar, felt piano, "
                "light shaker, warm and friendly, calm and steady with no big changes, unobtrusive, clean mix",
}
NEGATIVE = "vocals, choir, loud drums, drops, distortion, sad, dramatic, epic, fast"


def api_key():
    key = os.environ.get("KIE_API_KEY", "")
    if not key:
        env = pathlib.Path.home() / "cartas-sofia" / ".env"
        for line in env.read_text().splitlines():
            k, _, v = line.partition("=")
            if k.strip() == "KIE_API_KEY":
                key = v.strip().strip('"')
    if not key:
        sys.exit("KIE_API_KEY is missing")
    return key


def call(method, url, key, body=None):
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json",
                                          "User-Agent": "video-tools/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def main():
    key = api_key()
    OUT.mkdir(parents=True, exist_ok=True)
    tasks = {}
    for name, style in VARIANTS.items():
        res = call("POST", f"{API}/createTask", key, {
            "model": "ai-music-api/generate",
            "input": {"custom_mode": True, "instrumental": True, "model": "V6",
                      "title": f"Background {name}", "style": style,
                      "negative_tags": NEGATIVE, "duration": 60},
        })
        if res.get("code") != 200:
            sys.exit(f"{name}: {res}")
        tasks[name] = res["data"]["taskId"]
        print(name, "task", tasks[name], flush=True)

    pending = dict(tasks)
    deadline = time.time() + 600
    while pending and time.time() < deadline:
        time.sleep(15)
        for name, tid in list(pending.items()):
            res = call("GET", f"{API}/recordInfo?taskId={tid}", key)
            data = res.get("data") or {}
            state = data.get("state") or data.get("status")
            resp = data.get("response") or data.get("resultJson") or {}
            if isinstance(resp, str):
                try:
                    resp = json.loads(resp)
                except ValueError:
                    resp = {}
            tracks = [t for t in (resp.get("data") or []) if t.get("audio_url")]
            if tracks and str(state).lower() in ("success", "complete", "completed", "none"):
                for i, t in enumerate(tracks, 1):
                    dst = OUT / f"{name}-{i}.mp3"
                    urllib.request.urlretrieve(t["audio_url"], dst)
                    print(name, i, f"{t.get('duration')}s", dst, flush=True)
                del pending[name]
            elif str(state).lower() in ("fail", "failed", "error"):
                print(name, "failed", json.dumps(data)[:400], flush=True)
                del pending[name]
            else:
                print(name, "state", state, flush=True)
    if pending:
        sys.exit(f"timed out: {pending}")


if __name__ == "__main__":
    main()
