import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Check, CreditCard, LayoutGrid, SlidersHorizontal } from "lucide-react";
import rawWords from "./words.json";
import { C, MONO, SANS, prog, rise } from "./theme";

const EASE_IO = Easing.inOut(Easing.cubic);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SOFT = "#B9B3A6";
const GREY = "#55554E";
const CLAUDE = "claude.png"; // Claude's spark: only ever next to the word Claude
const POLAR = "polar-logotype-white.svg"; // polar.sh/assets/brand/polar_brand.zip → Logotype/logotype_white.svg, untouched
const ZENBOX_MARK = "zenbox-mark.svg"; // usezenbox.com/zenbox-mark.svg, untouched
const PROPI_MARK = "propi-mark.svg"; // propihq.com/brand/propi-mark.svg, untouched

// ---------- timeline (seconds on the edited video) ----------
const END = 80.28;
/** Full-screen sumi cutaways: one explaining element each, hard cut in and out. */
const CUT_A: [number, number] = [19.6, 26.95]; // "open source. O sea, básicamente te regalo todo el código, tú ves cómo lo he hecho… instálalo tú"
const CUT_B: [number, number] = [30.3, 35.3]; // "no comprarte un servidor, o que yo lo gestione por ti, o te dé algunas aplicaciones de IA"
const CUT_C: [number, number] = [43.62, 50.4]; // "Polar.sh, que es una buena pasarela de pago y muy fácil de configurar… optimizado para este tipo de aplicaciones"
const CUT_D: [number, number] = [65.19, 69.5]; // "Son aplicaciones que yo las usé, las creé porque las necesito"
const CUTAWAYS = [CUT_A, CUT_B, CUT_C, CUT_D];
const TAG_CLAUDE: [number, number] = [2.85, 5.0]; // "con Claude Code"
const TAG_TWO: [number, number] = [7.42, 9.95]; // "pero dos son como que de código abierto"
const OPEN_AT = 8.24;
const TAG_ANYONE: [number, number] = [15.83, 17.7]; // "cualquiera puede hacerlo"
const TAG_DOUBT: [number, number] = [51.69, 54.0]; // "si este es el modelo más óptimo"
const TAG_ZENBOX: [number, number] = [62.83, 64.2]; // "aquí está: es Zenbox" (he points at the camera, so he stays on screen)
const TAG_PROPI: [number, number] = [64.3, 65.15]; // "y otra es Propi"
const TAG_CLAUDE_2: [number, number] = [77.5, 78.95]; // "gracias a Claude Code"
/** His question to the viewer goes in moss: "Pero cuéntame tú: ¿cómo piensas tú monetizar tu aplicación?" and "Déjame en los comentarios". */
const CTA: Array<[number, number]> = [[69.56, 72.9], [78.44, END + 1]];

// cutaway A: what "open source" means here, in his words
const A_CODE = CUT_A[0] - 0.15; // the first line is half written when the cut lands; typing.mp3 starts with it
const A_GIFT = 21.45; // "te regalo todo el código"
const A_LOOK: [number, number] = [22.48, 23.4]; // "tú ves cómo lo he hecho": the magnifier crosses the code
const A_INSTALL = 24.51; // "instálalo tú"
const A_YOU = 25.79; // "tú también lo puedes hacer"
// cutaway B: the steps he saves you
const B_ROW = [CUT_B[0] - 0.28, 31.88, 33.94]; // "no comprarte un servidor" (already there at the cut), "que yo lo gestione por ti", "aplicaciones de IA"
// cutaway C: Polar
const C_PAY = 45.62; // "pasarela de pago"
const C_EASY = 46.9; // "muy fácil de configurar"
const C_FIT = 48.54; // "optimizado para este tipo de aplicaciones"
// cutaway D: the two apps
const D_USED = 66.23; // "yo las usé"
const D_MADE = 67.32; // "las creé porque"
const D_NEED = 68.09; // "las necesito"

/** enter.mp3 swells for 0.36 s before its peak, so each entry cue starts early; going back to the camera is silent. */
const ENTER_PEAK = 0.36;
/** Sound cues, Ali Abdaal's approach: many varied effects, each tied to something visible, all far below the voice.
 *  [second, file, volume]. All reused from the batch (pilot + siblings). */
