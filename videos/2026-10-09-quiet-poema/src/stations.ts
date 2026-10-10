/**
 * The 12 stations of the poem. Each returns { bg, g } where g is SVG markup (1080x1350).
 * `t` is the global time in seconds (quantized to 12 fps), `lt` the time since the station began.
 */
import {
  C, V, add, arm, blinkAt, body, bowler, cat, cl01, clamp, ease, easeOutBack, f, grp, headD, leg, limbD, lp, P, person,
  ramp, scaleAt, starsD, st, sub, topHat, torsoD, walker,
} from "./rig";

export type Scene = { bg: string; g: string; over?: string };

/* ---------- shared props ---------- */
const WALK_SPEED = 228; // px/s that matches the walk cycle stride
function tufts(t: number, speed: number, y: number, col = C.deep) {
  let s = "";
  for (let i = 0; i < 9; i++) {
    const x = ((((i * 157 - t * speed) % 1350) + 1350) % 1350) - 130;
    s += st(`M${f(x)} ${y} l8 -22 M${f(x + 14)} ${y} l2 -30 M${f(x + 26)} ${y} l-6 -20`, col, 7);
  }
  return s;
}
function icon(kind: string, x: number, y: number, a: number, k = 1) {
  if (a <= 0) return "";
  let s = "";
  if (kind === "mirror")
    s = `<ellipse cx="0" cy="-20" rx="44" ry="56" fill="${C.cream}" stroke="${C.ink}" stroke-width="9"/>${st("M-16 -44 q14 -12 26 -4", C.blue, 7)}${st("M0 36 L0 86", C.ink, 14)}`;
  if (kind === "coins")
    s = [0, 1, 2].map((i) => `<ellipse cx="0" cy="${40 - i * 26}" rx="52" ry="16" fill="${C.yellow}" stroke="${C.ink}" stroke-width="7"/><path d="M-52 ${40 - i * 26} L-52 ${52 - i * 26} Q0 ${76 - i * 26} 52 ${52 - i * 26} L52 ${40 - i * 26}" fill="${C.yellow}" stroke="${C.ink}" stroke-width="7"/>`).reverse().join("") + `<ellipse cx="0" cy="-12" rx="52" ry="16" fill="${C.yellow}" stroke="${C.ink}" stroke-width="7"/>`;
  if (kind === "laurel") {
    const branch = (sg: number) => st(`M0 60 Q${-60 * sg} 20 ${-40 * sg} -50`, C.deep, 8) +
      [0, 1, 2, 3].map((i) => `<ellipse cx="${f(-sg * (52 - i * 2) + (i === 3 ? 10 * sg : 0))}" cy="${40 - i * 28}" rx="11" ry="22" fill="${C.mint}" stroke="${C.ink}" stroke-width="5" transform="rotate(${sg * 40} ${f(-sg * (52 - i * 2))} ${40 - i * 28})"/>`).join("");
    s = branch(1) + branch(-1);
  }
  if (kind === "hourglass")
    s = `<path d="M-40 -60 L40 -60 L4 0 L40 60 L-40 60 L-4 0Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/><path d="M-20 44 L20 44 L0 22Z" fill="${C.yellow}"/>${st("M-50 -62 L50 -62 M-50 62 L50 62", C.ink, 12)}`;
  if (kind === "fabric")
    s = `<rect x="-70" y="-34" width="140" height="68" rx="34" fill="${C.pink}" stroke="${C.ink}" stroke-width="8"/>${st("M-40 -34 L-40 34 M-10 -34 L-10 34 M20 -34 L20 34", C.cream, 7)}<path d="M50 34 L90 70 L60 70 L30 40Z" fill="${C.pink}" stroke="${C.ink}" stroke-width="7"/>`;
  if (kind === "storm")
    s = `<path d="M-60 10 Q-70 -30 -30 -30 Q-20 -60 15 -50 Q50 -60 58 -24 Q80 -10 62 14Z" fill="${C.grey}" stroke="${C.ink}" stroke-width="8"/><path d="M0 14 L-16 46 L4 46 L-8 76" fill="none" stroke="${C.yellow}" stroke-width="8" stroke-linejoin="round"/>`;
  if (kind === "eye")
    s = `<path d="M-64 0 Q0 -54 64 0 Q0 54 -64 0Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="8"/><circle cx="0" cy="0" r="22" fill="${C.mint}" stroke="${C.ink}" stroke-width="6"/><circle cx="0" cy="0" r="9" fill="${C.ink}"/>`;
  if (kind === "moon")
    s = `<path d="M10 -60 A60 60 0 1 0 10 60 A46 46 0 1 1 10 -60Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="8"/>`;
  if (kind === "heart")
    s = `<path d="M0 30 C-50 -6 -34 -46 0 -22 C34 -46 50 -6 0 30Z" fill="${C.pink}" stroke="${C.ink}" stroke-width="7"/>`;
  const sc = (0.85 + 0.15 * easeOutBack(cl01(a))) * k;
  return `<g opacity="${cl01(a).toFixed(2)}" transform="translate(${f(x)} ${f(y)}) scale(${sc.toFixed(3)})">${s}</g>`;
}

