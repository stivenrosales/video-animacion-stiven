import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowRight, Lock, Tag as TagIcon, User, X } from "lucide-react";
import rawWords from "./words.json";
import { C, MONO, SANS, prog, rise } from "./theme";

const EASE_IO = Easing.inOut(Easing.cubic);
const SOFT = "#B9B3A6";
const WA = "whatsapp-glyph-green.svg"; // WhatsApp Brand Resource Center (about.meta.com/brand/resources/whatsapp)

// ---------- timeline (seconds on the edited video) ----------
const END = 70.97;
/** Full-screen sumi cutaways: one explaining element each, hard cut in and out. */
const CUT_A: [number, number] = [13.3, 19.02]; // "uno es la ventana de 24 horas… no puedes contestar… no puedes hacer seguimientos"
const CUT_B: [number, number] = [23.33, 25.64]; // "a otra herramienta tipo chatbot, ManyChat"
const CUT_C: [number, number] = [35.8, 42.0]; // "ir a las APIs no oficiales, por ejemplo Evolution API o WAHA… bastante estables"
const CUT_D: [number, number] = [51.38, 54.42]; // "a 10 o 20 personas al día en tu WhatsApp" (he stays on camera for "un bot que atiende")
const CUT_E: [number, number] = [58.46, 62.9]; // "las mismas herramientas, como las etiquetas de WhatsApp, para apagar el bot"
const CUTAWAYS = [CUT_A, CUT_B, CUT_C, CUT_D, CUT_E];
const TAG_HOOK: [number, number] = [1.72, 4.5]; // "el API oficial de WhatsApp era la única respuesta"
const TAG_LIMITS: [number, number] = [11.46, 13.2]; // "tiene muchas limitaciones"
const TAG_WORST: [number, number] = [19.34, 21.4]; // "y lo peor, para empresas pequeñas"
const TAG_CANT: [number, number] = [32.5, 34.25]; // "con el API oficial eso no se puede hacer"
const TAG_WORKS: [number, number] = [43.9, 45.25]; // "en mi experiencia última veo que funcionan bien"
const TAG_PANEL: [number, number] = [56.18, 57.75]; // "no tienes que tener otro panel"
const TAG_OK: [number, number] = [67.26, 68.62]; // "está bien usar las APIs no oficiales"
const CTA_AT = 68.7;

// cutaway A: the 24-hour window
const COUNT: [number, number] = [13.5, 14.86]; // the counter runs while he says "ventana de 24 horas"
const CLOSED_AT = 14.92;
const ROW_1 = { at: 15.04, sub: 15.56, no: 15.62 }; // "no puedes contestar a personas que ya no te han hablado"
const ROW_2 = { at: 17.5, no: 18.14 }; // "no puedes hacer seguimientos"
// cutaway E: the label that switches the bot off
// cutaway C: "API oficial" becomes "APIs no oficiales" on his word "no"
const UNOFFICIAL_AT = 36.84;
const LABEL_AT = 59.62; // "etiquetas"
const OFF_AT = 61.0; // "apagar el bot"

/** enter.mp3 swells for 0.36 s before its peak, so each entry cue starts early; going back to the camera is silent. */
const ENTER_PEAK = 0.36;
/** Sound cues, Ali Abdaal's approach: many varied effects, each tied to something visible, all far below the voice.
 *  [second, file, volume]. tick.mp3 and lock.mp3 are new (scripts/sfx_eleven.py → scripts/sfx_fit.py). */
