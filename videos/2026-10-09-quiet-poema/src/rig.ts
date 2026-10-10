/**
 * Stick-figure rig ported 1:1 from the approved board (work/board.html).
 * Every helper returns an SVG string in a 1080x1350 canvas.
 * Unit: head diameter D = 116. Fixed segment lengths, two-bone IK, elbows out, knees forward.
 */
export type V = [number, number];

export const C = {
  ink: "#192425", cream: "#f3f3e4", sage: "#6b9b68", deep: "#1a543a", mint: "#4e986e", blue: "#3271a9",
  night: "#1c2b45", yellow: "#f2cf3a", tan: "#d8cba6", tear: "#bfe0f0", pink: "#f4bbb3", grey: "#8a948f",
};

export const f = (n: number) => n.toFixed(1);
export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
export const len = (a: V) => Math.hypot(a[0], a[1]);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lp = (a: V, b: V, k: number): V => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const cl01 = (x: number) => clamp(x, 0, 1);
export const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeOutBack = (k: number) => 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
/** 0→1 ramp between a and a+d, eased. */
export const ramp = (t: number, a: number, d = 0.4) => ease(cl01((t - a) / d));
const qpt = (a: V, c: V, b: V, t: number): V => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];
export const P = (pts: V[]) => "M" + pts.map((p) => f(p[0]) + " " + f(p[1])).join(" L");
export const st = (d: string, col: string, w: number, extra = "") =>
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const grp = (s: string, tr: string, op = 1) => `<g transform="${tr}" opacity="${op.toFixed(3)}">${s}</g>`;
export const scaleAt = (x: number, y: number, k: number) => `translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`;

export const R = 58;
export const SEG = { neck: 16, spine: 174, up: 86, fo: 80, th: 99, sn: 99 };

export function ik(a: V, t: V, L1: number, L2: number, pref: V) {
  const v = sub(t, a), d = Math.max(1, len(v)), u = mul(v, 1 / d);
  const dc = clamp(d, Math.abs(L1 - L2) + 1, L1 + L2 - 0.5);
  const al = (L1 * L1 - L2 * L2 + dc * dc) / (2 * dc), h = Math.sqrt(Math.max(0, L1 * L1 - al * al));
  let p: V = [-u[1], u[0]];
  if (p[0] * pref[0] + p[1] * pref[1] < 0) p = mul(p, -1);
  return { j: add(add(a, mul(u, al)), mul(p, h)), e: add(a, mul(u, dc)) };
}

export type Body = { neck: V; ctrl: V; sh: V; head: V; pelvis: V; tn: V };
export function body(o: { pelvis: V; angle?: number; bow?: number; spine?: number; nod?: V }): Body {
  const L = o.spine ?? SEG.spine, a = o.angle ?? 0, dir: V = [Math.sin(a), -Math.cos(a)];
  const neck = add(o.pelvis, mul(dir, L)), nrm: V = [-dir[1], dir[0]];
  const ctrl = add(lp(o.pelvis, neck, 0.5), mul(nrm, o.bow ?? 0));
  const sh = qpt(neck, ctrl, o.pelvis, 0.14);
  let tn = sub(neck, ctrl);
  tn = mul(tn, 1 / len(tn));
  const head = add(add(neck, mul(tn, R + SEG.neck)), o.nod ?? [0, 0]);
  return { neck, ctrl, sh, head, pelvis: o.pelvis, tn };
}
export type Limb = { pts: V[]; e: V };
export const arm = (b: Body, t: V, pref: V, k = 1): Limb => {
  const r = ik(b.sh, t, SEG.up, SEG.fo * k, pref);
  return { pts: [b.sh, r.j, r.e], e: r.e };
};
export const leg = (b: Body, t: V, pref: V): Limb => {
  const r = ik(b.pelvis, t, SEG.th, SEG.sn, pref);
  return { pts: [b.pelvis, r.j, r.e], e: r.e };
};
export const limbD = (l: Limb, col = C.ink) => st(P(l.pts), col, 13);
export function torsoD(b: Body, col = C.ink) {
  const hb = sub(b.head, mul(b.tn, R));
  return st(`M${f(hb[0])} ${f(hb[1])} L${f(b.neck[0])} ${f(b.neck[1])} Q${f(b.ctrl[0])} ${f(b.ctrl[1])} ${f(b.pelvis[0])} ${f(b.pelvis[1])}`, col, 13);
}
export type Face = { view?: "front" | "right"; lx?: number; ly?: number; blink?: boolean; sad?: boolean; smile?: boolean; fill?: string };
export function headD(b: Body, o: Face = {}) {
  const [x, y] = b.head, lx = o.lx ?? 0, ly = o.ly ?? 0;
  let s = `<circle cx="${f(x)}" cy="${f(y)}" r="${R}" fill="${o.fill ?? C.cream}" stroke="${C.ink}" stroke-width="10"/>`;
  if (o.fill === C.ink) return s;
  if (o.view === "right") {
    const ex = x + 26 + lx, ey = y - 4 + ly;
    s += o.blink ? st(`M${f(ex - 7)} ${f(ey)} l14 0`, C.ink, 7) : `<circle cx="${f(ex)}" cy="${f(ey)}" r="7.5" fill="${C.ink}"/>`;
    const my = ey + 28;
    s += o.sad ? st(`M${f(ex + 2)} ${f(my)} q8 -5 16 3`, C.ink, 6) : o.smile ? st(`M${f(ex)} ${f(my - 2)} q9 7 17 -2`, C.ink, 6) : st(`M${f(ex + 2)} ${f(my)} l14 -1`, C.ink, 6);
    return s;
  }
  const ex = x + lx, ey = y + ly;
  if (o.blink) s += st(`M${f(ex - 28)} ${f(ey)} l14 0 M${f(ex + 14)} ${f(ey)} l14 0`, C.ink, 7);
  else s += `<circle cx="${f(ex - 21)}" cy="${f(ey)}" r="7.5" fill="${C.ink}"/><circle cx="${f(ex + 21)}" cy="${f(ey)}" r="7.5" fill="${C.ink}"/>`;
  const my = ey + 26;
  if (o.sad) s += st(`M${f(ex - 13)} ${f(my + 5)} Q${f(ex)} ${f(my - 6)} ${f(ex + 13)} ${f(my + 5)}`, C.ink, 6);
  else if (o.smile) s += st(`M${f(ex - 14)} ${f(my - 2)} Q${f(ex)} ${f(my + 10)} ${f(ex + 14)} ${f(my - 2)}`, C.ink, 6);
  else s += st(`M${f(ex - 9)} ${f(my)} l18 0`, C.ink, 6);
  return s;
}
export const blinkAt = (t: number) => t % 3.4 > 3.25;