/* ---------- writing at the desk (stations 1 and 11) ---------- */
const BOOK = 500, INK: V = [692, 846], LINES: V[] = [[512, 902], [512, 914], [512, 926]], LW = 92;
const PH: [string, number, number][] = [["flip", 0, 0.7], ["toInk", 0.7, 1.25], ["dip", 1.25, 1.95], ["toLine", 1.95, 2.45],
  ["w0", 2.45, 3.85], ["r1", 3.85, 4.1], ["w1", 4.1, 5.5], ["r2", 5.5, 5.75], ["w2", 5.75, 7.15], ["rest", 7.15, 7.4]];
const LOOPW = 7.4;
const writeAt = (i: number, u: number): V => {
  const [x0, y0] = LINES[i], ue = u * u * (3 - 2 * u) * 0.25 + u * 0.75;
  return [x0 + LW * ue + 5 * Math.sin(u * Math.PI * 2 * 7), y0 - 1 + 5 * Math.cos(u * Math.PI * 2 * 7) * Math.sin(u * Math.PI)];
};
const lineEnd = (i: number) => writeAt(i, 1);
const corner = (k: number): V => [BOOK + 116 * Math.cos(Math.PI * k), 936 - 70 * Math.sin(Math.PI * k)];
function tipAt(lt: number): V {
  const ph = PH.find((p) => lt >= p[1] && lt < p[2]) ?? PH[PH.length - 1];
  const u = cl01((lt - ph[1]) / (ph[2] - ph[1])), n = ph[0];
  const arc = (a: V, b: V, k: number, hgt: number): V => { const e = ease(k), p = lp(a, b, e); return [p[0], p[1] - hgt * Math.sin(Math.PI * e)]; };
  if (n === "flip") return lp(lineEnd(2), add(corner(ease(u)), [0, -8]), cl01(u * 3));
  if (n === "toInk") return arc(add(corner(1), [0, -8]), INK, u, 50);
  if (n === "dip") return [INK[0], INK[1] + 16 * Math.abs(Math.sin(u * Math.PI * 2))];
  if (n === "toLine") return arc(INK, LINES[0], u, 40);
  if (n[0] === "w") return writeAt(+n[1], u);
  if (n === "rest") return lineEnd(2);
  return arc(lineEnd(+n[1] - 1), LINES[+n[1]], u, 14);
}
function trail(i: number, lt: number) {
  const ph = PH.find((p) => p[0] === "w" + i)!;
  if (lt < ph[1]) return "";
  const u = cl01((lt - ph[1]) / (ph[2] - ph[1])), pts: V[] = [];
  for (let s = 0; s <= u + 1e-6; s += 0.012) pts.push(writeAt(i, s));
  return pts.length > 1 ? st(P(pts), C.ink, 4) : "";
}
function desk(t: number, lt0: number, extras: { hat?: number; cat?: number; sergio?: number; heart?: number } = {}) {
  const lt = ((lt0 % LOOPW) + LOOPW) % LOOPW, tip = tipAt(lt);
  const inkLean = lt >= 0.7 && lt < 2.45 ? Math.sin(Math.PI * cl01((lt - 0.7) / 1.75)) : 0;
  const angle = 0.025 + 0.2 * inkLean + (tip[0] - 560) * 0.0005 + 0.006 * Math.sin(t * 2.1);
  const b = body({ pelvis: [540, 968], angle, bow: -8, nod: [0, 6 + 4 * Math.sin(t * 1.7)] });
  const hand = add(tip, [7, -15]);
  const aR = arm(b, hand, [1, 0.55], 0.72), aL = arm(b, [446 + 6 * inkLean, 918], [-1, 0.55], 0.72);
  const look: V = [clamp((tip[0] - b.head[0]) * 0.09, -10, 14), clamp(12 + (tip[1] - 880) * 0.05, 6, 18)];
  const flipK = lt < 0.7 ? ease(cl01(lt / 0.7)) : 1, sx = Math.cos(Math.PI * flipK), turning = lt < 0.7;
  const pageR = `<path d="M${BOOK} 890 L${BOOK + 120} 895 L${BOOK + 140} 942 L${BOOK} 936Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>`;
  const written = [0, 1, 2].map((i) => trail(i, turning ? 99 : lt)).join("");
  const page = turning ? `<g transform="translate(${BOOK} 0) scale(${f(sx)} 1) translate(${-BOOK} ${f(-28 * Math.sin(Math.PI * flipK))})">${pageR}${sx > 0 ? written : ""}</g>` : "";
  let g = `<ellipse cx="560" cy="1158" rx="420" ry="26" fill="${C.deep}" opacity=".35"/>`;
  if (extras.hat !== undefined) {
    const a = ramp(t, extras.hat, 0.35);
    // the boss: the same bowler-hat silhouette that walks with him later, standing behind the desk
    g += person(812, 1010, 470, "hat", a);
  }
  if (extras.sergio !== undefined) {
    // Sérgio: hunched profile at his own desk, a bit further back
    const a = ramp(t, extras.sergio, 0.5), w = Math.sin(t * 9) * 4;
    const sb = body({ pelvis: [800, 900], angle: 0.62 + 0.02 * Math.sin(t * 1.3), bow: -36, nod: [10, 14] });
    const sa = arm(sb, [918 + w, 878], [-0.2, 1], 0.9), sa2 = arm(sb, [900, 884], [-0.2, 1], 0.9);
    const sg = limbD(sa2) + torsoD(sb) + headD(sb, { view: "right", blink: blinkAt(t + 2), ly: 14 }) + limbD(sa) +
      `<rect x="760" y="872" width="220" height="16" fill="${C.ink}"/>`;
    g += grp(sg, `translate(-60 -34) ${scaleAt(860, 890, 0.62)}`, a);
  }
  g += torsoD(b) + headD(b, { blink: blinkAt(t), lx: look[0], ly: look[1] });
  g += `<path d="M230 880 L850 880 L890 950 L190 950Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="10" stroke-linejoin="round"/>
    <rect x="210" y="950" width="660" height="200" fill="${C.tan}" stroke="${C.ink}" stroke-width="10"/>
    ${st("M300 1010 L780 1010", C.ink, 6)}<circle cx="540" cy="1060" r="9" fill="${C.ink}"/>
    <path d="M${BOOK} 890 L${BOOK - 120} 895 L${BOOK - 140} 942 L${BOOK} 936Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    ${st(`M${BOOK - 112} 904 l96 -2 M${BOOK - 116} 916 l100 -2 M${BOOK - 120} 928 l104 -2`, C.ink, 4, 'opacity=".7"')}
    ${turning ? pageR : pageR + written}${page}
    <rect x="${INK[0] - 30}" y="860" width="60" height="44" rx="9" fill="${C.ink}"/><rect x="${INK[0] - 13}" y="846" width="26" height="18" fill="${C.ink}"/>`;
  g += limbD(aL) + limbD(aR);
  const qe = add(tip, [30, -62]);
  g += st(P([tip, qe]), C.ink, 22) + st(P([add(tip, [4, -8]), qe]), C.cream, 11);
  if (extras.cat !== undefined) {
    const a = ramp(t, extras.cat, 0.3);
    g += grp(cat(300, 922, 0.72, t, look[0] * 0.3), `translate(0 ${f(-40 * (1 - a))})`, a);
  }
  if (extras.heart !== undefined && t > extras.heart && t < extras.heart + 2.4) {
    const k = (t - extras.heart) / 2.4;
    g += icon("heart", b.head[0] + 70 + 20 * Math.sin(k * 9), b.head[1] - 40 - 160 * k, Math.min(1, k * 6) * (1 - k), 0.8);
  }
  return `<g transform="${scaleAt(540, 1150, 1.45)}">${g}</g>`;
}

