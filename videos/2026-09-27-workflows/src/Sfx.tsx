import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { MODES } from "./Camera";
import { CUES } from "./pieces";
import { FPS } from "./theme";

// One category -> file map. Swapping the user's A/B/C pick just replaces the wav in public/sfx/.
const SFX = {
  transicion: "transicion.wav",
  aparicion: "aparicion.wav",
  clic: "clic.wav",
  tecleo: "tecleo.wav",
  check: "check.wav",
  exito: "exito.wav",
  timelapse: "timelapse.wav",
};
const VOLUME: Record<keyof typeof SFX, number> = {
  transicion: 0.12,
  aparicion: 0.14,
  clic: 0.25,
  tecleo: 0.1,
  check: 0.15,
  exito: 0.18,
  timelapse: 0.1,
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
    {CUES.tecleo.map((at, i) => (
      <At key={`tecleo${i}`} at={at} src={SFX.tecleo} volume={VOLUME.tecleo} frames={34} />
    ))}
    {CUES.check.map((at, i) => (
      <At key={`check${i}`} at={at} src={SFX.check} volume={VOLUME.check} frames={30} />
    ))}
    {CUES.exito.map((at, i) => (
      <At key={`exito${i}`} at={at} src={SFX.exito} volume={VOLUME.exito} frames={54} />
    ))}
    {CUES.timelapse.map((at, i) => (
      <At key={`timelapse${i}`} at={at} src={SFX.timelapse} volume={VOLUME.timelapse} frames={90} />
    ))}
  </>
);
