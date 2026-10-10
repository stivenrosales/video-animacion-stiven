import React from "react";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import cuts from "./cuts.json";
import { LAYOUT, lerp, pop, prog, shadow } from "./theme";

const ASPECT = 1080 / 1920;
const FACE_Y = 0.45;

/** 0 = full-screen talking head, 1 = rounded card in the lower half. */
export const MODES: Array<[number, 0 | 1]> = [
  [0, 0], // full-screen hook
  [5.0, 1], // card mode for a list/panel scene
];

/** Windows where the full-screen camera slides down so tall top content (the chat) clears the head. */
const LOWER: Array<[number, number]> = []; // e.g. [[25.0, 33.2]] for a tall chat on top
const LOWER_PX = 230;
export const lowerAmount = (t: number) =>
  LOWER.reduce((v, [a, b]) => Math.max(v, t < a || t > b + 0.8 ? 0 : Math.min(ease01((t - a) / 0.8), 1 - ease01((t - b) / 0.8))), 0);
/** Windows where the full-screen camera eases out to the whole frame (zoom 1.0) so a hand gesture fits. */
const ZOOM_OUT: Array<[number, number]> = []; // e.g. [[33.75, 35.95]] for a chest-level hand gesture
const ZOOM_OUT_TO = 0.9; // below 1.0 the frame shrinks; the border is filled with a blurred copy
const zoomOutAmount = (t: number) =>
  ZOOM_OUT.reduce((v, [a, b]) => Math.max(v, t < a || t > b + 0.6 ? 0 : Math.min(ease01((t - a) / 0.6), 1 - ease01((t - b) / 0.6))), 0);
const ease01 = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - c, 3);
};

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
  // While lowered for the chat, drop the jump-cut punch-in so the chin stays above the captions.
  const zoom = lerp(lerp(lerp(cutZoom(t), 1, lowerAmount(t)), ZOOM_OUT_TO, zoomOutAmount(t)), 1, p) * (1 + 0.006 * (1 + Math.sin(t * 0.6)) * (1 - zoomOutAmount(t)));
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
