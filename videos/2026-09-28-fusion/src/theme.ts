import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { continueRender, delayRender, spring, staticFile } from "remotion";

export const FPS = 60;

/** Caption chips and UI text (Ali's shorts use a bold geometric sans). */
export const sans = loadPoppins("normal", { weights: ["500", "600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
/** Handwritten notes: Excalidraw's Excalifont (OFL), matching the rough.js strokes. */
export const hand = "Excalifont";
/** Condensed caps labels ("ONE QUESTION I GET A LOT:"). */
export const caps = loadOswald("normal", { weights: ["600"], subsets: ["latin"] }).fontFamily;

/** Fraunces variable with the SOFT axis maxed: the free stand-in for Ali's Recoleta headlines. */
export const serif = "FrauncesSoft";
export const SOFT = '"SOFT" 100, "WONK" 0';
const fontHandle = delayRender("Load Fraunces and Excalifont");
Promise.all([
  new FontFace(serif, `url(${staticFile("fonts/Fraunces.ttf")}) format("truetype")`, { style: "normal", weight: "100 900" }).load(),
  new FontFace(serif, `url(${staticFile("fonts/Fraunces-Italic.ttf")}) format("truetype")`, { style: "italic", weight: "100 900" }).load(),
  new FontFace(hand, `url(${staticFile("fonts/excalifont.woff2")}) format("woff2")`).load(),
])
  .then((faces) => {
    faces.forEach((f) => document.fonts.add(f));
    continueRender(fontHandle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(fontHandle);
  });

/** Ali Abdaal palette: aliabdaal.com brand colors plus the accents of his shorts. */
export const C = {
  ink: "#1B1624",
  cream: "#F9F6F3",
  gold: "#F7C95B",
  yellow: "#FDD46B",
  sky: "#5DCDF1",
  peach: "#FD976D",
  mint: "#8EF0A8",
  lilac: "#C9B6FF",
  white: "#FFFFFF",
  chip: "rgba(240,240,242,0.95)",
  chipText: "#141414",
  chipGray: "#9A9AA0",
  aqua: "#DDF3F1",
};

/** IG/TikTok safe area on 1080x1920; graphics live in the top band above the head. */
export const SAFE = { top: 250, bottom: 1500, railX: 940, headTop: 630 };

export const pop = (
  t: number,
  at: number,
  config: { damping?: number; stiffness?: number; mass?: number } = {},
) =>
  t < at
    ? 0
    : spring({ frame: (t - at) * FPS, fps: FPS, config: { damping: 14, stiffness: 180, mass: 0.7, ...config } });

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
