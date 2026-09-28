import { loadFont as loadSerif } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { spring } from "remotion";

export const FPS = 60; // smoother motion; the 30fps camera plays fine inside a 60fps comp

export const serif = loadSerif("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
}).fontFamily;
export const serifItalic = loadSerif("italic", {
  weights: ["400", "500"],
  subsets: ["latin"],
}).fontFamily;
export const sans = loadSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;
export const mono = loadMono("normal", {
  weights: ["500"],
  subsets: ["latin"],
}).fontFamily;

export const C = {
  bg: "#FAF9F5",
  card: "#FFFFFF",
  border: "#E8E6DC",
  ink: "#141413",
  muted: "#6B6A65", // secondary UI text
  placeholder: "#8C8A83", // input placeholders
  faint: "#B9B6AC",
  chip: "#EFEEEA",
  spark: "#D97757", // Claude logo only
  accent: "#C15F3C", // deeper Claude clay, readable on white
  blue: "#2E7CF6",
  blueBg: "#E4EEFD",
  amber: "#D4861F",
  amberBg: "#FBEBD8",
  violet: "#8A6FD8",
  violetBg: "#ECE7FA",
  green: "#3E8E5B",
  greenBg: "#E3F1E7",
  red: "#C4553D",
  redBg: "#FBE6E1",
};

/** Pastel icon tiles lifted from the real Claude UI dropdown (claude-ui-reference.png). */
export const PASTEL = {
  blue: { bg: "#E4EEFA", color: "#2F7FD8" },
  orange: { bg: "#F9EBDD", color: "#D98A2B" },
  purple: { bg: "#EEEAF8", color: "#8B72D2" },
  green: { bg: "#E6F2E8", color: "#3F9A5B" },
  clay: { bg: "#F7E6DE", color: "#D97757" },
} as const;

/** Instagram Reels / TikTok safe area on a 1080x1920 canvas. */
export const SAFE = { top: 250, bottom: 1500, side: 90 };

/** Card mode stacks three exclusive bands: animation panel, caption lane, camera card. */
export const LAYOUT = {
  panelBottom: 860,
  laneCenter: 935,
  cardTop: 1010,
  cardHeight: 880,
  fullCaptionY: 1440,
};

export const shadow = "0 2px 6px rgba(20,20,19,0.04), 0 18px 48px rgba(20,20,19,0.07)";

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
export const prog = (t: number, a: number, b: number) =>
  clamp01((t - a) / (b - a));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Characters to reveal for a typewriter effect. */
export const typed = (text: string, t: number, at: number, cps = 32) =>
  text.slice(0, Math.max(0, Math.floor((t - at) * cps)));
