import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";

export const DURATION_SEC = 25.5; // 22.34 s of voice + a 3.2 s hold so the sign-up link can be read

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TallerReel"
    component={Main}
    durationInFrames={Math.round(DURATION_SEC * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
