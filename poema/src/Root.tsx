import React from "react";
import { Composition } from "remotion";
import timeline from "../timeline.json";
import { FPS, H, W } from "./kz";
import { Main } from "./Main";

export const RemotionRoot: React.FC = () => (
  <Composition id="Poema" component={Main} durationInFrames={Math.round(timeline.duration * FPS)} fps={FPS} width={W} height={H} />
);
