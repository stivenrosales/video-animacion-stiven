import React from "react";
import { BookOpen, CalendarDays, FolderOpen, MapPin, Rocket, Store, Ticket, Wrench } from "lucide-react";
import { siClaude, siGoogleforms } from "simple-icons";
import { Img, staticFile } from "remotion";
import { ease, In, Words } from "./ui";
import { A, B, LAYOUT, lerp, panelShadow, pop, sans, serif, SERIF_AXES } from "./theme";

/** Every reveal is cued to a word timestamp in captions.json (edited timeline, seconds). */
export const CUES = {
  aparicion: [0.1, 2.7, 4.36, 5.19, 8.84, 10.44, 12.08, 16.35, 19.56, 21.42],
  clic: [] as number[],
};

const ser: React.CSSProperties = { fontFamily: serif, fontVariationSettings: SERIF_AXES };

type W = Array<{ w: string; at: number; key?: boolean }>;

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

const Brand: React.FC<{ path: string; color: string; size: number }> = ({ path, color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d={path} />
  </svg>
);

/** Ali's icon circle: a flat color disc with a white glyph. */
const Dot: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({ color, size = 96, children }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color, flex: "none", display: "grid", placeItems: "center" }}>{children}</div>
);

const Label: React.FC<{ t: number; at: number; top: number; children: React.ReactNode }> = ({ t, at, top, children }) => (
  <In t={t} at={at} y={16} scale={0.98} style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
    <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, color: A.muted, letterSpacing: 0.2 }}>{children}</div>
  </In>
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

/** A white serif pill over the footage (Ali's "Business" / "Job" labels). */
const WhitePill: React.FC<{ t: number; at: number; top: number; size?: number; children: React.ReactNode }> = ({ t, at, top, size = 54, children }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
    <In t={t} at={at} y={28} scale={0.9}>
      <div
        style={{
          ...pill("#fff", A.ink),
          fontSize: size,
          borderRadius: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,.18)",
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        {children}
      </div>
    </In>
  </div>
);

/** "Huancayo, si quieres aprender Inteligencia Artificial". */
export const Hook: React.FC<{ t: number }> = ({ t }) => (
  <>
    <WhitePill t={t} at={0.1} top={262} size={46}>
      <MapPin size={46} color={A.salmon} strokeWidth={2.6} />
      Huancayo
    </WhitePill>
    <Headline
      t={t}
      top={372}
      size={84}
      words={[
        { w: "Aprende", at: 0.95 },
        { w: "IA", at: 1.35, key: true },
      ]}
    />
  </>
);

/** "¿Ya dominas?" → come and share what you are building. */
export const Share: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline
      t={t}
      top={262}
      size={84}
      words={[
        { w: "¿Ya", at: 17.15 },
        { w: "dominas?", at: 17.37, key: true },
      ]}
    />
    <WhitePill t={t} at={19.56} top={370} size={44}>
      <FolderOpen size={44} color={A.salmon} strokeWidth={2.6} />
      Comparte tus proyectos
    </WhitePill>
  </>
);

/* ---------------------------------------------------------------- split scenes (panel y 230–690) */

/** One row of a growing list: icon circle + serif text on a tile. */
const Row: React.FC<{ t: number; at: number; top: number; dot: string; icon: React.ReactNode; h?: number; size?: number; left?: number; width?: number; children: React.ReactNode }> = ({
  t,
  at,
  top,
  dot,
  icon,
  h = 96,
  size = 40,
  left = 110,
  width = 860,
  children,
}) => (
  <In t={t} at={at} y={24} scale={0.95} style={{ position: "absolute", left, width, top }}>
    <div
      style={{
        height: h,
        borderRadius: 24,
        background: A.tile,
        border: `2px solid ${A.tileBorder}`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 22px",
      }}
    >
      <Dot color={dot} size={h - 30}>
        {icon}
      </Dot>
      <div style={{ ...ser, fontWeight: 650, fontSize: size, color: A.ink, whiteSpace: "nowrap" }}>{children}</div>
    </div>
  </In>
);

/** "Este sábado tenemos un evento totalmente gratis para aplicar IA en negocios". */
export const Event: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Panel />
    <Label t={t} at={2.6} top={262}>
      Taller presencial
    </Label>
    <Row t={t} at={2.7} top={318} dot={A.green} icon={<CalendarDays size={34} color="#fff" strokeWidth={2.6} />}>
      Sábado 17 de octubre
    </Row>
    <Row t={t} at={4.36} top={428} dot={A.orange} icon={<Ticket size={34} color="#fff" strokeWidth={2.6} />}>
      Totalmente gratis
    </Row>
    <Row t={t} at={5.19} top={538} dot={A.sky} icon={<Store size={34} color="#fff" strokeWidth={2.6} />}>
      IA aplicada a negocios
    </Row>
  </>
);

