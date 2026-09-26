import React from "react";
import { random } from "remotion";
import {
  Burst,
  Clock,
  Comet,
  Figure,
  Glow,
  H,
  GasGiant,
  Heart,
  K,
  Moon,
  Planet,
  Sparkle,
  Sun,
  Stars,
  W,
  caveat,
  ease,
  lerp,
  nunito,
  pop,
  prog,
  useT,
} from "./kz";

/** The two protagonists, reused across scenes. */
const HIM = { color: "#1FBF4A", skin: "#B8642E", hair: "#231A3F" };
const MILENA = { color: "#E0559B", skin: "#F0913A", hair: "#B8303F", curly: true };

/** Kurzgesagt haze: warm light from the top-left and drifting dust sparkles. */
const Haze: React.FC<{ t: number; seed: string; color?: string }> = ({ t, seed, color = "#FFB8E0" }) => (
  <g>
    <defs>
      <linearGradient id={`hz-${seed}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={color} stopOpacity={0.28} />
        <stop offset="0.5" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={`url(#hz-${seed})`} />
    {Array.from({ length: 18 }).map((_, i) => (
      <Sparkle key={i} x={(random(`${seed}dx${i}`) * W + t * 12) % W} y={(random(`${seed}dy${i}`) * 1300 + 150 - t * 18 + 1300) % 1300} s={0.35 + random(`${seed}ds${i}`) * 0.5} color="#FFFFFF" opacity={0.25 + 0.3 * Math.sin(t * 2 + i)} />
    ))}
  </g>
);

/** Zoom-through transitions: scenes push in on entry and blow past the camera on exit. */
const Shell: React.FC<{
  start: number;
  end: number;
  bg: [string, string];
  children: (t: number, local: number) => React.ReactNode;
  exitZoom?: number;
  origin?: [number, number];
}> = ({ start, end, bg, children, exitZoom = 2.4, origin = [540, 820] }) => {
  const t = useT();
  if (t < start - 0.3 || t > end + 0.4) return null;
  const inP = ease(prog(t, start - 0.3, start + 0.25));
  const outP = ease(prog(t, end - 0.05, end + 0.4));
  const push = 1 + 0.07 * prog(t, start, end);
  const scale = lerp(0.82, 1, inP) * push * lerp(1, exitZoom, outP);
  const shake = t > start ? 0 : 0;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inP * (1 - outP) }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, transform: `scale(${scale}) translateY(${shake}px)`, transformOrigin: `${origin[0]}px ${origin[1]}px` }}
      >
        <defs>
          <linearGradient id={`bg-${start}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={bg[0]} />
            <stop offset="1" stopColor={bg[1]} />
          </linearGradient>
        </defs>
        <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={`url(#bg-${start})`} />
        {children(t, t - start)}
      </svg>
    </div>
  );
};

/* 1 · "Querida Milena," — a letter opens, then flies up to become a star */
const Letter = () => (
  <Shell start={0} end={2.0} bg={[K.navy, K.violet]} exitZoom={1}>
    {(t) => {
      const inP = pop(t, 0.02, { damping: 11 });
      const flap = ease(prog(t, 0.35, 0.7));
      const slide = ease(prog(t, 0.55, 1.1));
      const fly = ease(prog(t, 1.55, 2.05));
      const cx = 540;
      const cy = lerp(880, 300, fly);
      const s = lerp(inP, 0.08, fly);
      return (
        <g>
          <Stars t={t} seed="l" count={90} driftY={-t * 20} />
          <Glow cx={540} cy={820} r={560} color={K.pink} opacity={0.35 + 0.2 * slide} id="lg" />
          <g transform={`translate(${cx} ${cy}) scale(${s}) rotate(${lerp(-6, 0, inP) + fly * 25})`}>
            <rect x={-300} y={-180} width={600} height={380} rx={26} fill={K.cream} />
            {flap > 0.5 && <path d={`M -300 -180 L 0 ${lerp(60, -420, flap)} L 300 -180 Z`} fill="#F3DDB2" />}
            <g transform={`translate(0 ${-slide * 300})`}>
              <rect x={-250} y={-200} width={500} height={330} rx={16} fill={K.white} />
              <text x={-205} y={-110} fontFamily={caveat} fontSize={72} fontWeight={700} fill={K.indigo}>
                Querida Milena,
              </text>
              {[0, 1, 2].map((i) => (
                <rect key={i} x={-205} y={-60 + i * 44} width={[380, 320, 250][i] * prog(t, 1.0 + i * 0.12, 1.4 + i * 0.12)} height={12} rx={6} fill={K.violet} opacity={0.25} />
              ))}
            </g>
            <path d="M -300 -40 L 0 110 L 300 -40 L 300 200 L -300 200 Z" fill="#F3DDB2" />
            <path d="M -300 200 L 0 40 L 300 200 Z" fill="#EACB95" />
            {flap <= 0.5 && <path d={`M -300 -180 L 0 ${lerp(60, -420, flap)} L 300 -180 Z`} fill="#EACB95" />}
            <circle cx={0} cy={lerp(40, -300, flap)} r={34} fill={K.coral} opacity={1 - flap} />
            <Heart x={0} y={lerp(46, -296, flap)} s={1.1} color={K.cream} opacity={1 - flap} />
          </g>
          <Glow cx={cx} cy={cy} r={200 * fly} color={K.sun} opacity={fly} id="lstar" />
        </g>
      );
    }}
  </Shell>
);

