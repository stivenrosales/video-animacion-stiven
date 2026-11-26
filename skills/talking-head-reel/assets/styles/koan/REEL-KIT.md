# Koan "cercano" reel kit (batch recorded 2026-11-25)

How to build one talking-head reel in the look Stiven approved on the pilot. The pilot is the reference
implementation: `videos/2026-11-25-sfx-elevenlabs/` (read `src/Main.tsx`, `src/theme.ts`, `src/Root.tsx`,
`scripts/data.py`). Watch its approved preview first: `out/preview-v5.mp4` (extract frames with ffmpeg).

## What he approved (do not regress)

- **He is the protagonist.** Camera full frame most of the time; nothing ever covers his face, chin or hair.
- **Captions:** one word at a time, Satoshi 700, 84 px, arena `#E4DFD3`, top y 1405, 8 px rise in 0.12 s, no chip.
  One or two "heavy" words per reel at 150 px (merged, upper case). CTA words in moss `#8FA85A`.
  A sumi floor gradient sits under the caption because he wears a white polo in daylight.
- **Camera:** punch-in BY CUT (1 ↔ 1.12, never animated, at most one toggle every 2.5 s, origin 50% 38%),
  breathing 1 → 1.035 (never below 1). Zoom-outs are allowed too (he asked for them): pin the top, never
  show empty borders (full width is the zoom-out limit).
- **Cutaways:** hard cut to a sumi screen (`radial-gradient(60% 40% at 50% 42%, #26261F, #1A1A18 70%)`) with ONE
  element that explains what he is saying right then: a real waveform, a straight dark window with rows that
  enter one by one, a big moss number, a chapter numeral. Captions keep running underneath.
- **Pill tag:** centered at top 300, mono 28 px upper case on `rgba(26,26,24,.82)`, moss dot that pulses on a cue.
- **Pen icons:** small fine-ballpoint drawings (Kie GPT Image 2.6, `scripts/kie_icons.py` style `b`, masked by
  `scripts/ink_mask.py`), 190 px, sumi, centered ABOVE his head (left 445, top 290), wiped in like a stroke.
  They highlight a thing he names. Never at the same time as a pill tag. Not tilted.
- **Brands:** the official logo of every tool he names, downloaded from the brand's own site (press/brand page
  or the site's own SVG), never redrawn. Claude's orange spark only next to the word Claude.
- **Motion:** Koan ease `cubic-bezier(.32,.72,0,1)`; elements "rise" (24 px + 8 px blur → sharp); rows cascade;
  no bounces, no particles, no spins, nothing tilted, no badge straddling a card edge, no two elements
  overlapping mid-transition, never an empty panel waiting for its first cue.
