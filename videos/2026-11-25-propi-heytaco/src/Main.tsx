import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import cuts from "./cuts.json";
import rawWords from "./words.json";
import { Check, User } from "lucide-react";
import { Easing } from "remotion";
import { C, MONO, SANS, prog, rise } from "./theme";

const EASE_IO = Easing.inOut(Easing.cubic);

// ---------- timeline (seconds on the edited video) ----------
const END = 61.0;
/** Full-screen sumi cutaways: one explaining element each, hard cut in and out. */
const CUT_A: [number, number] = [9.44, 14.3]; // "HeyTaco, que es como darle un taco diciéndole gracias por ayudarme"
const CUT_B: [number, number] = [29.3, 35.95]; // "Propi: todo lo que es HeyTaco, con las cosas adicionales y además gratis"
const CUT_C: [number, number] = [50.4, 52.9]; // "salió en una sola noche, ya está listo en producción"
const CUTAWAYS = [CUT_A, CUT_B, CUT_C];
const TAG_YEARS: [number, number] = [14.5, 17.0]; // "durante dos años nos ha funcionado recontra bien"
const TAG_CLAUDE: [number, number] = [25.5, 27.7]; // "como tenemos Claude Code"
const TAG_LINK: [number, number] = [37.6, 39.55]; // "ingresas aquí al link": the live site, from his own notes (REEL-KIT "Facts you may show")
const TAG_REPO: [number, number] = [39.8, 41.3]; // "el repositorio es totalmente público"
const TAG_CLAUDE_END: [number, number] = [59.5, END];
const CTA_AT = 54.98;

/** enter.mp3 swells for 0.36 s before its peak, so each entry cue starts early; going back to the camera is silent. */
const ENTER_PEAK = 0.36;
/** Sound cues, Ali Abdaal's approach: many varied effects, each tied to something visible, all far below the voice.
 *  [second, file, volume]. */
const CUES: Array<[number, string, number]> = [
  [1.74, "pop.mp3", 0.13], // laptop mark: "remoto"
  [5.52, "chime.mp3", 0.11], // thank-you note mark: "agradecimientos"
  [CUT_A[0] - ENTER_PEAK, "enter.mp3", 0.22], // into cutaway A
  [10.75 - 0.26, "whoosh.mp3", 0.2], // the taco travels: the peak lands mid-flight
  [11.16, "chime.mp3", 0.14], // it lands: +1 taco
  [11.72, "typing.mp3", 0.24], // "gracias por ayudarme" is typed
  [14.66, "click.mp3", 0.2], // "dos años"
  [19.66, "click.mp3", 0.18], // clock mark: "tiempo"
  [23.34, "chime.mp3", 0.11], // coin mark: "pagar más suscripción"
  [25.58 - 0.04, "trans.mp3", 0.22], // Claude Code tag
  [CUT_B[0] - ENTER_PEAK, "enter.mp3", 0.22], // into cutaway B
  [30.35 - 0.26, "whoosh.mp3", 0.14], // the comparison window comes in
  [30.74, "click.mp3", 0.3], // row 1
  [33.02, "click.mp3", 0.3], // row 2
  [35.1, "sparkle.mp3", 0.16], // "GRATIS"
  [38.58, "pop.mp3", 0.15], // "link": propihq.com
  [39.84, "click.mp3", 0.22], // repo tag
  [45.72 - 0.04, "trans.mp3", 0.16], // broken chain mark: "ya no dependemos"
  [CUT_C[0] - ENTER_PEAK, "enter.mp3", 0.22], // into cutaway C
  [50.7, "pop.mp3", 0.18], // the big 1
  [52.2, "chime.mp3", 0.14], // "listo en producción"
  [54.98, "pop.mp3", 0.16], // "¿Y TÚ?"
  [57.22, "click.mp3", 0.14], // coin mark: "pagando por gusto"
  [59.62 - 0.04, "trans.mp3", 0.18], // Claude Code tag
];
/** Suno bed under the whole video. */
const MUSIC = 0.11;
const musicVolume = (t: number) =>
  interpolate(t, [0, 0.8, END - 1.5, END], [0, MUSIC, MUSIC, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IO });

