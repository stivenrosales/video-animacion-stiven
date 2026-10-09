import React from "react";
import { Scene } from "./ui";
import {
  BuildLearn, ChapterGentle, ClaudeCode, Close, Creator, EasyPills, Follow, ForWho, Free, HarnessSlide, Hook, Install,
  Memory, PracticesSlide, Repo, Tiles,
} from "./pieces";

/** Scene windows on the edited timeline; they must agree with MODES in Camera.tsx. */
export const SCENES: Array<{ id: string; start: number; end: number; C: React.FC<{ t: number }>; enter?: "rise" | "slide" }> = [
  { id: "hook", start: 0.05, end: 3.6, C: Hook },
  { id: "claude-code", start: 5.85, end: 8.1, C: ClaudeCode },
  { id: "practices", start: 11.3, end: 14.35, C: PracticesSlide, enter: "slide" },
  { id: "harness", start: 14.3, end: 17.3, C: HarnessSlide, enter: "slide" },
  { id: "easy", start: 17.5, end: 20.2, C: EasyPills },
  { id: "build-learn", start: 20.3, end: 22.55, C: BuildLearn },
  { id: "chapter", start: 22.7, end: 26.5, C: ChapterGentle, enter: "slide" },
  { id: "creator", start: 27.1, end: 31.3, C: Creator },
  { id: "tiles", start: 34.3, end: 42.6, C: Tiles },
  { id: "memory", start: 42.75, end: 51.6, C: Memory },
  { id: "repo", start: 51.75, end: 57.2, C: Repo },
  { id: "free", start: 57.55, end: 60.5, C: Free },
  { id: "follow", start: 61.9, end: 65.1, C: Follow },
  { id: "for-who", start: 69.1, end: 72.2, C: ForWho },
  { id: "install", start: 72.3, end: 73.9, C: Install },
  { id: "close", start: 74.1, end: 78, C: Close },
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
