import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import cuts from "./cuts.json";
import rawWords from "./words.json";
import waves from "./waves.json";
import { Easing } from "remotion";
import { C, MONO, SANS, prog, rise } from "./theme";

const EASE_IO = Easing.inOut(Easing.cubic);

// ---------- timeline (seconds on the edited video) ----------
const END = 49.04;
/** Full-screen sumi cutaways: one element each, hard cut in and out. */
const CUT_A: [number, number] = [11.18, 12.75]; // "que son los sound effects"
const CUT_B: [number, number] = [21.1, 26.3]; // "no suenan como estos otros… mucho más profesionales"
const CUT_C: [number, number] = [28.35, 34.3]; // "puedes usar la API key de ElevenLabs…"
const CUTAWAYS = [CUT_A, CUT_B, CUT_C];
const TAG_SFX: [number, number] = [17.3, 21.0]; // "como los whoosh, como las transiciones, como los que estás escuchando aquí"
const TAG_BED: [number, number] = [34.4, 38.6]; // "y también sonidos de fondo, como el que escuchas aquí"
const CTA_AT = 46.07;

/** enter.mp3 swells for 0.37 s before its peak. A whoosh that starts ON the cut arrives late and sounds wrong,
 *  so each entry cue starts early; going back to the camera is a plain cut with no sound. */
const ENTER_PEAK = 0.37;
/** Sound cues, Ali Abdaal's approach: many varied effects, all far below the voice.
 *  [second, file, volume]. Files are peak-matched at -3 dB; the two demo whooshes sit a little higher. */
const CUES: Array<[number, string, number]> = [
  [6.74, "pop.mp3", 0.16], // "AL RESTO"
  [CUT_A[0] - ENTER_PEAK, "enter.mp3", 0.22], // into cutaway A: the peak lands on the cut
  [11.84, "chime.mp3", 0.14], // "sound effects"
  [17.6 - 0.26, "whoosh.mp3", 0.3], // demo: "como los whoosh"
  [18.75 - 0.04, "trans.mp3", 0.3], // demo: "como las transiciones"
  [20.2, "pop.mp3", 0.16], // "escuchando aquí"
  [CUT_B[0] - ENTER_PEAK, "enter.mp3", 0.22], // into cutaway B
  [22.15, "whoosh-code.wav", 0.26], // demo: the code-made one
  [24.38, "pop.mp3", 0.14], // ElevenLabs row
  [24.75, "whoosh.mp3", 0.3], // demo: the ElevenLabs one
  [CUT_C[0] - ENTER_PEAK, "enter.mp3", 0.22], // into cutaway C
  [30.0, "typing.mp3", 0.3], // the prompt is typed
  [31.45, "click.mp3", 0.3], // duration row
  [33.6, "chime.mp3", 0.14], // "listo"
  [39.3, "sparkle.mp3", 0.14], // "detalle": a real bar chime, brushed once
  [46.05, "pop.mp3", 0.16], // "¿Y TÚ?"
];
/** Suno music under the whole video; it swells while he says "sonidos de fondo, como el que escuchas aquí". */
const MUSIC = { base: 0.11, swell: 0.34, up: 34.3, hold: [35.2, 36.9] as [number, number], down: 38.6 };
const musicVolume = (t: number) =>
  interpolate(t, [0, 0.8, MUSIC.up, MUSIC.hold[0], MUSIC.hold[1], MUSIC.down, END - 1.5, END], [0, MUSIC.base, MUSIC.base, MUSIC.swell, MUSIC.swell, MUSIC.base, MUSIC.base, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IO });

/** Small hand-drawn marks, fine ballpoint line (Kie GPT Image 2.6, scripts/kie_icons.py style "b" → scripts/ink_mask.py),
 *  drawn when he names the thing.
 *  [in, out, file]. They sit centered above his head (where the pill tag goes; the two never coincide), in sumi, never over him. */
const INK: Array<[number, number, string]> = [
  [14.12, 16.4, "altavoz"], // "mejores sonidos"
  [27.24, 28.3, "moneda"], // "muy barata"
  [39.34, 41.2, "destello"], // "detalle"
  [45.3, 46.05, "claqueta"], // "crear contenido"
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
    if (b && ((a.w === "al" && b.w === "resto") || (a.w === "¿y" && b.w === "tú?"))) {
      out.push({ t: a.t, e: b.e, w: `${a.w} ${b.w}`.toUpperCase(), big: true });
      i++;
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
        color: t >= CTA_AT ? C.moss : C.arena, textShadow: "0 2px 18px rgba(0,0,0,.35)",
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

/** The waveform of a real sound: bars are its loudness over time, drawn as it plays. */
const Wave: React.FC<{ t: number; at: number; shape: number[]; color: string; h: number; bar: number; gap: number; square?: boolean; dur?: number }> = ({ t, at, shape, color, h, bar, gap, square, dur = 0.7 }) => (
  <div style={{ display: "flex", alignItems: "center", gap, height: h }}>
    {shape.map((v, i) => {
      const p = prog(t, at + (i / shape.length) * dur, 0.22);
      const idle = square ? 1 : 0.9 + 0.1 * Math.sin(t * 3.2 + i * 0.7);
      const height = Math.max(bar, (square ? Math.round(v * 3) / 3 : v) * h) * idle;
      return <div key={i} style={{ width: bar, height, borderRadius: square ? 2 : bar, background: color, opacity: p, transform: `scaleY(${0.3 + 0.7 * p})` }} />;
    })}
  </div>
);

const Tag: React.FC<{ t: number; win: [number, number]; label: string; pulses?: number[] }> = ({ t, win, label, pulses = [] }) => {
  if (!inside(t, win)) return null;
  const out = 1 - prog(t, win[1] - 0.3, 0.3);
  const pulse = pulses.reduce((v, at) => Math.max(v, t >= at && t < at + 0.5 ? 1 - (t - at) / 0.5 : 0), 0);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ ...rise(t, win[0]), display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 28, letterSpacing: 1, textTransform: "uppercase", color: C.arena, background: "rgba(26,26,24,.82)", padding: "16px 26px 17px", borderRadius: 999 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: C.moss, transform: `scale(${1 + 0.7 * pulse})` }} />
        {label}
      </div>
    </div>
  );
};

