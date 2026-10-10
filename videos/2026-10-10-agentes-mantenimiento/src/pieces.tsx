import React from "react";
import {
  Bell,
  Bot,
  CalendarCheck,
  CalendarDays,
  Check,
  ClipboardList,
  Database,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Network,
  Package,
  RefreshCw,
  Repeat,
  Sparkles,
  Store,
  TriangleAlert,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { siAirtable, siCalendly, siWhatsapp } from "simple-icons";
import { Img, staticFile } from "remotion";
import { Band } from "./Main";
import { ease, In, Words } from "./ui";
import { A, B, LAYOUT, lerp, panelShadow, pop, sans, serif, SERIF_AXES } from "./theme";

/** Every reveal is cued to a word timestamp in captions.json (edited timeline, seconds). */
export const CUES = {
  aparicion: [0.9, 4.22, 6.66, 8.85, 11.39, 16.6, 17.76, 24.18, 27.11, 29.6, 40.88, 42.63, 46.64, 49.91, 56.54, 60.72, 64.06, 66.55, 74.11, 75.83, 83.06, 88.0, 97.03, 103.06, 106.64, 108.53, 120.42, 124.91, 126.56],
  clic: [73.05, 93.66, 108.53],
};

const STRIKE_SET = 73.05; // "ya está"
const STRIKE_EXCEL = 93.66; // "no es tan eficiente"
const OWN = 108.53; // "algo propio"

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
    <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, color: A.muted, letterSpacing: 0.2, display: "flex", alignItems: "center", gap: 12 }}>
      {children}
    </div>
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

/** A word that gets an ink strike and fades back, like his "plugins → arneses" slide. */
const Strike: React.FC<{ p: number; color?: string; children: React.ReactNode }> = ({ p, color = A.ink, children }) => (
  <span style={{ position: "relative", opacity: lerp(1, 0.4, p) }}>
    {children}
    <span
      style={{
        position: "absolute",
        left: -8,
        right: -8,
        top: "54%",
        height: 6,
        borderRadius: 3,
        background: color,
        transform: `scaleX(${p})`,
        transformOrigin: "left",
      }}
    />
  </span>
);

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

export const Hook: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline
      t={t}
      top={290}
      words={[
        { w: "Audité", at: 0.46 },
        { w: "una", at: 0.74 },
        { w: "empresa", at: 0.9, key: true },
      ]}
    />
    <WhitePill t={t} at={4.22} top={430}>
      <Img src={staticFile("logos/respond.svg")} style={{ height: 50, margin: "6px 4px 2px" }} />
    </WhitePill>
  </>
);

export const Limits: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline
      t={t}
      top={290}
      words={[
        { w: "Varias", at: 11.0 },
        { w: "limitaciones", at: 11.39, key: true },
      ]}
    />
    <WhitePill t={t} at={13.63} top={430} size={48}>
      Se repite en muchas empresas
    </WhitePill>
  </>
);

