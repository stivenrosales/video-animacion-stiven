// @ts-nocheck
// Ported verbatim from work/board-v4.html (the approved animatic): every function returns SVG markup for time t.
const W = 1080, H = 1350, GY = 0.74 * H;
const C = { ink: '#192425', cream: '#f3f3e4', night: '#1c2b45', deep: '#1a543a', yellow: '#f2cf3a', pink: '#f4bbb3',
  mint: '#4e986e', sage: '#6b9b68', blue: '#3271a9', tan: '#d8cba6', tear: '#bfe0f0', grey: '#8a948f' };

// ---------- helpers ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const seg = (t, a, b) => io(clamp((t - a) / (b - a)));
const back = k => { const c1 = 1.70158, c3 = c1 + 1; return k <= 0 ? 0 : 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const pop = (t, a, d = .6) => back(clamp((t - a) / d));
const lerp = (a, b, k) => a + (b - a) * k;
const lp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const f = n => n.toFixed(1);
function kf(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const [a, va] = k[i - 1], [b, vb] = k[i]; return va + (vb - va) * io((t - a) / (b - a)); }
  return k[k.length - 1][1];
}
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, k) => '#' + hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], clamp(k))).toString(16).padStart(2, '0')).join('');
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const st = (d, col, w, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const sparkD = (x, y, s) => `M${f(x)} ${f(y - s)}Q${f(x + s * .16)} ${f(y - s * .16)} ${f(x + s)} ${f(y)}Q${f(x + s * .16)} ${f(y + s * .16)} ${f(x)} ${f(y + s)}Q${f(x - s * .16)} ${f(y + s * .16)} ${f(x - s)} ${f(y)}Q${f(x - s * .16)} ${f(y - s * .16)} ${f(x)} ${f(y - s)}Z`;

// ---------- song ----------
const WORDS = [[0.08, "¿Te"], [0.72, "vas"], [1.19, "borrando"], [2.78, "con"], [3.38, "la"], [3.78, "multitud?"], [6.0, "¿Puedo"], [7.09, "ver"], [7.62, "los"], [8.16, "munditos"], [9.59, "contra"], [10.69, "el"], [11.05, "cielo?"], [13.0, "¿Y"], [13.72, "cuándo"], [14.68, "aprieto"], [16.15, "los"], [16.78, "ojos"], [17.62, "veo"], [18.25, "tu"], [18.67, "voz?"], [20.0, "Fantástica,"], [22.16, "geométrica"], [23.96, "y"], [24.14, "multicolor"], [26.08, "Y"], [26.26, "es"], [26.72, "cuando"], [27.99, "tú"], [28.43, "me"], [28.87, "miras"], [29.97, "desde"], [31.08, "allá"], [32.0, "Y"], [32.72, "sonriéndome,"], [35.42, "me"], [35.84, "regresas"], [37.52, "hasta"], [38.57, "ti"], [39.0, "Y"], [39.72, "conoces"], [40.99, "bien"], [42.0, "mi"], [42.18, "habilidad"], [43.0, "de"], [43.57, "volar"], [45.0, "De"], [45.72, "divagar,"], [48.42, "me"], [48.85, "haces"], [49.89, "volar"], [51.08, "Me"], [51.68, "haces"], [52.29, "soñar,"], [53.56, "me"], [53.93, "haces"], [54.85, "sentir"], [56.0, "tranquilo"], [57.0, "en"], [57.46, "la"], [57.92, "oscuridad"], [60.0, "Me"], [60.72, "haces"], [61.74, "sentir,"], [63.72, "me"], [64.22, "haces"], [65.46, "llorar"], [67.0, "Me"], [67.68, "haces"], [68.22, "sentir"], [69.27, "que"], [69.79, "ya"], [70.14, "no"], [70.49, "existe"], [71.54, "gravedad"], [73.08, "Me"], [73.72, "haces"], [74.86, "reír,"], [76.45, "me"], [76.98, "haces"], [78.31, "cantar"], [80.0, "Me"], [80.72, "haces"], [81.57, "pisar"], [82.69, "el"], [83.14, "suelo"], [84.26, "de"], [84.7, "la"], [85.16, "realidad"], [87.0, "Sentados"], [89.28, "frente"], [90.99, "a"], [91.27, "frente"], [93.0, "Y"], [93.72, "encontrarnos"], [96.92, "nuevamente"]];
const LINES = [0.1, 6.0, 13.0, 20.0, 26.1, 32.0, 39.0, 45.0, 51.1, 53.6, 60.0, 67.0, 73.1, 80.0, 87.0, 93.0, 99.6];
const CH = [[0, 'multitud'], [6, 'munditos'], [13, 'ojos'], [20, 'geométrica'], [26, 'tú'], [31.5, 'despegue'],
  [43, 'volar'], [51, 'soñar'], [53.6, 'tranquilo'], [60, 'sentir/llorar'], [67, 'gravedad'], [73, 'reír/cantar'], [80, 'llegada'], [87, 'paraíso']];

// ---------- camera: tilt up, then a climb integrated from a speed profile (no velocity jumps) ----------
function climb(t) {
  if (t < 32.7) return 0;
  if (t < 36) return 110 * (t - 32.7) ** 2 / (2 * 3.3);
  const d1 = 110 * 3.3 / 2;
  if (t < 80) return d1 + 110 * (t - 36);
  const d2 = d1 + 110 * 44;
  if (t < 86) { const u = t - 80; return d2 + 110 * u - 95 * u * u / 12; }
  return d2 + 375;   // landed: the camera rests, so the rocket stays on its spot
}
const camY = t => kf(t, [[0, 0], [6.0, 0], [11.5, -1300]]) - climb(t);
const camX = t => 16 * Math.sin(t * .21);
const wy2s = (wy, t) => GY + wy - camY(t);

// ---------- sky ----------
const STARS = [...Array(240)].map(() => ({ x: rnd() * 1300 - 110, y: rnd() * 3200, z: .3 + rnd() * .7, r: 1.4 + rnd() * 2.6, f: .6 + rnd() * 1.8, p: rnd() * 6.28, born: rnd() }));
const SPARK = [...Array(16)].map(() => ({ x: rnd() * 1080, y: rnd() * 3200, s: 9 + rnd() * 9, p: rnd() * 6.28, born: rnd() }));
function wrapY(y, z, t) { const span = 3200; return ((y - camY(t) * z * .6) % span + span) % span - (span - H) / 2; }
function sky(t) {
  // "la multitud": the crowd of stars thickens while she fades into it
  const crowd = seg(t, .3, 4.2), laugh = seg(t, 74.5, 75.3) * (1 - seg(t, 79.5, 80.5)), dusk = seg(t, 93.7, 98) * .45;
  let s = '';
  for (const p of STARS) {
    const vis = clamp((crowd * 1.25 - p.born * .9) * 3, .0, 1) * (p.born < .25 ? 1 : 1);
    const y = wrapY(p.y, p.z, t), x = p.x + camX(t) * p.z;
    if (y < -10 || y > H + 10 || vis <= 0) continue;
    const tw = .55 + .45 * Math.sin(t * p.f * (1 + laugh * 4) + p.p);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(p.r * (1 + laugh * .5 * tw))}" fill="${C.cream}" opacity="${(Math.max(vis, p.born < .2 ? 1 : 0) * tw * p.z * (1 - dusk)).toFixed(2)}"/>`;
  }
  for (const p of SPARK) {
    const vis = clamp((crowd * 1.25 - p.born * .9) * 3);
    const y = wrapY(p.y, .8, t), sc = 1 + .25 * Math.sin(t * 1.3 + p.p) + laugh * .5 * Math.abs(Math.sin(t * 6 + p.p));
    if (y < -20 || y > H + 20 || !vis) continue;
    s += `<path d="${sparkD(p.x + camX(t) * .8, y, p.s * sc * vis)}" fill="${C.cream}" opacity="${(.9 * (1 - dusk)).toFixed(2)}"/>`;
  }
  return s;
}