const CUES: Array<[number, string, number]> = [
  [TAG_CLAUDE[0] - 0.04, "trans.mp3", 0.16], // hook tag: Claude Code
  [TAG_TWO[0], "pop.mp3", 0.13], // tag: dos
  [OPEN_AT, "chime.mp3", 0.11], // the tag grows "de código abierto"
  [11.3, "check.mp3", 0.14], // pen mark: the shop, "modelo de negocio"
  [TAG_ANYONE[0], "click.mp3", 0.15], // tag: cualquiera puede hacerlo
  [CUT_A[0] - ENTER_PEAK, "enter.mp3", 0.2], // into "open source"
  [A_CODE, "typing.mp3", 0.13], // the code writes itself
  [A_GIFT, "sparkle.mp3", 0.12], // the gift: "te regalo todo el código"
  [A_INSTALL, "click.mp3", 0.15], // "instálalo tú"
  [CUT_B[0] - ENTER_PEAK, "enter.mp3", 0.2], // into the steps he saves you
  [B_ROW[1], "pop.mp3", 0.13], // "yo lo gestione por ti"
  [B_ROW[2], "chime.mp3", 0.11], // "aplicaciones de IA"
  [38.26, "lock.mp3", 0.15], // pen mark: the key, "tu API key"
  [CUT_C[0] - ENTER_PEAK, "enter.mp3", 0.2], // into Polar
  [C_PAY, "coin.mp3", 0.15], // the payment goes through
  [C_EASY, "click.mp3", 0.14], // "fácil de configurar": the switch flips
  [C_FIT, "chime.mp3", 0.11], // "optimizado para este tipo de aplicaciones"
  [TAG_DOUBT[0], "pop.mp3", 0.12], // tag: ¿el modelo más óptimo?
  [59.53, "thud.mp3", 0.2], // "INGRESOS" (with the punch-in)
  [TAG_ZENBOX[0], "pop.mp3", 0.13], // tag: Zenbox
  [TAG_PROPI[0], "pop.mp3", 0.13], // tag: Propi
  [CUT_D[0] - ENTER_PEAK, "enter.mp3", 0.2], // into the two apps
  [D_MADE, "chime.mp3", 0.12], // "las creé porque las necesito"
  [71.36 - 0.04, "trans.mp3", 0.18], // "MONETIZAR" (with the punch-in)
  [TAG_CLAUDE_2[0], "sparkle.mp3", 0.12], // tag: Claude Code
  [79.45, "check.mp3", 0.14], // pen mark: the speech bubble, "comentarios"
];
const CUE_LEN: Record<string, number> = { "sparkle.mp3": 1.25 };
/** Suno bed under the whole video (scripts/suno.py, "candid-2"). */
const MUSIC = 0.11;
const musicVolume = (t: number) => interpolate(t, [0, 0.8, END - 1.5, END], [0, MUSIC, MUSIC, 0], { ...clamp, easing: EASE_IO });

/** Small hand-drawn marks, fine ballpoint line (Kie GPT Image 2.6, scripts/kie_icons.py style "b" → scripts/ink_mask.py),
 *  drawn when he names the thing. [in, out, file, size, center y]. Centered above his head, in sumi, never with a pill tag. */
const INK: Array<[number, number, string, number, number]> = [
  [11.3, 13.0, "tienda", 150, 345], // "el modelo de negocio"
  [38.26, 39.1, "llave", 150, 345], // "tu API key"
  [79.45, END, "burbuja", 150, 345], // "comentarios"
];

const inside = (t: number, [a, b]: [number, number]) => t >= a && t < b;
const inCutaway = (t: number) => CUTAWAYS.some((c) => inside(t, c));

// ---------- camera ----------
/** Punch-in by cut: the framing is 1.12 inside these windows and 1 (the wide shot, his "zoom out") outside, never animated.
 *  Visible toggles, at least 2.5 s apart: 3.86, 7.33, 10.37 (hides the retake splice), 13.28, 17.09, 39.17, 42.0,
 *  53.8 (hides the "la forma…" splice), 56.85, 59.53 ("INGRESOS"), 62.7 (wide while he points), 71.36 ("MONETIZAR"), 75.44 and 78.35.
 *  Windows that end inside a cutaway just end there; the framing after a cutaway is whatever the list says. */