/** Side-view walk cycle (facing right), returns limbs for a body whose pelvis is given. */
export function walk(ph: number, pelvisX: number, ground: number, stride = 120) {
  const footAt = (p: number): V => {
    const q = ((p % 1) + 1) % 1;
    if (q < 0.5) return [pelvisX + stride / 2 - (q / 0.5) * stride, ground];
    const s = (q - 0.5) / 0.5;
    return [pelvisX - stride / 2 + ease(s) * stride, ground - 34 * Math.sin(Math.PI * s)];
  };
  const bob = 7 * Math.abs(Math.cos(2 * Math.PI * ph));
  const pelvis: V = [pelvisX, ground - 186 + bob - 7];
  const swing = (p: number) => Math.cos(2 * Math.PI * p) * 0.42;
  return { pelvis, fA: footAt(ph), fB: footAt(ph + 0.5), swA: swing(ph + 0.5), swB: swing(ph) };
}
export function walker(ph: number, x: number, ground: number, face: Face = {}, hat = false) {
  const w = walk(ph, x, ground);
  const b = body({ pelvis: w.pelvis, angle: 0.06, bow: 4 });
  const handFor = (s: number): V => add(b.sh, [Math.sin(s) * 150, Math.cos(s) * 150]);
  const aFar = arm(b, handFor(w.swA), [-1, 0.2]), aNear = arm(b, handFor(w.swB), [-1, 0.2]);
  const lFar = leg(b, w.fB, [1, 0]), lNear = leg(b, w.fA, [1, 0]);
  return limbD(aFar) + limbD(lFar) + torsoD(b) + limbD(lNear) + headD(b, { view: "right", ...face }) + (hat ? bowler(b.head) : "") + limbD(aNear);
}
/** Bowler hat sitting on a head of radius R. */
export const bowler = ([x, y]: V) =>
  `<ellipse cx="${f(x)}" cy="${f(y - R * 0.62)}" rx="${f(R * 1.35)}" ry="${f(R * 0.22)}" fill="${C.ink}"/><path d="M${f(x - R * 0.85)} ${f(y - R * 0.6)} Q${f(x)} ${f(y - R * 2.1)} ${f(x + R * 0.85)} ${f(y - R * 0.6)}Z" fill="${C.ink}"/>`;
export const topHat = ([x, y]: V) =>
  `<ellipse cx="${f(x)}" cy="${f(y - R * 0.66)}" rx="${f(R * 1.3)}" ry="${f(R * 0.2)}" fill="${C.ink}"/><rect x="${f(x - R * 0.72)}" y="${f(y - R * 1.95)}" width="${f(R * 1.44)}" height="${f(R * 1.32)}" rx="6" fill="${C.ink}"/><rect x="${f(x - R * 0.72)}" y="${f(y - R * 0.95)}" width="${f(R * 1.44)}" height="12" fill="${C.yellow}"/>`;

