import React from "react";
import { random, spring, useCurrentFrame } from "remotion";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const nunito = loadNunito("normal", { weights: ["700", "800", "900"], subsets: ["latin"] }).fontFamily;
export const caveat = loadCaveat("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;

/** Kurzgesagt-like palette: deep night blues/purples with glowing warm accents. */
export const K = {
  night: "#0E0B2C",
  navy: "#16124A",
  indigo: "#241B63",
  violet: "#3A2A86",
  purple: "#5B3AA8",
  ocean: "#2F7BFF",
  oceanDark: "#1F56C9",
  land: "#46D39A",
  landDark: "#2FA478",
  sun: "#FFD34E",
  orange: "#FF8A3D",
  coral: "#FF5E6C",
  pink: "#FF7AA8",
  teal: "#39D7CF",
  cream: "#FFF1D6",
  white: "#FFFFFF",
  wood: "#B9744A",
  woodDark: "#8A4F32",
};

export const useT = () => useCurrentFrame() / FPS;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const pop = (t: number, at: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  t < at ? 0 : spring({ frame: (t - at) * FPS, fps: FPS, config: { damping: 13, stiffness: 150, mass: 0.8, ...cfg } });

/** Radial glow as a gradient circle (cheaper and softer than blur filters). */
export const Glow: React.FC<{ cx: number; cy: number; r: number; color: string; opacity?: number; id: string }> = ({
  cx,
  cy,
  r,
  color,
  opacity = 1,
  id,
}) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0" stopColor={color} stopOpacity={0.9 * opacity} />
        <stop offset="0.35" stopColor={color} stopOpacity={0.35 * opacity} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
  </>
);

/** Mix a hex color toward black (amt<0) or white (amt>0). */
export const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt),
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

/** 4-point sparkle star. */
export const Sparkle: React.FC<{ x: number; y: number; s: number; color?: string; opacity?: number }> = ({ x, y, s, color = "#C9D4FF", opacity = 1 }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M 0 -12 Q 1.2 -1.2 12 0 Q 1.2 1.2 0 12 Q -1.2 1.2 -12 0 Q -1.2 -1.2 0 -12 Z"
    fill={color}
    opacity={opacity}
  />
);

/** Kurzgesagt starfield: blue/violet dots in clusters plus twinkling 4-point sparkles. */
export const Stars: React.FC<{ t: number; count?: number; seed?: string; drift?: number; driftY?: number }> = ({
  t,
  count = 140,
  seed = "s",
  drift = 0,
  driftY = 0,
}) => {
  const tint = ["#FFFFFF", "#8FA6FF", "#A98BFF", "#6F86E8", "#C7B3FF"];
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const depth = 0.3 + random(`${seed}d${i}`) * 0.7;
        const cluster = i % 4 === 0;
        const bx = random(`${seed}x${i}`) * W;
        const by = random(`${seed}y${i}`) * H;
        const x = (((cluster ? bx : bx) + drift * depth) % W + W) % W;
        const y = ((by + driftY * depth) % H + H) % H;
        const tw = 0.55 + 0.45 * Math.sin(t * (1.5 + random(`${seed}f${i}`) * 3) + i);
        const big = random(`${seed}r${i}`);
        if (big > 0.955) {
          return <Sparkle key={i} x={x} y={y} s={0.9 + depth * 1.3} opacity={tw} color={tint[i % 2 ? 0 : 1]} />;
        }
        const r = depth * (big > 0.8 ? 5 : 2.4);
        return <circle key={i} cx={x} cy={y} r={r} fill={tint[i % tint.length]} opacity={(0.35 + 0.65 * tw) * depth} />;
      })}
    </g>
  );
};

/** Capsule helper used for continents, clouds and gas-giant bands. */
const Pill: React.FC<{ x: number; y: number; w: number; h: number; fill: string; opacity?: number }> = ({ x, y, w, h, fill, opacity = 1 }) => (
  <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={fill} opacity={opacity} />
);

