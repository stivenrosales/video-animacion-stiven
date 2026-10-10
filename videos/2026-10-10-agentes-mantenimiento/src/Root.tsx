import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";

export const DURATION_SEC = 127.8; // stays below the 127.87 s edited source (keeps the breath after "Coméntame")

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AgentesReel"
    component={Main}
    durationInFrames={Math.round(DURATION_SEC * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
