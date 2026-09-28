---
name: talking-head-reel
description: "Trigger: edit talking-head video, reel, TikTok, subtítulos, animaciones, cortes en silencios, estilo de referencia (Claude UI, Ali Abdaal). Fine-cut a vertical talking-head clip and add synced captions and animated explainer scenes with Remotion."
license: Apache-2.0
metadata:
  author: "stivenrosales"
  version: "1.3"
---

## Activation Contract

Load when the user gives a vertical talking-head video (usually from an iPhone) and asks for any of these: silence or stumble cuts, word-synced subtitles, animated explanations, a visual style taken from a reference, or an IG/TikTok-ready render.

## Reference Fidelity (read first, never skip)

The user judges the reel by how close it is to HIS reference. A generic approximation ("en ese espíritu") is a failure that costs a full rebuild. Twice so far: generic Claude-UI v1, and washed-out Liquid Glass.

- Read `references/styles.md` before designing anything visual.
- Put every reference in `ref/`: images, sites (via Chrome if curl/WebFetch get 403), shorts (via `yt-dlp`), and past reels he liked (`finals/`). Contact-sheet the videos and read full-resolution frames.
- Extract CONCRETE tokens into `work/spec.md`: real font names (plus a free stand-in), hex colors, sizes on the 1080 canvas, y bands, caption chip look, entrance motions, and recurring devices. No adjectives-only briefs.
- Verify claims about the reference (for example "macOS 27 changed Liquid Glass") with a search before designing.
- Show a static HTML style board over HIS real frames and wait for approval before any Remotion work. Existing kits and boards: `assets/styles/`.
- Keep the reference open while building and compare piece by piece. Adapt only what his footage forces (for example a top scrim over a bright sky, or a lower caption chip for close framing), and say so.

## Hard Rules

- Read `references/pipeline.md` before touching the video.
- Start from `assets/template/`, or from a style kit in `assets/styles/` once a style is chosen.
- Work inline in one thread. Do not delegate the build to a subagent: context and visual judgment get lost.
- Tonemap iPhone HLG HDR with `avconvert` before cutting. Never cut the HDR source directly. Never overwrite `work/audio.wav`: it is `cut.py`'s silence source.
- Build captions from a re-transcription of the EDITED audio, never from remapped original timestamps.
- Ask for the exact spelling of product names, and use the real brand logo and colors from the product site. Show the Claude spark only next to Claude.
- Keep all content inside the safe zone (top 250, bottom 1500, right rail x>940). Captions never cover the face or the chin. Scan the chin band of the final at 1 fps. In card mode, nothing else may enter the caption lane (y 860–1010).
- Keep the breath after the last word: set `LAST_WORD_END` in `cut.py`. An edit that ends on the word feels chopped.
- Offer SFX as candidates first (`scripts/sfx_samples.py` builds an A/B/C listening page) and use the approved picks.
- Background noises the user wants to keep (sheep, wind) get a tiny humorous sticker pinned to the camera frame. Don't kill the audio.
- Render with `--image-format=png`, normalize to -14 LUFS, and verify with stills before calling it done.
- Work in stages, each approved by the user: style board → pieces preview → fine cut → audio → mode map → full render.
- Put each new video in `videos/<YYYY-MM-DD>-<slug>/` (src, public, scripts, work, out, ref). Render with `tools/render-chunks.sh <slug> <Comp>` (chunked, so a fix re-renders only its 10 s chunk). Move the published mp4 to `finals/<YYYY-MM-DD>-<slug>.mp4`.
- When the user is on his phone (Remote Control), encode a 720p/30fps crf 24 copy (~18 MB) and send it with SendUserFile.
- Ask what the user actually sent or showed Claude (prompts, reference images, guides) so the story scenes are true.
- When a video is built on a source (article, post, paper), reuse its real figures, logo and brand tile color, and put a FUENTE line with the source's icon on every derived scene.
- Center every panel scene on x=540: check stills with a center guide, not just the panel box.

