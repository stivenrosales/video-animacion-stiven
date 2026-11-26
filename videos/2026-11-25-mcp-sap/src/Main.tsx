import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowUp, Check, MousePointer2, Sparkles, User } from "lucide-react";
import rawWords from "./words.json";
import { MCP_PATHS, MCP_STROKE } from "./mcp";
import { C, MONO, SANS, prog, rise } from "./theme";

const EASE_IO = Easing.inOut(Easing.cubic);
const SOFT = "#B9B3A6";
const GREY = "#55554E";
const CLAUDE = "claude.png"; // Claude's spark: only ever next to the word Claude
const SAP = "sap-logo.svg"; // sap.com/dam/application/shared/logos/sap-logo-svg.svg
const OPENAI = "openai-blossom-white.svg"; // openai.com/brand → openai-logos.zip

// ---------- timeline (seconds on the edited video) ----------
const END = 62.73;
/** Full-screen sumi cutaways: one explaining element each, hard cut in and out. */
const CUT_A: [number, number] = [12.11, 16.05]; // "nuestras pantallas pueden verse hermosas y realmente fáciles de usar"
const CUT_B: [number, number] = [19.22, 22.02]; // "mediante el MCP, mediante el chat de Claude"
const CUT_C: [number, number] = [29.13, 31.93]; // "del software como tal, porque tiene varias pantallas, varias configuraciones"
const CUT_D: [number, number] = [36.69, 41.85]; // "el MCP que le creé a SAP, conectándole a Claude o a ChatGPT, las operaciones… más fáciles"
const CUT_F: [number, number] = [52.49, 59.6]; // "operarlo desde la plataforma… con sus botones y sus casillas, o… desde Claude… muy fácil"
const CUTAWAYS = [CUT_A, CUT_B, CUT_C, CUT_D, CUT_F];
const TAG_HOOK: [number, number] = [1.9, 4.3]; // "desarrollando software con Claude Code"
const TAG_PRACTICES: [number, number] = [7.86, 10.35]; // "buenas prácticas desde el sentido de la usabilidad"
const TAG_SAP: [number, number] = [23.59, 24.9]; // "hice un MCP para SAP"
const TAG_FRIENDLY: [number, number] = [48.04, 49.28]; // "hacerlo MCP friendly"
const CTA_AT = 60.88; // "pero tú, ¿qué opinas?"

const USABILITY_AT = 9.77;
// cutaway A: a pretty screen that is easy to use
const PRETTY_AT = 13.32; // "hermosas"
const EASY_AT = 15.04; // "fáciles de usar"
const PRESS_AT = 15.36;
// cutaway B: the MCP, then Claude's chat
const VIA_AT = 20.35; // second "mediante"
const CHAT_AT = 21.13; // "el chat de Claude"
// cutaway C: SAP's own screens
const SCREENS_AT = 30.43; // "varias pantallas"
const CONFIG_AT = 31.09; // "varias configuraciones"
// cutaway D: the MCP he built, between SAP and the assistants
const D_SAP = 37.9;
const D_LINK = 38.23; // "conectándole"
const D_CLAUDE = 38.78;
const D_CHATGPT = 39.26;
const D_OPS = 40.2; // "las operaciones"
const D_EASIER = 40.92; // "mucho más fáciles"
const D_PULSE = 41.36;
// cutaway F: the user picks how to operate it
const F_BUTTON = 55.04; // "botones"
const F_PRESS = 55.45;
const F_BOXES = 55.96; // "casillas"
const F_CHECK = 56.25;
const F_OR = 56.64; // "o"
const F_CHAT = 57.6; // "desde": the chat comes in just before he names Claude
const F_CLAUDE = 58.2; // "Claude"
const F_TYPE = 58.64; // "que también puede ser muy fácil"
const F_SEND = 59.29;

/** enter.mp3 swells for 0.36 s before its peak, so each entry cue starts early; going back to the camera is silent. */
const ENTER_PEAK = 0.36;
/** Sound cues, Ali Abdaal's approach: many varied effects, each tied to something visible, all far below the voice.
 *  [second, file, volume]. plug.mp3, thud.mp3 and check.mp3 are new (scripts/sfx_eleven.py → scripts/sfx_fit.py). */
