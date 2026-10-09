import React from "react";
import { BookOpenCheck, GraduationCap, Gift } from "lucide-react";
import { siClaude, siGithub, siYoutube } from "simple-icons";
import { Img, staticFile } from "remotion";
import { Swoosh } from "./Main";
import { ease, In, Words } from "./ui";
import { A, G, LAYOUT, lerp, panelShadow, pop, sans, serif, SERIF_AXES } from "./theme";

/** Every reveal is cued to a word timestamp in captions.json (edited timeline, seconds). */
export const CUES = {
  aparicion: [6.02, 11.44, 14.42, 18.75, 19.52, 27.18, 34.56, 37.25, 39.72, 41.49, 43.6, 47.32, 48.35, 53.6, 58.74, 59.34, 62.23, 64.02, 69.4, 69.95, 72.38, 75.16],
  clic: [16.37, 49.09, 73.16],
};

const ser: React.CSSProperties = { fontFamily: serif, fontVariationSettings: SERIF_AXES };

const Panel: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 60,
      right: 60,
      top: LAYOUT.panelTop,
      height: LAYOUT.panelBottom - LAYOUT.panelTop,
      background: A.panel,
      borderRadius: 44,
      boxShadow: panelShadow,
    }}
  />
);

const Icon: React.FC<{ path: string; color: string; size: number }> = ({ path, color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d={path} />
  </svg>
);

const pill = (bg: string, color: string): React.CSSProperties => ({
  ...ser,
  display: "inline-block",
  padding: "16px 36px 20px",
  borderRadius: 999,
  background: bg,
  color,
  fontWeight: 650,
  whiteSpace: "nowrap",
});

/** Brand medallion: the real Gentle AI / Engram / Gentleman logo on its dark with the pink ring. */
const Medal: React.FC<{ src: string; size: number; ring?: number; fill?: boolean }> = ({ src, size, ring = 4, fill }) => (
  <div
    style={{
      width: size,
      height: size,
      flex: "none",
      borderRadius: "50%",
      background: G.dark,
      boxShadow: `0 0 0 ${ring}px ${G.pink}`,
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
    }}
  >
    <Img src={staticFile(src)} style={{ width: fill ? "100%" : "80%", height: fill ? "100%" : "80%", objectFit: fill ? "cover" : "contain" }} />
  </div>
);

/* ---------------------------------------------------------------- full-frame headlines */

type W = Array<{ w: string; at: number; key?: boolean }>;

const Headline: React.FC<{ t: number; top: number; words: W; size?: number }> = ({ t, top, words, size = 92 }) => (
  <Words
    t={t}
    words={words}
    keyColor={A.salmonText}
    style={{
      ...ser,
      position: "absolute",
      left: 80,
      right: 80,
      top,
      textAlign: "center",
      color: "#fff",
      fontWeight: 560,
      fontSize: size,
      lineHeight: 1.06,
      letterSpacing: -1.2,
      textShadow: "0 2px 18px rgba(0,0,0,.25)",
    }}
  />
);

export const Hook: React.FC<{ t: number }> = ({ t }) => (
  <Headline
    t={t}
    top={290}
    words={[
      { w: "No", at: 0.73 },
      { w: "soy", at: 0.77 },
      { w: "programador,", at: 0.93 },
      { w: "soy", at: 2.28 },
      { w: "ingeniero", at: 2.4, key: true },
      { w: "químico", at: 2.8, key: true },
    ]}
  />
);

/** A white serif pill over the footage (Ali's "Business" / "Job" labels). */
const WhitePills: React.FC<{ t: number; items: Array<{ text: React.ReactNode; at: number }>; top?: number }> = ({ t, items, top = 330 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", gap: 28 }}>
    {items.map(({ text, at }) => (
      <In key={at} t={t} at={at} y={28} scale={0.9}>
        <div
          style={{
            ...pill("#fff", A.ink),
            fontSize: 58,
            borderRadius: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,.18)",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          {text}
        </div>
      </In>
    ))}
  </div>
);

export const ClaudeCode: React.FC<{ t: number }> = ({ t }) => (
  <WhitePills
    t={t}
    items={[
      {
        text: (
          <>
            <Icon path={siClaude.path} color="#D97757" size={54} />
            Claude Code
          </>
        ),
        at: 6.02,
      },
    ]}
  />
);

export const EasyPills: React.FC<{ t: number }> = ({ t }) => (
  <WhitePills
    t={t}
    items={[
      { text: "Más fácil", at: 18.75 },
      { text: "Más didáctico", at: 19.52 },
    ]}
  />
);

export const BuildLearn: React.FC<{ t: number }> = ({ t }) => (
  <Headline
    t={t}
    top={290}
    words={[
      { w: "Mientras", at: 20.36 },
      { w: "más", at: 20.82 },
      { w: "construyes,", at: 21.21, key: true },
      { w: "más", at: 21.73 },
      { w: "aprendes", at: 21.87, key: true },
    ]}
  />
);

export const Free: React.FC<{ t: number }> = ({ t }) => {
  const big = pop(t, 58.74);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            ...pill(A.salmon, "#fff"),
            fontWeight: 700,
            fontSize: 96,
            padding: "18px 56px 28px",
            opacity: Math.min(1, big * 1.4),
            transform: `scale(${lerp(0.7, 1, big)})`,
            boxShadow: "0 14px 34px rgba(255,134,117,.35)",
          }}
        >
          Gratis
        </div>
      </div>
      <WhitePills t={t} top={470} items={[{ text: "¿Por qué es gratis?", at: 59.34 }]} />
    </>
  );
};