export const Evolve: React.FC<{ t: number }> = ({ t }) => {
  const versions = [
    { v: "v1", at: 49.91 },
    { v: "v2", at: 50.66 },
    { v: "v3", at: 51.44 },
  ];
  return (
    <>
      <Headline
        t={t}
        top={280}
        size={84}
        words={[
          { w: "El", at: 48.98 },
          { w: "agente", at: 49.14 },
          { w: "empieza", at: 49.47 },
          { w: "a", at: 49.86 },
          { w: "evolucionar", at: 49.91, key: true },
        ]}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 488, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        {versions.map(({ v, at }, i) => (
          <React.Fragment key={v}>
            {i > 0 && (
              <In t={t} at={at - 0.1} y={0} x={-14} scale={1}>
                <div style={{ ...ser, color: "#fff", fontSize: 48, fontWeight: 600, textShadow: "0 2px 10px rgba(0,0,0,.3)" }}>→</div>
              </In>
            )}
            <In t={t} at={at} y={22} scale={0.85}>
              <div
                style={{
                  ...pill(i === versions.length - 1 ? A.salmon : "#fff", i === versions.length - 1 ? "#fff" : A.ink),
                  fontSize: 46,
                  padding: "10px 32px 14px",
                  boxShadow: "0 10px 26px rgba(0,0,0,.18)",
                }}
              >
                {v}
              </div>
            </In>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export const SetOnce: React.FC<{ t: number }> = ({ t }) => {
  const s = ease(t, STRIKE_SET, 0.5);
  return (
    <>
      <WhitePill t={t} at={68.54} top={290} size={50}>
        <Brand path={siWhatsapp.path} color={B.whatsapp} size={50} />
        Implementar WhatsApp
      </WhitePill>
      <WhitePill t={t} at={71.99} top={430} size={50}>
        <Strike p={s} color={A.salmon}>
          Setearlo una vez y listo
        </Strike>
      </WhitePill>
    </>
  );
};

export const Cta: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline
      t={t}
      top={280}
      size={84}
      words={[
        { w: "¿Has", at: 124.41 },
        { w: "implementado", at: 124.49 },
        { w: "agentes", at: 124.91, key: true },
        { w: "de", at: 125.15 },
        { w: "IA?", at: 125.22, key: true },
      ]}
    />
    <WhitePill t={t} at={126.56} top={490} size={50}>
      <MessageCircle size={46} color={A.salmon} strokeWidth={2.6} />
      Coméntame
    </WhitePill>
  </>
);

/* ---------------------------------------------------------------- split scenes (panel y 230–690) */

/** What respond.io is: the real wordmark, then the two things it does. */
export const RespondCard: React.FC<{ t: number }> = ({ t }) => {
  const tiles = [
    { title: <>Chatbots<br />de IA</>, at: 6.66, x: 90, dot: B.respond, icon: <Bot size={50} color="#fff" strokeWidth={2.4} /> },
    { title: <>Gestión de<br />WhatsApp</>, at: 8.85, x: 550, dot: B.whatsapp, icon: <Brand path={siWhatsapp.path} color="#fff" size={50} /> },
  ];
  return (
    <>
      <Panel />
      <In t={t} at={5.0} y={20} style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center" }}>
        <Img src={staticFile("logos/respond.svg")} style={{ height: 74 }} />
      </In>
      {tiles.map(({ title, at, x, dot, icon }) => {
        const p = pop(t, at);
        return (
          <div
            key={at}
            style={{
              position: "absolute",
              left: x,
              top: 440,
              width: 440,
              height: 190,
              background: A.tile,
              border: `2px solid ${A.tileBorder}`,
              borderRadius: 36,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "0 28px",
              opacity: Math.min(1, p * 1.4),
              transform: `scale(${lerp(0.7, 1, p)})`,
            }}
          >
            <Dot color={dot}>{icon}</Dot>
            <div style={{ ...ser, fontWeight: 700, fontSize: 42, color: A.ink, lineHeight: 1.05 }}>{title}</div>
          </div>
        );
      })}
    </>
  );
};

/** Ali's chat pills: the client in sky, the bot in salmon, white serif text. */
const ChatPill: React.FC<{ t: number; at: number; top: number; side: "left" | "right"; color: string; children: React.ReactNode }> = ({ t, at, top, side, color, children }) => (
  <In t={t} at={at} y={26} x={side === "left" ? -30 : 30} scale={0.92} style={{ position: "absolute", top, [side]: 110 }}>
    <div style={{ ...pill(color, "#fff"), fontSize: 46, padding: "18px 38px 22px", display: "flex", alignItems: "center", gap: 14 }}>{children}</div>
  </In>
);

export const Chat: React.FC<{ t: number }> = ({ t }) => {
  const wow = pop(t, 19.6);
  return (
    <>
      <Panel />
      <Label t={t} at={15.4} top={262}>
        <Brand path={siWhatsapp.path} color={B.whatsapp} size={34} />
        Agente de WhatsApp
      </Label>
      <ChatPill t={t} at={16.6} top={340} side="left" color={A.sky}>
        Hola, quiero una cita
      </ChatPill>
      <ChatPill t={t} at={17.76} top={460} side="right" color={A.salmon}>
        ¡Listo, te agendé! <Check size={40} color="#fff" strokeWidth={3} />
      </ChatPill>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 578,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: Math.min(1, wow * 1.4),
          transform: `scale(${lerp(0.7, 1, wow)})`,
          transformOrigin: "0% 50%",
        }}
      >
        <Sparkles size={40} color={A.orange} strokeWidth={2.4} />
        <div style={{ ...ser, fontStyle: "italic", fontWeight: 600, fontSize: 44, color: A.orange }}>“¡Wow!”</div>
      </div>
    </>
  );
};

/** The current sales flow; the chatbot takes the seller's place and repeats the same pattern. */
export const Flow: React.FC<{ t: number }> = ({ t }) => {
  const swap = ease(t, 27.11, 0.6); // "chatbot"
  const nodes = [
    { label: "Cliente", at: 24.18, icon: <UserRound size={48} color="#fff" strokeWidth={2.4} />, dot: A.sky },
    { label: "Vendedor", at: 24.48, icon: <Store size={46} color="#fff" strokeWidth={2.4} />, dot: A.green, swap: true },
    { label: "Venta", at: 25.07, icon: <CalendarCheck size={46} color="#fff" strokeWidth={2.4} />, dot: A.orange },
  ];
  const bad = pop(t, 26.22);
  const repeat = pop(t, 29.6);
  return (
    <>
      <Panel />
      <Label t={t} at={23.64} top={262}>
        Flujo actual de ventas
      </Label>
      {nodes.map(({ label, at, icon, dot, swap: sw }, i) => {
        const p = pop(t, at);
        const x = 130 + i * 300;
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: x - 114,
                  top: 384,
                  width: 148,
                  borderTop: `5px dotted ${A.tileBorder}`,
                  opacity: ease(t, at - 0.05, 0.4),
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                left: x - 10,
                top: 320,
                width: 240,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                opacity: Math.min(1, p * 1.4),
                transform: `scale(${lerp(0.7, 1, p)})`,
              }}
            >
              <div style={{ position: "relative", width: 132, height: 132 }}>
                <div style={{ position: "absolute", inset: 0, opacity: sw ? 1 - swap : 1 }}>
                  <Dot color={dot} size={132}>
                    {icon}
                  </Dot>
                </div>
                {sw && (
                  <div style={{ position: "absolute", inset: 0, opacity: swap, transform: `scale(${lerp(0.7, 1, swap)})` }}>
                    <Dot color={B.respond} size={132}>
                      <Bot size={56} color="#fff" strokeWidth={2.4} />
                    </Dot>
                  </div>
                )}
              </div>
              <div style={{ ...ser, fontWeight: 650, fontSize: 40, color: A.ink, height: 50, position: "relative", width: 240, textAlign: "center" }}>
                <span style={{ position: "absolute", left: 0, right: 0, opacity: sw ? 1 - swap : 1 }}>{label}</span>
                {sw && <span style={{ position: "absolute", left: 0, right: 0, opacity: swap }}>Chatbot</span>}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 568, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", height: 84, width: 700 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              opacity: Math.min(1, bad * 1.4) * (1 - repeat),
              transform: `scale(${lerp(0.7, 1, bad)})`,
            }}
          >
            <div style={{ ...pill(A.salmon, "#fff"), fontSize: 40, padding: "12px 32px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <X size={36} color="#fff" strokeWidth={3} /> No tan adecuado
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              opacity: Math.min(1, repeat * 1.4),
              transform: `scale(${lerp(0.7, 1, repeat)})`,
            }}
          >
            <div style={{ ...pill(A.orange, "#fff"), fontSize: 40, padding: "12px 32px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <Repeat size={36} color="#fff" strokeWidth={2.8} /> Repite el mismo patrón
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/** One row of a growing list: icon circle + serif text on a tile. */
const Row: React.FC<{ t: number; at: number; top: number; dot: string; icon: React.ReactNode; h?: number; size?: number; children: React.ReactNode }> = ({
  t,
  at,
  top,
  dot,
  icon,
  h = 96,
  size = 40,
  children,
}) => (
  <In t={t} at={at} y={24} scale={0.95} style={{ position: "absolute", left: 110, width: 860, top }}>
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
      <div style={{ ...ser, fontWeight: 650, fontSize: size, color: A.ink }}>{children}</div>
    </div>
  </In>
);

export const Checklist: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Panel />
    <Label t={t} at={38.2} top={262}>
      El agente debería…
    </Label>
    <Row t={t} at={40.88} top={318} dot={A.green} icon={<Check size={36} color="#fff" strokeWidth={3} />}>
      Agendar
    </Row>
    <Row t={t} at={42.63} top={428} dot={A.orange} icon={<Bell size={34} color="#fff" strokeWidth={2.6} />}>
      Enviar recordatorios
    </Row>
    <Row t={t} at={46.64} top={538} dot={A.sky} icon={<ClipboardList size={34} color="#fff" strokeWidth={2.6} />}>
      Pedir más datos
    </Row>
  </>
);

/** A seller is a black box; the chatbot shows everything. */
export const Compare: React.FC<{ t: number }> = ({ t }) => {
  const cards = [
    { title: "Vendedor", sub: "Poco control", at: 55.06, subAt: 56.54, x: 90, dot: A.muted, icon: <EyeOff size={50} color="#fff" strokeWidth={2.4} />, subColor: A.muted },
    { title: "Chatbot", sub: "Transparencia total", at: 60.42, subAt: 60.72, x: 550, dot: B.respond, icon: <Eye size={50} color="#fff" strokeWidth={2.4} />, subColor: A.orange },
  ];
  return (
    <>
      <Panel />
      {cards.map(({ title, sub, at, subAt, x, dot, icon, subColor }) => {
        const p = pop(t, at);
        return (
          <div
            key={title}
            style={{
              position: "absolute",
              left: x,
              top: 280,
              width: 440,
              height: 360,
              background: A.tile,
              border: `2px solid ${A.tileBorder}`,
              borderRadius: 36,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              opacity: Math.min(1, p * 1.4),
              transform: `scale(${lerp(0.7, 1, p)})`,
            }}
          >
            <Dot color={dot} size={112}>
              {icon}
            </Dot>
            <div style={{ ...ser, fontWeight: 700, fontSize: 50, color: A.ink }}>{title}</div>
            <In t={t} at={subAt} y={14}>
              <div style={{ ...ser, fontWeight: 650, fontSize: 36, color: subColor }}>{sub}</div>
            </In>
          </div>
        );
      })}
    </>
  );
};

export const Steps: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Panel />
    <Label t={t} at={63.18} top={256}>
      Paso a paso
    </Label>
    <Row t={t} at={64.06} top={306} h={80} size={36} dot={A.green} icon={<Check size={30} color="#fff" strokeWidth={3} />}>
      Qué ha hecho
    </Row>
    <Row t={t} at={64.47} top={398} h={80} size={36} dot={A.green} icon={<Check size={30} color="#fff" strokeWidth={3} />}>
      Qué ha preguntado
    </Row>
    <Row t={t} at={65.35} top={490} h={80} size={36} dot={A.salmon} icon={<X size={30} color="#fff" strokeWidth={3} />}>
      Qué no ha preguntado
    </Row>
    <Row t={t} at={66.17} top={582} h={80} size={36} dot={A.orange} icon={<TriangleAlert size={28} color="#fff" strokeWidth={2.6} />}>
      Dónde se equivocó
    </Row>
  </>
);

export const Ongoing: React.FC<{ t: number }> = ({ t }) => {
  const tiles = [
    { title: "Mejoras", sub: "cosas que mejoran", at: 83.06, dot: A.orange, icon: <Wrench size={46} color="#fff" strokeWidth={2.4} /> },
    { title: "Productos", sub: "que cambian", at: 85.35, dot: A.sky, icon: <Package size={46} color="#fff" strokeWidth={2.4} /> },
    { title: "Sistemas", sub: "que crecen", at: 87.78, dot: A.green, icon: <Network size={46} color="#fff" strokeWidth={2.4} /> },
  ];
  return (
    <>
      <Panel />
      <Label t={t} at={80.12} top={262}>
        <RefreshCw size={30} color={A.muted} strokeWidth={2.6} />
        Mantenimiento continuo
      </Label>
      {tiles.map(({ title, sub, at, dot, icon }, i) => {
        const p = pop(t, at);
        return (
          <div
            key={title}
            style={{
              position: "absolute",
              left: 90 + i * 307,
              top: 330,
              width: 287,
              height: 300,
              background: A.tile,
              border: `2px solid ${A.tileBorder}`,
              borderRadius: 32,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              opacity: Math.min(1, p * 1.4),
              transform: `scale(${lerp(0.7, 1, p)})`,
            }}
          >
            <Dot color={dot} size={100}>
              {icon}
            </Dot>
            <div style={{ ...ser, fontWeight: 700, fontSize: 42, color: A.ink }}>{title}</div>
            <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 26, color: A.muted }}>{sub}</div>
          </div>
        );
      })}
    </>
  );
};

/** Where the bot records things: Excel falls short, then a database, Airtable, SQL. */
export const Storage: React.FC<{ t: number }> = ({ t }) => {
  const struck = ease(t, STRIKE_EXCEL, 0.5);
  const chips = [
    { label: "Excel", at: 92.5, x: 110, y: 360, icon: <FileSpreadsheet size={40} color="#fff" strokeWidth={2.4} />, dot: "#1D6F42", strike: true },
    { label: "Base de datos", at: 95.73, x: 550, y: 360, icon: <Database size={38} color="#fff" strokeWidth={2.4} />, dot: A.orange },
    { label: "Airtable", at: 97.03, x: 110, y: 500, icon: <Brand path={siAirtable.path} color="#fff" size={40} />, dot: `#${siAirtable.hex}` },
    { label: "SQL", at: 99.62, x: 550, y: 500, icon: <Database size={38} color="#fff" strokeWidth={2.4} />, dot: A.sky },
  ];
  return (
    <>
      <Panel />
      <Label t={t} at={89.32} top={262}>
        No es solo la conversación: ¿dónde registro?
      </Label>
      {chips.map(({ label, at, x, y, icon, dot, strike }) => {
        const p = pop(t, at);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 420,
              height: 116,
              background: A.tile,
              border: `2px solid ${A.tileBorder}`,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 22px",
              opacity: Math.min(1, p * 1.4),
              transform: `scale(${lerp(0.7, 1, p)})`,
            }}
          >
            <div style={{ opacity: strike ? lerp(1, 0.4, struck) : 1 }}>
              <Dot color={dot} size={80}>
                {icon}
              </Dot>
            </div>
            <div style={{ ...ser, fontWeight: 650, fontSize: 42, color: A.ink }}>{strike ? <Strike p={struck} color={A.salmon}>{label}</Strike> : label}</div>
          </div>
        );
      })}
    </>
  );
};

