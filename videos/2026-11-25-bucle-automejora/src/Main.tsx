import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Check, Database, Megaphone, MessageCircle, TrendingDown, Users, X } from "lucide-react";
import rawWords from "./words.json";
import { MCP_PATHS, MCP_STROKE } from "./mcp";
import { C, MONO, SANS, prog, rise } from "./theme";

const EASE_IO = Easing.inOut(Easing.cubic);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SOFT = "#B9B3A6";
const GREY = "#55554E";
const CLAUDE = "claude.png"; // Claude's spark: only ever next to the word Claude
const PLATZI = "platzi-logo.svg"; // platzi.com header (inline SVG)
const WHATSAPP = "whatsapp-glyph-green.svg"; // whatsappbrand.com
const ZENBOX_MARK = "zenbox-mark.svg"; // usezenbox.com/zenbox-mark.svg, untouched
const WAHA = "waha-logo.svg"; // waha.devlike.pro
const GOOGLE = "google-logo.svg"; // about.google header

// ---------- timeline (seconds on the edited video) ----------
const END = 107.05;
/** Full-screen sumi cutaways: one explaining element each, hard cut in and out. */
const CUT_A: [number, number] = [12.38, 23.44]; // "la IA… coge la información, la lee, propone… las implementa… al siguiente día… bucle de automejora"
const CUT_B: [number, number] = [35.38, 43.0]; // "mis canales de WhatsApp, mis grupos… mis chats… hacia una fuente de información mediante un MCP"
const CUT_C: [number, number] = [56.44, 64.7]; // "uso Google para grabar todas mis reuniones… transcritas con Whisper… mi base de datos en CRM"
const CUT_D: [number, number] = [68.55, 71.72]; // "pero le pregunté: ¿qué está pasando?, ¿qué está funcionando?, ¿qué no está funcionando?"
const CUT_E: [number, number] = [78.5, 82.7]; // "qué cosas realmente funcionan y qué cosas no, qué cosas están haciendo perder dinero"
const CUT_F: [number, number] = [88.12, 92.3]; // "hacer esto cada semana para recolectar información y ver si han mejorado"
const CUTAWAYS = [CUT_A, CUT_B, CUT_C, CUT_D, CUT_E, CUT_F];
const TAG_PLATZI: [number, number] = [1.9, 3.95]; // "un video de Platzi, de Freddy de Platzi"
const FREDDY_AT = 3.06;
const TAG_INFO: [number, number] = [9.8, 12.05]; // "solo es posible si tienes información de tu empresa"
const IF_AT = 10.48;
const TAG_LATAM: [number, number] = [28.12, 30.4]; // "funciona todo con WhatsApp o reuniones virtuales"
const MEETINGS_AT = 29.2;
const TAG_ZENBOX: [number, number] = [43.45, 46.5]; // "se llama Zenbox y es totalmente gratis"
const FREE_AT = 45.15;
const TAG_WAHA: [number, number] = [46.9, 49.7]; // "usé WAHA para poder conectarme a los grupos"
const GROUPS_AT = 48.45;
const TAG_CLAUDE: [number, number] = [93.05, 95.5]; // "gracias a Claude Code"
const CTA_AT = 103.71; // "¿Y tú? ¿Qué opinas?"

// cutaway A: the loop, one step per phrase
const A_STEP = [13.02, 14.2, 15.1, 16.7]; // "coge la información", "la lee", "propone", "las implementa"
const A_NEXT_DAY = 18.06; // "al siguiente día"
const A_LAP: Array<[number, number]> = [[18.6, 0.75], [19.58, 1], [20.1, 1.25], [20.58, 1.5], [21.2, 1.75]]; // the dot: time → lap position
const A_LOOP = 21.76; // "bucle"
const A_SELF = 22.78; // "automejora"
// cutaway B: his WhatsApp → one source of information, through an MCP
const B_ROW = [CUT_B[0] - 0.1, 37.1, 38.76]; // "canales" (already there at the cut), "grupos", "chats"
const B_TOWARDS = 39.74; // "hacia"
const B_SOURCE = 40.3; // "fuente de información"
const B_VIA = 41.47; // "mediante"
const B_MCP = 41.9; // "un MCP"
const B_LIT = 42.13; // the source lights up once the MCP is in
// cutaway C: meetings → Whisper → the same store
const C_GOOGLE = CUT_C[0]; // already there at the cut: "uso Google"
const C_RECORD = 57.3; // "grabar"
const C_THEN = 58.42; // "Entonces"
const C_SALES = 58.9; // "todas mis reuniones de venta"
const C_TEXT = 59.94; // "transcritas"
const C_WHISPER = 60.78;
const C_FEED = 62.23; // "alimentando"
const C_STORE = 63.0; // "toda mi base de datos"
const C_ARRIVE = 63.75;
const C_CRM = 64.21;
// cutaway D: what he asked
const D_ASK = [69.3, 70.08, 70.72];
// cutaway E: what he got back
const E_WORKS = 78.8; // "realmente funcionan"
const E_NOT = 80.05; // "y qué cosas no"
const E_MONEY = 81.21; // "haciendo perder dinero"
// cutaway F: the loop comes back as a weekly rule
const F_WEEK = 88.68; // "cada semana"
const F_COLLECT = 89.58; // "recolectar información"
const F_CHECK = 90.68; // "ver si han mejorado"

