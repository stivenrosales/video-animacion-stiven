import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { A, SERIF_AXES, ease, easeIn, lerp, panelShadow, pop, prog, sans, serif } from "./theme";
import { SCENES, type SceneId, splitProgress } from "./timeline";

// ---------- shared pieces ----------

/** Ali's band in the split: enters at the top edge and exits the right edge, drifting slowly. */
export const Canvas: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: A.canvas }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <path fill={A.band} transform={`translate(${-18 * Math.sin(t * 0.35)} 0)`} d="M420 -40 C 560 200, 800 420, 1140 560 L 1140 300 C 980 230, 840 110, 760 -40 Z" />
    </svg>
  </AbsoluteFill>
);

const serifStyle: React.CSSProperties = { fontFamily: serif, fontVariationSettings: SERIF_AXES, letterSpacing: "-0.015em", color: A.ink };

/** Ali's word reveal on the cream: blurred and gray, then sharp in its color. */
const W: React.FC<{ t: number; at: number; color?: string; children: React.ReactNode }> = ({ t, at, color = A.ink, children }) => {
  const p = ease(t, at, 0.5);
  return (
    <span style={{ display: "inline-block", opacity: ease(t, at, 0.25), transform: `translateY(${(1 - p) * 12}px)`, filter: p < 0.999 ? `blur(${(1 - p) * 10}px)` : undefined, color: p < 0.98 ? `color-mix(in srgb, ${color} ${Math.round(p * 100)}%, #B8B2AC)` : color }}>
      {children}
    </span>
  );
};

/** A real cover on a soft shadow, dropping in on a spring; `blur` keeps it as a teaser. */
const Cover: React.FC<{ t: number; at: number; src: string; x: number; y: number; w: number; ratio: number; blur?: number }> = ({ t, at, src, x, y, w, ratio, blur = 0 }) => {
  const p = pop(t, at, { damping: 14, stiffness: 160 });
  const h = w * ratio;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y + (1 - p) * -90, width: w, height: h, opacity: Math.min(1, p * 2.5), transform: `rotate(${(1 - Math.min(1, p)) * -4}deg)`, transformOrigin: "50% 100%", filter: blur > 0 ? `blur(${blur}px) saturate(.85)` : undefined }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, boxShadow: "0 22px 46px rgba(60,40,20,.18), 0 0 0 1px rgba(60,40,20,.06)" }} />
    </div>
  );
};

const GIT_PATH = "M13.09 23.549a1.54 1.54 0 0 1-2.18 0L.451 13.089a1.54 1.54 0 0 1 0-2.179l7.191-7.19 2.733 2.733a1.85 1.85 0 0 0 .964 2.326v6.66a1.849 1.849 0 1 0 1.54 0V8.957l2.508 2.508a1.85 1.85 0 1 0 1.09-1.09l-2.634-2.634a1.85 1.85 0 0 0-2.378-2.377L8.73 2.63 10.91.451a1.54 1.54 0 0 1 2.179 0l10.459 10.46a1.54 1.54 0 0 1 0 2.179z";

