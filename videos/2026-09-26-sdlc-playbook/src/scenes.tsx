import React from "react";
import { Scene } from "./ui";
import {
  BeforeAfterPiece,
  CoveragePiece,
  EndPiece,
  HookPiece,
  IntentPiece,
  InterviewPiece,
  ArmaPiece,
  LoopPiece,
  PipelinePiece,
  SkillPiece,
} from "./pieces";

/** Scene windows on the edited timeline; `full` must agree with MODES in Camera.tsx. */
export const SCENES: Array<{ id: string; start: number; end: number; full: boolean; C: React.FC<{ t: number }> }> = [
  { id: "hook", start: 1.2, end: 5.15, full: true, C: HookPiece },
  { id: "loop", start: 5.5, end: 8.05, full: false, C: LoopPiece },
  { id: "intent", start: 8.3, end: 18.85, full: false, C: IntentPiece },
  { id: "skill", start: 19.2, end: 24.85, full: true, C: SkillPiece },
  { id: "interview", start: 25.2, end: 33.55, full: true, C: InterviewPiece },
  { id: "arma", start: 34.0, end: 35.85, full: true, C: ArmaPiece },
  { id: "pipeline", start: 36.2, end: 42.05, full: false, C: PipelinePiece },
  { id: "before-after", start: 42.35, end: 45.45, full: true, C: BeforeAfterPiece },
  { id: "coverage", start: 45.75, end: 55.35, full: false, C: CoveragePiece },
  { id: "end", start: 55.6, end: 63.5, full: false, C: EndPiece },
];

export const Scenes: React.FC = () => (
  <>
    {SCENES.map(({ start, end, C }) => (
      <Scene key={start} start={start} end={end}>
        {(t) => <C t={t} />}
      </Scene>
    ))}
  </>
);