const PUNCHED: Array<[number, number]> = [[0, 3.86], [7.33, 10.37], [13.28, 17.09], [26.95, 31], [39.17, 42.0], [53.8, 56.85], [59.53, 62.7], [71.36, 75.44], [78.35, END + 1]];
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
type Word = { t: number; e: number; w: string; big?: number };
/** Heavy words: caption text → [shown, size]. "ingresos." is the second one ("ni siquiera se puede obtener ingresos"). */
const HEAVY: Record<string, [string, number]> = { "ingresos.": ["INGRESOS", 150], monetizar: ["MONETIZAR", 140] };
const WORDS: Word[] = (rawWords as Word[]).map((w) => (HEAVY[w.w] ? { ...w, w: HEAVY[w.w][0], big: HEAVY[w.w][1] } : w));

const Caption: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let k = 0; k < WORDS.length; k++) if (WORDS[k].t <= t) i = k;
  if (i < 0) return null;
  const w = WORDS[i];
  const until = Math.min(WORDS[i + 1]?.t ?? END, w.e + 0.9); // hold through short pauses, clear on long ones
  if (t >= until) return null;
  const p = prog(t, w.t, 0.12);
  const cta = CTA.some((c) => inside(w.t, c));
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: w.big ? 1345 : 1405, textAlign: "center",
        fontFamily: SANS, fontWeight: 700, fontSize: w.big ?? 84, letterSpacing: w.big ? -5 : -2.6, lineHeight: 1,
        color: cta ? C.moss : C.arena, textShadow: cta ? "0 2px 24px rgba(0,0,0,.6)" : "0 2px 18px rgba(0,0,0,.35)",
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

/** Pill tag over the camera: mono caps on sumi. A moss dot unless the content brings its own brand mark. */
const Tag: React.FC<{ t: number; win: [number, number]; pulses?: number[]; dot?: boolean; dotColor?: string; children: React.ReactNode }> = ({ t, win, pulses = [], dot = true, dotColor, children }) => {
  if (!inside(t, win)) return null;
  const out = 1 - prog(t, win[1] - 0.3, 0.3);
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
        width: size, height: size, background: color, flexShrink: 0,
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
/** Header of a cutaway: a short title centered at the top of the safe area. */
const Head: React.FC<{ t: number; at: number; text: string; size?: number }> = ({ t, at, text, size = 76 }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -2.4, lineHeight: 1, color: C.arena }}>{text}</div>
);

const Bar: React.FC<{ w: number | string; h?: number; color?: string; style?: React.CSSProperties }> = ({ w, h = 12, color = GREY, style }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: color, flexShrink: 0, ...style }} />
);

/** A wide tile with a pen drawing and one line in his words. It rises on its phrase and the drawing wipes in like a
 *  stroke; nothing holds its place before that. `lit` 0→1 rings it in moss. */
const TILE_W = 800;
const Tile: React.FC<{ t: number; at: number; top: number; h?: number; ink: string; inkSize?: number; size?: number; lit?: number; children: React.ReactNode }> = ({ t, at, top, h = 150, ink, inkSize = 92, size = 48, lit = 0, children }) => {
  const drawn = prog(t, at + 0.08, 0.5);
  return (
    <div style={{ ...rise(t, at, 0.45, 16, 6), position: "absolute", left: 540 - TILE_W / 2, top, width: TILE_W, height: h, boxSizing: "border-box", borderRadius: 28, background: C.win, boxShadow: `0 0 0 ${1.5 + 2.5 * lit}px ${interpolateColors(lit, [0, 1], ["#4C4C46", C.moss])}`, display: "flex", alignItems: "center", gap: 30, padding: "0 44px", fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -1.3, lineHeight: 1.06, color: C.arena, whiteSpace: "pre" }}>
      <Mark name={ink} size={inkSize} color={SOFT} style={{ clipPath: `inset(0 ${(1 - drawn) * 100}% 0 0)` }} />
      {children}
    </div>
  );
};

