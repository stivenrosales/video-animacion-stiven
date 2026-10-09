import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";

export const DURATION_SEC = 76.85; // stays below the 76.88 s edited source (keeps the breath after "nos vemos")

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GentleReel"
    component={Main}
    durationInFrames={Math.round(DURATION_SEC * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
