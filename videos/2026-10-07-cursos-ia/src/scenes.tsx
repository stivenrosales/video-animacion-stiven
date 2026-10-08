import React from "react";
import { Scene } from "./ui";
import { AskLoop, ChalkIcons, Close, Feed, Hook, NotCourses, Subscriptions, TryIt, WhyPay, YouTube } from "./pieces";

/** Scene windows on the edited timeline; `mode` must agree with MODES in Camera.tsx
 *  (0 = full-screen, 1 = card). */
export const SCENES: Array<{ id: string; start: number; end: number; mode: 0 | 1; C: React.FC<{ t: number }> }> = [
  { id: "hook", start: 0.4, end: 2.2, mode: 0, C: Hook },
  { id: "not-courses", start: 2.35, end: 7.35, mode: 1, C: NotCourses },
  { id: "chalk-icons", start: 7.55, end: 12.7, mode: 0, C: ChalkIcons },
  { id: "feed", start: 12.95, end: 22.7, mode: 1, C: Feed },
  { id: "subscriptions", start: 25.6, end: 33.4, mode: 1, C: Subscriptions },
  { id: "ask-loop", start: 33.55, end: 40.7, mode: 1, C: AskLoop },
  { id: "youtube", start: 40.85, end: 48.2, mode: 1, C: YouTube },
  { id: "why-pay", start: 48.45, end: 50.75, mode: 0, C: WhyPay },
  { id: "try-it", start: 53.7, end: 55.95, mode: 0, C: TryIt },
  { id: "close", start: 55.95, end: 58, mode: 0, C: Close },
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
