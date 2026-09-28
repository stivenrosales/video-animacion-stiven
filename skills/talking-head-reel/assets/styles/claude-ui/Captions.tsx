import React, { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";
import captionsJson from "./captions.json";
import { cardProgress, offProgress } from "./Camera";
import { ease } from "./ui";
import { C, LAYOUT, lerp, sans } from "./theme";

/** "clean" is the committed look for this video; "pill" keeps the earlier boxed style
 *  around so the two can be A/B'd as stills (see out/captions-ab.png). */
export const CAPTION_STYLE: "clean" | "pill" = "clean";

/** Windows where on-screen text already reads the same words the VO says. */
const HIDE: Array<[number, number]> = [[15.95, 16.95]]; // the VO title "¿Qué es un workflow?"

const KEYWORDS = new Set<string>([]);

/** Words the speaker did not say but the edit adds, typed into the caption right after a spoken word. */
const INSERTS: Record<number, { text: string; at: number }> = {};

const stripTrailing = (w: string) => w.trim().replace(/[,.]+$/, ""); // keep ¿ ? ¡ ! and accents
const clean = (w: string) => w.trim().toLowerCase().replace(/[¿?¡!,.]/g, "");

/** Card/OFF share the same ink color; only full-screen needs the white-on-video treatment. */
const useCaptionPosition = (t: number) => {
  const cp = cardProgress(t);
  const off = offProgress(t);
  // Full and OFF both sit at chest height; only the docked card pulls captions up into the lane.
  const laneY = lerp(LAYOUT.fullCaptionY, LAYOUT.laneCenter, cp);
  const y = lerp(laneY, LAYOUT.fullCaptionY, off);
  const k = Math.max(cp, off); // 0 = full-screen (white), 1 = card or OFF (ink)
  return { y, k };
};

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions: captionsJson as Caption[],
        combineTokensWithinMilliseconds: 450, // short pages keep captions on one line
      }),
    [],
  );
  const ms = t * 1000;
  const page = pages.find(
    (p, i) => ms >= p.startMs && ms < (pages[i + 1]?.startMs ?? p.startMs + p.durationMs + 400),
  );
  if (!page) return null;
  // Hide captions during trailing silence.
  const lastToken = page.tokens[page.tokens.length - 1];
  if (ms > lastToken.toMs + 700) return null;
  if (HIDE.some(([a, b]) => t >= a && t <= b)) return null;

  // Cast away the literal type: TS narrows a same-file const to its initializer regardless
  // of the declared union type, which would otherwise flag this branch as unreachable.
  return (CAPTION_STYLE as string) === "pill" ? <PillCaptions t={t} page={page} ms={ms} /> : <CleanCaptions t={t} page={page} ms={ms} />;
};

/* ---------- "clean" (committed): text only, karaoke by opacity, no box ---------- */
const CleanCaptions: React.FC<{ t: number; page: TikTokPage; ms: number }> = ({ t, page, ms }) => {
  const { y, k } = useCaptionPosition(t);
  const enter = ease(t, page.startMs / 1000, 0.22); // page entrance: no spring
  const white = { r: 255, g: 255, b: 255 };
  const ink = { r: 20, g: 20, b: 19 };
  const r = lerp(white.r, ink.r, k);
  const g = lerp(white.g, ink.g, k);
  const b = lerp(white.b, ink.b, k);
  const shadowAlpha = lerp(0.35, 0, k);
  const fadedOpacity = lerp(0.45, 0.35, k);

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
      {/* Soft shadow pool behind full-screen captions only — his white shirt eats plain white text. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 720,
          height: 150,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.32)",
          filter: "blur(28px)",
          opacity: 1 - k,
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: 800, // centered at x=540 and clear of the IG/TikTok action rail (x>940)
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: 16,
        }}
      >
        {page.tokens.map((tok, i) => {
          const spoken = ms >= tok.fromMs;
          const wordEnter = ease(t, tok.fromMs / 1000, 0.09); // 90ms ramp to full opacity, no scale/translate
          const opacity = spoken ? lerp(fadedOpacity, 1, wordEnter) : fadedOpacity;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 60,
                letterSpacing: -0.6,
                lineHeight: 1.1,
                color: `rgb(${r}, ${g}, ${b})`,
                textShadow: shadowAlpha > 0.002 ? `0 2px 3px rgba(0,0,0,${shadowAlpha}), 0 4px 18px rgba(0,0,0,${shadowAlpha})` : "none",
                opacity,
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

/* ---------- "pill" (legacy): boxed card, kept only for the A/B still ---------- */
const PillCaptions: React.FC<{ t: number; page: TikTokPage; ms: number }> = ({ t, page, ms }) => {
  const { y } = useCaptionPosition(t);
  const enter = ease(t, page.startMs / 1000, 0.3);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%) translateY(${(1 - enter) * 26}px) scale(${lerp(0.85, 1, enter)})`,
        opacity: Math.min(1, enter * 1.6),
      }}
    >
      <div
        style={{
          maxWidth: 800,
          padding: "20px 34px 24px",
          borderRadius: 32,
          background: "rgba(255,255,255,0.96)",
          border: `2px solid ${C.border}`,
          boxShadow: "0 10px 40px rgba(20,20,19,0.18)",
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: 22,
          lineHeight: 1.15,
        }}
      >
        {page.tokens.map((tok, i) => {
          const spoken = ms >= tok.fromMs;
          const key = KEYWORDS.has(clean(tok.text));
          void INSERTS;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                fontFamily: sans,
                fontWeight: key ? 500 : 600,
                fontSize: key ? 74 : 64,
                letterSpacing: key ? -0.5 : -1,
                color: key ? C.accent : C.ink,
                opacity: spoken ? 1 : 0.28,
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
