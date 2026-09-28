import React from "react";
import { cardProgress } from "./Camera";
import { C, LAYOUT, lerp, sans } from "./theme";
import { ease, easeIn, useSec } from "./ui";

/** Tiny tongue-in-cheek notes pinned to the camera frame while background sounds play
 *  (sheep bleats located on the spectrogram of the edited audio). */
export const STICKERS: Array<{ start: number; end: number; text: string }> = [
  { start: 49.7, end: 52.9, text: "sí, son ovejas" },
  { start: 62.4, end: 64.9, text: "otra vez las ovejas" },
];

export const Stickers: React.FC = () => {
  const t = useSec();
  const p = cardProgress(t);
  // Full-screen: lower-left over the jacket, clear of face and captions.
  // Card: top-left corner of the camera card, over the sky.
  const x = lerp(90, 90 + 28, p);
  const y = lerp(1240, LAYOUT.cardTop + 28, p);
  return (
    <>
      {STICKERS.map(({ start, end, text }) => {
        if (t < start || t > end + 0.4) return null;
        const inP = ease(t, start, 0.45);
        const outP = easeIn(t, end, 0.3);
        return (
          <div
            key={start}
            style={{
              position: "absolute",
              left: x,
              top: y,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px 8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.94)",
              boxShadow: "0 2px 4px rgba(20,20,19,0.08), 0 10px 26px rgba(20,20,19,0.14)",
              fontFamily: sans,
              fontWeight: 500,
              fontSize: 28,
              color: C.ink,
              whiteSpace: "nowrap",
              transformOrigin: "left center",
              opacity: Math.min(1, inP * 1.8) * (1 - outP),
              transform: `scale(${lerp(0.82, 1, inP) - outP * 0.1})`,
              filter: inP < 0.999 || outP > 0 ? `blur(${(1 - inP) * 6 + outP * 6}px)` : undefined,
            }}
          >
            <span style={{ fontSize: 32, lineHeight: 1 }}>🐑</span>
            {text}
          </div>
        );
      })}
    </>
  );
};
