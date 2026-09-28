import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, Scrim, useSec } from "./Camera";
import { Captions } from "./Captions";
import { Scenes } from "./scenes";
import { Sfx } from "./Sfx";

export const Main: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera t={t} />
      <Scrim t={t} />
      <Scenes t={t} />
      <Captions t={t} />
      <Sfx />
    </AbsoluteFill>
  );
};
