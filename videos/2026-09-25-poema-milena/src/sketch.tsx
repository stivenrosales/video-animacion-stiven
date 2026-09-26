import React from "react";
import { random, useCurrentFrame } from "remotion";
import { loadFont as loadKalam } from "@remotion/google-fonts/Kalam";
import { W, H } from "./kz";

export const kalam = loadKalam("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;

/** Hand-drawn palette sampled from the reference: paper, ink, terracotta, dusk and neon streaks. */
export const S = {
  paper: "#ECE8DF",
  paperDark: "#DCD6C9",
  ink: "#2B1B1E",
  night: "#0D0B24",
  night2: "#1C1848",
  terracotta: "#D9774E",
  sand: "#F2B34B",
  gold: "#FFD46B",
  peach: "#F7C39A",
  dusk: "#6E3F8F",
  pink: "#F06FA8",
  violet: "#9A6BFF",
  cyan: "#4FD3E6",
  lime: "#8FE06B",
  silhouette: "#1A1220",
  rainbow: ["#FF5A5A", "#FF9F3D", "#FFD84D", "#6BE07A", "#4FB7FF", "#9A6BFF"],
};

/** Frame counter quantized to "twos": hand-drawn animation redraws every other frame. */
export const useStep = () => Math.floor(useCurrentFrame() / 2);

/** Shared SVG defs: line-boil filter (seed changes every 2 frames), paper grain and hatch patterns. */
export const SketchDefs: React.FC<{ step: number; id: string; boil?: number }> = ({ step, id, boil = 5 }) => (
  <defs>
    <filter id={`boil-${id}`} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={step % 6} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={boil} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id={`grain-${id}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={step % 3} />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
    </filter>
    <pattern id={`hatch-${id}`} patternUnits="userSpaceOnUse" width={13} height={13} patternTransform="rotate(38)">
      <line x1={0} y1={0} x2={0} y2={13} stroke={S.ink} strokeOpacity={0.28} strokeWidth={2.2} />
    </pattern>
    <pattern id={`hatchx-${id}`} patternUnits="userSpaceOnUse" width={15} height={15} patternTransform="rotate(-24)">
      <line x1={0} y1={0} x2={0} y2={15} stroke={S.ink} strokeOpacity={0.22} strokeWidth={2} />
      <line x1={0} y1={7} x2={15} y2={7} stroke={S.ink} strokeOpacity={0.12} strokeWidth={1.6} />
    </pattern>
    <pattern id={`hatchl-${id}`} patternUnits="userSpaceOnUse" width={12} height={12} patternTransform="rotate(40)">
      <line x1={0} y1={0} x2={0} y2={12} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={2} />
    </pattern>
  </defs>
);

/** Background: cream paper or dark night, both with grain and faint pencil scratches that re-draw on twos. */
export const Ground: React.FC<{ id: string; step: number; kind: "paper" | "night" | "dusk"; top?: string; bottom?: string }> = ({
  id,
  step,
  kind,
  top,
  bottom,
}) => {
  const [a, b] =
    kind === "paper" ? [S.paper, "#E4DFD3"] : kind === "night" ? [top ?? S.night, bottom ?? S.night2] : [top ?? S.dusk, bottom ?? S.peach];
  const scratch = kind === "paper" ? "rgba(43,27,30,0.10)" : "rgba(255,255,255,0.07)";
  const s = Math.floor(step / 3);
  return (
    <g>
      <defs>
        <linearGradient id={`bgg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect x={-500} y={-500} width={W + 1000} height={H + 1000} fill={`url(#bgg-${id})`} />
      <rect x={-500} y={-500} width={W + 1000} height={H + 1000} filter={`url(#grain-${id})`} opacity={kind === "paper" ? 0.22 : 0.3} />
      {Array.from({ length: kind === "paper" ? 26 : 60 }).map((_, i) => {
        const x = random(`${id}sx${i}-${s}`) * W;
        const y = random(`${id}sy${i}-${s}`) * H;
        const len = kind === "paper" ? 60 + random(`${id}sl${i}`) * 200 : 14 + random(`${id}sl${i}`) * 30;
        const ang = kind === "paper" ? random(`${id}sa${i}-${s}`) * 180 : 62;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + Math.cos((ang * Math.PI) / 180) * len}
            y2={y + Math.sin((ang * Math.PI) / 180) * len}
            stroke={scratch}
            strokeWidth={kind === "paper" ? 1.4 : 2}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

/** 4-point sparkle, as in the reference highlights. */
export const Spark: React.FC<{ x: number; y: number; s: number; color?: string; opacity?: number }> = ({ x, y, s, color = S.gold, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <circle r={16} fill={color} opacity={0.25} />
    <path d="M 0 -18 Q 2 -2 18 0 Q 2 2 0 18 Q -2 2 -18 0 Q -2 -2 0 -18 Z" fill="#FFF7DA" />
  </g>
);

/** Soft glow halo. */
export const Halo: React.FC<{ x: number; y: number; r: number; color: string; id: string; opacity?: number }> = ({ x, y, r, color, id, opacity = 1 }) => (
  <>
    <defs>
      <radialGradient id={`halo-${id}`}>
        <stop offset="0" stopColor={color} stopOpacity={0.75 * opacity} />
        <stop offset="0.4" stopColor={color} stopOpacity={0.25 * opacity} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#halo-${id})`} />
  </>
);

/** Ring built from many short colored-pencil streaks (accretion-disk / rainbow texture). */
export const StreakRing: React.FC<{
  cx: number;
  cy: number;
  r: number;
  width: number;
  seed: string;
  colors?: string[];
  count?: number;
  rot?: number;
  squash?: number;
  arc?: number;
  opacity?: number;
}> = ({ cx, cy, r, width, seed, colors = [S.gold, S.sand, S.terracotta, S.pink], count = 160, rot = 0, squash = 1, arc = 360, opacity = 1 }) => (
  <g transform={`translate(${cx} ${cy}) scale(1 ${squash})`} opacity={opacity}>
    {Array.from({ length: count }).map((_, i) => {
      const a0 = ((random(`${seed}a${i}`) * arc + rot) * Math.PI) / 180;
      const len = (0.08 + random(`${seed}l${i}`) * 0.22) * (arc / 360) * 2;
      const rr = r + (random(`${seed}r${i}`) - 0.5) * width;
      const a1 = a0 + len * (40 / Math.max(rr, 40));
      const large = a1 - a0 > Math.PI ? 1 : 0;
      return (
        <path
          key={i}
          d={`M ${Math.cos(a0) * rr} ${Math.sin(a0) * rr} A ${rr} ${rr} 0 ${large} 1 ${Math.cos(a1) * rr} ${Math.sin(a1) * rr}`}
          stroke={colors[i % colors.length]}
          strokeWidth={3 + random(`${seed}w${i}`) * 5}
          strokeLinecap="round"
          fill="none"
          opacity={0.55 + random(`${seed}o${i}`) * 0.45}
        />
      );
    })}
  </g>
);

/** Faint construction guides: circle + crosshair, like the sketch left under the drawing. */
export const Guides: React.FC<{ x: number; y: number; r: number; light?: boolean; opacity?: number }> = ({ x, y, r, light, opacity = 1 }) => {
  const c = light ? "rgba(255,255,255,0.22)" : "rgba(43,27,30,0.18)";
  return (
    <g opacity={opacity} fill="none" stroke={c} strokeWidth={1.6}>
      <circle cx={x} cy={y} r={r} />
      <circle cx={x} cy={y} r={r * 1.25} strokeDasharray="6 10" />
      <line x1={x - r * 1.4} y1={y} x2={x + r * 1.4} y2={y} />
      <line x1={x} y1={y - r * 1.4} x2={x} y2={y + r * 1.4} />
    </g>
  );
};

/** Radiating speed / focus lines. */
export const Rays: React.FC<{ x: number; y: number; inner: number; outer: number; n?: number; seed: string; color?: string; opacity?: number }> = ({
  x,
  y,
  inner,
  outer,
  n = 40,
  seed,
  color = "rgba(43,27,30,0.35)",
  opacity = 1,
}) => (
  <g opacity={opacity}>
    {Array.from({ length: n }).map((_, i) => {
      const a = random(`${seed}${i}`) * Math.PI * 2;
      const r0 = inner + random(`${seed}i${i}`) * 60;
      const r1 = outer * (0.7 + random(`${seed}o${i}`) * 0.3);
      return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={color} strokeWidth={2} strokeLinecap="round" />;
    })}
  </g>
);

/** Person silhouette. Feet at (0,0), ~360 tall at s=1. `hair`: short (him) or long (her, with a dress). */
export const Silhouette: React.FC<{
  x: number;
  y: number;
  s?: number;
  hair?: "short" | "long";
  armL?: number;
  armR?: number;
  step?: number;
  flip?: boolean;
  rim?: string;
  color?: string;
  walk?: number;
}> = ({ x, y, s = 1, hair = "short", armL = 8, armR = -8, step = 0, flip, rim, color = S.silhouette, walk = 0 }) => {
  const sway = walk ? Math.sin(step * 0.9) * 10 * walk : 0;
  const body = (fill: string, dx = 0, dy = 0) => (
    <g transform={`translate(${dx} ${dy})`} fill={fill} stroke={fill}>
      {hair === "long" ? (
        <path d="M -34 -150 Q -40 -80 -70 -2 Q 0 10 70 -2 Q 40 -80 34 -150 Z" strokeWidth={4} strokeLinejoin="round" />
      ) : (
        <>
          <path d={`M -26 -140 L ${-24 - sway} 0 L ${-6 - sway} 0 L -2 -120 Z`} strokeWidth={10} strokeLinejoin="round" />
          <path d={`M 26 -140 L ${24 + sway} 0 L ${6 + sway} 0 L 2 -120 Z`} strokeWidth={10} strokeLinejoin="round" />
        </>
      )}
      <path d="M -44 -250 Q -48 -170 -30 -130 H 30 Q 48 -170 44 -250 Q 0 -266 -44 -250 Z" strokeWidth={4} strokeLinejoin="round" />
      <line x1={-40} y1={-240} x2={-40 + Math.sin((armL * Math.PI) / 180) * 120} y2={-240 + Math.cos((armL * Math.PI) / 180) * 120} strokeWidth={24} strokeLinecap="round" />
      <line x1={40} y1={-240} x2={40 + Math.sin((armR * Math.PI) / 180) * 120} y2={-240 + Math.cos((armR * Math.PI) / 180) * 120} strokeWidth={24} strokeLinecap="round" />
      <rect x={-12} y={-282} width={24} height={36} rx={8} strokeWidth={0} />
      <circle cx={0} cy={-312} r={40} strokeWidth={0} />
      {hair === "long" ? (
        <>
          <circle cx={0} cy={-318} r={46} strokeWidth={0} />
          <rect x={-44} y={-320} width={88} height={96} rx={20} strokeWidth={0} />
          <path d="M -46 -320 Q -58 -250 -40 -196 Q -20 -206 -18 -250 L -30 -300 Z" strokeWidth={4} strokeLinejoin="round" />
          <path d="M 46 -320 Q 60 -250 44 -196 Q 24 -206 20 -250 L 30 -300 Z" strokeWidth={4} strokeLinejoin="round" />
          <circle cx={30} cy={-356} r={16} strokeWidth={0} />
        </>
      ) : (
        <path d="M -42 -318 Q -40 -364 6 -360 Q 46 -356 42 -316 Q 20 -334 -6 -330 Q -30 -326 -42 -318 Z" strokeWidth={4} strokeLinejoin="round" />
      )}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={70} ry={10} fill={S.ink} opacity={0.25} />
      {rim && body(rim, -4, -3)}
      {body(color)}
    </g>
  );
};

/** Hand-drawn heart outline with a light fill. */
export const InkHeart: React.FC<{ x: number; y: number; s: number; fill?: string; opacity?: number }> = ({ x, y, s, fill = S.pink, opacity = 1 }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M 0 14 C -26 -4 -24 -26 -9 -26 C -2 -26 0 -18 0 -16 C 0 -18 2 -26 9 -26 C 24 -26 26 -4 0 14 Z"
    fill={fill}
    stroke={S.ink}
    strokeWidth={3 / s}
    strokeLinejoin="round"
    opacity={opacity}
  />
);
