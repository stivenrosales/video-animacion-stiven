import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Check, LockOpen, MapPin } from "lucide-react";
import rawWords from "./words.json";
import { C, MONO, SANS, prog, rise } from "./theme";

const EASE_IO = Easing.inOut(Easing.cubic);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SOFT = "#B9B3A6";
const GREY = "#55554E";
const CLAUDE = "claude.png"; // Claude's spark: only ever next to the word Claude

// ---------- timeline (seconds on the edited video) ----------
const END = 102.71;
/** Full-screen sumi cutaways: one explaining element each, hard cut in and out. */
const CUT_A: [number, number] = [6.06, 8.5]; // "todo se hace en la capital, en Lima, normalmente"
const CUT_B: [number, number] = [39.9, 45.4]; // "que hacen código o que crean sus propias herramientas, las hacen open source, porque creen"
const CUT_C: [number, number] = [58.06, 60.9]; // "oye, me funcionó, quizá te pueda también funcionar a ti"
const CUT_D: [number, number] = [63.5, 67.75]; // "que construyeron en las empresas donde trabajaron, cómo conseguir trabajos"
const CUT_F: [number, number] = [91.41, 96.05]; // "construí esto, me pasó esto, yo encontré esta herramienta"
const CUTAWAYS = [CUT_A, CUT_B, CUT_C, CUT_D, CUT_F];
/** Real b-roll: the Clawd figurine his friends gave him (his own footage, public/clawd.mp4).
 *  [from, to, second of the b-roll file where the shot starts]. Hard cuts, a gentle 1 → 1.04 push, captions keep running. */
const BROLL: Array<[number, number, number]> = [
  [32.58, 33.84, 3.95], // "que también me regalaron este…" (his other hand stands the figurine on his palm and lets go)
  [33.84, 35.0, 12.5], // "…Clawd, que está genial" (closer)
  [85.12, 88.75, 17.2], // "yo no salgo de casa porque estoy con Claude Code. Pero es…" (closest; back to him on "genial")
];

const TAG_EVENT: [number, number] = [0.55, 3.75]; // "en Huancayo hubo un evento de tecnología"
const EVENT_AT = 1.96;
const TAG_BUILDERS: [number, number] = [14.9, 18.75]; // "otros builders que hacen cosas con IA, cosas con no-code"
const AI_AT = 16.56;
const NOCODE_AT = 17.36;
const TAG_SHARE: [number, number] = [20.9, 23.3]; // "ellos comparten lo que aprenden"
const LEARN_AT = 21.63;
const TAG_PLAZA: [number, number] = [73.4, 76.6]; // "fue en la Plaza Huamanmarca"
const TAG_PASSION: [number, number] = [82.2, 84.4]; // "que nos apasiona crear"
const TAG_CLAUDE: [number, number] = [87.45, BROLL[2][1]]; // "con Claude Code" (over the figurine; it dies with the hard cut)
const CTA_AT = 96.94; // "¿Y tú qué opinas?"

// cutaway A: one event in Huancayo, everything else in Lima
const A_ALL = 6.08; // "todo se hace": the first dots are already there on the first frame
const A_CAPITAL = 6.82; // "la capital"
const A_LIMA = 7.36; // "Lima"
// cutaway B: what the developers do with what they build
const B_ROW = [CUT_B[0] - 0.1, 41.2]; // "hacen código" (already there at the cut), "crean sus propias herramientas"
const B_MAKE = 43.4; // "las hacen"
const B_OPEN = 43.79; // "open source"
// cutaway C: it worked for me → maybe it works for you
const C_ME = CUT_C[0] - 0.1; // "oye, me funcionó" (already there at the cut)
const C_CHECK = 58.44;
const C_YOU = 59.14; // "quizá te pueda también funcionar a ti"
// cutaway D: what else they talked about
const D_ROW = [CUT_D[0] - 0.1, 65.95]; // "construyeron", "cómo conseguir trabajos"
const D_WHERE = 64.74; // "en las empresas donde trabajaron"
// cutaway F: what they tell each other when they meet
const F_ROW = [CUT_F[0] - 0.1, 92.47, 94.57]; // "construí esto", "me pasó esto", "encontré esta herramienta"

/** enter.mp3 swells for 0.36 s before its peak, so each entry cue starts early; going back to the camera is silent. */
const ENTER_PEAK = 0.36;
/** Sound cues, Ali Abdaal's approach: varied effects, each tied to something visible, all far below the voice.
 *  [second, file, volume]. toy.mp3 is new (ElevenLabs, scripts/sfx_eleven.py "juguete"); the rest come from the batch. */