const CUES: Array<[number, string, number]> = [
  [TAG_HOOK[0] - 0.04, "trans.mp3", 0.2], // hook tag: WhatsApp · API oficial
  [6.5, "pop.mp3", 0.13], // shop mark: "negocio pequeño"
  [CUT_A[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway A
  [COUNT[0] - 0.02, "tick.mp3", 0.16], // the counter runs to 24 h
  [CLOSED_AT, "lock.mp3", 0.2], // the window closes
  [ROW_2.no, "click.mp3", 0.2], // seguimientos: no puedes (row 1 stays silent: it lands 0.7 s after the padlock)
  [CUT_B[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway B
  [25.02, "pop.mp3", 0.15], // ManyChat
  [25.84 - 0.04, "trans.mp3", 0.2], // "FATAL"
  [30.6, "chime.mp3", 0.11], // bot mark: "el bot dentro de WhatsApp"
  [CUT_C[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway C
  [38.08, "click.mp3", 0.2], // Evolution API
  [39.36, "pop.mp3", 0.18], // WAHA
  [41.08, "sparkle.mp3", 0.15], // "estables"
  [46.2, "pop.mp3", 0.13], // megaphone mark: "spam"
  [48.08, "lock.mp3", 0.18], // "BANEAN" (with the punch-in)
  [CUT_D[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway D
  [51.84, "pop.mp3", 0.18], // 10
  [CUT_E[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway E
  [LABEL_AT, "pop.mp3", 0.16], // the label lands on the chat
  [OFF_AT, "lock.mp3", 0.2], // the bot switches off
  [65.56, "pop.mp3", 0.12], // shop mark: "empresas pequeñas"
  [67.52, "chime.mp3", 0.13], // "APIs no oficiales" tag
  [69.24, "pop.mp3", 0.15], // speech bubble mark: "cuéntame"
];
/** Suno bed under the whole video. */
const MUSIC = 0.11;
const musicVolume = (t: number) =>
  interpolate(t, [0, 0.8, END - 1.5, END], [0, MUSIC, MUSIC, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IO });

/** Small hand-drawn marks, fine ballpoint line (Kie GPT Image 2.6, scripts/kie_icons.py style "b" → scripts/ink_mask.py),
 *  drawn when he names the thing. [in, out, file, size?, center y?]. Centered above his head, in sumi, never with a pill tag. */
const INK: Array<[number, number, string, number?, number?]> = [
  [6.5, 7.9, "tienda", 150, 325], // "un negocio pequeño" (punched frame: smaller and higher, clear of his hair)
  [30.6, 31.95, "bot"], // "el bot dentro de WhatsApp"
  [46.2, 47.7, "megafono", 196], // "mucho spam y muchos seguimientos"
  [65.56, 66.75, "tienda"], // "empresas pequeñas"
  [69.24, END, "burbuja"], // "cuéntame, ¿qué opinas?"
];

const inside = (t: number, [a, b]: [number, number]) => t >= a && t < b;
const inCutaway = (t: number) => CUTAWAYS.some((c) => inside(t, c));

// ---------- camera ----------
/** Punch-in by cut: the framing toggles between 1 and 1.12 at these moments, never animated, at least 2.5 s apart.
 *  All are jump cuts of the edit (src/cuts.json) except 48.08, a cut-in on "BANEAN". 25.51 is skipped so "FATAL" stays
 *  punched, and 40.16 so he comes back from cutaway C at 1. Toggles inside a cutaway only set the framing he returns in. */
const PUNCHES = [3.169, 7.469, 12.615, 17.427, 21.854, 27.943, 34.546, 37.637, 48.08, 54.381, 61.898, 68.665];
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
const HEAVY = ["fatal", "banean"];
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
  <div style={{ width: 12, height: 12, borderRadius: 6, background: color, transform: `scale(${1 + 0.7 * pulse})` }} />
);

const Tag: React.FC<{ t: number; win: [number, number]; label: string; pulses?: number[]; logo?: string }> = ({ t, win, label, pulses = [], logo }) => {
  if (!inside(t, win)) return null;
  const out = 1 - prog(t, win[1] - 0.3, 0.3);
  const pulse = pulses.reduce((v, at) => Math.max(v, pulseAt(t, at)), 0);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ ...rise(t, win[0]), display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 28, letterSpacing: 1, textTransform: "uppercase", color: C.arena, background: "rgba(26,26,24,.82)", padding: "16px 26px 17px", borderRadius: 999 }}>
        {logo ? <Img src={staticFile(logo)} style={{ height: 34 }} /> : <Dot pulse={pulse} />}
        {label}
      </div>
    </div>
  );
};

const Window: React.FC<{ t: number; at: number; top: number; title: React.ReactNode; logo?: string; left?: number; right?: number; children: React.ReactNode }> = ({ t, at, top, title, logo, left = 60, right = 60, children }) => (
  <div style={{ ...rise(t, at), position: "absolute", left, right, top, background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.35)`, padding: "40px 46px 46px" }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: MONO, fontSize: 28, color: C.mute, marginBottom: 34 }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#3A3A36" }} />)}
      {logo ? <Img src={staticFile(logo)} style={{ height: 30, marginLeft: 12 }} /> : null}
      &nbsp;{title}
    </div>
    {children}
  </div>
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

/** A pen mark above his head: wipes in left to right like a stroke, fades out.
 *  He sits higher in this take than in the pilot, so the mark is 170 px centered at y 342 (it clears his hair on punched frames). */
const Ink: React.FC<{ t: number; win: [number, number]; name: string; size?: number; y?: number }> = ({ t, win, name, size = 170, y = 342 }) => {
  if (!inside(t, [win[0], win[1] + 0.3])) return null;
  const p = prog(t, win[0], 0.45);
  const out = win[1] >= END ? 1 : 1 - prog(t, win[1], 0.3);
  return <Mark name={name} size={size} color={C.sumi} style={{ position: "absolute", left: 540 - size / 2, top: y - size / 2, opacity: 0.9 * out, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, transform: `scale(${0.96 + 0.04 * p})` }} />;
};

/** Cutaway titles start this early, so the first frame after the hard cut already shows them about 60% in. */
const HEAD_LEAD = 0.1;
/** Header of a cutaway: an optional brand glyph and a short title, centered at the top of the safe area. */
const Head: React.FC<{ t: number; at: number; text: string; logo?: string; size?: number }> = ({ t, at, text, logo, size = 76 }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
    {logo ? <Img src={staticFile(logo)} style={{ height: size }} /> : null}
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -2.4, lineHeight: 1, color: C.arena }}>{text}</div>
  </div>
);

const Pill: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 30, letterSpacing: 1, textTransform: "uppercase", color: C.arena, background: C.win, boxShadow: `0 0 0 1.5px ${C.line}`, padding: "18px 30px 19px", borderRadius: 999, ...style }}>
    {children}
  </div>
);

// ---------- cutaways ----------
/** A: the 24-hour window. A counter runs to 24 h and closes; after that, answering and follow-ups are a "no puedes". */
const RING = { cx: 540, cy: 660, r: 172, stroke: 14 };
const BlockedRow: React.FC<{ t: number; top: number; at: number; no: number; label: string; sub?: [number, string] }> = ({ t, top, at, no, label, sub }) => (
  <div style={{ ...rise(t, at, 0.45, 16, 6), position: "absolute", left: 140, right: 140, top, height: sub ? 132 : 104, boxSizing: "border-box", background: C.win, borderRadius: 24, boxShadow: `0 0 0 1.5px ${C.line}`, padding: "0 36px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: MONO, fontSize: 40 }}>
    <span style={{ display: "flex", flexDirection: "column", gap: 10, color: C.arena }}>
      {label}
      {sub ? <span style={{ ...rise(t, sub[0], 0.4, 10, 6), fontSize: 26, color: SOFT }}>{sub[1]}</span> : null}
    </span>
    <span style={{ ...rise(t, no, 0.35, 10, 6), display: "flex", alignItems: "center", gap: 12, color: SOFT }}>
      <X size={40} strokeWidth={2.5} color={C.mute} />
      no puedes
    </span>
  </div>
);
const CutA: React.FC<{ t: number }> = ({ t }) => {
  const count = interpolate(t, COUNT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const closed = t >= CLOSED_AT;
  const len = 2 * Math.PI * RING.r;
  const box = 2 * (RING.r + RING.stroke);
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_A[0] - HEAD_LEAD} text="API oficial" logo={WA} />
      <div style={{ ...rise(t, CUT_A[0] + 0.1), position: "absolute", left: RING.cx - box / 2, top: RING.cy - box / 2, width: box, height: box }}>
        <svg width={box} height={box} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={box / 2} cy={box / 2} r={RING.r} fill="none" stroke={C.line} strokeWidth={RING.stroke} />
          <circle cx={box / 2} cy={box / 2} r={RING.r} fill="none" stroke={closed ? C.mute : C.moss} strokeWidth={RING.stroke} strokeLinecap="round" strokeDasharray={`${len * count} ${len}`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "baseline", justifyContent: "center", paddingTop: 96, fontFamily: MONO, fontWeight: 700, color: closed ? SOFT : C.moss }}>
          <span style={{ fontSize: 150, lineHeight: 1 }}>{Math.round(24 * count)}</span>
          <span style={{ fontSize: 64, lineHeight: 1, marginLeft: 8 }}>h</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 890, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, fontFamily: MONO, fontSize: 38, color: SOFT }}>
        <span style={rise(t, 13.72)}>ventana de 24 horas</span>
        {closed ? <Lock size={40} strokeWidth={2.2} color={C.arena} style={rise(t, CLOSED_AT, 0.35, 10, 6)} /> : null}
      </div>
      <BlockedRow t={t} top={1020} at={ROW_1.at} no={ROW_1.no} label="contestar" sub={[ROW_1.sub, "a quien ya no te ha hablado"]} />
      <BlockedRow t={t} top={1176} at={ROW_2.at} no={ROW_2.no} label="seguimientos" />
    </AbsoluteFill>
  );
};

/** B: the chat leaves WhatsApp for another tool. */
const SkeletonRow: React.FC<{ t: number; at: number; w: number }> = ({ t, at, w }) => (
  <div style={{ ...rise(t, at, 0.4, 12, 6), display: "flex", alignItems: "center", gap: 18, padding: "16px 0", borderTop: `1.5px solid ${C.line}` }}>
    <div style={{ width: 52, height: 52, borderRadius: 26, background: "#55554E" }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ width: w, height: 12, borderRadius: 6, background: "#8C877C" }} />
      <div style={{ width: w * 0.62, height: 12, borderRadius: 6, background: "#55554E" }} />
    </div>
  </div>
);
const CutB: React.FC<{ t: number }> = ({ t }) => {
  const arrow = prog(t, 23.72, 0.4);
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_B[0] - HEAD_LEAD} text="otra herramienta" />
      <Img src={staticFile(WA)} style={{ ...rise(t, CUT_B[0] + 0.08), position: "absolute", left: 150, top: 640, width: 170, height: 170 }} />
      <ArrowRight size={88} strokeWidth={2} color={C.mute} style={{ position: "absolute", left: 350, top: 681, opacity: arrow, clipPath: `inset(0 ${(1 - arrow) * 100}% 0 0)` }} />
      <Window t={t} at={23.95} top={520} left={470} right={140} title={t < 25.02 ? "chats" : <Img src={staticFile("manychat-logo-white.svg")} style={{ ...rise(t, 25.02, 0.4, 10, 6), height: 32, marginLeft: 8 }} />}>
        <SkeletonRow t={t} at={24.05} w={210} />
        <SkeletonRow t={t} at={24.15} w={170} />
        <SkeletonRow t={t} at={24.25} w={230} />
      </Window>
    </AbsoluteFill>
  );
};

/** The title of cutaway C: it enters as cutaway A's "API oficial" and, on his word "no", becomes "APIs no oficiales". */
const Grow: React.FC<{ p: number; w: number; color?: string; children: React.ReactNode }> = ({ p, w, color, children }) => (
  <span style={{ display: "inline-block", width: w * p, opacity: p, overflow: "hidden", whiteSpace: "pre", color, filter: `blur(${(1 - p) * 6}px)` }}>{children}</span>
);
const Morph: React.FC<{ t: number }> = ({ t }) => {
  const p = prog(t, UNOFFICIAL_AT, 0.45);
  return (
    <div style={{ ...rise(t, CUT_C[0] - HEAD_LEAD), position: "absolute", left: 0, right: 0, top: 284, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: SANS, fontWeight: 700, fontSize: 84, letterSpacing: -2.6, lineHeight: 1.2, color: C.arena, whiteSpace: "pre" }}>
      <Img src={staticFile(WA)} style={{ height: 80, width: 80 * (1 - p), marginRight: 22 * (1 - p), opacity: 1 - p, objectFit: "contain" }} />
      <span>API</span>
      <Grow p={p} w={40}>s</Grow>
      <Grow p={p} w={120} color={C.moss}> no</Grow>
      <span> oficial</span>
      <Grow p={p} w={80}>es</Grow>
    </div>
  );
};

/** C: the unofficial APIs he names, each with its own logo, and his verdict. */
const BrandCard: React.FC<{ t: number; at: number; top: number; children: React.ReactNode }> = ({ t, at, top, children }) => (
  <div style={{ ...rise(t, at, 0.5, 20, 8), position: "absolute", left: 140, right: 140, top, height: 196, boxSizing: "border-box", background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.3)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
    {children}
  </div>
);
const CutC: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Morph t={t} />
    <div style={{ ...rise(t, 37.58), position: "absolute", left: 0, right: 0, top: 418, textAlign: "center", fontFamily: MONO, fontSize: 34, letterSpacing: 0.5, color: C.mute }}>por ejemplo</div>
    <BrandCard t={t} at={38.08} top={520}>
      {/* doc.evolution-api.com header logo + the word he adds */}
      <Img src={staticFile("evolution-logo-dark.svg")} style={{ height: 78 }} />
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 66, letterSpacing: -2, color: C.arena, paddingTop: 6 }}>API</span>
    </BrandCard>
    <BrandCard t={t} at={39.36} top={750}>
      <Img src={staticFile("waha-logo.svg")} style={{ height: 116, width: 116, borderRadius: 58 }} />
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 84, letterSpacing: -2.6, color: C.arena }}>WAHA</span>
    </BrandCard>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1020, display: "flex", justifyContent: "center" }}>
      <Pill style={rise(t, 40.9)}>
        <Dot pulse={pulseAt(t, 41.38)} />
        bastante estables
      </Pill>
    </div>
  </AbsoluteFill>
);

/** D: the size of bot he is talking about. */
const CutD: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ ...rise(t, CUT_D[0] - HEAD_LEAD), display: "flex", alignItems: "center", gap: 20, fontFamily: SANS, fontWeight: 700, fontSize: 76, letterSpacing: -2.4, lineHeight: 1, color: C.arena }}>
        <Mark name="bot" size={96} color={C.arena} />
        un bot
      </div>
      <div style={{ marginTop: 70, display: "flex", alignItems: "baseline", fontFamily: MONO, fontWeight: 700, fontSize: 250, lineHeight: 1, color: C.moss }}>
        <span style={rise(t, 51.84, 0.5, 30, 10)}>10</span>
        <span style={rise(t, 52.4, 0.5, 30, 10)}>–20</span>
      </div>
      <div style={{ ...rise(t, 52.7), marginTop: 28, fontFamily: SANS, fontWeight: 600, fontSize: 88, letterSpacing: -2.8, lineHeight: 1, color: C.arena }}>personas al día</div>
      <Pill style={{ ...rise(t, 53.58), marginTop: 64 }}>
        <Img src={staticFile(WA)} style={{ height: 36 }} />
        en tu WhatsApp
      </Pill>
    </div>
  </AbsoluteFill>
);

/** E: no extra panel. A WhatsApp label on the chat switches the bot off. */
const ROW: React.CSSProperties = { display: "flex", alignItems: "center", gap: 26, padding: "30px 0", borderTop: `1.5px solid ${C.line}`, fontFamily: MONO, fontSize: 42, color: SOFT };
const CutE: React.FC<{ t: number }> = ({ t }) => {
  const off = prog(t, OFF_AT, 0.3);
  const isOff = off > 0.5;
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_E[0] - HEAD_LEAD} text="las mismas herramientas" size={68} />
      <Window t={t} at={CUT_E[0] + 0.12} top={470} left={140} right={140} title="WhatsApp" logo={WA}>
        <div style={{ ...ROW, ...rise(t, CUT_E[0] + 0.25, 0.45, 16, 6) }}>
          <div style={{ width: 88, height: 88, borderRadius: 44, boxShadow: `inset 0 0 0 2.5px ${C.mute}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={46} color={C.mute} strokeWidth={1.8} />
          </div>
          <span style={{ flex: 1 }}>chat</span>
          <span style={{ ...rise(t, LABEL_AT, 0.45, 16, 6), display: "flex", alignItems: "center", gap: 12, fontSize: 36, color: C.moss, boxShadow: `inset 0 0 0 2px ${C.moss}`, borderRadius: 999, padding: "12px 24px 13px" }}>
            <TagIcon size={34} strokeWidth={2.2} />
            etiqueta
          </span>
        </div>
        <div style={{ ...ROW, ...rise(t, CUT_E[0] + 0.37, 0.45, 16, 6), paddingBottom: 0 }}>
          <div style={{ width: 88, height: 88, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mark name="bot" size={84} color={isOff ? C.mute : C.arena} />
          </div>
          <span style={{ flex: 1 }}>bot</span>
          <span style={{ fontSize: 36, color: isOff ? C.mute : C.moss }}>{isOff ? "apagado" : "activo"}</span>
          <div style={{ width: 116, height: 64, borderRadius: 32, background: isOff ? "#33332F" : C.moss, position: "relative" }}>
            <div style={{ position: "absolute", top: 7, left: 7 + 52 * (1 - off), width: 50, height: 50, borderRadius: 25, background: C.arena }} />
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
        <Sequence key={`${file}${sec}`} from={at(sec)} durationInFrames={at(file === "tick.mp3" ? 1.5 : 1.1)}><Audio src={staticFile(file)} volume={volume} /></Sequence>
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
      {inside(t, CUT_B) && <CutB t={t} />}
      {inside(t, CUT_C) && <CutC t={t} />}
      {inside(t, CUT_D) && <CutD t={t} />}
      {inside(t, CUT_E) && <CutE t={t} />}
      <Tag t={t} win={TAG_HOOK} label="API oficial" logo={WA} />
      <Tag t={t} win={TAG_LIMITS} label="muchas limitaciones" />
      <Tag t={t} win={TAG_WORST} label="lo peor" pulses={[19.54]} />
      <Tag t={t} win={TAG_WORKS} label="en mi experiencia: funcionan bien" pulses={[44.44]} />
      <Tag t={t} win={TAG_CANT} label="API oficial: no se puede" logo={WA} />
      <Tag t={t} win={TAG_PANEL} label="sin otro panel" />
      <Tag t={t} win={TAG_OK} label="APIs no oficiales" pulses={[67.52]} />
      {!inCutaway(t) && INK.map(([a, b, name, size, y]) => <Ink key={a} t={t} win={[a, b]} name={name} size={size} y={y} />)}
      <Caption t={t} />
      <Sfx fps={fps} />
    </AbsoluteFill>
  );
};
