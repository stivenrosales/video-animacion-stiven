/**
 * Scenes for the "cursos de IA" reel. Visual language: Claude's IG carousels (grid paper, hand-drawn
 * boxes, tilted tabs, curved arrows, clay tiles, metro lines) + Claude's reels (soft white serif
 * headlines and chalk-line icons over the camera). Every cue is an absolute second taken from
 * captions.json (edited timeline).
 */
import React from "react";
import { ClaudeLogo, GeminiLogo, OpenAILogo, YouTubeLogo } from "./Logos";
import { C, H, dm, mono, serif, serifItalic } from "./theme";
import { CHALK_ICONS, Ink, TILE_ICONS, arrow, box, line, strike, textWidth, type Stroke } from "./hand";
import { In, ease } from "./ui";

const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

/** Soft white serif over the camera, as in Claude's reels (no hard shadow). */
const soft: React.CSSProperties = { fontFamily: serif, fontWeight: 400, color: H.chalk, letterSpacing: -1, textShadow: "0 1px 14px rgba(0,0,0,.18)" };

/** Headline whose words settle in on their spoken timestamps. */
const Words: React.FC<{ t: number; words: Array<[string, number] | "\n">; style?: React.CSSProperties }> = ({ t, words, style }) => (
  <div style={{ textAlign: "center", lineHeight: 1.08, ...style }}>
    {words.map((w, i) =>
      w === "\n" ? (
        <br key={i} />
      ) : (
        <span key={i} style={{ display: "inline-block", marginRight: "0.24em" }}>
          <In t={t} at={w[1]} y={18} blur={8} dur={0.5} scale={1}>
            {w[0]}
          </In>
        </span>
      ),
    )}
  </div>
);

/* ---------------- 1. Hook (full) ---------------- */
export const Hook: React.FC<{ t: number }> = ({ t }) => (
  <div style={abs(0, 262, { width: 1080 })}>
    <Words t={t} style={{ ...soft, fontSize: 84 }} words={[["¿Quieres", 0.55], ["aprender", 0.85], "\n", ["inteligencia", 1.23], ["artificial?", 1.8]]} />
  </div>
);

/* ---------------- 2. Courses I don't recommend (card) ---------------- */
export const NOT_AT = { title: 2.43, row1: 3.87, strike1: 4.72, row2: 5.2, strike2: 6.5, rest: 7.07 };
const ROW_FONT = `500 40px ${dm}`;

const CourseRow: React.FC<{ t: number; at: number; y: number; label: string; title: string }> = ({ t, at, y, label, title }) => (
  <>
    <In t={t} at={at} x={-30} y={0} style={abs(90, y, { width: 150, height: 150, borderRadius: 8, background: H.clay })}>
      <span />
    </In>
    <In t={t} at={at + 0.08} x={-30} y={0} style={abs(262, y, { width: 728, height: 150, borderRadius: 10, background: H.gray, padding: "0 34px", display: "flex", flexDirection: "column", justifyContent: "center" })}>
      <div style={{ fontFamily: dm, fontSize: 21, fontWeight: 600, letterSpacing: 1.9, color: C.accent, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: dm, fontSize: 40, fontWeight: 500, color: C.ink }}>{title}</div>
    </In>
  </>
);

export const NotCourses: React.FC<{ t: number }> = ({ t }) => {
  const w1 = textWidth("Curso de universidad", ROW_FONT);
  const w2 = textWidth("Curso en línea", ROW_FONT);
  return (
    <>
      <In t={t} at={NOT_AT.title} style={abs(90, 262, { fontFamily: serif, fontSize: 66, color: C.ink, letterSpacing: -1 })}>
        Lo que <i style={{ fontFamily: serifItalic, color: C.accent }}>no</i> te recomiendo
      </In>
      <CourseRow t={t} at={NOT_AT.row1} y={392} label="Universidad" title="Curso de universidad" />
      <CourseRow t={t} at={NOT_AT.row2} y={566} label="En línea" title="Curso en línea" />
      <Ink
        t={t}
        strokes={(s) => [
          ...TILE_ICONS.cap(s, 165, 452, NOT_AT.row1 + 0.2),
          ...TILE_ICONS.laptop(s, 165, 641, NOT_AT.row2 + 0.2),
          ...strike(s, 296, 296 + w1, 489, NOT_AT.strike1, C.ink, 7),
          ...strike(s, 296, 296 + w2, 663, NOT_AT.strike2, C.ink, 7),
        ]}
      />
      <In t={t} at={NOT_AT.rest} style={abs(262, 742, { fontFamily: serifItalic, fontSize: 40, color: C.muted })}>
        …ni nada de eso.
      </In>
    </>
  );
};