// ---------- planets along the route ----------
const PLANETS = [
  { x: 210, y: -1900, r: 58, col: C.yellow, ring: C.tan, t0: 9.4 }, { x: 870, y: -1700, r: 36, col: C.pink, t0: 9.8, crat: 1 },
  { x: 640, y: -2060, r: 20, col: C.mint, t0: 10.2 },
  { x: 850, y: -2550, r: 26, col: C.blue, crat: 1 }, { x: 230, y: -3150, r: 84, col: C.blue, ring: C.cream },
  { x: 880, y: -3750, r: 30, col: C.tan, crat: 1 }, { x: 170, y: -4350, r: 40, col: C.mint },
  { x: 800, y: -4950, r: 62, col: C.tan, ring: C.yellow }, { x: 250, y: -5550, r: 24, col: C.yellow, crat: 1 },
  { x: 840, y: -6150, r: 34, col: C.blue, crat: 1 }, { x: 200, y: -6650, r: 22, col: C.yellow },
];
function planet(p, x, y, r, spin, id) {
  const ring = half => p.ring ? `<g transform="rotate(${f(spin)} ${f(x)} ${f(y)})">${st(`M${f(x - r * 1.9)} ${f(y)}A${f(r * 1.9)} ${f(r * .42)} 0 0 ${half} ${f(x + r * 1.9)} ${f(y)}`, C.ink, 16)}${st(`M${f(x - r * 1.9)} ${f(y)}A${f(r * 1.9)} ${f(r * .42)} 0 0 ${half} ${f(x + r * 1.9)} ${f(y)}`, p.ring, 7)}</g>` : '';
  return ring(1) + `<clipPath id="${id}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/></clipPath><g clip-path="url(#${id})">
    <circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${mix(p.col, C.ink, .38)}"/>
    <circle cx="${f(x - r * .24)}" cy="${f(y - r * .24)}" r="${f(r * .92)}" fill="${p.col}"/>
    ${p.crat ? `<circle cx="${f(x - r * .3)}" cy="${f(y + r * .1)}" r="${f(r * .16)}" fill="${mix(p.col, C.ink, .25)}"/><circle cx="${f(x + r * .2)}" cy="${f(y - r * .35)}" r="${f(r * .1)}" fill="${mix(p.col, C.ink, .25)}"/>` : ''}
    </g><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="none" stroke="${C.ink}" stroke-width="8"/>` + ring(0);
}
function planets(t) {
  let s = '';
  PLANETS.forEach((p, i) => {
    const k = p.t0 ? pop(t, p.t0, .7) : 1; if (!k) return;
    const x = p.x + camX(t) * .85, y = wy2s(p.y, t), r = p.r * k;
    if (y < -260 || y > H + 260) return;
    s += planet(p, x, y, r, (p.ring ? -18 : 0) + 4 * Math.sin(t * .5 + i), 'cp' + i);
  });
  return s;
}