/** enter.mp3 swells for 0.36 s before its peak, so each entry cue starts early; going back to the camera is silent. */
const ENTER_PEAK = 0.36;
/** Sound cues, Ali Abdaal's approach: many varied effects, each tied to something visible, all far below the voice.
 *  [second, file, volume]. Reused from the batch (pilot + siblings); nothing new was needed. */
const CUES: Array<[number, string, number]> = [
  [TAG_PLATZI[0] - 0.04, "trans.mp3", 0.16], // hook tag: Platzi
  [4.63, "pop.mp3", 0.13], // paper mark: "recopilar mucha información"
  [TAG_INFO[0], "click.mp3", 0.16], // tag: solo es posible
  [IF_AT, "chime.mp3", 0.12], // the tag grows "si tienes información"
  [CUT_A[0] - ENTER_PEAK, "enter.mp3", 0.2], // into the loop
  [A_STEP[0] + 0.1, "pop.mp3", 0.13], // step 1
  [A_NEXT_DAY - 0.43, "tick.mp3", 0.13], // the loop closes: "al siguiente día"
  [A_LOOP, "sparkle.mp3", 0.14], // the loop gets its name
  [23.44, "thud.mp3", 0.2], // "BRUTAL" (with the punch-in)
  [28.3, "pop.mp3", 0.12], // tag: WhatsApp
  [33.35 - 0.04, "trans.mp3", 0.18], // "INVISIBLE" (with the punch-in)
  [CUT_B[0] - ENTER_PEAK, "enter.mp3", 0.2], // into his WhatsApp
  [B_ROW[1] + 0.05, "click.mp3", 0.15], // "grupos"
  [B_MCP - 0.1, "plug.mp3", 0.18], // the MCP plugs in
  [TAG_ZENBOX[0], "pop.mp3", 0.12], // tag: Zenbox
  [FREE_AT, "sparkle.mp3", 0.12], // "gratis"
  [TAG_WAHA[0], "click.mp3", 0.14], // tag: WAHA
  [CUT_C[0] - ENTER_PEAK, "enter.mp3", 0.2], // into the meetings
  [C_RECORD, "click.mp3", 0.15], // "grabar"
  [C_TEXT - 0.15, "typing.mp3", 0.14], // the transcript types itself
  [C_FEED - 0.29 + 0.2, "whoosh.mp3", 0.12], // the line runs down to the store
  [C_ARRIVE, "chime.mp3", 0.13], // the store takes it
  [CUT_D[0] - ENTER_PEAK, "enter.mp3", 0.2], // into the question
  [D_ASK[0] - 0.15, "typing.mp3", 0.14], // the first question is typed
  [D_ASK[2] + 0.08, "click.mp3", 0.15], // third question
  [75.0, "pop.mp3", 0.12], // people mark: "mis vendedoras"
  [CUT_E[0] - ENTER_PEAK, "enter.mp3", 0.2], // into the answer
  [E_WORKS + 0.3 - 0.16, "check.mp3", 0.17], // what works gets its check
  [E_MONEY + 0.5, "coin.mp3", 0.13], // "perder dinero"
  [83.75, "chime.mp3", 0.11], // infographic mark
  [CUT_F[0] - ENTER_PEAK, "enter.mp3", 0.2], // into the weekly loop
  [F_WEEK, "chime.mp3", 0.12], // "cada semana"
  [F_CHECK, "click.mp3", 0.14], // "ver si han mejorado"
  [TAG_CLAUDE[0] - 0.04, "trans.mp3", 0.16], // tag: Claude Code
  [104.0, "pop.mp3", 0.13], // speech bubble mark: "¿qué opinas?"
];
const CUE_LEN: Record<string, number> = { "tick.mp3": 1.5, "sparkle.mp3": 1.25 };
/** Suno bed under the whole video (scripts/suno.py, "loop-2"). */
const MUSIC = 0.11;
const musicVolume = (t: number) => interpolate(t, [0, 0.8, END - 1.5, END], [0, MUSIC, MUSIC, 0], { ...clamp, easing: EASE_IO });