/** Classic Kurzgesagt Earth: split-shaded disc, pill continents and clouds, dark ring, stepped halos. */
export const Planet: React.FC<{ cx: number; cy: number; r: number; t: number; id: string; spin?: number; glow?: string }> = ({
  cx,
  cy,
  r,
  t,
  id,
  spin = 18,
  glow = "#2A55C9",
}) => {
  const span = r * 3.4;
  const wrap = (u: number, speed: number) => cx - r * 1.7 + ((((u * r - t * speed) % span) + span) % span);
  const lands: Array<[number, number, number, number]> = [
    [0.0, -0.42, 0.7, 0.2],
    [0.55, 0.02, 1.0, 0.3],
    [0.35, 0.36, 0.55, 0.2],
    [1.5, -0.18, 0.8, 0.24],
    [1.75, 0.42, 0.5, 0.18],
    [2.5, -0.55, 0.45, 0.16],
    [2.8, 0.15, 0.7, 0.22],
  ];
  const clouds: Array<[number, number, number, number]> = [
    [0.3, -0.62, 0.42, 0.12],
    [0.9, 0.22, 0.5, 0.14],
    [1.0, 0.36, 0.34, 0.12],
    [1.9, -0.35, 0.45, 0.13],
    [2.6, 0.55, 0.5, 0.14],
    [3.0, -0.1, 0.3, 0.11],
  ];
  return (
    <g>
      {[1.85, 1.6, 1.4, 1.22].map((k, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * k} fill={glow} opacity={0.12 + i * 0.05} />
      ))}
      <circle cx={cx} cy={cy} r={r * 1.07} fill="#0A1238" />
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="#2F9BE0" />
        {lands.map(([u, y, w, h], i) => (
          <Pill key={`l${i}`} x={wrap(u, spin)} y={cy + y * r} w={w * r} h={h * r} fill="#4CD467" />
        ))}
        {clouds.map(([u, y, w, h], i) => (
          <Pill key={`c${i}`} x={wrap(u, spin * 1.6)} y={cy + y * r} w={w * r} h={h * r} fill="#FFFFFF" />
        ))}
        <rect x={cx} y={cy - r} width={r} height={r * 2} fill="#0B1E6B" opacity={0.3} />
      </g>
    </g>
  );
};

/** Moon / rocky planetoid: crescent shadow and ring craters. */
export const Moon: React.FC<{ cx: number; cy: number; r: number; color?: string; id: string }> = ({ cx, cy, r, color = "#8C86C9", id }) => (
  <g>
    <circle cx={cx} cy={cy} r={r * 1.35} fill={color} opacity={0.12} />
    <defs>
      <clipPath id={`${id}-m`}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={color} />
    <g clipPath={`url(#${id}-m)`}>
      {[[-0.35, -0.3, 0.22], [0.25, 0.1, 0.16], [-0.1, 0.45, 0.12], [0.45, -0.45, 0.1]].map(([x, y, k], i) => (
        <circle key={i} cx={cx + x * r} cy={cy + y * r} r={k * r} fill="none" stroke={shade(color, -0.25)} strokeWidth={r * 0.05} />
      ))}
      <circle cx={cx + r * 0.55} cy={cy + r * 0.3} r={r * 1.05} fill="#0A1238" opacity={0.35} />
    </g>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={shade(color, 0.35)} strokeWidth={r * 0.04} opacity={0.7} />
  </g>
);