const CUES: Array<[number, string, number]> = [
  [TAG_EVENT[0] - 0.04, "trans.mp3", 0.16], // hook tag: Huancayo
  [EVENT_AT, "pop.mp3", 0.12], // the tag grows "evento de tecnología"
  [CUT_A[0] - ENTER_PEAK, "enter.mp3", 0.2], // into Lima / Huancayo
  [A_LIMA, "chime.mp3", 0.12], // "Lima"
  [11.64, "thud.mp3", 0.2], // "COMUNIDAD" (with the punch-in)
  [TAG_BUILDERS[0], "click.mp3", 0.14], // tag: builders
  [NOCODE_AT, "pop.mp3", 0.12], // the tag grows "no-code"
  [TAG_SHARE[0] - 0.04, "trans.mp3", 0.15], // tag: comparten
  [LEARN_AT, "chime.mp3", 0.11], // the tag grows "lo que aprenden"
  [31.42, "chime.mp3", 0.11], // friends mark: "ver a mis amigos"
  [BROLL[0][0] - 0.04, "trans.mp3", 0.13], // b-roll: the gift
  [BROLL[1][0], "toy.mp3", 0.16], // "Clawd": the closer shot
  [CUT_B[0] - ENTER_PEAK, "enter.mp3", 0.2], // into the developers
  [B_ROW[1] + 0.05, "click.mp3", 0.15], // "crean sus herramientas"
  [B_OPEN, "sparkle.mp3", 0.14], // "open source"
  [49.35, "coin.mp3", 0.13], // coin mark: "se puede monetizar"
  [54.8, "thud.mp3", 0.18], // "FUNCIONAN" (with the punch-in)
  [CUT_C[0] - ENTER_PEAK, "enter.mp3", 0.2], // into "me funcionó"
  [C_CHECK - 0.16, "check.mp3", 0.16], // it worked: the check
  [C_YOU + 0.1, "pop.mp3", 0.13], // "quizá te pueda funcionar a ti"
  [CUT_D[0] - ENTER_PEAK, "enter.mp3", 0.2], // into what they talked about
  [D_ROW[1] + 0.05, "click.mp3", 0.15], // "cómo conseguir trabajos"
  [69.45, "pop.mp3", 0.12], // graduation cap mark: "estudiantes"
  [TAG_PLAZA[0], "click.mp3", 0.14], // tag: the plaza
  [TAG_PASSION[0] - 0.04, "trans.mp3", 0.15], // tag: nos apasiona crear
  [TAG_CLAUDE[0], "toy.mp3", 0.15], // Claude Code tag over the figurine
  [CUT_F[0] - ENTER_PEAK, "enter.mp3", 0.2], // into the meetings
  [F_ROW[1] + 0.05, "pop.mp3", 0.13], // second bubble: "me pasó esto"
  [F_ROW[2] + 0.05, "pop.mp3", 0.13], // third bubble: "encontré esta herramienta"
  [98.16, "sparkle.mp3", 0.12], // speech bubble mark: "¿estás en alguna comunidad?"
  [101.02, "click.mp3", 0.14], // "Cuéntame" (with the punch-in)
];
const CUE_LEN: Record<string, number> = { "sparkle.mp3": 1.25 };
/** Suno bed under the whole video (scripts/suno.py, "plaza-1"). */
const MUSIC = 0.11;
const musicVolume = (t: number) => interpolate(t, [0, 0.8, END - 1.5, END], [0, MUSIC, MUSIC, 0], { ...clamp, easing: EASE_IO });

/** Small hand-drawn marks, fine ballpoint line (Kie GPT Image 2.6, scripts/kie_icons.py style "b" → scripts/ink_mask.py),
 *  drawn when he names the thing. [in, out, file, size, center y]. Centered above his head on unpunched frames, in sumi,
 *  never with a pill tag. */
const INK: Array<[number, number, string, number, number]> = [
  [31.42, 32.25, "amigos", 170, 309], // "aparte de ver a mis amigos"
  [49.3, 50.6, "moneda", 136, 318], // "genial, se puede monetizar" (gone before "pero no es la primera motivación")
  [69.45, 71.2, "birrete", 170, 305], // "orientado a estudiantes y vinieron a aprender"
  [98.16, 100.4, "burbuja", 150, 313], // "¿estás en alguna comunidad…?"
];

