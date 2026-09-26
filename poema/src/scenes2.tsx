import React from "react";
import { random, useCurrentFrame } from "remotion";
import { FPS, H, W, ease, lerp, pop, prog } from "./kz";
import { Ground, Guides, Halo, InkHeart, Rays, S, Silhouette, SketchDefs, Spark, StreakRing, kalam } from "./sketch";

type Kind = "paper" | "night" | "dusk";

/** Scene wrapper: zoom-through transition, textured ground and line-boil on the drawing layer. */
const Shell: React.FC<{
  id: string;
  start: number;
  end: number;
  kind: Kind;
  top?: string;
  bottom?: string;
  origin?: [number, number];
  exitZoom?: number;
  children: (t: number, step: number) => React.ReactNode;
}> = ({ id, start, end, kind, top, bottom, origin = [540, 820], exitZoom = 2.2, children }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < start - 0.3 || t > end + 0.4) return null;
  const step = Math.floor(frame / 2);
  const ts = (step * 2) / FPS; // animation on twos
  const inP = ease(prog(t, start - 0.3, start + 0.2));
  const outP = ease(prog(t, end - 0.05, end + 0.4));
  const scale = lerp(0.85, 1, inP) * (1 + 0.06 * prog(t, start, end)) * lerp(1, exitZoom, outP);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inP * (1 - outP) }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: `${origin[0]}px ${origin[1]}px` }}>
        <SketchDefs step={step} id={id} />
        <Ground id={id} step={step} kind={kind} top={top} bottom={bottom} />
        <g filter={`url(#boil-${id})`}>{children(ts, step)}</g>
      </svg>
    </div>
  );
};