/** Small hand-drawn marks, fine ballpoint line (Kie GPT Image 2.6, scripts/kie_icons.py style "b" → scripts/ink_mask.py),
 *  drawn when he names the thing. [in, out, file, size, center y]. Centered above his head, in sumi, never with a pill tag. */
const INK: Array<[number, number, string, number, number]> = [
  [4.63, 6.3, "papeles", 150, 325], // "recopilar mucha información" (punched frame)
  [75.0, 76.7, "personas", 150, 325], // "mis vendedoras" (punched frame)
  [83.75, 85.4, "infografia", 170, 345], // "generé infografías"
  [104.0, END, "burbuja", 150, 325], // "¿Qué opinas?" (punched frame)
];

const inside = (t: number, [a, b]: [number, number]) => t >= a && t < b;
const inCutaway = (t: number) => CUTAWAYS.some((c) => inside(t, c));

// ---------- camera ----------
/** Punch-in by cut: the framing is 1.12 inside these windows and 1 outside, never animated. Visible toggles are at least
 *  2.5 s apart: 4.02, 7.03, 26.58, 33.35 ("INVISIBLE"), 45.99, 48.77, 53.18, 66.03, 72.24, 95.88, 98.41 and 101.09.
 *  23.44 ("BRUTAL") is the return from the loop, already punched; windows that end inside a cutaway just end there. */
const PUNCHED: Array<[number, number]> = [[4.02, 7.03], [23.44, 26.58], [33.35, 40], [45.99, 48.77], [53.18, 60], [66.03, 70], [72.24, 80], [95.88, 98.41], [101.09, END + 1]];
const punched = (t: number) => PUNCHED.some((w) => inside(t, w));

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
const HEAVY: Record<string, string> = { "brutal.": "BRUTAL", "invisible.": "INVISIBLE" };
const WORDS: Word[] = (rawWords as Word[]).map((w) => (HEAVY[w.w] ? { ...w, w: HEAVY[w.w], big: true } : w));

const Caption: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let k = 0; k < WORDS.length; k++) if (WORDS[k].t <= t) i = k;
  if (i < 0) return null;
  const w = WORDS[i];
  const until = Math.min(WORDS[i + 1]?.t ?? END, w.e + 0.9); // hold through short pauses, clear on long ones
  if (t >= until) return null;
  const p = prog(t, w.t, 0.12);
  const size = w.big ? 150 : 84;
  const fade = w.w === "INVISIBLE" ? interpolate(t, [w.t + 0.47, until], [1, 0.25], clamp) : 1; // read for 0.35 s, then it goes
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: w.big ? 1345 : 1405, textAlign: "center",
        fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: w.big ? -5 : -2.6, lineHeight: 1,
        color: t >= CTA_AT ? C.moss : C.arena, textShadow: t >= CTA_AT ? "0 2px 24px rgba(0,0,0,.6)" : "0 2px 18px rgba(0,0,0,.35)",
        opacity: p * fade, transform: `translateY(${(1 - p) * 8}px)`,
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

const pulseAt = (t: number, at: number, dur = 0.5) => (t >= at && t < at + dur ? 1 - (t - at) / dur : 0);
const Dot: React.FC<{ pulse?: number; color?: string }> = ({ pulse = 0, color = C.moss }) => (
  <div style={{ width: 12, height: 12, borderRadius: 6, background: color, flexShrink: 0, transform: `scale(${1 + 0.7 * pulse})` }} />
);

/** A span that opens from zero width, so a label can grow a word when he says it. */
const Grow: React.FC<{ p: number; w: number; color?: string; children: React.ReactNode }> = ({ p, w, color, children }) => (
  <span style={{ display: "inline-block", width: w * p, opacity: p, overflow: "hidden", whiteSpace: "pre", color, filter: `blur(${(1 - p) * 6}px)` }}>{children}</span>
);