/* ---------- stations ---------- */
export function sDesk(t: number, lt: number): Scene {
  const ta = 1 - ramp(t, 7.6, 0.7);
  const title = `<text x="540" y="235" text-anchor="middle" font-family="Marcellus" font-size="118" letter-spacing="3" fill="${C.cream}" opacity="${ta.toFixed(2)}">DESASOSIEGO</text>`;
  return { bg: C.sage, g: desk(t, lt, { hat: 13.36, cat: 20.75 }), over: title };
}

export function sIsland(t: number, lt: number): Scene {
  const br = Math.sin(t * 2 * Math.PI * 0.22), tap = Math.sin(t * 2 * Math.PI * 1.2);
  const b = body({ pelvis: [468, 912], angle: 0.68, spine: 174 + 3 * br, bow: 6 });
  const a1 = arm(b, add(b.head, [-6, -62]), [-0.3, -1]), a2 = arm(b, [500 + 2 * br, 868], [0.6, 0.8], 0.9);
  const l1 = leg(b, [318, 1074], [0.7, 0.3]), l2 = leg(b, [296 + 6 * tap, 1050 - 4 * tap], [-0.7, -0.3]);
  const bob = Math.sin(t * 1.6) * 8, cx = 330, cy = 390 + bob, wv = (t * 30) % 60;
  const bub = ramp(t, 24.3, 0.5), isl = ramp(t, 26.8, 0.6);
  let g = `<path d="M560 0 L1080 0 L1080 720 Q990 650 920 700 Q840 610 770 540 Q650 480 690 370 Q560 300 600 140 Q540 80 560 0Z" fill="${C.deep}" filter="url(#rough)"/>`;
  let fig = `<ellipse cx="480" cy="890" rx="300" ry="190" fill="${C.deep}" opacity=".18"/>`;
  fig += limbD(l1) + limbD(l2) + limbD(a1) + torsoD(b) + headD(b, { blink: true, smile: true }) + limbD(a2);
  const bubble = `<circle cx="532" cy="${f(612 + bob * 0.5)}" r="13" fill="${C.cream}" stroke="${C.ink}" stroke-width="6"/>
    <circle cx="480" cy="${f(556 + bob * 0.7)}" r="22" fill="${C.cream}" stroke="${C.ink}" stroke-width="7"/>
    <clipPath id="bub"><circle cx="${cx}" cy="${f(cy)}" r="150"/></clipPath>
    <g clip-path="url(#bub)"><rect x="170" y="${f(cy - 160)}" width="320" height="320" fill="${C.cream}"/>
      <circle cx="${cx - 60}" cy="${f(cy - 70)}" r="26" fill="${C.yellow}"/>
      <rect x="170" y="${f(cy + 20)}" width="320" height="160" fill="${C.blue}"/>
      <g transform="translate(0 ${f(80 * (1 - isl))})">
      <ellipse cx="${cx + 20}" cy="${f(cy + 28)}" rx="70" ry="22" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6"/>
      ${st(`M${cx + 30} ${f(cy + 20)} Q${cx + 40} ${f(cy - 20)} ${cx + 14} ${f(cy - 62)}`, C.ink, 9)}
      ${[[-50, -8], [-30, 20], [40, -4], [30, 26]].map(([a, c]) => st(`M${cx + 14} ${f(cy - 62)} q${a / 2} ${c / 2 - 14} ${a} ${c}`, C.deep, 13)).join("")}</g>
      <rect x="170" y="${f(cy + 34)}" width="320" height="150" fill="${C.blue}"/>
      ${[0, 1, 2].map((i) => st(`M${f(180 - wv + i * 120)} ${f(cy + 75 + i * 22)} q15 -10 30 0 t30 0`, C.cream, 5)).join("")}</g>
    <circle cx="${cx}" cy="${f(cy)}" r="150" fill="none" stroke="${C.ink}" stroke-width="10"/>`;
  fig += grp(bubble, scaleAt(470, 600, 0.6 + 0.4 * bub), bub);
  g += `<g transform="${scaleAt(480, 900, 1.12)}">${fig}</g>`;
  return { bg: C.sage, g };
}

