import React from "react";
import { Bot, CalendarDays, Phone, ShoppingCart, UserRound } from "lucide-react";
import { siMeta, siWhatsapp } from "simple-icons";
import { Img, staticFile } from "remotion";
import { Swoosh } from "./Main";
import { ease, easeIn, In, Words } from "./ui";
import { A, LAYOUT, lerp, panelShadow, pop, prog, sans, serif, SERIF_AXES } from "./theme";

/** Every reveal is cued to a word timestamp in captions.json (edited timeline, seconds). */
export const CUES = {
  aparicion: [6.86, 8.6, 11.09, 17.57, 21.6, 29.44, 33.7, 36.59, 45.25, 49.54, 51.93, 58.92, 61.39, 64.49, 69.29, 70.65, 74.02, 77.54, 80.39, 81.61],
  clic: [42.2],
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

/* ---------------------------------------------------------------- full-frame headlines */

const Headline: React.FC<{ t: number; top: number; words: Array<{ w: string; at: number; key?: boolean }>; size?: number }> = ({
  t,
  top,
  words,
  size = 92,
}) => (
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
  <>
    <Headline
      t={t}
      top={290}
      words={[
        { w: "WhatsApp", at: 0.45 },
        { w: "ahora", at: 0.62 },
        { w: "cobra", at: 1.19 },
        { w: "por", at: 1.59, key: true },
        { w: "cada", at: 1.83, key: true },
        { w: "mensaje", at: 2.0, key: true },
      ]}
    />
  </>
);

/** A white serif pill over the footage (Ali's "Business" / "Job" labels). */
const WhitePills: React.FC<{ t: number; items: Array<{ text: string; at: number }>; top?: number }> = ({ t, items, top = 330 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", gap: 28 }}>
    {items.map(({ text, at }) => (
      <In key={text} t={t} at={at} y={28} scale={0.9}>
        <div style={{ ...pill("#fff", A.ink), fontSize: 58, borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,.18)" }}>{text}</div>
      </In>
    ))}
  </div>
);

export const ThreeTips: React.FC<{ t: number }> = ({ t }) => (
  <>
    <WhitePills t={t} items={[{ text: "3 consejos", at: 6.86 }]} />
  </>
);

export const BetterPrompt: React.FC<{ t: number }> = ({ t }) => (
  <>
    <WhitePills t={t} items={[{ text: "Mejorar el prompt", at: 29.44 }]} />
  </>
);

export const Goals: React.FC<{ t: number }> = ({ t }) => (
  <>
    <WhitePills
      t={t}
      items={[
        { text: "Agendar", at: 58.92 },
        { text: "Comprar", at: 59.52 },
      ]}
    />
  </>
);

export const Shortest: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline
      t={t}
      top={310}
      words={[
        { w: "La", at: 61.39 },
        { w: "ruta", at: 61.5 },
        { w: "más", at: 61.82, key: true },
        { w: "corta", at: 62.0, key: true },
      ]}
    />
  </>
);

export const Close: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline
      t={t}
      top={290}
      words={[
        { w: "Tú", at: 84.03 },
        { w: "dime,", at: 84.15 },
        { w: "¿qué", at: 84.39, key: true },
        { w: "opinas?", at: 84.56, key: true },
      ]}
    />
  </>
);

/* ---------------------------------------------------------------- chapter cards */

/** Ali's chapter card: serif title, a lilac line that drops and curls into the "Step" pill. */
const Chapter: React.FC<{ t: number; at: number; lines: string[]; step: string }> = ({ t, at, lines, step }) => {
  const draw = ease(t, at + 0.15, 0.9);
  const stepP = pop(t, at + 0.75);
  let i = 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: A.chapter }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M900 0 L900 990 Q900 1062 830 1062"
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
          ...ser,
          position: "absolute",
          left: 90,
          right: 90,
          top: 760,
          textAlign: "center",
          color: A.ink,
          fontWeight: 600,
          fontSize: 108,
          lineHeight: 1.02,
          letterSpacing: -2,
        }}
      >
        {lines.map((l) => (
          <Words key={l} t={t} keyColor={A.ink} words={l.split(" ").map((w) => ({ w, at: at + 0.1 + 0.12 * i++ }))} />
        ))}
      </div>
      <div
        style={{
          ...pill(A.lilacPill, "#fff"),
          position: "absolute",
          left: 590,
          top: 1030,
          fontSize: 46,
          padding: "12px 36px 16px",
          opacity: Math.min(1, stepP * 1.4),
          transform: `scale(${lerp(0.7, 1, stepP)})`,
          transformOrigin: "100% 50%",
        }}
      >
        {step}
      </div>
    </div>
  );
};