/* 2 · "ojalá el mundo se acabara mañana" — Earth rises, a comet appears */
const Space = () => (
  <Shell start={2.0} end={4.3} bg={[K.night, K.navy]} origin={[540, 900]} exitZoom={4}>
    {(t, l) => {
      const rise = ease(prog(t, 1.9, 2.9));
      const comet = ease(prog(t, 3.0, 4.2));
      const flare = pop(t, 3.5, { damping: 8 });
      return (
        <g>
          <Stars t={t} seed="sp" count={180} drift={-l * 30} />
          <GasGiant cx={lerp(-120, -60, rise)} cy={lerp(1500, 1250, rise)} r={330} t={t} id="gg1" />
          <Planet cx={540} cy={lerp(1500, 860, rise)} r={280} t={t} id="p1" />
          <Moon cx={lerp(900, 830, rise)} cy={lerp(1400, 1120, rise)} r={70} id="m1" />
          <Comet x={lerp(1250, 800, comet)} y={lerp(120, 360, comet)} angle={-28} len={560} size={lerp(16, 26, flare)} id="c1" heat={1 + flare * 0.6} />
        </g>
      );
    }}
  </Shell>
);

/* Parallax hill layer */
const Hills: React.FC<{ y: number; amp: number; color: string; offset: number; seed: string }> = ({ y, amp, color, offset, seed }) => {
  const pts: string[] = [];
  for (let x = -200; x <= W + 400; x += 80) {
    const xx = x - (offset % 480);
    const h = Math.sin((x + random(seed) * 400) / 170) * amp + Math.sin(x / 63) * amp * 0.3;
    pts.push(`${xx},${y + h}`);
  }
  return <polygon points={`-400,${H} ${pts.join(" ")} ${W + 400},${H}`} fill={color} />;
};