- **Sound (Ali Abdaal's approach):** many varied effects, each tied to something visible, all far below the
  voice (accents 0.14–0.2 volume against a -14 LUFS voice, about 2–4 cues per 10 s). Approved files, reusable from
  `videos/2026-11-25-sfx-elevenlabs/public/`: `whoosh.mp3` (airy), `trans.mp3` (warm low dry whoosh),
  `enter.mp3` (hand passing a mic: THE sound for entering a cutaway), `click.mp3` (thocky key), `pop.mp3`,
  `chime.mp3`, `sparkle.mp3` (glockenspiel), `typing.mp3`. Going back to the camera is silent.
  Every whoosh-like file has a swell: measure its peak time and cue it at (moment − peak). `enter.mp3` peaks at 0.36 s.
  New effects: `scripts/sfx_eleven.py` (ElevenLabs `eleven_text_to_sound_v3`); prompt a physical action + object +
  setting ("a small brass bar chime brushed once with a fingertip, close microphone, quiet studio"), never a
  category ("soft sparkle"). Peak-match new files to -3 dB.
- **Music:** Suno lo-fi/acoustic bed under the WHOLE video (`scripts/suno.py`, tracks in the pilot's `work/music/`:
  `lofi-2.mp3`, `acoustic-1.mp3`, `acoustic-2.mp3` are unused; generate more so reels do not all share one track).
  `loudnorm I=-18`, volume ≈ 0.11, 0.8 s fade in, 1.5 s fade out. It may swell where the script calls for it.
- **Voice:** DeepFilterNet on a -3 dB copy (`~/.local/dfn/deep-filter-0.5.6-aarch64-apple-darwin -a 20 -o dfn voice-in3.wav`,
  the binary is not on PATH), then `voice.py dfn/voice-in3.wav voice-dfn.wav --raw` (-14 LUFS). No EQ/compressor chain.

## His words come first

- Cut only silences and retakes. A retake is an earlier version of an idea he restarts and says better, even
  with different wording; keep the LAST version. Never remove real content, and re-read the joined text: it must
  make sense as one thread. List every removed fragment (quoted) in your report.
- Whisper hides stumbles on whole takes and can skip whole sentences. Use `python3 tools/islands.py AUDIO 0.15`
  on the source AND on the edit (it transcribes each speech island separately through OpenRouter). Place a
  mid-sentence cut edge with `python3 tools/zoom.py <video-dir> A B` plus a 25 ms RMS scan; verify each splice by
  transcribing a short chunk around it.
- Captions come from a transcription of the EDITED audio (`scripts/data.py` pattern: word timestamps from
  OpenRouter Whisper turbo, gaps filled from separate chunks). Read every caption word against the islands
  transcript; fix mishearings in `FIX`.
- Spellings: Claude, Claude Code, MCP, ChatGPT, WhatsApp, WAHA, Evolution API, ManyChat, HeyTaco, Propi, Zenbox,
  Airtable, Meta Ads, SAP, Platzi (Freddy Vega), Whisper, Google Meet, Google Drive, Polar.sh, Kie, Higgsfield,
  GPT Image 2.6, Opus, vibe coding, open source, Huancayo, Lima. If a name is unclear in the audio, do not show
  it large on screen and flag it in the report. Never invent a URL, a number or a claim he did not say.

## Pipeline for one video (run from the repo root unless noted)

Each folder `videos/2026-11-25-<slug>/` already has `work/src.mp4` (SDR, no tonemap needed), `work/audio.wav`
(16 kHz, the silence source: never overwrite), `work/words.json`, `work/islands-src.txt` and a draft cut in
`scripts/cut.py` (`MANUAL_CUTS` with notes; NOT yet approved: verify and improve it).

1. Cut: adjust with `python3 tools/setcut.py <dir> START END LAST_WORD_END 'a-b:note' …`; check with
   `tools/cutcheck.sh <dir>` (720p preview + `work/islands-edit.txt`), then `tools/cutcheck.sh <dir> --master`
   for `public/edited-raw.mp4` (1440x2560, slow: run it once, when the cut is final).
2. Voice: extract 48 kHz audio of the master → DeepFilterNet → `voice.py --raw` → mux into `public/edited.mp4`;
   make `public/proxy.mp4` (720x1280, crf 20, `-g 15`) with the same audio.
3. Copy from the pilot: `src/theme.ts`, `src/Root.tsx`, `src/index.ts`, `src/Main.tsx` (as a starting point),
   `scripts/{data.py,sfx_eleven.py,kie_icons.py,ink_mask.py,suno.py}`, `public/Satoshi-Variable.woff2` and the
   sound files. Delete the template scenes you do not use. Rename the compositions `<Name>Reel` and
   `<Name>ReelPreview`; set `DURATION_SEC` to the edit's length.
4. Write the beat map from the word timestamps, then build. Every graphic must explain the spoken idea
   (decorative b-roll was rejected). Ideas for longer explanations: step rows, a before/after window, a real
   screenshot or repo card with a `FUENTE` mono line, a big number, a chapter numeral, a branded animated
   element. Kie images come back as PNG; vectorize line art with `potrace` (installed) when you want to animate
   parts as SVG paths, and keep brand colors from the brand's own assets.
5. Preview: `npx remotion render <dir>/src/index.ts <Name>ReelPreview <dir>/out/preview-v1.mp4
   --public-dir=<dir>/public --scale=0.5 --image-format=jpeg --jpeg-quality=80 --crf=24 --concurrency=4 --log=error`
   (about 30 s per 50 s of video). Check stills at every beat (`npx remotion still … --frame=N --scale=0.4`) and
   look at them: face never covered, caption readable, x=540 centering, safe area (top 250, bottom 1500, x<940).
6. Do NOT run the full-quality render; the orchestrator does it after the aesthetic review.

## Machine rules

One heavy job at a time (ffmpeg encodes, Remotion renders, local Whisper): never in parallel, prefix long ones
with `nice -n 10`. Keys live in the repo `.env` (`ELEVENLABS_API_KEY`, `OPENROUTER_API_KEY`) and
`~/cartas-sofia/.env` (`KIE_API_KEY`); read them inside scripts, never print them. Kie images cost about 8
credits each: generate what the video needs, not dozens.

## Facts you may show (from Stiven's own notes, verified 2026-11-26)

- Propi: open-source alternative to HeyTaco for Slack (recognition with 🌮, balance ledger, rewards store). Public repo
  `github.com/stivenrosales/propi` (AGPL-3.0), live at `propihq.com`. First client migrated from HeyTaco with 15 users.
- Zenbox: his WhatsApp MCP product, `usezenbox.com` (he says "Zenbox"; Whisper hears "Sandbox/Sendbox").
- When he says "el link" or "aquí está", show the real address above as a pill tag or a repo card with a FUENTE line.
  For anything else, never invent an address.

## Lessons from the batch (nine reels, 2026-11-26)

What the aesthetic reviewers kept sending back. Build with these from the start.

- **No thin cutaways.** A cutaway never shows only a title for more than 0.5 s, never a dimmed placeholder, a lone
  numeral or a window with an empty body. Hold the camera until the cutaway has content.
- **Density (Ali's rhythm):** about 1.7–2 devices per 10 s (punch-in, pill, pen icon, cutaway, big word);
  cutaways take 25–35% of the runtime; never three pills in a row.
- **Pills** stay at least 0.9 s after the last word they illustrate. Labels are 30 px or larger.
- **Pen icons:** 150–170 px (190 px touched his hair), top at y 250 or lower, clear of the hair on the neighbouring
  frames, never together with a pill.
- **Everything inside x 140–940, y 250–1500**, tall captures included: crop them, do not shrink the text.
- **Moss means positive or CTA.** The closing question goes in moss from its first word.
- **Sound:** 2–4 cues per 10 s at 0.2 volume or less, never the same file three times in a row.
- **Labels never claim more than he said.** "que yo lo gestione por ti" is not "yo lo gestiono por ti"; a shop
  icon implied his company is a shop; a window title he never named was removed. Quote him or stay generic.
- **A repeated closing line** ("¿Qué opinas?" twice): keep the LAST one, so the edit ends with its breath.
- **Real things on screen:** show the real repo or site only after checking it is public (`gh repo view`), and
  capture the real page instead of drawing a lookalike.

## Running a batch with subagents

One builder per video and one read-only aesthetic reviewer per video worked, because this kit is the brief.
The orchestrator sends ONE consolidated fix list per round, reads a contact sheet of the new preview
(`ffmpeg -i preview.mp4 -vf "fps=1/2.8,scale=216:-1,tile=8x3" -frames:v 1 sheet.jpg`; use `-fps_mode vfr`, this
ffmpeg has no `-vsync`), then runs `tools/finalize.sh <slug> <Comp>`.

- Heavy jobs stay serial across all agents: prefix them with `tools/wait-heavy.sh &&`. A `pgrep -f` wait loop
  matches the other waiting shells and deadlocks.
- Light work (cut analysis, asset downloads, stills) can run in parallel.
- A builder can go idle after its render without reporting: check `out/` before waiting longer.
- Do not let a reviewer start while the builder is still re-rendering the same preview.
- Scripts must never print a key, tracebacks included: catch the request error and print only the status code.
- Nobody in this loop hears the audio. Levels are measured; the user still does the listening pass.
