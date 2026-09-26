import React from "react";
import { Scene } from "./ui";
import {
  AskPiece,
  CaptionsFixPiece,
  CtaPiece,
  DmsPiece,
  DotCsvPiece,
  HookChip,
  TerminalPiece,
  TimerPiece,
  ToolsPiece,
} from "./pieces";

/** Scene windows on the edited timeline; they line up with MODES in Camera.tsx. */
export const SCENES: Array<{ start: number; end: number; C: React.FC<{ t: number }> }> = [
  { start: 2.65, end: 4.95, C: HookChip },
  { start: 5.25, end: 10.55, C: DmsPiece },
  { start: 10.8, end: 19.1, C: DotCsvPiece },
  { start: 19.4, end: 23.85, C: TerminalPiece },
  { start: 24.2, end: 39.8, C: ToolsPiece },
  { start: 40.95, end: 45.45, C: AskPiece },
  { start: 45.85, end: 49.4, C: CaptionsFixPiece },
  { start: 49.75, end: 53.15, C: TimerPiece },
  { start: 53.35, end: 57.5, C: CtaPiece },
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