/* 3 · "tomar el próximo tren" — night train across parallax hills */
const Train = () => (
  <Shell start={4.3} end={7.15} bg={["#1A1450", "#8A3E86"]} origin={[540, 900]}>
    {(t, l) => {
      const tx = lerp(-900, 1400, ease(prog(t, 4.35, 7.2)));
      const cars = [K.orange, K.teal, K.coral, K.teal];
      return (
        <g>
          <Stars t={t} seed="tr" count={90} drift={-l * 40} />
          <Haze t={t} seed="trh" color="#FFB8E0" />
          <circle cx={800} cy={380} r={90} fill={K.cream} />
          <circle cx={830} cy={360} r={90} fill="#1A1450" opacity={0.25} />
          <Glow cx={800} cy={380} r={260} color={K.cream} opacity={0.4} id="moon" />
          <Hills y={880} amp={70} color="#3B2472" offset={l * 60} seed="h1" />
          <Hills y={990} amp={50} color="#2A1B5C" offset={l * 160} seed="h2" />
          <rect x={-400} y={1080} width={W + 800} height={16} fill={K.night} opacity={0.7} />
          <g transform={`translate(${tx} -330) scale(1.35)`}>
            {cars.map((c, i) => {
              const x = -i * 300;
              return (
                <g key={i}>
                  <rect x={x - 130} y={940} width={270} height={130} rx={34} fill={c} />
                  <rect x={x + 10} y={940} width={130} height={130} rx={34} fill={K.night} opacity={0.12} />
                  {[0, 1, 2].map((w) => (
                    <g key={w}>
                      <rect x={x - 100 + w * 80} y={965} width={56} height={44} rx={12} fill={K.sun} />
                      <Glow cx={x - 72 + w * 80} cy={987} r={60} color={K.sun} opacity={0.5} id={`tw${i}${w}`} />
                    </g>
                  ))}
                  {[-80, 80].map((wx) => (
                    <g key={wx} transform={`translate(${x + wx} 1078) rotate(${t * 720})`}>
                      <circle r={24} fill={K.night} />
                      <rect x={-3} y={-20} width={6} height={40} fill={K.violet} />
                    </g>
                  ))}
                </g>
              );
            })}
            <rect x={140} y={900} width={40} height={60} rx={10} fill={K.orange} />
            {[0, 1, 2, 3].map((k) => {
              const age = (t * 1.5 + k * 0.25) % 1;
              return <circle key={k} cx={160 - age * 260} cy={880 - age * 160} r={20 + age * 40} fill={K.cream} opacity={0.35 * (1 - age)} />;
            })}
          </g>
          <Hills y={1150} amp={30} color={K.night} offset={l * 420} seed="h3" />
        </g>
      );
    }}
  </Shell>
);

/* 4 · "llegar a tu puerta en Viena" — skyline with gothic spire and dome */
const Vienna = () => (
  <Shell start={7.15} end={9.0} bg={["#1B1458", "#C35B7C"]} origin={[540, 1050]} exitZoom={3.2}>
    {(t) => {
      const pin = pop(t, 8.2, { damping: 9 });
      const bldgs = [
        [60, 760, 170],
        [230, 820, 150],
        [640, 800, 170],
        [810, 740, 190],
      ];
      return (
        <g>
          <Stars t={t} seed="v" count={70} />
          <Glow cx={540} cy={1000} r={700} color={K.orange} opacity={0.35} id="vg" />
          <path d="M 470 1150 V 620 L 540 250 L 610 620 V 1150 Z" fill="#2B1F6B" />
          <path d="M 540 250 L 610 620 V 1150 H 540 Z" fill={K.night} opacity={0.25} />
          <circle cx={540} cy={240} r={10} fill={K.sun} />
          <path d="M 360 1150 V 860 A 110 110 0 0 1 580 860 V 1150 Z" transform="translate(-300 0)" fill="#34257D" />
          <rect x={115} y={700} width={10} height={60} fill="#34257D" />
          {bldgs.map(([x, y, w], i) => (
            <g key={i}>
              <path d={`M ${x + w} ${y + 8} L ${x + w + 34} ${y - 14} V 1150 H ${x + w} Z`} fill="#221866" />
              <rect x={x} y={y} width={w} height={1150 - y} rx={10} fill={i % 2 ? "#4A36A6" : "#3C2C94"} />
              <rect x={x} y={y} width={w} height={10} rx={5} fill="#B9A6FF" opacity={0.7} />
              {Array.from({ length: 8 }).map((_, k) => {
                const on = t > 7.2 + random(`vw${i}${k}`) * 1.4;
                return (
                  <rect key={k} x={x + 22 + (k % 3) * (w / 3.4)} y={y + 40 + Math.floor(k / 3) * 90} width={32} height={46} rx={8} fill={on ? K.sun : K.night} opacity={on ? 0.95 : 0.3} />
                );
              })}
            </g>
          ))}
          <rect x={-400} y={1150} width={W + 800} height={900} fill={K.night} />
          <g transform={`translate(540 ${220 - (1 - pin) * 40}) scale(${pin})`}>
            <path d="M 0 60 C -50 0 -50 -60 0 -60 C 50 -60 50 0 0 60 Z" fill={K.coral} />
            <circle cy={-18} r={18} fill={K.cream} />
            <rect x={-90} y={-140} width={180} height={64} rx={32} fill={K.white} />
            <text y={-96} textAnchor="middle" fontFamily={nunito} fontWeight={900} fontSize={40} fill={K.indigo}>
              Viena
            </text>
          </g>
        </g>
      );
    }}
  </Shell>
);

