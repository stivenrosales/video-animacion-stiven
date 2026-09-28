# Talking-head reel pipeline — reference (v1.3)

Proven on a 97 s iPhone 4K HDR vertical clip → 79.5 s reel, and an 82.5 s clip with retakes → 57.1 s reel at 60 fps (Remotion 4.0.529).

## 1. Color (iPhone HDR)

- Check: `ffprobe -show_entries stream=color_transfer,color_primaries` → `arib-std-b67` + `bt2020` = HLG HDR.
- Local ffmpeg has no `zscale`. Naive scale looks washed out; the `colorspace` filter gives pink skin.
- Fix: `avconvert -s IN.mov -p Preset3840x2160 -o work/sdr.mov --replace` (AVFoundation tonemaps to BT.709).
- Verify against macOS: `qlmanage -t -s 1080 -o . IN.mov` and compare with the same frame from sdr.mov.

## 2. Transcribe + detect silences

- Model: `~/Library/Application Support/Screen Studio/models/ggml-small.bin`.
- `whisper-cli -m MODEL -l es -ojf -of words audio.wav` (16 kHz mono wav).
- `ffmpeg -i audio.wav -af silencedetect=noise=-34dB:d=0.22 -f null -`.
- Locate stumbles precisely: cut 0.4–1.5 s chunks, pad them with `apad=pad_dur=1`, transcribe with `-nt`, and bisect the boundaries.

## 3. Fine cut — `scripts/cut.py`

- Set `START`, `END`, `PAD=0.07`, and `MANUAL_CUTS` (stumbles, repeats, "digamos la la").
- Output: `public/edited.mp4` at 1440x2560, crf 12, preset slow, bt709 tags (the headroom keeps punch-ins sharp) + `cuts.json` (jump-cut boundaries on the edited timeline).
- `python3 cut.py work/sdr.mov ../public/edited.mp4 /dev/null`; add `--plan` to only dump `cuts.json`.
- Retakes: Whisper's word timestamps drift inside retake zones. Transcribe padded chunks between silences to map what each segment really says, then cut from the end of the last good word to the start of the retake. Keep the last clean take.
- Always re-transcribe the edited audio and read it: it exposes stumbles the first pass hid (e.g. "y finalmente, filman, finalmente").
- Set `END` just before the last trailing silence; the loop breaks on silences past `END` (fixed bug: they used to drop the final segment).

## 4. Captions — `scripts/captions.py`

- NEVER remap word timestamps from the original: Whisper drops words at cut edges.
- Re-transcribe the EDITED audio with `--prompt "Brand, Names, LLM, API"` and run `captions.py` → `src/captions.json`.
- Ask the user for the exact spelling of product names before rendering.

## 4b. Voice polish — `scripts/voice.py`

- Measure first: `ebur128` loudness, noise floor RMS in a long silence, and band shares (numpy FFT). Outdoor iPhone voice measured -26 LUFS, floor -58 dBFS, 70% of noise under 300 Hz, dull 4–8 kHz.
- Chain: highpass 80, `afftdn nr=10`, EQ -2 dB @250, +2.5 dB @3.5k, treble +2 @9k, `deesser`, compressor 3:1 @-22 dB, then two-pass `loudnorm` + a final gain into `alimiter` (single-pass loudnorm undershoots ~1.5 dB when true peak binds).
- A/B both versions at the SAME loudness (`--raw` normalizes without the chain), alternating 10 s clips.
- Remux the processed voice into `public/edited.mp4` (`-c:v copy`). After the render, SFX push the mix louder (-11.4 LUFS seen): run `voice.py mix.wav mixn.wav --raw` and remux.
- zsh gotcha: `"...:$M:linear"` expands `$M:l` as a modifier. Use `${M}` or do it in Python.

## 5. Layout (1080x1920)

| Zone | Value |
|------|-------|
| IG/TikTok safe | top 250, bottom 1500, action rail x > 940 (y 900–1600) |
| Full-screen captions (F1) | center y=1440, over the chest |
| Card mode panel | y 230–860 |
| Caption lane (C1) | y 860–1010, center 935 — nothing else may enter it |
| Camera card | y 1010, h 880, x 90, w 900, radius 48, face anchor 0.30 |
| Full-screen face anchor | 0.47, zoom 1.10 / 1.17 alternating per jump cut |
| Captions | centered x=540, maxWidth 800, one line (`combineTokensWithinMilliseconds: 450`, nowrap) |