export const Chapter1: React.FC<{ t: number }> = ({ t }) => <Chapter t={t} at={8.3} lines={["Un solo", "mensaje"]} step="Consejo 1" />;
export const Chapter2: React.FC<{ t: number }> = ({ t }) => <Chapter t={t} at={21.3} lines={["Un bot", "específico"]} step="Consejo 2" />;
export const Chapter3: React.FC<{ t: number }> = ({ t }) => <Chapter t={t} at={44.95} lines={["Menos", "conversación"]} step="Consejo 3" />;

/* ---------------------------------------------------------------- bubbles → one message */

const BUBBLES = [
  { text: "Hola 👋", at: 11.09 },
  { text: "Te cuento cómo funciona…", at: 11.31 },
  { text: "¿Te ayudo con algo?", at: 11.6 },
];
const MERGE = 17.57; // "encapsular"

export const Bubbles: React.FC<{ t: number }> = ({ t }) => {
  const gone = easeIn(t, MERGE - 0.35, 0.3); // the three leave completely before the single one arrives
  const one = ease(t, MERGE, 0.6);
  const x1 = pop(t, 18.29); // "solo"
  return (
    <>
      <Panel />
      {BUBBLES.map(({ text, at }, i) => {
        const p = ease(t, at, 0.5);
        const cost = pop(t, 15.35 + i * 0.12); // "conviene": each bubble shows its price
        return (
          <div
            key={text}
            style={{
              position: "absolute",
              left: 130,
              right: 130,
              top: 320 + i * 130,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: p * (1 - gone),
              transform: `translateY(${(1 - p) * 26 - gone * 20}px) scale(${lerp(0.92, 1, p)})`,
              filter: p < 0.999 || gone > 0 ? `blur(${(1 - p) * 10 + gone * 8}px)` : undefined,
            }}
          >
            <div style={{ ...pill(A.salmon, "#fff"), fontSize: 44, fontWeight: 600 }}>{text}</div>
            <div
              style={{
                ...pill(A.orange, "#fff"),
                fontSize: 38,
                fontWeight: 700,
                padding: "8px 26px 12px",
                opacity: Math.min(1, cost * 1.4),
                transform: `scale(${lerp(0.6, 1, cost)})`,
              }}
            >
              $
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 130,
          right: 130,
          top: 390,
          padding: "30px 40px 36px",
          borderRadius: 40,
          background: A.salmon,
          color: "#fff",
          ...ser,
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.25,
          opacity: one,
          transform: `translateY(${(1 - one) * 30}px) scale(${lerp(0.94, 1, one)})`,
          filter: one < 0.999 ? `blur(${(1 - one) * 10}px)` : undefined,
        }}
      >
        Hola 👋 Te cuento cómo funciona y te ayudo en un solo mensaje.
        <span
          style={{
            display: "inline-block",
            marginLeft: 14,
            padding: "4px 20px 8px",
            borderRadius: 999,
            background: "#fff",
            color: A.salmon,
            fontWeight: 700,
            fontSize: 36,
            verticalAlign: 4,
            opacity: x1,
            transform: `scale(${lerp(0.6, 1, x1)})`,
          }}
        >
          × 1
        </span>
      </div>
    </>
  );
};

/* ---------------------------------------------------------------- text slide */

export const SpecificSlide: React.FC<{ t: number }> = ({ t }) => {
  const W: Array<[string, number, boolean?]> = [
    ["Que", 23.72], ["el", 23.98], ["bot", 24.05], ["sea", 24.17], ["muy", 24.36], ["específico", 24.56, true],
    ["con", 25.4], ["lo", 25.46], ["que", 25.56], ["pregunta", 25.72], ["y", 26.14], ["con", 26.21], ["la", 26.35],
    ["respuesta", 26.49], ["que", 26.93], ["espera.", 27.13],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: A.canvas }}>
      <Swoosh />
      <Words
        t={t}
        keyColor={A.orange}
        words={W.map(([w, at, key]) => ({ w, at, key }))}
        style={{
          ...ser,
          position: "absolute",
          left: 80,
          right: 80,
          top: 560,
          textAlign: "center",
          color: A.ink,
          fontWeight: 600,
          fontSize: 92,
          lineHeight: 1.1,
          letterSpacing: -1.8,
        }}
      />
    </div>
  );
};

