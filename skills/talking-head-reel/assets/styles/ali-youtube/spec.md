# Spec — Ali Abdaal YouTube style (long-form), adapted to 9:16

Reference: Ali's YouTube video 6-ZxPvpV8ec ("If you're ambitious but feel stuck…"), frames in `ref/yt-*.jpg`, contact sheets `ref/sheet*.jpg`, user screenshots (7 images). This is NOT the Shorts kit (`ali-abdaal/`): no gold, no handwriting, no caption chip.

## Tokens (sampled)
| Token | Value | Source |
|---|---|---|
| Canvas | `#F7F7F5` | chart / text slides (sampled at 854x480, 2026-10-09) |
| Band (wide flat S: enters grazing the bottom edge, exits the right edge, ends cropped by the frame) | `#ECE7E4` | every canvas scene; `TopBand` variant for split layouts |
| Panel | `#FFFFFF`, radius ~40, shadow `0 20px 60px rgba(60,40,20,.08)` | 10x tiles, distribution |
| Tile | `#FBF7F4`, 1.5px border `#EFE9E4`, radius 32 | 10x tiles |
| Ink | `#1C1A19` | text slides, chart line |
| Orange (keyword on cream, icon circle, badge) | `#F17E3C` | "stating a fact", ×10 |
| Salmon (keyword over footage, tooltip, chat pill) | `#FF8675` / text `#F4937A` | "$50 million", "-£1,000" |
| Sky pill (second chat voice) | `#5CC6EE` | chat pills |
| Green (icon circle) | `#7DC88E` | Income / Relationships |
| Lilac (camera card border, chapter line + pill) | `#B9B4F2` / `#C7B6F8` | camera card, "Step 2" |
| Chapter bg | `#FBEDE6` | "The 10x Question" |
| Axis label | `#444240` Inter 500 | chart years |

## Type
- Headlines / text slides / pills: soft high-contrast serif → **Fraunces** (opsz 72, SOFT 30, wght 560; keywords 700).
- UI labels ("Data source", axis years): **Inter** 500.

## Devices
1. Full-frame text beside the head: white serif, keyword salmon bold, words blur-in one by one (incoming word blurred + gray).
2. Canvas scene: camera card (rounded 36, 3px lilac border) + graphic on cream with the swoosh.
3. Full canvas text slide (ink serif, orange keyword) that slides UP over the camera with vertical motion blur.
4. White panel with tiles (orange/green icon circles + tilted orange badge pills).
5. Chat pills (salmon / sky, white serif text) stacking.
6. Strike pill over footage (salmon pill, struck text) + white serif pills ("Business", "Job").
7. Flow row under a wide camera card: label (Inter gray) over white pill with logo, dotted connectors.
8. Chapter card: serif title + lilac line that drops into a lilac "Step" pill.
9. Scale (balance) illustration for comparisons.

## Adaptations forced by the footage (say so to the user)
- Ali's dark interior keeps white text readable; Stiven shoots under a bright sky → top scrim behind full-frame text.
- 16:9 → 9:16: "camera left + graphic right" becomes "graphic panel on top + camera card below"; caption lane y 860–1010.
- Ali's YouTube has no running captions; the reel needs them → serif captions with his blur-in word reveal, no chip.