export function sCafe(t: number, lt: number): Scene {
  const lp4 = lt % 4.2;
  const lift = lp4 < 1.2 ? 0 : lp4 < 2.0 ? ease((lp4 - 1.2) / 0.8) : lp4 < 2.9 ? 1 : lp4 < 3.7 ? 1 - ease((lp4 - 2.9) / 0.8) : 0;
  const bad = ramp(t, 43.3, 0.5);
  const b = body({ pelvis: [540, 1000], angle: 0.01 * Math.sin(t), bow: -4, nod: [0, 4 - 6 * lift] });
  const cupRest: V = [628, 920], cupMouth: V = add(b.head, [30, 44]);
  const cupP = lp(cupRest, cupMouth, lift);
  // the hand grips the handle (right side of the cup), elbow out
  const aR = arm(b, add(cupP, [40, -8]), [1, 0.4], 0.8), aL = arm(b, [452, 930], [-1, 0.6], 0.8);
  const lL = leg(b, [492, 1150], [-0.4, -1]), lR = leg(b, [588, 1150], [0.4, -1]);
  let g = `<ellipse cx="540" cy="1158" rx="300" ry="22" fill="${C.ink}" opacity=".25"/>`;
  g += st("M430 1004 L650 1004 M440 1004 L432 1150 M640 1004 L648 1150", C.ink, 10);
  g += limbD(lL) + limbD(lR) + torsoD(b) + headD(b, { blink: blinkAt(t) || (lift > 0.9), sad: bad > 0.5, ly: 8 - 8 * lift, lx: 4 });
  g += `<ellipse cx="540" cy="932" rx="200" ry="34" fill="${C.cream}" stroke="${C.ink}" stroke-width="10"/>${st("M540 966 L540 1140 M470 1146 L610 1146", C.ink, 12)}`;
  g += limbD(aL);
  const cup = `<path d="M-26 -30 L26 -30 L20 14 Q0 22 -20 14Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>${st("M24 -20 q20 2 12 20 q-6 8 -16 4", C.ink, 6)}`;
  g += limbD(aR); // arm behind the cup: the hand holds the handle
  g += `<g transform="translate(${f(cupP[0])} ${f(cupP[1])})">${cup}</g>`;
  if (lift < 0.1) g += [0, 1].map((i) => st(`M${f(cupRest[0] - 8 + i * 16)} ${f(cupRest[1] - 44)} q-10 -16 0 -30 t0 -30`, C.cream, 5, `opacity="${(0.4 + 0.3 * Math.sin(t * 3 + i)).toFixed(2)}"`)).join("");
  if (bad > 0) {
    const cxx = b.head[0], cyy = b.head[1] - 150 + 4 * Math.sin(t * 1.5);
    let cloud = `<path d="M-80 20 Q-96 -26 -46 -30 Q-34 -70 8 -60 Q50 -72 62 -30 Q100 -24 88 20Z" fill="${C.grey}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>`;
    for (let i = 0; i < 4; i++) { const k = ((t * 1.4 + i / 4) % 1); cloud += st(`M${-48 + i * 32} ${f(34 + k * 70)} l-4 12`, C.tear, 6, `opacity="${(1 - k).toFixed(2)}"`); }
    g += grp(cloud, `translate(${f(cxx)} ${f(cyy)}) scale(${(0.7 + 0.3 * bad).toFixed(2)})`, bad);
  }
  return { bg: C.blue, g: `<g transform="${scaleAt(540, 1150, 1.18)}">${g}</g>` };
}

