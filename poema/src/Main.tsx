import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "./Captions";
import { Scenes2 } from "./scenes2";
import { K, useT } from "./kz";

export const Main: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: K.night, overflow: "hidden" }}>
      <Scenes2 />
      <Captions t={t} />
      <Audio src={staticFile("poema-mix.wav")} />
    </AbsoluteFill>
  );
};