- Active-word scale must stay ≤ 1.025 or it eats the gap between words.
- `MODES` in `Camera.tsx` switches full ↔ card with a spring. Alternate about every 4–8 s: FULL for hooks, emotional lines and short beats; CARD for lists, tools, and screenshots.
- FULL-mode top cards live at y 262 and must end by ~y 600–620: the head starts around y 640. A flying element may cross the hair briefly, never the face.
- `FACE_Y` is the face height in the source (0.43–0.47); check a still per video.

## 6. Visual system

- Base: Claude-UI look — cream `#FAF9F5`, white cards with a `#E9E6DC` border, Source Serif 4 titles, Inter UI text, gray "Beta" chips, pastel icon tiles (lucide-react).
- The product brand overrides the accent. Pull its logo SVG path and hex colors from the product site (`curl` + regex on `<svg ... viewBox>`).
- Third-party logos: `simple-icons` (the OpenAI path only exists in `simple-icons@9.21.0`; Claude uses `#D97757`; the Gemini gradient runs `#1C7DFF → #8E75B2 → #E0685C`).
- Claude's orange spark appears ONLY next to Claude.
- Strikethrough: a 3px ink rule via `background-size` per line + text fading to 38%. Never a thick, rotated red bar.
- Time every scene element to the word timestamps in `captions.json` (absolute seconds, `pop(t, at)`).
- SFX: generate with ffmpeg (a pink-noise whoosh on mode changes, a 1250 Hz 90 ms pop on key reveals) at low volume.

## 6b. Motion system (v1.1)

- 60 fps comp. `ui.tsx` exports `ease`/`easeIn` (bezier 0.16,1,0.3,1 / 0.7,0,0.84,0) and `In` (opacity + offset + scale + blur settle). `Scene` enters with expo-out and exits with a blurred expo-in.
- Pieces take ABSOLUTE time and cue every element to a word timestamp; export the cue constants so `Sfx.tsx` imports them (no duplicated numbers).
- Pro touches that landed: staggered entrances, idle float (`sin` ±4 px), Ken Burns on screenshots, word-by-word quote with a highlight sweep, active-item highlight while the others dim, counter with ring and landing bump, typed prompt with per-key clicks (`key.wav`: 35 ms band-passed white noise), a reference image that flies in big then docks as an attachment chip.
- Real assets beat mockups: DM screenshots as a tilted pile, the YouTube thumbnail in a card with the channel name, official logos (Remotion PNG from its GitHub repo `packages/docs/static/img/logo-small.png`; FFmpeg and YouTube from `simple-icons`).
- Review loop: render a `Piezas` comp (each piece back to back on a stage with a still camera card) before building the timeline.

## 6c. Camera and caption tricks (v1.2, all in the template, windows empty by default)

- `LOWER` (Camera.tsx): full-screen frame slides down `LOWER_PX` (200–230) so a tall top card (a chat of ~480 px) clears the hair. The gap is a blurred cover-size copy of the same shot, feathered with a top mask; sky makes it seamless. The jump-cut punch-in is dropped inside the window so the chin stays above the captions.
- `ZOOM_OUT` (Camera.tsx): zoom 0.9 (below cover) with the frame pinned to the TOP, so the face rises and the chest frees up. Left, right and bottom edges are feathered over a blurred cover-size backdrop aligned to the same framing. Mismatched backdrops (scaled 1.25) look like a picture-in-picture; do not do that. Zoom 0.86 with a centered frame showed hard edges and ghost hands.
- `CAPTIONS_UP` (Captions.tsx): full-screen captions ease up to y≈470 (sky) while a chest-level graphic is on screen, then come back.
- `INSERTS` (Captions.tsx): types words into the caption after a spoken token. It only works when that caption page stays up ≥1.2 s; otherwise use a headline beat.
- Place hand-gesture graphics from a gridded still of the real comp frame (drawgrid 100 px), then re-check the neighbouring frames: the head drops when the hands come down.

## 6d. Using a source article

- Download its figures (`curl` the CDN srcs) into `ref/` (git-ignored) and copy the used ones to `public/`. Rebuild the diagrams natively for animation, but keep the article's visual language: near-black blocks, clay accent, mono stage labels.
- The hero illustration's tile color lives in the page HTML (`data-illustration-bg="Plum"`) and the site CSS (`--swatch--plum:#827dbd`).
- Every derived scene gets a `FUENTE` line with the article icon. The end card shows the article's real figure, title (text-height marker), author and date.

## 7. Render + deliver