/** The MCP mark: the three strokes of the official logo. `draw` 0→1 draws them on, one after another. */
const McpMark: React.FC<{ size: number; draw?: number; color?: string }> = ({ size, draw = 1, color = C.arena }) => (
  <svg width={size} height={size} viewBox="8 8 180 190" fill="none" style={{ flexShrink: 0 }}>
    {MCP_PATHS.map((d, i) => {
      const p = interpolate(draw, [i * 0.22, i * 0.22 + 0.56], [0, 1], clamp);
      return <path key={i} d={d} stroke={color} strokeWidth={MCP_STROKE} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0} />;
    })}
  </svg>
);

/** Pill tag over the camera: mono caps on sumi. A moss dot unless the content brings its own brand mark. */
const Tag: React.FC<{ t: number; win: [number, number]; pulses?: number[]; dot?: boolean; children: React.ReactNode }> = ({ t, win, pulses = [], dot = true, children }) => {
  if (!inside(t, win)) return null;
  const out = 1 - prog(t, win[1] - 0.3, 0.3);
  const pulse = pulses.reduce((v, at) => Math.max(v, pulseAt(t, at)), 0);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ ...rise(t, win[0]), display: "flex", alignItems: "center", gap: 14, height: 68, boxSizing: "border-box", fontFamily: MONO, fontSize: 28, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "pre", color: C.arena, background: "rgba(26,26,24,.82)", padding: "0 26px", borderRadius: 999 }}>
        {dot ? <Dot pulse={pulse} /> : null}
        {children}
      </div>
    </div>
  );
};

const Dots: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <>{[0, 1, 2].map((i) => <div key={i} style={{ width: size, height: size, borderRadius: size / 2, background: "#3A3A36", flexShrink: 0 }} />)}</>
);
const Window: React.FC<{ t: number; at: number; top: number; title?: React.ReactNode; left?: number; right?: number; children: React.ReactNode }> = ({ t, at, top, title, left = 140, right = 140, children }) => (
  <div style={{ ...rise(t, at), position: "absolute", left, right, top, background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.35)`, padding: "40px 46px 46px" }}>
    {title === undefined ? null : (
      <div style={{ display: "flex", gap: 10, alignItems: "center", height: 34, fontFamily: MONO, fontSize: 30, color: SOFT, marginBottom: 34 }}>
        <Dots />
        <span style={{ display: "flex", alignItems: "center", marginLeft: 14, whiteSpace: "pre" }}>{title}</span>
      </div>
    )}
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
const Head: React.FC<{ t: number; at: number; text: string; mark?: React.ReactNode; size?: number }> = ({ t, at, text, mark, size = 76 }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
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
const Canvas: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

/** A node of a diagram: a wide dark tile centered on x=540. */
const Node: React.FC<{ t: number; at: number; top: number; w: number; h: number; lit?: number; children: React.ReactNode }> = ({ t, at, top, w, h, lit = 0, children }) => (
  <div style={{ ...rise(t, at, 0.5, 20, 8), position: "absolute", left: 540 - w / 2, top, width: w, height: h }}>
    <div style={{ width: w, height: h, boxSizing: "border-box", background: C.win, borderRadius: 28, boxShadow: `0 0 0 ${1.5 + 2.5 * lit}px ${interpolateColors(lit, [0, 1], [C.line, C.moss])}, 0 30px 80px rgba(0,0,0,.3)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: -1.2, color: C.arena, whiteSpace: "pre" }}>
      {children}
    </div>
  </div>
);

