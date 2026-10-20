"""Generate SFX candidates with ElevenLabs Sound Effects v2 (direct API).

Usage: ELEVENLABS_API_KEY=... python3 scripts/eleven_sfx.py [--only whoosh,pop] [--takes 2]
Outputs work/sfx/eleven-<id>-<n>.mp3.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from kie_sfx import DURATION, SOUNDS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
URL = "https://api.elevenlabs.io/v1/sound-generation"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--takes", type=int, default=2)
    args = ap.parse_args()
    key = os.environ.get("ELEVENLABS_API_KEY") or sys.exit("ELEVENLABS_API_KEY is missing")
    out = ROOT / "work" / "sfx"
    out.mkdir(parents=True, exist_ok=True)
    for sid in [s for s in args.only.split(",") if s] or list(SOUNDS):
        for n in range(args.takes):
            body = {"text": SOUNDS[sid], "duration_seconds": DURATION[sid], "prompt_influence": 0.6, "model_id": "eleven_text_to_sound_v2"}
            req = urllib.request.Request(URL, json.dumps(body).encode(), {"xi-api-key": key, "Content-Type": "application/json"})
            try:
                with urllib.request.urlopen(req, timeout=120) as r:
                    dest = out / f"eleven-{sid}-{n}.mp3"
                    dest.write_bytes(r.read())
                    print(sid, n, "->", dest.relative_to(ROOT))
            except urllib.error.HTTPError as e:
                print(sid, n, "HTTP", e.code, e.read()[:300].decode(errors="replace"))


if __name__ == "__main__":
    main()
