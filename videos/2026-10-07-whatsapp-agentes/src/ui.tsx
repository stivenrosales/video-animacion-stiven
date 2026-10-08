import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { FPS, lerp } from "./theme";

export const useSec = () => useCurrentFrame() / FPS;

const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
const expoIn = Easing.bezier(0.7, 0, 0.84, 0);

/** Expo-out progress 0..1 that starts at `at` and lasts `dur` seconds. */
export const ease = (t: number, at: number, dur = 0.6) => expoOut(Math.min(1, Math.max(0, (t - at) / dur)));
export const easeIn = (t: number, at: number, dur = 0.4) => expoIn(Math.min(1, Math.max(0, (t - at) / dur)));

/** Visible between start and end: expo-out entrance, expo-in blurred exit. */
export const Scene: React.FC<{
  start: number;
  end: number;
  children: (t: number) => React.ReactNode;
  enter?: "rise" | "slide"; // slide = Ali's text slide: whole canvas moves up from below with motion blur
}> = ({ start, end, children, enter = "rise" }) => {
  const t = useSec();
  if (t < start - 0.02 || t > end + 0.45) return null;
  if (enter === "slide") {
    const inP = ease(t, start, 0.55);
    const outP = easeIn(t, end, 0.4);
    const y = (1 - inP) * 1920 - outP * 1920;
    const blur = Math.abs(y) > 2 ? Math.min(14, Math.abs(y) / 60) : 0;
    return (
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${y}px)`, filter: blur ? `blur(${blur}px)` : undefined }}>
        {children(t)}
      </div>
    );
  }
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
      }}
    >
      {children(t)}
    </div>
  );
};

/** Element that settles in from blur + offset with an expo-out curve. */
export const In: React.FC<{
  t: number;
  at: number;
  dur?: number;
  x?: number;
  y?: number;
  scale?: number;
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ t, at, dur = 0.65, x = 0, y = 36, scale = 0.96, blur = 10, style, children }) => {
  const p = ease(t, at, dur);
  const o = ease(t, at, dur * 0.5);
  return (
    <div
      style={{
        opacity: o,
        transform: `translate(${x * (1 - p)}px, ${y * (1 - p)}px) scale(${lerp(scale, 1, p)})`,
        filter: p < 0.999 ? `blur(${(1 - p) * blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Ali's word reveal: each word arrives blurred and gray, then settles sharp. */
export const Words: React.FC<{
  t: number;
  words: Array<{ w: string; at: number; key?: boolean }>;
  keyColor: string;
  style?: React.CSSProperties;
}> = ({ t, words, keyColor, style }) => (
  <div style={style}>
    {words.map(({ w, at, key }, i) => {
      const p = ease(t, at, 0.45);
      return (
        <React.Fragment key={i}>
          <span
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * 12}px)`,
              filter: p < 0.999 ? `blur(${(1 - p) * 14}px)` : undefined,
              color: key ? keyColor : undefined,
              fontWeight: key ? 700 : undefined,
            }}
          >
            {w}
          </span>{" "}
        </React.Fragment>
      );
    })}
  </div>
);