// ---------- the loop ----------
/** A rounded rectangle walked clockwise from its top-left corner, as points; position 0→1 is one lap. */
const track = (x0: number, x1: number, y0: number, y1: number, r: number) => {
  const pts: Array<[number, number]> = [];
  const arc = (cx: number, cy: number, from: number) => {
    for (let k = 0; k <= 8; k++) {
      const a = ((from + (k / 8) * 90) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  pts.push([x0 + r, y0]);
  pts.push([x1 - r, y0]);
  if (r) arc(x1 - r, y0 + r, -90);
  pts.push([x1, y1 - r]);
  if (r) arc(x1 - r, y1 - r, 0);
  pts.push([x0 + r, y1]);
  if (r) arc(x0 + r, y1 - r, 90);
  pts.push([x0, y0 + r]);
  if (r) arc(x0 + r, y0 + r, 180);
  pts.push([x0 + r, y0]);
  const seg = pts.slice(1).map(([x, y], i) => Math.hypot(x - pts[i][0], y - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const at = (p: number): [number, number] => {
    let d = (((p % 1) + 1) % 1) * total;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] && seg[i] > 0) return [pts[i][0] + ((pts[i + 1][0] - pts[i][0]) * d) / seg[i], pts[i][1] + ((pts[i + 1][1] - pts[i][1]) * d) / seg[i]];
      d -= seg[i];
    }
    return pts[0];
  };
  return { d: "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L"), at };
};

/** A: what the AI does every day. Four steps arrive on his words, the path closes on "al siguiente día", one moss dot
 *  goes round once on "vuelve a hacer lo mismo", and the middle names it: bucle de automejora. */
const LOOP_A = track(330, 750, 640, 1060, 0);
const A_CORNER: Array<[number, number]> = [[330, 640], [750, 640], [750, 1060], [330, 1060]];
const A_LABEL = [["coge la", "información"], ["la lee"], ["propone", "mejoras"], ["las", "implementa"]];
const A_WIDTH = [236, 120, 172, 234]; // label widths at 44 px, so each tile can open around its number
const CutA: React.FC<{ t: number }> = ({ t }) => {
  const drawn = interpolate(t, [13.95, 14.35, 14.9, 15.18, 16.4, 16.7, 17.82, 18.4], [0, 0.25, 0.25, 0.5, 0.5, 0.75, 0.75, 1], { ...clamp, easing: EASE_IO });
  const lap = interpolate(t, A_LAP.map((k) => k[0]), A_LAP.map((k) => k[1]), clamp);
  const [dx, dy] = LOOP_A.at(lap);
  const dot = inside(t, [A_LAP[0][0], A_LAP[4][0] + 0.2]) ? Math.min(1, (t - A_LAP[0][0]) * 8, (A_LAP[4][0] + 0.2 - t) * 6) : 0;
  const pass = [A_LAP[1][0], A_LAP[2][0], A_LAP[3][0], A_LAP[4][0]]; // when the dot reaches each step
  const named = prog(t, A_LOOP - 0.15, 0.25);
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_A[0] - HEAD_LEAD} text="la IA" />
      <Canvas>
        <Line d={LOOP_A.d} p={drawn} />
        {dot > 0 ? <circle cx={dx} cy={dy} r={11} fill={C.moss} opacity={dot} /> : null}
      </Canvas>
      {A_LABEL.map((lines, i) => {
        const lit = pulseAt(t, pass[i], 0.6);
        const on = prog(t, A_STEP[i], 0.45); // the four places wait as bare numbers from the first frame; each card comes on its phrase
        return (
          <div key={i} style={{ ...rise(t, CUT_A[0] - HEAD_LEAD - i * 0.03), position: "absolute", left: A_CORNER[i][0] - 185, top: A_CORNER[i][1] - 80, width: 370, height: 160 }}>
            <div style={{ width: 370, height: 160, boxSizing: "border-box", borderRadius: 28, background: `rgba(34,34,32,${on})`, boxShadow: `0 0 0 ${1.5 + 2.5 * lit}px ${interpolateColors(lit, [0, 1], [`rgba(76,76,70,${on})`, C.moss])}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 34, color: interpolateColors(on, [0, 1], [GREY, C.mute]) }}>{i + 1}</span>
              <span style={{ display: "inline-block", overflow: "hidden", width: (A_WIDTH[i] + 20) * on, opacity: on, filter: `blur(${(1 - on) * 6}px)` }}>
                <span style={{ display: "block", width: A_WIDTH[i], marginLeft: 20, fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: -1.2, lineHeight: 1.08, color: C.arena, whiteSpace: "pre" }}>{lines.map((l) => <div key={l}>{l}</div>)}</span>
              </span>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, height: 120, display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - named }}>
        <div style={{ ...rise(t, A_NEXT_DAY, 0.45, 12, 6), fontFamily: MONO, fontSize: 36, lineHeight: 1.3, textAlign: "center", color: SOFT }}>al día<br />siguiente</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 770, height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: SANS, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>
        <div style={{ ...rise(t, A_LOOP, 0.45, 14, 6), fontSize: 60, color: C.arena }}>bucle de</div>
        <div style={{ ...rise(t, A_SELF, 0.45, 14, 6), fontSize: 68, color: C.moss }}>automejora</div>
      </div>
    </AbsoluteFill>
  );
};

/** F: the same loop, now his own rule. A's square with bare corners, "cada semana" where the name was, one moss dot
 *  doing one lap, and the two things he does each week as rows inside it. */
const CutF: React.FC<{ t: number }> = ({ t }) => {
  const lap = interpolate(t, [F_COLLECT, 91.85], [0, 1], clamp);
  const [dx, dy] = LOOP_A.at(lap);
  const dot = inside(t, [F_COLLECT, 92.05]) ? Math.min(1, (t - F_COLLECT) * 8, (92.05 - t) * 6) : 0;
  const shown = rise(t, CUT_F[0] - HEAD_LEAD);
  const row: React.CSSProperties = { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 36, letterSpacing: -0.8, lineHeight: 1, color: C.arena };
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_F[0] - HEAD_LEAD} text="una regla" />
      <Canvas>
        <g opacity={shown.opacity as number}>
          <path d={LOOP_A.d} stroke={C.mute} strokeWidth={3} fill="none" />
          {A_CORNER.map(([x, y], i) => {
            const lit = pulseAt(t, F_COLLECT + (i * (91.85 - F_COLLECT)) / 4, 0.6);
            return <circle key={i} cx={x} cy={y} r={11 + 3 * lit} fill={interpolateColors(lit, [0, 1], ["#55554E", C.moss])} stroke={C.sumi} strokeWidth={6} />;
          })}
        </g>
        {dot > 0 ? <circle cx={dx} cy={dy} r={11} fill={C.moss} opacity={dot} /> : null}
      </Canvas>
      <div style={{ ...row, top: 697 }}><div style={rise(t, F_COLLECT - 0.1, 0.45, 12, 6)}>recolectar información</div></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...rise(t, F_WEEK - 0.08, 0.45, 14, 6), fontFamily: SANS, fontWeight: 700, fontSize: 58, letterSpacing: -1.8, lineHeight: 1, color: C.moss }}>cada semana</div>
      </div>
      <div style={{ ...row, top: 967 }}><div style={rise(t, F_CHECK - 0.1, 0.45, 12, 6)}>ver si han mejorado</div></div>
    </AbsoluteFill>
  );
};

// ---------- where the information comes from ----------
const STORE_TOP = 1040; // the store sits in the same place in B and C: it is the same one, growing
/** B: his WhatsApp (channels, groups, chats) goes into one source of information, through an MCP. */
const B_ICON = [Megaphone, Users, MessageCircle];
const B_LABEL = ["canales", "grupos", "chats"];
const CutB: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Head t={t} at={CUT_B[0] - HEAD_LEAD} text="WhatsApp" mark={<Img src={staticFile(WHATSAPP)} style={{ height: 84 }} />} />
    <Canvas>
      <Line d={`M540 744 V${STORE_TOP}`} p={prog(t, B_TOWARDS, 0.55)} />
    </Canvas>
    {B_LABEL.map((label, i) => {
      const Icon = B_ICON[i];
      return (
        <div key={label} style={{ ...rise(t, B_ROW[i], 0.5, 18, 8), position: "absolute", left: 330, top: 460 + i * 100, width: 420, height: 84, boxSizing: "border-box", borderRadius: 24, background: C.win, boxShadow: "0 0 0 1.5px #4C4C46", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: -1.2, color: C.arena }}>
          <Icon size={42} strokeWidth={2.2} color={SOFT} />
          {label}
        </div>
      );
    })}
    <div style={{ ...rise(t, B_VIA, 0.45, 16, 8), position: "absolute", left: 440, top: 792, width: 200, height: 200, boxSizing: "border-box", background: C.win, borderRadius: 44, boxShadow: `0 0 0 2.5px ${C.moss}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <McpMark size={108} draw={interpolate(t, [B_VIA + 0.1, B_MCP + 0.3], [0, 1], clamp)} />
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 42, letterSpacing: -1, lineHeight: 1, color: C.arena }}>MCP</div>
    </div>
    <Node t={t} at={B_SOURCE - 0.1} top={STORE_TOP} w={640} h={120} lit={Math.max(0.7 * prog(t, B_LIT, 0.3), pulseAt(t, B_LIT, 0.6))}>
      <Database size={46} strokeWidth={2.2} color={C.moss} />
      fuente de información
    </Node>
  </AbsoluteFill>
);

/** C: the meetings. Google records them, Whisper turns them into text, and they feed the same store. */
const WAVE = [0.35, 0.6, 0.9, 0.5, 0.75, 1, 0.55, 0.3, 0.7, 0.95, 0.6, 0.4, 0.8, 0.5, 0.25, 0.65, 0.9, 0.45, 0.7, 0.35, 0.55, 0.85, 0.5, 0.3];
const CutC: React.FC<{ t: number }> = ({ t }) => {
  const rec = prog(t, C_RECORD, 0.4);
  const whisper = prog(t, C_WHISPER, 0.4);
  const crm = prog(t, C_CRM, 0.4);
  const fed = t >= C_ARRIVE ? 1 : 0;
  const joined = prog(t, C_ARRIVE, 0.4);
  const drop = interpolate(t, [C_FEED + 0.9, C_ARRIVE], [0, 1], { ...clamp, easing: EASE_IO });
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_C[0] - HEAD_LEAD} text="mis reuniones" />
      <Canvas>
        <Line d="M540 550 V640" p={prog(t, C_THEN, 0.4)} />
        <Line d={`M540 930 V${STORE_TOP}`} p={prog(t, C_FEED, 0.5)} />
        {t >= C_FEED + 0.9 && t < C_ARRIVE ? <circle cx={540} cy={930 + (STORE_TOP - 930) * drop} r={10} fill={C.moss} opacity={Math.min(1, drop * 8)} /> : null}
      </Canvas>
      <Node t={t} at={C_GOOGLE - 0.1} top={430} w={540} h={120}>
        <Img src={staticFile(GOOGLE)} style={{ height: 56, marginTop: 8 }} />
        <span style={{ display: "flex", alignItems: "center", gap: 14, width: 190 * rec, opacity: rec, overflow: "hidden", fontFamily: MONO, fontWeight: 400, fontSize: 32, letterSpacing: 0.6, color: SOFT }}>
          <div style={{ width: 16, height: 16, borderRadius: 8, background: Math.floor(t * 2) % 2 ? C.arena : C.mute, flexShrink: 0, marginLeft: 6 }} />
          GRABAR
        </span>
      </Node>
      <Window t={t} at={C_SALES - 0.12} top={640} left={200} right={200} title={<>reuniones de venta<Grow p={whisper} w={196} color={C.arena}> · Whisper</Grow></>}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, marginBottom: 26 }}>
          {WAVE.map((h, i) => (
            <div key={i} style={{ width: 9, borderRadius: 5, background: "#8C877C", height: 12 + 52 * h * (0.55 + 0.45 * Math.sin(t * 7 + i * 1.3)) }} />
          ))}
        </div>
        {[520, 430, 480].map((w, i) => (
          <Bar key={i} w={w * interpolate(t, [C_TEXT + i * 0.24, C_TEXT + i * 0.24 + 0.24], [0, 1], clamp)} h={14} color={C.arena} style={{ marginTop: i ? 16 : 0, opacity: t >= C_TEXT + i * 0.24 ? 1 : 0 }} />
        ))}
      </Window>
      <Node t={t} at={C_STORE - 0.1} top={STORE_TOP} w={780} h={120} lit={Math.max(fed * 0.7, pulseAt(t, C_ARRIVE, 0.6))}>
        <Database size={46} strokeWidth={2.2} color={C.moss} />
        base de datos
        <Grow p={crm} w={136} color={SOFT}> · CRM</Grow>
        <Img src={staticFile(WHATSAPP)} style={{ height: 46, marginLeft: 6 }} />
        <span style={{ display: "inline-block", overflow: "hidden", width: 112 * joined, opacity: joined, height: 46 }}>
          <Img src={staticFile(GOOGLE)} style={{ height: 36, marginTop: 8 }} />
        </span>
      </Node>
    </AbsoluteFill>
  );
};