// ---------- home hill + launch pad ----------
function ground(t) {
  const gy = wy2s(0, t), x = camX(t);
  if (gy > H + 160) return '';
  return `<path d="M-60 ${f(gy - 6)} Q${f(320 + x)} ${f(gy - 92)} ${f(700 + x)} ${f(gy - 34)} T1140 ${f(gy - 52)} L1140 ${f(gy + 900)} L-60 ${f(gy + 900)}Z" fill="#173f31"/>
    <path d="M-60 ${f(gy + 26)} Q${f(540 + x)} ${f(gy - 86)} 1140 ${f(gy + 26)} L1140 ${f(gy + 900)} L-60 ${f(gy + 900)}Z" fill="${C.deep}" stroke="${C.ink}" stroke-width="8"/>
    <rect x="${f(492 + x)}" y="${f(gy - 34)}" width="96" height="16" rx="4" fill="${C.grey}" stroke="${C.ink}" stroke-width="6"/>`;
}

// ---------- "tú": a pink star that fades into the crowd, comes back, and is where he lands ----------
const tuPos = t => [760 + 8 * Math.sin(t * .4), 330 + 6 * Math.cos(t * .5)];
function dest(t) {
  const k = seg(t, 80, 85.6), R = 40 * Math.pow(60, k), top = lerp(290, 960, k), [sx] = tuPos(t);
  return { cx: lerp(sx, 540, k), cy: top + R, R, k };
}
const surfY = (x, t) => { const d = dest(t); return d.cy - Math.sqrt(Math.max(0, d.R * d.R - (x - d.cx) ** 2)); };
function tuStar(t) {
  if (t > 81.2) return '';
  const [x, y] = tuPos(t);
  // 0-1: bright pink. 1.2-3.8: drains into an ordinary star. 27.6: the voice shrinks into her and she is pink again.
  const color = (1 - seg(t, 1.2, 3.8)) + seg(t, 27.4, 28.6) - seg(t, 80, 81);
  const smile = .45 * seg(t, 32.7, 33.4) * (1 - seg(t, 33.6, 35.5));
  const size = lerp(9, 40, clamp(color)) * (1 + .1 * Math.sin(t * 2.2) * color + smile);
  let s = '';
  if (color > .05) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(size * 1.6)}" fill="${C.pink}" opacity="${(.16 * color).toFixed(2)}"/>`;
  s += `<path d="${sparkD(x, y, size)}" fill="${mix(C.cream, C.pink, color)}" ${color > .3 ? `stroke="${C.ink}" stroke-width="${f(6 * clamp(color))}" stroke-linejoin="round"` : ''}/>`;
  if (color > .3) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(size * .17)}" fill="${C.cream}"/>`;
  // "me haces sentir": a slow pink wave that reaches him
  for (const t0 of [61.7, 62.4]) {
    const k = (t - t0) / 3.2; if (k < 0 || k > 1) continue;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(40 + k * 1100)}" fill="none" stroke="${C.pink}" stroke-width="${f(6 * (1 - k))}" opacity="${(.8 * (1 - k)).toFixed(2)}"/>`;
  }
  return s;
}
// ---------- the destination: a jungle with a river ----------
const LEAF = '#2f6b4f';
const JUNGLE = (() => {
  const kinds = ['round', 'pine', 'palm', 'bush', 'tall'], cols = [C.mint, C.sage, LEAF];
  const back = [];
  for (let x = -30; x <= 1110; x += 44 + rnd() * 34) back.push({ x, kind: kinds[Math.floor(rnd() * 5)], s: .5 + rnd() * .35, col: cols[Math.floor(rnd() * 3)], d: rnd() });
  const mid = [[105, 80, 'palm', 1.3], [240, 34, 'round', 1.05], [300, 18, 'bush', .8], [705, 26, 'bush', .95], [835, 58, 'pine', 1.2], [975, 120, 'round', 1.35]]
    .map(([x, dy, kind, s], i) => ({ x, dy, kind, s, col: cols[i % 3], d: i / 6 }));
  const flowers = [...Array(40)].map((_, i) => ({ x: 20 + rnd() * 1040, dy: 24 + Math.pow(rnd(), .75) * 380, col: [C.pink, C.yellow, C.cream, C.tear][i % 4], d: rnd(), s: .55 + rnd() * .5 }));
  const flies = [...Array(16)].map(() => ({ x: rnd() * 1080, y: -180 + rnd() * 380, p: rnd() * 6.28, f: .4 + rnd() * .6 }));
  return { back, mid, flowers, flies };
})();
function treeSVG(kind, col) {
  const trunk = `<path d="M-6 0 L-5 -58 L5 -58 L6 0Z" fill="${C.tan}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`;
  const o = `stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"`;
  if (kind === 'round') return trunk + `<circle cx="-20" cy="-66" r="24" fill="${col}" ${o}/><circle cx="4" cy="-88" r="36" fill="${col}" ${o}/><circle cx="-8" cy="-100" r="9" fill="${mix(col, C.cream, .35)}"/>`;
  if (kind === 'pine') return `<path d="M-4 0 L-4 -20 L4 -20 L4 0Z" fill="${C.tan}" stroke="${C.ink}" stroke-width="5"/>` +
    [[-20, 46, 0], [-58, 38, 0], [-92, 28, 0]].map(([y, w]) => `<path d="M0 ${y - 48} L${w} ${y} L${-w} ${y}Z" fill="${col}" ${o}/>`).join('');
  if (kind === 'palm') return st('M0 0 Q16 -60 4 -124', C.ink, 13) + st('M0 0 Q16 -60 4 -124', C.tan, 6) +
    [-165, -128, -90, -52, -15].map(a => `<ellipse cx="34" cy="0" rx="38" ry="10" transform="translate(4 -124) rotate(${a + (a < -90 ? -10 : a > -90 ? 10 : 0)})" fill="${col}" ${o}/>`).join('') +
    `<circle cx="4" cy="-120" r="7" fill="${C.tan}" stroke="${C.ink}" stroke-width="4"/>`;
  if (kind === 'bush') return `<circle cx="-24" cy="-18" r="21" fill="${col}" ${o}/><circle cx="24" cy="-16" r="19" fill="${col}" ${o}/><circle cx="0" cy="-30" r="27" fill="${col}" ${o}/><circle cx="-6" cy="-40" r="7" fill="${mix(col, C.cream, .35)}"/>`;
  return `<path d="M-4 0 L-4 -16 L4 -16 L4 0Z" fill="${C.tan}" stroke="${C.ink}" stroke-width="5"/><ellipse cx="0" cy="-74" rx="22" ry="62" fill="${col}" ${o}/>`;
}
const RIVER_BOTTOM = 1420;
function riverAt(u, sy) {
  return { x: lerp(830, 150, u) + 110 * Math.sin(u * Math.PI * 1.6), y: sy + Math.pow(u, 1.5) * (RIVER_BOTTOM - sy), w: lerp(10, 340, Math.pow(u, 1.15)) };
}
function inRiver(x, y, sy) {
  const u = Math.pow(clamp((y - sy) / (RIVER_BOTTOM - sy)), 1 / 1.5), r = riverAt(u, sy);
  return Math.abs(x - r.x) < r.w / 2 + 26;
}
function paradise(t) {
  const d = dest(t); if (d.k <= 0) return '';
  let s = planet({ col: mix(C.pink, '#a8546b', lerp(.05, .55, d.k)), crat: d.k < .6 }, d.cx, d.cy, d.R, 0, 'dest');
  if (d.k < .9) return s;
  const sy = surfY(540, t), J = JUNGLE, dusk = seg(t, 93.7, 98);
  if (dusk) s += `<ellipse cx="540" cy="${f(sy)}" rx="760" ry="230" fill="${C.pink}" opacity="${(.14 * dusk).toFixed(2)}"/>`;
  // back forest on the horizon, sprouting left to right
  for (const b of J.back) {
    const g = pop(t, 86.0 + b.d * 1.8 + b.x / 1080 * .6, .6) * b.s; if (!g) continue;
    s += `<g transform="translate(${f(b.x)} ${f(surfY(b.x, t) + 6)}) scale(${f(g)})">${treeSVG(b.kind, mix(b.col, C.night, .22))}</g>`;
  }
  // ground
  const pts = []; for (let x = -40; x <= 1120; x += 40) pts.push(`${f(x)} ${f(surfY(x, t) - 4)}`);
  s += `<path d="M${pts.join(' L')} L1120 1400 L-40 1400Z" fill="${C.mint}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round" opacity="${seg(t, 85.4, 86.4).toFixed(2)}"/>`;
  // river flowing out from the horizon
  const rv = seg(t, 86.4, 88.4);
  if (rv > .01) {
    const L = [], Rr = [];
    for (let i = 0; i <= 40; i++) { const r = riverAt(i / 40 * rv, sy); L.push(`${f(r.x - r.w / 2)} ${f(r.y)}`); Rr.unshift(`${f(r.x + r.w / 2)} ${f(r.y)}`); }
    s += `<path d="M${L.join(' L')} L${Rr.join(' L')}Z" fill="${mix(C.blue, C.tear, .4)}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>`;
    for (let j = 0; j < 9; j++) {
      const u = ((t * .1 + j / 9) % 1) * rv, r = riverAt(u, sy), l = r.w * .22;
      s += st(`M${f(r.x - l / 2 + r.w * .12 * Math.sin(j * 2.3))} ${f(r.y)} L${f(r.x + l / 2 + r.w * .12 * Math.sin(j * 2.3))} ${f(r.y)}`, C.cream, 4, `opacity=".75"`);
    }
  }
  // mid trees and bushes
  for (const m of J.mid) {
    const g = pop(t, 87.3 + m.d * 1.8, .7) * m.s; if (!g) continue;
    s += `<g transform="translate(${f(m.x)} ${f(surfY(m.x, t) + m.dy)}) scale(${f(g)})">${treeSVG(m.kind, m.col)}</g>`;
  }
  // flowers bloom on "encontrarnos nuevamente", larger as they come closer
  for (const fl of J.flowers) {
    const y = sy + fl.dy; if (inRiver(fl.x, y, sy) || (Math.abs(fl.x - LAND_X) < 90 && Math.abs(fl.dy - LAND_DY) < 60)) continue;
    const g = pop(t, 93.7 + fl.d * 2.4, .5) * fl.s * (.7 + fl.dy / 380); if (!g) continue;
    const petals = [0, 1, 2, 3, 4].map(j => { const a = j * 1.2566 - 1.57; return `<circle cx="${f(Math.cos(a) * 9)}" cy="${f(-22 + Math.sin(a) * 9)}" r="7" fill="${fl.col}" stroke="${C.ink}" stroke-width="3.5"/>`; }).join('');
    s += `<g transform="translate(${f(fl.x)} ${f(y)}) scale(${f(g)}) rotate(${f(5 * Math.sin(t * 1.4 + fl.d * 9))})">${st('M0 0 L0 -18', C.ink, 4)}${petals}<circle cx="0" cy="-22" r="5" fill="${fl.col === C.yellow ? C.pink : C.yellow}" stroke="${C.ink}" stroke-width="3"/></g>`;
  }
  // big foreground leaves unfurl from the bottom corners
  [[30, 1360, 24, 93.9], [1050, 1360, -24, 94.3]].forEach(([x, y, a, t0]) => {
    const g = pop(t, t0, .8); if (!g) return;
    const sw = 3 * Math.sin(t * .9 + x);
    s += `<g transform="translate(${x} ${y}) rotate(${f(a + sw)}) scale(${f(g)})"><path d="M0 0 Q90 -130 0 -250 Q-90 -130 0 0Z" fill="${LEAF}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>${st('M0 -10 L0 -230', C.ink, 5)}${[-60, -110, -160].map(y2 => st(`M0 ${y2} L38 ${y2 - 34} M0 ${y2} L-38 ${y2 - 34}`, C.ink, 4)).join('')}</g>`;
  });
  // fireflies at dusk
  const ff = seg(t, 95.4, 97);
  if (ff) for (const q of J.flies) {
    const x = q.x + 30 * Math.sin(t * q.f + q.p), y = sy + q.y + 20 * Math.sin(t * q.f * 1.3 + q.p * 2), a = ff * (.55 + .45 * Math.sin(t * 3 + q.p));
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="11" fill="${C.yellow}" opacity="${(a * .22).toFixed(2)}"/><circle cx="${f(x)}" cy="${f(y)}" r="3.6" fill="${C.yellow}" opacity="${a.toFixed(2)}"/>`;
  }
  return s;
}

// ---------- rocket: a lunar-lander simulation, precomputed once ----------
// Thrust only pushes along the nose, so the rocket must turn (with angular inertia) before it changes course.
// A soft gravity keeps the engine working. "Ya no existe gravedad" really switches gravity and the engine off:
// pure inertia, and small side thrusters start and stop a slow tumble.
const DT = 1 / 120, PAD = [540, -100], G = 260, TMAX = 1500;
const LAND_X = 420, LAND_DY = 130;   // on the near grass, left of the river, legs on the ground
const hover = t => [540 + 110 * Math.sin(t * .38), 760 + 24 * Math.sin(t * .7)];
const TARGETS = [
  [0, t => lp([540 + camX(t), wy2s(PAD[1], t)], hover(t), seg(t, 32.7, 39.0)), .01],   // launch: aim climbs smoothly
  [43.6, t => [540 + 110 * Math.sin((t - 43.6) * .6), 640], 2.0],                                            // volar
  [45.7, t => { const u = (t - 45.7) * .55; return [540 + 180 * Math.sin(u), 730 + 40 * Math.sin(2 * u)]; }, 2.0], // divagar
  [51.0, t => [500, 780], 2.5],                                                                               // soñar
  [56.0, t => [530 + 30 * Math.sin(t * .2), 780], 3.0],                                                      // tranquilo
  [60.0, t => [560, 760], 3.0],                                                                               // sentir
  [64.4, t => [520, 780], 3.0],                                                                               // llorar
  [73.6, t => [540 + 90 * Math.sin((t - 73.6) * .6), 730], 2.0],                                             // reír
  [78.3, t => [400 + (t - 78.3) * 100, 715 + 30 * Math.sin((t - 78.3) * 3)], 1.6],                           // cantar
  [80.6, t => [540, 620], 2.5],                                                                                // approach
  [83.6, t => [LAND_X, surfY(LAND_X, t) + LAND_DY - 65], 3.0],                                                                 // land
];
function pathAt(list, t) {
  let i = 0; while (i + 1 < list.length && list[i + 1][0] <= t) i++;
  const [a, fn, d] = list[i];
  return i === 0 ? fn(t) : lp(list[i - 1][1](t), fn(t), seg(t, a, a + d));
}
const weightless = t => t > 67.2 && t < 73.6;
const SIM = [], PUFFS = [];
(function simulate() {
  let p = [...PAD], v = [0, 0], th = 0, w = 0, lastPuff = -9, lastRcs = -9, spin0 = null;
  const toWorld = (s, t) => [s[0] - camX(t), s[1] - GY + camY(t)];
  const local = (x, y) => [p[0] + x * Math.cos(th) - y * Math.sin(th), p[1] + x * Math.sin(th) + y * Math.cos(th)];
  for (let i = 0; i * DT <= 101; i++) {
    const t = i * DT, free = weightless(t), flying = t >= 32.7 && t <= 88.8;
    let T = 0, want = 0;
    if (flying) {
      const wt = toWorld(pathAt(TARGETS, t), t), wt2 = toWorld(pathAt(TARGETS, t + DT), t + DT);
      const wv = [(wt2[0] - wt[0]) / DT, (wt2[1] - wt[1]) / DT];
      let F = [.7 * (wt[0] - p[0]) + 2.2 * (wv[0] - v[0]), 1.3 * (wt[1] - p[1]) + 2.8 * (wv[1] - v[1])];
      const Fm = Math.hypot(...F); if (Fm > 700) F = F.map(c => c * 700 / Fm);
      if (free) {
        if (spin0 === null) spin0 = th;
        want = spin0 + 6.283 * seg(t, 70.2, 73.3);
      } else {
        const need = [F[0], F[1] - G];            // the thrust also has to hold against gravity
        const lim = t > 84 ? .25 : .55;
        // braking a climb needs no flip: idle the engine and let gravity do it, tilting only for the sideways part
        want = clamp(Math.atan2(need[0], Math.max(-need[1], 150)), -lim, lim);
        T = clamp(need[0] * Math.sin(th) - need[1] * Math.cos(th), 0, TMAX);   // only the part along the nose
      }
    } else if (t > 88.8) want = 0;
    // attitude with angular inertia: a torque limit means turns take time
    let err = want - th; if (!free) err = Math.atan2(Math.sin(err), Math.cos(err));
    const alpha = clamp(25 * err - 10 * w, -16, 16);
    w = clamp(w + alpha * DT, -4, 4); th += w * DT;
    if (flying) {
      const dir = [Math.sin(th), -Math.cos(th)];
      v = [v[0] + T * dir[0] * DT, v[1] + (T * dir[1] + (free ? 0 : G)) * DT];
      p = [p[0] + v[0] * DT, p[1] + v[1] * DT];
    }
    let flame = t < 32.7 ? seg(t, 31.2, 32.6) * .5 : T / 1100;
    if (t > 88.0) flame *= 1 - seg(t, 88.0, 88.8);
    // exhaust puffs stay where they were released; "cantar" breathes them out in rhythm
    const singing = t > 78.3 && t < 80.6, beat = Math.sin((t - 78.3) * Math.PI * 4) > .2;
    const gap = singing ? .07 : .14 - clamp(flame) * .07;
    if (flame > .18 && t - lastPuff > gap && (!singing || beat)) {
      lastPuff = t;
      const ex = [-Math.sin(th), Math.cos(th)], n = local(0, 58);
      PUFFS.push({ t0: t, x: n[0], y: n[1], vx: v[0] * .1 + ex[0] * (110 + 160 * clamp(flame)) + (rnd() - .5) * 90, vy: v[1] * .1 + ex[1] * (110 + 160 * clamp(flame)) + (rnd() - .5) * 50, s: (7 + 11 * clamp(flame)) * (singing ? 1.4 : 1) });
    }
    // side thrusters (RCS) when the tumble starts and stops
    if (free && Math.abs(alpha) > 5 && t - lastRcs > .06) {
      lastRcs = t;
      const sd = Math.sign(alpha), n = local(-sd * 22, -40);
      PUFFS.push({ t0: t, x: n[0], y: n[1], vx: -sd * Math.cos(th) * 140, vy: -sd * Math.sin(th) * 140, s: 6 });
    }
    SIM.push([p[0], p[1], th, flame]);
  }
})();
const simAt = t => SIM[clamp(Math.round(t / DT), 0, SIM.length - 1)];
function puffs(t) {
  let s = '';
  for (const q of PUFFS) {
    const age = t - q.t0, life = 1.3; if (age < 0 || age > life) continue;
    const k = age / life, x = q.x + q.vx * age * (1 - k * .5) + camX(t), y = wy2s(q.y + q.vy * age * (1 - k * .5), t);
    if (y < -60 || y > H + 60) continue;
    const r = q.s * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.15 + .08)), .7) * (1 + k * .8);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${mix(C.cream, C.grey, k * .7)}" stroke="${C.ink}" stroke-width="3.5" opacity="${(1 - k * .5).toFixed(2)}"/>`;
  }
  return s;
}
function rocketSVG(x, y, th, flame, t) {
  const legs = 1 - seg(t, 33.2, 34.2) + seg(t, 83.6, 84.6);
  const fl = clamp(flame, 0, 1.3) * (.85 + .15 * Math.sin(t * 47) + .08 * Math.sin(t * 83)), L = 18 + 70 * fl;
  const glow = seg(t, 89.3, 90.5);
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(th * 57.2958)}) scale(1.2)">`;
  if (fl > .03) s += `<path d="M-11 42 Q-16 ${f(42 + L * .5)} 0 ${f(42 + L)} Q16 ${f(42 + L * .5)} 11 42Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M-5 42 Q-7 ${f(42 + L * .35)} 0 ${f(42 + L * .62)} Q7 ${f(42 + L * .35)} 5 42Z" fill="${C.cream}"/>`;
  if (legs > .02) s += st(`M-17 22 L${f(-24 - 12 * legs)} ${f(32 + 22 * legs)}`, C.ink, 6) + st(`M17 22 L${f(24 + 12 * legs)} ${f(32 + 22 * legs)}`, C.ink, 6);
  s += `<path d="M-20 6 L-40 34 L-40 46 L-21 36Z" fill="${C.blue}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M20 6 L40 34 L40 46 L21 36Z" fill="${C.blue}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M-12 34 L12 34 L9 44 L-9 44Z" fill="${C.grey}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M0 -64 C22 -40 26 -10 22 36 L-22 36 C-26 -10 -22 -40 0 -64Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M0 -64 C11 -52 16 -42 18 -33 L-18 -33 C-16 -42 -11 -52 0 -64Z" fill="${C.blue}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="0" cy="-6" r="11" fill="${mix(C.tear, C.yellow, glow)}" stroke="${C.ink}" stroke-width="6"/>
    <circle cx="-4" cy="-10" r="3" fill="${C.cream}"/>`;
  return s + '</g>';
}
function rocket(t) {
  const [wx, wy, th, flame] = simAt(t);
  const x = wx + camX(t), y = wy2s(wy, t);
  if (y > H + 200 || y < -200) return '';
  // contact shadow once the legs are near the grass
  const sh = seg(t, 86.2, 88.2);
  const shadow = sh ? `<ellipse cx="${f(x)}" cy="${f(y + 66)}" rx="${f(58 * sh)}" ry="${f(11 * sh)}" fill="${C.ink}" opacity="${(.3 * sh).toFixed(2)}"/>` : '';
  return shadow + rocketSVG(x, y, th, flame, t);
}

