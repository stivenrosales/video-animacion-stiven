import React from "react";
import { Composition } from "remotion";
import { Glow } from "./Glow";
import T from "./timeline.json";

export const RemotionRoot: React.FC = () => (
  <Composition id="ClaudeGlow" component={Glow} durationInFrames={T.duration} fps={T.fps} width={1080} height={1920} />
);
