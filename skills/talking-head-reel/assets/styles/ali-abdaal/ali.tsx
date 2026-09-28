/** Ali Abdaal-style building blocks (1080x1920 space, absolute seconds). */
import React from "react";
import { Easing, Img, staticFile } from "remotion";
import { siClaude, siMeta, siWhatsapp } from "simple-icons";
import captionsJson from "./captions.json";
import { C, SOFT, caps, clamp01, hand, lerp, pop, sans, serif } from "./theme";

const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
const expoIn = Easing.bezier(0.7, 0, 0.84, 0);
export const ease = (t: number, at: number, dur = 0.6) => expoOut(clamp01((t - at) / dur));
export const easeIn = (t: number, at: number, dur = 0.4) => expoIn(clamp01((t - at) / dur));

/* ---------- word cues ---------- */
const norm = (s: string) => s.toLowerCase().replace(/[¿?¡!,.*]/g, "").trim();
const WORDS = (captionsJson as Array<{ text: string; startMs: number }>).map((w) => ({ w: norm(w.text), t: w.startMs / 1000 }));

/** Start time of the first spoken `word` at or after `from` seconds. Throws so a bad cue fails the render loudly. */
export const cue = (word: string, from: number) => {
  const n = norm(word);
  const hit = WORDS.find((x) => x.t >= from - 0.05 && x.w === n);
  if (!hit) throw new Error(`cue not found: "${word}" after ${from}s`);
  return hit.t;
};

/** "Va a *cobrar* por eso" → words with their spoken times. `*x*` = gold keyword; `shown=spoken` maps display to audio. */
export const words = (text: string, from: number): Array<{ text: string; key: boolean; at: number }> => {
  let cursor = from;
  return text.split(" ").map((raw) => {
    const [shown, spoken] = raw.split("=");
    const key = shown.startsWith("*");
    const at = cue(spoken ?? shown, cursor);
    cursor = at;
    return { text: shown.replace(/\*/g, ""), key, at };
  });
};

