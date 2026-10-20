import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { continueRender, delayRender, Easing, spring, staticFile, useCurrentFrame } from "remotion";

export const FPS = 60;

/** UI labels and the FUENTE line. */
export const sans = loadSans("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;

/** Fraunces stands in for Ali's YouTube serif (skills/talking-head-reel/assets/styles/ali-youtube/spec.md). */
export const serif = "FrauncesAli";
export const SERIF_AXES = '"opsz" 72, "SOFT" 30, "WONK" 0';
const fontHandle = delayRender("Load Fraunces");
Promise.all([
  new FontFace(serif, `url(${staticFile("fonts/Fraunces.ttf")}) format("truetype")`, { style: "normal", weight: "100 900" }).load(),
  new FontFace(serif, `url(${staticFile("fonts/Fraunces-Italic.ttf")}) format("truetype")`, { style: "italic", weight: "100 900" }).load(),
])
  .then((faces) => {
    faces.forEach((f) => document.fonts.add(f));
    continueRender(fontHandle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(fontHandle);
  });

/** Tokens sampled from Ali Abdaal's long-form YouTube graphics. */
export const A = {
  canvas: "#F7F7F5",
  band: "#ECE7E4",
  panel: "#FFFFFF",
  tileBorder: "#EFE9E4",
  ink: "#1C1A19",
  muted: "#8A847E",
  orange: "#F17E3C",
  salmonText: "#FF9A80", // keyword over footage
  sky: "#5CC6EE",
  green: "#7DC88E",
  claude: "#D97757", // Claude logo only
};
export const panelShadow = "0 24px 70px rgba(60,40,20,.08), 0 0 0 1px rgba(60,40,20,.03)";

/** Fade split: graphics on the cream in y 250–690, caption at 722, camera edge to edge from 740 with a 150 px fade. */
export const LAYOUT = { bandTop: 250, bandBottom: 690, splitTop: 740, splitEyeY: 1400, splitCaptionY: 722, fullCaptionY: 1400 };

export const useSec = () => useCurrentFrame() / FPS;

const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
const expoIn = Easing.bezier(0.7, 0, 0.84, 0);
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (t: number, at: number, dur = 0.6) => expoOut(clamp01((t - at) / dur));
export const easeIn = (t: number, at: number, dur = 0.4) => expoIn(clamp01((t - at) / dur));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/** Spring 0 → 1 that starts at `at` seconds. */
export const pop = (t: number, at: number, config: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  t < at ? 0 : spring({ frame: (t - at) * FPS, fps: FPS, config: { damping: 15, stiffness: 180, mass: 0.7, ...config } });
