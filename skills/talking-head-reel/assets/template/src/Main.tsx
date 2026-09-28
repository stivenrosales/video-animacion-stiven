import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, cardProgress } from "./Camera";
import { Captions } from "./Captions";
import { Scenes } from "./scenes";
import { Sfx } from "./Sfx";
import { C } from "./theme";
import { useSec } from "./ui";

const Backdrop: React.FC<{ p: number }> = ({ p }) => (
  <AbsoluteFill
    style={{
      background: C.bg,
      backgroundImage: "radial-gradient(rgba(20,20,19,0.07) 2px, transparent 2px)",
      backgroundSize: "44px 44px",
      opacity: p,
    }}
  />
);

export const Main: React.FC = () => {
  const t = useSec();
  const p = cardProgress(t);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Backdrop p={Math.min(1, p * 1.5)} />
      <Camera t={t} />
      <Scenes />
      <Captions t={t} />
      <Sfx />
    </AbsoluteFill>
  );
};
