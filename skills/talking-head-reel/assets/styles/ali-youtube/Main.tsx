import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, cardProgress, offProgress } from "./Camera";
import { Captions } from "./Captions";
import { Scenes } from "./scenes";
import { Sfx } from "./Sfx";
import { A } from "./theme";
import { ease, easeIn, useSec } from "./ui";

/** Ali's band, traced from his YouTube frames (6-ZxPvpV8ec): a WIDE flat band that enters grazing the
 *  bottom edge, sweeps up in an S (upper edge S, lower edge C) and exits through the right edge; the frame
 *  crops both ends. Not a ring and not a tapered stroke. It drifts slowly. */
export const Swoosh: React.FC = () => {
  const t = useSec();
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <path fill={A.swoosh} transform={`translate(${-24 * Math.sin(t * 0.35)} ${18 * Math.sin(t * 0.28)})`} d="M-60 1920 C 380 1915, 560 1520, 680 1170 C 790 860, 930 640, 1140 600 L 1140 1010 C 980 1040, 830 1380, 770 1920 Z" />
    </svg>
  );
};

/** Split layouts (graphic above, camera below): the same band enters from the top edge and leaves by the
 *  right edge, so it lives only in the graphics band and never crosses the camera (a curve over the camera
 *  reads as a stain; a V-shaped wedge here looked odd). */
export const TopBand: React.FC = () => {
  const t = useSec();
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <path fill={A.swoosh} transform={`translate(${-18 * Math.sin(t * 0.35)} 0)`} d="M420 -40 C 560 200, 800 420, 1140 560 L 1140 300 C 980 230, 840 110, 760 -40 Z" />
    </svg>
  );
};

/** Full-frame headline windows (scenes.tsx): the sky gets darkened only while text sits on it. */
const SCRIM: Array<[number, number]> = [
  [0.05, 3.45], // hook
  [6.8, 8.15], // "3 consejos"
  [29.35, 30.9], // "Mejorar el prompt"
  [58.8, 62.3], // Agendar / Comprar → la ruta más corta (one continuous window, no dip)
  [83.85, 86], // close
];

/** Outdoors the sky is bright, so white serif text needs a darker top band (Ali's set is dark).
 *  It is a fixed full-frame layer that only fades: no scale or offset, so no edge can show. */
const Scrim: React.FC<{ t: number }> = ({ t }) => {
  const o = SCRIM.reduce((v, [a, b]) => Math.max(v, Math.min(ease(t, a - 0.1, 0.6), 1 - easeIn(t, b, 0.5))), 0);
  if (o <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        background:
          "linear-gradient(180deg, rgba(20,14,10,.56) 0%, rgba(20,14,10,.47) 10%, rgba(20,14,10,.34) 20%, rgba(20,14,10,.2) 29%, rgba(20,14,10,.09) 36%, rgba(20,14,10,.025) 41%, rgba(20,14,10,0) 45%)",
      }}
    />
  );
};

export const Main: React.FC = () => {
  const t = useSec();
  const p = Math.max(Math.min(1, cardProgress(t) * 1.5), offProgress(t));
  return (
    <AbsoluteFill style={{ background: A.canvas }}>
      <AbsoluteFill style={{ opacity: p }}>
        <Swoosh />
      </AbsoluteFill>
      <Camera t={t} />
      <Scrim t={t} />
      <Scenes />
      <Captions t={t} />
      <Sfx />
    </AbsoluteFill>
  );
};