/* ---------------------------------------------------------------- WhatsApp reply buttons */

const ROWS = [
  { text: "Agendar una cita", Icon: CalendarDays, bg: A.orange, at: 36.59 },
  { text: "Ver precios", Icon: ShoppingCart, bg: A.green, at: 36.8 },
  { text: "Hablar con un asesor", Icon: UserRound, bg: A.sky, at: 37.0 },
];
const TAP = 42.2; // "las" → "opciones"

export const Buttons: React.FC<{ t: number }> = ({ t }) => {
  const msg = ease(t, 33.7, 0.6);
  const ghost = ease(t, 39.23, 0.5) * (1 - easeIn(t, 41.75, 0.3)); // "te envíe un párrafo"
  const reply = ease(t, TAP + 0.5, 0.55);
  const fingerIn = ease(t, TAP - 0.7, 0.6);
  const fingerOut = easeIn(t, TAP + 0.45, 0.35);
  const press = prog(t, TAP, TAP + 0.12) - prog(t, TAP + 0.12, TAP + 0.3);
  const ring = ease(t, TAP + 0.05, 0.3);
  return (
    <>
      <Panel />
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 252,
          width: 760,
          padding: "18px 32px 22px",
          borderRadius: "30px 30px 30px 8px",
          background: A.tile,
          border: `2px solid ${A.tileBorder}`,
          ...ser,
          fontWeight: 600,
          fontSize: 50,
          color: A.ink,
          opacity: msg,
          transform: `translateY(${(1 - msg) * 26}px)`,
          filter: msg < 0.999 ? `blur(${(1 - msg) * 10}px)` : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: sans, fontWeight: 500, fontSize: 26, color: A.muted, marginBottom: 6 }}>
          <Icon path={siWhatsapp.path} color={A.wa} size={30} />
          Tu negocio
        </div>
        ¡Hola! ¿Qué necesitas hoy?
      </div>
      {ROWS.map(({ text, Icon: I, bg, at }, i) => {
        const p = ease(t, at, 0.5);
        const r = i === 0 ? ring : 0;
        return (
          <div
            key={text}
            style={{
              position: "absolute",
              left: 100,
              top: 412 + i * 92,
              width: 880,
              height: 84,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 22px",
              borderRadius: 22,
              background: "#fff",
              border: `2px solid ${r > 0.01 ? A.orange : A.tileBorder}`,
              boxShadow: `0 0 0 ${4 * r}px rgba(241,126,60,.9), 0 ${lerp(6, 14, r)}px ${lerp(16, 30, r)}px rgba(${r > 0.01 ? "241,126,60,.22" : "60,40,20,.06"})`,
              ...ser,
              fontWeight: 700,
              fontSize: 44,
              color: A.ink,
              opacity: p,
              transform: `translateY(${(1 - p) * 22}px) scale(${(i === 0 ? 1 - 0.04 * press + 0.02 * r : 1) * lerp(0.96, 1, p)})`,
              filter: p < 0.999 ? `blur(${(1 - p) * 8}px)` : undefined,
            }}
          >
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: bg, display: "grid", placeItems: "center", flex: "none" }}>
              <I size={30} color="#fff" strokeWidth={2.6} />
            </div>
            {text}
          </div>
        );
      })}
      {/* The user's long paragraph that never needs to be written: typing dots in the reply slot. */}
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 696,
          padding: "18px 30px 22px",
          borderRadius: "28px 28px 8px 28px",
          background: A.chip,
          color: A.chipText,
          ...ser,
          fontWeight: 560,
          fontSize: 38,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: ghost,
          transform: `translateY(${(1 - ghost) * 16}px)`,
        }}
      >
        Hola, quería saber si tienen…
        <span style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              style={{ width: 10, height: 10, borderRadius: 5, background: A.chipText, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 7 - d * 0.9)) }}
            />
          ))}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 696,
          ...pill(A.salmon, "#fff"),
          borderRadius: "28px 28px 8px 28px",
          fontSize: 40,
          padding: "14px 30px 18px",
          opacity: reply,
          transform: `translateY(${(1 - reply) * 20}px) scale(${lerp(0.92, 1, reply)})`,
        }}
      >
        Agendar una cita ✓
      </div>
      {/* Finger tap: a soft translucent dot that glides in and presses the first button. */}
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 422,
          width: 64,
          height: 64,
          borderRadius: 32,
          background: "rgba(28,26,25,.18)",
          border: "3px solid rgba(255,255,255,.9)",
          boxShadow: "0 6px 16px rgba(0,0,0,.18)",
          opacity: fingerIn * (1 - fingerOut),
          transform: `translate(${(1 - fingerIn) * 200}px, ${(1 - fingerIn) * 220}px) scale(${1 - 0.2 * press})`,
        }}
      />
    </>
  );
};