/** Basics → practice → everything AI can do, mainly with Claude: a staircase that rises step by step. */
export const Levels: React.FC<{ t: number }> = ({ t }) => {
  const BOTTOM = 650;
  const steps = [
    { label: "Lo básico", at: 8.84, h: 150, dot: A.sky, icon: <BookOpen size={34} color="#fff" strokeWidth={2.6} /> },
    { label: "Práctico", at: 10.44, h: 230, dot: A.orange, icon: <Wrench size={34} color="#fff" strokeWidth={2.6} /> },
    { label: "Todo el potencial", at: 12.08, h: 310, dot: A.green, icon: <Rocket size={34} color="#fff" strokeWidth={2.6} /> },
  ];
  const claude = pop(t, 16.35);
  return (
    <>
      <Panel />
      {steps.map(({ label, at, h, dot, icon }, i) => {
        const p = pop(t, at, { damping: 18, stiffness: 150 });
        const x = 135 + i * 280;
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: x,
              top: BOTTOM - h,
              width: 250,
              height: h,
              background: A.tile,
              border: `2px solid ${A.tileBorder}`,
              borderRadius: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: 22,
              gap: 12,
              opacity: Math.min(1, p * 1.6),
              transform: `scaleY(${lerp(0.4, 1, p)})`,
              transformOrigin: "50% 100%",
            }}
          >
            <Dot color={dot} size={66}>
              {icon}
            </Dot>
            <div style={{ ...ser, fontWeight: 650, fontSize: 34, color: A.ink, textAlign: "center", lineHeight: 1.05, padding: "0 14px", opacity: ease(t, at + 0.12, 0.4) }}>
              {label}
            </div>
          </div>
        );
      })}
      {/* "principalmente usando Claude": the Claude chip lands above the top step (spark only next to Claude). */}
      <div
        style={{
          position: "absolute",
          left: 695,
          width: 250,
          top: 262,
          display: "flex",
          justifyContent: "center",
          opacity: Math.min(1, claude * 1.4),
          transform: `translateY(${(1 - claude) * 18}px) scale(${lerp(0.75, 1, claude)})`,
        }}
      >
        <div style={{ ...pill("#F5F4ED", A.ink), fontSize: 38, padding: "8px 26px 12px", display: "flex", alignItems: "center", gap: 12, border: `2px solid ${A.tileBorder}` }}>
          <Brand path={siClaude.path} color={B.claude} size={36} />
          Claude
        </div>
      </div>
    </>
  );
};

/* ---------------------------------------------------------------- camera off: end card */

/** "Ahí nos vemos": the real flyer, the facts, and the sign-up link he forgot to say (held after the voice ends). */
export const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const cta = pop(t, 22.5);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <In t={t} at={21.42} y={40} scale={0.94} style={{ position: "absolute", left: 310, top: 262, width: 460 }}>
        <div style={{ background: A.panel, borderRadius: 30, padding: 12, boxShadow: panelShadow }}>
          <Img src={staticFile("flyer.png")} style={{ width: 436, display: "block", borderRadius: 20 }} />
        </div>
      </In>
      <Row t={t} at={21.8} top={900} left={150} width={780} dot={A.green} icon={<CalendarDays size={34} color="#fff" strokeWidth={2.6} />}>
        Sáb 17 de octubre · 6:30 PM
      </Row>
      <Row t={t} at={22.05} top={1010} left={150} width={780} size={36} dot={A.salmon} icon={<MapPin size={34} color="#fff" strokeWidth={2.6} />}>
        La Base Cowork · Jr. Tacna 234
      </Row>
      <Row t={t} at={22.3} top={1120} left={150} width={780} size={36} dot={B.forms} icon={<Brand path={siGoogleforms.path} color="#fff" size={34} />}>
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 34, letterSpacing: 0.2 }}>forms.gle/PSs4eNt8VtP7oJoa8</span>
      </Row>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1250, display: "flex", justifyContent: "center" }}>
        <div style={{ ...pill(A.salmon, "#fff"), fontSize: 42, padding: "12px 36px 16px", opacity: Math.min(1, cta * 1.4), transform: `scale(${lerp(0.7, 1, cta)})` }}>
          Inscríbete gratis · link en la descripción
        </div>
      </div>
    </div>
  );
};