// ---------- soñar: a thought bubble; llorar: a slow falling star ----------
function moments(t) {
  let s = '';
  const out = 1 - seg(t, 55.6, 56.4);
  if (t > 52.2 && out > 0) {
    const [wx, wy] = simAt(t), rx = wx + camX(t) + 30, ry = wy2s(wy, t) - 70;
    [[24, -18, 6, 52.3], [46, -48, 9, 52.5], [76, -88, 12, 52.7]].forEach(([dx, dy, r, a]) => {
      const k = pop(t, a, .45) * out; if (k) s += `<circle cx="${f(rx + dx)}" cy="${f(ry + dy)}" r="${f(r * k)}" fill="${C.cream}" stroke="${C.ink}" stroke-width="5"/>`;
    });
    const k = pop(t, 52.9, .6) * out;
    if (k) {
      const bx = rx + 150, by = ry - 170;
      s += `<g transform="translate(${f(bx)} ${f(by)}) scale(${f(k)})">
        <path d="M-58 14 Q-76 -14 -46 -34 Q-36 -66 0 -58 Q34 -72 52 -40 Q80 -22 62 10 Q66 44 28 44 Q0 62 -28 44 Q-66 46 -58 14Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
        <path d="${sparkD(0, -6, 24 * (1 + .12 * Math.sin(t * 3)))}" fill="${C.pink}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/></g>`;
    }
  }
  const k = (t - 65.4) / 2.6;
  if (k > 0 && k < 1) {
    const e = io(k), hx = lerp(1000, 380, e), hy = lerp(210, 640, e), ang = Math.atan2(430, -620);
    const tl = 280 * Math.sin(Math.PI * k), bx = hx - Math.cos(ang) * tl, by = hy - Math.sin(ang) * tl, nx = -Math.sin(ang) * 8, ny = Math.cos(ang) * 8;
    s += `<g opacity="${(1 - seg(k, .75, 1)).toFixed(2)}"><path d="M${f(hx + nx)} ${f(hy + ny)} L${f(bx)} ${f(by)} L${f(hx - nx)} ${f(hy - ny)}Z" fill="${C.tear}" opacity=".7"/>
      <circle cx="${f(hx)}" cy="${f(hy)}" r="10" fill="${C.tear}" stroke="${C.ink}" stroke-width="4"/></g>`;
  }
  return s;
}

