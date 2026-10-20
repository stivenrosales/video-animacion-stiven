import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FPS } from "./theme";

/** ElevenLabs picks (work/sfx/sfx-ab.html): whoosh D, pop D, page E. About one per scene, kept low. */
const CUES: Array<[number, "whoosh" | "pop" | "pagina", number]> = [
  [3.42, "whoosh", 0.22], // split opens on the three covers
  [8.55, "pagina", 0.3], // midudev cover
  [16.83, "whoosh", 0.16], // ramas figure
  [21.7, "whoosh", 0.18], // split reopens on the repos figure
  [25.64, "pagina", 0.3], // AI Engineering cover
  [30.3, "pop", 0.2], [32.35, "pop", 0.2], [33.21, "pop", 0.2], // app → API → LLM
  [38.6, "whoosh", 0.16], // shoggoth
  [41.78, "pagina", 0.3], // Grokking cover
  [46.33, "pop", 0.18], [47.35, "pop", 0.18], // doodles
  [58.9, "pagina", 0.3], // Python cover
  [69.51, "pop", 0.22], [70.82, "pop", 0.22], // aliens hit
  [79.92, "pop", 0.22], // comment pill
];

export const Sfx: React.FC = () => (
  <>
    {CUES.map(([at, id, vol], i) => (
      <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={Math.round(1.2 * FPS)}>
        <Audio src={staticFile(`sfx/${id === "pagina" ? "pagina" : id}.mp3`)} volume={vol} />
      </Sequence>
    ))}
  </>
);
