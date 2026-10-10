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
| Agents vs automations reel (talking head, 2 takes) | `videos/2026-09-28-fusion` | `FusionReel` | Ali × Sketch: Ali elements + rough.js/Excalifont strokes + frameless camera drop, one macOS window |
| Don't buy AI courses reel (talking head) | `videos/2026-10-07-cursos-ia` | `CursosReel` | Claude Carousel: Claude's IG carousels (grid paper, hand boxes, tabs, arrows) + reel devices (soft serif, chalk icons), CC0 stroke SFX |
| WhatsApp agents reel (talking head) | `videos/2026-10-07-whatsapp-agentes` | `WhatsAppReel` | Ali Abdaal YouTube (long-form): cream canvas + swoosh, lilac-bordered camera card, chapter cards, word blur-in serif, real meme screenshot with FUENTE |
| Gentle AI + Engram reel (talking head) | `videos/2026-10-08-gentle-ai` | `GentleReel` | Ali Abdaal YouTube with a fade split (no camera card): graphic on cream, camera edge to edge below, sky dissolving into the canvas; Gentle AI brand medallions |
| Repo + 3 styles reel (talking head) | `videos/2026-10-09-repo-estilos` | `RepoReel` | Ali YouTube base with Ali's real S band; the reel itself switches to Claude Carousel, Ali Shorts and Liquid Glass (`glass.tsx`) as each style is named; past reel cited as an Ali video card; real GitHub repo + Star CTA |
| Pessoa narrated poem (feed post, 4:5) | `videos/2026-10-09-quiet-poema` | `QuietPoema` | Quiet Please: one stick figure doing loops on a flat-color grainy background, 12 stations cued to words, Marcellus captions |
| WhatsApp agents maintenance reel (talking head) | `videos/2026-10-10-agentes-mantenimiento` | `AgentesReel` | Ali YouTube latest (traced band + fade split), white panels with lucide icon circles, text slide, chapter card, chart; real respond.io/Airtable/Excel logos |

For talking-head reels, load the skill `talking-head-reel`: it holds the full pipeline and the proven layout numbers. Its single source of truth is `skills/talking-head-reel/` in this repo; `~/.claude/skills/talking-head-reel` is a symlink to it, so edit the repo copy and commit.

