import React from "react";
import { Scene } from "./ui";
import { EndCard, Event, Hook, Levels, Share } from "./pieces";

/** Scene windows on the edited timeline; they must agree with MODES in Camera.tsx. */
export const SCENES: Array<{ id: string; start: number; end: number; C: React.FC<{ t: number }>; enter?: "rise" | "slide" | "none" }> = [
  { id: "hook", start: 0.05, end: 2.35, C: Hook },
  { id: "event", start: 2.5, end: 7.75, C: Event },
  { id: "levels", start: 7.9, end: 16.85, C: Levels },
  { id: "share", start: 17.0, end: 20.95, C: Share },
  { id: "end", start: 21.35, end: 26, C: EndCard },
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