// ---------- the eyes close; their seam becomes the voice, and the voice becomes the seam again ----------
const M = H / 2;
const lidK = t => seg(t, 14.6, 16.8) * (1 - seg(t, 26.1, 27.6));
function polyR(th, n, R) { const a = 2 * Math.PI / n; return R * Math.cos(Math.PI / n) / Math.cos(((th % a) + a) % a - Math.PI / n); }
function eyes(t) {
  const k = lidK(t); if (!k) return '';
  const h = (1 - k) * 1700, ycU = M - 2 * h, ycL = M + 1.7 * h, lid = '#0d1322';
  const edge = k < .999 ? seg(k, .45, .95) * (t < 20 ? 1 : 1 - seg(t, 26.6, 27.4)) : 0;
  let s = `<path d="M-600 ${M} Q540 ${f(ycU)} 1680 ${M} L1680 -200 L-600 -200Z" fill="${lid}"/>
    <path d="M-600 ${M} Q540 ${f(ycL)} 1680 ${M} L1680 1550 L-600 1550Z" fill="${lid}"/>`;
  if (edge > 0) s += st(`M-600 ${M} Q540 ${f(ycU)} 1680 ${M}`, C.cream, 6, `opacity="${edge.toFixed(2)}"`) + st(`M-600 ${M} Q540 ${f(ycL)} 1680 ${M}`, C.cream, 6, `opacity="${edge.toFixed(2)}"`);
  return s;
}
function voice(t) {
  if (lidK(t) < .999) return '';
  const amp = seg(t, 17.6, 18.6) * (1 - seg(t, 25.6, 26.05));
  const m = seg(t, 20, 21.6) * (1 - seg(t, 25.5, 26.0));
  const g = seg(t, 22.2, 23.6) * (1 - seg(t, 25.25, 25.7));
  const c = seg(t, 24.1, 24.8) * (1 - seg(t, 25.0, 25.45));
  // the seam bends into a ring keeping its length (a wire curling up), then the ring squares into polygons
  const N = 220, L = 1120, R = L / (2 * Math.PI);
  const shape = (n, rr, spin, closed) => {
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, env = Math.sin(u * Math.PI);
      const wave = (Math.sin(u * 46 + t * 6) * 30 * env + Math.sin(u * 15 - t * 4) * 12 * env) * amp * (1 - g);
      let x, y, nx, ny;
      if (closed) {
        const th = u * 6.283 + spin, r = polyR(th, n, rr);
        x = Math.sin(th) * r; y = Math.cos(th) * r; nx = 0; ny = 0;
      } else if (m < 1e-3) {
        x = -L / 2 + u * L; y = 0; nx = 0; ny = 1;
      } else {
        const rho = L / (2 * Math.PI * m), phi = (u - .5) * L / rho;
        x = rho * Math.sin(phi); y = rho * Math.cos(phi) - rho + R * m;   // centre drifts to the middle as it closes
        nx = Math.sin(phi); ny = Math.cos(phi);
        if (g > 0) { const c0 = R * m - rho, k = lerp(1, polyR(phi + Math.PI, n, R) / R, g); x *= k; y = (y - c0) * k + c0; }
      }
      pts.push([x + nx * wave, y + ny * wave]);
    }
    return 'M' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L');
  };
  let s = `<g transform="translate(540 ${M}) rotate(${f(t * 7 * g)})">`;
  s += `<path d="${shape(6, R, 0, false)}${m > .99 ? 'Z' : ''}" fill="${C.yellow}" fill-opacity="${c.toFixed(2)}" stroke="${mix(C.cream, C.ink, c)}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
  [[5, .74, C.pink, .3], [4, .5, C.mint, -.45], [3, .28, C.blue, .6]].forEach(([n, k, col, sp], j) => {
    const a = pop(t, 24.1 + j * .2, .5) * (1 - seg(t, 24.95, 25.35)); if (a <= .01) return;
    s += `<path d="${shape(n, R * k * a, t * sp, true)}Z" fill="${col}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>`;
  });
  return s + '</g>';
}

