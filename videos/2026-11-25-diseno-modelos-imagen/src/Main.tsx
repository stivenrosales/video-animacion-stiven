import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowUp, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import rawWords from "./words.json";
import { C, MONO, SANS, prog, rise } from "./theme";

const EASE_IO = Easing.inOut(Easing.cubic);
const SOFT = "#B9B3A6";
const GREY = "#55554E";
const CLAUDE = "claude.png"; // Claude's spark: only ever next to the word Claude
const OPENAI = "openai-blossom-white.svg"; // openai.com/brand → openai-logos.zip (GPT Image 2.6 is OpenAI's model)
const KIE = "kie-logo.png"; // kie.ai/logo.png
const HIGGS = "higgsfield-icon.png"; // higgsfield.ai/icon.png
/** Example designs generated for this reel with Kie GPT Image 2.6 (scripts/kie_examples.py). Never his client work. */
const WEBS = ["webs/ej-1.jpg", "webs/ej-2.jpg", "webs/ej-3.jpg"];
/** His own public sites (top of each landing page, 1100 px wide and tall, captured 2026-11-26): public/webs/web-N.png + its domain.
 *  The orchestrator picked these two by inference; swap the files and the domains to show others. */
const SITES: Array<[string, string]> = [["webs/web-1.png", "propihq.com"], ["webs/web-2.png", "usezenbox.com"]];

// ---------- timeline (seconds on the edited video) ----------
const END = 66.18;
/** Full-screen sumi cutaways: one explaining element each, hard cut in and out. */
const CUT_A: [number, number] = [11.52, 15.16]; // "mi límite estético era lo que le pedía a Claude en las referencias"
const CUT_W: [number, number] = [21.83, 25.75]; // "las webs que he diseñado, estas que están aquí"
const THESE_AT = 22.97; // "estas que están aquí"
const BOTH_AT = 24.3; // both sites, stacked
const CUT_L: [number, number] = [28.22, 35.6]; // "a Image 2.6, y después reimaginaba esto y hacía como un bucle de tres veces para ver diferentes opciones"
const CUT_K: [number, number] = [48.45, 54.14]; // "API de Kie, que es un proveedor tipo Higgsfield, pero mucho más barato para modelos de imagen y video"
const CUTAWAYS = [CUT_A, CUT_W, CUT_L, CUT_K];
const TAG_TALK: [number, number] = [1.4, 4.4]; // "esta charla de diseño y vibe coding"
const TAG_OPUS: [number, number] = [26.11, 27.95]; // "Opus, pedía con un prompt"
const TAG_100: [number, number] = [56.1, 57.95]; // "100 imágenes que generar"
const TAG_KIE: [number, number] = [59.25, 61.1]; // "si deseas probarlo, lo puedes hacer desde ahí"
const CTA_AT = 60.88; // "¿Y tú? ¿El criterio estético…"

const VIBE_AT = 2.6; // "y vibe coding"
// cutaway A: what he asked Claude, and the references
const ASK_AT = 13.28; // "lo que le pedía"
const TYPE_AT = [11.9, 12.4, 12.85]; // the prompt gets typed while he says "mi límite estético"
const REFS_AT = 14.29; // "en las referencias"
// cutaway L: the loop between Opus and GPT Image 2.6
const L_V1 = 28.7; // the first image lands while he says "Image 2.6"
const L_BACK = 30.16; // "reimaginaba"
const L_V2 = 31.2; // "esto"
const L_LOOP = 32.62; // "bucle"
const L_X3 = 33.02; // "tres"
const L_V3 = 33.24; // "veces"
const L_OPTIONS = 34.38; // "diferentes opciones"
// cutaway K: Kie
const K_PROVIDER = 49.95; // "que es un proveedor"
const K_HIGGS = 50.05; // "tipo Higgsfield"
const K_CHEAP = 51.07; // "pero mucho más barato"
const K_MODELS = 52.24; // "para modelos de"
const K_IMAGE = 52.98;
const K_VIDEO = 53.3;
const HEAVY_AT = 39.14; // "BUENOS"
const OPINION: [number, number] = [64.98, END]; // the closing "¿Qué opinas?"