const CREW: [number, number, string, number, number][] = [
  // x, height, kind, cue, hunch
  [120, 400, "hat", 54.34, 0], [250, 440, "", 57.03, 0], [360, 300, "tray", 64.8, 0], [840, 360, "", 58.59, 0], [960, 300, "letters", 61.4, 0],
];
function crew(t: number, spread = 0, fade = 1) {
  return CREW.map(([x, h, k, cue]) => person(x + (x < 540 ? -spread : spread), 1080, h, k, ramp(t, cue, 0.35) * fade)).join("") +
    cat(722 + spread, 1080, 0.5, t, 0, ramp(t, 66.75, 0.35) * fade);
}
export function sSorrow(t: number, lt: number): Scene {
  const br = Math.sin(t * 2 * Math.PI * 0.25);
  const b = body({ pelvis: [478, 1062], angle: 0.5 + 0.02 * br, bow: -34, spine: 170, nod: [8, 16] });
  const lFar = leg(b, [628, 1074], [0.4, -1]), lNear = leg(b, [646, 1070], [0.4, -1]);
  const aFar = arm(b, [652 + 2 * br, 984], [-0.3, 1]), aNear = arm(b, [660 + 2 * br, 996], [-0.3, 1]);
  const ph = (t % 2.4) / 2.4, eye = add(b.head, [26, 10]), ty = eye[1] + 10 + ph * ph * (1066 - eye[1]);
  let g = `<ellipse cx="540" cy="1086" rx="470" ry="24" fill="${C.deep}" opacity=".4"/>` + crew(t);
  g += limbD(aFar) + limbD(lFar) + limbD(lNear) + torsoD(b) + headD(b, { view: "right", blink: blinkAt(t), sad: true, ly: 12 }) + limbD(aNear);
  if (t > 47.4 && ty < 1066) g += `<path d="M${f(eye[0])} ${f(ty)} q-9 14 0 20 q9 -6 0 -20Z" fill="${C.tear}" stroke="${C.ink}" stroke-width="4"/>`;
  return { bg: C.mint, g: `<g transform="${scaleAt(540, 1086, 1.12)}">${g}</g>` };
}

export function sThreads(t: number, lt: number): Scene {
  const away = ramp(t, 82.4, 3.2), dim = ramp(t, 86.4, 1);
  const spread = 120 * away;
  const b = body({ pelvis: [540, 890], angle: 0.008 * Math.sin(t * 1.1), nod: [0, 6] });
  const chest: V = add(b.sh, [8, 40]);
  const onChest = ramp(t, 70.2, 0.6) * (1 - ramp(t, 80.5, 0.6));
  const aR = arm(b, lp([616, 1050], add(chest, [10, 6]), onChest), [1, 0.4]);
  const aL = arm(b, [466, 1050], [-1, 0.2]);
  const lL = leg(b, [500, 1080], [-0.25, -1]), lR = leg(b, [580, 1080], [0.25, -1]);
  let g = `<ellipse cx="540" cy="1086" rx="470" ry="24" fill="${C.deep}" opacity=".4"/>`;
  let threads = "";
  CREW.forEach(([x, h], i) => {
    const xx = x + (x < 540 ? -spread : spread), target: V = [xx, 1080 - h * 0.56 * 0.62];
    const k = ramp(t, 68.4 + i * 0.4, 0.8), sag = 40 + 30 * away;
    const mid = add(lp(chest, target, 0.5), [0, sag]);
    const d = `M${f(chest[0])} ${f(chest[1])} Q${f(mid[0])} ${f(mid[1])} ${f(target[0])} ${f(target[1])}`;
    const L = 700;
    threads += st(d, C.cream, 4, `stroke-dasharray="${L}" stroke-dashoffset="${f(L * (1 - k))}" opacity="${(0.9 * (1 - away)).toFixed(2)}"`);
  });
  g += crew(t, spread, 1 - 0.55 * away) + threads;
  g += limbD(lL) + limbD(lR) + limbD(aL) + torsoD(b) + headD(b, { blink: blinkAt(t), sad: t > 72.5, ly: 10 }) + limbD(aR);
  const ph = ((t - 73.2) % 2.4) / 2.4, ty = b.head[1] + 30 + ph * ph * 300;
  if (t > 73.2 && t < 77.9 && ty < 1060) g += `<path d="M${f(b.head[0] - 21)} ${f(ty)} q-9 14 0 20 q9 -6 0 -20Z" fill="${C.tear}" stroke="${C.ink}" stroke-width="4"/>`;
  const shade = `<rect width="1080" height="1350" fill="${C.deep}" opacity="${(0.45 * dim).toFixed(2)}"/>`;
  return { bg: C.mint, g: `<g transform="${scaleAt(540, 1086, 1.12)}">${g}</g>${shade}` };
}