export const ForWho: React.FC<{ t: number }> = ({ t }) => (
  <WhitePills
    t={t}
    items={[
      { text: "Programador", at: 69.4 },
      { text: "No programador", at: 69.95 },
    ]}
  />
);

export const Close: React.FC<{ t: number }> = ({ t }) => (
  <Headline
    t={t}
    top={290}
    words={[
      { w: "¿Ya", at: 75.16 },
      { w: "lo", at: 75.2 },
      { w: "conocías?", at: 75.25, key: true },
    ]}
  />
);

/* ---------------------------------------------------------------- creator cards over the footage */

const CreatorCard: React.FC<{ t: number; at: number; children?: React.ReactNode }> = ({ t, at, children }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 280, display: "flex", justifyContent: "center" }}>
    <In t={t} at={at} y={30} scale={0.92}>
      <div
        style={{
          background: "#fff",
          borderRadius: 36,
          padding: "26px 40px 26px 26px",
          display: "flex",
          alignItems: "center",
          gap: 26,
          boxShadow: "0 14px 40px rgba(0,0,0,.2)",
        }}
      >
        <Medal src="gp-avatar.png" size={112} fill />
        <div>
          <div style={{ ...ser, fontWeight: 700, fontSize: 52, color: A.ink, letterSpacing: -0.6, lineHeight: 1.05 }}>Gentleman Programming</div>
          <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 28, color: A.muted, marginTop: 8 }}>Alan Buscaglia · creador de Gentle AI</div>
        </div>
      </div>
    </In>
    {children}
  </div>
);

export const Creator: React.FC<{ t: number }> = ({ t }) => <CreatorCard t={t} at={27.18} />;

const Social: React.FC<{ t: number; at: number; icon: string; color: string; label: string }> = ({ t, at, icon, color, label }) => (
  <In t={t} at={at} y={22} scale={0.9}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 28px 16px 20px",
        borderRadius: 999,
        background: "#fff",
        boxShadow: "0 10px 26px rgba(0,0,0,.18)",
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 32,
        color: A.ink,
      }}
    >
      <Icon path={icon} color={color} size={40} />
      {label}
    </div>
  </In>
);

export const Follow: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CreatorCard t={t} at={62.23} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", gap: 22 }}>
      <Social t={t} at={64.02} icon={siYoutube.path} color="#FF0000" label="@GentlemanProgramming" />
      <Social t={t} at={64.22} icon={siGithub.path} color={A.ink} label="GitHub" />
    </div>
  </>
);

/* ---------------------------------------------------------------- text slides */