/** Small hand-drawn marks, fine ballpoint line (Kie GPT Image 2.6, scripts/kie_icons.py style "b" → scripts/ink_mask.py),
 *  drawn when he names the thing. [in, out, file]. Centered above his head, in sumi, never with a pill tag. */
const INK: Array<[number, number, string, number?]> = [
  [1.74, 4.3, "laptop"], // "en remoto"
  [5.52, 7.3, "nota"], // "los agradecimientos son muy importantes"
  [19.66, 21.3, "reloj"], // "por el tiempo"
  [23.34, 24.9, "moneda"], // "pagar más suscripción"
  [45.72, 48.1, "cadena", 290], // "no dependemos tanto de un software" (a wide drawing: wider box, same visual weight)
  [57.22, 58.7, "moneda"], // "estás pagando por gusto"
];

const inside = (t: number, [a, b]: [number, number]) => t >= a && t < b;
const inCutaway = (t: number) => CUTAWAYS.some((c) => inside(t, c));

// ---------- camera ----------
/** Punch-in by cut: at a jump cut the framing toggles between 1 and 1.12, never animated.
 *  Cuts closer than 2.5 s to the last toggle keep the framing, so it never flickers. */
const PUNCHES = (() => {
  const out: number[] = [];
  let last = 0;
  for (const c of cuts as number[]) {
    if (c - last >= 2.5 && END - c > 1.5) {
      out.push(c);
      last = c;
    }
  }
  return out;
})();
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
const WORDS: Word[] = (() => {
  const src = rawWords as Word[];
  const out: Word[] = [];
  for (let i = 0; i < src.length; i++) {
    const a = src[i];
    const b = src[i + 1];
    if (b && a.w === "¿y" && b.w === "tú") {
      out.push({ t: a.t, e: b.e, w: "¿Y TÚ?", big: true });
      i++;
    } else if (a.w === "gratis") {
      out.push({ ...a, w: "GRATIS", big: true });
    } else out.push(a);
  }
  return out;
})();

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

const Tag: React.FC<{ t: number; win: [number, number]; label: string; pulses?: number[]; logo?: string; hold?: boolean }> = ({ t, win, label, pulses = [], logo, hold }) => {
  if (!inside(t, win)) return null;
  const out = hold ? 1 : 1 - prog(t, win[1] - 0.3, 0.3);
  const pulse = pulses.reduce((v, at) => Math.max(v, t >= at && t < at + 0.5 ? 1 - (t - at) / 0.5 : 0), 0);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ ...rise(t, win[0]), display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 28, letterSpacing: 1, textTransform: "uppercase", color: C.arena, background: "rgba(26,26,24,.82)", padding: "16px 26px 17px", borderRadius: 999 }}>
        {logo ? <Img src={staticFile(logo)} style={{ height: 34 }} /> : <div style={{ width: 12, height: 12, borderRadius: 6, background: C.moss, transform: `scale(${1 + 0.7 * pulse})` }} />}
        {label}
      </div>
    </div>
  );
};