/** Flat silhouette person (colleagues). */
export function person(x: number, y: number, h: number, kind: string, a: number, hunch = 0) {
  if (a <= 0) return "";
  const sc = 0.92 + 0.08 * a, w = h * 0.27, bh = h * 0.56, r = h * 0.115;
  let s = `<g opacity="${a.toFixed(2)}" transform="translate(${x} ${y}) scale(${sc.toFixed(3)}) translate(${-x} ${-y})"><g transform="rotate(${hunch} ${x} ${y})">
    <rect x="${f(x - w / 2)}" y="${f(y - bh)}" width="${f(w)}" height="${f(bh)}" rx="${f(w * 0.42)}" fill="${C.ink}"/>
    <circle cx="${x}" cy="${f(y - bh - r * 0.9)}" r="${f(r)}" fill="${C.ink}"/>`;
  if (kind === "hat")
    s += `<ellipse cx="${x}" cy="${f(y - bh - r * 1.55)}" rx="${f(r * 1.5)}" ry="${f(r * 0.28)}" fill="${C.ink}"/><path d="M${f(x - r * 0.85)} ${f(y - bh - r * 1.5)} Q${x} ${f(y - bh - r * 3.1)} ${f(x + r * 0.85)} ${f(y - bh - r * 1.5)}Z" fill="${C.ink}"/>`;
  if (kind === "letters")
    s += `<rect x="${f(x + w * 0.3)}" y="${f(y - bh * 0.62)}" width="46" height="32" fill="${C.cream}" stroke="${C.ink}" stroke-width="6" transform="rotate(-8 ${x} ${y})"/>`;
  if (kind === "tray")
    s += `<ellipse cx="${f(x - w * 0.75)}" cy="${f(y - bh * 0.7)}" rx="44" ry="9" fill="${C.cream}" stroke="${C.ink}" stroke-width="6"/>`;
  if (kind === "glasses")
    s += `<path d="M${f(x - r * 1.4)} ${f(y - bh - r * 3)} L${f(x + r * 1.4)} ${f(y - bh - r * 3)}" stroke="${C.ink}" stroke-width="0"/>`;
  return s + "</g></g>";
}

export function cat(x: number, y: number, k: number, t: number, look = 0, a = 1) {
  if (a <= 0) return "";
  const tail = 1060 + 18 * Math.sin(t * 2.1);
  let s = `<path d="M880 1150 Q868 1062 905 1032 L898 990 L926 1016 Q946 1009 966 1016 L992 990 L986 1032 Q1022 1062 1010 1150Z" fill="${C.ink}"/>${st(`M1004 1140 Q1062 1120 ${f(tail)} 1070`, C.ink, 16)}`;
  s += blinkAt(t + 1.1)
    ? st("M916 1046 l20 0 M956 1046 l20 0", C.yellow, 5)
    : `<circle cx="926" cy="1046" r="10" fill="${C.yellow}"/><circle cx="966" cy="1046" r="10" fill="${C.yellow}"/><circle cx="${f(927 + look)}" cy="1047" r="4" fill="${C.ink}"/><circle cx="${f(967 + look)}" cy="1047" r="4" fill="${C.ink}"/>`;
  return `<g opacity="${a.toFixed(2)}" transform="translate(${x} ${y}) scale(${k}) translate(-945 -1150)">${s}</g>`;
}

export const STARS: [number, number, number, number][] = Array.from({ length: 60 }, (_, i) => {
  const r = Math.sin(i * 91.7) * 43758.5, r2 = Math.sin(i * 12.9) * 24634.6;
  return [(r - Math.floor(r)) * 1080, (r2 - Math.floor(r2)) * 820 + 20, 2 + (i % 4) * 1.4, i];
});
export function starsD(t: number, n = 60, y0 = 0) {
  return STARS.slice(0, n)
    .map(([x, y, r, i]) => {
      const a = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.9 + i));
      y += y0;
      return i % 7 === 0
        ? `<path d="M${f(x)} ${f(y - r * 3)} L${f(x + r * 0.7)} ${f(y)} L${f(x)} ${f(y + r * 3)} L${f(x - r * 0.7)} ${f(y)}Z M${f(x - r * 3)} ${f(y)} L${f(x)} ${f(y + r * 0.7)} L${f(x + r * 3)} ${f(y)} L${f(x)} ${f(y - r * 0.7)}Z" fill="${C.cream}" opacity="${a.toFixed(2)}"/>`
        : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${C.cream}" opacity="${a.toFixed(2)}"/>`;
    })
    .join("");
}
