import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { MODES } from "./Camera";
import { FPS } from "./theme";

const POPS = [
  1.2, 3.35, 4.0, 7.5, 8.9, 11.95, 12.4, 14.15, 14.62, 14.97, 25.05, 27.95, 32.35, 36.4, 40.6,
  46.55, 53.5, 55.25, 55.8, 60.6, 62.45, 63.85, 66.95, 70.45, 74.4, 77.7, 78.45,
];

export const Sfx: React.FC = () => (
  <>
    {MODES.slice(1).map(([at]) => (
      <Sequence key={`w${at}`} from={Math.round((at - 0.12) * FPS)} durationInFrames={20}>
        <Audio src={staticFile("whoosh.wav")} volume={0.22} />
      </Sequence>
    ))}
    {POPS.map((at) => (
      <Sequence key={`p${at}`} from={Math.round(at * FPS)} durationInFrames={6}>
        <Audio src={staticFile("pop.wav")} volume={0.16} />
      </Sequence>
    ))}
  </>
);