// ---------- the question and the answer ----------
const ASK = ["¿qué está pasando?", "¿qué está funcionando?", "¿qué no está funcionando?"];
/** D: what he asked, in his words. */
const CutD: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Head t={t} at={CUT_D[0] - HEAD_LEAD} text="le pregunté" />
    <Window t={t} at={D_ASK[0] - 0.15} top={450}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, height: 3 * 96 + 40 }}>
        {ASK.map((q, i) => (
          <div key={q} style={{ ...(i ? rise(t, D_ASK[i], 0.45, 16, 6) : {}), height: 96, boxSizing: "border-box", borderRadius: 26, background: "#2E2E2A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: -1.2, color: C.arena }}>
            {q}
          </div>
        ))}
      </div>
    </Window>
  </AbsoluteFill>
);

/** E: what came back. Moss only for what works; the rest stays grey. */
const Answer: React.FC<{ t: number; at: number; good?: boolean; icon: React.ReactNode; children: React.ReactNode }> = ({ t, at, good, icon, children }) => (
  <div style={{ ...rise(t, at, 0.45, 16, 6), display: "flex", alignItems: "center", gap: 24, height: 104, borderTop: `1.5px solid ${C.line}`, fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: -1.2, color: good ? C.arena : SOFT }}>
    <div style={{ width: 60, height: 60, borderRadius: 30, background: good ? C.moss : "#3A3A36", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    {children}
  </div>
);
const CutE: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Head t={t} at={CUT_E[0] - HEAD_LEAD} text="me puso" />
    <Window t={t} at={CUT_E[0] - 0.2} top={450} title="insight">
      <div style={{ height: 3 * 104 + 3 }}>
        <Answer t={t} at={E_WORKS - 0.15} good icon={<Check size={40} strokeWidth={3.2} color={C.sumi} style={{ clipPath: `inset(0 ${(1 - prog(t, E_WORKS + 0.3, 0.25)) * 100}% 0 0)` }} />}>qué cosas funcionan</Answer>
        <Answer t={t} at={E_NOT - 0.1} icon={<X size={38} strokeWidth={3} color={SOFT} />}>qué cosas no</Answer>
        <Answer t={t} at={E_MONEY - 0.1} icon={<TrendingDown size={38} strokeWidth={2.8} color={SOFT} />}>qué hace perder dinero</Answer>
      </div>
    </Window>
  </AbsoluteFill>
);

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
  const breathe = 1 + 0.05 * Math.sin((t - TAG_CLAUDE[0]) * 5); // the spark breathes, like Claude thinking
  return (
    <AbsoluteFill style={{ background: C.sumi }}>
      <Camera t={t} proxy={proxy} />
      {inside(t, CUT_A) && <CutA t={t} />}
      {inside(t, CUT_B) && <CutB t={t} />}
      {inside(t, CUT_C) && <CutC t={t} />}
      {inside(t, CUT_D) && <CutD t={t} />}
      {inside(t, CUT_E) && <CutE t={t} />}
      {inside(t, CUT_F) && <CutF t={t} />}
      <Tag t={t} win={TAG_PLATZI} dot={false}>
        <Img src={staticFile(PLATZI)} style={{ height: 36 }} />
        <Grow p={prog(t, FREDDY_AT, 0.45)} w={162}> · Freddy</Grow>
      </Tag>
      <Tag t={t} win={TAG_INFO} pulses={[IF_AT]}>
        solo es posible
        <Grow p={prog(t, IF_AT, 0.45)} w={426} color={C.moss}> · si tienes información</Grow>
      </Tag>
      <Tag t={t} win={TAG_LATAM} dot={false}>
        <Img src={staticFile(WHATSAPP)} style={{ height: 38 }} />
        WhatsApp
        <Grow p={prog(t, MEETINGS_AT, 0.45)} w={408}> · reuniones virtuales</Grow>
      </Tag>
      <Tag t={t} win={TAG_ZENBOX} dot={false}>
        <Img src={staticFile(ZENBOX_MARK)} style={{ height: 40 }} />
        Zenbox
        <Grow p={prog(t, FREE_AT, 0.45)} w={162} color={C.moss}> · gratis</Grow>
      </Tag>
      <Tag t={t} win={TAG_WAHA} dot={false}>
        <Img src={staticFile(WAHA)} style={{ height: 42, width: 42, borderRadius: 21 }} />
        WAHA
        <Grow p={prog(t, GROUPS_AT, 0.45)} w={162}> · grupos</Grow>
      </Tag>
      <Tag t={t} win={TAG_CLAUDE} dot={false}>
        <Img src={staticFile(CLAUDE)} style={{ height: 34, transform: `scale(${breathe})` }} />
        Claude Code
      </Tag>
      {!inCutaway(t) && INK.map(([a, b, name, size, y]) => <Ink key={a} t={t} win={[a, b]} name={name} size={size} y={y} />)}
      <Caption t={t} />
      <Sfx fps={fps} />
    </AbsoluteFill>
  );
};