/* 5 · "y decir «Ven conmigo, Milena»" — the door opens, a hand reaches out */
const Door = () => (
  <Shell start={9.0} end={11.5} bg={["#221A66", "#3A2A86"]}>
    {(t) => {
      const open = ease(prog(t, 9.15, 9.8));
      const milena = pop(t, 9.7, { damping: 12 });
      const reach = ease(prog(t, 9.55, 10.2));
      const step = ease(prog(t, 10.8, 11.4));
      return (
        <g>
          <defs>
            <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#B48CF0" />
              <stop offset="1" stopColor="#7A5BE0" />
            </linearGradient>
            <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFF1D6" stopOpacity={0.75} />
              <stop offset="1" stopColor="#FFB8E0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <rect x={-400} y={-400} width={W + 800} height={1600} fill="url(#wall)" />
          <rect x={-400} y={1150} width={W + 800} height={500} fill="#5B3FC4" />
          <rect x={-400} y={1150} width={W + 800} height={14} fill="#C9B6FF" opacity={0.6} />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={-100 + k * 330} y={1250 + (k % 2) * 90} width={190} height={14} rx={7} fill="#4A30A8" opacity={0.6} />)}
          <rect x={40} y={420} width={200} height={300} rx={24} fill="#FFE7C2" />
          <rect x={40} y={420} width={200} height={300} rx={24} fill="none" stroke="#E9DAFF" strokeWidth={14} />
          <polygon points="40,420 240,420 700,1150 120,1150" fill="url(#beam)" opacity={0.55} />
          <path d="M 772 520 L 800 500 V 1170 L 772 1150 Z" fill="#4B2FA6" />
          <path d="M 318 1150 V 520 A 222 222 0 0 1 762 520 V 1150" fill="none" stroke="#9F7BF2" strokeWidth={26} />
          <path d="M 318 520 A 222 222 0 0 1 762 520" fill="none" stroke="#E2D4FF" strokeWidth={8} opacity={0.8} />
          <path d="M 330 1150 V 520 A 210 210 0 0 1 750 520 V 1150 Z" fill={K.night} />
          <g transform="translate(900 1150)">
            <path d="M -60 0 L -48 -110 H 48 L 60 0 Z" fill="#E07BD8" />
            <rect x={-66} y={-124} width={132} height={22} rx={11} fill="#F29BE8" />
            {[[-30, -200, 26, 110], [8, -230, 26, 150], [40, -190, 24, 90]].map(([x, y, w, h], i) => (
              <rect key={i} x={x - w / 2} y={y} width={w} height={h} rx={w / 2} fill={i === 1 ? "#39C27A" : "#6BD89A"} />
            ))}
          </g>
          <defs>
            <clipPath id="doorway">
              <path d="M 330 1150 V 520 A 210 210 0 0 1 750 520 V 1150 Z" />
            </clipPath>
            <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={K.sun} stopOpacity={0.55} />
              <stop offset="1" stopColor={K.orange} stopOpacity={0} />
            </linearGradient>
          </defs>
          <g clipPath="url(#doorway)">
            <rect x={330} y={300} width={420} height={900} fill={K.sun} opacity={open} />
            <Glow cx={540} cy={700} r={420} color={K.cream} opacity={open} id="dl" />
            <g opacity={milena}>
              <Figure x={lerp(560, 590, step)} y={1130} s={1.25} {...MILENA} t={t} armL={lerp(20, 60, step)} armR={-15} look={-1} mouth={t > 10.8 ? "open" : "smile"} />
            </g>
          </g>
          <path d={`M 330 1150 L 330 520 A 210 210 0 0 1 ${lerp(750, 360, open)} ${lerp(520, 330, open)} L ${lerp(750, 360, open)} 1150 Z`} fill={K.wood} />
          <g opacity={1 - open}>
            <rect x={380} y={600} width={150} height={200} rx={18} fill={K.woodDark} opacity={0.5} />
            <rect x={560} y={600} width={150} height={200} rx={18} fill={K.woodDark} opacity={0.5} />
            <rect x={380} y={860} width={150} height={240} rx={18} fill={K.woodDark} opacity={0.5} />
            <rect x={560} y={860} width={150} height={240} rx={18} fill={K.woodDark} opacity={0.5} />
          </g>
          <circle cx={lerp(700, 350, open)} cy={860} r={14} fill={K.sun} opacity={1 - open} />
          <polygon points={`330,1150 750,1150 ${1000 + open * 200},1500 ${80 - open * 200},1500`} fill="url(#spill)" opacity={open} />
          <rect x={250} y={500} width={30} height={60} rx={10} fill={K.sun} />
          <Glow cx={265} cy={530} r={180} color={K.sun} opacity={0.6} id="lamp" />
          <Figure x={210} y={1320} s={1.35} {...HIM} t={t} armL={10} armR={lerp(-20, -100, reach)} look={1} mouth={t > 9.4 && t < 11 ? "open" : "smile"} />
          <Burst x={540} y={700} p={prog(t, 10.1, 11.0)} seed="db" n={18} radius={300} size={8} colors={[K.sun, K.cream]} />
          <Haze t={t} seed="door" />
        </g>
      );
    }}
  </Shell>
);

