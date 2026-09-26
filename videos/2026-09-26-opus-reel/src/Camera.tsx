import React from "react";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import cuts from "./cuts.json";
import { LAYOUT, lerp, pop, prog, shadow } from "./theme";

const ASPECT = 1080 / 1920;
const FACE_Y = 0.47;

/** 0 = full-screen talking head, 1 = rounded card in the lower half. */
export const MODES: Array<[number, 0 | 1]> = [
  [0, 0],
  [5.2, 1], // DMs + DotCSV
  [19.35, 0], // terminal (top card)
  [24.1, 1], // tools
  [40.05, 0], // "le volví a preguntar"
  [45.8, 1], // captions fix
  [49.7, 0], // 30 minutes (top card)
  [53.3, 1], // CTA
];

export const cardProgress = (t: number) => {
  let value = 0;
  for (let i = 1; i < MODES.length; i++) {
    const [at, mode] = MODES[i];
    const from = MODES[i - 1][1];
    if (t >= at) {
      const s = pop(t, at, { damping: 20, stiffness: 140, mass: 0.9 });
      value = lerp(from, mode, s);
    }
  }
  return value;
};

/** Punch-in that alternates on every jump cut, only while full-screen. */
const cutZoom = (t: number) => {
  let idx = 0;
  for (const c of cuts) if (t >= c) idx++;
  const last = idx > 0 ? cuts[idx - 1] : 0;
  const target = idx % 2 === 0 ? 1.1 : 1.17;
  const prev = idx % 2 === 0 ? 1.17 : 1.1;
  // Hard cut with a tiny ease so the jump reads as intentional.
  return idx === 0 ? 1.1 : lerp(prev, target, Math.min(1, 0.85 + prog(t, last, last + 0.12) * 0.15));
};

export const Camera: React.FC<{ t: number }> = ({ t }) => {
  const p = cardProgress(t);
  const w = lerp(1080, 900, p);
  const h = lerp(1920, LAYOUT.cardHeight, p);
  const x = lerp(0, 90, p);
  const y = lerp(0, LAYOUT.cardTop, p);
  const radius = lerp(0, 48, p);
  const zoom = lerp(cutZoom(t), 1, p) * (1 + 0.012 * Math.sin(t * 0.6));
  const coverW = Math.max(w, h * ASPECT) * zoom;
  const coverH = coverW / ASPECT;
  // Full-screen: face sits lower so top cards clear the head. Card: face high, captions below chin.
  const anchor = lerp(0.47, 0.3, p);
  const top = Math.min(0, Math.max(h - coverH, anchor * h - FACE_Y * coverH));
  const left = (w - coverW) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        overflow: "hidden",
        boxShadow: p > 0.01 ? shadow : "none",
        border: p > 0.01 ? `${2 * p}px solid rgba(233,230,220,${p})` : "none",
      }}
    >
      <Video
        src={staticFile("edited.mp4")}
        style={{ position: "absolute", left, top, width: coverW, height: coverH }}
      />
    </div>
  );
};
