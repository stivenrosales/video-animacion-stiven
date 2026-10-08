import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, cardProgress, offProgress } from "./Camera";
import { Captions } from "./Captions";
import { Scenes } from "./scenes";
import { Sfx } from "./Sfx";
import { A } from "./theme";
import { ease, easeIn, useSec } from "./ui";

/** Ali's canvas: warm cream with the big soft S-curve swoosh in the lower right. */
export const Swoosh: React.FC = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <path
      fill={A.swoosh}
      d="M-80 1920 C 380 1760 640 1240 860 860 C 960 690 1060 620 1180 600 L1180 1080 C 1040 1120 900 1360 760 1920 Z"
    />
  </svg>
);

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