const SlideText: React.FC<{ t: number; words: W; top?: number }> = ({ t, words, top = 600 }) => (
  <div style={{ position: "absolute", inset: 0, background: A.canvas }}>
    <Swoosh />
    <Words
      t={t}
      keyColor={A.orange}
      words={words}
      style={{
        ...ser,
        position: "absolute",
        left: 80,
        right: 80,
        top,
        textAlign: "center",
        color: A.ink,
        fontWeight: 600,
        fontSize: 96,
        lineHeight: 1.1,
        letterSpacing: -1.8,
      }}
    />
  </div>
);

export const PracticesSlide: React.FC<{ t: number }> = ({ t }) => (
  <SlideText
    t={t}
    words={[
      { w: "Hay", at: 11.44 },
      { w: "mejores", at: 11.77, key: true },
      { w: "prácticas", at: 11.98, key: true },
      { w: "que", at: 12.33 },
      { w: "un", at: 12.47 },
      { w: "no", at: 12.92 },
      { w: "programador", at: 13.04 },
      { w: "no", at: 13.81 },
      { w: "conoce.", at: 13.91 },
    ]}
  />
);

const STRIKE = 16.37; // "mejor dicho"

/** "Para eso existen plugins o arneses": his own self-correction becomes a strike. */
export const HarnessSlide: React.FC<{ t: number }> = ({ t }) => {
  const head = ease(t, 14.42, 0.45);
  const plug = ease(t, 15.26, 0.45);
  const strike = ease(t, STRIKE, 0.5);
  const harness = ease(t, 15.78, 0.5);
  const word = (p: number): React.CSSProperties => ({
    display: "inline-block",
    opacity: p,
    transform: `translateY(${(1 - p) * 12}px)`,
    filter: p < 0.999 ? `blur(${(1 - p) * 14}px)` : undefined,
  });
  return (
    <div style={{ position: "absolute", inset: 0, background: A.canvas }}>
      <Swoosh />
      <div
        style={{
          ...ser,
          position: "absolute",
          left: 80,
          right: 80,
          top: 640,
          textAlign: "center",
          color: A.ink,
          fontWeight: 600,
          fontSize: 96,
          lineHeight: 1.18,
          letterSpacing: -1.8,
        }}
      >
        <span style={word(head)}>Para eso existen</span>
        <br />
        <span style={{ ...word(plug), position: "relative", color: `rgba(28,26,25,${lerp(1, 0.38, strike)})` }}>
          plugins
          <span
            style={{
              position: "absolute",
              left: -8,
              right: -8,
              top: "56%",
              height: 7,
              borderRadius: 4,
              background: A.ink,
              transform: `scaleX(${strike})`,
              transformOrigin: "left",
            }}
          />
        </span>{" "}
        <span style={{ ...word(harness), color: A.orange, fontWeight: 700 }}>arneses</span>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- chapter card */

/** Ali's chapter card with the real Gentle AI rose: the lilac line drops and curls into the creator pill. */
export const ChapterGentle: React.FC<{ t: number }> = ({ t }) => {
  const at = 22.7;
  const draw = ease(t, at + 0.15, 0.9);
  const medal = pop(t, at + 0.05);
  const stepP = pop(t, 23.31); // "Gentleman"
  return (
    <div style={{ position: "absolute", inset: 0, background: A.chapter }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M900 0 L900 1050 Q900 1122 830 1122"
          pathLength={1}
          fill="none"
          stroke={A.lilacPill}
          strokeWidth={7}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 390,
          top: 470,
          opacity: Math.min(1, medal * 1.4),
          transform: `scale(${lerp(0.7, 1, medal)})`,
          filter: `drop-shadow(0 0 30px rgba(240,149,200,.45))`,
        }}
      >
        <Medal src="rose.png" size={300} ring={5} />
      </div>
      <Words
        t={t}
        keyColor={A.ink}
        words={[
          { w: "Gentle", at: at + 0.15 },
          { w: "AI", at: at + 0.3 },
        ]}
        style={{
          ...ser,
          position: "absolute",
          left: 0,
          right: 0,
          top: 830,
          textAlign: "center",
          color: A.ink,
          fontWeight: 600,
          fontSize: 124,
          letterSpacing: -2.5,
        }}
      />
      <div
        style={{
          ...pill(A.lilacPill, "#fff"),
          position: "absolute",
          right: 250,
          top: 1088,
          fontSize: 44,
          padding: "12px 36px 16px",
          opacity: Math.min(1, stepP * 1.4),
          transform: `scale(${lerp(0.7, 1, stepP)})`,
          transformOrigin: "100% 50%",
        }}
      >
        Gentleman Programming
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- split: what it brings */

const TILES = [
  { title: "SDD", sub: "Buenas prácticas", at: 34.56, x: 90, y: 258, dot: A.orange, icon: <BookOpenCheck size={52} color="#fff" strokeWidth={2.4} /> },
  { title: "Engram", sub: "Memoria", at: 37.25, x: 550, y: 258, medal: "engram-logo-only.png" },
  { title: "Gratis", sub: "Licencia MIT", at: 39.72, x: 90, y: 466, dot: A.sky, icon: <Gift size={52} color="#fff" strokeWidth={2.4} /> },
  { title: "Te enseña", sub: "Mientras construyes", at: 41.49, x: 550, y: 466, dot: A.green, icon: <GraduationCap size={54} color="#fff" strokeWidth={2.4} /> },
];

export const Tiles: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Panel />
    {TILES.map(({ title, sub, at, x, y, dot, icon, medal }) => {
      const p = pop(t, at);
      return (
        <div
          key={title}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 440,
            height: 196,
            background: A.tile,
            border: `2px solid ${A.tileBorder}`,
            borderRadius: 36,
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "0 30px",
            opacity: Math.min(1, p * 1.4),
            transform: `scale(${lerp(0.7, 1, p)})`,
          }}
        >
          {medal ? (
            <Medal src={medal} size={104} fill />
          ) : (
            <div style={{ width: 104, height: 104, borderRadius: "50%", background: dot, flex: "none", display: "grid", placeItems: "center" }}>{icon}</div>
          )}
          <div>
            <div style={{ ...ser, fontWeight: 700, fontSize: 46, color: A.ink, lineHeight: 1.02 }}>{title}</div>
            <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 25, color: A.muted, marginTop: 8 }}>{sub}</div>
          </div>
        </div>
      );
    })}
  </>
);

