# Styles and reference fidelity (v1.4)

The user judges a reel by how close it is to the reference he gave. "Roughly in that spirit" is a failure. This file holds the procedure and the style kits we already built.

## 1. Reference fidelity procedure (mandatory before building pieces)

Failures that caused a rebuild:
- Workflows reel v1: the brief said "Claude-UI look", and the pieces came out as generic boxes, stick icons and thin bars. The user said the animations "lost the thread of the polished style we had". Root cause: nobody opened the reference image or the past reels while building.
- Liquid Glass v1 looked washed out. We fixed it only after reading what Apple actually changed in macOS 27.

Procedure:
1. **Collect every reference the user gives** into `ref/`: images, sites and videos. Download shorts with `yt-dlp` and screenshot sites. If `curl` or WebFetch returns 403, open the site in Chrome and read `getComputedStyle` fonts and colors plus `document.fonts`. Past reels he liked live in `finals/`: contact-sheet them.
2. **Extract concrete tokens, not impressions.** Record these in the video's `work/spec.md`:
   - Font families (real names, plus the free stand-in if the real one is commercial).
   - Weights, sizes relative to the 1080 canvas, and hex colors.
   - Where things sit (y bands), how captions look (box, color, position, active-word treatment), and how elements enter (pop, write-on, word-by-word).
   - What recurs (labels, numbered lists, stickers, doodles).
   Contact-sheet the reference video at 1 frame every 3 s and read two full-resolution frames.
3. **Verify claims about the reference.** For "macOS 27 changed Liquid Glass", search before designing: it added a darkened edge, brighter specular highlights, more diffusion and a Clear↔Tinted slider.
4. **Build a static style board first**: pure HTML/CSS over the user's real frames, in Chrome, which is the same engine Remotion uses. Show 6–7 moments from his script plus a component kit, and wait for his "me encanta" before any Remotion work. Boards: `assets/styles/*/…board.html`.
5. **While building, keep the reference open next to the stills.** Compare element by element (caption chip, headline, sticker) before calling a piece done. If you delegate, the delegate gets the reference IMAGES and the token table, not a paragraph.
6. **Adapt only what the footage forces**, and say so. Example: Ali shoots indoors against a dark wall, Stiven shoots outdoors against a bright sky, so add a top scrim. Ali frames wider, so the caption chip sits lower (see §3).

## 2. Style kits (copy from `assets/styles/`)

### Claude-UI (`claude-ui/`) — liked (opus, sdlc, workflows reels)
- Cream `#FAF9F5` canvas, white cards (radius 36, border `#E8E6DC`, soft two-layer shadow), Source Serif 4 headlines, Inter UI text.
- The Claude spark goes only next to Claude.
- Menu component (from the claude.ai reference): 96 px rows, 64 px pastel icon tiles:
  - blue `#E4EEFA`/`#2F7FD8`
  - orange `#F9EBDD`/`#D98A2B`
  - purple `#EEEAF8`/`#8B72D2`
  - green `#E6F2E8`/`#3F9A5B`
  - clay `#F7E6DE`/`#D97757`
- Menu details: gray "Beta"-style chips, and a hover block that glides between rows with a big outlined cursor.
- Other pieces: an input box with a round send button, and a Docs-style `plan.md` card.
- Modes: full / card / off (voice-only animation; the camera shrinks toward the card shape while it leaves).
- `pieces.tsx` is the reference implementation: lift `Menu`, `InputBox`, `Cursor` and `PastelTile`.

### Ali Abdaal (`ali-abdaal/`) — liked a lot (MCP reel)
- Site tokens: Recoleta headlines, Elza body, cream `#F9F6F3`, ink `#1B1624`, yellow `#FDD46B`, sky `#5DCDF1`, peach `#FD976D`, hand-drawn squiggles.
- Shorts grammar:
  - Always a full-screen talking head (no card split); graphics float in the top band.
  - White soft-serif headlines whose words light up as spoken, keywords in gold italic `#F7C95B`.
  - Gold condensed-caps labels ("UNA PREGUNTA QUE ME HICE:"), and a pale aqua question card that types itself.
  - Logo stickers in white pills with a glow, chat bubbles, and floating glossy tiles.
  - Gold italic numerals in a drawn ellipse with a rainbow glow, and huge gold numbers ("S/ 0").
  - Handwritten notes in mint, yellow, lilac and peach, with drawn arrows and underlines.
