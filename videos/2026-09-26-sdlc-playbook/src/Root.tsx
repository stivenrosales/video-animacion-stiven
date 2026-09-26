import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { PREVIEW_SEC, Piezas } from "./Preview";
import { FPS } from "./theme";

export const DURATION_SEC = 62.7;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Piezas" component={Piezas} durationInFrames={Math.round(PREVIEW_SEC * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="SdlcReel" component={Main} durationInFrames={Math.round(DURATION_SEC * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
