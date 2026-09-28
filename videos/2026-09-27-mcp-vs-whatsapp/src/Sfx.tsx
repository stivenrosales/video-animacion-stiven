import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { CUES } from "./scenes";
import { FPS } from "./theme";

// Approved sound set (A for every category, B for the time-lapse riser); low levels under the voice.
const SFX: Record<keyof typeof CUES, { file: string; volume: number; frames: number }> = {
  transicion: { file: "transicion.wav", volume: 0.1, frames: 30 },
  aparicion: { file: "aparicion.wav", volume: 0.14, frames: 26 },
  clic: { file: "clic.wav", volume: 0.25, frames: 10 },
  tecleo: { file: "tecleo.wav", volume: 0.1, frames: 34 },
  check: { file: "check.wav", volume: 0.15, frames: 30 },
  exito: { file: "exito.wav", volume: 0.18, frames: 54 },
  timelapse: { file: "timelapse.wav", volume: 0.07, frames: 90 },
};

export const Sfx: React.FC = () => (
  <>
    {(Object.keys(CUES) as Array<keyof typeof CUES>).flatMap((k) =>
      CUES[k].map((at, i) => (
        <Sequence key={`${k}${i}`} from={Math.max(0, Math.round(at * FPS))} durationInFrames={SFX[k].frames}>
          <Audio src={staticFile(`sfx/${SFX[k].file}`)} volume={SFX[k].volume} />
        </Sequence>
      )),
    )}
  </>
);