- Caption: a light chip `rgba(240,240,242,.95)`, dark Poppins 700, upcoming words gray `#9A9AA0`.
- Free stand-ins:
  - Fraunces variable with `"SOFT" 100` for Recoleta: download `Fraunces[SOFT,WONK,opsz,wght].ttf` (and Italic) from github.com/google/fonts and load it with FontFace + delayRender. `@remotion/google-fonts` has no SOFT axis.
  - Poppins, Gaegu (handwriting) and Oswald (caps) come from `@remotion/google-fonts`.
- `ali.tsx` primitives: Beat, Appear, Head, Label, Hand, Doodle, Pill, Bubble, Tile, Big, Num, Sparkles, DashCard, Chip, QuestionCard and Cursor.
- `Head` and `words()` look up word times in `captions.json` via `cue()`, which throws on a missing word. `"*IA*=inteligencia"` shows «IA» on the word he actually said.

### Ali × Sketch (`ali-sketch/`) — liked a lot (fusion reel, 2026-09-28)
The user asked to fuse Ali and Claude-UI. Two rounds settled it: Claude-UI *graphics* next to Ali looked "raro", and Excalidraw *boxes* lost to Ali's. What survived:
- **Elements are Ali's**: white rounded boxes with a colored icon circle (`ABox`: 58 px dot `#A5D8FF`/`#FDD46B`/`#8EF0A8`, Poppins 600 28 px), white cards with a big icon or glossy tile (`ACard`), glossy gradient tiles, a gold chip ("✦ IA"), pills, the huge gold number, Fraunces headlines with gold keywords, the light caption chip.
- **Strokes are Excalidraw's**: rough.js (the engine Excalidraw is built on) for arrows, loose ovals, underlines, strike-throughs and a double-pass zigzag scribble (`rough.tsx`: `rough.generator()` + `toPaths`, `pathLength=1` dash reveal, seeded so every frame matches, memoized by the shape's JSON). Handwritten notes use **Excalifont** (OFL; its Latin subset has á ñ ¡ ¿, unlike Gaegu which misses "á"), weight 400, in Ali's colors over the sky.
- **Movement is Claude-UI's, without the frame**: `LOWER` windows (320 px) slide the full-screen camera down; a blurred copy fills the gap with a 220 px top feather, the scrim grows, the caption chip rides up to y 868 above the hair. Use it for the explanation beats (diagrams), keep full frame for hook, opinions and CTA.
- **One macOS window per reel, max**: an Ali-styled window (white, radius 26, glow, traffic lights) with real-looking content (KPIs pop, bars grow) on the beat where the speaker names concrete software. More than one stops being special.
- Rejected on the way: X strike (too plain), Claude-UI input boxes/menus next to Ali, Excalidraw hachure boxes.
- Boards: `style-board.html` (final), `stroke-lab.html` (perfect-freehand vs rough.js vs p5.brush; the user picked rough.js). They expect frames `f*.jpg` from the video next to them (not committed).

### Liquid Glass (`liquid-glass/`) — REJECTED by the user ("interesante, pero no me gusta")
Keep it as a technique only. Per element, a canvas displacement map is built from a rounded-rect SDF (inward normal × (1−t)^2.4 inside the bezel). It feeds an SVG filter (feImage + blur + three feDisplacementMap passes for mild dispersion + saturate 1.18) applied via `backdrop-filter:url(#id)`, which works in Chrome and Remotion. macOS 27 tuning: a dark edge line, a brighter rim, and a `--t` tint from clear to tinted. Gotchas:
- Saturation above 1.2 turns glass over skin orange.
- Labels must sit above lens thumbs.
- Build nested glass innermost first.

## 3. Caption placement is about THIS speaker, not the reference

The reference creator's caption height does not transfer: Ali frames wider than Stiven.
- After the render, scan the chin band: `ffmpeg -i final.mp4 -vf "fps=1,crop=1080:760:0:900,scale=180:-1,tile=10x8"`. Look for any second where the chip touches the chin.
- For Stiven's close framing: chip center y 1462 (bottom edge on the 1500 safe line), font 44, and jump-cut punch-ins 1.06/1.12. With 1.10/1.17 and y 1400, the chip covered his chin whenever he leaned in.