## Decision Gates

| Situation | Action |
|-----------|--------|
| User names a style, creator, site or app look | Run the Reference Fidelity steps; show a style board before building |
| `color_transfer=arib-std-b67` | Run `avconvert -p Preset3840x2160` first |
| Whisper mishears a name | Add it to `FIX` / `FIX_AT` / `EXACT_AT` in `captions.py` and to the `--prompt` |
| Stumble, filler ("bueno, decía") or repeat inside a sentence | Bisect with short padded chunks (and a 50 ms RMS scan), then add it to `MANUAL_CUTS` |
| Retakes (repeated sentence, false starts) | Keep the LAST clean take (move `START`); re-transcribe the edit to catch stumbles Whisper skipped |
| Concept with a list or steps | Claude-UI: card mode with a panel scene. Ali: numbered gold numeral + headline |
| Short emphasis | Top-band headline or a huge gold number |
| Voice-only explanation (no face) | Claude-UI "off" mode: the camera shrinks to card shape and fades; the cream canvas carries the animation |
| Caption touches the chin | Lower the chip (y 1462 for close framing) and soften punch-ins (1.06/1.12) |
| Element enters the caption lane | Move it into the panel header; never shrink the lane |
| Voice below -20 LUFS or outdoors | Measure noise floor + spectrum, run `scripts/voice.py`, give a loudness-matched A/B |
| User asks for "more pro" motion | Keep Remotion; upgrade easing, stagger, blur, 60 fps, AND match the reference kit |
| Final mix off target after SFX | Re-run `voice.py MIX --raw` on the rendered mix and remux |
| Tall content (a chat) must sit above the head in full mode | Add a `LOWER` window in `Camera.tsx` and drop the punch-in there |
| Speaker gestures at chest height | Add a `ZOOM_OUT` window (0.9, pinned top) + `CAPTIONS_UP` |
| Horizontal figure overflows the phone width | Wrap into two rows and animate the reflow; never shrink text to fit |
| Key idea the speaker never said out loud | Give it its own headline beat; a caption insert is too short to read |
| User already approved the voice chain or an SFX set | Reuse directly, no A/B |
| A small fix after the full render | `tools/render-chunks.sh <slug> <Comp> 10 "<sec-range>"`, then redo the mix normalization |

## Execution Steps

1. Probe the source (duration, rotation, color transfer), then tonemap it to `work/sdr.mov`.
2. Transcribe, detect silences, locate stumbles and retakes; confirm names with the user.
3. Collect and study the style references; show the style board (see Reference Fidelity).
4. Run `scripts/cut.py` (libx264 `-preset fast`) → `public/edited-raw.mp4` + `cuts.json`; `voice.py` → remux → `public/edited.mp4`.
5. Re-transcribe the edited audio → `scripts/captions.py` → `src/captions.json`.
6. Build scenes timed to word timestamps with the chosen style kit.
7. QA stills at every beat with safe-zone guides; fix collisions and compare against the reference.
8. `tools/render-chunks.sh` → `voice.py --raw` on the mix (+0.3 s audio fade) → final mp4; chin-band scan and spot-check frames.

## Output Contract

Return: the final mp4 path, duration, and LUFS; the cuts removed; the name corrections; the scene list with timings; and what was verified versus not watched end-to-end.

## References

- `references/styles.md`: the reference fidelity procedure, the style kits (Claude-UI, Ali Abdaal, Liquid Glass rejected) and caption placement.
- `references/pipeline.md`: commands, layout numbers, render benchmarks, and gotchas.
- `assets/template/`: a working Remotion project plus `scripts/` (cut, captions, voice, sfx_samples) and `render-chunks.sh`.
- `assets/styles/`: style kits (`ali-abdaal/`, `claude-ui/`, `liquid-glass/`) and HTML style boards.