/** Banded gas giant (foreground depth element, usually cropped by the frame). */
export const GasGiant: React.FC<{ cx: number; cy: number; r: number; t: number; id: string; base?: string; band?: string }> = ({
  cx,
  cy,
  r,
  t,
  id,
  base = "#F7A13C",
  band = "#E0503E",
}) => (
  <g>
    <circle cx={cx} cy={cy} r={r * 1.08} fill={base} opacity={0.25} />
    <defs>
      <clipPath id={`${id}-g`}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={base} />
    <g clipPath={`url(#${id}-g)`} transform={`rotate(-25 ${cx} ${cy})`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Pill key={i} x={cx - r + ((i * 173 + t * 30) % (r * 2.4))} y={cy - r + i * r * 0.24} w={r * (0.5 + (i % 3) * 0.3)} h={r * 0.13} fill={i % 2 ? band : shade(base, 0.3)} opacity={0.9} />
      ))}
      <circle cx={cx + r * 0.5} cy={cy + r * 0.35} r={r * 1.02} fill="#2A0F3A" opacity={0.3} />
    </g>
  </g>
);

/** Sun with bubbling rim, surface spots and soft rays. */
export const Sun: React.FC<{ cx: number; cy: number; r: number; t: number; id: string }> = ({ cx, cy, r, t, id }) => (
  <g>
    {Array.from({ length: 16 }).map((_, i) => {
      const a = (i / 16) * 360 + t * 6;
      return <path key={`ray${i}`} d={`M 0 ${-r * 0.2} L ${r * 1.9} 0 L 0 ${r * 0.2} Z`} fill="#FFB03A" opacity={0.12} transform={`translate(${cx} ${cy}) rotate(${a})`} />;
    })}
    <Glow cx={cx} cy={cy} r={r * 2.2} color="#FF8A2A" id={`${id}-sg`} />
    {Array.from({ length: 34 }).map((_, i) => {
      const a = (i / 34) * Math.PI * 2;
      const wob = 1 + 0.05 * Math.sin(t * 4 + i * 1.7);
      return <circle key={i} cx={cx + Math.cos(a) * r * wob} cy={cy + Math.sin(a) * r * wob} r={r * (0.06 + 0.03 * ((i * 7) % 3))} fill="#FF9A2E" />;
    })}
    <circle cx={cx} cy={cy} r={r} fill="#FFB52E" />
    <circle cx={cx - r * 0.1} cy={cy - r * 0.1} r={r * 0.85} fill="#FFD23F" />
    {[[-0.3, -0.25, 0.14], [0.35, 0.2, 0.1], [0.05, 0.5, 0.08], [0.5, -0.35, 0.07]].map(([x, y, k], i) => (
      <circle key={i} cx={cx + x * r} cy={cy + y * r} r={k * r} fill="none" stroke="#F08A22" strokeWidth={r * 0.035} />
    ))}
    <circle cx={cx + r * 0.3} cy={cy - r * 0.4} r={r * 0.07} fill="#FFF3B0" />
  </g>
);