const Window: React.FC<{ t: number; at: number; top: number; title: string; children: React.ReactNode }> = ({ t, at, top, title, children }) => (
  <div style={{ ...rise(t, at), position: "absolute", left: 80, right: 80, top, background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.35)`, padding: "44px 50px 50px" }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: MONO, fontSize: 26, color: C.mute, marginBottom: 36 }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#3A3A36" }} />)}
      &nbsp;{title}
    </div>
    {children}
  </div>
);

const Row: React.FC<{ t: number; at: number; k: string; v: string; accent?: boolean }> = ({ t, at, k, v, accent }) => (
  <div style={{ ...rise(t, at, 0.45, 16, 6), display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 36, color: "#B9B3A6", padding: "22px 0", borderTop: `1.5px solid ${C.line}` }}>
    <span>{k}</span>
    <span style={{ color: accent ? C.moss : "#B9B3A6" }}>{v}</span>
  </div>
);

/** A brush mark: wipes in left to right like a stroke, breathes a little, fades out. */
const Ink: React.FC<{ t: number; win: [number, number]; name: string }> = ({ t, win, name }) => {
  if (!inside(t, [win[0], win[1] + 0.3])) return null;
  const p = prog(t, win[0], 0.45);
  const out = 1 - prog(t, win[1], 0.3);
  const url = staticFile(`ink/${name}.png`);
  return (
    <div
      style={{
        position: "absolute", left: 445, top: 290, width: 190, height: 190, background: C.sumi, opacity: 0.9 * out,
        WebkitMaskImage: `url(${url})`, maskImage: `url(${url})`, WebkitMaskSize: "contain", maskSize: "contain",
        WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center",
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, transform: `scale(${0.96 + 0.04 * p})`,
      }}
    />
  );
};

// ---------- cutaways ----------
const CutA: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Wave t={t} at={CUT_A[0] + 0.02} shape={waves.pro} color={C.moss} h={300} bar={14} gap={10} dur={0.5} />
      <div style={{ ...rise(t, CUT_A[0] + 0.35), marginTop: 60, fontFamily: SANS, fontWeight: 600, fontSize: 54, letterSpacing: -1.6, color: C.arena }}>sound effects</div>
    </div>
  </AbsoluteFill>
);

const CutB: React.FC<{ t: number }> = ({ t }) => {
  const label: React.CSSProperties = { display: "flex", alignItems: "center", gap: 16, fontFamily: MONO, fontSize: 32, color: C.mute, letterSpacing: 0.5 };
  return (
    <AbsoluteFill>
      <Sumi />
      <Window t={t} at={CUT_B[0] + 0.05} top={400} title="el mismo whoosh">
        <div style={{ ...rise(t, 21.75, 0.45, 16, 6), display: "flex", flexDirection: "column", gap: 14, padding: "26px 0" }}>
          <div style={label}>
            <Img src={staticFile("claude.png")} style={{ height: 40 }} />
            <span style={{ color: C.arena }}>Claude</span>&nbsp;· generado con código
          </div>
          <Wave t={t} at={22.15} shape={waves.code} color={C.mute} h={190} bar={13} gap={9} square dur={0.5} />
        </div>
        <div style={{ ...rise(t, 24.4, 0.45, 16, 6), display: "flex", flexDirection: "column", gap: 14, padding: "26px 0", borderTop: `1.5px solid ${C.line}` }}>
          <div style={label}><Img src={staticFile("elevenlabs-logo-white.svg")} style={{ height: 26 }} /></div>
          <Wave t={t} at={24.75} shape={waves.pro} color={C.moss} h={190} bar={13} gap={9} dur={0.6} />
        </div>
      </Window>
    </AbsoluteFill>
  );
};

const PROMPT = '"airy cinematic whoosh"';
const CutC: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <div style={{ ...rise(t, CUT_C[0] + 0.05), position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
      <Img src={staticFile("elevenlabs-logo-white.svg")} style={{ height: 54 }} />
    </div>
    <Window t={t} at={CUT_C[0] + 0.3} top={470} title="POST /v1/sound-generation">
      <Row t={t} at={29.9} k="text" v={PROMPT.slice(0, Math.round(prog(t, 30.0, 0.75) * PROMPT.length)) + (t < 30.8 ? "▍" : "")} accent />
      <Row t={t} at={31.45} k="duration" v="1.0 s" />
      <Row t={t} at={33.6} k="→ whoosh.mp3" v="listo" accent />
    </Window>
  </AbsoluteFill>
);

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
      <Tag t={t} win={TAG_SFX} label="SFX · whoosh" pulses={[17.45, 18.55, 20.2]} />
      <Tag t={t} win={TAG_BED} label="Fondo · música" pulses={[MUSIC.hold[0]]} />
      {!inCutaway(t) && INK.map(([a, b, name]) => <Ink key={name} t={t} win={[a, b]} name={name} />)}
      <Caption t={t} />
      <Sfx fps={fps} />
    </AbsoluteFill>
  );
};