/* 6 · "amarnos sin escrúpulos, ni miedo ni restricciones" — hearts, fear dissolves, chains snap */
const Love = () => (
  <Shell start={11.5} end={15.1} bg={["#3A1F6E", "#8B3A8C"]}>
    {(t) => {
      const cloud = pop(t, 13.4, { damping: 14 });
      const clear = ease(prog(t, 13.85, 14.3));
      const chain = 1 - ease(prog(t, 14.1, 14.35));
      return (
        <g>
          <Stars t={t} seed="lv" count={60} />
          <Haze t={t} seed="lvh" color="#FFB8E0" />
          <Glow cx={540} cy={900} r={600} color={K.pink} opacity={0.5 + 0.2 * Math.sin(t * 4)} id="lvg" />
          {Array.from({ length: 16 }).map((_, i) => {
            const born = 11.85 + i * 0.12;
            if (t < born) return null;
            const age = (t - born) / 2.6;
            if (age > 1) return null;
            const x = 540 + Math.sin(i * 2.3) * 260 + Math.sin(t * 2 + i) * 30;
            return <Heart key={i} x={x} y={900 - age * 700} s={1.4 + (i % 3) * 0.6} color={[K.pink, K.coral, K.sun][i % 3]} opacity={1 - age} />;
          })}
          <Figure x={420} y={1220} s={1.3} {...HIM} t={t} armR={-60} look={1} />
          <Figure x={660} y={1220} s={1.3} {...MILENA} t={t} armL={60} look={-1} />
          <circle cx={540} cy={1080} r={16} fill="#FFD9B8" />
          <g opacity={cloud * (1 - clear)} transform={`translate(540 ${lerp(260, 380, cloud)})`}>
            {[[-160, 20, 110], [-40, -30, 140], [110, 10, 120], [220, 40, 80]].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill="#1B1240" />
            ))}
            <path d="M -40 120 L 0 60 L -20 60 L 20 0" stroke={K.sun} strokeWidth={10} fill="none" strokeLinecap="round" />
          </g>
          <Burst x={540} y={330} p={prog(t, 13.85, 14.8)} seed="cl" n={30} radius={380} colors={["#1B1240", "#34257D"]} size={16} />
          {chain > 0.01 && (
            <g opacity={chain} transform={`translate(540 1120) scale()`}>
              {Array.from({ length: 11 }).map((_, i) => (
                <rect key={i} x={-330 + i * 60} y={i % 2 ? -12 : -22} width={70} height={i % 2 ? 24 : 44} rx={i % 2 ? 12 : 22} fill="none" stroke="#B8B2D8" strokeWidth={11} />
              ))}
              <rect x={-58} y={-20} width={116} height={96} rx={20} fill={K.sun} />
              <path d="M -34 -20 V -52 A 34 34 0 0 1 34 -52 V -20" fill="none" stroke={K.sun} strokeWidth={14} />
              <circle cx={0} cy={22} r={12} fill={K.woodDark} />
              <rect x={-5} y={24} width={10} height={26} rx={5} fill={K.woodDark} />
            </g>
          )}
          <Burst x={540} y={1120} p={prog(t, 14.12, 14.9)} seed="ch" n={26} radius={460} colors={["#A9A3C9", K.sun, K.cream]} size={12} />
        </g>
      );
    }}
  </Shell>
);