/** Straight white card holding a real page from the book, with Ali's FUENTE line inside its footer. */
const FigureCard: React.FC<{ t: number; at: number; src: string; w: number; h: number; source: string; wipe?: boolean }> = ({ t, at, src, w, h, source, wipe }) => {
  const p = pop(t, at, { damping: 18, stiffness: 150 });
  const reveal = wipe ? ease(t, at + 0.15, 1.4) : 1;
  const cardH = h + 76;
  return (
    <div style={{ position: "absolute", left: 540 - (w + 48) / 2, top: 470 - cardH / 2 + (1 - p) * 40, width: w + 48, height: cardH, background: A.panel, borderRadius: 32, boxShadow: panelShadow, opacity: Math.min(1, p * 2) }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: 24, top: 24, width: w, height: h, objectFit: "contain", clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)` }} />
      <div style={{ position: "absolute", left: 28, bottom: 18, display: "flex", alignItems: "center", gap: 10, fontFamily: sans, fontWeight: 500, fontSize: 20, color: A.muted, letterSpacing: "0.04em" }}>
        <span style={{ fontWeight: 600 }}>FUENTE</span> · {source}
      </div>
    </div>
  );
};

/** Cover on the left, title and author on the right (one book per beat). */
const BookIntro: React.FC<{ t: number; at: number; src: string; ratio: number; title: Array<[string, number, string?]>; author: string; authorAt: number; titleSize?: number }> = ({ t, at, src, ratio, title, author, authorAt, titleSize = 60 }) => (
  <>
    <Cover t={t} at={at} src={src} x={300} y={470 - (250 * ratio) / 2} w={250} ratio={ratio} />
    <div style={{ position: "absolute", left: 470, width: 470, top: 470, transform: "translateY(-50%)" }}>
      <div style={{ ...serifStyle, fontSize: titleSize, fontWeight: 600, lineHeight: 1.06 }}>
        {title.map(([w, a, c], i) => <React.Fragment key={i}><W t={t} at={a} color={c}>{w}</W>{" "}</React.Fragment>)}
      </div>
      <div style={{ marginTop: 18, fontFamily: sans, fontWeight: 500, fontSize: 30, color: A.muted, opacity: ease(t, authorAt, 0.4), transform: `translateY(${(1 - ease(t, authorAt, 0.5)) * 10}px)` }}>{author}</div>
    </div>
  </>
);

// ---------- Lucide icons (exact geometry) ----------
const ICON: Record<string, React.ReactNode> = {
  app: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 4v4" /><path d="M2 8h20" /><path d="M6 4v4" /></>,
  plug: <><path d="M12 22v-5" /><path d="M15 8V2" /><path d="M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z" /><path d="M9 8V2" /></>,
  brain: <><path d="M12 18V5" /><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" /><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /><path d="M18 18a4 4 0 0 0 2-7.464" /><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /><path d="M6 18a4 4 0 0 1-2-7.464" /><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" /></>,
};

// ---------- scenes ----------

const Trio: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ position: "absolute", top: 262, width: "100%", textAlign: "center", ...serifStyle, fontSize: 64, fontWeight: 600 }}>
      <W t={t} at={5.0}>Afina</W> <W t={t} at={5.7}>tu</W> <W t={t} at={5.81} color={A.orange}>criterio</W>
    </div>
    <Cover t={t} at={3.88} src="covers/git.png" x={300} y={385} w={190} ratio={832 / 640} blur={9} />
    <Cover t={t} at={4.12} src="covers/aieng.jpg" x={540} y={385} w={190} ratio={1100 / 838} blur={9} />
    <Cover t={t} at={4.31} src="covers/grokking.jpg" x={780} y={385} w={190} ratio={1100 / 877} blur={9} />
  </>
);

const Api: React.FC<{ t: number }> = ({ t }) => {
  const steps: Array<[string, string, string, number]> = [[A.orange, "app", "Tu app", 30.3], [A.sky, "plug", "API", 32.35], [A.green, "brain", "LLM", 33.21]];
  const pp = pop(t, 29.6, { damping: 18, stiffness: 150 });
  const nx = (i: number) => 330 + i * 210;
  const ny = 450;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 170, top: 285 + (1 - pp) * 40, width: 740, height: 370, background: A.panel, borderRadius: 44, boxShadow: panelShadow, opacity: Math.min(1, pp * 2) }}>
        <div style={{ position: "absolute", top: 40, width: "100%", textAlign: "center", fontFamily: sans, fontWeight: 500, fontSize: 26, color: A.muted }}>Lo que enseña</div>
      </div>
      <svg width={1080} height={820} style={{ position: "absolute", inset: 0 }}>
        {steps.map(([col, ic, , at], i) => {
          const k = pop(t, at, { damping: 12, stiffness: 200 });
          const dp = i > 0 ? ease(t, at - 0.5, 0.45) : 0;
          return (
            <g key={i}>
              {i > 0 && <path d={`M${nx(i - 1) + 66} ${ny} H ${lerp(nx(i - 1) + 66, nx(i) - 66, dp)}`} stroke="#CFC8C1" strokeWidth={7} strokeDasharray="0 18" strokeLinecap="round" />}
              <g transform={`translate(${nx(i)} ${ny}) scale(${k})`}>
                <circle r={60} fill={col} />
                <svg x={-29} y={-29} width={58} height={58} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{ICON[ic]}</svg>
              </g>
            </g>
          );
        })}
      </svg>
      {steps.map(([, , label, at], i) => (
        <div key={i} style={{ position: "absolute", left: nx(i) - 100, width: 200, top: 535, textAlign: "center", ...serifStyle, fontSize: 40, fontWeight: 600 }}>
          <W t={t} at={at + 0.12}>{label}</W>
        </div>
      ))}
    </div>
  );
};

/** Ink doodles (Kie, cover style) popping around the Grokking cover, then floating gently. */
const Doodles: React.FC<{ t: number }> = ({ t }) => {
  const items: Array<[string, number, number, number, number]> = [
    ["maze", 210, 330, 160, 46.33], ["tree", 860, 330, 170, 46.6], ["rabbit", 190, 545, 130, 46.87],
    ["graph", 880, 555, 150, 47.35], ["flow", 330, 455, 0, 99], ["search", 750, 455, 0, 99],
  ];
  return (
    <>
      <Cover t={t} at={46.3 - 0.6} src="covers/grokking.jpg" x={540} y={310} w={230} ratio={1100 / 877} />
      {items.filter(([, , , w]) => w > 0).map(([n, x, y, w, at], i) => {
        const k = pop(t, at, { damping: 11, stiffness: 190 });
        const fy = Math.sin(t * 1.3 + i * 1.7) * 6;
        return (
          <Img key={n} src={staticFile(`el/doodle-${n}.png`)} style={{ position: "absolute", left: x - w / 2, top: y - w / 2 + fy, width: w, height: w, objectFit: "contain", transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * 8}deg)`, opacity: Math.min(1, k * 2) }} />
        );
      })}
    </>
  );
};

