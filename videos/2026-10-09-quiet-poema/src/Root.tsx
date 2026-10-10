import React from "react";
import { Composition } from "remotion";
import { END, FPS, Main } from "./Main";

export const RemotionRoot: React.FC = () => (
  <Composition id="QuietPoema" component={Main} durationInFrames={Math.round(END * FPS)} fps={FPS} width={1080} height={1350} />
);