/* 7 · "porque el mundo se acaba mañana" — the comet looms over Earth */
const CometScene = () => (
  <Shell start={15.1} end={17.05} bg={[K.night, "#2A1454"]} origin={[540, 1100]}>
    {(t) => {
      const near = ease(prog(t, 15.1, 16.9));
      const flash = Math.max(0, 1 - Math.abs(t - 16.4) * 4);
      const shake = t > 15.6 && t < 16.2 ? Math.sin(t * 90) * 8 * (16.2 - t) : 0;
      return (
        <g transform={`translate(${shake} ${shake * 0.6})`}>
          <Stars t={t} seed="cm" count={160} drift={-t * 10} />
          <Planet cx={540} cy={1180} r={250} t={t} id="p2" glow="#6A2FA0" />
          <Moon cx={200} cy={1320} r={60} id="m2" color="#9A8BD6" />
          <Comet x={lerp(900, 640, near)} y={lerp(240, 560, near)} angle={-35} len={lerp(500, 900, near)} size={lerp(26, 60, near)} id="c2" heat={1.4 + near} />
          <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={K.cream} opacity={flash * 0.45} />
        </g>
      );
    }}
  </Shell>
);

/* 8 · "Tal vez no amemos irrazonablemente" — two tiny worlds, far apart */
const Apart = () => (
  <Shell start={17.05} end={20.3} bg={["#0F1640", "#1F2A6E"]}>
    {(t) => {
      const drift = Math.sin(t * 0.8) * 20;
      const dots = Math.floor(prog(t, 17.6, 19.4) * 14);
      return (
        <g>
          <Stars t={t} seed="ap" count={150} drift={t * 12} />
          <g transform={`translate(0 ${drift})`}>
            <Moon cx={260} cy={560} r={130} id="a1" color="#8C7FD6" />
            <Figure x={260} y={440} s={0.8} {...HIM} t={t} bounce={0.2} look={1} />
          </g>
          <g transform={`translate(0 ${-drift})`}>
            <Moon cx={820} cy={1060} r={150} id="a2" color="#D68CB8" />
            <Figure x={820} y={920} s={0.8} {...MILENA} t={t} bounce={0.2} look={-1} />
          </g>
          {Array.from({ length: dots }).map((_, i) => {
            const p = (i + 1) / 15;
            return <circle key={i} cx={lerp(330, 750, p)} cy={lerp(560, 960, p)} r={7} fill={K.cream} opacity={0.5} />;
          })}
          <Heart x={540} y={760} s={2.4} color={K.pink} opacity={Math.max(0, Math.sin((t - 18.3) * 6)) * (t > 18.3 && t < 19.6 ? 0.8 : 0)} />
        </g>
      );
    }}
  </Shell>
);