const COATS = ["#27282f", C.yellow, C.pink, C.cream, C.deep];
function coat(b: ReturnType<typeof body>, aL: { pts: V[] }, aR: { pts: V[] }, col: string) {
  const sh = b.sh, pv = b.pelvis;
  const sleeves = [aL, aR].map((a) => st(P(a.pts.slice(0, 2).concat([lp(a.pts[1], a.pts[2], 0.8)])), C.ink, 40) + st(P(a.pts.slice(0, 2).concat([lp(a.pts[1], a.pts[2], 0.8)])), col, 26)).join("");
  const body2 = `<path d="M${f(sh[0] - 46)} ${f(sh[1] - 4)} L${f(sh[0] + 46)} ${f(sh[1] - 4)} L${f(pv[0] + 48)} ${f(pv[1] + 34)} L${f(pv[0] - 48)} ${f(pv[1] + 34)}Z" fill="${col}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>`;
  const lapel = `<path d="M${f(sh[0] - 16)} ${f(sh[1] - 4)} L${f(sh[0])} ${f(sh[1] + 60)} L${f(sh[0] + 16)} ${f(sh[1] - 4)}Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="6"/>${st(P([[sh[0], sh[1] + 60], [pv[0], pv[1] + 30]]), C.ink, 5)}`;
  return sleeves + body2 + lapel;
}
export function sWardrobe(t: number, lt: number): Scene {
  const per = 3.6, cyc = Math.floor(Math.max(0, lt - 0.6) / per), k = (Math.max(0, lt - 0.6) % per) / per;
  const col = COATS[cyc % COATS.length];
  const drop = k < 0.15 ? 1 - ease(k / 0.15) : k > 0.85 ? -ease((k - 0.85) / 0.15) : 0;
  const armsUp = k < 0.2 ? Math.sin(Math.PI * k / 0.2) : k > 0.82 ? Math.sin(Math.PI * cl01((k - 0.82) / 0.18)) : 0;
  const b = body({ pelvis: [470, 888], angle: 0.01 * Math.sin(t * 1.3) });
  const aL = arm(b, lp([400, 1040], [360, 760], armsUp), [-1, 0.3]), aR = arm(b, lp([540, 1040], [580, 760], armsUp), [1, 0.3]);
  const lL = leg(b, [430, 1080], [-0.25, -1]), lR = leg(b, [510, 1080], [0.25, -1]);
  const look = k > 0.2 && k < 0.82 ? Math.sin((k - 0.2) / 0.62 * Math.PI * 2) * 12 : 0;
  let g = `<ellipse cx="560" cy="1086" rx="400" ry="22" fill="${C.ink}" opacity=".25"/>`;
  // coat rack
  g += st("M820 1080 L820 640 M760 1080 L820 1040 L880 1080 M780 660 L860 660", C.ink, 12);
  [[760, C.yellow, 0], [880, C.pink, 1.3]].forEach(([x, c, ph]) => {
    const sw = 3 * Math.sin(t * 1.5 + (ph as number));
    g += `<g transform="rotate(${f(sw)} ${x} 668)"><path d="M${x} 668 L${(x as number) - 40} 700 L${(x as number) - 48} 880 L${(x as number) + 48} 880 L${(x as number) + 40} 700Z" fill="${c}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/></g>`;
  });
  g += limbD(lL) + limbD(lR) + torsoD(b) + limbD(aL) + limbD(aR);
  if (lt > 0.6) {
    const dy = drop > 0 ? -300 * drop : 300 * drop;
    g += grp(coat(b, aL, aR, col), `translate(0 ${f(dy)})`, 1 - Math.abs(drop) * 0.6);
  }
  g += headD(b, { blink: blinkAt(t), lx: look, ly: k > 0.2 && k < 0.5 ? 14 : 4 });
  return { bg: C.blue, g: `<g transform="${scaleAt(540, 1080, 1.16)}">${g}</g>` };
}

export function sPatrons(t: number, lt: number): Scene {
  const vis = ramp(t, 111.2, 0.4), inv = ramp(t, 114.4, 0.4);
  const b = body({ pelvis: [540, 890], angle: 0.008 * Math.sin(t * 1.1) });
  const lL = leg(b, [500, 1080], [-0.25, -1]), lR = leg(b, [580, 1080], [0.25, -1]);
  const aL = arm(b, [466, 1050], [-1, 0.2]), aR = arm(b, [614, 1050], [1, 0.2]);
  const lx = t < 112 ? 0 : t < 114.3 ? -14 : 14;
  let g = `<ellipse cx="540" cy="1086" rx="470" ry="24" fill="${C.deep}" opacity=".35"/>`;
  g += person(230, 1080, 470, "hat", vis);
  if (inv > 0) {
    const x = 850, h = 470, w = h * 0.27, bh = h * 0.56, r = h * 0.115, y = 1080;
    g += `<g opacity="${inv.toFixed(2)}" fill="none" stroke="${C.cream}" stroke-width="6" stroke-dasharray="14 14">
      <rect x="${f(x - w / 2)}" y="${f(y - bh)}" width="${f(w)}" height="${f(bh)}" rx="${f(w * 0.42)}"/><circle cx="${x}" cy="${f(y - bh - r * 0.9)}" r="${f(r)}"/>
      <ellipse cx="${x}" cy="${f(y - bh - r * 1.55)}" rx="${f(r * 1.5)}" ry="${f(r * 0.28)}"/></g>`;
  }
  g += limbD(lL) + limbD(lR) + limbD(aL) + limbD(aR) + torsoD(b) + headD(b, { blink: blinkAt(t), lx, ly: 4 });
  return { bg: C.sage, g: `<g transform="${scaleAt(540, 1086, 1.12)}">${g}</g>` };
}

const ABSTRACT: [string, number, number][] = [["mirror", 220, 138.3], ["coins", 420, 139.2], ["laurel", 650, 141.5], ["hourglass", 860, 142.46]];
export function sWalk(t: number, lt: number): Scene {
  const ph = lt / 1.05, gone = ramp(t, 143.9, 1.6);
  let g = st("M-20 1080 L1100 1080", C.deep, 10) + tufts(t, WALK_SPEED, 1080);
  g += `<g transform="${scaleAt(380, 1080, 1.22)}">${walker(ph + 0.3, 380, 1080, { fill: C.ink }, true)}</g>`;
  g += walker(ph, 640, 1080, { blink: blinkAt(t), smile: t > 118.9 && t < 121.4, ly: 2 });
  ABSTRACT.forEach(([k, x, cue]) => {
    const a = ramp(t, cue, 0.4) * (1 - gone);
    g += icon(k, x, 330 + 12 * Math.sin(t * 1.4 + x) - 260 * gone, a, 1.05);
  });
  return { bg: C.mint, g };
}