/* ---------------------------------------------------------------- McDonald's meme */

export const McDonalds: React.FC<{ t: number }> = ({ t }) => {
  const pillP = pop(t, 49.54);
  const strike = ease(t, 50.3, 0.45);
  const shot = ease(t, 51.93, 0.7);
  const scroll = ease(t, 52.6, 1.6);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            ...pill(A.salmon, "#fff"),
            fontSize: 60,
            padding: "18px 40px 22px",
            opacity: Math.min(1, pillP * 1.4),
            transform: `scale(${lerp(0.8, 1, pillP)})`,
          }}
        >
          <span style={{ position: "relative" }}>
            ChatGPT en WhatsApp
            <span
              style={{
                position: "absolute",
                left: -6,
                right: -6,
                top: "54%",
                height: 5,
                borderRadius: 3,
                background: "#fff",
                transform: `scaleX(${strike})`,
                transformOrigin: "left",
              }}
            />
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 400,
          width: 780,
          height: 940,
          borderRadius: 36,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(60,40,20,.16), 0 0 0 1px rgba(60,40,20,.05)",
          opacity: shot,
          transform: `translateY(${(1 - shot) * 80}px) scale(${lerp(0.94, 1, shot)})`,
          filter: shot < 0.999 ? `blur(${(1 - shot) * 8}px)` : undefined,
        }}
      >
        <Img src={staticFile("mcd.jpg")} style={{ width: "100%", display: "block", transform: `translateY(${-200 * scroll}px)` }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1366,
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 26,
          color: A.muted,
          letterSpacing: 0.5,
          opacity: shot,
        }}
      >
        FUENTE · <b style={{ color: A.ink, fontWeight: 600 }}>@Graphseo</b> en X · abril 2026
      </div>
    </>
  );
};

/* ---------------------------------------------------------------- flow row under the wide camera */

const NODES = [
  { label: "Explica poco", text: "Bot", icon: <Icon path={siWhatsapp.path} color={A.wa} size={34} />, at: 64.49, x: 40 },
  { label: "Si quiere más", text: "Humano", icon: <UserRound size={32} color={A.orange} strokeWidth={2.4} />, at: 69.29, x: 400 },
  { label: "Cierra", text: "Llamada", icon: <Phone size={30} color={A.green} strokeWidth={2.4} />, at: 70.65, x: 760 },
];

