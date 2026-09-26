# video-animacion-stiven

Code-driven video editing and animation for vertical social video, built with Remotion + FFmpeg + Whisper.

## Setup

```bash
npm install
pip3 install numpy scipy
```

## Jev reel (talking head)

```bash
mkdir -p work && cd work
avconvert -s ~/Downloads/IMG_4366.mov -p Preset3840x2160 -o sdr.mov --replace
ffmpeg -i sdr.mov -ar 16000 -ac 1 audio.wav
whisper-cli -m "$HOME/Library/Application Support/Screen Studio/models/ggml-small.bin" -l es -ojf -of words audio.wav
python3 ../scripts/cut.py sdr.mov ../public/edited.mp4 /dev/null   # also writes cuts.json → copy to ../src/
ffmpeg -i ../public/edited.mp4 -ar 16000 -ac 1 edited.wav
whisper-cli -m "$HOME/Library/Application Support/Screen Studio/models/ggml-small.bin" -l es -ojf -of ewords edited.wav
python3 ../scripts/captions.py ewords.json ../src/captions.json
cd .. && npm run render   # then loudnorm to -14 LUFS
```

## Milena poem (narrated animation)

```bash
python3 poema/scripts/sfx.py poema/timeline.json poema/work/sfx.wav
# mix voice + ducked SFX → public/poema-mix.wav (see CLAUDE.md), then:
npx remotion render poema/src/index.ts Poema out/poema.mp4 --image-format=png --crf=14 --x264-preset=slow --color-space=bt709
```

Heavy media (`public/*.mp4`, `*.wav`, `out/`, `work/`) is git-ignored; regenerate it with the steps above.
