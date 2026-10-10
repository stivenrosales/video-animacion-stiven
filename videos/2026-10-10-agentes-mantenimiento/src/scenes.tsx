import React from "react";
import { Scene } from "./ui";
import {
  Agendas,
  ChapterMaintenance,
  Chat,
  Checklist,
  Compare,
  Cta,
  Evolve,
  Flow,
  Growth,
  Hook,
  Limits,
  Ongoing,
  OwnTools,
  RepeatSlide,
  RespondCard,
  SetOnce,
  Steps,
  Storage,
} from "./pieces";

/** Scene windows on the edited timeline; they must agree with MODES in Camera.tsx. */
export const SCENES: Array<{ id: string; start: number; end: number; C: React.FC<{ t: number }>; enter?: "rise" | "slide" | "none" }> = [
  { id: "hook", start: 0.05, end: 4.8, C: Hook },
  { id: "respond", start: 4.95, end: 9.35, C: RespondCard },
  { id: "limits", start: 10.9, end: 15.15, C: Limits },
  { id: "chat", start: 15.3, end: 23.3, C: Chat },
  { id: "flow", start: 23.5, end: 31.45, C: Flow },
  { id: "repeat", start: 31.65, end: 37.6, C: RepeatSlide, enter: "slide" },
  { id: "checklist", start: 37.85, end: 48.15, C: Checklist },
  { id: "evolve", start: 48.45, end: 53.85, C: Evolve },
  { id: "compare", start: 54.1, end: 62.85, C: Compare },
  { id: "steps", start: 63.05, end: 66.95, C: Steps },
  { id: "setonce", start: 68.4, end: 73.3, C: SetOnce },
  { id: "chapter", start: 73.5, end: 78.65, C: ChapterMaintenance, enter: "slide" },
  { id: "ongoing", start: 78.9, end: 88.55, C: Ongoing },
  { id: "storage", start: 88.75, end: 101.45, C: Storage },
  { id: "agents", start: 101.7, end: 105.95, C: Agendas },
  { id: "own", start: 106.1, end: 116.35, C: OwnTools },
  { id: "growth", start: 116.6, end: 121.9, C: Growth },
  { id: "cta", start: 123.85, end: 128.2, C: Cta },
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
