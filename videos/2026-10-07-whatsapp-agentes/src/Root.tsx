import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";

export const DURATION_SEC = 85.25; // stays below the 85.28 s edited source (keeps the breath after "opinas?")

export const RemotionRoot: React.FC = () => (
  <Composition
    id="WhatsAppReel"
    component={Main}
    durationInFrames={Math.round(DURATION_SEC * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
