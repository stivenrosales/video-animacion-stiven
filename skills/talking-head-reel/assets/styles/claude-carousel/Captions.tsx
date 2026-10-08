import React, { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import captionsJson from "./captions.json";
import { cardProgress, lowerAmount, offProgress } from "./Camera";
import { ease } from "./ui";
import { LAYOUT, lerp, serif } from "./theme";

/** Windows where a headline on screen already reads the words the VO says. */
const HIDE: Array<[number, number]> = [
  [0, 2.38], // "¿Quieres aprender inteligencia artificial?"
  [48.9, 50.75], // "¿Para qué pagar un curso?"
  [56.0, 58], // "¿Tú qué opinas?" (lowered close; the chip would land on the mouth)
];

const stripTrailing = (w: string) => w.trim().replace(/[,.]+$/, ""); // keep ¿ ? ¡ ! and accents

/**
 * Claude reel captions: soft serif. Over the camera they sit on a translucent smoke chip
 * (rgba 38,36,33,.46, radius 8); in card mode they are plain ink serif in the caption lane.
 */
export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions: captionsJson as Caption[], combineTokensWithinMilliseconds: 450 }),
    [],
  );
  const ms = t * 1000;
  const page = pages.find((p, i) => ms >= p.startMs && ms < (pages[i + 1]?.startMs ?? p.startMs + p.durationMs + 400));
  if (!page) return null;
  const lastToken = page.tokens[page.tokens.length - 1];
  if (ms > lastToken.toMs + 700) return null;
  if (HIDE.some(([a, b]) => t >= a && t <= b)) return null;
  if (lowerAmount(t) > 0.05) return null;

  const cp = cardProgress(t);
  const k = Math.max(cp, offProgress(t)); // 0 = over camera (chip), 1 = on paper (ink)
  const y = lerp(LAYOUT.fullCaptionY, LAYOUT.laneCenter, cp);
  const enter = ease(t, page.startMs / 1000, 0.22);
  const ink = Math.round(lerp(251, 20, k));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%) translateY(${(1 - enter) * 10}px)`,
        opacity: enter,
        filter: enter < 0.999 ? `blur(${(1 - enter) * 6}px)` : undefined,
      }}
    >
      <div
        style={{
          maxWidth: 820, // centered at x=540, clear of the action rail (x>940)
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "baseline",
          columnGap: 13,
          padding: "4px 22px 10px",
          borderRadius: 8,
          background: `rgba(38,36,33,${0.46 * (1 - k)})`,
          backdropFilter: k < 0.99 ? `blur(${6 * (1 - k)}px)` : undefined,
        }}
      >
        {page.tokens.map((tok, i) => {
          const wordEnter = ease(t, tok.fromMs / 1000, 0.09);
          const faded = lerp(0.5, 0.33, k);
          return (
            <span
              key={i}
              style={{
                whiteSpace: "nowrap",
                fontFamily: serif,
                fontWeight: 400,
                fontSize: lerp(50, 54, k),
                letterSpacing: -0.5,
                lineHeight: 1.2,
                color: `rgb(${ink}, ${Math.round(lerp(250, 20, k))}, ${Math.round(lerp(246, 19, k))})`,
                opacity: ms >= tok.fromMs ? lerp(faded, 1, wordEnter) : faded,
              }}
            >
              {stripTrailing(tok.text)}
            </span>
          );
        })}
      </div>
    </div>
  );
};
