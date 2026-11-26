import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";

export const DURATION_SEC = 49.04;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SfxReel" component={Main} durationInFrames={Math.round(DURATION_SEC * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ proxy: false }} />
    {/* Fast look-and-feel check: 30 fps over the 720p proxy; render it with --scale=0.5 */}
    <Composition id="SfxReelPreview" component={Main} durationInFrames={Math.round(DURATION_SEC * 30)} fps={30} width={1080} height={1920} defaultProps={{ proxy: true }} />
  </>
);
