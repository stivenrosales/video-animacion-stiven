import React, { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import captionsJson from "./captions.json";
import { cardProgress, lowerAmount } from "./Camera";
import { ease } from "./ui";

/** Windows where full-screen captions move up into the sky so a gesture at chest height stays clear. */
const CAPTIONS_UP: Array<[number, number]> = [[33.95, 35.9]];
const UP_Y = 470;
const upAmount = (t: number) =>
  CAPTIONS_UP.reduce((v, [a, b]) => Math.max(v, Math.min(ease(t, a, 0.4), 1 - ease(t, b, 0.4))), 0);
import { C, LAYOUT, lerp, pop, sans, serifItalic } from "./theme";

const KEYWORDS = new Set([
  "claude", "guía", "intent.md", "intent", "skill", "empleados", "requerimiento", "paso", "preguntas",
  "spec.md", "plan.md", "fascinante", "importantes", "desapercibidas", "viables", "artículo", "imagen", "título",
]);

/** Words the speaker did not say but the edit adds, typed into the caption right after a spoken word. */
const INSERTS: Record<number, { text: string; at: number }> = {};

const clean = (w: string) => w.trim().toLowerCase().replace(/[¿?¡!,.]/g, "");

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

  const enter = pop(t, page.startMs / 1000, { damping: 13, stiffness: 220, mass: 0.6 });
  const p = cardProgress(t);
  // Full-screen: over the chest. Card: inside the reserved lane between panel and camera.
  const fullY = lerp(LAYOUT.fullCaptionY + 30 * lowerAmount(t), UP_Y, upAmount(t));
  const centerY = lerp(fullY, LAYOUT.laneCenter, p);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: centerY,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%) translateY(${(1 - enter) * 26}px) scale(${lerp(0.85, 1, enter)})`,
        opacity: Math.min(1, enter * 1.6),
      }}
    >
      <div
        style={{
          maxWidth: 800, // centered at x=540 and still clear of the IG/TikTok action rail (x>940)
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
          const active = ms >= tok.fromMs && ms < tok.toMs + 60;
          const spoken = ms >= tok.fromMs;
          const key = KEYWORDS.has(clean(tok.text));
          const bump = pop(t, tok.fromMs / 1000, { damping: 10, stiffness: 300, mass: 0.4 });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                fontFamily: key ? serifItalic : sans,
                fontWeight: key ? 500 : 600,
                fontSize: key ? 74 : 64,
                letterSpacing: key ? -0.5 : -1,
                color: key ? C.accent : C.ink,
                opacity: spoken ? 1 : 0.28,
                transform: `translateY(${active ? -6 * bump : 0}px) scale(${active ? 1 + 0.025 * bump : 1})`,
              }}
            >
              {INSERTS[tok.fromMs] ? tok.text.trim().replace(/[.,]$/, "") : tok.text.trim()}
            </span>
          );
        }).flatMap((node, i) => {
          const tok = page.tokens[i];
          const ins = INSERTS[tok.fromMs];
          if (!ins) return [node];
          const chars = Math.max(0, Math.min(ins.text.length, Math.floor((t - ins.at) * 26)));
          const star = pop(t, ins.at + ins.text.length / 26, { damping: 9, stiffness: 320, mass: 0.4 });
          const trail = tok.text.trim().match(/[.,]$/)?.[0] ?? "";
          return [
            node,
            <span
              key={`ins${i}`}
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                fontFamily: serifItalic,
                fontWeight: 500,
                fontSize: 74,
                letterSpacing: -0.5,
                color: C.accent,
                marginLeft: chars > 0 ? 0 : -22, // no gap until the insertion starts
              }}
            >
              {ins.text.slice(0, chars)}
              {chars >= ins.text.length && (
                <sup style={{ display: "inline-block", fontSize: 52, marginLeft: 2, transform: `scale(${Math.min(1.15, star)})` }}>*</sup>
              )}
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 64, color: C.ink, fontStyle: "normal" }}>{chars > 0 ? trail : ""}</span>
            </span>,
          ];
        })}
      </div>
    </div>
  );
};
