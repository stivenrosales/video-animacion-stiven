import { Easing, continueRender, delayRender, interpolate, staticFile } from "remotion";

export const FPS = 60;
export const C = {
  sumi: "#1A1A18",
  washi: "#F6F4EF",
  arena: "#E4DFD3",
  moss: "#8FA85A",
  mute: "#8C877C",
  win: "#222220",
  line: "#2E2E2A",
};
export const SANS = "Satoshi";
export const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

// Koan's own easing: cubic-bezier(.32,.72,0,1)
export const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** 0→1 over `dur` seconds starting at `at`, with the Koan ease. */
export const prog = (t: number, at: number, dur = 0.5) => interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: EASE });
/** The kit's "rise": 24 px up + 8 px blur → sharp. */
export const rise = (t: number, at: number, dur = 0.55, dy = 24, blur = 8): React.CSSProperties => {
  const p = prog(t, at, dur);
  return { opacity: p, transform: `translateY(${(1 - p) * dy}px)`, filter: `blur(${(1 - p) * blur}px)` };
};

if (typeof document !== "undefined") {
  const handle = delayRender("Satoshi");
  const face = new FontFace(SANS, `url(${staticFile("Satoshi-Variable.woff2")}) format("woff2")`, { weight: "300 900" });
  face.load().then((f) => {
    document.fonts.add(f);
    continueRender(handle);
  });
}