/** "Quiero un sistema de agendas mucho más complejo": one calendar branches into several. */
export const Agendas: React.FC<{ t: number }> = ({ t }) => {
  const main = pop(t, 101.96); // "quiero un sistema"
  const subs = [
    { at: 103.06, x: 240, color: A.sky },
    { at: 103.55, x: 540, color: A.green },
    { at: 103.85, x: 840, color: A.orange },
  ];
  return (
    <>
      <Panel />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {subs.map(({ at, x }) => (
          <path
            key={x}
            d={`M540 390 C 540 450, ${x} 440, ${x} 512`}
            pathLength={1}
            fill="none"
            stroke={A.tileBorder}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={1}
            strokeDashoffset={1 - ease(t, at - 0.15, 0.5)}
          />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 470, top: 262, opacity: Math.min(1, main * 1.4), transform: `scale(${lerp(0.7, 1, main)})` }}>
        <Dot color={A.orange} size={140}>
          <CalendarCheck size={66} color="#fff" strokeWidth={2.2} />
        </Dot>
      </div>
      {subs.map(({ at, x, color }) => {
        const p = pop(t, at);
        return (
          <div key={x} style={{ position: "absolute", left: x - 50, top: 512, opacity: Math.min(1, p * 1.4), transform: `scale(${lerp(0.7, 1, p)})` }}>
            <Dot color={color} size={100}>
              <CalendarDays size={48} color="#fff" strokeWidth={2.4} />
            </Dot>
          </div>
        );
      })}
      <In t={t} at={102.45} y={14} style={{ position: "absolute", left: 640, top: 300, width: 380 }}>
        <div style={{ ...ser, fontWeight: 700, fontSize: 44, color: A.ink, lineHeight: 1.05 }}>Sistema de agendas</div>
      </In>
    </>
  );
};

/** Off-the-shelf scheduling (Cal.com, Calendly) gives way to something of his own. */
export const OwnTools: React.FC<{ t: number }> = ({ t }) => {
  const own = pop(t, OWN);
  const struck = ease(t, OWN, 0.5);
  const tools = [
    { label: "Cal.com", at: 106.64, x: 110 },
    { label: "Calendly", at: 107.24, x: 550, path: siCalendly.path, color: `#${siCalendly.hex}` },
  ];
  const attach = [
    { label: "Imágenes", at: 111.69, icon: <ImageIcon size={34} color={A.ink} strokeWidth={2.4} /> },
    { label: "PDFs", at: 112.31, icon: <FileText size={34} color={A.ink} strokeWidth={2.4} /> },
  ];
  return (
    <>
      <Panel />
      {tools.map(({ label, at, x, path, color }: { label: string; at: number; x: number; path?: string; color?: string }) => {
        const p = pop(t, at);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: x,
              top: 268,
              width: 420,
              height: 116,
              background: A.tile,
              border: `2px solid ${A.tileBorder}`,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              opacity: Math.min(1, p * 1.4) * lerp(1, 0.55, struck),
              transform: `scale(${lerp(0.7, 1, p)})`,
            }}
          >
            {path && color && <Brand path={path} color={color} size={54} />}
            <div style={{ ...ser, fontWeight: 650, fontSize: 44, color: A.ink }}>
              <Strike p={struck}>{label}</Strike>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            ...pill(A.orange, "#fff"),
            fontSize: 54,
            fontWeight: 700,
            padding: "14px 46px 20px",
            opacity: Math.min(1, own * 1.4),
            transform: `scale(${lerp(0.7, 1, own)})`,
            boxShadow: "0 12px 30px rgba(241,126,60,.3)",
          }}
        >
          Algo propio
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 566, display: "flex", justifyContent: "center", gap: 22 }}>
        {attach.map(({ label, at, icon }) => (
          <In key={label} t={t} at={at} y={20} scale={0.9}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 28px 14px 22px",
                borderRadius: 999,
                background: A.chip,
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 32,
                color: A.ink,
              }}
            >
              {icon}
              {label}
            </div>
          </In>
        ))}
      </div>
    </>
  );
};

