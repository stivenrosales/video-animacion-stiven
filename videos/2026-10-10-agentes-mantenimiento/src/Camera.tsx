import React from "react";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import cuts from "./cuts.json";
import { C, LAYOUT, lerp, pop, prog } from "./theme";

const ASPECT = 1080 / 1920;
const FACE_Y = 0.52; // eye line in the source (close framing, outdoors)

export type Mode = 0 | 1 | 2 | 3 | 4;
/**
 * 0 = full-screen talking head, 1 = split (graphic on cream above, camera edge to edge below),
 * 2 = camera off (canvas only), 3 = Claude Carousel card (camera in a black-bordered card on grid paper),
 * 4 = full screen LOWERED 220 px so tall top graphics clear the head (blurred sky fills the gap).
 */
export const MODES: Array<[number, Mode]> = [
  [0, 0], // hook: "audité una empresa" + respond.io
  [4.9, 1], // what respond.io is
  [9.45, 0], // "está genial, pero... limitaciones"
  [15.25, 1], // chat works at first, then the sales flow
  [31.6, 2], // text slide: the bot repeats what was wrong
  [37.75, 1], // the agent's checklist grows
  [48.3, 0], // "empieza a evolucionar"
  [54.0, 1], // seller vs chatbot, step-by-step log
  [67.1, 0], // "no es setearlo una vez y ya está"
  [73.45, 2], // chapter: maintenance, minimum 2 months
  [78.8, 1], // ongoing maintenance, systems around the bot, own tools
  [116.5, 2], // chart: transparent process, the business grows
  [122.0, 0], // "me parece algo genial" + comment CTA
];

type Rect = { x: number; y: number; w: number; h: number; anchor: number; fade: number; radius: number; border: number };
const FULL: Rect = { x: 0, y: 0, w: 1080, h: 1920, anchor: 0.51, fade: 0, radius: 0, border: 0 };
/** Board-approved split: the shot starts at y 740 and its sky dissolves into the cream over 150 px. */
const SPLIT: Rect = {
  x: 0,
  y: LAYOUT.splitTop,
  w: 1080,
  h: 1920 - LAYOUT.splitTop,
  anchor: (LAYOUT.splitEyeY - LAYOUT.splitTop) / (1920 - LAYOUT.splitTop),
  fade: 150,
  radius: 0,
  border: 0,
};
/** Claude Carousel camera card: straight, black ink border, under the hand-drawn boxes. */
const CARD: Rect = { x: 90, y: 690, w: 900, h: 720, anchor: 0.45, fade: 0, radius: 30, border: 4.5 };
/** Lowered full screen: the whole shot slides down 220 px (bottom cropped, no punch-in); anchor >= 0.587 pins its top edge. */
const LOWER_PX = 140; // 220 pushed the chin into the caption chip
const LOWER: Rect = { x: 0, y: LOWER_PX, w: 1080, h: 1920 - LOWER_PX, anchor: 0.6, fade: 160, radius: 0, border: 0 };
const rectOf = (m: Mode): Rect => (m === 0 ? FULL : m === 3 ? CARD : m === 4 ? LOWER : SPLIT);

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

/** 0 (full-screen) .. 1 (any canvas mode). */
export const cardProgress = (t: number) => blend(t, (m) => (m === 0 || m === 4 ? 0 : 1));
/** 0 .. 1 while the lowered full screen is on. */
export const lowerProgress = (t: number) => blend(t, (m) => (m === 4 ? 1 : 0));
/** 0 (camera visible) .. 1 (camera off). */
export const offProgress = (t: number) => blend(t, (m) => (m === 2 ? 1 : 0));
/** 0 .. 1 while the split layout is on (drives the top band). */
export const splitProgress = (t: number) => blend(t, (m) => (m === 1 ? 1 : 0));
/** 0 .. 1 while the Claude Carousel grid paper is on. */
export const claudeProgress = (t: number) => blend(t, (m) => (m === 3 ? 1 : 0));
/** Caption center per mode: over the chest, on the cream above the split, low on the canvas, under the Claude card. */
export const captionY = (t: number) =>
  blend(t, (m) => (m === 0 || m === 4 ? LAYOUT.fullCaptionY : m === 1 ? LAYOUT.splitCaptionY : LAYOUT.offCaptionY));

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
  const [x, y, w, h, anchor, fade, radius, border] = [g("x"), g("y"), g("w"), g("h"), g("anchor"), g("fade"), g("radius"), g("border")];
  const low = lowerProgress(t);
  const zoom = lerp(cutZoom(t), 1, Math.max(p, low)) * (1 + 0.006 * (1 + Math.sin(t * 0.6)));
  const coverW = Math.max(w, h * ASPECT) * zoom;
  const coverH = coverW / ASPECT;
  const top = Math.min(0, Math.max(h - coverH, anchor * h - FACE_Y * coverH));
  const left = (w - coverW) / 2;
  const mask = fadeMask(fade);

  return (
    <>
      {low > 0.001 && (
        // The gap above the lowered shot: a blurred copy of the same frame (sky), so the drop reads seamless.
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: Math.min(1, low * 1.4) }}>
          <Video src={staticFile("edited.mp4")} muted style={{ position: "absolute", left: -54, top: -96, width: 1188, height: 2112, filter: "blur(28px) saturate(1.1)" }} />
        </div>
      )}
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        overflow: "hidden",
        borderRadius: radius,
        WebkitMaskImage: mask,
        maskImage: mask,
        opacity: 1 - off,
        filter: off > 0.001 ? `blur(${16 * off}px)` : undefined,
      }}
    >
      <Video src={staticFile("edited.mp4")} style={{ position: "absolute", left, top, width: coverW, height: coverH }} />
      {border > 0.2 && (
        <div style={{ position: "absolute", inset: 0, borderRadius: radius, boxShadow: `inset 0 0 0 ${border}px ${C.ink}` }} />
      )}
    </div>
    </>
  );
};
