import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";

export const DURATION_SEC = 44.6; // stays below the 44.65 s edited source (keeps the breath after "nos vemos")

export const RemotionRoot: React.FC = () => (
  <Composition
    id="RepoReel"
    component={Main}
    durationInFrames={Math.round(DURATION_SEC * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