/* ---------------- 3. Chalk icons over the camera (full) ---------------- */
export const CHALK_AT = { course: 7.62, courseSub: 8.64, ai: 9.99, aiSub: 11.82 };

const ChalkLabel: React.FC<{ t: number; at: number; subAt: number; x: number; title: string; sub: string }> = ({ t, at, subAt, x, title, sub }) => (
  <div style={abs(x, 404, { width: 360, textAlign: "center" })}>
    <In t={t} at={at} y={14} style={{ ...soft, fontSize: 50, lineHeight: 1.1 }}>
      {title}
    </In>
    <In t={t} at={subAt} y={10} style={{ ...soft, fontFamily: serifItalic, fontSize: 32, opacity: 0.88, marginTop: 6 }}>
      {sub}
    </In>
  </div>
);

export const ChalkIcons: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Ink t={t} shadow strokes={(s) => [...CHALK_ICONS.course(s, 225, 250, CHALK_AT.course), ...CHALK_ICONS.bolt(s, 740, 238, CHALK_AT.ai)]} />
    <ChalkLabel t={t} at={CHALK_AT.course + 0.35} subAt={CHALK_AT.courseSub} x={120} title="Curso de IA" sub="grabado hace 8 meses" />
    <ChalkLabel t={t} at={CHALK_AT.ai + 0.3} subAt={CHALK_AT.aiSub} x={620} title="La IA" sub="cambia cada semana" />
  </>
);

/* ---------------- 4. Launches feed (card) ---------------- */
export const FEED_AT = { title: 13.07, rows: [13.94, 16.54, 19.28, 20.75] };
const FEED = [
  { logo: <OpenAILogo size={40} color={C.ink} />, name: "dots", by: "ChatGPT", chip: "nuevo", color: H.pink },
  { logo: <ClaudeLogo size={40} />, name: "Claude Design", by: "Claude", chip: "hace semanas", color: H.green },
  { logo: <ClaudeLogo size={40} />, name: "Skills", by: "Claude", chip: "antes", color: H.blue },
  { logo: <ClaudeLogo size={40} />, name: "Memoria", by: "Claude", chip: "antes", color: H.amber },
];

export const Feed: React.FC<{ t: number }> = ({ t }) => (
  <>
    <In t={t} at={FEED_AT.title} style={abs(90, 262, { fontFamily: serif, fontSize: 58, color: C.ink, letterSpacing: -1 })}>
      Cada semana, algo nuevo
    </In>
    <svg width={1080} height={1920} style={abs(0, 0)}>
      {FEED.map((f, i) => {
        const y = 418 + i * 118;
        const x = 590 + i * 26;
        const y2 = y + 22;
        const d = `M560 ${y} H${x - 16} Q${x} ${y} ${x} ${y + 16} V${y2 - 16} Q${x} ${y2} ${x + 16} ${y2} H700`;
        return <path key={i} d={d} fill="none" stroke={f.color} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(t, FEED_AT.rows[i] + 0.2, 0.5)} />;
      })}
    </svg>
    {FEED.map((f, i) => (
      <React.Fragment key={f.name}>
        <In t={t} at={FEED_AT.rows[i]} x={-40} y={0} style={abs(90, 370 + i * 118, { width: 470, height: 96, background: "#fff", borderRadius: 22, boxShadow: "0 1px 3px rgba(20,20,19,.06), 0 10px 30px rgba(20,20,19,.08)", display: "flex", alignItems: "center", gap: 20, padding: "0 24px" })}>
          {f.logo}
          <div>
            <div style={{ fontFamily: dm, fontSize: 32, fontWeight: 600, color: C.ink }}>{f.name}</div>
            <div style={{ fontFamily: dm, fontSize: 22, color: C.muted }}>{f.by}</div>
          </div>
        </In>
        <In t={t} at={FEED_AT.rows[i] + 0.6} x={-16} y={0} scale={0.9} style={abs(712, 370 + i * 118 + 42)}>
          <span style={{ fontFamily: mono, fontSize: 24, padding: "3px 12px", borderRadius: 7, color: "#fff", background: f.color }}>{f.chip}</span>
        </In>
      </React.Fragment>
    ))}
  </>
);