The README art is generated: `python3 docs/art/clawd.py` (pixel-art hero) and `python3 docs/art/gallery.py` (style mockups from `finals/`).

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
- Style verdicts: Claude Carousel (Claude's own IG carousels + reels) = liked; Claude-UI kit = liked; Ali Abdaal = liked a lot; Ali × Sketch = liked a lot (Ali elements, Excalidraw strokes only, Claude-UI camera drop without frame); Liquid Glass = rejected; Claude-UI graphics mixed with Ali = rejected; Ali's newer diagram look (color emoji icon tiles, connectors with traveling dots, numbered progress line) = rejected, he wants minimal lucide icons and calm motion.
- Cut only silences by default. Never remove words he said (self-corrections, fillers) without asking.
- A clip that ends mid-word means a missing take: ask for it and join the takes in `work/join/`.
- Work inline for video editing; delegating the build to a subagent lost context (generic v1, idle waits, overwritten `work/audio.wav`).
- Never overwrite `work/audio.wav`: it is `cut.py`'s silence source. Name other audio `voice-in.wav`, `mix.wav`, etc.
- Keep the breath after the last word (`LAST_WORD_END` in `cut.py`) and fade the final audio 0.3 s. An edit that ends on the word feels chopped.
- Captions must clear THIS speaker's chin: scan the chin band of the final at 1 fps. For close framing, chip center y 1462 and punch-ins 1.06/1.12.
- Offer SFX as A/B/C candidates (`scripts/sfx_samples.py`); approved set: A everywhere, time-lapse B.
- Render with `tools/render-chunks.sh <slug> <Comp>`: a fix re-renders only its 10 s chunk. `--gl=angle`, JPEG frames and keyframe tweaks gave no useful gain; `cut.py` uses `-preset fast`.
- On the phone (Remote Control), send a 720p crf 24 copy with SendUserFile.
- "Claude style" can mean Claude's Instagram, not only the claude.ai UI: fetch the carousels/reels he links and build from them (`claude-carousel` kit).
- Animated boards (draw-on + boil) sell hand-drawn styles better than static ones; he judges the motion, not just the layout.
- Camera card: anchor the eye line (~0.47 of the card); the default 0.30 left his face too low.
- Stroke SFX come from real CC0 recordings (Freesound, OpenGameArt), never synthesized; use them sparingly (~1 per scene, 0.25) and keep chalk icons over the camera silent.
- Filler cuts: verify each with a splice test of the joined audio; a cut 110 ms early ate the "-que" of "porque".
- No "broken" cards: badges and pills never straddle a card edge, nothing is tilted, and two elements never overlap mid-transition, unless the user asks (even if the reference does it).
- The dark top scrim is one fixed full-frame layer that only fades; inside an animated Scene its edges show while it scales in.
- Camera breathing zoom must never go below 1: `1 + 0.012*sin` opened cream strips at both sides of the edge-to-edge split every 10.5 s. Use `1 + 0.006*(1+sin)` (fixed in the kits).
- Never show an empty panel waiting for its first cue: hold the previous scene until the next one has content on screen.
- Camera under a graphic: he prefers a fade split (camera full width from y 740, eased 150 px top fade into the cream, hair kept out of the fade) over a framed card, arch, cutout or bubble. Never fill zoom-out gaps with blur or side fades; full width is the zoom-out limit.
- In split mode the swoosh lives only in the graphics band; a curve crossing the camera looks like a stain.
- When he flags a repeated phrase or a filler, find the edges with a 25 ms RMS scan plus splice tests: Whisper word times drift up to 0.9 s there. Retime later cues from the new transcription, not by shifting.
- When he names a style, the reel itself turns into that style (graphics, captions, camera treatment); never insert clips of past reels to show it. Citing a past video is a separate device (Ali-style video card with an animated thumbnail).
- Ali YouTube background: canvas `#F7F7F5` and a WIDE flat `#ECE7E4` band that enters grazing the bottom edge, sweeps up in an S and exits the right edge (the frame crops its ends). Not a uniform ring and not a tapered stroke. His saved frames are in `videos/2026-10-07-whatsapp-agentes/ref/yt-*.jpg` (gitignored; list with `fd -I`).
- "Ali Abdaal" can mean his Shorts (full camera, gold soft serif, Poppins chip), not only his YouTube look; ask or check which. A real photo of the person (channel avatar via `yt-dlp --write-thumbnail`) makes the reference instantly clear.
- When top graphics hit his head in full mode, lower HIM (lowered window, ~140 px for close framing, no punch-in, blurred copy of the same shot fills the sky gap) and keep the graphics ending by ~y 620. 220 px pushed his chin into the caption chip.

- Quiet Please style (narrated animation): one stick figure (kit `quiet-please/`: `rig.ts`, board, `grain.py`) in loops per idea, elements enter on the word that names them. Long narration (4+ min) ships as a 4:5 (1080x1350) feed post, not a reel.
- Stick figure anatomy: shoulder on the spine (never at the neck), fixed segment lengths in head units, two-bone IK with elbows out and knees forward; a writing hand follows a real pen path (loops, line returns, dip, page flip) and the eyes follow it. Crossed forearms read as broken.
- Judge grain at 100% size: a board cell shown at 1/3 hides grain that is loud in the full render.
- Props must read as what they are: a lone bowler hat looked like a UFO; use the full silhouette. Hands hold objects by their grip (cup handle), arm drawn behind the object.

## Next direction: hybrid pipeline (animation separate, Remotion assembles)

- Generate each animated scene as an independent clip with **p5.js + p5.brush** (real brush and watercolor textures). Headless Chrome screenshots every frame, and FFmpeg joins them. Reference kit: `JohnHeibel/ClaudeAnimationBase` (GitHub).
- Export clips as a PNG sequence or WebM with alpha when they overlay the camera; use MP4 for full-frame scenes.
- Remotion acts as the editing desk: it assembles the clips, camera, captions, SFX and audio.
- Both sides read the same `timeline.json`, so nothing drifts. Re-render only the clip that changed.
- Tradeoff: alpha sequences are heavy; use them only where compositing is needed.