const inside = (t: number, [a, b]: [number, number]) => t >= a && t < b;
const inCutaway = (t: number) => CUTAWAYS.some((c) => inside(t, c));
const brollAt = (t: number) => BROLL.find(([a, b]) => t >= a && t < b);

// ---------- camera ----------
/** Punch-in by cut: the framing is 1.12 inside these windows and 1 outside, never animated. Visible toggles are at least
 *  2.5 s apart: 3.9, 11.64 ("COMUNIDAD"), 14.49, 27.24, 29.96, 37.76, 48.84, 54.8 ("FUNCIONAN"), 76.77, 81.21 and 101.02.
 *  Windows that end inside a cutaway or the b-roll just end there; 45.4 and 88.75 are returns that come back punched.
 *  Pills and pen marks sit on unpunched frames only when he stands tall (35-40 s and the plaza pill): checked with scripts/topsheet.sh. */
const PUNCHED: Array<[number, number]> = [[3.9, 7], [11.64, 14.49], [27.24, 29.96], [37.76, 40], [45.4, 48.84], [54.8, 59], [76.77, 81.21], [88.75, 92], [101.02, END + 1]];
const punched = (t: number) => PUNCHED.some((w) => inside(t, w));

/** daylight + white polo: a sumi floor so the arena word reads */
const Floor: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(26,26,24,.82) 0%, rgba(26,26,24,.6) 20%, rgba(26,26,24,0) 44%)" }} />
);

const Camera: React.FC<{ t: number; proxy: boolean }> = ({ t, proxy }) => {
  const breath = 1 + 0.0175 * (1 + Math.sin((t / 6) * Math.PI)); // 1 → 1.035, never below 1
  const scale = breath * (punched(t) ? 1.12 : 1);
  return (
    <AbsoluteFill style={{ opacity: inCutaway(t) || brollAt(t) ? 0 : 1 }}>
      <Video
        src={staticFile(proxy ? "proxy.mp4" : "edited.mp4")}
        style={{ width: 1080, height: 1920, objectFit: "cover", transform: `scale(${scale})`, transformOrigin: "50% 38%" }}
      />
      <Floor />
    </AbsoluteFill>
  );
};

/** One b-roll shot, full frame. It is mounted only while it shows, muted, and pushes in 1 → 1.04. */
const Broll: React.FC<{ t: number; fps: number; proxy: boolean }> = ({ t, fps, proxy }) => (
  <>
    {BROLL.map(([a, b, from]) => (
      <Sequence key={a} from={Math.round(a * fps)} durationInFrames={Math.round((b - a) * fps)}>
        <AbsoluteFill style={{ background: C.sumi }}>
          <Video
            muted
            src={staticFile(proxy ? "clawd-proxy.mp4" : "clawd.mp4")}
            trimBefore={Math.round(from * fps)}
            style={{ width: 1080, height: 1920, objectFit: "cover", transform: `scale(${interpolate(t, [a, b], [1, 1.04], clamp)})`, transformOrigin: "50% 45%" }}
          />
          <Floor />
        </AbsoluteFill>
      </Sequence>
    ))}
  </>
);

// ---------- captions: one word at a time ----------
type Word = { t: number; e: number; w: string; big?: boolean };
const HEAVY: Record<string, string> = { "comunidad.": "COMUNIDAD", "funcionan.": "FUNCIONAN" };
const WORDS: Word[] = (rawWords as Word[]).map((w) => (HEAVY[w.w] ? { ...w, w: HEAVY[w.w], big: true } : w));

const Caption: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let k = 0; k < WORDS.length; k++) if (WORDS[k].t <= t) i = k;
  if (i < 0) return null;
  const w = WORDS[i];
  const until = Math.min(WORDS[i + 1]?.t ?? END, w.e + 0.9); // hold through short pauses, clear on long ones
  if (t >= until) return null;
  const p = prog(t, w.t, 0.12);
  const size = w.big ? 128 : 84; // 128 keeps both nine-letter heavy words inside x 140–940
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: w.big ? 1362 : 1405, textAlign: "center",
        fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: w.big ? -5 : -2.6, lineHeight: 1,
        color: t >= CTA_AT ? C.moss : C.arena, textShadow: t >= CTA_AT ? "0 2px 22px rgba(0,0,0,.75), 0 0 8px rgba(0,0,0,.45)" : "0 2px 18px rgba(0,0,0,.35)",
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

