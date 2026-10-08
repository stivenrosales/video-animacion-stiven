import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, cardProgress, offProgress } from "./Camera";
import { Captions } from "./Captions";
import { Scenes } from "./scenes";
import { Sfx } from "./Sfx";
import { H } from "./theme";
import { useSec } from "./ui";

// Grid paper from Claude's IG carousels (#F0F1EB with a 34 px grid).
const Backdrop: React.FC<{ p: number }> = ({ p }) => (
  <AbsoluteFill
    style={{
      backgroundColor: H.paper,
      backgroundImage: `linear-gradient(${H.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${H.grid} 1.5px, transparent 1.5px)`,
      backgroundSize: "34px 34px",
      backgroundPosition: "-1px -1px",
      opacity: p,
    }}
  />
);

export const Main: React.FC = () => {
  const t = useSec();
  const p = cardProgress(t);
  const off = offProgress(t);
  return (
    <AbsoluteFill style={{ background: H.paper }}>
      <Backdrop p={Math.max(Math.min(1, p * 1.5), off)} />
      <Camera t={t} />
      <Scenes />
      <Captions t={t} />
      <Sfx />
    </AbsoluteFill>
  );
};
