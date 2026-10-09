import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, claudeProgress, offProgress, splitProgress } from "./Camera";
import { Captions } from "./Captions";
import { Scenes } from "./scenes";
import { Sfx } from "./Sfx";
import { A, H } from "./theme";
import { ease, easeIn, useSec } from "./ui";

/** Ali's band, traced from his YouTube frames: enters grazing the bottom edge, sweeps up in an S and
 *  exits through the right edge (upper edge S, lower edge C); the frame crops both ends. It drifts slowly. */
export const Band: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <path
      fill={A.swoosh}
      transform={`translate(${-24 * Math.sin(t * 0.35)} ${18 * Math.sin(t * 0.28)})`}
      d="M-60 1920 C 380 1915, 560 1520, 680 1170 C 790 860, 930 640, 1140 600 L 1140 1010 C 980 1040, 830 1380, 770 1920 Z"
    />
  </svg>
);

/** Split layout: the same band language, entering from the top edge and leaving by the right edge,
 *  so it lives only in the graphics band and never crosses the camera. */
export const TopBand: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <path
      fill={A.swoosh}
      transform={`translate(${-18 * Math.sin(t * 0.35)} 0)`}
      d="M420 -40 C 560 200, 800 420, 1140 560 L 1140 300 C 980 230, 840 110, 760 -40 Z"
    />
  </svg>
);

/** Claude Carousel background: grid paper (#F0F1EB with a 34 px #E3E5DC grid). */
const GridPaper: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: H.paper,
      backgroundImage: `linear-gradient(${H.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${H.grid} 1.5px, transparent 1.5px)`,
      backgroundSize: "34px 34px",
      backgroundPosition: "-1px -1px",
    }}
  />
);

/** Full-frame windows where white text sits on the bright sky. */
const SCRIM: Array<[number, number]> = [
  [0.05, 5.35], // hook + Claude Opus pill
  [5.7, 6.85], // chat pills
  [26.45, 33.35], // Ali Shorts
];

/** A fixed full-frame layer that only fades: no scale or offset, so no edge can show. */
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
  const claude = claudeProgress(t);
  return (
    <AbsoluteFill style={{ background: A.canvas }}>
      <AbsoluteFill style={{ opacity: off }}>
        <Band t={t} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: split }}>
        <TopBand t={t} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: Math.min(1, Math.max(0, claude)) }}>
        <GridPaper />
      </AbsoluteFill>
      <Camera t={t} />
      <Scrim t={t} />
      <Scenes />
      <Captions t={t} />
      <Sfx />
    </AbsoluteFill>
  );
};
