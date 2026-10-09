import React, { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import captionsJson from "./captions.json";
import { captionY, cardProgress } from "./Camera";
import { Glass } from "./glass";
import { ease } from "./ui";
import { A, C, claudeSerif, H, lerp, poppins, S, serif, SERIF_AXES, sf } from "./theme";

/** Windows where a headline or slide on screen already reads the words the VO says. */
const HIDE: Array<[number, number]> = [
  [0, 5.45], // headline + "los editó Claude Opus 5.5" pill already read it
  [18.75, 23.2], // "Dentro hay 3 formas de editar" slide
];

/** The caption changes costume with the reel: each style beat uses that style's own caption. */
type Look = "ali" | "claude" | "shorts" | "glass";
const LOOKS: Array<[number, number, Look]> = [
  [23.22, 26.33, "claude"],
  [26.33, 33.45, "shorts"],
  [33.45, 38.7, "glass"],
];
const lookAt = (t: number): Look => LOOKS.find(([a, b]) => t >= a && t < b)?.[2] ?? "ali";

const KEYWORDS = new Set(["Claude", "Opus", "5.5", "preguntaron", "video", "suficiente", "repositorio", "estilos", "3", "tipos", "gráfico", "Ali", "Abdaal", "Liquid", "Glass", "Apple", "gratuito", "estrellita"]);
const stripTrailing = (w: string) => w.trim().replace(/[,.]+$/, ""); // keep ¿ ? ¡ ! and accents

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
  // A page that started inside a hidden window stays hidden until the next page.
  if (HIDE.some(([a, b]) => (t >= a && t <= b) || (page.startMs / 1000 >= a && page.startMs / 1000 <= b))) return null;

  const look = lookAt(page.startMs / 1000 + 0.01);
  const enter = ease(t, page.startMs / 1000, 0.22);
  const words = page.tokens.map((tok) => ({ word: stripTrailing(tok.text), p: ms >= tok.fromMs ? ease(t, tok.fromMs / 1000, 0.18) : 0 }));
  const isKey = (w: string) => KEYWORDS.has(w.replace(/[¿?¡!]/g, ""));
  const wrap = (child: React.ReactNode, y = captionY(t)) => (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", transform: `translateY(-50%) translateY(${(1 - enter) * 10}px)`, opacity: enter }}>
      {child}
    </div>
  );

  if (look === "shorts") {
    // Ali Shorts: light chip, dark Poppins 700, upcoming words gray.
    return wrap(
      <div style={{ background: S.chip, borderRadius: 14, padding: "8px 22px 10px", display: "flex", columnGap: 12, whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(0,0,0,.12)" }}>
        {words.map(({ word, p }, i) => (
          <span key={i} style={{ fontFamily: poppins, fontWeight: 700, fontSize: 46, color: p > 0 ? S.ink : S.upcoming }}>
            {word}
          </span>
        ))}
      </div>,
    );
  }

  if (look === "glass") {
    // Liquid Glass: the caption is a glass capsule refracting the shot behind it.
    const text = words.map((w) => w.word).join(" ");
    const w = Math.min(960, Math.round(text.length * 29 + 120));
    return wrap(
      <div style={{ position: "relative", width: w, height: 116 }}>
        <Glass x={0} y={0} w={w} h={116} r={58} tint="dark" refract={34} bezel={26} frost={3}>
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", columnGap: 14, fontFamily: sf, fontWeight: 700, fontSize: 54, letterSpacing: -0.5, whiteSpace: "nowrap" }}>
            {words.map(({ word, p }, i) => (
              <span key={i} style={{ opacity: lerp(0.55, 1, p) }}>
                {word}
              </span>
            ))}
          </div>
        </Glass>
      </div>,
    );
  }

  if (look === "claude") {
    // Claude Carousel: ink Source Serif straight on the grid paper, keyword in clay.
    return wrap(
      <div style={{ display: "flex", columnGap: 14, whiteSpace: "nowrap" }}>
        {words.map(({ word, p }, i) => (
          <span key={i} style={{ fontFamily: claudeSerif, fontWeight: 500, fontSize: 54, color: isKey(word) && p > 0 ? H.clay : C.ink, opacity: lerp(0.3, 1, p), filter: p < 0.999 ? `blur(${(1 - p) * 4}px)` : undefined }}>
            {word}
          </span>
        ))}
      </div>,
    );
  }

  // Ali YouTube: Fraunces, no chip. White with a soft shadow over the camera, ink on the canvas.
  const k = cardProgress(t);
  const base = [lerp(255, 28, k), lerp(255, 26, k), lerp(255, 25, k)].map(Math.round);
  const key = k > 0.5 ? A.orange : A.salmonText;
  return wrap(
    <div style={{ maxWidth: 900, display: "flex", flexWrap: "nowrap", alignItems: "baseline", columnGap: 14 }}>
      {words.map(({ word, p }, i) => (
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
            color: isKey(word) && p > 0 ? key : `rgb(${base.join(",")})`,
            opacity: lerp(k > 0.5 ? 0.35 : 0.55, 1, p),
            filter: p < 0.999 ? `blur(${(1 - p) * 4}px)` : undefined,
            textShadow: k < 0.5 ? `0 2px 14px rgba(0,0,0,${0.45 * (1 - k)}), 0 0 2px rgba(0,0,0,${0.4 * (1 - k)})` : "none",
          }}
        >
          {word}
        </span>
      ))}
    </div>,
  );
};