// ---------- A: open source ----------
/** Generic code lines: [indent, [width, tone]...]. No real text: it only has to read as "the code". */
const CODE: Array<[number, Array<[number, string]>]> = [
  [0, [[120, SOFT], [210, C.arena]]],
  [44, [[180, GREY], [96, SOFT], [150, GREY]]],
  [44, [[90, SOFT], [260, C.arena]]],
  [88, [[230, GREY], [110, SOFT]]],
  [44, [[150, GREY], [70, C.arena]]],
  [0, [[64, SOFT]]],
];
const CODE_X0 = 140 + 46; // window left + padding
const LENS = 130;
/** A: he opens the code. The window is writing itself at the cut; "te regalo todo el código" brings the gift, on
 *  "tú ves cómo lo he hecho" a magnifier crosses the code once and the lines it has passed brighten, and
 *  "instálalo tú" brings the laptop, which turns moss on "tú también lo puedes hacer". */
const CutA: React.FC<{ t: number }> = ({ t }) => {
  const pass = interpolate(t, A_LOOK, [0, 1], { ...clamp, easing: EASE_IO });
  const lensX = 170 + (790 - 170) * pass; // center of the lens
  const lens = Math.min(prog(t, A_LOOK[0] - 0.1, 0.25), 1 - prog(t, A_LOOK[1], 0.3));
  const label = Math.min(prog(t, A_LOOK[0] - 0.05, 0.35), 1 - prog(t, A_INSTALL - 0.5, 0.3));
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_A[0] - HEAD_LEAD} text="open source" />
      <Window t={t} at={CUT_A[0] - 0.2} top={420} title="el código">
        <div style={{ display: "flex", flexDirection: "column", gap: 18, height: 6 * 14 + 5 * 18 }}>
          {CODE.map(([indent, parts], i) => {
            const p = interpolate(t, [A_CODE + i * 0.26, A_CODE + i * 0.26 + 0.3], [0, 1], clamp);
            let x = CODE_X0 + indent;
            return (
              <div key={i} style={{ display: "flex", gap: 14, marginLeft: indent, height: 14, width: 620 * p, overflow: "hidden" }}>
                {parts.map(([w, tone], k) => {
                  const mid = x + w / 2;
                  x += w + 14;
                  const seen = t >= A_LOOK[0] ? interpolate(lensX - mid, [-40, 40], [0, 1], clamp) : 0;
                  return <Bar key={k} w={w} h={14} color={interpolateColors(seen, [0, 1], [tone, C.arena])} />;
                })}
              </div>
            );
          })}
        </div>
      </Window>
      {lens > 0 ? <Mark name="lupa" size={LENS} color={C.arena} style={{ position: "absolute", left: lensX - LENS * 0.42, top: 585, opacity: lens }} /> : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 774, textAlign: "center", fontFamily: MONO, fontSize: 34, letterSpacing: 0.4, color: SOFT, opacity: label }}>ves cómo lo he hecho</div>
      <Tile t={t} at={A_GIFT - 0.08} top={850} ink="regalo">te regalo todo el código</Tile>
      <Tile t={t} at={A_INSTALL - 0.08} top={1020} ink="laptop" lit={Math.max(0.8 * prog(t, A_YOU, 0.35), pulseAt(t, A_YOU, 0.6))}>
        instálalo tú
      </Tile>
    </AbsoluteFill>
  );
};

// ---------- B: the steps he saves you ----------
/** B: what you skip if he runs it for you. One tile per thing he lists, in his words, stacked from the top. */
const CutB: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Head t={t} at={CUT_B[0] - HEAD_LEAD} text="ahorrarte pasos" />
    <Tile t={t} at={B_ROW[0]} top={450} h={200} inkSize={112} size={46} ink="servidor">no comprarte un servidor</Tile>
    <Tile t={t} at={B_ROW[1] - 0.08} top={680} h={200} inkSize={112} size={46} ink="engranaje" lit={pulseAt(t, B_ROW[1], 0.6)}>que yo lo gestione por ti</Tile>
    <Tile t={t} at={B_ROW[2] - 0.08} top={910} h={200} inkSize={112} size={46} ink="bot">aplicaciones de IA</Tile>
  </AbsoluteFill>
);

