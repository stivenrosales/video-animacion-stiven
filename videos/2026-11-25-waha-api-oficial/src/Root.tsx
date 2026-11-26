import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";

export const DURATION_SEC = 70.97;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WahaReel" component={Main} durationInFrames={Math.round(DURATION_SEC * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ proxy: false }} />
    {/* Fast look-and-feel check: 30 fps over the 720p proxy; render it with --scale=0.5 */}
    <Composition id="WahaReelPreview" component={Main} durationInFrames={Math.round(DURATION_SEC * 30)} fps={30} width={1080} height={1920} defaultProps={{ proxy: true }} />
  </>
);
