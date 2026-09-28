import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { C, FPS, pop, prog, sans, shadow, lerp } from "./theme";

export const useSec = () => useCurrentFrame() / FPS;

const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
const expoIn = Easing.bezier(0.7, 0, 0.84, 0);

/** Expo-out progress 0..1 that starts at `at` and lasts `dur` seconds. */
export const ease = (t: number, at: number, dur = 0.6) => expoOut(Math.min(1, Math.max(0, (t - at) / dur)));
export const easeIn = (t: number, at: number, dur = 0.4) => expoIn(Math.min(1, Math.max(0, (t - at) / dur)));


/** Claude-like spark: 12 tapered rays with uneven lengths. */
export const Spark: React.FC<{ size: number; rotate?: number; color?: string }> = ({
  size,
  rotate = 0,
  color = C.spark,
}) => {
  const lengths = [1, 0.78, 0.92, 0.7, 0.97, 0.8, 0.9, 0.74, 1, 0.82, 0.88, 0.76];
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ transform: `rotate(${rotate}deg)` }}>
      {lengths.map((l, i) => {
        const a = (i / lengths.length) * Math.PI * 2;
        const r = 46 * l;
        return (
          <line
            key={i}
            x1={Math.cos(a) * 7}
            y1={Math.sin(a) * 7}
            x2={Math.cos(a) * r}
            y2={Math.sin(a) * r}
            stroke={color}
            strokeWidth={7.5}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

/** Visible between start and end: expo-out entrance, expo-in blurred exit. */
export const Scene: React.FC<{
  start: number;
  end: number;
  children: (t: number) => React.ReactNode;
  style?: React.CSSProperties;
}> = ({ start, end, children, style }) => {
  const t = useSec();
  if (t < start - 0.02 || t > end + 0.45) return null;
  const inP = ease(t, start, 0.7);
  const outP = easeIn(t, end, 0.4);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(1, inP * 1.6) * (1 - outP),
        transform: `translateY(${(1 - inP) * 70 - outP * 60}px) scale(${lerp(0.94, 1, inP) - outP * 0.05})`,
        filter: inP < 0.999 || outP > 0 ? `blur(${(1 - inP) * 12 + outP * 14}px)` : undefined,
        ...style,
      }}
    >
      {children(t)}
    </div>
  );
};

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({
  style,
  children,
}) => (
  <div
    style={{
      background: C.card,
      borderRadius: 40,
      border: `2px solid ${C.border}`,
      boxShadow: shadow,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; bg?: string; color?: string; style?: React.CSSProperties }> = ({
  children,
  bg = C.chip,
  color = "#5E5C55",
  style,
}) => (
  <span
    style={{
      fontFamily: sans,
      fontSize: 30,
      fontWeight: 500,
      background: bg,
      color,
      padding: "10px 22px",
      borderRadius: 16,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

export const IconTile: React.FC<{
  icon: React.ElementType;
  bg: string;
  color: string;
  size?: number;
}> = ({ icon: Icon, bg, color, size = 84 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <Icon size={size * 0.52} color={color} strokeWidth={2} />
  </div>
);

/** Element that springs in at `at` seconds. */
export const Pop: React.FC<{
  t: number;
  at: number;
  children: React.ReactNode;
  from?: "up" | "left" | "scale";
  style?: React.CSSProperties;
}> = ({ t, at, children, from = "up", style }) => {
  const p = pop(t, at);
  const tr =
    from === "left"
      ? `translateX(${(1 - p) * -60}px)`
      : from === "scale"
        ? `scale(${lerp(0.6, 1, p)})`
        : `translateY(${(1 - p) * 40}px)`;
  return <div style={{ opacity: Math.min(1, p * 1.4), transform: tr, ...style }}>{children}</div>;
};

/** Blinking caret for typewriter effects. */
export const Caret: React.FC<{ t: number; color?: string; h?: number }> = ({ t, color = C.spark, h = 52 }) => (
  <span
    style={{
      display: "inline-block",
      width: 4,
      height: h,
      marginLeft: 4,
      background: color,
      verticalAlign: "middle",
      opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.15,
    }}
  />
);

/** Element that settles in from blur + offset with an expo-out curve. */
export const In: React.FC<{
  t: number;
  at: number;
  dur?: number;
  x?: number;
  y?: number;
  scale?: number;
  blur?: number;
  rotate?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ t, at, dur = 0.65, x = 0, y = 36, scale = 0.96, blur = 10, rotate = 0, style, children }) => {
  const p = ease(t, at, dur);
  const o = ease(t, at, dur * 0.5);
  return (
    <div
      style={{
        opacity: o,
        transform: `translate(${x * (1 - p)}px, ${y * (1 - p)}px) scale(${lerp(scale, 1, p)}) rotate(${rotate * p}deg)`,
        filter: p < 0.999 ? `blur(${(1 - p) * blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
