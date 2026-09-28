/** Hand-drawn strokes with rough.js (Excalidraw's engine), revealed like a pen. Seeded, so every frame is identical. */
import React, { useMemo } from "react";
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import { ease } from "./ali";

const gen = rough.generator();
type Pt = [number, number];

export type Shape =
  | { kind: "curve"; pts: Pt[] }
  | { kind: "line"; a: Pt; b: Pt }
  | { kind: "ellipse"; cx: number; cy: number; w: number; h: number }
  | { kind: "arrow"; pts: Pt[]; head?: number };

const drawables = (s: Shape, o: Options) => {
  if (s.kind === "curve") return [gen.curve(s.pts, o)];
  if (s.kind === "line") return [gen.line(...s.a, ...s.b, o)];
  if (s.kind === "ellipse") return [gen.ellipse(s.cx, s.cy, s.w, s.h, o)];
  const [a, b] = s.pts.slice(-2);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const L = s.head ?? 30;
  const h1: Pt = [b[0] - L * Math.cos(ang - 0.5), b[1] - L * Math.sin(ang - 0.5)];
  const h2: Pt = [b[0] - L * Math.cos(ang + 0.5), b[1] - L * Math.sin(ang + 0.5)];
  return [s.pts.length > 2 ? gen.curve(s.pts, o) : gen.line(...a, ...b, o), gen.linearPath([h1, b, h2], { ...o, seed: (o.seed ?? 1) + 1 })];
};

/**
 * One rough stroke drawn from `at` over `dur` seconds. rough.js emits two passes per stroke;
 * the second trails the first a little, which is what makes it read as a real marker.
 */
export const Rough: React.FC<{
  t: number;
  at: number;
  shape: Shape;
  color: string;
  width?: number;
  dur?: number;
  roughness?: number;
  seed?: number;
}> = ({ t, at, shape, color, width = 6, dur = 0.45, roughness = 1.3, seed = 7 }) => {
  const paths = useMemo(() => {
    const ds = drawables(shape, { stroke: color, strokeWidth: width, roughness, bowing: 1.4, seed });
    // The last drawable of an arrow is its head: it starts when the shaft is done.
    return ds.flatMap((d, di) => gen.toPaths(d).map((p, pi) => ({ d: p.d, head: shape.kind === "arrow" && di === 1, pass: pi })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(shape), color, width, roughness, seed]);
  if (t < at) return null;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.3))" }}>
      {paths.map((p, i) => {
        const start = p.head ? at + dur : at + p.pass * dur * 0.15;
        const pr = ease(t, start, p.head ? 0.15 : dur);
        return (
          <path key={i} d={p.d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - pr} />
        );
      })}
    </svg>
  );
};