/** Alien Invasion in miniature: Kie pixel sprites on a dark screen, moved in code (stepped like a real game). */
const Aliens: React.FC<{ t: number }> = ({ t }) => {
  const pp = pop(t, 68.3, { damping: 18, stiffness: 150 });
  const g = Math.max(0, t - 68.5);
  const step = Math.floor(g * 4); // 4 moves per second, like the original game loop
  const sway = (step % 8 < 4 ? step % 4 : 4 - (step % 4)) * 16 - 32;
  const hits = [69.51, 70.82];
  const shipX = 540 + Math.sin(g * 1.6) * 150;
  const bullets = [69.15, 70.45, 71.3].map((s) => [s, prog(t, s, s + 0.36)] as const).filter(([, p]) => p > 0 && p < 1);
  return (
    <div style={{ position: "absolute", left: 160, top: 280 + (1 - pp) * 40, width: 760, height: 390, background: "#1C1A19", borderRadius: 36, boxShadow: panelShadow, overflow: "hidden", opacity: Math.min(1, pp * 2) }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const hitAt = hits[i === 1 ? 0 : i === 3 ? 1 : 9] ?? 99;
        const dead = ease(t, hitAt, 0.25);
        if (dead >= 1) return null;
        return <Img key={i} src={staticFile("el/alien.png")} style={{ position: "absolute", left: 112 + i * 116 + sway, top: 50, width: 76, imageRendering: "pixelated", transform: `scale(${1 - dead})`, opacity: 1 - dead, filter: dead > 0 ? "brightness(2)" : undefined }} />;
      })}
      {bullets.map(([s, p]) => <Img key={s} src={staticFile("el/bullet.png")} style={{ position: "absolute", left: 540 + Math.sin((s - 68.5) * 1.6) * 150 - 160 - 6, top: lerp(290, 90, p), width: 12, imageRendering: "pixelated" }} />)}
      {hits.map((h) => { const p = prog(t, h, h + 0.4); return p > 0 && p < 1 ? <div key={h} style={{ position: "absolute", left: (h === 69.51 ? 228 : 460) + sway - 20, top: 40, width: 110, height: 110, borderRadius: "50%", border: `6px solid ${A.orange}`, transform: `scale(${0.4 + p})`, opacity: 1 - p }} /> : null; })}
      <Img src={staticFile("el/ship.png")} style={{ position: "absolute", left: shipX - 160 - 48, top: 280, width: 96, imageRendering: "pixelated" }} />
    </div>
  );
};