- `npx remotion render src/index.ts <Comp> out/raw.mp4 --image-format=png --crf=14 --x264-preset=slow --color-space=bt709` (the default JPEG q80 softens detail).
- Extract the mix, `python3 voice.py mix.wav mixn.wav --raw`, then `ffmpeg -i raw.mp4 -i mixn.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart final.mp4`.
- A 57 s, 60 fps PNG render takes several minutes: run it in the background.

## 8. QA before full render

- Stills: `npx remotion still ... --frame=N --scale=0.4`, then tile them with ffmpeg `tile=6x2` (this ffmpeg has no `drawtext`).
- Overlay the safe zones and the caption lane with `drawbox` and check the worst-case frames (speaker leaning down).
- Check word spacing, the face never covered, and nothing entering the caption lane.
- Loudness: `ffmpeg -af ebur128` → about -14 LUFS.

## 9. Render speed (measured on an M3, Remotion 4.0.529, 1080x1920@60)

| Option | Result | Use? |
|--------|--------|------|
| `--gl=angle` (GPU) | Same speed (19 vs 20 s and 28 vs 30 s per 300 frames), identical SSIM | No |
| JPEG q100 instead of PNG frames | ~15% faster, but SSIM 0.9955 (soft text edges) | No |
| `edited.mp4` with `-preset fast` instead of `slow` (crf 12) | ~45–50% faster encode, same quality vs source (SSIM 0.99594 vs 0.99600) | **Yes** (`cut.py`) |
| `h264_videotoolbox` for `edited.mp4` | 8x faster, −3 dB PSNR | No |
| Keyframe every 1 s in `edited.mp4` | No render gain (Remotion decodes sequentially) | No |
| Splice a re-rendered range into a long-GOP final (concat in/outpoint) | Fails: B-frames add frames and misalign | No |
| **Chunked render** (`render-chunks.sh`) | Exact frame count, clean concat. A full run is slower (11:37 vs ~8 min for 80 s, because Chrome relaunches per chunk), but a fix costs one chunk (~30–60 s) | **Yes** |

- `render-chunks.sh <slug> <Comp> [sec=10] ["49-53,70"]`:
  1. Bundles once.
  2. Renders muted PNG chunks.
  3. Joins them with `concat -c copy`, renders the audio with `--codec=wav` and muxes → `out/raw.mp4`.
  4. On a re-run, renders only missing chunks or the ones overlapping the given seconds.
  It is compatible with the bash 3.2 that macOS ships.
- zsh: flags kept in a variable need `${=VAR}` to split. `for a b in …` iterates in pairs.

## 10. Endings, noises, sounds and delivery

- **Ending breath:** find where the last word really ends with a 50 ms RMS scan of `work/audio.wav`, then set `LAST_WORD_END` there and `END` about 0.4 s later. `cut.py` stops cutting silences after `LAST_WORD_END`. Also add a 0.3 s audio fade in the final mux.
- **Retakes at the start:** move `START` to the last clean take. Cut fillers like "Bueno, decía" with a `MANUAL_CUTS` window found by RMS.
- **Background noises** (sheep): find them as tremolo "zigzag" harmonics in a 1.2–4.5 kHz spectrogram (`showspectrumpic`). Pin a tiny white sticker ("🐑 sí, son ovejas", straight, no tilt) to the camera frame over the sky. The emoji renders in headless Chrome.
- **SFX:** `scripts/sfx_samples.py OUT` synthesizes seven categories × A/B/C (transition, reveal, click, typing, check, success, time-lapse) plus a level-matched `index.html` to audition. Approved set so far: A everywhere, time-lapse B. Mix volumes are 0.07–0.25.
- **Phone review:** `ffmpeg -vf "scale=720:1280,fps=30" -crf 24 -preset fast` gives ~18 MB, sent with SendUserFile.

## 11. Getting reference assets

- **Instagram image posts:** `yt-dlp` fails on images. Fetch `https://www.instagram.com/p/<id>/embed/captioned/` and take the scontent URL without an `stp=` parameter: that is the full-size original.
- **Sites that return 403 to curl/WebFetch:** open them with Claude in Chrome and run `getComputedStyle` over headings and body text plus `document.fonts`.
- **App UIs** (for example Vorssaint): take the logo from `apple-touch-icon`/`og:image`, the real UI copy from the site HTML, and screenshots from the GitHub README `docs/assets`.
- **Brand logos missing from simple-icons** (Power BI): use the official SVG from Wikimedia Commons.