/* ---------------- 5. Subscriptions (card) ---------------- */
export const SUBS_AT = { title: 26.15, box: 27.34, bracket: 27.9, rows: [28.43, 28.97, 29.57], tryIt: 31.25 };
const SUBS = [
  { logo: <ClaudeLogo size={64} />, name: "Claude" },
  { logo: <OpenAILogo size={64} color={C.ink} />, name: "ChatGPT" },
  { logo: <GeminiLogo size={64} />, name: "Gemini" },
];

export const Subscriptions: React.FC<{ t: number }> = ({ t }) => (
  <>
    <In t={t} at={SUBS_AT.title} style={abs(90, 262, { fontFamily: serif, fontSize: 62, color: C.ink, letterSpacing: -1 })}>
      Lo que <i style={{ fontFamily: serifItalic, color: C.green }}>sí</i> te recomiendo
    </In>
    <Ink
      t={t}
      strokes={(s) => [
        box(s, 90, 500, 330, 150, H.sand, SUBS_AT.box),
        line(s, [420, 575], [470, 575], SUBS_AT.bracket),
        line(s, [470, 450], [470, 750], SUBS_AT.bracket + 0.15),
        ...[450, 600, 750].map((y, i) => line(s, [470, y], [515, y], SUBS_AT.rows[i] - 0.15, {}, 0.18)),
      ]}
    />
    <In t={t} at={SUBS_AT.box + 0.25} style={abs(90, 500, { width: 330, height: 150, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: serif, fontSize: 42, lineHeight: 1.15, color: C.ink })}>
      Una buena suscripción
    </In>
    {SUBS.map((r, i) => (
      <React.Fragment key={r.name}>
        <In t={t} at={SUBS_AT.rows[i]} x={-30} y={0} style={abs(520, 390 + i * 150, { width: 120, height: 120, background: "#fff", borderRadius: 10, display: "grid", placeItems: "center", boxShadow: "0 1px 3px rgba(20,20,19,.06), 0 10px 30px rgba(20,20,19,.08)" })}>
          {r.logo}
        </In>
        <In t={t} at={SUBS_AT.rows[i] + 0.08} x={-30} y={0} style={abs(654, 390 + i * 150, { width: 336, height: 120, background: H.gray, borderRadius: 10, padding: "0 26px", display: "flex", flexDirection: "column", justifyContent: "center" })}>
          <div style={{ fontFamily: dm, fontSize: 21, fontWeight: 600, letterSpacing: 1.9, color: C.accent, textTransform: "uppercase", marginBottom: 6 }}>{r.name}</div>
          <In t={t} at={SUBS_AT.tryIt + i * 0.1} y={8} blur={6}>
            <div style={{ fontFamily: dm, fontSize: 28, color: C.ink }}>Pruébalo tú mismo</div>
          </In>
        </In>
      </React.Fragment>
    ))}
  </>
);

/* ---------------- 6. Ask-why loop (card) ---------------- */
export const LOOP_AT = { b1: 34.08, a1: 35.4, b2: 36.36, a2: 37.6, b3: 38.3, a3: 39.45, b4: 39.75, tab: 40.05 };

const BoxText: React.FC<{ t: number; at: number; x: number; y: number; w: number; h: number; size: number; weight?: number; center?: boolean; children: React.ReactNode }> = ({ t, at, x, y, w, h, size, weight = 500, center, children }) => (
  <In t={t} at={at + 0.2} y={10} blur={6} style={abs(x, y, { width: w, height: h, display: "flex", alignItems: "center", justifyContent: center ? "center" : "flex-start", padding: "0 34px", fontFamily: dm, fontSize: size, fontWeight: weight, lineHeight: 1.22, color: C.ink })}>
    <div>{children}</div>
  </In>
);

