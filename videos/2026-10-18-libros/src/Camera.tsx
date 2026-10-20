import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import cuts from "./cuts.json";
import { A, FPS, LAYOUT, SERIF_AXES, ease, easeIn, lerp, serif } from "./theme";
import { splitProgress } from "./timeline";

const ASPECT = 1080 / 1920;
const FACE_Y = 0.475; // eye line in the source (faces.json: face top 725, chin 1192)

/** Person mattes (Apple Vision, per frame) for the beats where text sits behind his head. */
const MATTES = [
  { src: "person-hook.mov", from: 0, to: 3.7 },
  { src: "person-bonus.mov", from: 53.2, to: 58.6 },
];

/** Subtle punch-in that alternates on every jump cut, only in full screen. */
const punch = (t: number) => {
  let idx = 0;
  for (const c of cuts) if (t >= c) idx++;
  const at = idx > 0 ? cuts[idx - 1] : 0;
  const target = idx % 2 === 0 ? 1 : 1.045;
  const prev = idx % 2 === 0 ? 1.045 : 1;
  return idx === 0 ? 1 : lerp(prev, target, ease(t, at, 0.18));
};

/** Ali's word reveal: arrives blurred and gray, then settles into its color. */
const Word: React.FC<{ t: number; at: number; color?: string; children: React.ReactNode }> = ({ t, at, color = "#fff", children }) => {
  const p = ease(t, at, 0.6);
  return (
    <span
      style={{
        display: "inline-block",
        opacity: ease(t, at, 0.3),
        transform: `translateY(${(1 - p) * 26}px)`,
        filter: p < 0.999 ? `blur(${(1 - p) * 14}px)` : undefined,
        color: p < 0.98 ? `color-mix(in srgb, ${color} ${Math.round(p * 100)}%, #B8B2AC)` : color,
      }}
    >
      {children}
    </span>
  );
};

const Stack: React.FC<{ top: number; opacity: number; small: React.ReactNode; big: React.ReactNode; bigSize: number }> = ({ top, opacity, small, big, bigSize }) => (
  <div style={{ position: "absolute", top, width: "100%", textAlign: "center", opacity, fontFamily: serif, fontVariationSettings: SERIF_AXES, letterSpacing: "-0.015em", textShadow: "0 4px 24px rgba(0,0,0,.22)" }}>
    <div style={{ fontSize: 88, fontWeight: 500, lineHeight: 1 }}>{small}</div>
    <div style={{ fontSize: bigSize, fontWeight: 700, lineHeight: 1.02 }}>{big}</div>
  </div>
);

/** Headlines that live between the footage and his cut-out silhouette (source-frame coordinates). */
const BehindText: React.FC<{ t: number }> = ({ t }) => {
  if (t < 3.7) {
    return (
      <Stack top={340} bigSize={196} opacity={1 - easeIn(t, 3.08, 0.32)}
        small={<><Word t={t} at={0.06}>Si</Word> <Word t={t} at={0.14}>estás</Word> <Word t={t} at={0.3}>haciendo</Word></>}
        big={<><Word t={t} at={0.64} color={A.salmonText}>vibe</Word> <Word t={t} at={0.82} color={A.salmonText}>coding</Word></>} />
    );
  }
  if (t >= 53.3 && t < 56.9) {
    return (
      <Stack top={255} bigSize={260} opacity={1 - easeIn(t, 56.55, 0.3)}
        small={<Word t={t} at={53.36}>y un</Word>} big={<Word t={t} at={53.48} color={A.salmonText}>bonus</Word>} />
    );
  }
  if (t >= 56.9 && t < 58.6) {
    return (
      <Stack top={255} bigSize={196} opacity={1 - easeIn(t, 58.2, 0.35)}
        small={<Word t={t} at={56.77}>sepas</Word>} big={<Word t={t} at={56.98} color={A.salmonText}>programar</Word>} />
    );
  }
  return null;
};

/** Eased alpha ramp for the split's top edge: the sky dissolves into the cream. */
const fadeMask = (px: number) => {
  if (px < 1) return undefined;
  const stops = [0, 0.04, 0.14, 0.32, 0.56, 0.8, 1];
  return `linear-gradient(180deg, ${stops.map((a, i) => `rgba(0,0,0,${a}) ${((i / (stops.length - 1)) * px).toFixed(1)}px`).join(", ")})`;
};

export const Camera: React.FC<{ t: number }> = ({ t }) => {
  const k = splitProgress(t);
  const y = lerp(0, LAYOUT.splitTop, k);
  const h = 1920 - y;
  const anchor = lerp(0.51, (LAYOUT.splitEyeY - LAYOUT.splitTop) / (1920 - LAYOUT.splitTop), k);
  const zoom = lerp(punch(t), 1, k) * (1 + 0.006 * (1 + Math.sin(t * 0.6)));
  const coverW = 1080 * zoom;
  const coverH = coverW / ASPECT;
  const top = Math.min(0, Math.max(h - coverH, anchor * h - FACE_Y * coverH));
  const left = (1080 - coverW) / 2;
  const mask = fadeMask(150 * k);
  // Only the footage goes gray: the behind-head headline keeps its color.
  // The hook opens desaturated, then color blooms back in.
  const sat = t < 3.3 ? 0.12 : lerp(0.12, 1, ease(t, 3.3, 0.6));
  const gray = sat < 0.999 ? `saturate(${sat}) contrast(1.04)` : undefined;
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: h, overflow: "hidden", WebkitMaskImage: mask, maskImage: mask }}>
      <div
        style={{
          position: "absolute", left, top, width: 1080, height: 1920, transform: `scale(${zoom})`, transformOrigin: "0 0",
        }}
      >
        <AbsoluteFill style={{ filter: gray }}>
          <OffthreadVideo src={staticFile("edited.mp4")} />
        </AbsoluteFill>
        <BehindText t={t} />
        {MATTES.map((m) => (
          <Sequence key={m.src} from={Math.round(m.from * FPS)} durationInFrames={Math.round((m.to - m.from) * FPS)}>
            <AbsoluteFill style={{ filter: gray }}>
              <OffthreadVideo src={staticFile(m.src)} transparent muted />
            </AbsoluteFill>
          </Sequence>
        ))}
      </div>
    </div>
  );
};
