import React, { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import captionsJson from "./captions.json";
import { C, lerp, sans } from "./theme";
import { ease } from "./ali";

/** Center of the caption chip: low on the chest so it never touches the chin, bottom edge at the safe line (1500). */
const CAPTION_Y = 1462;

/** Ali's caption: a light chip with dark bold text; words not spoken yet stay gray. */
export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions: captionsJson as Caption[], combineTokensWithinMilliseconds: 420 }),
    [],
  );
  const ms = t * 1000;
  const page = pages.find((p, i) => ms >= p.startMs && ms < (pages[i + 1]?.startMs ?? p.startMs + p.durationMs + 400));
  if (!page) return null;
  const last = page.tokens[page.tokens.length - 1];
  if (ms > last.toMs + 600) return null;

  const enter = ease(t, page.startMs / 1000, 0.16);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: CAPTION_Y,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%) scale(${lerp(0.9, 1, enter)})`,
        opacity: Math.min(1, enter * 2),
      }}
    >
      <div
        style={{
          maxWidth: 800,
          padding: "10px 24px 12px",
          borderRadius: 16,
          background: C.chip,
          boxShadow: "0 6px 18px rgba(0,0,0,.18)",
          display: "flex",
          gap: 14,
          whiteSpace: "nowrap",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 44,
          letterSpacing: -0.4,
          lineHeight: 1.15,
        }}
      >
        {page.tokens.map((tok, i) => (
          <span key={i} style={{ color: ms >= tok.fromMs ? C.chipText : C.chipGray }}>
            {tok.text.trim()}
          </span>
        ))}
      </div>
    </div>
  );
};
