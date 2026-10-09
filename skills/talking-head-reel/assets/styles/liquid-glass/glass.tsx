/**
 * Liquid Glass (Apple, macOS 27 "Golden Gate" tuning) ported from the liquid-glass style board:
 * a convex-lens displacement map refracts the live camera behind each element (backdrop-filter: url()),
 * with chromatic split, a tint, a darkened edge and a bright specular rim.
 */
import React, { useMemo } from "react";

const T = 0.45; // 0 = clear (macOS 26) … 1 = tinted

// Signed distance to a rounded rectangle (negative inside).
function sdf(px: number, py: number, w: number, h: number, r: number) {
  const qx = Math.abs(px - w / 2) - (w / 2 - r);
  const qy = Math.abs(py - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// Inside the bezel each pixel samples the backdrop further inward (R = x offset, G = y offset, 128 = none).
function displacementMap(w: number, h: number, r: number, bezel: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const inside = -sdf(px, py, w, h, r);
      let dx = 0;
      let dy = 0;
      if (inside > 0 && inside < bezel) {
        const gx = sdf(px + 1, py, w, h, r) - sdf(px - 1, py, w, h, r);
        const gy = sdf(px, py + 1, w, h, r) - sdf(px, py - 1, w, h, r);
        const gl = Math.hypot(gx, gy) || 1;
        const m = Math.pow(1 - inside / bezel, 2.4); // strongest at the rim, flat in the centre
        dx = -(gx / gl) * m;
        dy = -(gy / gl) * m;
      }
      const i = (y * w + x) * 4;
      d[i] = 128 + dx * 127;
      d[i + 1] = 128 + dy * 127;
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

const TINTS = {
  clear: `linear-gradient(180deg, rgba(255,255,255,${0.2 - 0.1 * T}) 0%, rgba(36,36,42,${0.03 + 0.42 * T}) 45%, rgba(22,22,26,${0.05 + 0.5 * T}) 100%)`,
  dark: `linear-gradient(180deg, rgba(255,255,255,${0.2 - 0.1 * T}) 0%, rgba(36,36,42,${0.15 + 0.42 * T}) 45%, rgba(22,22,26,${0.17 + 0.5 * T}) 100%)`,
  green: "linear-gradient(180deg, rgba(110,235,150,.60), rgba(40,190,90,.72))",
  blue: "linear-gradient(180deg, rgba(120,180,255,.60), rgba(10,110,255,.72))",
};

let seq = 0;

export const Glass: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  refract?: number;
  bezel?: number;
  frost?: number;
  tint?: keyof typeof TINTS;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ x, y, w, h, r, refract = 46, bezel, frost = 1.2, tint = "clear", style, children }) => {
  const bz = bezel ?? Math.min(34, Math.min(w, h) * 0.32);
  const id = useMemo(() => `lg${seq++}`, []);
  const map = useMemo(() => displacementMap(Math.round(w), Math.round(h), Math.min(r, w / 2, h / 2), bz), [w, h, r, bz]);
  const blur = frost < 1 ? frost : frost + 7 * T;
  const channel = (k: "r" | "g" | "b", s: number) => (
    <>
      <feDisplacementMap in="src" in2="map" scale={s} xChannelSelector="R" yChannelSelector="G" result={`d${k}`} />
      <feColorMatrix
        in={`d${k}`}
        type="matrix"
        result={`c${k}`}
        values={`${k === "r" ? "1 0 0 0 0" : "0 0 0 0 0"} ${k === "g" ? "0 1 0 0 0" : "0 0 0 0 0"} ${k === "b" ? "0 0 1 0 0" : "0 0 0 0 0"} 0 0 0 1 0`}
      />
    </>
  );
  const layer: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: r, pointerEvents: "none" };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, isolation: "isolate", color: "#fff", backdropFilter: `url(#${id})`, ...style }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x={0} y={0} width={w} height={h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feImage href={map} x={0} y={0} width={w} height={h} preserveAspectRatio="none" result="map" />
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="src" />
          {channel("r", refract)}
          {channel("g", refract * 1.03)}
          {channel("b", refract * 1.06)}
          <feBlend in="cr" in2="cg" mode="screen" result="rg" />
          <feBlend in="rg" in2="cb" mode="screen" result="rgb" />
          <feColorMatrix in="rgb" type="saturate" values="1.18" result="sat" />
          <feComponentTransfer in="sat">
            <feFuncR type="linear" slope={1.06} />
            <feFuncG type="linear" slope={1.06} />
            <feFuncB type="linear" slope={1.06} />
          </feComponentTransfer>
        </filter>
      </svg>
      <div style={{ ...layer, background: TINTS[tint], boxShadow: "0 18px 50px rgba(0,0,0,.22), 0 3px 10px rgba(0,0,0,.12)" }} />
      <div
        style={{
          ...layer,
          boxShadow: `inset 0 0 0 1.5px rgba(0,0,0,${0.1 + 0.22 * T}), inset 0 0 18px 1px rgba(0,0,0,${0.06 + 0.16 * T}), 0 0 0 1px rgba(0,0,0,${0.06 + 0.1 * T})`,
        }}
      />
      <div
        style={{
          ...layer,
          background:
            "radial-gradient(60% 45% at 18% 0%, rgba(255,255,255,.28), rgba(255,255,255,0) 70%), radial-gradient(40% 35% at 90% 100%, rgba(255,255,255,.10), rgba(255,255,255,0) 70%)",
          boxShadow: "inset 0 2px 2px rgba(255,255,255,.70), inset 0 -2px 3px rgba(255,255,255,.20)",
        }}
      />
      <div
        style={{
          ...layer,
          padding: 3,
          background:
            "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,.55) 14%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 66%, rgba(255,255,255,.40) 86%, rgba(255,255,255,.95) 100%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", textShadow: "0 1px 2px rgba(0,0,0,.28), 0 0 18px rgba(0,0,0,.10)" }}>{children}</div>
    </div>
  );
};

/** iOS-style app tile (rounded square with a vertical gradient and an inner highlight). */
export const AppTile: React.FC<{ size: number; bg: string; children: React.ReactNode }> = ({ size, bg, children }) => (
  <div
    style={{
      width: size,
      height: size,
      flex: "none",
      borderRadius: "23%",
      background: bg,
      display: "grid",
      placeItems: "center",
      boxShadow: "inset 0 2px 1px rgba(255,255,255,.45), inset 0 -2px 2px rgba(0,0,0,.12), 0 6px 16px rgba(0,0,0,.18)",
    }}
  >
    {children}
  </div>
);