/** enter.mp3 swells for 0.36 s before its peak, so each entry cue starts early; going back to the camera is silent. */
const ENTER_PEAK = 0.36;
/** Sound cues, Ali Abdaal's approach: many varied effects, each tied to something visible, all far below the voice.
 *  [second, file, volume]. check.mp3 is the ballpoint mark; whoosh.mp3 peaks 0.29 s in. */
const CUES: Array<[number, string, number]> = [
  [TAG_TALK[0] - 0.04, "trans.mp3", 0.18], // hook tag: charla de diseño
  [VIBE_AT + 0.1, "chime.mp3", 0.1], // the tag grows "vibe coding"
  [6.02 - 0.1, "check.mp3", 0.18], // brush mark: "la parte estética"
  [CUT_A[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway A
  [TYPE_AT[0] - 0.1, "typing.mp3", 0.14], // the prompt gets typed
  [REFS_AT + 0.1, "pop.mp3", 0.13], // the references attach
  [17.04 - 0.1, "check.mp3", 0.18], // picture mark: "modelos de imagen"
  [CUT_W[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway W
  [TAG_OPUS[0], "click.mp3", 0.16], // tag: Claude Opus
  [CUT_L[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway L
  [L_V1, "sparkle.mp3", 0.14], // the first generated image
  [L_V2 + 0.15 - 0.29, "whoosh.mp3", 0.13], // second version wipes in
  [L_V3, "pop.mp3", 0.13], // third version wipes in
  [L_OPTIONS, "sparkle.mp3", 0.12], // the three options light up
  [HEAVY_AT - 0.02, "thud.mp3", 0.2], // "BUENOS" (with the punch-in)
  [CUT_K[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway K
  [K_PROVIDER, "click.mp3", 0.14], // the "proveedor" window
  [K_CHEAP + 0.1, "coin.mp3", 0.16], // "mucho más barato"
  [54.16 - 0.04, "trans.mp3", 0.18], // "5 DÓLARES": the hard cut back to him lands on it
  [TAG_100[0] - 0.15, "tick.mp3", 0.13], // tag: ~100 imágenes
  [TAG_KIE[0], "click.mp3", 0.14], // tag: API de Kie
  [CTA_AT, "chime.mp3", 0.1], // the question turns moss
  [OPINION[0] - 0.1, "check.mp3", 0.16], // speech bubble mark: "¿Qué opinas?"
];
const CUE_LEN: Record<string, number> = { "tick.mp3": 1.5, "sparkle.mp3": 1.25 };
/** Suno bed under the whole video (scripts/suno.py "airy" → work/music/airy-1.mp3, loudnorm -18). */
const MUSIC = 0.11;
const musicVolume = (t: number) =>
  interpolate(t, [0, 0.8, END - 1.5, END], [0, MUSIC, MUSIC, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IO });

/** Small hand-drawn marks, fine ballpoint line (Kie GPT Image 2.6, scripts/kie_icons.py style "b" → scripts/ink_mask.py),
 *  drawn when he names the thing. [in, out, file, size, center y]. Centered above his head, in sumi, never with a pill tag,
 *  always on the wide framing. */
const INK: Array<[number, number, string, number, number]> = [
  [6.02, 7.7, "pincel", 165, 335], // "la parte estética"
  [17.04, 19.0, "cuadro", 165, 335], // "modelos de imagen"
  [OPINION[0], OPINION[1], "burbuja", 165, 335], // "¿Qué opinas?"
];

const inside = (t: number, [a, b]: [number, number]) => t >= a && t < b;
const inCutaway = (t: number) => CUTAWAYS.some((c) => inside(t, c));

// ---------- camera ----------
/** Punch-in by cut: the framing toggles between 1 and 1.12 at these moments, never animated. The visible ones are at
 *  least 2.5 s apart: 8.32, 19.30, 39.14 ("BUENOS"), 42.31, 45.47, 57.41, 61.2 and 64.98.
 *  13.0 and 23.0 fall inside cutaways A and W and only set the wide framing he comes back in; he comes back from cutaway K
 *  already punched in, for "5 DÓLARES". */
const PUNCHES = [8.32, 13.0, 19.3, 23.0, HEAVY_AT, 42.31, 45.47, 57.41, 61.2, 64.98];
const punched = (t: number) => PUNCHES.filter((c) => c <= t).length % 2 === 1;

const Camera: React.FC<{ t: number; proxy: boolean }> = ({ t, proxy }) => {
  const breath = 1 + 0.0175 * (1 + Math.sin((t / 6) * Math.PI)); // 1 → 1.035, never below 1
  const scale = breath * (punched(t) ? 1.12 : 1);
  return (
    <AbsoluteFill style={{ opacity: inCutaway(t) ? 0 : 1 }}>
      <Video
        src={staticFile(proxy ? "proxy.mp4" : "edited.mp4")}
        style={{ width: 1080, height: 1920, objectFit: "cover", transform: `scale(${scale})`, transformOrigin: "50% 38%" }}
      />
      {/* daylight + white polo: a sumi floor so the arena word reads */}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(26,26,24,.82) 0%, rgba(26,26,24,.6) 20%, rgba(26,26,24,0) 44%)" }} />
    </AbsoluteFill>
  );
};

// ---------- captions: one word at a time ----------
type Word = { t: number; e: number; w: string; big?: boolean };
const HEAVY = ["buenos", "5 dólares"];
const WORDS: Word[] = (rawWords as Word[]).map((w) => (HEAVY.includes(w.w) ? { ...w, w: w.w.toUpperCase(), big: true } : w));

const Caption: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let k = 0; k < WORDS.length; k++) if (WORDS[k].t <= t) i = k;
  if (i < 0) return null;
  const w = WORDS[i];
  const until = Math.min(WORDS[i + 1]?.t ?? END, w.e + 0.9); // hold through short pauses, clear on long ones
  if (t >= until) return null;
  const p = prog(t, w.t, 0.12);
  const size = w.big ? 150 : 84;
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: w.big ? 1345 : 1405, textAlign: "center",
        fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: w.big ? -5 : -2.6, lineHeight: 1,
        color: t >= CTA_AT ? C.moss : C.arena, textShadow: t >= CTA_AT ? "0 2px 24px rgba(0,0,0,.6)" : "0 2px 18px rgba(0,0,0,.35)",
        opacity: p, transform: `translateY(${(1 - p) * 8}px)`,
      }}
    >
      {w.w}
    </div>
  );
};

// ---------- pieces ----------
const Sumi: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 42%, #26261F 0%, ${C.sumi} 70%)` }} />
);

const pulseAt = (t: number, at: number) => (t >= at && t < at + 0.5 ? 1 - (t - at) / 0.5 : 0);
const Dot: React.FC<{ pulse?: number; color?: string }> = ({ pulse = 0, color = C.moss }) => (
  <div style={{ width: 12, height: 12, borderRadius: 6, background: color, flexShrink: 0, transform: `scale(${1 + 0.7 * pulse})` }} />
);

/** A span that opens from zero width, so a label can grow a word when he says it. */
const Grow: React.FC<{ p: number; w: number; color?: string; children: React.ReactNode }> = ({ p, w, color, children }) => (
  <span style={{ display: "inline-block", width: w * p, opacity: p, overflow: "hidden", whiteSpace: "pre", color, filter: `blur(${(1 - p) * 6}px)` }}>{children}</span>
);

/** Pill tag over the camera: mono caps on sumi. A moss dot unless the content brings its own brand mark. */
const Tag: React.FC<{ t: number; win: [number, number]; pulses?: number[]; dot?: boolean; children: React.ReactNode }> = ({ t, win, pulses = [], dot = true, children }) => {
  if (!inside(t, win)) return null;
  const out = 1 - prog(t, win[1] - 0.3, 0.3);
  const pulse = pulses.reduce((v, at) => Math.max(v, pulseAt(t, at)), 0);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ ...rise(t, win[0]), display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 28, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "pre", color: C.arena, background: "rgba(26,26,24,.82)", padding: "16px 26px 17px", borderRadius: 999 }}>
        {dot ? <Dot pulse={pulse} /> : null}
        {children}
      </div>
    </div>
  );
};

