import { lerp, pop } from "./theme";

/** 0 = full-screen talking head, 1 = Ali fade split (graphic on cream above, camera edge to edge below). */
export type Mode = 0 | 1;
export const MODES: Array<[number, Mode]> = [
  [0, 0], // hook: "Si estás haciendo vibe coding" behind his head
  [3.44, 1], // "te recomiendo estos tres libros" … midudev … ramas
  [19.1, 0], // "push, merge, commits" behind his head
  [21.69, 1], // equipos … AI Engineering … Grokking
  [51.3, 0], // "para poder utilizarlos" + bonus behind his head
  [58.55, 1], // Python … juegos
  [71.76, 0], // "Entonces te recomiendo hacerlo" + follow CTA
];

/** Graphic shown in the split band, cued to word times of the edited audio (src/captions.json). */
export type SceneId =
  | "trio" | "git" | "vscode" | "ramas" | "repos" | "ai" | "api" | "usecases" | "shoggoth" | "grok" | "doodles" | "py" | "aliens";
export const SCENES: Array<[number, SceneId]> = [
  [3.44, "trio"], // "te recomiendo estos tres libros para que afines… tu criterio"
  [8.52, "git"], // "El primero es este, de midudev"
  [11.33, "vscode"], // "es como usar GitHub"
  [16.81, "ramas"], // "cuando desarrollas"
  [21.69, "repos"], // "…funciona mucho mejor y para trabajar en equipos"
  [25.63, "ai"], // "El segundo libro"
  [29.51, "api"], // "usar la IA vía API, modelos LLM"
  [34.25, "usecases"], // "construir aplicaciones que tengan IA"
  [38.59, "shoggoth"], // "criterios y buenas prácticas… demasiado rápido"
  [41.76, "grok"], // "Tercero es este libro"
  [46.3, "doodles"], // "bastante gráfico, tiene dibujitos"
  [58.55, "py"], // "el lenguaje más amigable… Python Crash Course"
  [68.27, "aliens"], // "los ejemplos son con juegos"
];

export const END = 81.4;

/** Text on screen already says these words, so the running captions hide. */
export const NO_CAPTIONS: Array<[number, number]> = [
  [0, 3.42], // hook headline
  [19.1, 21.6], // push · merge · commits
  [53.3, 58.5], // bonus / sepas programar
  [79.9, 99], // the comment pill carries "Coméntame aquí abajo"
];

const SPRING = { damping: 20, stiffness: 140, mass: 0.9 };
/** 0 (full) .. 1 (split), springing at every mode change. */
export const splitProgress = (t: number) => {
  let v = MODES[0][1] as number;
  for (let i = 1; i < MODES.length; i++) {
    const [at, mode] = MODES[i];
    if (t >= at) v = lerp(MODES[i - 1][1], mode, pop(t, at, SPRING));
  }
  return v;
};