const pulseAt = (t: number, at: number, dur = 0.5) => (t >= at && t < at + dur ? 1 - (t - at) / dur : 0);
const Dot: React.FC<{ pulse?: number; color?: string }> = ({ pulse = 0, color = C.moss }) => (
  <div style={{ width: 12, height: 12, borderRadius: 6, background: color, flexShrink: 0, transform: `scale(${1 + 0.7 * pulse})` }} />
);

/** A span that opens from zero width, so a label can grow a word when he says it. */
const Grow: React.FC<{ p: number; w: number; color?: string; children: React.ReactNode }> = ({ p, w, color, children }) => (
  <span style={{ display: "inline-block", width: w * p, opacity: p, overflow: "hidden", whiteSpace: "pre", color, filter: `blur(${(1 - p) * 6}px)` }}>{children}</span>
);

/** Pill tag over the camera: mono caps on sumi. A moss dot unless the content brings its own mark. */
const Tag: React.FC<{ t: number; win: [number, number]; pulses?: number[]; dot?: boolean; dotColor?: string; hard?: boolean; children: React.ReactNode }> = ({ t, win, pulses = [], dot = true, dotColor, hard, children }) => {
  if (!inside(t, win)) return null;
  const out = hard ? 1 : 1 - prog(t, win[1] - 0.3, 0.3); // `hard`: it leaves with a hard cut instead of fading
  const pulse = pulses.reduce((v, at) => Math.max(v, pulseAt(t, at)), 0);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ ...rise(t, win[0]), display: "flex", alignItems: "center", gap: 14, height: 68, boxSizing: "border-box", fontFamily: MONO, fontSize: 28, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "pre", color: C.arena, background: "rgba(26,26,24,.82)", padding: "0 26px", borderRadius: 999 }}>
        {dot ? <Dot pulse={pulse} color={dotColor} /> : null}
        {children}
      </div>
    </div>
  );
};

const Window: React.FC<{ t: number; at: number; top: number; left?: number; right?: number; children: React.ReactNode }> = ({ t, at, top, left = 140, right = 140, children }) => (
  <div style={{ ...rise(t, at), position: "absolute", left, right, top, background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.35)`, padding: "30px 46px" }}>
    {children}
  </div>
);

/** A row of a window: it opens (height and all) when he says it, so the window never shows an empty slot. */
const Row: React.FC<{ t: number; at: number; first?: boolean; sub?: React.ReactNode; children: React.ReactNode }> = ({ t, at, first, sub, children }) => {
  const on = prog(t, at, 0.45);
  const h = sub ? 172 : 126;
  return (
    <div style={{ height: first ? h : h * on, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, height: h, boxSizing: "border-box", borderTop: first ? undefined : `1.5px solid ${C.line}`, opacity: on, filter: `blur(${(1 - on) * 6}px)` }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: GREY, flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, letterSpacing: -1.6, lineHeight: 1.1, color: C.arena, whiteSpace: "pre" }}>{children}</div>
          {sub}
        </div>
      </div>
    </div>
  );
};

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
  const out = 1 - prog(t, win[1], 0.3);
  return <Mark name={name} size={size} color={C.sumi} style={{ position: "absolute", left: 540 - size / 2, top: y - size / 2, opacity: out, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, transform: `scale(${0.96 + 0.04 * p})` }} />;
};

/** Cutaway titles start this early, so the first frame after the hard cut already shows them about 60% in. */
const HEAD_LEAD = 0.1;
/** Header of a cutaway: a short title in his words, centered at the top of the safe area. */
const Head: React.FC<{ t: number; at: number; text: string; size?: number }> = ({ t, at, text, size = 72 }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -2.2, lineHeight: 1, color: C.arena }}>{text}</div>
);

/** A stroke that draws itself along an SVG path. */
const Line: React.FC<{ d: string; p: number; color?: string }> = ({ d, p, color = C.mute }) => (
  <path d={d} stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0} />
);
const Canvas: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

/** A node of a diagram: a wide dark tile centered on x=540. */
const Node: React.FC<{ t: number; at: number; top: number; w: number; h: number; lit?: number; size?: number; children: React.ReactNode }> = ({ t, at, top, w, h, lit = 0, size = 50, children }) => (
  <div style={{ ...rise(t, at, 0.5, 20, 8), position: "absolute", left: 540 - w / 2, top, width: w, height: h }}>
    <div style={{ width: w, height: h, boxSizing: "border-box", background: C.win, borderRadius: 28, boxShadow: `0 0 0 ${1.5 + 2.5 * lit}px ${interpolateColors(lit, [0, 1], [C.line, C.moss])}, 0 30px 80px rgba(0,0,0,.3)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -1.3, color: C.arena, whiteSpace: "pre" }}>
      {children}
    </div>
  </div>
);

