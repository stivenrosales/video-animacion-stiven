import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { continueRender, delayRender, spring, staticFile } from "remotion";

export const FPS = 60;

/** UI labels ("Data source" in Ali's flow rows, chips, FUENTE line). */
export const sans = loadSans("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;

/** Fraunces variable stands in for Ali's YouTube serif (work/spec.md): display optical size, a little SOFT. */
export const serif = "FrauncesAli";
export const SERIF_AXES = '"opsz" 72, "SOFT" 30, "WONK" 0';
const fontHandle = delayRender("Load Fraunces");
new FontFace(serif, `url(${staticFile("fonts/Fraunces.ttf")}) format("truetype")`, { style: "normal", weight: "100 900" })
  .load()
  .then((f) => {
    document.fonts.add(f);
    continueRender(fontHandle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(fontHandle);
  });

/** Tokens sampled from Ali Abdaal's long-form YouTube graphics (ref/yt-*.jpg + user screenshots). */
export const A = {
  canvas: "#FAF8F4",
  swoosh: "#F2EDE8",
  panel: "#FFFFFF",
  tile: "#FBF7F4",
  tileBorder: "#EFE9E4",
  ink: "#1C1A19",
  muted: "#8A847E",
  label: "#55504B",
  orange: "#F17E3C",
  salmon: "#FF8675",
  salmonText: "#FF9A80", // keyword over footage
  sky: "#5CC6EE",
  green: "#7DC88E",
  lilac: "#B9B4F2", // camera card border
  lilacPill: "#C7B6F8",
  chapter: "#FBEDE6",
  chip: "#ECE7E2",
  chipText: "#7A736C",
  wa: "#25D366",
  meta: "#0467DF",
};

export const panelShadow = "0 24px 70px rgba(60,40,20,.08), 0 0 0 1px rgba(60,40,20,.03)";
export const shadow = "0 0 0 6px rgba(185,180,242,.18), 0 20px 50px rgba(40,30,20,.12)";

/** Instagram Reels / TikTok safe area on a 1080x1920 canvas. */
export const SAFE = { top: 250, bottom: 1500, side: 90 };

/** Card mode stacks three bands: white panel, caption lane, camera card (board v2 geometry). */
export const LAYOUT = {
  panelTop: 230,
  panelBottom: 790,
  laneCenter: 858,
  cardTop: 940,
  cardHeight: 920,
  cardX: 90,
  cardW: 900,
  // Wide card (flow row scene): taller camera on top, flow row below it.
  wideTop: 240,
  wideHeight: 1010,
  wideX: 60,
  wideW: 960,
  wideCaptionY: 1470,
  offCaptionY: 1470,
  fullCaptionY: 1462, // clears THIS speaker's chin (close framing)
};

/** Spring from 0 to 1 that starts at `at` seconds. */
export const pop = (
  t: number,
  at: number,
  config: { damping?: number; stiffness?: number; mass?: number } = {},
) =>
  t < at
    ? 0
    : spring({
        frame: (t - at) * FPS,
        fps: FPS,
        config: { damping: 15, stiffness: 180, mass: 0.7, ...config },
      });

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Linear 0..1 progress between two seconds. */
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
