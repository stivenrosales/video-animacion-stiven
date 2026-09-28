# video-animacion-stiven

Programmatic video editing and animation for short-form social video (IG Reels / TikTok, 1080x1920).
Every video lives in its own dated folder `videos/<YYYY-MM-DD>-<slug>/` (`src`, `public`, `scripts`, `work`, `out`, `ref`). Published mp4s go to `finals/<YYYY-MM-DD>-<slug>.mp4`. Open or render any video with `npm run studio -- <slug>` and `npm run render -- <slug> <Comp>` (they pass `--public-dir`). See README → Layout.

Finished videos:

| Project | Folder | Composition | Style |
|---------|-------|-------------|-------|
| Jev reel (talking head) | `videos/2026-09-25-jev-reel` | `JevExplainer` | Claude-UI cards, TypeSafe/Jev brand, captions |
| Milena poem (narrated) | `videos/2026-09-25-poema-milena` | `Poema` | Hand-drawn "dirty line" (sketch), silhouettes |
| Opus 5.5 workflow reel (talking head) | `videos/2026-09-26-opus-reel` | `OpusReel` | Claude-UI cards, 60 fps, FULL/CARD alternation, published |
| AI-Native SDLC playbook reel (talking head) | `videos/2026-09-26-sdlc-playbook` | `SdlcReel` | Article-sourced figures + FUENTE citations, lowered/zoomed-out camera windows, published |
| Workflows reel (talking head) | `videos/2026-09-27-workflows` | `WorkflowsReel` | Claude-UI kit (menus, pastel tiles, input box, cursor), voice-only "off" mode, event flyer, sheep stickers |
| MCP vs WhatsApp reel (talking head) | `videos/2026-09-27-mcp-vs-whatsapp` | `McpReel` | Ali Abdaal style (soft serif + gold keywords, handwriting, stickers, light caption chip), chunked render |

For talking-head reels, load the global skill `talking-head-reel` (`~/.claude/skills/talking-head-reel/`): it holds the full pipeline and the proven layout numbers.

## Stack

- Remotion 4.0.529 (React 19 + TypeScript); npm is the package manager (`package-lock.json`).
- FFmpeg (no `zscale`, no `drawtext`), `whisper-cli` + `ggml-small.bin` (`~/Library/Application Support/Screen Studio/models/`), `avconvert` (macOS), Python 3 + numpy/scipy.
- `yt-dlp` for local style references. Get X/Twitter status URLs through Chrome, because gallery-dl needs auth.

## Pipelines

**Talking head (Jev):** `avconvert` HDR→SDR → whisper + silencedetect → `scripts/cut.py` (fine cut, `cuts.json`) → re-transcribe the EDITED audio → `scripts/captions.py` → Remotion scenes timed to word timestamps → render → loudnorm -14 LUFS.

**Narrated animation (poem):** clean the voice (highpass, afftdn, compressor, loudnorm) → `timeline.json` (single source of truth for scenes, SFX and chords) → `scripts/sfx.py` synthesizes the SFX + pad → ffmpeg `sidechaincompress` ducks the SFX under the voice → Remotion scenes (`src/scenes2.tsx`).

**Talking head v1.1 (Opus reel):** same as above, plus retake bisection → `scripts/voice.py` (measure, A/B, -14 LUFS) → pieces preview → mode map → 60 fps render → `voice.py --raw` on the final mix.

## Rules learned (do not regress)

- New video = new `videos/<date>-<slug>/` folder copied from the skill template. Never put a video's files at the repo root, and never share one `public/` between videos.

