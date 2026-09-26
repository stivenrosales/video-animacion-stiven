import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { MODES } from "./Camera";
import { ENTERPRISE_AT, ARMA_AT, ARMA_LINE_TIMES, IMAGE_AT, INSTALL_TIMES, INTENT_WORD_AT, Q_TIMES, SHRINK_AT, SKILL_AT, TITLE_AT, VIABLE_AT } from "./pieces";
import { FPS } from "./theme";

// Key reveals (cue times live in pieces.tsx so sound and picture never drift).
const POPS = [1.3, ENTERPRISE_AT, ENTERPRISE_AT + 0.75, 7.0, 8.35, SKILL_AT, 27.0, 28.3, ARMA_AT, INTENT_WORD_AT, 36.5, 39.7, 40.5, 41.3, SHRINK_AT, 44.35, 48.8, 51.4, 52.7, 53.2, VIABLE_AT, IMAGE_AT, TITLE_AT];
const SOFT = [...INSTALL_TIMES, ...Q_TIMES, ...ARMA_LINE_TIMES, 13.9, 14.4, 14.9, 15.4, 15.9];

const At: React.FC<{ at: number; src: string; volume: number; frames?: number }> = ({ at, src, volume, frames = 12 }) => (
  <Sequence from={Math.round(at * FPS)} durationInFrames={frames}>
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

export const Sfx: React.FC = () => (
  <>
    <At at={ENTERPRISE_AT - 0.14} src="whoosh.wav" volume={0.2} frames={40} />
    {MODES.slice(1).map(([at]) => (
      <At key={`w${at}`} at={at - 0.12} src="whoosh.wav" volume={0.22} frames={40} />
    ))}
    {POPS.map((at) => (
      <At key={`p${at}`} at={at} src="pop.wav" volume={0.16} />
    ))}
    {SOFT.map((at, i) => (
      <At key={`s${i}`} at={at} src="pop.wav" volume={0.08} />
    ))}
  </>
);