const Dots: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <>{[0, 1, 2].map((i) => <div key={i} style={{ width: size, height: size, borderRadius: size / 2, background: "#3A3A36", flexShrink: 0 }} />)}</>
);
const Window: React.FC<{ t: number; at: number; top: number; title: React.ReactNode; titleSize?: number; children: React.ReactNode }> = ({ t, at, top, title, titleSize = 30, children }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: 140, right: 140, top, background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.35)`, padding: "36px 46px 46px" }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", height: 34, fontFamily: MONO, fontSize: titleSize, color: SOFT, marginBottom: 30, whiteSpace: "pre" }}>
      <Dots />
      <span style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 14 }}>{title}</span>
    </div>
    {children}
  </div>
);
/** The window title "Claude", with its spark. */
const ClaudeTitle: React.FC = () => (
  <span style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: -0.6, color: C.arena }}>
    <Img src={staticFile(CLAUDE)} style={{ height: 34 }} />
    Claude
  </span>
);

/** A pen mark tinted with any Koan color through a CSS mask. */
const Mark: React.FC<{ name: string; size: number; color: string; style?: React.CSSProperties }> = ({ name, size, color, style }) => {
  const url = staticFile(`ink/${name}.png`);
  return (
    <div
      style={{
        width: size, height: size, background: color,
        WebkitMaskImage: `url(${url})`, maskImage: `url(${url})`, WebkitMaskSize: "contain", maskSize: "contain",
        WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", ...style,
      }}
    />
  );
};

/** A pen mark above his head: wipes in left to right like a stroke, fades out. */
const Ink: React.FC<{ t: number; win: [number, number]; name: string; size: number; y: number }> = ({ t, win, name, size, y }) => {
  if (!inside(t, [win[0], win[1] + 0.3])) return null;
  const p = prog(t, win[0], 0.45);
  const out = win[1] >= END ? 1 : 1 - prog(t, win[1], 0.3);
  return <Mark name={name} size={size} color={C.sumi} style={{ position: "absolute", left: 540 - size / 2, top: y - size / 2, opacity: out, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, transform: `scale(${0.96 + 0.04 * p})` }} />;
};

/** Cutaway titles start this early, so the first frame after the hard cut already shows them about 60% in. */
const HEAD_LEAD = 0.1;
/** Header of a cutaway: an optional mark and a short title, centered at the top of the safe area. */
const Head: React.FC<{ t: number; at: number; text: string; mark?: React.ReactNode; size?: number; top?: number }> = ({ t, at, text, mark, size = 76, top = 290 }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
    {mark}
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -2.4, lineHeight: 1, color: C.arena }}>{text}</div>
  </div>
);

const Bar: React.FC<{ w: number | string; h?: number; color?: string; style?: React.CSSProperties }> = ({ w, h = 12, color = GREY, style }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: color, flexShrink: 0, ...style }} />
);
/** A stroke that draws itself along an SVG path. */
const Line: React.FC<{ d: string; p: number; color?: string }> = ({ d, p, color = C.mute }) => (
  <path d={d} stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0} />
);
/** The message box of a chat: bars that get typed one by one, a caret and a (grey) send button. */
const Composer: React.FC<{ t: number; at: number; typeAt: number[] }> = ({ t, at, typeAt }) => {
  const typed = [150, 110, 190].map((w, i) => w * interpolate(t, [typeAt[i], typeAt[i] + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const caret = Math.floor(t * 2.5) % 2 === 0;
  return (
    <div style={{ ...rise(t, at, 0.45, 16, 6), height: 96, boxSizing: "border-box", borderRadius: 28, boxShadow: `inset 0 0 0 2px #3A3A36`, background: "#1E1E1C", padding: "0 18px 0 30px", display: "flex", alignItems: "center", gap: 12 }}>
      {typed.map((w, i) => (w > 0 ? <Bar key={i} w={w} h={14} color="#8C877C" /> : null))}
      <div style={{ width: 3, height: 40, background: C.arena, opacity: caret ? 1 : 0 }} />
      <div style={{ flex: 1 }} />
      <div style={{ width: 60, height: 60, borderRadius: 30, background: "#3A3A36", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ArrowUp size={34} strokeWidth={2.6} color={C.mute} />
      </div>
    </div>
  );
};
const Label: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ fontFamily: MONO, fontSize: 32, lineHeight: 1, color: C.arena, whiteSpace: "pre", ...style }}>{children}</div>
);
/** One example design. `wipe` 0→1 slides it in from the left with a clean edge (nothing blends). */
const Shot: React.FC<{ src: string; w: number; wipe?: number; style?: React.CSSProperties }> = ({ src, w, wipe = 1, style }) => (
  <Img src={staticFile(src)} style={{ width: w, height: Math.round((w * 2) / 3), objectFit: "cover", borderRadius: 14, display: "block", clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0 round 14px)`, ...style }} />
);

// ---------- cutaways ----------
/** A: his old ceiling. Claude's chat: the prompt he typed, then the references he attached. Nothing here is moss. */
const CutA: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT_A[0];
  const grow = prog(t, REFS_AT - 0.15, 0.4); // the window is as tall as its content: it grows when the references arrive
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={a - HEAD_LEAD} text="mi límite estético" />
      <Window t={t} at={a - 0.2} top={440} title={<><ClaudeTitle /><span style={{ marginLeft: 6 }}>· chat</span></>}>
        <Composer t={t} at={a - 0.1} typeAt={TYPE_AT} />
        <Label style={{ ...rise(t, ASK_AT, 0.4, 10, 6), marginTop: 22, color: SOFT }}>lo que le pedía</Label>
        <div style={{ height: 262 * grow, overflow: "hidden" }}>
          <div style={{ height: 1.5, background: C.line, margin: "34px 0 30px" }} />
          <div style={{ display: "flex", gap: 18 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ ...rise(t, REFS_AT + i * 0.09, 0.4, 14, 6), flex: 1, height: 130, borderRadius: 16, background: "#2A2A27", boxShadow: "inset 0 0 0 2px #3A3A36", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImageIcon size={54} strokeWidth={1.8} color={C.mute} />
              </div>
            ))}
          </div>
          <Label style={{ ...rise(t, REFS_AT + 0.1, 0.4, 10, 6), marginTop: 22, color: SOFT }}>las referencias</Label>
        </div>
      </Window>
    </AbsoluteFill>
  );
};

/** W: "las webs que he diseñado, estas que están aquí". The proof: his sites, one at a time and tall (the page drifts
 *  up slowly), each in a straight window titled with its domain; then both stacked. Hard swaps, nothing overlaps. */
const SITE_HEAD = 84;
const Site: React.FC<{ t: number; at: number; top: number; h: number; site: [string, string]; drift?: number }> = ({ t, at, top, h, site, drift = 0 }) => (
  <div style={{ ...rise(t, at, 0.45, 18, 8), position: "absolute", left: 140, right: 140, top, height: h, background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.35)`, overflow: "hidden" }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", height: SITE_HEAD, padding: "0 34px", fontFamily: MONO, fontSize: 34, color: C.arena }}>
      <Dots />
      <span style={{ marginLeft: 14 }}>{site[1]}</span>
    </div>
    <div style={{ position: "relative", height: h - SITE_HEAD, overflow: "hidden" }}>
      <Img src={staticFile(site[0])} style={{ position: "absolute", left: 0, top: -drift, width: 800, display: "block" }} />
    </div>
  </div>
);
const CutW: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT_W[0];
  const drift = (from: number, to: number) => interpolate(t, [from, to], [0, 110], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Sumi />
      {t < THESE_AT ? <Site t={t} at={a - 0.2} top={270} h={1070} site={SITES[0]} drift={drift(a, THESE_AT)} /> : null}
      {t >= THESE_AT && t < BOTH_AT ? <Site t={t} at={THESE_AT - 0.2} top={270} h={1070} site={SITES[1]} drift={drift(THESE_AT, BOTH_AT)} /> : null}
      {t >= BOTH_AT ? <Site t={t} at={BOTH_AT - 0.15} top={270} h={520} site={SITES[0]} /> : null}
      {t >= BOTH_AT ? <Site t={t} at={BOTH_AT - 0.06} top={820} h={520} site={SITES[1]} /> : null}
    </AbsoluteFill>
  );
};

