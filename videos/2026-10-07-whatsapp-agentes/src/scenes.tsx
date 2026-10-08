import React from "react";
import { Scene } from "./ui";
import {
  BetterPrompt, Bubbles, Buttons, Chapter1, Chapter2, Chapter3, Close, Compare, Flow, Goals, Hook,
  McDonalds, Shortest, SpecificSlide, ThreeTips,
} from "./pieces";

/** Scene windows on the edited timeline; they must agree with MODES in Camera.tsx. */
export const SCENES: Array<{ id: string; start: number; end: number; C: React.FC<{ t: number }>; enter?: "rise" | "slide" }> = [
  { id: "hook", start: 0.05, end: 3.45, C: Hook },
  { id: "three-tips", start: 6.8, end: 8.15, C: ThreeTips },
  { id: "chapter-1", start: 8.3, end: 9.95, C: Chapter1, enter: "slide" },
  { id: "bubbles", start: 10.05, end: 18.5, C: Bubbles },
  { id: "chapter-2", start: 21.3, end: 23.9, C: Chapter2, enter: "slide" },
  { id: "specific", start: 23.65, end: 27.4, C: SpecificSlide, enter: "slide" },
  { id: "better-prompt", start: 29.35, end: 30.9, C: BetterPrompt },
  { id: "buttons", start: 31.0, end: 44.9, C: Buttons },
  { id: "chapter-3", start: 44.95, end: 48.25, C: Chapter3, enter: "slide" },
  { id: "mcdonalds", start: 48.3, end: 53.75, C: McDonalds },
  { id: "goals", start: 58.8, end: 61.15, C: Goals },
  { id: "shortest", start: 61.3, end: 62.3, C: Shortest },
  { id: "flow", start: 62.8, end: 71.0, C: Flow },
  { id: "compare", start: 74.0, end: 83.8, C: Compare },
  { id: "close", start: 83.85, end: 86, C: Close },
];

export const Scenes: React.FC = () => (
  <>
    {SCENES.map(({ id, start, end, C, enter }) => (
      <Scene key={id} start={start} end={end} enter={enter}>
        {(t) => <C t={t} />}
      </Scene>
    ))}
  </>
);
