import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { MODES } from "./Camera";
import { ASK_TIMES, COUNT_END, DM_TIMES, FIX_AT, GUIDE_AT, GUIDE_DOCK, SEND_AT, PROMPT_LEN, TOOL_TIMES, TYPE_AT, TYPE_CPS } from "./pieces";
import { FPS } from "./theme";

const POPS = [2.7, GUIDE_AT, GUIDE_DOCK + 0.3, SEND_AT, 12.85, 16.85, 17.45, ...TOOL_TIMES, 27.3, ...ASK_TIMES, FIX_AT + 0.15, COUNT_END, 54.5];
const KEYS = Array.from({ length: PROMPT_LEN }, (_, i) => TYPE_AT + i / TYPE_CPS);

const At: React.FC<{ at: number; src: string; volume: number; frames?: number }> = ({ at, src, volume, frames = 12 }) => (
  <Sequence from={Math.round(at * FPS)} durationInFrames={frames}>
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

export const Sfx: React.FC = () => (
  <>
    {MODES.slice(1).map(([at]) => (
      <At key={`w${at}`} at={at - 0.12} src="whoosh.wav" volume={0.22} frames={40} />
    ))}
    {POPS.map((at) => (
      <At key={`p${at}`} at={at} src="pop.wav" volume={0.16} />
    ))}
    {DM_TIMES.map((at) => (
      <At key={`d${at}`} at={at} src="pop.wav" volume={0.09} />
    ))}
    {KEYS.map((at, i) => (
      <At key={`k${i}`} at={at} src="key.wav" volume={0.05 + (i % 3) * 0.015} frames={4} />
    ))}
  </>
);
