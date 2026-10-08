# Style spec — Claude IG carousels (refs in ref/ig/)

Sources: instagram.com/p/DduIElvIG_N (effort levels), /p/DeEsQBioDT3 (Sonnet 5.5), /p/DbL-LYLoOBp (model vs effort).
Slides downloaded at 640 px (`ref/ig/*_N.jpg`), contact sheets `ref/ig/sheet-*.jpg`. Carousels are panoramic: one canvas split across slides.

## Tokens (sampled)
| Token | Hex | Where |
|---|---|---|
| Grid paper bg | `#F0F1EB` + 1 px grid `#E4E6DE`, ~34 px cell at 1080 | DbL |
| Warm stone bg | `#DEDCD0` | DduIElvIG_N |
| Ivory bg | `#F3F2EC` | DeEs |
| Clay tile | `#D97757` (sampled #D67555–#DA7757) | DeEs icon tiles, "Fable" tab |
| Ivory box | `#F5F4ED` | DbL hand boxes |
| Peach box | `#EBC9B7` | "Raise the effort" |
| Sand box | `#E3DACB` | "Change the model" |
| Blue-gray tab | `#C0D2DE` | "Effort controls…" tilted tab |
| Sage tab | `#C9D6CB` | "Opus at low effort" |
| Gray panel | `#E8E6DF` | DeEs right-column boxes |
| Ink | `#141413` | strokes, text |
| Line colors | pink `#C2668A`, green `#5E9C7C`, blue `#6E9CC8`, amber `#E5A852`, violet `#8B7BC9` | Ddu metro lines + code chips |

## Devices
- Hand-drawn rounded boxes: black ~4.5 px wobbly outline, solid pastel fill, single pass (smoother than Excalidraw: rough.js roughness ≈0.6, no multi-stroke).
- Tilted label tab (−4°) overlapping a box's top-left edge, in a pastel or clay fill.
- Curved hand arrows with open chevron heads; straight hand connector lines.
- Clay square tiles (radius ~6) with thick black line icons (white-filled shapes).
- Colored orthogonal "metro" lines with rounded corners connecting cards (Ddu); colored mono code chips (`low`, `medium`).
- White real-UI cards (menu "Opus 5 / Fable 5 / Sonnet 5 / Effort ›", "Low…Max") next to the hand-drawn layer: real UI + hand diagram mixed.
- Small caps clay labels with tracking ("CODING", "RECURRING AGENT WORK").
- Headlines: Anthropic Serif → stand-in Source Serif 4 (400/500). Box text: Anthropic Sans (Styrene-like) → stand-in DM Sans 500/600.
- Thinking chip: white card, spark + serif italic "Mulling…" (spark only because it is Claude's own indicator).

## Files in this kit
- `hand.tsx`: rough.js strokes (box, line, arrow, measured strike), draw-on, boil, chalk icons, tile icons, `textWidth`.
- `pieces.tsx`: the cursos-ia scenes (reference implementation, cues tied to that reel's captions).
- `Captions.tsx`: serif captions (smoke chip over camera, ink on paper) with `HIDE` windows.
- `Camera.tsx`: eye-line anchoring (`FACE_Y` 0.479, anchor full 0.51 / card 0.47), punch-ins 1.06/1.12, `LOWER` close.
- `theme.ts`: `H` carousel tokens + DM Sans.
- `style-board.tpl.html`: animated board; it expects to live in `videos/<slug>/work/`, frames in `../ref/f*.jpg`, rough.js from the repo `node_modules`, and `__LOGOS__` replaced with the logos JSON.
- `SFX-CREDITS.md`: the CC0 stroke recordings.
