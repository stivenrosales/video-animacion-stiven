import React from "react";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import cuts from "./cuts.json";
import { A, LAYOUT, lerp, pop, prog, shadow } from "./theme";

const ASPECT = 1080 / 1920;
const FACE_Y = 0.48; // eye line in the source (close framing, outdoors)

export type Mode = 0 | 1 | 2 | 3;
/** 0 = full-screen talking head, 1 = camera card under a white panel, 2 = camera off (canvas only), 3 = wide camera card on top. */
export const MODES: Array<[number, Mode]> = [
  [0, 0], // hook headline + "3 consejos"
  [8.3, 2], // chapter 1 card
  [10.0, 1], // bubbles → one message
  [18.55, 0], // "el bot tiene que ser muy concreto"
  [21.3, 2], // chapter 2 + "específico" text slide
  [27.45, 0], // "mejorar el prompt"
  [30.95, 1], // WhatsApp reply buttons
  [44.95, 2], // chapter 3 + McDonald's screenshot
  [54.2, 0], // Agendar / Comprar → la ruta más corta
  [62.75, 3], // flow row: Bot ··· Humano ··· Llamada
  [71.05, 0], // "seguir ahorrando"
  [73.95, 1], // Meta AI vs Tu agente
  [83.85, 0], // close
];

type Rect = { x: number; y: number; w: number; h: number; r: number; anchor: number; border: number };
const FULL: Rect = { x: 0, y: 0, w: 1080, h: 1920, r: 0, anchor: 0.51, border: 0 };
const CARD: Rect = { x: LAYOUT.cardX, y: LAYOUT.cardTop, w: LAYOUT.cardW, h: LAYOUT.cardHeight, r: 40, anchor: 0.42, border: 1 };
const WIDE: Rect = { x: LAYOUT.wideX, y: LAYOUT.wideTop, w: LAYOUT.wideW, h: LAYOUT.wideHeight, r: 40, anchor: 0.42, border: 1 };
/** Mode 2 (camera off) keeps the CARD shape: full→off shrinks toward the card while it leaves. */
const rectOf = (m: Mode): Rect => (m === 0 ? FULL : m === 3 ? WIDE : CARD);

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

/** 0 (full-screen) .. 1 (any framed shape: card, wide or off). */
export const cardProgress = (t: number) => blend(t, (m) => (m === 0 ? 0 : 1));
/** 0 (camera visible) .. 1 (camera off). */
export const offProgress = (t: number) => blend(t, (m) => (m === 2 ? 1 : 0));
/** Caption center per mode: over the chest, in the lane under the panel, or below the wide card / canvas content. */
export const captionY = (t: number) =>
  blend(t, (m) => (m === 0 ? LAYOUT.fullCaptionY : m === 1 ? LAYOUT.laneCenter : m === 3 ? LAYOUT.wideCaptionY : LAYOUT.offCaptionY));

/** Punch-in that alternates on every jump cut, only while full-screen. */
const cutZoom = (t: number) => {
  let idx = 0;
  for (const c of cuts) if (t >= c) idx++;
  const last = idx > 0 ? cuts[idx - 1] : 0;
  const target = idx % 2 === 0 ? 1.06 : 1.12;
  const prev = idx % 2 === 0 ? 1.12 : 1.06;
  return idx === 0 ? 1.06 : lerp(prev, target, Math.min(1, 0.85 + prog(t, last, last + 0.12) * 0.15));
};

export const Camera: React.FC<{ t: number }> = ({ t }) => {
  const p = cardProgress(t);
  const off = offProgress(t);
  const g = (k: keyof Rect) => blend(t, (m) => rectOf(m)[k]);
  const [x, y, w, h, radius, anchor, border] = [g("x"), g("y"), g("w"), g("h"), g("r"), g("anchor"), g("border")];
  const zoom = lerp(cutZoom(t), 1, p) * (1 + 0.006 * (1 + Math.sin(t * 0.6)));
  const coverW = Math.max(w, h * ASPECT) * zoom;
  const coverH = coverW / ASPECT;
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
        boxShadow: border > 0.01 ? shadow.replace(/\.18\)/, `${0.18 * border})`) : "none",
        outline: border > 0.01 ? `${4 * border}px solid ${A.lilac}` : "none",
        outlineOffset: -4 * border,
        opacity: 1 - off,
        transform: `scale(${lerp(1, 0.94, off)}) translateY(${60 * off}px)`,
        filter: off > 0.001 ? `blur(${16 * off}px)` : undefined,
      }}
    >
      <Video src={staticFile("edited.mp4")} style={{ position: "absolute", left, top, width: coverW, height: coverH }} />
    </div>
  );
};
