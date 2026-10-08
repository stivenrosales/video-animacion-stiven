import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";

export const DURATION_SEC = 57.4; // stays below the 57.43 s edited source (keeps the breath after "opinas?")

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CursosReel"
    component={Main}
    durationInFrames={Math.round(DURATION_SEC * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