const Ink = { stroke: S.ink, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/* Hand-drawn Earth: outlined disc, lumpy continents, swirl clouds, hatched night side. */
const Earth: React.FC<{ cx: number; cy: number; r: number; t: number; id: string; night?: boolean }> = ({ cx, cy, r, t, id }) => {
  const off = (t * 22) % (r * 3);
  const lands = [
    [-0.5, -0.35, 0.42, 0.3],
    [0.3, 0.15, 0.5, 0.35],
    [1.2, -0.45, 0.35, 0.22],
    [1.9, 0.35, 0.45, 0.3],
    [2.5, -0.1, 0.3, 0.25],
  ];
  return (
    <g>
      <Halo x={cx} y={cy} r={r * 1.7} color={S.cyan} id={`${id}-h`} opacity={0.5} />
      <defs>
        <clipPath id={`${id}-c`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#3E8EF0" />
      <g clipPath={`url(#${id}-c)`}>
        {lands.map(([u, v, w, h], i) => {
          const x = cx - r * 1.5 + ((((u + 0.5) * r - off) % (r * 3)) + r * 3) % (r * 3);
          return (
            <g key={i}>
              <path
                d={`M ${x - w * r} ${cy + v * r} q ${w * r * 0.4} ${-h * r} ${w * r} ${-h * r * 0.6} q ${w * r * 0.7} ${h * r * 0.2} ${w * r} ${h * r} q ${-w * r * 0.5} ${h * r * 0.9} ${-w * r} ${h * r * 0.5} q ${-w * r * 0.6} ${-h * r * 0.1} ${-w * r} ${-h * r * 0.9} z`}
                fill={i % 2 ? "#5CC46A" : "#E5B45E"}
                stroke={S.ink}
                strokeWidth={4}
              />
              <path d={`M ${x - w * r * 0.3} ${cy + (v - 0.35) * r} q 30 -26 60 0 q -30 26 -60 0`} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
            </g>
          );
        })}
        <path d={`M ${cx + r * 0.15} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r * 0.15} ${cy + r} Q ${cx + r * 0.45} ${cy} ${cx + r * 0.15} ${cy - r} Z`} fill="#0D0B24" opacity={0.35} />
        <circle cx={cx + r * 0.55} cy={cy} r={r} fill={`url(#hatch-${id})`} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" {...Ink} />
    </g>
  );
};

/* 1 · Letter on paper */
const Letter = () => (
  <Shell id="l" start={0} end={2.0} kind="paper" exitZoom={1}>
    {(t) => {
      const inP = pop(t, 0.02, { damping: 11 });
      const flap = ease(prog(t, 0.35, 0.7));
      const slide = ease(prog(t, 0.55, 1.1));
      const fly = ease(prog(t, 1.55, 2.05));
      const cy = lerp(880, 320, fly);
      const s = lerp(inP, 0.08, fly);
      return (
        <g>
          <Guides x={540} y={880} r={380} opacity={1 - fly} />
          <g transform={`translate(540 ${cy}) scale(${s}) rotate(${lerp(-6, 0, inP) + fly * 25})`}>
            <rect x={-300} y={-180} width={600} height={380} rx={20} fill={S.peach} {...Ink} />
            {flap > 0.5 && <path d={`M -300 -180 L 0 ${lerp(60, -420, flap)} L 300 -180 Z`} fill="#F4D3B4" {...Ink} />}
            <g transform={`translate(0 ${-slide * 300})`}>
              <rect x={-250} y={-200} width={500} height={330} rx={10} fill="#FBF8F0" {...Ink} strokeWidth={5} />
              <text x={-205} y={-110} fontFamily={kalam} fontSize={68} fontWeight={700} fill={S.ink}>
                Querida Milena,
              </text>
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M -205 ${-50 + i * 44} q 60 -8 120 0 t 120 0 t 120 0`} fill="none" stroke={S.ink} strokeOpacity={0.35} strokeWidth={4} strokeDasharray={600} strokeDashoffset={600 * (1 - prog(t, 1.0 + i * 0.12, 1.45 + i * 0.12))} />
              ))}
            </g>
            <path d="M -300 -40 L 0 110 L 300 -40 L 300 200 L -300 200 Z" fill="#F4D3B4" {...Ink} />
            <path d="M -300 -40 L 0 110 L 300 -40 L 300 200 L -300 200 Z" fill={`url(#hatch-l)`} />
            {flap <= 0.5 && <path d={`M -300 -180 L 0 ${lerp(60, -420, flap)} L 300 -180 Z`} fill="#EDBE95" {...Ink} />}
            <circle cx={0} cy={lerp(40, -300, flap)} r={34} fill={S.terracotta} {...Ink} strokeWidth={5} opacity={1 - flap} />
          </g>
          {fly > 0 && <Spark x={540} y={cy} s={lerp(0.2, 2.2, fly)} />}
        </g>
      );
    }}
  </Shell>
);

/* 2 · Earth rises in the dark, a streaky comet crosses */
const Space = () => (
  <Shell id="sp" start={2.0} end={4.3} kind="night" origin={[540, 900]} exitZoom={4}>
    {(t, step) => {
      const rise = ease(prog(t, 1.9, 2.9));
      const c = ease(prog(t, 3.0, 4.2));
      const cx = lerp(1150, 760, c);
      const cy = lerp(160, 380, c);
      return (
        <g>
          <Stars2 seed="sp" step={step} />
          <Guides x={540} y={lerp(1500, 880, rise)} r={330} light opacity={0.8} />
          <Earth cx={540} cy={lerp(1500, 880, rise)} r={280} t={t} id="sp" />
          <g transform={`translate(${cx} ${cy}) rotate(-28)`}>
            {Array.from({ length: 40 }).map((_, i) => (
              <line key={i} x1={20 + random(`ct${i}`) * 40} y1={(random(`cy${i}`) - 0.5) * 30} x2={120 + random(`cl${i}`) * 420} y2={(random(`cy${i}`) - 0.5) * 60} stroke={S.rainbow[i % 3]} strokeWidth={3 + random(`cw${i}`) * 4} strokeLinecap="round" opacity={0.8} />
            ))}
            <Halo x={0} y={0} r={120} color={S.sand} id="spc" />
            <circle r={24} fill="#FFF3C8" {...Ink} strokeWidth={5} />
          </g>
          {t > 3.5 && <Spark x={cx} y={cy} s={1.8 + Math.sin(t * 20) * 0.2} />}
        </g>
      );
    }}
  </Shell>
);

/* Twinkling dots + sparkles for night grounds */
const Stars2: React.FC<{ seed: string; step: number; n?: number }> = ({ seed, step, n = 90 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = random(`${seed}x${i}`) * W;
      const y = random(`${seed}y${i}`) * H;
      const on = random(`${seed}f${i}-${Math.floor(step / 4)}`) > 0.2;
      return random(`${seed}k${i}`) > 0.95 ? (
        <Spark key={i} x={x} y={y} s={0.5} opacity={on ? 1 : 0.4} color={S.violet} />
      ) : (
        <circle key={i} cx={x} cy={y} r={1.5 + random(`${seed}r${i}`) * 2.5} fill="#FFFFFF" opacity={on ? 0.8 : 0.3} />
      );
    })}
  </g>
);

/* Layered hill silhouettes */
const Ridge: React.FC<{ y: number; amp: number; color: string; off: number; seed: string; hatch?: string }> = ({ y, amp, color, off, seed, hatch }) => {
  const pts: string[] = [];
  for (let x = -300; x <= W + 400; x += 60) {
    const xx = x - (off % 360);
    pts.push(`${xx},${y + Math.sin((x + random(seed) * 500) / 140) * amp + Math.sin(x / 47) * amp * 0.25}`);
  }
  const d = `-400,${H} ${pts.join(" ")} ${W + 500},${H}`;
  return (
    <g>
      <polygon points={d} fill={color} stroke={S.ink} strokeWidth={5} strokeLinejoin="round" />
      {hatch && <polygon points={d} fill={`url(#${hatch})`} />}
    </g>
  );
};

/* 3 · Train at dusk */
const Train = () => (
  <Shell id="tr" start={4.3} end={7.15} kind="dusk" top="#5B3A8E" bottom="#F5B98E">
    {(t, step) => {
      const tx = lerp(-900, 1500, ease(prog(t, 4.35, 7.2)));
      return (
        <g>
          <Halo x={760} y={640} r={420} color="#FFE2A8" id="trs" />
          <circle cx={760} cy={640} r={130} fill="#FFE9B8" {...Ink} strokeWidth={5} />
          <Ridge y={920} amp={70} color="#8C4F8F" off={t * 50} seed="r1" hatch="hatch-tr" />
          <Ridge y={1020} amp={45} color="#5E3272" off={t * 140} seed="r2" hatch="hatchx-tr" />
          <line x1={-100} y1={1112} x2={W + 100} y2={1112} {...Ink} strokeWidth={6} />
          <g transform={`translate(${tx} -420) scale(1.3)`}>
            {[0, 1, 2, 3].map((i) => {
              const x = -i * 290;
              return (
                <g key={i}>
                  <rect x={x - 130} y={990} width={265} height={120} rx={18} fill={S.silhouette} {...Ink} strokeWidth={5} />
                  {[0, 1, 2].map((w) => (
                    <g key={w}>
                      <Halo x={x - 72 + w * 80} y={1030} r={55} color={S.gold} id={`trw${i}${w}`} />
                      <rect x={x - 98 + w * 80} y={1010} width={52} height={40} rx={8} fill={S.gold} stroke={S.ink} strokeWidth={3} />
                    </g>
                  ))}
                  {[-75, 75].map((wx) => (
                    <g key={wx} transform={`translate(${x + wx} 1114) rotate(${step * 40})`}>
                      <circle r={24} fill={S.silhouette} {...Ink} strokeWidth={4} />
                      <line x1={-18} y1={0} x2={18} y2={0} stroke={S.gold} strokeWidth={4} />
                    </g>
                  ))}
                </g>
              );
            })}
            {Array.from({ length: 5 }).map((_, k) => {
              const age = (t * 1.3 + k * 0.2) % 1;
              return <circle key={k} cx={120 - age * 280} cy={960 - age * 170} r={18 + age * 44} fill="#F6E7E0" stroke={S.ink} strokeWidth={3} opacity={0.8 * (1 - age)} />;
            })}
            {Array.from({ length: 8 }).map((_, k) => (
              <line key={`m${k}`} x1={-1100 - k * 30} y1={1000 + k * 14} x2={-900 - k * 30 - random(`tm${k}${step % 3}`) * 200} y2={1000 + k * 14} stroke={S.ink} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
            ))}
          </g>
          <Ridge y={1180} amp={24} color={S.silhouette} off={t * 380} seed="r3" />
        </g>
      );
    }}
  </Shell>
);

/* 4 · Vienna skyline silhouettes at dusk */
const Vienna = () => (
  <Shell id="vi" start={7.15} end={9.0} kind="dusk" top="#3C2B78" bottom="#F29A7E" origin={[540, 1050]} exitZoom={3.2}>
    {(t) => {
      const pin = pop(t, 8.2, { damping: 9 });
      const B = [
        [40, 780, 190],
        [240, 840, 140],
        [660, 820, 160],
        [830, 760, 210],
      ];
      return (
        <g>
          <Halo x={540} y={1000} r={640} color="#FFC38A" id="vih" />
          <path d="M 470 1160 V 640 L 540 250 L 610 640 V 1160 Z" fill={S.silhouette} {...Ink} strokeWidth={5} />
          <path d="M 500 700 V 1160 M 580 700 V 1160" stroke="#3A2A5A" strokeWidth={4} />
          <path d="M 120 1160 V 900 A 130 130 0 0 1 380 900 V 1160 Z" fill="#2A1D3A" {...Ink} strokeWidth={5} />
          <line x1={250} y1={770} x2={250} y2={700} {...Ink} strokeWidth={6} />
          {B.map(([x, y, w], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={1160 - y} fill={i % 2 ? "#2A1D3A" : S.silhouette} {...Ink} strokeWidth={5} />
              {Array.from({ length: 6 }).map((_, k) => {
                const on = t > 7.25 + random(`vw${i}${k}`) * 1.3;
                return <rect key={k} x={x + 24 + (k % 2) * (w / 2.2)} y={y + 50 + Math.floor(k / 2) * 100} width={36} height={48} rx={4} fill={on ? S.gold : "#3A2A5A"} stroke={S.ink} strokeWidth={3} />;
              })}
            </g>
          ))}
          <rect x={-400} y={1160} width={W + 800} height={900} fill={S.silhouette} />
          <g transform={`translate(540 ${200 - (1 - pin) * 40}) scale(${pin})`}>
            <path d="M 0 60 C -50 0 -50 -60 0 -60 C 50 -60 50 0 0 60 Z" fill={S.terracotta} {...Ink} strokeWidth={5} />
            <circle cy={-18} r={16} fill={S.paper} {...Ink} strokeWidth={4} />
            <text y={-90} textAnchor="middle" fontFamily={kalam} fontWeight={700} fontSize={60} fill={S.paper} stroke={S.ink} strokeWidth={2}>
              Viena
            </text>
          </g>
        </g>
      );
    }}
  </Shell>
);

/* 5 · The door opens: her silhouette backlit, his hand reaching */
const Door = () => (
  <Shell id="dr" start={9.0} end={11.5} kind="night" top="#16123C" bottom="#2A1F5E">
    {(t, step) => {
      const open = ease(prog(t, 9.15, 9.8));
      const her = pop(t, 9.7, { damping: 12 });
      const reach = ease(prog(t, 9.55, 10.2));
      const doorway = "M 330 1150 V 540 A 210 210 0 0 1 750 540 V 1150 Z";
      return (
        <g>
          <rect x={-400} y={300} width={W + 800} height={900} fill="#2E2360" />
          <rect x={-400} y={300} width={W + 800} height={900} fill="url(#hatchl-dr)" opacity={0.25} />
          <Halo x={540} y={820} r={lerp(200, 720, open)} color={S.gold} id="drg" opacity={open} />
          <path d={doorway} fill={S.silhouette} {...Ink} />
          <defs>
            <clipPath id="dr-way">
              <path d={doorway} />
            </clipPath>
          </defs>
          <g clipPath="url(#dr-way)">
            <rect x={300} y={300} width={500} height={900} fill="#FFE7A8" opacity={open} />
            <Rays x={540} y={760} inner={40} outer={500} n={36} seed="drr" color="rgba(217,119,78,0.55)" opacity={open} />
            <g opacity={her}>
              <Silhouette x={560} y={1140} s={1.15} hair="long" armL={lerp(8, 50, prog(t, 10.8, 11.3))} step={step} />
            </g>
          </g>
          <path d={`M 330 1150 L 330 540 A 210 210 0 0 1 ${lerp(750, 360, open)} ${lerp(540, 340, open)} L ${lerp(750, 360, open)} 1150 Z`} fill={S.terracotta} {...Ink} />
          <path d={`M 330 1150 L 330 540 A 210 210 0 0 1 ${lerp(750, 360, open)} ${lerp(540, 340, open)} L ${lerp(750, 360, open)} 1150 Z`} fill="url(#hatch-dr)" />
          <polygon points={`330,1150 750,1150 ${1050 + open * 200},1520 ${30 - open * 200},1520`} fill="#FFD98A" opacity={open * 0.35} />
          <Silhouette x={200} y={1330} s={1.3} hair="short" armR={lerp(-8, -95, reach)} rim={open > 0.3 ? S.gold : undefined} step={step} />
          {t > 10.1 && <Spark x={430} y={900} s={1.2 + Math.sin(t * 12) * 0.2} />}
        </g>
      );
    }}
  </Shell>
);

/* 6 · Love against a streaky sunset; fear-cloud scribble dissolves; chain snaps */
const Love = () => (
  <Shell id="lv" start={11.5} end={15.1} kind="dusk" top="#6A3A96" bottom="#F7A58C">
    {(t, step) => {
      const cloud = pop(t, 13.4, { damping: 14 });
      const clear = ease(prog(t, 13.85, 14.3));
      const chain = 1 - ease(prog(t, 14.1, 14.35));
      return (
        <g>
          <Halo x={540} y={930} r={560} color="#FFD27A" id="lvs" />
          <StreakRing cx={540} cy={930} r={260} width={90} seed="lvr" colors={[S.gold, S.sand, S.terracotta, S.pink, "#FFF1C2"]} count={220} rot={step * 3} />
          <circle cx={540} cy={930} r={200} fill="#FFE7A8" {...Ink} strokeWidth={5} />
          <Ridge y={1180} amp={10} color={S.silhouette} off={0} seed="lvg" />
          {Array.from({ length: 12 }).map((_, i) => {
            const born = 11.85 + i * 0.15;
            if (t < born) return null;
            const age = (t - born) / 2.4;
            if (age > 1) return null;
            return <InkHeart key={i} x={540 + Math.sin(i * 2.3) * 280} y={1000 - age * 700} s={1.3 + (i % 3) * 0.5} fill={[S.pink, S.terracotta, S.gold][i % 3]} opacity={1 - age} />;
          })}
          <Silhouette x={440} y={1190} s={1.05} hair="short" armR={-70} step={step} />
          <Silhouette x={640} y={1190} s={1.0} hair="long" armL={70} step={step} />
          <g opacity={cloud * (1 - clear)} transform={`translate(540 ${lerp(250, 360, cloud)})`}>
            {Array.from({ length: 26 }).map((_, i) => {
              const a = random(`lc${i}-${step % 4}`) * Math.PI * 2;
              const r = 60 + random(`lcr${i}`) * 90;
              return <path key={i} d={`M ${Math.cos(a) * r - 120} ${Math.sin(a) * r * 0.5} q 60 -${40 + i} 120 0 t 120 0`} fill="none" stroke="#2B1B3E" strokeWidth={10} strokeLinecap="round" />;
            })}
            <path d="M -20 60 L 20 0 L -10 0 L 30 -60" stroke={S.gold} strokeWidth={9} fill="none" strokeLinecap="round" transform="translate(0 70)" />
          </g>
          {chain > 0.01 && (
            <g opacity={chain} transform={`translate(540 1080) scale(${1 + (1 - chain) * 0.4})`}>
              {Array.from({ length: 9 }).map((_, i) => (
                <ellipse key={i} cx={-240 + i * 60} cy={0} rx={38} ry={i % 2 ? 12 : 24} fill="none" stroke="#C9C2D9" strokeWidth={9} />
              ))}
              <rect x={-50} y={-10} width={100} height={84} rx={14} fill={S.sand} {...Ink} strokeWidth={5} />
              <path d="M -30 -10 V -40 A 30 30 0 0 1 30 -40 V -10" fill="none" {...Ink} strokeWidth={9} />
            </g>
          )}
          {t > 14.12 && t < 15 && <Rays x={540} y={1080} inner={60} outer={lerp(120, 520, prog(t, 14.12, 14.8))} n={30} seed="lvb" color="rgba(43,27,30,0.5)" />}
        </g>
      );
    }}
  </Shell>
);

/* 7 · The comet looms: streak rainbow tail, speed lines, flash */
const CometScene = () => (
  <Shell id="cm" start={15.1} end={17.05} kind="night" origin={[540, 1100]}>
    {(t, step) => {
      const near = ease(prog(t, 15.1, 16.9));
      const flash = Math.max(0, 1 - Math.abs(t - 16.4) * 4);
      const shake = t > 15.6 && t < 16.2 ? Math.sin(step * 2.3) * 10 : 0;
      const cx = lerp(900, 620, near);
      const cy = lerp(260, 560, near);
      return (
        <g transform={`translate(${shake} ${shake * 0.5})`}>
          <Stars2 seed="cm" step={step} n={110} />
          <Rays x={cx} y={cy} inner={200} outer={1200} n={50} seed="cmr" color="rgba(255,255,255,0.18)" />
          <Earth cx={540} cy={1250} r={240} t={t} id="cm" />
          <g transform={`translate(${cx} ${cy}) rotate(-35) scale(${lerp(1, 2, near)})`}>
            {Array.from({ length: 70 }).map((_, i) => (
              <line key={i} x1={20} y1={(random(`cmy${i}`) - 0.5) * 50} x2={140 + random(`cml${i}`) * 520} y2={(random(`cmy${i}`) - 0.5) * 140} stroke={S.rainbow[i % 6]} strokeWidth={3 + random(`cmw${i}`) * 5} strokeLinecap="round" opacity={0.85} />
            ))}
            <Halo x={0} y={0} r={160} color={S.sand} id="cmh" />
            <circle r={36} fill="#FFF3C8" {...Ink} strokeWidth={5} />
          </g>
          <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#FFF6E0" opacity={flash * 0.55} />
        </g>
      );
    }}
  </Shell>
);

/* Small hand-drawn moon */
const InkMoon: React.FC<{ cx: number; cy: number; r: number; fill: string; id: string }> = ({ cx, cy, r, fill, id }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={fill} {...Ink} strokeWidth={6} />
    {[[-0.35, -0.3, 0.2], [0.3, 0.15, 0.15], [-0.05, 0.45, 0.11]].map(([x, y, k], i) => (
      <circle key={i} cx={cx + x * r} cy={cy + y * r} r={k * r} fill="none" stroke={S.ink} strokeWidth={4} opacity={0.6} />
    ))}
    <defs>
      <clipPath id={`im-${id}`}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
    </defs>
    <circle cx={cx + r * 0.6} cy={cy + r * 0.3} r={r} fill="url(#hatch-ap)" clipPath={`url(#im-${id})`} />
  </g>
);

/* 8 · Two tiny worlds far apart */
const Apart = () => (
  <Shell id="ap" start={17.05} end={20.3} kind="night" top="#0F1238" bottom="#221C55">
    {(t, step) => {
      const d = Math.sin(t * 0.8) * 18;
      const dots = Math.floor(prog(t, 17.6, 19.4) * 14);
      return (
        <g>
          <Stars2 seed="ap" step={step} />
          <g transform={`translate(0 ${d})`}>
            <InkMoon cx={260} cy={580} r={130} fill="#A99BE0" id="a1" />
            <Silhouette x={260} y={452} s={0.72} hair="short" step={step} />
          </g>
          <g transform={`translate(0 ${-d})`}>
            <InkMoon cx={820} cy={1080} r={150} fill="#E7A2C4" id="a2" />
            <Silhouette x={820} y={932} s={0.72} hair="long" step={step} />
          </g>
          {Array.from({ length: dots }).map((_, i) => {
            const p = (i + 1) / 15;
            return <circle key={i} cx={lerp(340, 740, p)} cy={lerp(600, 980, p)} r={6} fill={S.paper} opacity={0.6} />;
          })}
          {t > 18.3 && t < 19.8 && <InkHeart x={540} y={790} s={2.2} opacity={Math.max(0, Math.sin((t - 18.3) * 6))} />}
        </g>
      );
    }}
  </Shell>
);

/* Hand-drawn clock; `melt` stretches the bottom into drips */
const InkClock: React.FC<{ x: number; y: number; r: number; t: number; speed?: number; melt?: number; rot?: number }> = ({ x, y, r, t, speed = 1, melt = 0, rot = 0 }) => {
  const d = melt * r * 1.6;
  const face = `M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 C ${r} ${r * 0.6 + d * 0.3} ${r * 0.55} ${r + d} ${r * 0.3} ${r + d * 1.1} C ${r * 0.15} ${r + d * 1.3} ${r * 0.05} ${r + d * 0.5} ${-r * 0.1} ${r + d * 0.6} C ${-r * 0.3} ${r + d * 0.8} ${-r * 0.45} ${r + d * 1.4} ${-r * 0.6} ${r * 0.9 + d * 0.7} C ${-r * 0.85} ${r * 0.7 + d * 0.3} ${-r} ${r * 0.5} ${-r} 0 Z`;
  const a = t * 360 * 0.12 * speed;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={face} fill="#FBF3E2" {...Ink} strokeWidth={6} />
      {Array.from({ length: 12 }).map((_, i) => {
        const an = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.cos(an) * r * 0.72} y1={Math.sin(an) * r * 0.72} x2={Math.cos(an) * r * 0.85} y2={Math.sin(an) * r * 0.85} stroke={S.ink} strokeWidth={4} strokeLinecap="round" />;
      })}
      <line x1={0} y1={0} x2={0} y2={-r * 0.45} stroke={S.ink} strokeWidth={r * 0.09} strokeLinecap="round" transform={`rotate(${a / 12})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.68} stroke={S.terracotta} strokeWidth={r * 0.06} strokeLinecap="round" transform={`rotate(${a})`} />
    </g>
  );
};

/* 9 · Hourglass on paper: sand drains, numbers count, glass cracks */
const Hourglass = () => (
  <Shell id="hg" start={20.3} end={27.9} kind="paper">
    {(t, step) => {
      const drain = ease(prog(t, 20.4, 25.5)) * 0.55 + ease(prog(t, 25.5, 27.0)) * 0.45;
      const crack = prog(t, 27.05, 27.3);
      const danger = prog(t, 25.5, 27.5);
      const glass = "M -170 -350 H 170 C 170 -150 30 -60 20 0 C 30 60 170 150 170 350 H -170 C -170 150 -30 60 -20 0 C -30 -60 -170 -150 -170 -350 Z";
      return (
        <g>
          <Guides x={540} y={800} r={430} />
          {danger > 0 && <Rays x={540} y={800} inner={470} outer={900} n={40} seed="hgr" opacity={danger} />}
          {[[200, 420, 70, 22.2], [880, 470, 80, 22.4], [170, 1130, 64, 24.2], [900, 1120, 74, 24.4]].map(([x, y, r, at], i) => (
            <g key={i} transform={`translate(${x} ${y + Math.sin(t * 2 + i) * 14}) scale(${pop(t, at, { damping: 10 })})`}>
              <InkClock x={0} y={0} r={r} t={t} speed={1 + danger * 12} rot={Math.sin(t + i) * 10} />
            </g>
          ))}
          {["1", "2", "3", "4"].map((n, i) => {
            const p = pop(t, 24.1 + i * 0.25);
            return (
              <text key={n} x={330 + i * 140} y={290 - p * 30} textAnchor="middle" fontFamily={kalam} fontWeight={700} fontSize={80} fill={S.terracotta} stroke={S.ink} strokeWidth={2} opacity={p * (1 - prog(t, 25.3, 25.6))}>
                {n}
              </text>
            );
          })}
          <g transform={`translate(540 800) rotate(${Math.sin(step * 1.7) * danger * 3})`}>
            <defs>
              <clipPath id="hg-glass">
                <path d={glass} />
              </clipPath>
            </defs>
            <path d={glass} fill="#DDEFF0" />
            <g clipPath="url(#hg-glass)">
              <rect x={-200} y={lerp(-300, 0, drain)} width={400} height={400} fill={S.sand} />
              <rect x={-200} y={lerp(340, 20, drain)} width={400} height={400} fill={S.sand} />
              <rect x={-200} y={-400} width={400} height={800} fill="url(#hatch-hg)" />
              {drain < 0.99 && <line x1={0} y1={-10} x2={0} y2={350} stroke={S.sand} strokeWidth={10} />}
            </g>
            <path d={glass} fill="none" {...Ink} />
            <rect x={-235} y={-400} width={470} height={52} rx={10} fill={S.terracotta} {...Ink} />
            <rect x={-235} y={348} width={470} height={52} rx={10} fill={S.terracotta} {...Ink} />
            <rect x={-215} y={-350} width={24} height={700} fill="#B45A38" {...Ink} strokeWidth={5} />
            <rect x={191} y={-350} width={24} height={700} fill="#B45A38" {...Ink} strokeWidth={5} />
            {crack > 0 && <path d="M 60 -200 L 20 -120 L 70 -60 L 10 20 L 60 110" stroke={S.ink} strokeWidth={6} fill="none" strokeDasharray={600} strokeDashoffset={600 * (1 - crack)} />}
          </g>
        </g>
      );
    }}
  </Shell>
);

/* 10 · Clocks melt, then burst into a colored-pencil spiral */
const Melt = () => (
  <Shell id="ml" start={27.9} end={33.95} kind="night" top="#0D0B24" bottom="#1E1650">
    {(t, step) => {
      const melt = ease(prog(t, 28.5, 32.3));
      const shatter = prog(t, 32.5, 33.6);
      const grow = ease(prog(t, 28.0, 33.9));
      const clocks = [
        [540, 700, 150],
        [240, 460, 90],
        [840, 520, 100],
        [270, 1080, 80],
        [820, 1120, 95],
      ];
      return (
        <g>
          <Stars2 seed="ml" step={step} />
          {[0, 1, 2, 3, 4].map((k) => (
            <StreakRing key={k} cx={540} cy={820} r={90 + k * 95 * grow} width={50} seed={`mls${k}`} colors={S.rainbow} count={50 + k * 20} rot={step * (6 - k) * (k % 2 ? 1 : -1)} arc={300} opacity={0.35 + grow * 0.6} />
          ))}
          {shatter === 0 &&
            clocks.map(([x, y, r], i) => <InkClock key={i} x={x} y={y + melt * 40} r={r} t={t} speed={3 - melt * 2.6} melt={melt * (0.6 + (i % 2) * 0.4)} rot={Math.sin(t * 0.7 + i) * 12} />)}
          {shatter > 0 &&
            shatter < 1 &&
            clocks.map(([x, y, r], i) =>
              Array.from({ length: 16 }).map((_, k) => {
                const a = random(`mlb${i}${k}`) * Math.PI * 2;
                const dist = r * 3 * ease(shatter);
                return <line key={`${i}-${k}`} x1={x + Math.cos(a) * dist} y1={y + Math.sin(a) * dist} x2={x + Math.cos(a) * (dist + 40)} y2={y + Math.sin(a) * (dist + 40)} stroke={S.rainbow[k % 6]} strokeWidth={6} strokeLinecap="round" opacity={1 - shatter} />;
              }),
            )}
          {shatter > 0 && <Spark x={540} y={820} s={2.5 * (1 - shatter) + 0.8} />}
        </g>
      );
    }}
  </Shell>
);

/* 11 · Sunrise as a thin golden arc over the planet rim */
const Dawn = () => (
  <Shell id="dw" start={33.95} end={37.1} kind="night" origin={[540, 1150]} exitZoom={3.4}>
    {(t, step) => {
      const rise = ease(prog(t, 33.95, 35.8));
      return (
        <g>
          <Stars2 seed="dw" step={step} />
          <Halo x={540} y={980} r={lerp(300, 820, rise)} color={S.sand} id="dwh" opacity={rise} />
          <StreakRing cx={540} cy={1640} r={640} width={30} seed="dwa" colors={[S.gold, "#FFF1C2", S.sand]} count={140} arc={140} rot={200} opacity={rise} />
          <circle cx={540} cy={1640} r={620} fill={S.silhouette} {...Ink} />
          <circle cx={540} cy={1640} r={620} fill="url(#hatchl-dw)" opacity={0.25} />
          {t > 34.5 && <Spark x={540} y={1020} s={lerp(0.5, 2.4, rise)} />}
        </g>
      );
    }}
  </Shell>
);

/* 12 · Silhouettes ring the planet holding hands; handwritten title */
const Together = () => (
  <Shell id="tg" start={37.1} end={44.6} kind="dusk" top="#2A1D5E" bottom="#E89A86" exitZoom={1}>
    {(t, step) => {
      const zo = ease(prog(t, 40.6, 42.2));
      const s = lerp(1.6, 0.8, zo);
      const ring = ease(prog(t, 39.9, 40.8));
      const title = pop(t, 41.9, { damping: 16 });
      const n = 14;
      return (
        <g>
          <Stars2 seed="tg" step={step} n={60} />
          <g transform={`translate(540 ${lerp(1150, 900, zo)}) scale(${s})`}>
            <Halo x={0} y={0} r={600} color={S.gold} id="tgh" opacity={0.4 + ring * 0.5} />
            <StreakRing cx={0} cy={0} r={420} width={40} seed="tgr" colors={[S.gold, S.pink, S.sand, "#FFF1C2"]} count={Math.floor(220 * ring)} rot={step * 2} />
            <Earth cx={0} cy={0} r={280} t={t} id="tg" />
            {Array.from({ length: n }).map((_, i) => {
              const a = (i / n) * 360;
              const up = pop(t, 37.3 + ((i * 5) % n) * 0.13, { damping: 10 });
              const help = i % 2 ? ease(prog(t, 38.3 + i * 0.05, 38.9 + i * 0.05)) : 1;
              return (
                <g key={i} transform={`rotate(${a}) translate(0 -280)`} opacity={up}>
                  <g transform={`translate(0 ${(1 - help) * 30})`}>
                    <Silhouette x={0} y={0} s={0.3 * up} hair={i % 2 ? "long" : "short"} armL={lerp(8, 85, ring)} armR={lerp(-8, -85, ring)} step={step + i} />
                  </g>
                </g>
              );
            })}
          </g>
          <g opacity={title} transform={`translate(540 ${lerp(360, 320, title)}) rotate(-3)`}>
            <text textAnchor="middle" fontFamily={kalam} fontWeight={700} fontSize={86} fill={S.paper} stroke={S.ink} strokeWidth={3}>
              Si el mundo
            </text>
            <text y={100} textAnchor="middle" fontFamily={kalam} fontWeight={700} fontSize={86} fill={S.gold} stroke={S.ink} strokeWidth={3}>
              se acabara mañana
            </text>
          </g>
        </g>
      );
    }}
  </Shell>
);

export const Scenes2 = () => (
  <>
    <Letter />
    <Space />
    <Train />
    <Vienna />
    <Door />
    <Love />
    <CometScene />
    <Apart />
    <Hourglass />
    <Melt />
    <Dawn />
    <Together />
  </>
);

/** Scenes drawn on cream paper need dark captions. */
export const PAPER_SCENES: Array<[number, number]> = [
  [0, 2.0],
  [20.3, 27.9],
];
