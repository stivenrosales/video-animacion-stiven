import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, offProgress, splitProgress } from "./Camera";
import { Captions } from "./Captions";
import { Scenes } from "./scenes";
import { Sfx } from "./Sfx";
import { A } from "./theme";
import { ease, easeIn, useSec } from "./ui";

/** Ali's canvas: warm cream with the big soft S-curve swoosh in the lower right (full canvas slides). */
export const Swoosh: React.FC = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <path
      fill={A.swoosh}
      d="M-80 1920 C 380 1760 640 1240 860 860 C 960 690 1060 620 1180 600 L1180 1080 C 1040 1120 900 1360 760 1920 Z"
    />
  </svg>
);

/** Split layout: the swoosh lives only in the graphics band and closes above the camera fade. */
export const TopSwoosh: React.FC = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <path
      fill={A.swoosh}
      d="M-80 600 C 260 610 520 500 720 320 C 840 200 980 110 1180 90 L1180 330 C 1030 350 900 450 800 540 C 690 640 500 690 280 700 C 130 706 30 690 -80 680 Z"
    />
  </svg>
);

/** Full-frame headline windows (scenes.tsx): the sky gets darkened only while text sits on it. */
const SCRIM: Array<[number, number]> = [
  [0.05, 3.6], // hook
  [5.85, 8.1], // Claude Code pill
  [17.5, 22.55], // "más fácil · más didáctico" → "más construyes, más aprendes"
  [27.2, 31.3], // creator card
  [57.55, 60.5], // "Gratis" → "¿por qué es gratis?"
  [61.9, 65.1], // follow him
  [69.1, 72.2], // programmer or not
  [74.1, 78], // close
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
  const split = splitProgress(t);
  const off = offProgress(t);
  return (
    <AbsoluteFill style={{ background: A.canvas }}>
      <AbsoluteFill style={{ opacity: off }}>
        <Swoosh />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: split }}>
        <TopSwoosh />
      </AbsoluteFill>
      <Camera t={t} />
      <Scrim t={t} />
      <Scenes />
      <Captions t={t} />
      <Sfx />
    </AbsoluteFill>
  );
};
