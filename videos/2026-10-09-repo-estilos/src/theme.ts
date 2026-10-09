import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadSourceSerif } from "@remotion/google-fonts/SourceSerif4";
import { continueRender, delayRender, spring, staticFile } from "remotion";

export const FPS = 60;

/** UI labels ("Data source" in Ali's flow rows, chips, FUENTE line). */
export const sans = loadSans("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;

/** Fraunces variable stands in for Ali's YouTube serif (work/spec.md): display optical size, a little SOFT. */
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

/** Tokens sampled from Ali Abdaal's long-form YouTube graphics (ref/yt-*.jpg + user screenshots). */
export const A = {
  canvas: "#F7F7F5", // measured on 6-ZxPvpV8ec text slides
  swoosh: "#ECE7E4", // the wide S band, flat
  
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
};

export const panelShadow = "0 24px 70px rgba(60,40,20,.08), 0 0 0 1px rgba(60,40,20,.03)";
export const shadow = "0 0 0 6px rgba(185,180,242,.18), 0 20px 50px rgba(40,30,20,.12)";

/** Instagram Reels / TikTok safe area on a 1080x1920 canvas. */
export const SAFE = { top: 250, bottom: 1500, side: 90 };

/** Split layout (board-approved): graphic on cream in y 230–690, caption at 728, camera edge to edge from 740. */
export const LAYOUT = {
  panelTop: 230,
  panelBottom: 690,
  splitTop: 740,
  splitEyeY: 1400, // eye line on screen in split mode: keeps the hair out of the 150 px fade
  splitCaptionY: 728,
  offCaptionY: 1470,
  fullCaptionY: 1462, // clears THIS speaker's chin (close framing)
  claudeCaptionY: 1468, // ink serif on grid paper, under the Claude camera card (690–1410)
};

/** GitHub Primer tokens for the repo card and the Star button. */
export const GH = { text: "#1F2328", muted: "#59636E", border: "#D1D9E0", btn: "#F6F8FA", counter: "#E7ECF0", star: "#E3B341", green: "#1F883D" };

/* ---- Style 1 · Claude Carousel (Claude's IG carousels): grid paper, hand boxes, Source Serif. ---- */
export const claudeSerif = loadSourceSerif("normal", { weights: ["400", "500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const H = { paper: "#F0F1EB", grid: "#E3E5DC", ivory: "#F5F4ED", peach: "#EBC9B7", sand: "#E3DACB", blueGray: "#C0D2DE", clay: "#D97757", gray: "#E8E6DF", chalk: "#FBFAF6" };
export const C = { ink: "#141413", spark: "#D97757" };

/* ---- Style 2 · Ali Abdaal Shorts (MCP reel kit): full camera, gold soft serif, Poppins chip, Gaegu notes. ---- */
export const poppins = loadPoppins("normal", { weights: ["500", "600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const gaegu = loadGaegu("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;
export const oswald = loadOswald("normal", { weights: ["600"], subsets: ["latin"] }).fontFamily;
export const SOFT_AXES = '"opsz" 72, "SOFT" 100, "WONK" 0';
export const S = { gold: "#F7C95B", mint: "#8EF0A8", ink: "#1B1624", chip: "rgba(240,240,242,.95)", upcoming: "#9A9AA0" };

/* ---- Style 3 · Liquid Glass (Apple): SF stack, white text on refractive glass. ---- */
export const sf = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, sans-serif';

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