/** L: the loop. Claude Opus writes the prompt, GPT Image 2.6 draws it, it gets reimagined, three rounds, three options. */
const NODE = { top: 290, h: 120, w: 340 };
const LOOP_Y = 474; // the return path runs under both nodes
const Node: React.FC<{ t: number; at: number; left: number; lit?: number; children: React.ReactNode }> = ({ t, at, left, lit = 0, children }) => (
  <div style={{ ...rise(t, at, 0.5, 20, 8), position: "absolute", left, top: NODE.top, width: NODE.w, height: NODE.h }}>
    <div style={{ width: NODE.w, height: NODE.h, boxSizing: "border-box", background: C.win, borderRadius: 24, boxShadow: `0 0 0 ${1.5 + 2.5 * lit}px ${lit > 0 ? C.moss : C.line}, 0 30px 80px rgba(0,0,0,.3)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: -1, color: C.arena, whiteSpace: "pre" }}>
      {children}
    </div>
  </div>
);
/** The moss dot that runs the loop once on "bucle": Opus → Image → back under both. */
const LAP: Array<[number, number]> = [[310, 290 + 60], [770, 290 + 60], [770, LOOP_Y], [310, LOOP_Y], [310, 290 + 120]];
const lapPoint = (p: number): [number, number] => {
  const seg = LAP.slice(1).map(([x, y], i) => Math.abs(x - LAP[i][0]) + Math.abs(y - LAP[i][1]));
  let d = p * seg.reduce((s, v) => s + v, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) return [LAP[i][0] + ((LAP[i + 1][0] - LAP[i][0]) * d) / seg[i], LAP[i][1] + ((LAP[i + 1][1] - LAP[i][1]) * d) / seg[i]];
    d -= seg[i];
  }
  return LAP[LAP.length - 1];
};
const CutL: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT_L[0];
  const version = t >= L_V3 ? 2 : t >= L_V2 ? 1 : 0;
  const landed = [L_V1, L_V2, L_V3];
  const wipe = version === 0 ? 1 : prog(t, landed[version], 0.4);
  const lap = interpolate(t, [L_LOOP, L_LOOP + 0.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IO });
  const [dx, dy] = lapPoint(lap);
  const x3 = prog(t, L_X3, 0.4);
  const lead = a - 0.35; // the three pieces of the top row are already in on the first frame
  const finale = t >= L_OPTIONS;
  return (
    <AbsoluteFill>
      <Sumi />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* forward: Opus → Image, already drawn on the first frame */}
        <Line d="M484 350 H590" p={prog(t, lead, 0.3)} color={SOFT} />
        <Line d="M578 338 L592 350 L578 362" p={prog(t, lead + 0.2, 0.15)} color={SOFT} />
        {/* back: under both nodes, on "reimaginaba" */}
        <Line d={`M770 414 V${LOOP_Y} H310 V424`} p={prog(t, L_BACK, 0.55)} />
        <Line d="M298 436 L310 422 L322 436" p={prog(t, L_BACK + 0.45, 0.2)} />
        {t >= L_LOOP && lap < 1 ? <circle cx={dx} cy={dy} r={9} fill={C.moss} opacity={Math.min(1, lap * 8)} /> : null}
      </svg>
      <Node t={t} at={lead} left={140} lit={pulseAt(t, L_BACK + 0.5)}>
        <Img src={staticFile(CLAUDE)} style={{ height: 42 }} />
        Claude Opus
      </Node>
      <Node t={t} at={lead} left={600} lit={pulseAt(t, L_V1 - 0.2)}>
        <Img src={staticFile(OPENAI)} style={{ height: 92, margin: "0 -26px 0 -30px" }} />
        GPT Image 2.6
      </Node>
      <div style={{ ...rise(t, lead, 0.4, 10, 6), position: "absolute", left: 480, width: 120, top: 296, textAlign: "center", fontFamily: MONO, fontSize: 28, lineHeight: 1, color: C.arena }}>prompt</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: LOOP_Y - 20, display: "flex", justifyContent: "center" }}>
        <div style={{ ...rise(t, L_BACK + 0.15, 0.4, 10, 6), display: "flex", alignItems: "center", background: "#1F1F1C", padding: "4px 20px", fontFamily: MONO, fontSize: 30, lineHeight: 1, color: C.arena, whiteSpace: "pre" }}>
          reimaginar
          <Grow p={x3} w={76} color={C.moss}> ×3</Grow>
        </div>
      </div>
      <Window t={t} at={L_V1 - 0.25} top={540} title={<><span style={{ color: C.arena }}>ejemplo</span> · GPT Image 2.6</>}>
        {finale ? (
          // "diferentes opciones": the three designs, large, one under another
          <div style={{ display: "flex", flexDirection: "column", gap: 21, height: 642 }}>
            {WEBS.map((src, i) => (
              <Img key={src} src={staticFile(src)} style={{ ...rise(t, L_OPTIONS + i * 0.09 - 0.1, 0.4, 14, 6), width: 708, height: 200, objectFit: "cover", objectPosition: "50% 42%", borderRadius: 14, display: "block" }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ position: "relative", width: 708, height: 472 }}>
              {version > 0 ? <Shot src={WEBS[version - 1]} w={708} style={{ position: "absolute", left: 0, top: 0 }} /> : null}
              <Shot src={WEBS[version]} w={708} wipe={wipe} style={{ position: "absolute", left: 0, top: 0, ...(version === 0 ? rise(t, L_V1 - 0.1, 0.5, 0, 14) : {}) }} />
            </div>
            <div style={{ display: "flex", gap: 21, marginTop: 22, height: 148 }}>
              {WEBS.map((src, i) => (t >= landed[i] ? (
                <div key={src} style={{ ...rise(t, landed[i] + 0.1, 0.4, 8, 6), width: 222, height: 148, borderRadius: 14, boxShadow: `0 0 0 ${i === version ? 3.5 : 2}px ${i === version ? C.moss : "#3A3A36"}` }}>
                  <Shot src={src} w={222} />
                </div>
              ) : null))}
            </div>
          </>
        )}
      </Window>
    </AbsoluteFill>
  );
};

/** K: Kie. Its logo and name first; then what he says about it, line by line. */
const CutK: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT_K[0];
  const chip = (at: number, icon: React.ReactNode, text: string) => (
    <div style={{ ...rise(t, at, 0.4, 12, 6), display: "flex", alignItems: "center", gap: 12, height: 64, padding: "0 24px", borderRadius: 32, boxShadow: `inset 0 0 0 2px #4C4C46`, background: "#1E1E1C", fontFamily: MONO, fontSize: 32, color: C.arena }}>
      {icon}
      {text}
    </div>
  );
  const up = prog(t, K_PROVIDER - 0.5, 0.42); // done before the window comes in
  return (
    <AbsoluteFill>
      <Sumi />
      <div style={{ ...rise(t, a - HEAD_LEAD), position: "absolute", left: 0, right: 0, top: 480 - 195 * up, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <Img src={staticFile(KIE)} style={{ height: 170 }} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 84, letterSpacing: -2.6, lineHeight: 1, color: C.arena }}>API de Kie</div>
      </div>
      <Window t={t} at={K_PROVIDER - 0.1} top={640} title={<span style={{ color: C.arena }}>proveedor</span>}>
        <div style={{ ...rise(t, K_HIGGS, 0.45, 14, 6), display: "flex", alignItems: "center", gap: 18, height: 84 }}>
          <Label style={{ color: SOFT }}>tipo</Label>
          <Img src={staticFile(HIGGS)} style={{ height: 72, borderRadius: 16 }} />
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, letterSpacing: -1.6, color: C.arena }}>Higgsfield</span>
        </div>
        {/* the window is as tall as its content: it grows as each line is said */}
        <div style={{ height: 124 * prog(t, K_CHEAP - 0.15, 0.4), overflow: "hidden" }}>
        <div style={{ height: 1.5, background: C.line, margin: "26px 0" }} />
        <div style={{ ...rise(t, K_CHEAP, 0.5, 18, 8), display: "flex", alignItems: "center", gap: 20, fontFamily: SANS, fontWeight: 700, fontSize: 68, letterSpacing: -2.2, lineHeight: 1, color: C.moss, whiteSpace: "pre" }}>
          <Dot pulse={pulseAt(t, K_CHEAP + 0.1)} />
          mucho más barato
        </div>
        </div>
        <div style={{ height: 98 * prog(t, K_MODELS - 0.15, 0.4), overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 34, height: 64 }}>
          <Label style={{ ...rise(t, K_MODELS, 0.4, 10, 6), color: SOFT, fontSize: 30 }}>para modelos de</Label>
          {chip(K_IMAGE, <ImageIcon size={34} strokeWidth={2} color={SOFT} />, "imagen")}
          {chip(K_VIDEO, <VideoIcon size={34} strokeWidth={2} color={SOFT} />, "video")}
        </div>
        </div>
      </Window>
    </AbsoluteFill>
  );
};

