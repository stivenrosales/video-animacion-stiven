import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "./Camera";
import { Captions } from "./Captions";
import { Overlays } from "./Overlays";
import { Canvas, Scenes } from "./Scenes";
import { Sfx } from "./Sfx";
import { useSec } from "./theme";

export const Main: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Canvas t={t} />
      <Scenes t={t} />
      <Camera t={t} />
      <Overlays t={t} />
      <Captions t={t} />
      <Sfx />
    </AbsoluteFill>
  );
};
