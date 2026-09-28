import React from "react";
import { Scene } from "./ui";
import {
  Checklist,
  EventFlyer,
  PlanKPIs,
  ReviewCard,
  RunWorkflow,
  TokenTradeoff,
  VorssaintPanel,
  WhatIsWorkflow,
} from "./pieces";

/** Scene windows on the edited timeline; `mode` must agree with MODES in Camera.tsx
 *  (0 = full-screen, 1 = card, 2 = camera off). */
export const SCENES: Array<{ id: string; start: number; end: number; mode: 0 | 1 | 2; C: React.FC<{ t: number }> }> = [
  { id: "event-flyer", start: 1.3, end: 11.6, mode: 1, C: EventFlyer },
  { id: "token-tradeoff", start: 11.85, end: 15.1, mode: 0, C: TokenTradeoff },
  { id: "what-is-workflow", start: 15.3, end: 25.0, mode: 2, C: WhatIsWorkflow },
  { id: "checklist-1", start: 25.3, end: 36.8, mode: 1, C: Checklist },
  { id: "vorssaint", start: 41.3, end: 49.45, mode: 1, C: VorssaintPanel },
  { id: "checklist-3", start: 49.55, end: 59.4, mode: 1, C: Checklist },
  { id: "plan-kpis", start: 62.4, end: 67.3, mode: 1, C: PlanKPIs },
  { id: "run-workflow", start: 67.45, end: 72.9, mode: 2, C: RunWorkflow },
  { id: "review-card", start: 73.05, end: 75.4, mode: 0, C: ReviewCard },
];

export const Scenes: React.FC = () => (
  <>
    {SCENES.map(({ id, start, end, C }) => (
      <Scene key={id} start={start} end={end}>
        {(t) => <C t={t} />}
      </Scene>
    ))}
  </>
);
