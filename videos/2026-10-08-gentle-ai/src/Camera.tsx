import React from "react";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import cuts from "./cuts.json";
import { LAYOUT, lerp, pop, prog } from "./theme";

const ASPECT = 1080 / 1920;
const FACE_Y = 0.52; // eye line in the source (close framing, outdoors)

export type Mode = 0 | 1 | 2;
/** 0 = full-screen talking head, 1 = split (graphic on cream above, camera edge to edge below), 2 = camera off (canvas only). */
export const MODES: Array<[number, Mode]> = [
  [0, 0], // hook + Claude Code
  [11.25, 2], // "mejores prácticas" + "plugins → arneses" text slides
  [17.35, 0], // "más fácil, más didáctico" + "más construyes, más aprendes"
  [22.65, 2], // chapter: Gentle AI
  [26.55, 0], // creator card
  [34.2, 1], // tiles → memory/tokens → repo card
  [57.3, 0], // "¿por qué es gratis?", thanks, who it is for
  [72.3, 1], // install terminal
  [73.95, 0], // close
];

type Rect = { y: number; h: number; anchor: number; fade: number };
const FULL: Rect = { y: 0, h: 1920, anchor: 0.51, fade: 0 };
/** Board-approved split: the shot starts at y 740 and its sky dissolves into the cream over 150 px. */
const SPLIT: Rect = { y: LAYOUT.splitTop, h: 1920 - LAYOUT.splitTop, anchor: (LAYOUT.splitEyeY - LAYOUT.splitTop) / (1920 - LAYOUT.splitTop), fade: 150 };
/** Mode 2 (camera off) keeps the split shape: the shot fades away in place. */
const rectOf = (m: Mode): Rect => (m === 0 ? FULL : SPLIT);

const SPRING = { damping: 20, stiffness: 140, mass: 0.9 };

/** Springs any per-mode value across every mode change (same timing for geometry, captions, backdrop). */
export const blend = (t: number, valueOf: (m: Mode) => number) => {
  let value = valueOf(MODES[0][1]);
  for (let i = 1; i < MODES.length; i++) {
    const [at, mode] = MODES[i];
    if (t >= at) value = lerp(valueOf(MODES[i - 1][1]), valueOf(mode), pop(t, at, SPRING));
  }
  return value;
};

export const modeAt = (t: number): Mode => {
  let m: Mode = 0;
  for (const [at, mode] of MODES) if (t >= at) m = mode;
  return m;
};

/** 0 (full-screen) .. 1 (split or off). */
export const cardProgress = (t: number) => blend(t, (m) => (m === 0 ? 0 : 1));
/** 0 (camera visible) .. 1 (camera off). */
export const offProgress = (t: number) => blend(t, (m) => (m === 2 ? 1 : 0));
/** 0 .. 1 while the split layout is on (drives the top swoosh). */
export const splitProgress = (t: number) => blend(t, (m) => (m === 1 ? 1 : 0));
/** Caption center per mode: over the chest, on the cream above the split, or low on the canvas. */
export const captionY = (t: number) =>
  blend(t, (m) => (m === 0 ? LAYOUT.fullCaptionY : m === 1 ? LAYOUT.splitCaptionY : LAYOUT.offCaptionY));

/** Punch-in that alternates on every jump cut, only while full-screen. */
const cutZoom = (t: number) => {
  let idx = 0;
  for (const c of cuts) if (t >= c) idx++;
  const last = idx > 0 ? cuts[idx - 1] : 0;
  const target = idx % 2 === 0 ? 1.06 : 1.12;
  const prev = idx % 2 === 0 ? 1.12 : 1.06;
  return idx === 0 ? 1.06 : lerp(prev, target, Math.min(1, 0.85 + prog(t, last, last + 0.12) * 0.15));
};

/** Eased alpha ramp (board: transparent → solid with an ease-in curve, so the start is invisible). */
const fadeMask = (px: number) => {
  if (px < 1) return undefined;
  const stops = [0, 0.04, 0.14, 0.32, 0.56, 0.8, 1];
  return `linear-gradient(180deg, ${stops.map((a, i) => `rgba(0,0,0,${a}) ${((i / (stops.length - 1)) * px).toFixed(1)}px`).join(", ")})`;
};

export const Camera: React.FC<{ t: number }> = ({ t }) => {
  const p = cardProgress(t);
  const off = offProgress(t);
  const g = (k: keyof Rect) => blend(t, (m) => rectOf(m)[k]);
  const [y, h, anchor, fade] = [g("y"), g("h"), g("anchor"), g("fade")];
  const w = 1080;
  const zoom = lerp(cutZoom(t), 1, p) * (1 + 0.012 * Math.sin(t * 0.6));
  const coverW = Math.max(w, h * ASPECT) * zoom;
  const coverH = coverW / ASPECT;
  const top = Math.min(0, Math.max(h - coverH, anchor * h - FACE_Y * coverH));
  const left = (w - coverW) / 2;
  const mask = fadeMask(fade);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: w,
        height: h,
        overflow: "hidden",
        WebkitMaskImage: mask,
        maskImage: mask,
        opacity: 1 - off,
        filter: off > 0.001 ? `blur(${16 * off}px)` : undefined,
      }}
    >
      <Video src={staticFile("edited.mp4")} style={{ position: "absolute", left, top, width: coverW, height: coverH }} />
    </div>
  );
};
