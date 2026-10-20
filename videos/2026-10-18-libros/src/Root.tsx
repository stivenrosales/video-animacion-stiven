import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";
import { END } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition id="LibrosReel" component={Main} durationInFrames={Math.round(END * FPS)} fps={FPS} width={1080} height={1920} />
);
