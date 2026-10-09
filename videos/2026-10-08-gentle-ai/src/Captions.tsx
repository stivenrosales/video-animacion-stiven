import React, { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import captionsJson from "./captions.json";
import { captionY, cardProgress } from "./Camera";
import { ease } from "./ui";
import { A, lerp, serif, SERIF_AXES } from "./theme";

/** Windows where a headline or slide on screen already reads the words the VO says. */
const HIDE: Array<[number, number]> = [
  [0, 3.6], // "No soy programador, soy ingeniero químico"
  [11.25, 17.3], // "mejores prácticas" + "plugins → arneses" text slides
  [20.3, 22.6], // "más construyes, más aprendes" headline
  [59.3, 60.55], // "¿Por qué es gratis?" pill
  [75.1, 78], // "¿Ya lo conocías?"
]

const KEYWORDS = new Set(["ingeniero", "químico", "Claude", "Code", "posible", "fácil", "didáctico", "Gentleman", "Programming", "arnés", "SDD", "Engram", "gratis", "enseña", "ahorra", "caché", "repositorio", "genial", "sorprende", "gracias", "seguir", "instala", "conocías"]);
const stripTrailing = (w: string) => w.trim().replace(/[,.]+$/, ""); // keep ¿ ? ¡ ! and accents

/**
 * Ali YouTube captions: Fraunces, no chip. White with a soft shadow over the camera, ink on the canvas.
 * Each word arrives the way his text slides do: blurred and gray, then sharp.
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

  const k = cardProgress(t); // 0 = over camera (white), 1 = on canvas (ink)
  const enter = ease(t, page.startMs / 1000, 0.22);
  const base = [lerp(255, 28, k), lerp(255, 26, k), lerp(255, 25, k)].map(Math.round);
  const key = k > 0.5 ? A.orange : A.salmonText;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: captionY(t),
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%) translateY(${(1 - enter) * 10}px)`,
        opacity: enter,
      }}
    >
      <div style={{ maxWidth: 840, display: "flex", flexWrap: "nowrap", alignItems: "baseline", columnGap: 14 }}>
        {page.tokens.map((tok, i) => {
          const word = stripTrailing(tok.text);
          const p = ms >= tok.fromMs ? ease(t, tok.fromMs / 1000, 0.18) : 0;
          const isKey = KEYWORDS.has(word.replace(/[¿?¡!]/g, ""));
          return (
            <span
              key={i}
              style={{
                whiteSpace: "nowrap",
                fontFamily: serif,
                fontVariationSettings: SERIF_AXES,
                fontWeight: 600,
                fontSize: 56,
                letterSpacing: -0.6,
                lineHeight: 1.2,
                color: isKey && p > 0 ? key : `rgb(${base.join(",")})`,
                opacity: lerp(k > 0.5 ? 0.35 : 0.55, 1, p),
                filter: p < 0.999 ? `blur(${(1 - p) * 4}px)` : undefined,
                textShadow: k < 0.5 ? `0 2px 14px rgba(0,0,0,${0.45 * (1 - k)}), 0 0 2px rgba(0,0,0,${0.4 * (1 - k)})` : "none",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