/* ---------------------------------------------------------------- split: memory → fewer tokens */

const DROP = 49.09; // "caché"

const SessionRow: React.FC<{ t: number; at: number; top: number; dot: string; text: string; note: string }> = ({ t, at, top, dot, text, note }) => (
  <In t={t} at={at} y={24} scale={0.95} style={{ position: "absolute", left: 110, width: 860, top }}>
    <div
      style={{
        height: 96,
        borderRadius: 24,
        background: A.tile,
        border: `2px solid ${A.tileBorder}`,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 28px",
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: dot }} />
      <div style={{ ...ser, fontWeight: 650, fontSize: 40, color: A.ink }}>{text}</div>
      <div style={{ marginLeft: "auto", fontFamily: sans, fontWeight: 500, fontSize: 25, color: A.muted }}>{note}</div>
    </div>
  </In>
);

export const Memory: React.FC<{ t: number }> = ({ t }) => {
  const bar = ease(t, 43.6, 0.9); // "costo": the subscription fills up
  const drop = ease(t, DROP, 1.1);
  const width = lerp(0, 92, bar) - lerp(0, 58, drop);
  const color = drop > 0.5 ? A.green : A.salmon;
  return (
    <>
      <Panel />
      <SessionRow t={t} at={47.32} top={262} dot={A.orange} text="Sesión 1 · guarda lo aprendido" note="Engram" />
      <SessionRow t={t} at={48.35} top={378} dot={A.green} text="Sesión 2 · lo recuerda" note="sin releer todo" />
      <In t={t} at={43.6} y={18} scale={0.98} style={{ position: "absolute", left: 110, width: 860, top: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontWeight: 600, fontSize: 27, color: A.label }}>
          <span>Uso de tu suscripción</span>
          <span style={{ color }}>{Math.round(width)}%</span>
        </div>
        <div style={{ position: "relative", marginTop: 16, height: 36, borderRadius: 999, background: A.tileBorder, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${width}%`, borderRadius: 999, background: color }} />
        </div>
      </In>
    </>
  );
};

/* ---------------------------------------------------------------- split: the repo */

export const Repo: React.FC<{ t: number }> = ({ t }) => {
  const star = pop(t, 54.8); // "genial"
  return (
    <>
      <In t={t} at={53.6} y={40} scale={0.94} style={{ position: "absolute", left: 90, right: 90, top: 300 }}>
        <div style={{ padding: "30px 40px 32px", background: "#fff", borderRadius: 40, boxShadow: "0 30px 80px rgba(60,40,20,.14), 0 0 0 1px rgba(60,40,20,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: sans, fontWeight: 600, fontSize: 33, color: A.label }}>
            <Medal src="rose.png" size={80} ring={3} />
            <span>
              Gentleman-Programming / <b style={{ color: A.ink }}>gentle-ai</b>
            </span>
          </div>
          <div style={{ ...ser, fontWeight: 560, fontSize: 38, lineHeight: 1.16, color: A.ink, margin: "20px 0 22px" }}>
            Configura los agentes que ya usas: Claude Code, Cursor, OpenCode, Codex… con memoria, SDD y skills.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span
              style={{
                padding: "10px 24px 12px",
                borderRadius: 999,
                background: G.dark,
                color: G.pink,
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 28,
                display: "inline-block",
                transform: `scale(${1 + 0.12 * Math.sin(Math.PI * Math.min(1, star))})`,
              }}
            >
              ★ 7.6k
            </span>
            {["MIT", "Open source"].map((c) => (
              <span key={c} style={{ padding: "10px 24px 12px", borderRadius: 999, background: "#F4F0EC", fontFamily: sans, fontWeight: 600, fontSize: 28, color: A.label }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </In>
      <In t={t} at={53.9} y={10} scale={1} style={{ position: "absolute", left: 0, right: 0, top: 252 }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontFamily: sans, fontWeight: 500, fontSize: 25, color: A.muted, letterSpacing: 0.5 }}>
          <Icon path={siGithub.path} color={A.ink} size={26} />
          <b style={{ color: A.ink, fontWeight: 600 }}>FUENTE</b> · github.com/Gentleman-Programming
        </div>
      </In>
    </>
  );
};

/* ---------------------------------------------------------------- split: install */

const CMD = "brew install gentleman-programming/tap/gentle-ai";
const TYPE_AT = 72.38; // "instala"
const TYPE_END = 73.1;

export const Install: React.FC<{ t: number }> = ({ t }) => {
  const chars = Math.round(CMD.length * Math.min(1, Math.max(0, (t - TYPE_AT) / (TYPE_END - TYPE_AT))));
  const second = ease(t, 73.16, 0.4); // "empieza"
  const caret = Math.floor(t * 2.4) % 2 === 0;
  return (
    <In t={t} at={TYPE_AT - 0.2} y={40} scale={0.94} style={{ position: "absolute", left: 70, right: 70, top: 262 }}>
      <div style={{ borderRadius: 30, background: G.dark, overflow: "hidden", boxShadow: "0 30px 80px rgba(26,18,24,.3)" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", background: G.darkBar }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ padding: "32px 36px 40px", fontFamily: "JetBrains Mono, ui-monospace, monospace", fontWeight: 500, fontSize: 28.5, lineHeight: 1.7, color: G.term, whiteSpace: "pre" }}>
          <div style={{ color: G.comment }}># macOS</div>
          <div>
            <span style={{ color: G.pink, fontWeight: 700 }}>$</span> {CMD.slice(0, chars)}
            {chars < CMD.length && caret ? <span style={{ color: G.pink }}>▍</span> : null}
          </div>
          <div style={{ opacity: second }}>
            <span style={{ color: G.pink, fontWeight: 700 }}>$</span> gentle-ai
            {second > 0.5 && caret ? <span style={{ color: G.pink }}> ▍</span> : null}
          </div>
        </div>
      </div>
    </In>
  );
};