// ---------- A: Huancayo and Lima ----------
/** One pen line: the flat coast at the left, where the grey dots pile up over "Lima", rising to the hills, where a
 *  single moss dot is the event in "Huancayo". Literal: no route, no numbers. */
const A_LAND = "M150 968 C230 962 330 972 432 966 C500 962 540 900 590 820 C630 756 650 700 700 668 C744 640 770 652 800 628 C836 600 870 622 932 640";
const A_COLS = 6;
const A_DOTS = 24;
const CutA: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <div style={{ ...rise(t, CUT_A[0] - HEAD_LEAD), position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: MONO, fontSize: 38, color: SOFT, whiteSpace: "pre" }}>
      todo se hace en<Grow p={prog(t, A_CAPITAL, 0.4)} w={254} color={C.arena}> la capital</Grow>
    </div>
    <Canvas>
      <path d={A_LAND} stroke={C.mute} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, CUT_A[0] - 0.35, 0.6)} />
      {Array.from({ length: A_DOTS }, (_, i) => {
        const p = prog(t, A_ALL + i * 0.045, 0.3);
        const row = Math.floor(i / A_COLS); // the pile grows from the ground up
        return <circle key={i} cx={176 + (i % A_COLS) * 46} cy={932 - row * 44} r={12 * (0.4 + 0.6 * p)} fill="#6E6A61" opacity={p} />;
      })}
      <circle cx={790} cy={602} r={15 + 6 * pulseAt(t, CUT_A[0] + 0.1, 0.6)} fill={C.moss} opacity={prog(t, CUT_A[0] - HEAD_LEAD, 0.3)} />
    </Canvas>
    <div style={{ ...rise(t, CUT_A[0] - HEAD_LEAD), position: "absolute", left: 620, width: 320, top: 478, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 70, letterSpacing: -2.2, lineHeight: 1, color: C.arena }}>Huancayo</div>
    <div style={{ ...rise(t, A_LIMA - 0.08, 0.45, 14, 6), position: "absolute", left: 151, width: 280, top: 1000, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 96, letterSpacing: -3, lineHeight: 1, color: C.arena }}>Lima</div>
  </AbsoluteFill>
);

// ---------- B: open source ----------
const CutB: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Head t={t} at={CUT_B[0] - HEAD_LEAD} text="los desarrolladores" size={68} />
    <Window t={t} at={CUT_B[0] - HEAD_LEAD} top={450}>
      <Row t={t} at={B_ROW[0]} first>hacen código</Row>
      <Row t={t} at={B_ROW[1]}>crean sus herramientas</Row>
    </Window>
    <Canvas>
      <Line d="M540 776 V872" p={prog(t, B_MAKE, 0.4)} />
    </Canvas>
    <div style={{ ...rise(t, B_OPEN - 0.08, 0.5, 18, 8), position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", alignItems: "center", gap: 24 }}>
      <LockOpen size={84} strokeWidth={2.4} color={C.moss} />
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 104, letterSpacing: -3.4, lineHeight: 1, color: C.moss }}>open source</div>
    </div>
  </AbsoluteFill>
);

// ---------- C: it worked for me ----------
const CutC: React.FC<{ t: number }> = ({ t }) => {
  const check = prog(t, C_CHECK, 0.25);
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_C[0] - HEAD_LEAD} text="a ellos les funciona" size={64} />
      <Node t={t} at={C_ME} top={500} w={680} h={140} size={56}>
        <div style={{ width: 60, height: 60, borderRadius: 30, background: C.moss, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Check size={40} strokeWidth={3.2} color={C.sumi} style={{ clipPath: `inset(0 ${(1 - check) * 100}% 0 0)` }} />
        </div>
        oye, me funcionó
      </Node>
      <Canvas>
        <Line d="M540 640 V760" p={prog(t, C_YOU - 0.25, 0.4)} />
      </Canvas>
      <Node t={t} at={C_YOU - 0.05} top={760} w={800} h={140} size={52} lit={Math.max(0.7 * prog(t, C_YOU + 0.3, 0.3), pulseAt(t, C_YOU + 0.3, 0.6))}>
        quizá te pueda funcionar a ti
      </Node>
    </AbsoluteFill>
  );
};