/* 9 · "pensamos que tenemos tiempo… ¿y si no tenemos tiempo?" — hourglass drains and cracks */
const Hourglass = () => (
  <Shell start={20.3} end={27.9} bg={["#1A1450", "#3A2A86"]}>
    {(t) => {
      const drain = ease(prog(t, 20.4, 25.5)) * 0.55 + ease(prog(t, 25.5, 27.0)) * 0.45;
      const crack = prog(t, 27.05, 27.3);
      const danger = prog(t, 25.5, 27.5);
      const clocks = [
        [200, 420, 70, 22.2],
        [880, 470, 80, 22.4],
        [170, 1130, 64, 24.2],
        [900, 1120, 74, 24.4],
      ];
      return (
        <g>
          <Stars t={t} seed="hg" count={90} />
          <Haze t={t} seed="hgh" color="#B8D0FF" />
          <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={K.coral} opacity={danger * 0.18} />
          {clocks.map(([x, y, r, at], i) => {
            const p = pop(t, at, { damping: 10 });
            return (
              <g key={i} transform={`translate(${x} ${y + Math.sin(t * 2 + i) * 16}) scale(${p})`}>
                <Clock x={0} y={0} r={r} t={t} speed={1 + danger * 12} rot={Math.sin(t + i) * 10} />
              </g>
            );
          })}
          {["1", "2", "3", "4"].map((n, i) => {
            const at = 24.1 + i * 0.25;
            const p = pop(t, at);
            return (
              <text key={n} x={330 + i * 140} y={280 - p * 30} textAnchor="middle" fontFamily={nunito} fontWeight={900} fontSize={70} fill={K.sun} opacity={p * (1 - prog(t, 25.3, 25.6))}>
                {n}
              </text>
            );
          })}
          <g transform={`translate(540 800) rotate(${Math.sin(t * 20) * danger * 3})`}>
            <rect x={-230} y={-400} width={460} height={50} rx={25} fill={K.wood} />
            <rect x={-230} y={350} width={460} height={50} rx={25} fill={K.wood} />
            <rect x={-210} y={-360} width={26} height={720} rx={13} fill={K.woodDark} />
            <rect x={184} y={-360} width={26} height={720} rx={13} fill={K.woodDark} />
            <path d="M -170 -350 H 170 C 170 -150 30 -60 20 0 C 30 60 170 150 170 350 H -170 C -170 150 -30 60 -20 0 C -30 -60 -170 -150 -170 -350 Z" fill={K.teal} opacity={0.25} stroke={K.cream} strokeWidth={8} strokeOpacity={0.6} />
            <defs>
              <clipPath id="glass">
                <path d="M -170 -350 H 170 C 170 -150 30 -60 20 0 C 30 60 170 150 170 350 H -170 C -170 150 -30 60 -20 0 C -30 -60 -170 -150 -170 -350 Z" />
              </clipPath>
            </defs>
            <g clipPath="url(#glass)">
              <rect x={-200} y={lerp(-300, 0, drain)} width={400} height={400} fill={K.sun} />
              <rect x={-200} y={lerp(340, 20, drain)} width={400} height={400} fill={K.sun} />
              <path d={`M -200 ${lerp(340, 20, drain)} Q 0 ${lerp(250, -60, drain)} 200 ${lerp(340, 20, drain)} Z`} fill={K.sun} />
              {drain < 0.99 && <rect x={-5} y={-10} width={10} height={360} fill={K.sun} />}
              <rect x={40} y={-360} width={30} height={720} fill={K.white} opacity={0.18} />
            </g>
            {crack > 0 && (
              <path d="M 60 -200 L 20 -120 L 70 -60 L 10 20 L 60 110" stroke={K.white} strokeWidth={6} fill="none" strokeDasharray={600} strokeDashoffset={600 * (1 - crack)} />
            )}
          </g>
        </g>
      );
    }}
  </Shell>
);

/* 10 · "¿O si el tiempo… es irrelevante?" — clocks melt, then shatter into a galaxy */
const Melt = () => (
  <Shell start={27.9} end={33.95} bg={["#150D3F", "#4A2A8C"]}>
    {(t) => {
      const melt = ease(prog(t, 28.5, 32.3));
      const shatter = prog(t, 32.5, 33.6);
      const galaxy = ease(prog(t, 28.0, 33.9));
      const clocks = [
        [540, 700, 150],
        [250, 460, 90],
        [830, 520, 100],
        [270, 1080, 80],
        [820, 1120, 95],
      ];
      return (
        <g>
          <Stars t={t} seed="ml" count={170} />
          <g transform={`translate(540 820) rotate(${t * 25})`} opacity={0.35 + galaxy * 0.5}>
            {Array.from({ length: 220 }).map((_, i) => {
              const arm = i % 3;
              const d = (i / 220) * 520;
              const a = d / 90 + (arm * Math.PI * 2) / 3;
              return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d * 0.9} r={2 + (1 - d / 520) * 5} fill={[K.pink, K.teal, K.sun][arm]} opacity={0.8 * galaxy} />;
            })}
            <Glow cx={0} cy={0} r={260} color={K.pink} opacity={galaxy} id="gal" />
          </g>
          {shatter === 0 &&
            clocks.map(([x, y, r], i) => (
              <Clock key={i} x={x} y={y + melt * 40} r={r} t={t} speed={3 - melt * 2.6} melt={melt * (0.6 + (i % 2) * 0.4)} rot={Math.sin(t * 0.7 + i) * 12} />
            ))}
          {clocks.map(([x, y, r], i) => (
            <Burst key={i} x={x} y={y} p={shatter} seed={`sh${i}`} n={22} radius={r * 3} colors={[K.cream, K.orange, K.pink, K.sun]} size={r * 0.12} />
          ))}
        </g>
      );
    }}
  </Shell>
);