export function sFriend(t: number, lt: number): Scene {
  const inF = ramp(t, 160.6, 0.5), point = ramp(t, 166.2, 0.35) * (1 - ramp(t, 169.6, 0.5));
  const sk = t > 170.3 ? ((t - 170.3) % 2.2) / 2.2 : -1;
  const shrug = sk >= 0 ? Math.sin(Math.PI * cl01(sk / 0.55)) : 0;
  const b = body({ pelvis: [380, 890], angle: 0.008 * Math.sin(t * 1.1), nod: [6 * shrug, -6 * shrug] });
  const sh2: V = add(b.sh, [0, -14 * shrug]);
  const bS = { ...b, sh: sh2 };
  const aL = arm(bS, lp([306, 1050], [270, 790], shrug), [-1, 0.4 - 1.2 * shrug]), aR = arm(bS, lp([454, 1050], [490, 790], shrug), [1, 0.4 - 1.2 * shrug]);
  const lL = leg(b, [340, 1080], [-0.25, -1]), lR = leg(b, [420, 1080], [0.25, -1]);
  let g = `<ellipse cx="540" cy="1086" rx="470" ry="24" fill="${C.deep}" opacity=".35"/>`;
  g += limbD(lL) + limbD(lR) + torsoD(b) + limbD(aL) + limbD(aR) + headD(b, { blink: blinkAt(t), sad: t > 166.4 && t < 172, lx: 8, ly: 4 });
  if (inF > 0) {
    const fx = 760 + 120 * (1 - inF);
    const fb = body({ pelvis: [fx, 890], angle: -0.01, nod: [0, 0] });
    const fR = arm(fb, lp([fx - 74, 1050], [fx - 170, 760], point), [-1, 0.3 - 0.8 * point], 1);
    const fL = arm(fb, [fx + 80, 1040], [1, 0.2]);
    const fl1 = leg(fb, [fx - 40, 1080], [-0.25, -1]), fl2 = leg(fb, [fx + 40, 1080], [0.25, -1]);
    let fr = limbD(fl1) + limbD(fl2) + torsoD(fb) + limbD(fL);
    fr += `<rect x="${f(fl1.e[0] + 92)}" y="988" width="96" height="70" rx="8" fill="${C.ink}"/>${st(`M${f(fl1.e[0] + 118)} 988 q22 -22 44 0`, C.ink, 8)}`;
    fr += headD(fb, { blink: blinkAt(t + 0.7), lx: -10, ly: 4 }) + topHat(fb.head) + limbD(fR);
    g += grp(fr, "translate(0 0)", inF);
  }
  const ICONS: [string, number][] = [["fabric", 179.66], ["mirror", 181.27], ["laurel", 182.4], ["storm", 183.24], ["eye", 184.44], ["moon", 185.44]];
  ICONS.forEach(([k, cue], i) => { g += icon(k, 130 + i * 164, 330 + 8 * Math.sin(t * 1.3 + i), ramp(t, cue, 0.35), 0.85); });
  return { bg: C.sage, g: `<g transform="${scaleAt(540, 1086, 1.12)}">${g}</g>` };
}

export function sNight(t: number, lt: number): Scene {
  const walking = t > 195.1 && t < 201.2, wt = Math.max(0, t - 195.1);
  const halo = (cue: number) => ramp(t, cue, 0.5);
  let g = starsD(t, 34);
  g += `<path d="M-60 1010 Q300 930 620 990 Q880 1030 1140 960 L1140 1360 L-60 1360Z" fill="${C.deep}" opacity=".55"/>`;
  [[180, 191.2], [290, 191.6], [860, 192.13]].forEach(([x, cue], i) => {
    const a = ramp(t, cue as number, 0.5);
    g += grp(person(x as number, 990 - i * 6, 170, "", 1) + `<ellipse cx="${x}" cy="${f(990 - i * 6 - 170 * 0.56 - 170 * 0.115 * 2.4)}" rx="26" ry="8" fill="none" stroke="${C.yellow}" stroke-width="6" opacity="${halo(i === 2 ? 192.13 : 192.13).toFixed(2)}"/>`, "translate(0 0)", a);
  });
  g += `<path d="M-60 1080 L1140 1080 L1140 1360 L-60 1360Z" fill="${C.deep}"/>` + st("M-60 1080 L1140 1080", C.ink, 10);
  if (walking) g += tufts(wt, WALK_SPEED, 1080, C.ink);
  // the office arrives with the walk
  const doorX = 700 + WALK_SPEED * Math.max(0, 201.2 - t);
  if (doorX < 1400) {
    const x = doorX;
    g += `<rect x="${f(x - 60)}" y="620" width="380" height="460" fill="${C.cream}" stroke="${C.ink}" stroke-width="10"/>
      <rect x="${f(x - 20)}" y="860" width="110" height="220" fill="${C.yellow}" stroke="${C.ink}" stroke-width="9"/>
      <rect x="${f(x + 150)}" y="760" width="120" height="100" fill="${C.yellow}" stroke="${C.ink}" stroke-width="9"/>${st(`M${f(x + 210)} 760 L${f(x + 210)} 860 M${f(x + 150)} 810 L${f(x + 270)} 810`, C.ink, 7)}
      <rect x="${f(x - 30)}" y="660" width="320" height="56" fill="${C.ink}"/>
      <text x="${f(x + 130)}" y="698" text-anchor="middle" font-family="Marcellus" font-size="26" letter-spacing="2" fill="${C.cream}">RUA DOS DOURADORES</text>`;
  }
  if (walking) g += walker(wt / 1.05, 420, 1080, { blink: blinkAt(t) });
  else {
    const b = body({ pelvis: [420, 890], angle: 0.008 * Math.sin(t) });
    if (t >= 201.2) g += tufts(201.2 - 195.1, WALK_SPEED, 1080, C.ink);
    g += limbD(leg(b, [384, 1080], [-0.25, -1])) + limbD(leg(b, [456, 1080], [0.25, -1])) + limbD(arm(b, [350, 1050], [-1, 0.2])) + limbD(arm(b, [490, 1050], [1, 0.2])) +
      torsoD(b) + headD(b, { blink: blinkAt(t), lx: t < 192 ? -12 : 12, ly: t >= 201.2 ? 4 : -4 });
  }
  return { bg: C.night, g };
}