// ---------- D: what else they talked about ----------
const CutD: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Head t={t} at={CUT_D[0] - HEAD_LEAD} text="también hablaron de" size={64} />
    <Window t={t} at={CUT_D[0] - HEAD_LEAD} top={450}>
      <Row
        t={t} at={D_ROW[0]} first
        sub={<div style={{ ...rise(t, D_WHERE - 0.08, 0.45, 10, 6), fontFamily: MONO, fontSize: 32, color: SOFT, marginTop: 14, whiteSpace: "pre" }}>en las empresas donde trabajaron</div>}
      >
        lo que construyeron
      </Row>
      <Row t={t} at={D_ROW[1]}>cómo conseguir trabajos</Row>
    </Window>
  </AbsoluteFill>
);

// ---------- F: what they say when they meet ----------
/** Three dark speech bubbles, centered and straight, tails alternating left and right; each one comes on its phrase. */
const F_SAY = ["construí esto", "me pasó esto", "encontré esta herramienta"];
const BUBBLE = "#2B2B27";
const CutF: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Head t={t} at={CUT_F[0] - HEAD_LEAD} text="reuniones donde decimos" size={60} />
    {F_SAY.map((say, i) => {
      const left = i % 2 === 0;
      return (
        <div key={say} style={{ ...rise(t, F_ROW[i], 0.5, 20, 8), position: "absolute", left: 0, right: 0, top: 470 + i * 200, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", height: 132, padding: "0 50px", borderRadius: 42, background: BUBBLE, display: "flex", alignItems: "center", fontFamily: SANS, fontWeight: 700, fontSize: 58, letterSpacing: -1.6, color: C.arena, whiteSpace: "pre" }}>
            {say}
            <svg width={56} height={38} viewBox="0 0 44 30" style={{ position: "absolute", top: 131, [left ? "left" : "right"]: 56, transform: left ? undefined : "scaleX(-1)" }}>
              <path d="M0 0 H40 C30 6 14 18 4 30 C6 18 4 8 0 0 Z" fill={BUBBLE} />
            </svg>
          </div>
        </div>
      );
    })}
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
      <Broll t={t} fps={fps} proxy={proxy} />
      {inside(t, CUT_A) && <CutA t={t} />}
      {inside(t, CUT_B) && <CutB t={t} />}
      {inside(t, CUT_C) && <CutC t={t} />}
      {inside(t, CUT_D) && <CutD t={t} />}
      {inside(t, CUT_F) && <CutF t={t} />}
      <Tag t={t} win={TAG_EVENT} pulses={[EVENT_AT]}>
        Huancayo
        <Grow p={prog(t, EVENT_AT, 0.45)} w={426}> · evento de tecnología</Grow>
      </Tag>
      <Tag t={t} win={TAG_BUILDERS} dotColor={C.mute}>
        builders
        <Grow p={prog(t, AI_AT, 0.4)} w={90}> · IA</Grow>
        <Grow p={prog(t, NOCODE_AT, 0.4)} w={180}> · no-code</Grow>
      </Tag>
      <Tag t={t} win={TAG_SHARE} pulses={[LEARN_AT]}>
        comparten
        <Grow p={prog(t, LEARN_AT, 0.45)} w={336}> · lo que aprenden</Grow>
      </Tag>
      <Tag t={t} win={TAG_PLAZA} dot={false}>
        <MapPin size={32} strokeWidth={2.2} color={C.mute} />
        Plaza Huamanmarca
      </Tag>
      <Tag t={t} win={TAG_PASSION}>nos apasiona crear</Tag>
      <Tag t={t} win={TAG_CLAUDE} dot={false} hard>
        <Img src={staticFile(CLAUDE)} style={{ height: 34, transform: `scale(${breathe})` }} />
        Claude Code
      </Tag>
      {!inCutaway(t) && !brollAt(t) && INK.map(([a, b, name, size, y]) => <Ink key={a} t={t} win={[a, b]} name={name} size={size} y={y} />)}
      <Caption t={t} />
      <Sfx fps={fps} />
    </AbsoluteFill>
  );
};