- iPhone footage is HLG HDR: tonemap with `avconvert -p Preset3840x2160` before cutting.
- Captions come from re-transcribing the edited audio, never from remapped timestamps. Confirm brand spellings with the user.
- Keep all content inside the IG/TikTok safe area (top 250, bottom 1500, right rail x>940). Center captions at x=540 with maxWidth 800, on one line.
- Card mode reserves a caption lane (y 860–1010) that nothing else may enter.
- Show layout options as stills at worst-case frames BEFORE a full render.
- Render with `--image-format=png --crf=14 --x264-preset=slow --color-space=bt709`.
- Grainy sketch renders are heavy: deliver HEVC (`libx265 -crf 20 -tag:v hvc1`, ~25 MB for 44 s) plus an H.264 fallback. Check with SSIM.
- Claude's orange spark appears only next to the Claude logo; each product uses its own brand from its official site.
- Sketch style: line boil via feTurbulence + feDisplacementMap with the seed stepped every 2 frames, animation on twos, hatch patterns, grain, thick ink outlines, colored-pencil streaks. Characters are silhouettes (user preference).
- Try the most likely option first; do not run several slow encodes in parallel "just in case".
- Approval stages the user expects: pieces preview → cut preview (explain which retake was kept) → audio A/B → mode map table → final render.
- On retakes, keep the last clean take, and re-read the transcript of the edited audio to catch stumbles the first pass hid.
- `cut.py`: silences past `END` used to drop the final segment (fixed: break when `s >= END`).
- Voice: measure before touching it; single-pass loudnorm undershoots when true peak binds, and SFX push the final mix about 2.5 LU louder, so renormalize the mix.
- "More professional" means motion design (expo easing, blur, stagger, cues on every word, 60 fps), not a tool swap. Keep Remotion for UI scenes and reserve p5.brush for painterly looks.
- Ask what the user really sent Claude (prompt, reference images such as the Claude visual guide) so the story scenes are accurate.
- zsh: `$VAR:l...` is a modifier; write `${VAR}` before a colon. `rm -rf dir/*` on an empty dir aborts an `&&` chain (no glob match).
- Source-based videos: use the source's real figures, logo and tile color (from its HTML/CSS), and put a FUENTE line with its icon on each derived scene.
- Nothing may cover the face: for tall top content use a `LOWER` camera window; for chest-level hand gestures use `ZOOM_OUT` (0.9, pinned top) plus `CAPTIONS_UP`. Verify on the neighbouring frames, because the head moves.
- Check centering against x=540 with a guide line; left-aligned groups inside a centered panel read as off-center.
- Highlights sit behind the text at the text's own height, never as a thin offset stroke.
- An idea the speaker did not say but the video depends on (e.g. "en empresas") gets a headline beat, not a small note.
- Remotion `--frames` is 0-based and must stay below duration×fps.
- REFERENCE FIDELITY: when the user names a style or gives a reference (image, site, shorts, past reel), study it concretely (download it, contact-sheet it, extract real fonts/hex colors/positions) and show an HTML style board over his real frames BEFORE building. A generic approximation cost a full rebuild twice. See the skill's `references/styles.md`.
- Style verdicts: Claude-UI kit = liked; Ali Abdaal = liked a lot; Liquid Glass = rejected.
- Work inline for video editing; delegating the build to a subagent lost context (generic v1, idle waits, overwritten `work/audio.wav`).
- Never overwrite `work/audio.wav`: it is `cut.py`'s silence source. Name other audio `voice-in.wav`, `mix.wav`, etc.
- Keep the breath after the last word (`LAST_WORD_END` in `cut.py`) and fade the final audio 0.3 s. An edit that ends on the word feels chopped.
- Captions must clear THIS speaker's chin: scan the chin band of the final at 1 fps. For close framing, chip center y 1462 and punch-ins 1.06/1.12.
- Offer SFX as A/B/C candidates (`scripts/sfx_samples.py`); approved set: A everywhere, time-lapse B.
- Render with `tools/render-chunks.sh <slug> <Comp>`: a fix re-renders only its 10 s chunk. `--gl=angle`, JPEG frames and keyframe tweaks gave no useful gain; `cut.py` uses `-preset fast`.
- On the phone (Remote Control), send a 720p crf 24 copy with SendUserFile.

## Next direction: hybrid pipeline (animation separate, Remotion assembles)

- Generate each animated scene as an independent clip with **p5.js + p5.brush** (real brush and watercolor textures). Headless Chrome screenshots every frame, and FFmpeg joins them. Reference kit: `JohnHeibel/ClaudeAnimationBase` (GitHub).
- Export clips as a PNG sequence or WebM with alpha when they overlay the camera; use MP4 for full-frame scenes.
- Remotion acts as the editing desk: it assembles the clips, camera, captions, SFX and audio.
- Both sides read the same `timeline.json`, so nothing drifts. Re-render only the clip that changed.
- Tradeoff: alpha sequences are heavy; use them only where compositing is needed.