/* 11 · "Ah, si el mundo se acabara mañana," — sunrise over the planet rim */
const Dawn = () => (
  <Shell start={33.95} end={37.1} bg={[K.night, "#3A1F6E"]} origin={[540, 1150]} exitZoom={3.4}>
    {(t) => {
      const sunrise = ease(prog(t, 33.95, 35.8));
      return (
        <g>
          <Stars t={t} seed="dw" count={150} drift={-t * 8} />
          <Glow cx={540} cy={1180} r={lerp(500, 900, sunrise)} color={K.orange} opacity={sunrise} id="sunrise" />
          <Sun cx={540} cy={lerp(1400, 960, sunrise)} r={200} t={t} id="dsun" />
          <Planet cx={540} cy={1500} r={560} t={t} id="p3" spin={10} glow={K.orange} />
          <Comet x={860} y={330} angle={-30} len={220} size={10} id="c3" heat={0.6} />
        </g>
      );
    }}
  </Shell>
);

/* 12 · "podríamos ayudarnos mucho unos a otros." — people ring the planet, holding hands */
const SKINS = ["#F0913A", "#B8642E", "#FFC48A", "#8A4A26", "#E8A06A"];
const HAIRS = ["#231A3F", "#B8303F", "#5A3A1E", "#E8E2F0", "#1B1740"];

const Together = () => (
  <Shell start={37.1} end={44.6} bg={[K.night, "#2A1B6A"]} exitZoom={1}>
    {(t) => {
      const zoomOut = ease(prog(t, 40.6, 42.2));
      const s = lerp(1.7, 0.72, zoomOut);
      const ring = ease(prog(t, 39.9, 40.8));
      const title = pop(t, 41.9, { damping: 16 });
      const colors = [K.teal, K.pink, K.orange, K.sun, K.coral, "#8C7CFF"];
      const n = 16;
      return (
        <g>
          <Stars t={t} seed="tg" count={170} drift={-t * 6} />
          <g transform={`translate(540 ${lerp(1180, 880, zoomOut)}) scale(${s})`}>
            <Glow cx={0} cy={0} r={560} color={K.sun} opacity={0.35 + ring * 0.45} id="ringglow" />
            <Planet cx={0} cy={0} r={300} t={t} id="p4" spin={8} />
            <circle r={395} fill="none" stroke={K.sun} strokeWidth={10} strokeDasharray={2482} strokeDashoffset={2482 * (1 - ring)} opacity={0.9} />
            {Array.from({ length: n }).map((_, i) => {
              const a = (i / n) * 360 - 90;
              const up = pop(t, 37.3 + ((i * 7) % n) * 0.13, { damping: 10 });
              const help = i % 2 === 1 ? ease(prog(t, 38.3 + i * 0.05, 38.9 + i * 0.05)) : 1;
              return (
                <g key={i} transform={`rotate(${a + 90}) translate(0 -300)`} opacity={up}>
                  <g transform={`scale(${0.42 * up}) translate(0 ${(1 - help) * 60})`}>
                    <Figure x={0} y={0} color={colors[i % colors.length]} skin={SKINS[i % SKINS.length]} hair={HAIRS[i % HAIRS.length]} curly={i % 3 === 1} t={t + i} armL={lerp(20, 80, ring)} armR={lerp(-20, -80, ring)} bounce={0.6} />
                  </g>
                </g>
              );
            })}
          </g>
          <Burst x={540} y={880} p={prog(t, 40.35, 41.6)} seed="tb" n={40} radius={520} size={10} />
          <g opacity={title} transform={`translate(540 ${lerp(360, 320, title)})`}>
            <text textAnchor="middle" fontFamily={nunito} fontWeight={900} fontSize={76} fill={K.white}>
              Si el mundo
            </text>
            <text y={92} textAnchor="middle" fontFamily={nunito} fontWeight={900} fontSize={76} fill={K.sun}>
              se acabara mañana
            </text>
          </g>
        </g>
      );
    }}
  </Shell>
);

export const Scenes = () => (
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
