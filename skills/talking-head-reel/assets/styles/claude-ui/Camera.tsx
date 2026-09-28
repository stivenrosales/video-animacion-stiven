import React from "react";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import cuts from "./cuts.json";
import { LAYOUT, lerp, pop, prog, shadow } from "./theme";

const ASPECT = 1080 / 1920;
const FACE_Y = 0.45;

/** 0 = full-screen talking head, 1 = rounded card, 2 = camera off (full-screen animation, no face). */
export const MODES: Array<[number, 0 | 1 | 2]> = [
  [0, 0], // full — hook (face, no graphics)
  [1.25, 1], // card — event flyer → workflows row → "0" stat
  [11.7, 0], // full — tokens tradeoff
  [15.2, 2], // OFF — "¿qué es un workflow?"
  [25.1, 1], // card — checklist 1/3, 2/3
  [36.9, 0], // full — "la PC no se debe apagar" (breathing room, no graphics)
  [41.1, 1], // card — Vorssaint, then checklist 3/3 + plan.md
  [59.5, 0], // full — "el trabajo ya está hecho" (no graphics)
  [62.3, 1], // card — plan.md: success indicators
  [67.35, 2], // OFF — Run workflow + 8 h time-lapse
  [72.95, 0], // full — review card + close
];

/** Mode 2 (camera off) shares CARD geometry: full→off shrinks toward the card shape while it
 *  leaves, and off→full grows from the card shape while it appears — one continuous gesture. */
const geomMode = (m: 0 | 1 | 2): 0 | 1 => (m === 2 ? 1 : m);

/** Windows where the full-screen camera slides down so tall top content (the chat) clears the head. */
const LOWER: Array<[number, number]> = []; // none needed in this video
const LOWER_PX = 230;
export const lowerAmount = (t: number) =>
  LOWER.reduce((v, [a, b]) => Math.max(v, t < a || t > b + 0.8 ? 0 : Math.min(ease01((t - a) / 0.8), 1 - ease01((t - b) / 0.8))), 0);
/** Windows where the full-screen camera eases out to the whole frame (zoom 1.0) so a hand gesture fits. */
const ZOOM_OUT: Array<[number, number]> = []; // none needed in this video
const ZOOM_OUT_TO = 0.9; // below 1.0 the frame shrinks; the border is filled with a blurred copy
const zoomOutAmount = (t: number) =>
  ZOOM_OUT.reduce((v, [a, b]) => Math.max(v, t < a || t > b + 0.6 ? 0 : Math.min(ease01((t - a) / 0.6), 1 - ease01((t - b) / 0.6))), 0);
const ease01 = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - c, 3);
};

const SPRING = { damping: 20, stiffness: 140, mass: 0.9 };

/** 0 (full-screen) .. 1 (card-shaped, whether docked as a card or hidden off for an OFF-mode scene). */
export const cardProgress = (t: number) => {
  let value = 0;
  for (let i = 1; i < MODES.length; i++) {
    const [at, mode] = MODES[i];
    const from = geomMode(MODES[i - 1][1]);
    const to = geomMode(mode);
    if (t >= at) {
      const s = pop(t, at, SPRING);
      value = lerp(from, to, s);
    }
  }
  return value;
};

/** 0 (camera visible) .. 1 (camera off, full-screen animation on the cream canvas). Same spring
 *  timing as `cardProgress` so the two curves stay perfectly in sync during every transition. */
export const offProgress = (t: number) => {
  let value = 0;
  for (let i = 1; i < MODES.length; i++) {
    const [at, mode] = MODES[i];
    const from = MODES[i - 1][1] === 2 ? 1 : 0;
    const to = mode === 2 ? 1 : 0;
    if (t >= at) {
      const s = pop(t, at, SPRING);
      value = lerp(from, to, s);
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
  const off = offProgress(t);
  const w = lerp(1080, 900, p);
  const h = lerp(1920, LAYOUT.cardHeight, p);
  const x = lerp(0, 90, p);
  const y = lerp(0, LAYOUT.cardTop, p);
  const radius = lerp(0, 48, p);
  // While lowered for the chat, drop the jump-cut punch-in so the chin stays above the captions.
  const zoom = lerp(lerp(lerp(cutZoom(t), 1, lowerAmount(t)), ZOOM_OUT_TO, zoomOutAmount(t)), 1, p) * (1 + 0.012 * Math.sin(t * 0.6) * (1 - zoomOutAmount(t)));
  const coverW = Math.max(w, h * ASPECT) * zoom;
  const coverH = coverW / ASPECT;
  // Full-screen: face sits lower so top cards clear the head. Card: face high, captions below chin.
  const anchor = lerp(0.47, 0.3, p);
  const shift = LOWER_PX * lowerAmount(t) * (1 - p);
  const shrunk = coverH < h; // zoomed out below cover: pin the frame to the top so the face rises above chest graphics
  const top = (shrunk ? 0 : Math.min(0, Math.max(h - coverH, anchor * h - FACE_Y * coverH))) + shift;
  const left = (w - coverW) / 2;
  // Any gap (lowered frame or zoom-out) is filled with a blurred copy of the same shot, feathered in.
  const fill = shift > 1 || shrunk;
  const edge = shrunk ? Math.min(90, (h - coverH) * 0.8) : 0;
  const masks: string[] = [];
  if (shift > 1) masks.push("linear-gradient(to bottom, transparent 0px, black 220px)");
  if (edge > 0) {
    masks.push(`linear-gradient(to right, transparent 0px, black ${edge}px, black calc(100% - ${edge}px), transparent 100%)`);
    masks.push(`linear-gradient(to bottom, black 0px, black calc(100% - ${edge * 1.6}px), transparent 100%)`);
  }
  // Backdrop at plain cover size so its blurred edges line up with the shrunk frame.
  const bgW = Math.max(w, h * ASPECT);

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
        // Camera-off (mode 2): the whole card fades, sinks and blurs away while the animation takes over.
        opacity: 1 - off,
        transform: `scale(${lerp(1, 0.94, off)}) translateY(${60 * off}px)`,
        filter: off > 0.001 ? `blur(${16 * off}px)` : undefined,
      }}
    >
      {fill && (
        <Video
          src={staticFile("edited.mp4")}
          muted
          style={{ position: "absolute", left: (w - bgW) / 2, top: (h - bgW / ASPECT) / 2, width: bgW, height: bgW / ASPECT, filter: "blur(28px)" }}
        />
      )}
      <Video
        src={staticFile("edited.mp4")}
        style={{
          position: "absolute",
          left,
          top,
          width: coverW,
          height: coverH,
          ...(masks.length
            ? {
                maskImage: masks.join(", "),
                WebkitMaskImage: masks.join(", "),
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }
            : {}),
        }}
      />
    </div>
  );
};
