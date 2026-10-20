import React, { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import captionsJson from "./captions.json";
import { A, LAYOUT, SERIF_AXES, ease, lerp, serif } from "./theme";
import { NO_CAPTIONS, splitProgress } from "./timeline";

const KEYWORDS = new Set(["Claude", "ChatGPT", "criterio", "midudev", "GitHub", "equipos", "API", "LLM", "aplicaciones", "rápido", "algoritmos", "dibujitos", "lógica", "Python", "Course", "divertido", "juegos", "estructura", "programar"]);
const stripTrailing = (w: string) => w.trim().replace(/[,.]+$/, "");

/**
 * Ali YouTube captions: Fraunces, no chip. White with a soft shadow over the camera, ink on the cream in the split.
 * Each word arrives blurred and gray, then sharp.
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
  const inside = (s: number) => NO_CAPTIONS.some(([a, b]) => s >= a && s < b);
  if (inside(t) || inside(page.startMs / 1000)) return null;

  const k = splitProgress(t);
  // Mid-glide between 1400 and 722 the caption would cross his face, so it fades out there.
  const glide = Math.min(1, Math.max(0, (Math.abs(k - 0.5) - 0.12) / 0.3));
  const enter = ease(t, page.startMs / 1000, 0.22) * glide;
  const base = [lerp(255, 28, k), lerp(255, 26, k), lerp(255, 25, k)].map(Math.round);
  const key = k > 0.5 ? A.orange : A.salmonText;

  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: lerp(LAYOUT.fullCaptionY, LAYOUT.splitCaptionY, k),
        display: "flex", justifyContent: "center", transform: `translateY(-50%) translateY(${(1 - enter) * 10}px)`, opacity: enter,
      }}
    >
      <div style={{ maxWidth: 860, display: "flex", flexWrap: "nowrap", alignItems: "baseline", columnGap: 13 }}>
        {page.tokens.map((tok, i) => {
          const word = stripTrailing(tok.text);
          const p = ms >= tok.fromMs ? ease(t, tok.fromMs / 1000, 0.18) : 0;
          const isKey = KEYWORDS.has(word.replace(/[¿?¡!]/g, ""));
          return (
            <span
              key={i}
              style={{
                whiteSpace: "nowrap", fontFamily: serif, fontVariationSettings: SERIF_AXES, fontWeight: 600, fontSize: 52,
                letterSpacing: -0.6, lineHeight: 1.2,
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