/* ---------- structure ---------- */
/** A beat on screen between start and end; everything inside leaves together with a quick blur. */
export const Beat: React.FC<{ t: number; start: number; end: number; children: React.ReactNode }> = ({ t, start, end, children }) => {
  if (t < start || t > end + 0.3) return null;
  const out = easeIn(t, end, 0.26);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 1 - out,
        transform: `scale(${1 - out * 0.04})`,
        transformOrigin: "50% 22%",
        filter: out > 0 ? `blur(${out * 8}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Sticker-style entrance: scale pop with a little overshoot, like Ali's graphics. */
export const Appear: React.FC<{
  t: number;
  at: number;
  style?: React.CSSProperties;
  kind?: "pop" | "up" | "fade";
  children: React.ReactNode;
}> = ({ t, at, style, kind = "pop", children }) => {
  if (t < at) return null;
  const p = pop(t, at, { damping: 11, stiffness: 210, mass: 0.6 });
  const o = clamp01((t - at) / 0.12);
  const tr = kind === "pop" ? `scale(${lerp(0.45, 1, p)})` : kind === "up" ? `translateY(${(1 - ease(t, at, 0.5)) * 40}px)` : "none";
  return <div style={{ position: "absolute", opacity: o, transform: tr, ...style }}>{children}</div>;
};

/* ---------- type ---------- */
/** Soft-serif headline; every word lights up from gray when it is spoken, keywords in gold italic. */
export const Head: React.FC<{ t: number; text: string; from: number; top: number; size?: number; left?: number; right?: number }> = ({
  t,
  text,
  from,
  top,
  size = 72,
  left = 90,
  right = 90,
}) => {
  const ws = words(text, from);
  const t0 = ws[0].at - 0.12;
  if (t < t0) return null;
  const e = ease(t, t0, 0.5);
  return (
    <div
      style={{
        position: "absolute",
        left,
        right,
        top,
        textAlign: "center",
        fontFamily: serif,
        fontVariationSettings: SOFT,
        fontWeight: 640,
        fontSize: size,
        letterSpacing: -1,
        lineHeight: 1.12,
        color: C.white,
        textShadow: "0 2px 16px rgba(0,0,0,.38)",
        opacity: e,
        transform: `translateY(${(1 - e) * 18}px)`,
      }}
    >
      {ws.map((w, i) => (
        <React.Fragment key={i}>
          <span
            style={{
              opacity: lerp(0.32, 1, ease(t, w.at, 0.22)),
              color: w.key ? C.gold : C.white,
              fontStyle: w.key ? "italic" : "normal",
              fontWeight: w.key ? 600 : 640,
            }}
          >
            {w.text}
          </span>
          {i < ws.length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </div>
  );
};

/** Gold condensed caps label with an optional white tail ("UNA PREGUNTA QUE ME HICE:"). */
export const Label: React.FC<{ t: number; at: number; top: number; text: string; strong?: string; size?: number }> = ({
  t,
  at,
  top,
  text,
  strong,
  size = 36,
}) => {
  if (t < at) return null;
  const e = ease(t, at, 0.45);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        fontFamily: caps,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: C.gold,
        textShadow: "0 2px 10px rgba(0,0,0,.35)",
        opacity: e,
        transform: `translateY(${(1 - e) * 12}px)`,
      }}
    >
      {text} {strong && <span style={{ color: C.white }}>{strong}</span>}
    </div>
  );
};

/** Handwritten note that writes itself left to right. */
export const Hand: React.FC<{
  t: number;
  at: number;
  text: string;
  color: string;
  size?: number;
  x?: number;
  y: number;
  rotate?: number;
  center?: boolean;
}> = ({ t, at, text, color, size = 60, x = 0, y, rotate = 0, center = false }) => {
  if (t < at) return null;
  const dur = Math.min(0.9, Math.max(0.35, text.length * 0.035));
  const p = clamp01((t - at) / dur);
  return (
    <div
      style={{
        position: "absolute",
        left: center ? 0 : x,
        right: center ? 0 : undefined,
        top: y,
        textAlign: center ? "center" : "left",
        fontFamily: hand,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 1,
        lineHeight: 1.05,
        color,
        whiteSpace: "nowrap",
        textShadow: "0 2px 10px rgba(0,0,0,.45)",
        transform: `rotate(${rotate}deg)`,
        clipPath: `inset(-20% ${(1 - p) * 100}% -20% -5%)`,
      }}
    >
      {text}
    </div>
  );
};

/** Hand-drawn stroke (arrow, underline, strike) drawn over `dur` seconds. */
export const Doodle: React.FC<{ t: number; at: number; d: string; color: string; width?: number; dur?: number; tip?: string }> = ({
  t,
  at,
  d,
  color,
  width = 7,
  dur = 0.45,
  tip,
}) => {
  if (t < at) return null;
  const p = ease(t, at, dur);
  const q = ease(t, at + dur * 0.8, 0.2);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - p} style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} />
      {tip && <path d={tip} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - q} />}
    </svg>
  );
};

/* ---------- stickers ---------- */
const BrandSvg: React.FC<{ path: string; size: number; color: string }> = ({ path, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d={path} fill={color} />
  </svg>
);
export const WhatsAppLogo: React.FC<{ size: number; color?: string }> = ({ size, color = "#25D366" }) => <BrandSvg path={siWhatsapp.path} size={size} color={color} />;
export const MetaLogo: React.FC<{ size: number; color?: string }> = ({ size, color = "#0467DF" }) => <BrandSvg path={siMeta.path} size={size} color={color} />;
export const ClaudeLogo: React.FC<{ size: number; color?: string }> = ({ size, color = "#D97757" }) => <BrandSvg path={siClaude.path} size={size} color={color} />;
export const PowerBILogo: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile("powerbi.svg")} style={{ width: size, height: size }} />;

/** White pill sticker with a soft glow (Ali's Manychat sticker). */
export const Pill: React.FC<{ children: React.ReactNode; size?: number; pad?: string }> = ({ children, size = 54, pad = "20px 38px" }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 18,
      padding: pad,
      borderRadius: 28,
      background: C.white,
      color: "#111",
      fontFamily: sans,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: -1,
      whiteSpace: "nowrap",
      boxShadow: "0 0 0 1px rgba(0,0,0,.04), 0 0 44px rgba(255,255,255,.55), 0 10px 30px rgba(0,0,0,.28)",
    }}
  >
    {children}
  </div>
);

/** Chat bubble with an avatar, like the DM replies in Ali's shorts. */
export const Bubble: React.FC<{ avatar: React.ReactNode; avatarBg: string; children: React.ReactNode; me?: boolean }> = ({ avatar, avatarBg, children, me }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexDirection: me ? "row-reverse" : "row" }}>
    <div style={{ width: 78, height: 78, borderRadius: "50%", background: avatarBg, display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,.25)", flexShrink: 0 }}>
      {avatar}
    </div>
    <div
      style={{
        padding: "20px 30px",
        borderRadius: me ? "30px 30px 8px 30px" : "30px 30px 30px 8px",
        background: me ? "#DCF8C6" : C.white,
        color: "#111",
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 40,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 24px rgba(0,0,0,.24)",
      }}
    >
      {children}
    </div>
  </div>
);

/** Glossy app-like tile that bobs gently (Ali's floating 3D icons). */
export const Tile: React.FC<{ t: number; size: number; bg: string; phase?: number; tilt?: number; children: React.ReactNode }> = ({
  t,
  size,
  bg,
  phase = 0,
  tilt = 0,
  children,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: bg,
      display: "grid",
      placeItems: "center",
      boxShadow: "inset 0 6px 10px rgba(255,255,255,.55), inset 0 -8px 14px rgba(0,0,0,.16), 0 16px 32px rgba(0,0,0,.30)",
      transform: `translateY(${Math.sin(t * 1.6 + phase) * 8}px) rotate(${tilt}deg)`,
    }}
  >
    {children}
  </div>
);

/** Huge gold serif figure ("$10 MILLION" / "WHOA"). */
export const Big: React.FC<{ children: React.ReactNode; size: number }> = ({ children, size }) => (
  <div
    style={{
      fontFamily: serif,
      fontVariationSettings: SOFT,
      fontWeight: 800,
      fontSize: size,
      color: C.gold,
      letterSpacing: -4,
      lineHeight: 1,
      whiteSpace: "nowrap",
      textShadow: "0 6px 30px rgba(0,0,0,.35)",
    }}
  >
    {children}
  </div>
);

/** Gold italic numeral in a hand-drawn ellipse over a soft rainbow glow. */
export const Num: React.FC<{ t: number; at: number; n: string }> = ({ t, at, n }) => {
  const draw = ease(t, at, 0.5);
  return (
    <div style={{ position: "relative", width: 170, height: 116, display: "grid", placeItems: "center" }}>
      <div
        style={{
          position: "absolute",
          inset: "-50px -90px",
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(255,120,190,.45), rgba(93,205,241,.35) 45%, rgba(253,212,107,.20) 70%, transparent)",
          filter: "blur(12px)",
          opacity: draw,
        }}
      />
      <svg width={170} height={116} viewBox="0 0 170 116" style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={85} cy={58} rx={78} ry={48} pathLength={1} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth={3} strokeDasharray={1} strokeDashoffset={1 - draw} transform="rotate(-12 85 58)" />
      </svg>
      <span style={{ position: "relative", fontFamily: serif, fontVariationSettings: SOFT, fontStyle: "italic", fontWeight: 700, fontSize: 104, color: C.gold, lineHeight: 1 }}>{n}</span>
    </div>
  );
};

/** Four-point stars that twinkle around a spot. */
export const Sparkles: React.FC<{ t: number; at: number; points: Array<[number, number, number]>; color?: string }> = ({ t, at, points, color = C.yellow }) => {
  if (t < at) return null;
  return (
    <>
      {points.map(([x, y, s], i) => {
        const p = pop(t, at + i * 0.08, { damping: 9, stiffness: 240, mass: 0.5 });
        const tw = 0.75 + 0.25 * Math.sin(t * 6 + i * 1.7);
        return (
          <svg key={i} width={s} height={s} viewBox="-10 -10 20 20" style={{ position: "absolute", left: x - s / 2, top: y - s / 2, transform: `scale(${p * tw}) rotate(${t * 40 + i * 30}deg)` }}>
            <path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z" fill={color} />
          </svg>
        );
      })}
    </>
  );
};

/** Mini dashboard card (the "Power BI / dashboard" people open every day). */
export const DashCard: React.FC<{ w?: number }> = ({ w = 480 }) => {
  const bars = [0.42, 0.66, 0.5, 0.82, 0.64, 0.92];
  return (
    <div
      style={{
        width: w,
        padding: "24px 28px 26px",
        borderRadius: 26,
        background: C.white,
        boxShadow: "0 0 50px rgba(255,255,255,.45), 0 14px 34px rgba(0,0,0,.30)",
        fontFamily: sans,
        color: "#111",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 700, fontSize: 32 }}>
        <PowerBILogo size={40} /> Dashboard
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 150, marginTop: 20 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, height: `${b * 100}%`, borderRadius: 8, background: i === bars.length - 1 ? "#F2C811" : "#E3E1DC" }} />
        ))}
      </div>
    </div>
  );
};

/** White rounded chip used for short lists (Software · SaaS · ERP). */
export const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      padding: "14px 26px",
      borderRadius: 20,
      background: C.white,
      color: "#111",
      fontFamily: sans,
      fontWeight: 700,
      fontSize: 40,
      whiteSpace: "nowrap",
      boxShadow: "0 0 30px rgba(255,255,255,.35), 0 8px 22px rgba(0,0,0,.26)",
    }}
  >
    {children}
  </div>
);

/** Pale aqua question card that types itself ("Ali, I want to start a business…"). */
export const QuestionCard: React.FC<{ t: number; t0: number; t1: number; text: string }> = ({ t, t0, t1, text }) => {
  const n = Math.round(clamp01((t - t0) / (t1 - t0)) * text.length);
  const caretOn = Math.floor(t * 2.2) % 2 === 0;
  return (
    <div
      style={{
        padding: "30px 38px",
        borderRadius: 28,
        background: C.aqua,
        color: C.ink,
        fontFamily: sans,
        fontWeight: 500,
        fontSize: 44,
        lineHeight: 1.3,
        boxShadow: "0 12px 34px rgba(0,0,0,.28)",
      }}
    >
      {text.slice(0, n)}
      <span style={{ display: "inline-block", width: 4, height: 48, marginLeft: 4, verticalAlign: -8, background: C.ink, opacity: caretOn ? 1 : 0 }} />
      <span style={{ visibility: "hidden" }}>{text.slice(n)}</span>
    </div>
  );
};

/** macOS-like arrow cursor. */
export const Cursor: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,.4))" }}>
    <path d="M4 2 L4 19 L8.5 14.8 L11.4 21.5 L14.2 20.3 L11.3 13.7 L17.5 13.7 Z" fill="#fff" stroke="#111" strokeWidth={1.3} strokeLinejoin="round" />
  </svg>
);