export function sDesk2(t: number, lt: number): Scene {
  return { bg: C.sage, g: desk(t, lt, { cat: -1, sergio: 216.9, heart: 207.87 }) };
}

export function sStars(t: number, lt: number, end: number): Scene {
  const final = ramp(t, 241.7, 1.4);
  const l = lt % 7.2;
  const kLoop = l < 0.35 ? -0.08 * Math.sin(Math.PI * l / 0.35) : l < 1.9 ? easeOutBack(cl01((l - 0.35) / 1.55)) : l < 4.4 ? 1 + 0.02 * Math.sin((l - 1.9) * 3) : l < 6.1 ? 1 - ease(cl01((l - 4.4) / 1.7)) : 0;
  const k = lp([kLoop, 0], [1, 0], final)[0];
  const b = body({ pelvis: [544, 838], angle: -0.04 * k + 0.01 * Math.sin(t * 1.2), bow: 4, nod: [0, -4 * k] });
  const hR = lp([612, 812], [676, 548], k);
  const aR = arm(b, hR, [1, 0.25 - 0.6 * k]), aL = arm(b, [468, 1002], [-1, 0.2]);
  const lL = leg(b, [508, 1022], [-0.25, -1]), lR = leg(b, [592, 1022], [0.25, -1]);
  const n = Math.round(12 + 48 * cl01((t - 224) / 14));
  let g = starsD(t, n);
  const sp = (lt % 6.4) / 1.1;
  if (sp < 1 && t > 230) g += st(`M${f(820 - sp * 500)} ${f(120 + sp * 180)} l90 -32`, C.cream, 5);
  g += `<path d="M-60 1110 Q540 930 1140 1110 L1140 1360 L-60 1360Z" fill="${C.deep}" stroke="${C.ink}" stroke-width="10"/>`;
  const e = aR.e;
  let fig = limbD(lL) + limbD(lR) + limbD(aL) + torsoD(b) + headD(b, { blink: blinkAt(t), lx: 4 + 6 * k, ly: 8 - 26 * k }) + limbD(aR);
  fig += `<rect x="${f(e[0] - 20)}" y="${f(e[1] - 50)}" width="40" height="34" rx="6" fill="${C.ink}" stroke="${C.cream}" stroke-width="4"/>
    <rect x="${f(e[0] - 9)}" y="${f(e[1] - 62)}" width="18" height="14" fill="${C.ink}" stroke="${C.cream}" stroke-width="4"/>`;
  g += `<g transform="${scaleAt(540, 1022, 1.1)}">${fig}</g>`;
  const ca = ramp(t, end - 2.8, 0.7);
  const credit = `<g opacity="${ca.toFixed(2)}"><text x="540" y="1236" text-anchor="middle" font-family="Marcellus" font-size="58" letter-spacing="3" fill="${C.cream}">FERNANDO PESSOA</text>
    <text x="540" y="1296" text-anchor="middle" font-family="Marcellus" font-size="36" letter-spacing="2" fill="${C.cream}" opacity=".8">Libro del desasosiego</text></g>`;
  return { bg: C.night, g, over: credit };
}

export const STATIONS: { a: number; fn: (t: number, lt: number, end: number) => Scene }[] = [
  { a: 0, fn: sDesk },
  { a: 21.4, fn: sIsland },
  { a: 36.3, fn: sCafe },
  { a: 45.9, fn: sSorrow },
  { a: 67.8, fn: sThreads },
  { a: 87.6, fn: sWardrobe },
  { a: 109.1, fn: sPatrons },
  { a: 115.6, fn: sWalk },
  { a: 157.1, fn: sFriend },
  { a: 186.4, fn: sNight },
  { a: 204.6, fn: sDesk2 },
  { a: 223.8, fn: sStars },
];
export { sub };