const renderScene = (id: SceneId, t: number) => {
  switch (id) {
    case "trio": return <Trio t={t} />;
    case "git": return <BookIntro t={t} at={8.57} src="covers/git.png" ratio={832 / 640} title={[["Aprendiendo", 8.75], ["Git", 8.95, A.orange], ["y", 9.1], ["GitHub", 9.25]]} author="Miguel Ángel Durán · midudev" authorAt={10.59} />;
    case "vscode": return <FigureCard t={t} at={11.4} src="figs/git-vscode.png" w={820} h={326} source="Aprendiendo Git y GitHub, midudev" />;
    case "ramas": return <FigureCard t={t} at={16.85} src="figs/git-ramas.png" w={820} h={342} source="Aprendiendo Git y GitHub, midudev" wipe />;
    case "repos": return <FigureCard t={t} at={21.75} src="figs/git-repos.png" w={500} h={360} source="Aprendiendo Git y GitHub, midudev" />;
    case "ai": return <BookIntro t={t} at={25.66} src="covers/aieng.jpg" ratio={1100 / 838} title={[["AI", 26.08], ["Engineering", 26.3, A.orange]]} author="Chip Huyen · O'Reilly" authorAt={26.9} titleSize={66} />;
    case "api": return <Api t={t} />;
    case "usecases": return <FigureCard t={t} at={34.3} src="figs/aieng-usecases.png" w={820} h={297} source="AI Engineering, Chip Huyen" wipe />;
    case "shoggoth": return <FigureCard t={t} at={38.65} src="figs/aieng-shoggoth.png" w={440} h={350} source="AI Engineering, Chip Huyen" />;
    case "grok": return <BookIntro t={t} at={41.8} src="covers/grokking.jpg" ratio={1100 / 877} title={[["Grokking", 42.2, A.orange], ["Artificial", 42.4], ["Intelligence", 42.55], ["Algorithms", 42.72]]} author="Rishal Hurbans · Manning" authorAt={43.32} titleSize={54} />;
    case "doodles": return <Doodles t={t} />;
    case "py": return <BookIntro t={t} at={58.9} src="covers/python.jpg" ratio={630 / 477} title={[["Python", 61.17, A.orange], ["Crash", 64.04], ["Course", 64.37]]} author="Eric Matthes · No Starch Press" authorAt={64.8} titleSize={66} />;
    case "aliens": return <Aliens t={t} />;
  }
};

/** The graphic band: each scene holds until the next one is on screen, then leaves blurred and up. */
export const Scenes: React.FC<{ t: number }> = ({ t }) => {
  const k = splitProgress(t);
  if (k < 0.01) return null;
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, k * 1.6), transform: `translateY(${(1 - k) * -60}px)` }}>
      {SCENES.map(([at, id], i) => {
        const next = SCENES[i + 1]?.[0] ?? 999;
        if (t < at - 0.05 || t > next + 0.4) return null;
        const out = easeIn(t, next, 0.35);
        return (
          <AbsoluteFill key={id} style={{ opacity: 1 - out, transform: `translateY(${out * -30}px)`, filter: out > 0.001 ? `blur(${out * 12}px)` : undefined }}>
            {renderScene(id, t)}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
