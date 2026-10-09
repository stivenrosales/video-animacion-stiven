/**
 * Hand-drawn layer in the style of Claude's IG carousels: smooth single-pass rough.js strokes
 * (roughness ~0.6, no multi-stroke), drawn on like a pen, with a light boil (the seed steps
 * every 4 frames through 3 variants) so the line has the slight tremor of a real drawing.
 */
import React from "react";
import rough from "roughjs";
import type { Drawable, Options } from "roughjs/bin/core";
import { useCurrentFrame } from "remotion";
import { H, C } from "./theme";
import { ease } from "./ui";

const gen = rough.generator();
type Pt = [number, number];

export const boilSeed = (frame: number) => 1 + (Math.floor(frame / 4) % 3);

export const ink = (seed: number, o: Options = {}): Options => ({
  stroke: C.ink,
  strokeWidth: 4.5,
  roughness: 0.6,
  bowing: 0.6,
  disableMultiStroke: true,
  seed,
  ...o,
});
export const chalk = (seed: number, o: Options = {}): Options => ink(seed, { stroke: H.chalk, strokeWidth: 5.5, roughness: 0.7, ...o });

const rr = (x: number, y: number, w: number, h: number, r = 14) =>
  `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;

/** A stroke group: drawables + when they draw and an optional rotation about a center. */
export type Stroke = { d: Drawable[]; at: number; dur?: number; rot?: { deg: number; cx: number; cy: number } };

export const box = (seed: number, x: number, y: number, w: number, h: number, fill: string, at: number, rot = 0, dur = 0.55): Stroke => ({
  d: [gen.path(rr(x, y, w, h), ink(seed, { fill, fillStyle: "solid" }))],
  at,
  dur,
  rot: rot ? { deg: rot, cx: x + w / 2, cy: y + h / 2 } : undefined,
});

export const line = (seed: number, a: Pt, b: Pt, at: number, o: Options = {}, dur = 0.3): Stroke => ({
  d: [gen.line(a[0], a[1], b[0], b[1], ink(seed, o))],
  at,
  dur,
});

/** Curved arrow with an open chevron head; the head lands when the shaft is done. */
export const arrow = (seed: number, pts: Pt[], at: number, o: Options = {}, dur = 0.45): Stroke[] => {
  const [a, b] = pts.slice(-2);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const L = 30;
  const head: Pt[] = [
    [b[0] - L * Math.cos(ang - 0.55), b[1] - L * Math.sin(ang - 0.55)],
    b,
    [b[0] - L * Math.cos(ang + 0.55), b[1] - L * Math.sin(ang + 0.55)],
  ];
  return [
    { d: [gen.curve(pts, ink(seed, o))], at, dur },
    { d: [gen.linearPath(head, ink(seed + 1, o))], at: at + dur, dur: 0.14 },
  ];
};

/** Marker strike over a word: two quick passes, slight upward slant, overshooting both ends. */
export const strike = (seed: number, x0: number, x1: number, y: number, at: number, color: string, w = 8): Stroke[] => [
  { d: [gen.line(x0 - 14, y + 5, x1 + 14, y - 6, { stroke: color, strokeWidth: w, roughness: 0.9, bowing: 1.2, disableMultiStroke: true, seed })], at, dur: 0.28 },
  { d: [gen.line(x0 + 16, y + 12, x1 + 4, y + 1, { stroke: color, strokeWidth: w * 0.55, roughness: 1, bowing: 1, disableMultiStroke: true, seed: seed + 3 })], at: at + 0.2, dur: 0.22 },
];

/** Renders strokes on a full-frame SVG; fills fade in while their outline draws. */
export const Ink: React.FC<{ t: number; strokes: (seed: number) => Stroke[]; shadow?: boolean }> = ({ t, strokes, shadow }) => {
  const seed = boilSeed(useCurrentFrame());
  const list = strokes(seed);
  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: shadow ? "drop-shadow(0 1px 10px rgba(0,0,0,.22))" : undefined }}
    >
      {list.map((s, si) => {
        if (t < s.at) return null;
        const p = ease(t, s.at, s.dur ?? 0.45);
        return (
          <g key={si} transform={s.rot ? `rotate(${s.rot.deg} ${s.rot.cx} ${s.rot.cy})` : undefined}>
            {s.d.flatMap((dr, di) =>
              gen.toPaths(dr).map((path, pi) => {
                const isFill = path.fill && path.fill !== "none" && (!path.stroke || path.stroke === "none");
                return isFill ? (
                  <path key={`${di}-${pi}`} d={path.d} fill={path.fill} opacity={ease(t, s.at, (s.dur ?? 0.45) * 0.8)} />
                ) : (
                  <path
                    key={`${di}-${pi}`}
                    d={path.d}
                    pathLength={1}
                    fill="none"
                    stroke={path.stroke}
                    strokeWidth={path.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="1 1"
                    strokeDashoffset={1 - p}
                  />
                );
              }),
            )}
          </g>
        );
      })}
    </svg>
  );
};

/** White line icons drawn over the camera (the Claude reel "Documents" device). Box ~150x150 at (x, y). */
export const CHALK_ICONS = {
  course: (s: number, x: number, y: number, at: number): Stroke[] => [
    { d: [gen.path(`M${x} ${y + 10} h150 v105 h-150 Z`, chalk(s))], at, dur: 0.5 },
    { d: [gen.line(x + 22, y + 40, x + 128, y + 40, chalk(s)), gen.line(x + 22, y + 64, x + 96, y + 64, chalk(s))], at: at + 0.35, dur: 0.3 },
    { d: [gen.circle(x + 118, y + 96, 34, chalk(s))], at: at + 0.55, dur: 0.3 },
    { d: [gen.linearPath([[x + 108, y + 111], [x + 102, y + 146], [x + 118, y + 135], [x + 134, y + 146], [x + 128, y + 111]], chalk(s))], at: at + 0.75, dur: 0.25 },
  ],
  bolt: (s: number, x: number, y: number, at: number): Stroke[] => [
    { d: [gen.polygon([[x + 82, y], [x + 30, y + 84], [x + 72, y + 84], [x + 56, y + 150], [x + 122, y + 58], [x + 80, y + 58], [x + 104, y]], chalk(s))], at, dur: 0.7 },
  ],
  flask: (s: number, x: number, y: number, at: number): Stroke[] => [
    { d: [gen.path(`M${x + 55} ${y + 8} V${y + 58} L${x + 18} ${y + 132} Q${x + 12} ${y + 146} ${x + 28} ${y + 146} H${x + 122} Q${x + 138} ${y + 146} ${x + 132} ${y + 132} L${x + 95} ${y + 58} V${y + 8}`, chalk(s))], at, dur: 0.6 },
    { d: [gen.line(x + 45, y + 8, x + 105, y + 8, chalk(s)), gen.line(x + 36, y + 104, x + 114, y + 104, chalk(s))], at: at + 0.45, dur: 0.25 },
  ],
  check: (s: number, x: number, y: number, at: number): Stroke[] => [
    { d: [gen.circle(x + 75, y + 75, 140, chalk(s))], at, dur: 0.5 },
    { d: [gen.linearPath([[x + 40, y + 78], [x + 66, y + 104], [x + 112, y + 50]], chalk(s, { strokeWidth: 7 }))], at: at + 0.35, dur: 0.3 },
  ],
  cross: (s: number, x: number, y: number, at: number): Stroke[] => [
    { d: [gen.circle(x + 75, y + 75, 140, chalk(s))], at, dur: 0.5 },
    { d: [gen.line(x + 48, y + 48, x + 102, y + 102, chalk(s, { strokeWidth: 7 })), gen.line(x + 102, y + 48, x + 48, y + 102, chalk(s, { strokeWidth: 7 }))], at: at + 0.35, dur: 0.3 },
  ],
};

/** Ink icons for the clay tiles (black line, white-filled shapes). */
export const TILE_ICONS = {
  cap: (s: number, cx: number, cy: number, at: number): Stroke[] => [
    { d: [gen.polygon([[cx, cy - 22], [cx + 50, cy], [cx, cy + 22], [cx - 50, cy]], ink(s, { fill: "#fff", fillStyle: "solid" }))], at, dur: 0.4 },
    { d: [gen.path(`M${cx - 30} ${cy + 10} V${cy + 43} Q${cx} ${cy + 63} ${cx + 30} ${cy + 43} V${cy + 10}`, ink(s)), gen.line(cx + 50, cy, cx + 50, cy + 38, ink(s))], at: at + 0.25, dur: 0.35 },
  ],
  laptop: (s: number, cx: number, cy: number, at: number): Stroke[] => [
    { d: [gen.rectangle(cx - 43, cy - 41, 86, 58, ink(s, { fill: "#fff", fillStyle: "solid" }))], at, dur: 0.4 },
    { d: [gen.path(`M${cx - 57} ${cy + 29} L${cx + 57} ${cy + 29} L${cx + 47} ${cy + 43} L${cx - 47} ${cy + 43} Z`, ink(s, { fill: "#fff", fillStyle: "solid" }))], at: at + 0.25, dur: 0.3 },
    { d: [gen.path(`M${cx - 10} ${cy - 23} L${cx - 17} ${cy - 12} L${cx - 10} ${cy - 1} M${cx + 10} ${cy - 23} L${cx + 17} ${cy - 12} L${cx + 10} ${cy - 1}`, ink(s))], at: at + 0.4, dur: 0.25 },
  ],
};

/** Text width with the same font the DOM uses (fonts are loaded before render via loadFont). */
let ctx: CanvasRenderingContext2D | null = null;
export const textWidth = (text: string, font: string) => {
  ctx = ctx ?? document.createElement("canvas").getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
};
