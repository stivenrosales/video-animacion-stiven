import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, staticFile, useCurrentFrame } from "remotion";
import cuts from "./cuts.json";
import { FPS, lerp, prog } from "./theme";

const ASPECT = 1080 / 1920;
const FACE_Y = 0.45; // face height in the source frame
const ANCHOR = 0.47; // where the face sits on screen, leaving the top band for graphics

export const useSec = () => useCurrentFrame() / FPS;

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

/** Always full-screen, like Ali: no card split; graphics float in the darkened top band. */
export const Camera: React.FC<{ t: number }> = ({ t }) => {
  const zoom = cutZoom(t) * (1 + 0.01 * Math.sin(t * 0.6));
  const w = 1080 * zoom;
  const h = w / ASPECT;
  const top = Math.min(0, Math.max(1920 - h, ANCHOR * 1920 - FACE_Y * h));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Video src={staticFile("edited.mp4")} style={{ position: "absolute", left: (1080 - w) / 2, top, width: w, height: h }} />
    </AbsoluteFill>
  );
};

/** Darkens the sky so white serif text reads, echoing the dark top of Ali's indoor shots. */
export const Scrim: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(14,12,24,.60) 0%, rgba(14,12,24,.40) 22%, rgba(14,12,24,.12) 36%, rgba(14,12,24,0) 46%)",
    }}
  />
);