// ---------- sound ----------
const Sfx: React.FC<{ fps: number }> = ({ fps }) => {
  const at = (sec: number) => Math.round(sec * fps);
  return (
    <>
      {CUES.map(([sec, file, volume]) => (
        <Sequence key={`${file}${sec}`} from={at(sec)} durationInFrames={at(CUE_LEN[file] ?? 1.1)}><Audio src={staticFile(file)} volume={volume} /></Sequence>
      ))}
      <Audio src={staticFile("music.mp3")} volume={(f) => musicVolume(f / fps)} />
    </>
  );
};

export const Main: React.FC<{ proxy: boolean }> = ({ proxy }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  return (
    <AbsoluteFill style={{ background: C.sumi }}>
      <Camera t={t} proxy={proxy} />
      {inside(t, CUT_A) && <CutA t={t} />}
      {inside(t, CUT_W) && <CutW t={t} />}
      {inside(t, CUT_L) && <CutL t={t} />}
      {inside(t, CUT_K) && <CutK t={t} />}
      <Tag t={t} win={TAG_TALK} pulses={[VIBE_AT + 0.1]}>
        charla · diseño
        <Grow p={prog(t, VIBE_AT, 0.45)} w={258} color={C.moss}> + vibe coding</Grow>
      </Tag>
      <Tag t={t} win={TAG_OPUS} dot={false}>
        <Img src={staticFile(CLAUDE)} style={{ height: 34 }} />
        Claude Opus
      </Tag>
      <Tag t={t} win={TAG_100} pulses={[TAG_100[0] + 0.2]}>
        $5 → ~100 imágenes
      </Tag>
      <Tag t={t} win={TAG_KIE} dot={false}>
        <Img src={staticFile(KIE)} style={{ height: 38 }} />
        API de Kie
      </Tag>
      {!inCutaway(t) && INK.map(([a, b, name, size, y]) => <Ink key={a} t={t} win={[a, b]} name={name} size={size} y={y} />)}
      <Caption t={t} />
      <Sfx fps={fps} />
    </AbsoluteFill>
  );
};