// ---------- entry points for Remotion ----------
export const END = 100.8;
export function frameSvg(tRaw: number): string {
  const t = Math.floor(tRaw * 12) / 12;            // animate on twos
  const boil = Math.floor(tRaw * 6) % 5 + 1;        // stroke boil seed stepped every 2 frames
  const up = clamp(-camY(t) / 1300), dark = seg(t, 54, 55.5) * (1 - seg(t, 59.5, 61));
  const bg = mix(mix(C.night, '#111a2d', up * .55 + dark * .45), '#3a3358', seg(t, 93.7, 98.5));
  return `<svg viewBox="0 0 1080 1350" width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="boil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="2" seed="${boil}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
    <rect width="1080" height="1350" fill="${bg}"/>
    <g filter="url(#boil)">${sky(t)}${planets(t)}${ground(t)}${tuStar(t)}${paradise(t)}${puffs(t)}${moments(t)}${rocket(t)}${eyes(t)}${voice(t)}</g>
  </svg>`;
}
export function captionAt(t: number): { w: string; o: number }[] {
  let i = 0; while (i + 1 < LINES.length && LINES[i + 1] <= t) i++;
  const a = LINES[i], b = LINES[i + 1] ?? 999;
  const out = seg(t, b - .45, b - .1);
  return WORDS.filter(w => w[0] >= a - .2 && w[0] < b - .2)
    .map(([s, w]) => ({ w: w.replace(/[¿?]/g, ''), o: clamp((t - s + .06) / .25) * (1 - out) }));
}