export const Flow: React.FC<{ t: number }> = ({ t }) => (
  <>
    {NODES.map(({ label, text, icon, at, x }, i) => (
      <React.Fragment key={text}>
        {i > 0 && (
          <div
            style={{
              position: "absolute",
              left: x - 80,
              top: 1372,
              width: 70,
              borderTop: "5px dotted #A9A29B",
              opacity: ease(t, at - 0.25, 0.4),
            }}
          />
        )}
        <In t={t} at={at} y={24} style={{ position: "absolute", left: x, top: 1290, width: 280, textAlign: "center" }}>
          <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 28, color: A.label, marginBottom: 16 }}>{label}</div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 28px",
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 6px 20px rgba(60,40,20,.10), 0 0 0 1px rgba(60,40,20,.05)",
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 32,
              color: A.ink,
            }}
          >
            {icon}
            {text}
          </span>
        </In>
      </React.Fragment>
    ))}
  </>
);

/* ---------------------------------------------------------------- Meta AI vs your agent */

export const Compare: React.FC<{ t: number }> = ({ t }) => {
  const win = ease(t, 80.39, 0.5);
  const dim = ease(t, 82.59, 0.6);
  const chip = pop(t, 83.04);
  const card = (left: number, at: number): React.CSSProperties => {
    const p = ease(t, at, 0.6);
    return {
      position: "absolute",
      left,
      top: 262,
      width: 410,
      height: 490,
      borderRadius: 36,
      background: A.tile,
      border: `2px solid ${A.tileBorder}`,
      textAlign: "center",
      opacity: p,
      transform: `translateY(${(1 - p) * 30}px) scale(${lerp(0.94, 1, p)})`,
      filter: p < 0.999 ? `blur(${(1 - p) * 10}px)` : undefined,
    };
  };
  const dot = (bg: string): React.CSSProperties => ({
    width: 130,
    height: 130,
    borderRadius: "50%",
    margin: "56px auto 22px",
    display: "grid",
    placeItems: "center",
    background: bg,
  });
  const tag = (at: number): React.CSSProperties => {
    const p = pop(t, at);
    return {
      ...pill(A.orange, "#fff"),
      fontSize: 34,
      fontWeight: 700,
      padding: "8px 24px 12px",
      margin: "10px 6px 0",
      boxShadow: "0 6px 14px rgba(241,126,60,.3)",
      opacity: Math.min(1, p * 1.4),
      transform: `translateY(${(1 - p) * 12}px) scale(${lerp(0.8, 1, p)})`,
    };
  };
  return (
    <>
      <Panel />
      <div style={{ ...card(110, 74.02), filter: `grayscale(${dim}) opacity(${1 - 0.45 * dim})` }}>
        <div style={{ ...dot("#fff"), boxShadow: `0 0 0 2px ${A.tileBorder}` }}>
          <Icon path={siMeta.path} color={A.meta} size={78} />
        </div>
        <div style={{ ...ser, fontWeight: 700, fontSize: 46, color: A.ink }}>Meta AI</div>
        <div
          style={{
            display: "inline-block",
            marginTop: 18,
            padding: "8px 22px 10px",
            borderRadius: 999,
            background: A.chip,
            color: A.chipText,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 26,
            opacity: chip,
            transform: `scale(${lerp(0.7, 1, chip)})`,
          }}
        >
          En desarrollo
        </div>
      </div>
      <div
        style={{
          ...card(560, 77.54),
          background: win > 0.01 ? "#fff" : A.tile,
          border: `2px solid ${win > 0.01 ? A.orange : A.tileBorder}`,
          boxShadow: `0 0 0 ${4 * win}px rgba(241,126,60,.9), 0 20px 44px rgba(241,126,60,${0.18 * win})`,
        }}
      >
        <div style={dot(A.orange)}>
          <Bot size={70} color="#fff" strokeWidth={2.2} />
        </div>
        <div style={{ ...ser, fontWeight: 700, fontSize: 46, color: A.ink }}>Tu agente</div>
        <div>
          <span style={tag(80.39)}>más barato</span>
        </div>
        <div>
          <span style={tag(81.61)}>más efectivo</span>
        </div>
      </div>
    </>
  );
};
