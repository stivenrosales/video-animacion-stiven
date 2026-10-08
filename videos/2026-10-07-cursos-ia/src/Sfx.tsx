import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { MODES } from "./Camera";
import { CUES } from "./pieces";
import { FPS } from "./theme";

// Approved set A (workflows reel). One category -> file map; swapping a pick just replaces the wav in public/sfx/.
const SFX = {
  transicion: "transicion.wav",
  aparicion: "aparicion.wav",
  clic: "clic.wav",
  trazo: "trazo.wav",
  tachon: "tachon.wav",
  tiza: "tiza.wav",
};
const VOLUME: Record<keyof typeof SFX, number> = {
  transicion: 0.12,
  aparicion: 0.14,
  clic: 0.25,
  trazo: 0.25, // user: 0.5 (as auditioned in out/sfx-ab) was too loud
  tachon: 0.25,
  tiza: 0.25,
};

const At: React.FC<{ at: number; src: string; volume: number; frames?: number }> = ({ at, src, volume, frames = 30 }) => (
  <Sequence from={Math.round(at * FPS)} durationInFrames={frames}>
    <Audio src={staticFile(`sfx/${src}`)} volume={volume} />
  </Sequence>
);

export const Sfx: React.FC = () => (
  <>
    {MODES.slice(1).map(([at]) => (
      <At key={`transicion${at}`} at={at - 0.12} src={SFX.transicion} volume={VOLUME.transicion} frames={30} />
    ))}
    {CUES.aparicion.map((at, i) => (
      <At key={`aparicion${i}`} at={at} src={SFX.aparicion} volume={VOLUME.aparicion} frames={26} />
    ))}
    {CUES.clic.map((at, i) => (
      <At key={`clic${i}`} at={at} src={SFX.clic} volume={VOLUME.clic} frames={10} />
    ))}
    {(["trazo", "tachon", "tiza"] as const).map((k) =>
      CUES[k].map((at, i) => <At key={`${k}${i}`} at={at} src={SFX[k]} volume={VOLUME[k]} frames={45} />),
    )}
  </>
);
