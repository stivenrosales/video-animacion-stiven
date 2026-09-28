import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, cardProgress, offProgress } from "./Camera";
import { Captions } from "./Captions";
import { Scenes } from "./scenes";
import { Sfx } from "./Sfx";
import { Stickers } from "./Stickers";
import { C } from "./theme";
import { useSec } from "./ui";

// Plain cream canvas per spec v2 (the dot grid competed with the Claude-UI cards).
const Backdrop: React.FC<{ p: number }> = ({ p }) => (
  <AbsoluteFill
    style={{
      background: C.bg,
      opacity: p,
    }}
  />
);

export const Main: React.FC = () => {
  const t = useSec();
  const p = cardProgress(t);
  const off = offProgress(t);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Backdrop p={Math.max(Math.min(1, p * 1.5), off)} />
      <Camera t={t} />
      <Scenes />
      <Captions t={t} />
      <Stickers />
      <Sfx />
    </AbsoluteFill>
  );
};