// ---------- C: Polar ----------
const Row: React.FC<{ t: number; at: number; icon: React.ReactNode; h?: number; children: React.ReactNode }> = ({ t, at, icon, h = 104, children }) => (
  <div style={{ ...rise(t, at, 0.45, 16, 6), display: "flex", alignItems: "center", gap: 24, height: h, borderTop: `1.5px solid ${C.line}`, fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: -1.2, lineHeight: 1.1, color: C.arena }}>
    <div style={{ width: 60, height: 60, borderRadius: 30, background: "#3A3A36", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    {children}
  </div>
);
/** A part of the window that opens (height 0 → h) when its phrase comes, so the window grows and never waits empty. */
const Open: React.FC<{ t: number; at: number; h: number; children: React.ReactNode }> = ({ t, at, h, children }) => {
  const p = prog(t, at, 0.45);
  return <div style={{ height: h * p, overflow: "hidden", opacity: p, filter: `blur(${(1 - p) * 6}px)` }}><div style={{ height: h }}>{children}</div></div>;
};
/** C: Polar, with its own logotype. At the cut the window holds only a generic card field being typed; "pasarela de
 *  pago" rises already moss with its check, then the window grows one row per thing he says about it. */
const CutC: React.FC<{ t: number }> = ({ t }) => {
  const typed = interpolate(t, [CUT_C[0] - 0.3, CUT_C[0] + 1.3], [0, 16], clamp);
  const check = prog(t, C_PAY, 0.25);
  const sw = prog(t, C_EASY + 0.15, 0.3);
  return (
    <AbsoluteFill>
      <Sumi />
      <div style={{ ...rise(t, CUT_C[0] - HEAD_LEAD), position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center" }}>
        <Img src={staticFile(POLAR)} style={{ height: 150 }} />
      </div>
      <Window t={t} at={CUT_C[0] - 0.2} top={450}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, height: 96, boxSizing: "border-box", borderRadius: 26, background: "#2E2E2A", padding: "0 30px" }}>
          <CreditCard size={44} strokeWidth={2.2} color={SOFT} />
          <div style={{ display: "flex", gap: 22 }}>
            {[0, 1, 2, 3].map((g) => (
              <div key={g} style={{ display: "flex", gap: 9 }}>
                {[0, 1, 2, 3].map((k) => <div key={k} style={{ width: 13, height: 13, borderRadius: 7, background: C.arena, opacity: typed > g * 4 + k ? 1 : 0.12 }} />)}
              </div>
            ))}
          </div>
        </div>
        <Open t={t} at={C_PAY - 0.08} h={112}>
          <div style={{ marginTop: 20, height: 92, borderRadius: 26, background: C.moss, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: -1.1, color: C.sumi, transform: `scale(${1 - 0.03 * pulseAt(t, C_PAY, 0.25)})` }}>
            <Check size={42} strokeWidth={3.2} color={C.sumi} style={{ clipPath: `inset(0 ${(1 - check) * 100}% 0 0)` }} />
            pasarela de pago
          </div>
        </Open>
        <Open t={t} at={C_EASY - 0.1} h={130}>
          <div style={{ height: 26 }} />
          <Row t={t} at={C_EASY - 0.1} icon={<SlidersHorizontal size={34} strokeWidth={2.6} color={SOFT} />}>
            <span style={{ flex: 1 }}>fácil de configurar</span>
            <div style={{ width: 84, height: 48, borderRadius: 24, background: interpolateColors(sw, [0, 1], ["#3A3A36", C.moss]), position: "relative", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 6, left: 6 + 36 * sw, width: 36, height: 36, borderRadius: 18, background: C.arena }} />
            </div>
          </Row>
        </Open>
        <Open t={t} at={C_FIT - 0.1} h={140}>
          <Row t={t} at={C_FIT - 0.1} h={140} icon={<LayoutGrid size={34} strokeWidth={2.6} color={SOFT} />}>
            <span>optimizado para este<br />tipo de aplicaciones</span>
          </Row>
        </Open>
      </Window>
    </AbsoluteFill>
  );
};

// ---------- D: the two apps ----------
/** One app: its own mark on a washi tile (so the brand colors stay as they are), its name and its address. */
const App: React.FC<{ t: number; at: number; top: number; mark: string; name: string; url: string }> = ({ t, at, top, mark, name, url }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: 140, right: 140, top, height: 260, boxSizing: "border-box", background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.3)`, display: "flex", alignItems: "center", gap: 36, padding: "0 46px" }}>
    <div style={{ width: 138, height: 138, borderRadius: 34, background: C.washi, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Img src={staticFile(mark)} style={{ width: 104, height: 104 }} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 84, letterSpacing: -2.8, lineHeight: 1, color: C.arena }}>{name}</div>
      <div style={{ fontFamily: MONO, fontSize: 34, letterSpacing: 0.4, color: SOFT }}>{url}</div>
    </div>
  </div>
);
/** D: the two apps he just named, both there at the cut, and his reason on his words, closing in moss. */
const CutD: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <App t={t} at={CUT_D[0] - 0.2} top={340} mark={ZENBOX_MARK} name="Zenbox" url="usezenbox.com" />
    <App t={t} at={CUT_D[0] - 0.17} top={640} mark={PROPI_MARK} name="Propi" url="propihq.com" />
    <div style={{ position: "absolute", left: 0, right: 0, top: 968, textAlign: "center", fontFamily: MONO, fontSize: 36, letterSpacing: 0.4, color: SOFT }}>
      <div style={rise(t, D_USED - 0.08, 0.45, 14, 6)}>yo las usé</div>
    </div>
    {/* two centered lines, so nothing ever sits off-center while the second part arrives */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1050, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: -2, lineHeight: 1.12 }}>
      <div style={{ ...rise(t, D_MADE - 0.08, 0.45, 14, 6), color: C.arena }}>las creé porque</div>
      <div style={{ ...rise(t, D_NEED - 0.08, 0.45, 14, 6), color: C.moss }}>las necesito</div>
    </div>
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

/** An app's own mark inside a pill, on a small washi tile so its colors stay as they are. */
const AppMark: React.FC<{ src: string }> = ({ src }) => (
  <div style={{ width: 46, height: 46, borderRadius: 13, background: C.washi, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: -8 }}>
    <Img src={staticFile(src)} style={{ width: 36, height: 36 }} />
  </div>
);

/** Claude's spark breathes, like Claude thinking. */
const Spark: React.FC<{ t: number; from: number }> = ({ t, from }) => (
  <Img src={staticFile(CLAUDE)} style={{ height: 34, transform: `scale(${1 + 0.05 * Math.sin((t - from) * 5)})` }} />
);

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
      <Tag t={t} win={TAG_CLAUDE} dot={false}>
        <Spark t={t} from={TAG_CLAUDE[0]} />
        Claude Code
      </Tag>
      <Tag t={t} win={TAG_TWO} pulses={[OPEN_AT]}>
        dos
        <Grow p={prog(t, OPEN_AT, 0.45)} w={355}> · de código abierto</Grow>
      </Tag>
      <Tag t={t} win={TAG_ANYONE} dotColor={SOFT}>cualquiera puede hacerlo</Tag>
      <Tag t={t} win={TAG_DOUBT} dotColor={SOFT}>¿el modelo más óptimo?</Tag>
      <Tag t={t} win={TAG_ZENBOX} dot={false}>
        <AppMark src={ZENBOX_MARK} />
        Zenbox<span style={{ textTransform: "none", color: SOFT }}> · usezenbox.com</span>
      </Tag>
      <Tag t={t} win={TAG_PROPI} dot={false}>
        <AppMark src={PROPI_MARK} />
        Propi<span style={{ textTransform: "none", color: SOFT }}> · propihq.com</span>
      </Tag>
      <Tag t={t} win={TAG_CLAUDE_2} dot={false}>
        <Spark t={t} from={TAG_CLAUDE_2[0]} />
        Claude Code
      </Tag>
      {!inCutaway(t) && INK.map(([a, b, name, size, y]) => <Ink key={a} t={t} win={[a, b]} name={name} size={size} y={y} />)}
      <Caption t={t} />
      <Sfx fps={fps} />
    </AbsoluteFill>
  );
};