export const AskLoop: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Ink
      t={t}
      strokes={(s): Stroke[] => [
        box(s, 90, 270, 420, 120, H.ivory, LOOP_AT.b1),
        ...arrow(s, [[520, 320], [700, 320], [790, 405]], LOOP_AT.a1),
        box(s, 640, 420, 300, 110, H.peach, LOOP_AT.b2),
        ...arrow(s, [[640, 500], [580, 560], [520, 600]], LOOP_AT.a2),
        box(s, 90, 560, 420, 120, H.ivory, LOOP_AT.b3),
        ...arrow(s, [[300, 690], [360, 760], [590, 750]], LOOP_AT.a3),
        box(s, 600, 690, 380, 110, H.sand, LOOP_AT.b4),
        box(s, 560, 648, 262, 56, H.blueGray, LOOP_AT.tab, -4, 0.35),
      ]}
    />
    <BoxText t={t} at={LOOP_AT.b1} x={90} y={270} w={420} h={120} size={34}>Le dices qué quieres</BoxText>
    <BoxText t={t} at={LOOP_AT.b2} x={640} y={420} w={300} h={110} size={40} weight={600} center>¿Te sale?</BoxText>
    <BoxText t={t} at={LOOP_AT.b3} x={90} y={560} w={420} h={120} size={34}>Si no, le preguntas<br />por qué no te sale</BoxText>
    <BoxText t={t} at={LOOP_AT.b4} x={600} y={690} w={380} h={110} size={40} weight={600} center>Lo aprendes</BoxText>
    <In t={t} at={LOOP_AT.tab + 0.15} y={6} blur={4} style={abs(560, 648, { width: 262, height: 56, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)", fontFamily: dm, fontSize: 24, fontWeight: 500, color: C.ink })}>
      Así se aprende IA
    </In>
  </>
);

/* ---------------- 7. YouTube (card) ---------------- */
export const YT_AT = { box: 40.9, head: 41.12, free: 43.16, videos: [45.6, 47.0] };
const VIDEOS = [
  { bg: "#1D1D1B", fg: "#fff", thumb: "dots", title: "Probé dots de ChatGPT", meta: "hace 2 días · 12:04" },
  { bg: "#E9B9A3", fg: C.ink, thumb: "Design", title: "Claude Design paso a paso", meta: "hace 1 semana · 18:32" },
];

export const YouTube: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Ink t={t} strokes={(s) => [box(s, 90, 280, 900, 520, H.ivory, YT_AT.box, 0, 0.7), box(s, 700, 262, 190, 66, H.clay, YT_AT.free, 4, 0.35)]} />
    <In t={t} at={YT_AT.head} style={abs(124, 312, { display: "flex", alignItems: "center", gap: 16, fontFamily: dm, fontSize: 44, fontWeight: 600, color: C.ink })}>
      <YouTubeLogo size={56} /> Guía paso a paso
    </In>
    <In t={t} at={YT_AT.free + 0.12} y={6} blur={4} style={abs(700, 262, { width: 190, height: 66, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(4deg)", fontFamily: dm, fontSize: 32, fontWeight: 700, color: C.ink })}>
      GRATIS
    </In>
    {VIDEOS.map((v, i) => (
      <In key={v.title} t={t} at={YT_AT.videos[i]} x={-30} y={0} style={abs(130, 420 + i * 186, { display: "flex", alignItems: "center", gap: 26 })}>
        <div style={{ width: 280, height: 158, borderRadius: 14, background: v.bg, color: v.fg, display: "grid", placeItems: "center", fontFamily: serif, fontSize: 40, position: "relative" }}>
          {v.thumb}
          <span style={{ position: "absolute", right: 10, bottom: 10, background: "rgba(0,0,0,.75)", color: "#fff", fontFamily: dm, fontSize: 20, padding: "2px 8px", borderRadius: 6 }}>{v.meta.split(" · ")[1]}</span>
        </div>
        <div style={{ width: 500 }}>
          <div style={{ fontFamily: dm, fontSize: 32, fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>{v.title}</div>
          <div style={{ fontFamily: dm, fontSize: 24, color: C.muted, marginTop: 6 }}>{v.meta.split(" · ")[0]}</div>
        </div>
      </In>
    ))}
  </>
);

/* ---------------- 8. Why pay (full) ---------------- */
export const WHY_AT = { strike: 50.06 };
const WHY_FONT = `400 86px ${serif}`;

export const WhyPay: React.FC<{ t: number }> = ({ t }) => {
  // Line 2 "un curso?" is centered at x=540; measure it to place the strike on "curso".
  // Each word is an inline-block with a 0.24em right margin (see Words), so the line is
  // w("un") + gap + w("curso?") + gap wide.
  const gap = 0.24 * 86;
  const full = textWidth("un", WHY_FONT) + textWidth("curso?", WHY_FONT) + 2 * gap;
  const x0 = 540 - full / 2 + textWidth("un", WHY_FONT) + gap;
  const x1 = x0 + textWidth("curso", WHY_FONT);
  const nudge = -12; // measured on the full-size still: the strike sat ~12 px right of the word
  return (
    <>
      <div style={abs(0, 262, { width: 1080 })}>
        <Words t={t} style={{ ...soft, fontSize: 86 }} words={[["¿Para", 48.96], ["qué", 49.23], ["pagar", 49.41], "\n", ["un", 49.67], ["curso?", 49.78]]} />
      </div>
      <Ink t={t} strokes={(s) => strike(s, x0 + nudge, x1 + nudge, 262 + 86 * 1.08 * 1.62, WHY_AT.strike, H.clay, 11)} />
    </>
  );
};

/* ---------------- 9. Try it (full) ---------------- */
export const TRY_AT = { flask: 53.93, check: 55.18, cross: 55.79 };
export const TryIt: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Ink t={t} shadow strokes={(s) => [...CHALK_ICONS.flask(s, 140, 250, TRY_AT.flask), ...CHALK_ICONS.check(s, 465, 250, TRY_AT.check), ...CHALK_ICONS.cross(s, 790, 250, TRY_AT.cross)]} />
    {[
      ["Pruébalo", TRY_AT.flask, 35],
      ["Qué funciona", TRY_AT.check, 360],
      ["Qué no", TRY_AT.cross, 685],
    ].map(([label, at, x]) => (
      <In key={label as string} t={t} at={(at as number) + 0.3} y={12} style={abs(x as number, 412, { width: 360, textAlign: "center", ...soft, fontSize: 44 })}>
        {label}
      </In>
    ))}
  </>
);

/* ---------------- 10. Close (lowered full) ---------------- */
export const CLOSE_AT = { input: 56.4 };
export const Close: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={abs(0, 262, { width: 1080 })}>
      <Words t={t} style={{ ...soft, fontSize: 92 }} words={[["¿Tú", 56.17], ["qué", 56.33], ["opinas?", 56.52]]} />
    </div>
    <In t={t} at={CLOSE_AT.input} y={40} style={abs(120, 400, { width: 840, height: 200, background: "#fff", borderRadius: 32, boxShadow: "0 2px 6px rgba(20,20,19,.06), 0 18px 48px rgba(20,20,19,.14)" })}>
      <div style={{ position: "absolute", left: 40, top: 36, fontFamily: dm, fontSize: 36, color: C.placeholder }}>
        Escríbelo en los comentarios…
        <span style={{ display: "inline-block", width: 3, height: 40, marginLeft: 4, verticalAlign: "middle", background: C.ink, opacity: Math.floor(t * 2.4) % 2 ? 0.1 : 1 }} />
      </div>
      <div style={{ position: "absolute", left: 40, bottom: 22, fontFamily: dm, fontSize: 48, color: C.ink }}>+</div>
      <div style={{ position: "absolute", right: 30, bottom: 24, width: 64, height: 64, borderRadius: 16, background: H.clay, color: "#fff", display: "grid", placeItems: "center", fontFamily: dm, fontSize: 36, fontWeight: 700 }}>↑</div>
    </In>
  </>
);

/** SFX cue lists; Sfx.tsx imports these so no timing is duplicated. Stroke sounds are CC0 recordings
 *  picked by the user from out/sfx-ab (trazo A = Freesound 655051, tachón B = 751055, tiza C = OpenGameArt pencil). */
export const CUES = {
  aparicion: [FEED_AT.title, ...FEED_AT.rows, ...SUBS_AT.rows, ...YT_AT.videos, CLOSE_AT.input],
  // User: too much stroke sound → only the reveals that carry the idea, at half the level.
  trazo: [SUBS_AT.box, LOOP_AT.b1, LOOP_AT.b4, YT_AT.box],
  tachon: [NOT_AT.strike1, WHY_AT.strike],
  tiza: [] as number[], // user: no pencil sound on the chalk icons over the camera
  clic: [YT_AT.free, LOOP_AT.tab],
};