/* ---------------------------------------------------------------- camera off */

/** Ali's text slide: the canvas slides up over the camera. */
export const RepeatSlide: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, background: A.canvas }}>
    <Band t={t} />
    <Words
      t={t}
      keyColor={A.orange}
      words={[
        { w: "Si", at: 32.13 },
        { w: "el", at: 32.23 },
        { w: "proceso", at: 32.33 },
        { w: "ya", at: 33.56 },
        { w: "estaba", at: 33.7 },
        { w: "mal,", at: 34.13, key: true },
        { w: "el", at: 34.92 },
        { w: "bot", at: 35.0 },
        { w: "repite", at: 35.3, key: true },
        { w: "lo", at: 35.9 },
        { w: "que", at: 35.91 },
        { w: "estaba", at: 36.11 },
        { w: "mal", at: 36.43, key: true },
      ]}
      style={{
        ...ser,
        position: "absolute",
        left: 80,
        right: 80,
        top: 560,
        textAlign: "center",
        color: A.ink,
        fontWeight: 600,
        fontSize: 100,
        lineHeight: 1.1,
        letterSpacing: -1.8,
      }}
    />
  </div>
);

/** Ali's chapter card: serif title, the lilac line drops and curls into the pill. */
export const ChapterMaintenance: React.FC<{ t: number }> = ({ t }) => {
  const draw = ease(t, 74.2, 0.9);
  const pillP = pop(t, 75.83); // "dos meses"
  return (
    <div style={{ position: "absolute", inset: 0, background: A.chapter }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M900 0 L900 1010 Q900 1082 830 1082"
          pathLength={1}
          fill="none"
          stroke={A.lilacPill}
          strokeWidth={7}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
      <Words
        t={t}
        keyColor={A.ink}
        words={[{ w: "Mantenimiento", at: 74.11 }]}
        style={{ ...ser, position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", color: A.ink, fontWeight: 600, fontSize: 118, letterSpacing: -2.5 }}
      />
      <div
        style={{
          ...pill(A.lilacPill, "#fff"),
          position: "absolute",
          right: 250,
          top: 1046,
          fontSize: 46,
          padding: "12px 36px 16px",
          opacity: Math.min(1, pillP * 1.4),
          transform: `scale(${lerp(0.7, 1, pillP)})`,
          transformOrigin: "100% 50%",
        }}
      >
        Mínimo 2 meses
      </div>
    </div>
  );
};

/** Ali's chart: once the process is transparent, the business line climbs. */
export const Growth: React.FC<{ t: number }> = ({ t }) => {
  const draw = ease(t, 117.34, 2.4); // "transparenta"
  const tip = pop(t, 120.42);
  const pts: Array<[number, number]> = [
    [0, 330],
    [110, 320],
    [220, 300],
    [330, 290],
    [440, 250],
    [550, 205],
    [660, 140],
    [760, 60],
  ];
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const [ex, ey] = pts[pts.length - 1];
  return (
    <>
      <Words
        t={t}
        keyColor={A.orange}
        words={[
          { w: "Se", at: 116.82 },
          { w: "transparenta", at: 117.34, key: true },
          { w: "el", at: 118.51 },
          { w: "proceso", at: 118.67 },
        ]}
        style={{ ...ser, position: "absolute", left: 80, right: 80, top: 330, textAlign: "center", color: A.ink, fontWeight: 600, fontSize: 84, lineHeight: 1.08, letterSpacing: -1.4 }}
      />
      <In t={t} at={116.9} y={30} style={{ position: "absolute", left: 90, top: 600, width: 900, height: 560 }}>
        <div style={{ width: 900, height: 560, background: A.panel, borderRadius: 44, boxShadow: panelShadow, position: "relative" }}>
          <div style={{ position: "absolute", left: 50, top: 40, fontFamily: sans, fontWeight: 600, fontSize: 28, color: A.muted }}>Tu negocio</div>
          <svg width={900} height={560} style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(70 120)">
              <line x1={0} y1={360} x2={760} y2={360} stroke={A.tileBorder} strokeWidth={3} />
              <path d={d} fill="none" stroke={A.orange} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
              <circle cx={ex} cy={ey} r={14} fill={A.orange} opacity={draw > 0.98 ? 1 : 0} />
            </g>
          </svg>
          <div style={{ position: "absolute", left: 290, top: 100, opacity: Math.min(1, tip * 1.4), transform: `scale(${lerp(0.7, 1, tip)})`, transformOrigin: "100% 100%" }}>
            <div style={{ ...pill(A.salmon, "#fff"), fontSize: 40, padding: "10px 30px 14px" }}>Puede crecer mucho más</div>
          </div>
          <div style={{ position: "absolute", left: 70, bottom: 30, fontFamily: sans, fontWeight: 500, fontSize: 24, color: A.label }}>con sistemas de IA</div>
        </div>
      </In>
    </>
  );
};
