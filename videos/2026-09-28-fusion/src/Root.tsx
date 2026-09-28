import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";

export const DURATION_SEC = 64.85; // stays below the 64.89 s edited source (keeps the breath after the last word)

export const RemotionRoot: React.FC = () => (
  <Composition id="FusionReel" component={Main} durationInFrames={Math.round(DURATION_SEC * FPS)} fps={FPS} width={1080} height={1920} />
);
