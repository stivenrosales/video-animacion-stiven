import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, staticFile, useCurrentFrame } from "remotion";
import cuts from "./cuts.json";
import { FPS, lerp, prog } from "./theme";

const ASPECT = 1080 / 1920;
const FACE_Y = 0.45; // face height in the source frame
const ANCHOR = 0.47; // where the face sits on screen, leaving the top band for graphics

export const useSec = () => useCurrentFrame() / FPS;

/**
 * Frameless drop (the movement taken from the Claude-UI reels): the camera slides down,
 * the sky above becomes a tall stage for diagrams, and the captions ride up above the hair.
 */
export const LOWER: Array<[number, number]> = [
  [30.05, 44.65], // "no todo es un agente" + the 9:00 flow
  [50.95, 56.3], // dashboard/ERP window; the ending take goes back to full frame
];
export const LOWER_PX = 320;
const ease01 = (x: number) => Easing.bezier(0.16, 1, 0.3, 1)(Math.min(1, Math.max(0, x)));
export const lowerAmount = (t: number) =>
  LOWER.reduce((v, [a, b]) => Math.max(v, t < a || t > b + 0.7 ? 0 : Math.min(ease01((t - a) / 0.7), 1 - ease01((t - b) / 0.7))), 0);

/** Punch-in that alternates on every jump cut (Ali's shorts cut on every breath). */
const cutZoom = (t: number) => {
  let idx = 0;
  for (const c of cuts) if (t >= c) idx++;
  const last = idx > 0 ? cuts[idx - 1] : 0;
  // Gentle punch-ins keep the face smaller, so the chin stays clear of the caption chip.
  const target = idx % 2 === 0 ? 1.06 : 1.12;
  const prev = idx % 2 === 0 ? 1.12 : 1.06;
  return idx === 0 ? 1.06 : lerp(prev, target, Math.min(1, 0.85 + Easing.out(Easing.cubic)(prog(t, last, last + 0.12)) * 0.15));
};

export const Camera: React.FC<{ t: number }> = ({ t }) => {
  const low = lowerAmount(t);
  // While lowered the punch-in is dropped so the face stays inside the frame.
  const zoom = lerp(cutZoom(t), 1, low) * (1 + 0.01 * Math.sin(t * 0.6));
  const w = 1080 * zoom;
  const h = w / ASPECT;
  const shift = LOWER_PX * low;
  const top = Math.min(0, Math.max(1920 - h, ANCHOR * 1920 - FACE_Y * h)) + shift;
  const mask = shift > 1 ? "linear-gradient(to bottom, transparent 0px, black 220px)" : undefined;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      {shift > 1 && (
        // The gap above is a blurred copy of the same shot; the sky makes it seamless.
        <Video src={staticFile("edited.mp4")} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, filter: "blur(28px)", transform: "scale(1.04)" }} />
      )}
      <Video
        src={staticFile("edited.mp4")}
        style={{ position: "absolute", left: (1080 - w) / 2, top, width: w, height: h, ...(mask ? { maskImage: mask, WebkitMaskImage: mask } : {}) }}
      />
    </AbsoluteFill>
  );
};

/** Darkens the sky so white serif text reads; taller while the camera is lowered. */
export const Scrim: React.FC<{ t: number }> = ({ t }) => {
  const low = lowerAmount(t);
  const s = (v: number) => (v * (1 + 0.18 * low)).toFixed(1);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(14,12,24,.62) 0%, rgba(14,12,24,.40) ${s(22)}%, rgba(14,12,24,.12) ${s(36)}%, rgba(14,12,24,0) ${s(46)}%)`,
      }}
    />
  );
};
