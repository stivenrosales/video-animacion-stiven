# video-animacion-stiven

Code-driven video editing and animation for vertical social video, built with Remotion + FFmpeg + Whisper.

## Setup

```bash
npm install
pip3 install numpy scipy
```

## Layout

```
videos/<YYYY-MM-DD>-<slug>/   one self-contained folder per video
  src/        Remotion entry (index.ts), scenes, captions.json, cuts.json
  public/     assets served by staticFile(): edited.mp4, SFX, logos, screenshots
  scripts/    per-video copies of cut.py / captions.py / voice.py (tuned per video)
  work/       intermediates: sdr.mov, audio.wav, whisper JSON (git-ignored)
  out/        previews, QA stills, raw renders (git-ignored)
  ref/        third-party reference material (git-ignored)
finals/       published deliverables, named <YYYY-MM-DD>-<slug>.mp4 (git-ignored)
tools/        studio.sh / render.sh helpers
```

| Video | Composition | Notes |
|-------|-------------|-------|
| `videos/2026-09-25-jev-reel` | `JevExplainer` | Talking head, Jev brand |
| `videos/2026-09-25-poema-milena` | `Poema` | Narrated, hand-drawn sketch style |
| `videos/2026-09-26-opus-reel` | `OpusReel` | Talking head, 60 fps, FULL/CARD modes |

## Everyday commands

```bash
npm run studio -- opus              # Remotion Studio for the video whose folder matches "opus"
npm run render -- opus OpusReel     # full-quality render → videos/…opus-reel/out/raw.mp4
```

## New talking-head video

```bash
V=videos/$(date +%F)-<slug>
mkdir -p $V/{public,work,out}
cp -R ~/.claude/skills/talking-head-reel/assets/template/{src,scripts} $V/
cd $V/work
avconvert -s ~/Downloads/IMG_XXXX.mov -p Preset3840x2160 -o sdr.mov --replace
ffmpeg -i sdr.mov -ar 16000 -ac 1 audio.wav
whisper-cli -m "$HOME/Library/Application Support/Screen Studio/models/ggml-small.bin" -l es -ojf -of words audio.wav
python3 ../scripts/cut.py sdr.mov ../public/edited.mp4 /dev/null && cp cuts.json ../src/
ffmpeg -i ../public/edited.mp4 -ar 16000 -ac 1 edited.wav
whisper-cli -m "$HOME/Library/Application Support/Screen Studio/models/ggml-small.bin" -l es -ojf -of ewords edited.wav
python3 ../scripts/captions.py ewords.json ../src/captions.json
```

Then polish the voice with `scripts/voice.py`, build the scenes, render, run `voice.py --raw` on the final mix, and move the deliverable to `finals/`.

## Milena poem (narrated animation)

```bash
P=videos/2026-09-25-poema-milena
python3 $P/scripts/sfx.py $P/timeline.json $P/work/sfx.wav
# mix voice + ducked SFX → $P/public/poema-mix.wav (see CLAUDE.md), then:
npm run render -- poema Poema
```

Heavy media, renders and third-party images are git-ignored; regenerate them with the steps above.
