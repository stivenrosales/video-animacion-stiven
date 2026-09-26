# video-animacion-stiven

Programmatic video editing and animation for short-form social video (IG Reels / TikTok, 1080x1920).
Two finished projects live here:

| Project | Entry | Composition | Style |
|---------|-------|-------------|-------|
| Jev reel (talking head) | `src/index.ts` | `JevExplainer` | Claude-UI cards, TypeSafe/Jev brand, captions |
| Milena poem (narrated) | `poema/src/index.ts` | `Poema` | Hand-drawn "dirty line" (sketch), silhouettes |

For talking-head reels, load the global skill `talking-head-reel` (`~/.claude/skills/talking-head-reel/`): it holds the full pipeline and the proven layout numbers.

## Stack

- Remotion 4.0.529 (React 19 + TypeScript); npm is the package manager (`package-lock.json`).
- FFmpeg (no `zscale`, no `drawtext`), `whisper-cli` + `ggml-small.bin` (`~/Library/Application Support/Screen Studio/models/`), `avconvert` (macOS), Python 3 + numpy/scipy.
- `yt-dlp` for local style references. Get X/Twitter status URLs through Chrome, because gallery-dl needs auth.

## Pipelines

**Talking head (Jev):** `avconvert` HDR→SDR → whisper + silencedetect → `scripts/cut.py` (fine cut, `cuts.json`) → re-transcribe the EDITED audio → `scripts/captions.py` → Remotion scenes timed to word timestamps → render → loudnorm -14 LUFS.

**Narrated animation (poem):** clean the voice (highpass, afftdn, compressor, loudnorm) → `poema/timeline.json` (single source of truth for scenes, SFX and chords) → `poema/scripts/sfx.py` synthesizes the SFX + pad → ffmpeg `sidechaincompress` ducks the SFX under the voice → Remotion scenes (`poema/src/scenes2.tsx`).

## Rules learned (do not regress)

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

## Next direction: hybrid pipeline (animation separate, Remotion assembles)

- Generate each animated scene as an independent clip with **p5.js + p5.brush** (real brush and watercolor textures). Headless Chrome screenshots every frame, and FFmpeg joins them. Reference kit: `JohnHeibel/ClaudeAnimationBase` (GitHub).
- Export clips as a PNG sequence or WebM with alpha when they overlay the camera; use MP4 for full-frame scenes.
- Remotion acts as the editing desk: it assembles the clips, camera, captions, SFX and audio.
- Both sides read the same `timeline.json`, so nothing drifts. Re-render only the clip that changed.
- Tradeoff: alpha sequences are heavy; use them only where compositing is needed.