const CUES: Array<[number, string, number]> = [
  [TAG_HOOK[0] - 0.04, "trans.mp3", 0.18], // hook tag: Claude Code
  [4.9, "pop.mp3", 0.14], // wrench mark: "cualquier herramienta"
  [USABILITY_AT, "chime.mp3", 0.12], // the tag grows "usabilidad"
  [CUT_A[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway A
  [PRETTY_AT, "sparkle.mp3", 0.14], // the screen lights up: "hermosas"
  [PRESS_AT, "click.mp3", 0.2], // the cursor presses the button: "fáciles de usar"
  [CUT_B[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway B
  [CHAT_AT + 0.17, "typing.mp3", 0.14], // the chat of Claude types
  [23.83, "chime.mp3", 0.12], // tag: MCP para SAP
  [CUT_C[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway C
  [SCREENS_AT, "tick.mp3", 0.13], // the screens pile up
  [34.98, "thud.mp3", 0.2], // "ABRUMÉ" (with the punch-in)
  [CUT_D[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway D
  [D_SAP - 0.07, "plug.mp3", 0.2], // the MCP plugs into SAP
  [D_PULSE, "sparkle.mp3", 0.13], // "más fáciles"
  [48.5 - 0.04, "trans.mp3", 0.18], // "FRIENDLY" (with the punch-in)
  [49.98, "pop.mp3", 0.12], // robot mark: "cualquier IA"
  [CUT_F[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway F
  [F_PRESS, "click.mp3", 0.2], // the button is pressed: "botones"
  [F_CHECK - 0.15, "check.mp3", 0.18], // the box is ticked: "casillas"
  [F_TYPE, "typing.mp3", 0.14], // typing to Claude
  [61.33, "pop.mp3", 0.13], // speech bubble mark: "¿qué opinas?"
];
const CUE_LEN: Record<string, number> = { "tick.mp3": 1.5, "sparkle.mp3": 1.25 };
/** Suno bed under the whole video. */
const MUSIC = 0.11;
const musicVolume = (t: number) =>
  interpolate(t, [0, 0.8, END - 1.5, END], [0, MUSIC, MUSIC, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IO });

/** Small hand-drawn marks, fine ballpoint line (Kie GPT Image 2.6, scripts/kie_icons.py style "b" → scripts/ink_mask.py),
 *  drawn when he names the thing. [in, out, file, size, center y, opacity?]. Centered above his head, in sumi, never with a pill tag.
 *  On punched frames they are 150 px with the top edge at y 250. */
const INK: Array<[number, number, string, number, number, number?]> = [
  [4.9, 6.6, "llave", 170, 335, 1], // "cualquier herramienta"
  [34.3, 35.5, "garabato", 150, 325], // "simplemente me abrumé"
  [49.53, 51.0, "bot", 150, 325], // "cualquier IA"
  [61.33, END, "burbuja", 150, 325], // "¿qué opinas?"
];

const inside = (t: number, [a, b]: [number, number]) => t >= a && t < b;
const inCutaway = (t: number) => CUTAWAYS.some((c) => inside(t, c));

// ---------- camera ----------
/** Punch-in by cut: the framing toggles between 1 and 1.12 at these moments, never animated. The visible ones are at
 *  least 2.5 s apart: 3.51, 6.81, 10.48, 24.95, 27.65, 34.98 ("ABRUMÉ"), 44.40, 48.50 ("FRIENDLY") and 51.08.
 *  14.0, 20.5 and 55.0 fall inside a cutaway and only set the framing he comes back in. */
const PUNCHES = [3.51, 6.81, 10.48, 14.0, 20.5, 24.95, 27.65, 30.5, 34.98, 44.4, 48.5, 51.08, 55.0];
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
const HEAVY = ["abrumé", "friendly"];
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

/** The MCP mark: the three strokes of the official logo. `draw` 0→1 draws them on, one after another. */
const McpMark: React.FC<{ size: number; draw?: number; color?: string }> = ({ size, draw = 1, color = C.arena }) => (
  <svg width={size} height={size} viewBox="8 8 180 190" fill="none" style={{ flexShrink: 0 }}>
    {MCP_PATHS.map((d, i) => {
      const p = interpolate(draw, [i * 0.22, i * 0.22 + 0.56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
const Window: React.FC<{ t: number; at: number; top: number; title: React.ReactNode; left?: number; right?: number; children: React.ReactNode }> = ({ t, at, top, title, left = 140, right = 140, children }) => (
  <div style={{ ...rise(t, at), position: "absolute", left, right, top, background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.35)`, padding: "40px 46px 46px" }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", height: 34, fontFamily: MONO, fontSize: 30, color: SOFT, marginBottom: 34 }}>
      <Dots />
      <span style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 14 }}>{title}</span>
    </div>
    {children}
  </div>
);
/** The window title "Claude", with its spark. */
const ClaudeTitle: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: -0.6, color: C.arena, ...style }}>
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
const Ink: React.FC<{ t: number; win: [number, number]; name: string; size: number; y: number; opacity?: number }> = ({ t, win, name, size, y, opacity = 0.9 }) => {
  if (!inside(t, [win[0], win[1] + 0.3])) return null;
  const p = prog(t, win[0], 0.45);
  const out = win[1] >= END ? 1 : 1 - prog(t, win[1], 0.3);
  return <Mark name={name} size={size} color={C.sumi} style={{ position: "absolute", left: 540 - size / 2, top: y - size / 2, opacity: opacity * out, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, transform: `scale(${0.96 + 0.04 * p})` }} />;
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

const Pill: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 30, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "pre", color: C.arena, background: C.win, boxShadow: `0 0 0 1.5px ${C.line}`, padding: "18px 30px 19px", borderRadius: 999, ...style }}>
    {children}
  </div>
);
const Bar: React.FC<{ w: number | string; h?: number; color?: string; style?: React.CSSProperties }> = ({ w, h = 12, color = GREY, style }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: color, flexShrink: 0, ...style }} />
);
/** A stroke that draws itself along an SVG path. */
const Line: React.FC<{ d: string; p: number }> = ({ d, p }) => (
  <path d={d} stroke={C.mute} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0} />
);
/** The message box of a chat: bars that get typed one by one, a caret and a send button. */
const Composer: React.FC<{ t: number; at: number; typeAt: number; sendAt?: number }> = ({ t, at, typeAt, sendAt }) => {
  const typed = [150, 110, 190].map((w, i) => w * interpolate(t, [typeAt + i * 0.22, typeAt + i * 0.22 + 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const caret = Math.floor(t * 2.5) % 2 === 0;
  const sent = sendAt === undefined ? 0 : prog(t, sendAt, 0.3);
  return (
    <div style={{ ...rise(t, at, 0.45, 16, 6), height: 96, boxSizing: "border-box", borderRadius: 28, boxShadow: `inset 0 0 0 2px #3A3A36`, background: "#1E1E1C", padding: "0 18px 0 30px", display: "flex", alignItems: "center", gap: 12 }}>
      {typed.map((w, i) => (w > 0 ? <Bar key={i} w={w} h={14} color="#8C877C" /> : null))}
      <div style={{ width: 3, height: 40, background: C.arena, opacity: caret ? 1 : 0 }} />
      <div style={{ flex: 1 }} />
      <div style={{ width: 60, height: 60, borderRadius: 30, background: interpolateColors(sent, [0, 1], ["#3A3A36", C.moss]), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ArrowUp size={34} strokeWidth={2.6} color={interpolateColors(sent, [0, 1], [C.mute, C.sumi])} />
      </div>
    </div>
  );
};

// ---------- cutaways ----------
/** A: our own screens. A tidy app window lights up on "hermosas"; a cursor presses its button on "fáciles de usar". */
const CutA: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT_A[0];
  const pretty = prog(t, PRETTY_AT, 0.5);
  const accent = interpolateColors(pretty, [0, 1], [GREY, C.moss]);
  const move = prog(t, EASY_AT - 0.4, 0.7);
  const press = t >= PRESS_AT ? 1 - 0.05 * (1 - prog(t, PRESS_AT, 0.3)) : 1;
  const done = t >= PRESS_AT;
  const card = (at: number, w: number) => (
    <div style={{ ...rise(t, at, 0.45, 16, 6), flex: 1, height: 150, boxSizing: "border-box", borderRadius: 20, background: "#2A2A27", padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: accent }} />
        <Bar w={110} />
      </div>
      <Bar w={w} h={26} color={accent} />
    </div>
  );
  const row = (at: number, w: number) => (
    <div style={{ ...rise(t, at, 0.45, 16, 6), display: "flex", alignItems: "center", gap: 18, height: 76, borderTop: `1.5px solid ${C.line}` }}>
      <div style={{ width: 44, height: 44, borderRadius: 22, background: GREY }} />
      <Bar w={w} color="#8C877C" />
      <div style={{ flex: 1 }} />
      <Bar w={70} />
    </div>
  );
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={a - HEAD_LEAD} text="nuestras pantallas" />
      <Window t={t} at={a - 0.2} top={420} title="nuestra UI">
        <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
          {card(a, 190)}
          {card(a + 0.08, 150)}
        </div>
        {row(a + 0.16, 260)}
        {row(a + 0.24, 200)}
        <div style={{ ...rise(t, a + 0.32, 0.45, 16, 6), display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
          <div style={{ width: 230, height: 78, borderRadius: 39, background: accent, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press})` }}>
            {done ? <Check size={44} strokeWidth={3} color={C.sumi} style={rise(t, PRESS_AT, 0.3, 6, 4)} /> : <Bar w={110} color="rgba(26,26,24,.55)" />}
          </div>
        </div>
      </Window>
      <MousePointer2 size={62} strokeWidth={2} color={C.sumi} fill={C.arena} style={{ position: "absolute", left: 900 - 120 * move, top: 1120 - 150 * move, opacity: prog(t, EASY_AT - 0.4, 0.25) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1100, display: "flex", justifyContent: "center", gap: 22 }}>
        <Pill style={rise(t, PRETTY_AT)}>
          <Sparkles size={32} strokeWidth={2.2} color={C.moss} />
          hermosas
        </Pill>
        <Pill style={rise(t, EASY_AT)}>
          <Dot pulse={pulseAt(t, PRESS_AT)} />
          fáciles de usar
        </Pill>
      </div>
    </AbsoluteFill>
  );
};

/** B: where software is used now. The MCP mark draws itself; then Claude's chat. */
const CutB: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <McpMark size={210} draw={interpolate(t, [CUT_B[0] - 0.3, CUT_B[0] + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <div style={{ ...rise(t, CUT_B[0] - HEAD_LEAD), fontFamily: SANS, fontWeight: 700, fontSize: 96, letterSpacing: -3, lineHeight: 1, color: C.arena }}>MCP</div>
    </div>
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <Line d="M540 690 V790" p={prog(t, VIA_AT, 0.45)} />
    </svg>
    <Window t={t} at={CHAT_AT} top={830} title={<><ClaudeTitle /><span style={{ marginLeft: 6 }}>· chat</span></>}>
      <Composer t={t} at={CHAT_AT + 0.1} typeAt={CHAT_AT + 0.22} />
    </Window>
  </AbsoluteFill>
);

/** C: SAP as software. One screen, then "varias pantallas" (they keep coming, past the edge), then "varias
 *  configuraciones": a switch and a slider in each, flipping on in no particular order. */
const GRID = { x: 140, top: 430, w: 250, h: 176, gx: 25, gy: 22 };
const BIG = 4; // the first screen is the center cell: it fills the grid and shrinks in place, so x=540 is never lost
const SCREEN_ORDER = [1, 5, 3, 7, 0, 2, 8, 6]; // arrival order of the other cells of the first three rows
const FLIP_ORDER = [5, 0, 8, 3, 10, 1, 6, 11, 4, 9, 2, 7];
const Screen: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const row = Math.floor(i / 3);
  const at = i === BIG ? CUT_C[0] - 0.2 : row < 3 ? SCREENS_AT - 0.2 + (SCREEN_ORDER.indexOf(i) + 1) * 0.03 : SCREENS_AT + 0.3 + (i - 9) * 0.09;
  const cfg = CONFIG_AT + FLIP_ORDER[i] * 0.012;
  const flip = prog(t, CONFIG_AT + 0.14 + FLIP_ORDER[i] * 0.05, 0.22);
  // the first screen fills the first three rows until he says "varias pantallas", then takes its cell
  const big = i === BIG ? 1 - prog(t, SCREENS_AT - 0.2, 0.4) : 0;
  const k = 1 + big * ((3 * GRID.w + 2 * GRID.gx) / GRID.w - 1);
  return (
    <div style={{ ...rise(t, at, 0.4, 16, 6), transform: `scale(${k})`, transformOrigin: "50% 50%", zIndex: i === BIG ? 1 : 0, position: "absolute", left: GRID.x + (i % 3) * (GRID.w + GRID.gx), top: GRID.top + row * (GRID.h + GRID.gy), width: GRID.w, height: GRID.h, boxSizing: "border-box", background: C.win, borderRadius: 18, boxShadow: "0 0 0 1.5px #4C4C46", padding: "18px 20px" }}>
      <div style={{ display: "flex", gap: 7, marginBottom: 18 }}><Dots size={9} /></div>
      <Bar w={[150, 120, 170][i % 3]} color={C.arena} h={10} />
      <Bar w={[100, 160, 90][i % 3]} color="#8C877C" h={10} style={{ marginTop: 12 }} />
      {big > 0 ? (
        <div style={{ position: "absolute", left: 20, right: 20, top: 96, opacity: big, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ height: 1, background: C.line }} />
          <Bar w={130} h={8} />
          <Bar w={90} h={8} />
        </div>
      ) : null}
      <div style={{ ...rise(t, cfg, 0.3, 8, 4), display: "flex", alignItems: "center", gap: 14, marginTop: 24 }}>
        <div style={{ width: 52, height: 28, borderRadius: 14, background: interpolateColors(flip, [0, 1], ["#3A3A36", "#8C877C"]), position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 4, left: 4 + 24 * flip, width: 20, height: 20, borderRadius: 10, background: C.arena }} />
        </div>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#4C4C46", position: "relative" }}>
          <div style={{ position: "absolute", top: -7, left: `${[30, 65, 45][i % 3] + (i % 2 ? 18 : -14) * flip}%`, width: 18, height: 18, borderRadius: 9, background: SOFT }} />
        </div>
      </div>
    </div>
  );
};
const CutC: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Head t={t} at={CUT_C[0] - HEAD_LEAD} text="el software como tal" size={58} mark={<Img src={staticFile(SAP)} style={{ height: 66 }} />} />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Screen key={i} t={t} i={i} />)}
    {/* a fourth row keeps coming and fades out by y 1064: there are more screens than fit */}
    <AbsoluteFill style={{ WebkitMaskImage: "linear-gradient(180deg, #000 1030px, transparent 1064px)", maskImage: "linear-gradient(180deg, #000 1030px, transparent 1064px)" }}>
      {[9, 10, 11].map((i) => <Screen key={i} t={t} i={i} />)}
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, fontFamily: MONO, fontSize: 40, color: C.arena }}>
      <span style={rise(t, SCREENS_AT + 0.2, 0.4, 12, 6)}>varias pantallas</span>
      <span style={rise(t, CONFIG_AT + 0.12, 0.4, 12, 6)}>varias configuraciones</span>
    </div>
  </AbsoluteFill>
);

/** D: the MCP he built sits between SAP and the assistants he names. */
const Node: React.FC<{ t: number; at: number; left: number; top: number; w: number; h: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ t, at, left, top, w, h, style, children }) => (
  <div style={{ ...rise(t, at, 0.5, 20, 8), position: "absolute", left, top, width: w, height: h }}>
    <div style={{ width: w, height: h, boxSizing: "border-box", background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.3)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, ...style }}>
      {children}
    </div>
  </div>
);
/** The one moss dot that runs Claude → MCP → SAP on "mucho más fáciles" (it passes under the MCP tile). */
const TRIP: Array<[number, number]> = [[330, 980], [330, 930], [540, 930], [540, 880], [540, 580], [540, 470]];
const TRIP_AT = D_PULSE - 0.6;
const tripPoint = (p: number): [number, number] => {
  const seg = TRIP.slice(1).map(([x, y], i) => Math.abs(x - TRIP[i][0]) + Math.abs(y - TRIP[i][1]));
  let d = p * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) return [TRIP[i][0] + ((TRIP[i + 1][0] - TRIP[i][0]) * d) / seg[i], TRIP[i][1] + ((TRIP[i + 1][1] - TRIP[i][1]) * d) / seg[i]];
    d -= seg[i];
  }
  return TRIP[TRIP.length - 1];
};
const CutD: React.FC<{ t: number }> = ({ t }) => {
  const easier = prog(t, D_EASIER, 0.45);
  const lit = prog(t, D_SAP - 0.1, 0.35);
  const trip = interpolate(t, [TRIP_AT, D_PULSE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IO });
  const [dx, dy] = tripPoint(trip);
  const arrived = pulseAt(t, D_PULSE);
  return (
    <AbsoluteFill>
      <Sumi />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <Line d="M540 580 V470" p={prog(t, D_SAP - 0.4, 0.4)} />
        <Line d="M540 880 V930 H330 V980" p={prog(t, D_LINK, 0.5)} />
        <Line d="M540 930 H750 V980" p={prog(t, D_CHATGPT - 0.35, 0.4)} />
        {t >= TRIP_AT && t < D_PULSE ? <circle cx={dx} cy={dy} r={9} fill={C.moss} opacity={Math.min(1, trip * 8)} /> : null}
      </svg>
      {/* SAP waits dimmed from the first frame and lights up when he says it */}
      <Node t={t} at={CUT_D[0] - HEAD_LEAD} left={380} top={300} w={320} h={170} style={{ opacity: 0.25 + 0.75 * lit, boxShadow: `0 0 0 ${1.5 + 3 * arrived}px ${interpolateColors(arrived, [0, 1], [C.line, C.moss])}, 0 30px 80px rgba(0,0,0,.3)` }}>
        <Img src={staticFile(SAP)} style={{ height: 98 }} />
      </Node>
      <div style={{ ...rise(t, CUT_D[0] - HEAD_LEAD), position: "absolute", left: 390, top: 580, width: 300, height: 300, boxSizing: "border-box", background: C.win, borderRadius: 52, boxShadow: `0 0 0 2px ${C.moss}, 0 30px 80px rgba(0,0,0,.3)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <McpMark size={160} draw={interpolate(t, [CUT_D[0] - 0.3, CUT_D[0] + 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: -1.2, lineHeight: 1, color: C.arena }}>MCP</div>
      </div>
      <Node t={t} at={D_CLAUDE} left={150} top={980} w={360} h={150}>
        <Img src={staticFile(CLAUDE)} style={{ height: 66 }} />
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 60, letterSpacing: -1.8, color: C.arena }}>Claude</span>
      </Node>
      <Node t={t} at={D_CHATGPT} left={570} top={980} w={360} h={150}>
        <Img src={staticFile(OPENAI)} style={{ height: 124, margin: "0 -26px" }} />
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 54, letterSpacing: -1.6, color: C.arena }}>ChatGPT</span>
      </Node>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1215, display: "flex", justifyContent: "center" }}>
        <Pill style={rise(t, D_OPS)}>
          <Dot pulse={pulseAt(t, D_PULSE)} />
          las operaciones
          <Grow p={easier} w={382} color={C.moss}> · mucho más fáciles</Grow>
        </Pill>
      </div>
    </AbsoluteFill>
  );
};

/** F: the user decides. The platform with its buttons and checkboxes, or Claude. */
const Field: React.FC<{ t: number; at: number; w: number }> = ({ t, at, w }) => (
  <div style={{ ...rise(t, at, 0.45, 16, 6), marginBottom: 22 }}>
    <Bar w={w} color="#8C877C" h={10} />
    <div style={{ height: 58, borderRadius: 14, boxShadow: "inset 0 0 0 2px #4C4C46", background: "#1E1E1C", marginTop: 12 }} />
  </div>
);
const Box: React.FC<{ t: number; at: number; checkAt?: number; w: number }> = ({ t, at, checkAt, w }) => {
  const on = checkAt !== undefined && t >= checkAt;
  return (
    <div style={{ ...rise(t, at, 0.4, 12, 6), display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 11, boxSizing: "border-box", border: `2.5px solid ${on ? C.moss : C.mute}`, background: on ? C.moss : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {on ? <Check size={34} strokeWidth={3.4} color={C.sumi} style={{ clipPath: `inset(0 ${(1 - prog(t, checkAt!, 0.25)) * 100}% 0 0)` }} /> : null}
      </div>
      <Bar w={w} color="#8C877C" h={10} />
    </div>
  );
};
const CutF: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT_F[0];
  const press = t >= F_PRESS ? 1 - 0.05 * (1 - prog(t, F_PRESS, 0.3)) : 1;
  const lit = pulseAt(t, F_PRESS);
  const grow = prog(t, F_BUTTON - 0.2, 0.4); // the window is as tall as its content: it grows when the button arrives
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={a - HEAD_LEAD} text="tu usuario decide" size={68} mark={<User size={70} strokeWidth={2} color={C.moss} />} />
      <Window t={t} at={a - 0.2} top={410} title={<span style={{ color: C.arena }}>la plataforma</span>}>
        <Field t={t} at={a - 0.05} w={130} />
        <Field t={t} at={a + 0.05} w={180} />
        <div style={{ display: "flex", alignItems: "center", gap: 34, height: 84 * grow, marginTop: 8 * grow - 22 * (1 - grow) }}>
          <div style={{ ...rise(t, F_BUTTON, 0.4, 12, 6) }}>
            <div style={{ width: 240, height: 76, borderRadius: 18, background: C.moss, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press})`, boxShadow: `0 0 0 ${8 * lit}px rgba(143,168,90,${0.35 * lit})` }}>
              <Bar w={120} color="rgba(26,26,24,.6)" />
            </div>
          </div>
          <Box t={t} at={F_BOXES} checkAt={F_CHECK} w={90} />
          <Box t={t} at={F_BOXES + 0.1} w={70} />
        </div>
      </Window>
      <div style={{ ...rise(t, F_OR, 0.4, 10, 6), position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: MONO, fontSize: 44, lineHeight: 1, color: SOFT }}>o</div>
      <Window t={t} at={F_CHAT} top={960} title={t < F_CLAUDE ? "chat" : <ClaudeTitle style={rise(t, F_CLAUDE, 0.4, 10, 6)} />}>
        <Composer t={t} at={F_CHAT + 0.05} typeAt={F_TYPE} sendAt={F_SEND} />
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
  const usability = prog(t, USABILITY_AT, 0.45);
  return (
    <AbsoluteFill style={{ background: C.sumi }}>
      <Camera t={t} proxy={proxy} />
      {inside(t, CUT_A) && <CutA t={t} />}
      {inside(t, CUT_B) && <CutB t={t} />}
      {inside(t, CUT_C) && <CutC t={t} />}
      {inside(t, CUT_D) && <CutD t={t} />}
      {inside(t, CUT_F) && <CutF t={t} />}
      <Tag t={t} win={TAG_HOOK} dot={false}>
        <Img src={staticFile(CLAUDE)} style={{ height: 34 }} />
        Claude Code
      </Tag>
      <Tag t={t} win={TAG_PRACTICES} pulses={[USABILITY_AT]}>
        buenas prácticas
        <Grow p={usability} w={222} color={C.moss}> · usabilidad</Grow>
      </Tag>
      <Tag t={t} win={TAG_SAP} dot={false}>
        <McpMark size={36} />
        MCP para
        <Img src={staticFile(SAP)} style={{ height: 36 }} />
      </Tag>
      <Tag t={t} win={TAG_FRIENDLY} dot={false}>
        <McpMark size={36} />
        MCP friendly
      </Tag>
      {!inCutaway(t) && INK.map(([a, b, name, size, y, o]) => <Ink key={a} t={t} win={[a, b]} name={name} size={size} y={y} opacity={o} />)}
      <Caption t={t} />
      <Sfx fps={fps} />
    </AbsoluteFill>
  );
};