const Window: React.FC<{ t: number; at: number; top: number; title: string; children: React.ReactNode }> = ({ t, at, top, title, children }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: 60, right: 60, top, background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.35)`, padding: "44px 50px 50px" }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: MONO, fontSize: 28, color: C.mute, marginBottom: 40 }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#3A3A36" }} />)}
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

/** A pen mark above his head: wipes in left to right like a stroke, fades out. */
const Ink: React.FC<{ t: number; win: [number, number]; name: string; size?: number }> = ({ t, win, name, size = 190 }) => {
  if (!inside(t, [win[0], win[1] + 0.3])) return null;
  const p = prog(t, win[0], 0.45);
  const out = 1 - prog(t, win[1], 0.3);
  return <Mark name={name} size={size} color={C.sumi} style={{ position: "absolute", left: 540 - size / 2, top: 385 - size / 2, opacity: 0.9 * out, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, transform: `scale(${0.96 + 0.04 * p})` }} />;
};

// ---------- cutaways ----------
/** A: what HeyTaco is. One taco travels from you to a teammate, with the thank-you it carries. */
const PERSON_Y = 810;
const Person: React.FC<{ t: number; at: number; x: number; label: string; children?: React.ReactNode }> = ({ t, at, x, label, children }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: x - 180, width: 360, top: PERSON_Y - 110, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ width: 220, height: 220, borderRadius: 110, boxShadow: `inset 0 0 0 3px ${C.mute}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <User size={108} color={C.mute} strokeWidth={1.5} />
    </div>
    <div style={{ marginTop: 24, fontFamily: MONO, fontSize: 36, color: "#B9B3A6" }}>{label}</div>
    {children}
  </div>
);
const THANKS = "gracias por ayudarme";
const TACO = { from: 280, to: 800, y: 640, lift: 150, settle: 14, appear: 10.12, go: 10.46, land: 11.16 };
const CutA: React.FC<{ t: number }> = ({ t }) => {
  const fly = interpolate(t, [TACO.go, TACO.land], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IO });
  const show = prog(t, TACO.appear, 0.35);
  const x = TACO.from + (TACO.to - TACO.from) * fly;
  const y = TACO.y - TACO.lift * Math.sin(Math.PI * fly) + TACO.settle * prog(t, TACO.land, 0.3);
  const typed = Math.round(interpolate(t, [11.86, 12.95], [0, THANKS.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill>
      <Sumi />
      <div style={{ ...rise(t, CUT_A[0] + 0.03), position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <Img src={staticFile("heytaco-logo-light.png")} style={{ height: 92 }} />
      </div>
      <Person t={t} at={CUT_A[0] + 0.1} x={TACO.from} label="tú" />
      <Person t={t} at={CUT_A[0] + 0.2} x={TACO.to} label="tu compañero">
        <div style={{ ...rise(t, TACO.land, 0.45, 14, 6), marginTop: 12, fontFamily: MONO, fontSize: 42, color: C.moss }}>+1 taco</div>
      </Person>
      <Mark name="taco" size={190} color={C.arena} style={{ position: "absolute", left: x - 95, top: y - 95, opacity: show, clipPath: `inset(0 ${(1 - show) * 100}% 0 0)` }} />
      <div style={{ ...rise(t, 11.8), position: "absolute", left: 110, right: 110, top: 1090, background: C.win, borderRadius: 24, boxShadow: `0 0 0 1.5px ${C.line}`, padding: "30px 40px 34px", textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 62, letterSpacing: -1.8, color: C.arena, whiteSpace: "nowrap" }}>
          “{THANKS.slice(0, typed)}{typed < THANKS.length ? "▍" : "”"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** B: Propi against HeyTaco, in his own three claims. */
const COLS = "1fr 290px 160px";
const Cell: React.FC<{ on?: boolean; v: string; t: number; at?: number }> = ({ on, v, t, at }) => (
  <span style={{ display: "flex", justifyContent: "center", alignItems: "center", color: on ? C.moss : C.mute, ...(at === undefined ? {} : rise(t, at, 0.4, 12, 6)) }}>
    {v === "✓" ? <Check size={46} strokeWidth={2.5} /> : v}
  </span>
);
const CompareRow: React.FC<{ t: number; at: number; k: string; a: string; b: string; bAt?: number }> = ({ t, at, k, a, b, bAt }) => (
  <div style={{ ...rise(t, at, 0.45, 16, 6), display: "grid", gridTemplateColumns: COLS, columnGap: 24, alignItems: "center", fontFamily: MONO, fontSize: 42, color: "#B9B3A6", padding: "36px 0", borderTop: `1.5px solid ${C.line}` }}>
    <span>{k}</span>
    <Cell v={a} t={t} />
    <Cell on v={b} t={t} at={bAt} />
  </div>
);
const CutB: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <div style={{ ...rise(t, CUT_B[0] + 0.03), position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 120, letterSpacing: -4, lineHeight: 1, color: C.arena }}>Propi</div>
    <div style={{ ...rise(t, CUT_B[0] + 0.25), position: "absolute", left: 0, right: 0, top: 436, textAlign: "center", fontFamily: MONO, fontSize: 34, letterSpacing: 0.5, color: C.mute }}>herramienta propia</div>
    {t >= 30.35 && (
      <Window t={t} at={30.35} top={530} title="comparación">
        <div style={{ display: "grid", gridTemplateColumns: COLS, columnGap: 24, alignItems: "center", paddingBottom: 34 }}>
          <span />
          <span style={{ display: "flex", justifyContent: "center" }}><Img src={staticFile("heytaco-logo-light.png")} style={{ height: 46 }} /></span>
          <span style={{ textAlign: "center", fontFamily: MONO, fontSize: 30, color: C.moss }}>propia</span>
        </div>
        <CompareRow t={t} at={30.74} k="lo de HeyTaco" a="✓" b="✓" />
        <CompareRow t={t} at={33.02} k="adicionales" a="—" b="✓" />
        <CompareRow t={t} at={34.71} k="precio" a="suscripción" b="gratis" bAt={35.1} />
      </Window>
    )}
  </AbsoluteFill>
);

/** C: how long Propi took. */
const CutC: React.FC<{ t: number }> = ({ t }) => {
  const pulse = t >= 52.2 && t < 52.7 ? 1 - (t - 52.2) / 0.5 : 0;
  return (
    <AbsoluteFill>
      <Sumi />
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...rise(t, CUT_C[0] + 0.02), fontFamily: SANS, fontWeight: 700, fontSize: 76, letterSpacing: -2.4, lineHeight: 1, color: C.arena }}>Propi</div>
        <div style={{ ...rise(t, 50.7, 0.5, 30, 10), marginTop: 30, fontFamily: MONO, fontWeight: 700, fontSize: 440, lineHeight: 0.96, color: C.moss }}>1</div>
        <div style={{ ...rise(t, 51.3), display: "flex", alignItems: "center", gap: 22, fontFamily: SANS, fontWeight: 600, fontSize: 92, letterSpacing: -3, lineHeight: 1, color: C.arena }}>
          noche
          <Mark name="luna" size={92} color={C.arena} />
        </div>
        <div style={{ ...rise(t, 51.78), marginTop: 70, display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 30, letterSpacing: 1, textTransform: "uppercase", color: C.arena, background: C.win, boxShadow: `0 0 0 1.5px ${C.line}`, padding: "18px 30px 19px", borderRadius: 999 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: C.moss, transform: `scale(${1 + 0.7 * pulse})` }} />
          en producción
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- sound ----------
const Sfx: React.FC<{ fps: number }> = ({ fps }) => {
  const at = (sec: number) => Math.round(sec * fps);
  return (
    <>
      {CUES.map(([sec, file, volume]) => (
        <Sequence key={`${file}${sec}`} from={at(sec)} durationInFrames={at(1.1)}><Audio src={staticFile(file)} volume={volume} /></Sequence>
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
      <Tag t={t} win={TAG_YEARS} label="HeyTaco · 2 años" pulses={[14.66]} />
      <Tag t={t} win={TAG_CLAUDE} label="Claude Code" logo="claude.png" />
      <Tag t={t} win={TAG_LINK} label="propihq.com" pulses={[38.58]} />
      <Tag t={t} win={TAG_REPO} label="github.com/stivenrosales/propi" logo="github-mark-white.svg" />
      <Tag t={t} win={TAG_CLAUDE_END} label="Claude Code" logo="claude.png" hold />
      {!inCutaway(t) && INK.map(([a, b, name, size]) => <Ink key={a} t={t} win={[a, b]} name={name} size={size} />)}
      <Caption t={t} />
      <Sfx fps={fps} />
    </AbsoluteFill>
  );
};
