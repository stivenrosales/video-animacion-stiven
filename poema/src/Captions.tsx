import React, { useMemo } from "react";
import words from "./words.json";
import { lerp, pop } from "./kz";
import { PAPER_SCENES } from "./scenes2";
import { S, kalam } from "./sketch";

type Word = { text: string; startMs: number; endMs: number };

const KEY = new Set(["milena", "mundo", "mañana", "tren", "viena", "amarnos", "miedo", "tiempo", "irrelevante", "ayudarnos", "irrazonablemente", "restricciones"]);
const clean = (w: string) => w.toLowerCase().replace(/[¿?¡!,.«»"]/g, "");

/** Split the poem into verse-like lines: break on punctuation, max 6 words. */
const toLines = (ws: Word[]) => {
  const lines: Word[][] = [];
  let cur: Word[] = [];
  for (const w of ws) {
    if (cur.length && (/^[¿«]/.test(w.text) || cur.length >= 6)) {
      lines.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[,.?»]$/.test(w.text)) {
      lines.push(cur);
      cur = [];
    }
  }
  if (cur.length) lines.push(cur);
  return lines;
};

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const lines = useMemo(() => toLines(words as Word[]), []);
  const ms = t * 1000;
  const idx = lines.findIndex((l, i) => ms >= l[0].startMs - 120 && ms < (lines[i + 1]?.[0].startMs ?? l[l.length - 1].endMs + 600) - 120);
  if (idx < 0 || t > 41.7) return null;
  const line = lines[idx];
  const onPaper = PAPER_SCENES.some(([a, b]) => t >= a - 0.1 && t < b + 0.1);
  const lineOut = Math.max(0, Math.min(1, (ms - (line[line.length - 1].endMs + 250)) / 250));
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: 1440,
        transform: "translateY(-50%)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 18,
        rowGap: 4,
        opacity: 1 - lineOut,
      }}
    >
      {line.map((w, i) => {
        const p = pop(t, w.startMs / 1000 - 0.06, { damping: 14, stiffness: 220, mass: 0.5 });
        const key = KEY.has(clean(w.text));
        return (
          <span
            key={i}
            style={{
              fontFamily: kalam,
              fontWeight: 700,
              fontSize: key ? 74 : 64,
              lineHeight: 1.15,
              color: key ? (onPaper ? S.terracotta : S.gold) : onPaper ? S.ink : S.paper,
              WebkitTextStroke: onPaper ? undefined : `2px ${S.ink}`,
              paintOrder: "stroke fill",
              opacity: lerp(0.18, 1, Math.min(1, p * 1.3)),
              transform: `translateY(${(1 - p) * 22}px) scale(${lerp(0.9, 1, p)})`,
              display: "inline-block",
              textShadow: onPaper ? "none" : "0 4px 16px rgba(13,11,36,0.8)",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