/** Glowing comet with a tapered tail pointing away from its direction of travel. */
export const Comet: React.FC<{ x: number; y: number; angle: number; len: number; size: number; id: string; heat?: number }> = ({
  x,
  y,
  angle,
  len,
  size,
  id,
  heat = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <defs>
      <linearGradient id={`${id}-tail`} x1="0" x2="1">
        <stop offset="0" stopColor={K.sun} stopOpacity={0.95} />
        <stop offset="0.4" stopColor={K.orange} stopOpacity={0.55} />
        <stop offset="1" stopColor={K.coral} stopOpacity={0} />
      </linearGradient>
    </defs>
    <Glow cx={0} cy={0} r={size * 4 * heat} color={K.orange} id={`${id}-g`} />
    <path d={`M 0 ${-size} L ${len} ${-size * 0.15} L ${len} ${size * 0.15} L 0 ${size} Z`} fill={`url(#${id}-tail)`} />
    <circle r={size} fill={K.cream} />
    <circle r={size * 0.6} fill={K.white} />
  </g>
);

/** Kurzgesagt-style person: brows, oval eyes with highlights, nose, mouth, ear, two-tone clothes, curly or short hair. */
export const Figure: React.FC<{
  x: number;
  y: number;
  s?: number;
  color: string;
  skin?: string;
  t: number;
  armL?: number;
  armR?: number;
  look?: number;
  bounce?: number;
  hair?: string;
  curly?: boolean;
  mouth?: "smile" | "open";
  flip?: boolean;
}> = ({ x, y, s = 1, color, skin = "#E8873A", t, armL = 20, armR = -20, look = 0, bounce = 1, hair = "#2A1E4A", curly, mouth = "smile", flip }) => {
  const b = Math.abs(Math.sin(t * 3.2 + x)) * 6 * bounce;
  const skinD = shade(skin, -0.22);
  const brow = shade(skin, -0.45);
  const pants = shade(color, -0.45);
  const blink = (t * 0.7 + x * 0.01) % 3.2 < 0.09 ? 0.15 : 1;
  const lx = look * 7;
  const Arm = ({ side, rot }: { side: -1 | 1; rot: number }) => (
    <g transform={`rotate(${rot} ${side * 38} -140)`}>
      <rect x={side * 38 - 12} y={-146} width={24} height={82} rx={12} fill={side > 0 ? shade(color, -0.15) : color} />
      <circle cx={side * 38} cy={-60} r={13} fill={skin} />
      <circle cx={side * 38 - side * 11} cy={-66} r={6} fill={skin} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y - b}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={b + 4} rx={50} ry={11} fill="#0A0830" opacity={0.25} />
      <rect x={-26} y={-66} width={22} height={66} rx={10} fill={pants} />
      <rect x={4} y={-66} width={22} height={66} rx={10} fill={shade(pants, -0.15)} />
      <ellipse cx={-15} cy={-2} rx={16} ry={8} fill="#1B1740" />
      <ellipse cx={15} cy={-2} rx={16} ry={8} fill="#1B1740" />
      {curly && <circle cx={0} cy={-214} r={56} fill={hair} />}
      {curly && [[-48, -186, 22], [48, -186, 22], [-40, -160, 16], [40, -160, 16]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={hair} />)}
      <Arm side={-1} rot={armL} />
      <path d="M -42 -150 Q -46 -70 -36 -60 H 36 Q 46 -70 42 -150 Q 0 -166 -42 -150 Z" fill={color} />
      <path d="M 4 -160 Q 26 -158 42 -150 Q 46 -70 36 -60 H 4 Z" fill="#0A0830" opacity={0.16} />
      <path d="M -12 -158 L 0 -140 L 12 -158 Z" fill={shade(color, 0.35)} />
      <Arm side={1} rot={armR} />
      <rect x={-11} y={-176} width={22} height={24} rx={6} fill={skinD} />
      <circle cx={-36 + lx * 0.3} cy={-206} r={10} fill={skinD} />
      <ellipse cx={lx * 0.4} cy={-210} rx={40} ry={44} fill={skin} />
      {curly ? (
        [[-34, -238, 20], [-12, -252, 22], [14, -252, 22], [36, -238, 20], [46, -214, 16]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={hair} />)
      ) : (
        <path d="M -42 -212 C -46 -262 46 -266 42 -214 C 30 -236 0 -242 -26 -232 C -32 -226 -38 -220 -42 -212 Z" fill={hair} />
      )}
      <rect x={-24 + lx} y={-228} width={18} height={6} rx={3} fill={brow} />
      <rect x={8 + lx} y={-228} width={18} height={6} rx={3} fill={brow} />
      <g transform={`translate(0 -208) scale(1 ${blink}) translate(0 208)`}>
        <ellipse cx={-14 + lx} cy={-208} rx={7} ry={9} fill="#1A2150" />
        <ellipse cx={16 + lx} cy={-208} rx={7} ry={9} fill="#1A2150" />
        <circle cx={-12 + lx} cy={-211} r={2.5} fill="#FFFFFF" />
        <circle cx={18 + lx} cy={-211} r={2.5} fill="#FFFFFF" />
      </g>
      <ellipse cx={2 + lx * 1.3} cy={-194} rx={6} ry={5} fill={skinD} />
      <circle cx={-24 + lx} cy={-190} r={7} fill="#FF6F7D" opacity={0.25} />
      <circle cx={26 + lx} cy={-190} r={7} fill="#FF6F7D" opacity={0.25} />
      {mouth === "open" ? (
        <g>
          <ellipse cx={1 + lx} cy={-180} rx={9} ry={7} fill="#6B1A2E" />
          <ellipse cx={1 + lx} cy={-176} rx={5} ry={3} fill="#E0566B" />
        </g>
      ) : (
        <path d={`M ${-8 + lx} -182 Q ${1 + lx} -174 ${10 + lx} -182`} stroke="#6B1A2E" strokeWidth={4} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

export const Heart: React.FC<{ x: number; y: number; s: number; color?: string; opacity?: number }> = ({
  x,
  y,
  s,
  color = K.pink,
  opacity = 1,
}) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M 0 12 C -22 -4 -20 -22 -8 -22 C -2 -22 0 -16 0 -14 C 0 -16 2 -22 8 -22 C 20 -22 22 -4 0 12 Z"
    fill={color}
    opacity={opacity}
  />
);

/** Clock face; `melt` 0..1 stretches the lower half into drips. */
export const Clock: React.FC<{ x: number; y: number; r: number; t: number; speed?: number; melt?: number; color?: string; rot?: number }> = ({
  x,
  y,
  r,
  t,
  speed = 1,
  melt = 0,
  color = K.cream,
  rot = 0,
}) => {
  const d = melt * r * 1.6;
  const face = `M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 C ${r} ${r * 0.6 + d * 0.3} ${r * 0.55} ${r + d} ${r * 0.3} ${r + d * 1.1}
    C ${r * 0.15} ${r + d * 1.3} ${r * 0.05} ${r + d * 0.5} ${-r * 0.1} ${r + d * 0.6}
    C ${-r * 0.3} ${r + d * 0.8} ${-r * 0.45} ${r + d * 1.4} ${-r * 0.6} ${r * 0.9 + d * 0.7}
    C ${-r * 0.85} ${r * 0.7 + d * 0.3} ${-r} ${r * 0.5} ${-r} 0 Z`;
  const a = t * 360 * 0.12 * speed;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={face} fill={K.woodDark} transform="translate(8 10)" opacity={0.35} />
      <path d={face} fill={color} stroke={K.orange} strokeWidth={r * 0.08} />
      {Array.from({ length: 12 }).map((_, i) => {
        const an = (i / 12) * Math.PI * 2;
        return (
          <circle key={i} cx={Math.cos(an) * r * 0.78} cy={Math.sin(an) * r * 0.78 * (an > 0 && an < Math.PI ? 1 + melt * 0.8 : 1)} r={r * 0.045} fill={K.indigo} />
        );
      })}
      <line x1={0} y1={0} x2={0} y2={-r * 0.45} stroke={K.indigo} strokeWidth={r * 0.08} strokeLinecap="round" transform={`rotate(${a / 12})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.68} stroke={K.coral} strokeWidth={r * 0.05} strokeLinecap="round" transform={`rotate(${a})`} />
      <circle r={r * 0.07} fill={K.indigo} />
    </g>
  );
};

/** Burst of particles radiating from a point, driven by 0..1 progress. */
export const Burst: React.FC<{ x: number; y: number; p: number; n?: number; radius?: number; colors?: string[]; seed: string; size?: number }> = ({
  x,
  y,
  p,
  n = 24,
  radius = 260,
  colors = [K.sun, K.orange, K.pink, K.teal],
  seed,
  size = 10,
}) => {
  if (p <= 0 || p >= 1) return null;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const dist = radius * (0.4 + random(`${seed}r${i}`) * 0.6) * ease(p);
        return (
          <circle
            key={i}
            cx={x + Math.cos(a) * dist}
            cy={y + Math.sin(a) * dist + p * p * 80}
            r={size * (0.5 + random(`${seed}s${i}`)) * (1 - p)}
            fill={colors[i % colors.length]}
          />
        );
      })}
    </g>
  );
};
