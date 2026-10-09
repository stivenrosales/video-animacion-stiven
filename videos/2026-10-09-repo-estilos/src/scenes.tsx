import React from "react";
import { Scene } from "./ui";
import { AliShorts, Asked, Citation, ClaudeStyle, Hook, LiquidGlass, Repo, RepoFree, StarCta, ThreeSlide } from "./pieces";

/** Scene windows on the edited timeline; they must agree with MODES in Camera.tsx. */
export const SCENES: Array<{ id: string; start: number; end: number; C: React.FC<{ t: number }>; enter?: "rise" | "slide" | "none" }> = [
  { id: "hook", start: 0.05, end: 5.35, C: Hook },
  { id: "asked", start: 5.7, end: 6.85, C: Asked },
  { id: "citation", start: 6.95, end: 9.4, C: Citation },
  { id: "repo", start: 11.15, end: 18.65, C: Repo },
  { id: "three", start: 18.75, end: 23.15, C: ThreeSlide, enter: "slide" },
  { id: "claude", start: 23.3, end: 26.25, C: ClaudeStyle },
  { id: "ali", start: 26.45, end: 33.35, C: AliShorts },
  { id: "glass", start: 33.45, end: 38.62, C: LiquidGlass, enter: "none" },
  { id: "free", start: 38.8, end: 42.2, C: RepoFree },
  { id: "star", start: 42.3, end: 45, C: StarCta },
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
