import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Marcellus";
import words from "./words.json";
import { C } from "./rig";
import { STATIONS, Scene } from "./stations";

export const FPS = 24;
export const END = 250; // voice ends at 247.5 s; hold the final frame for the credit
const DISSOLVE = 0.5;
loadFont("normal", { subsets: ["latin"] });

function svg(scene: Scene, seed: number) {
  return `<svg viewBox="0 0 1080 1350" width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="boil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
      <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G"/></filter>
    </defs>
    <rect width="1080" height="1350" fill="${scene.bg}"/>
    <g filter="url(#boil)">${scene.g}</g>
    ${scene.over ?? ""}
  </svg>`;
}

const Layer: React.FC<{ html: string; opacity?: number }> = ({ html, opacity = 1 }) => (
  <AbsoluteFill style={{ opacity }} dangerouslySetInnerHTML={{ __html: html }} />
);

type Word = { text: string; startMs: number; endMs: number };
/** Group the narration into caption cards of at most two short lines, breaking on punctuation. */
function cards(ws: Word[]) {
  const out: Word[][] = [];
  let cur: Word[] = [], chars = 0;
  for (const w of ws) {
    const t = w.text.trim();
    if (cur.length && chars + t.length > 58) { out.push(cur); cur = []; chars = 0; }
    cur.push(w); chars += t.length + 1;
    if (/[,.;?!]$/.test(t) && chars >= 20) { out.push(cur); cur = []; chars = 0; }
  }
  if (cur.length) out.push(cur);
  return out;
}

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const all = useMemo(() => cards(words as Word[]), []);
  const ms = t * 1000;
  const i = all.findIndex((c, k) => ms >= c[0].startMs - 150 && ms < Math.min((all[k + 1]?.[0].startMs ?? 1e9) - 150, c[c.length - 1].endMs + 900));
  if (i < 0) return null;
  const card = all[i];
  const out = Math.max(0, Math.min(1, (ms - (card[card.length - 1].endMs + 700)) / 200));
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: 1180, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 14, rowGap: 2, opacity: 1 - out }}>
      {card.map((w, k) => (
        <span key={k} style={{ fontFamily: "Marcellus", fontSize: 50, lineHeight: "64px", color: C.cream, opacity: Math.max(0, Math.min(1, (ms - w.startMs + 60) / 180)) }}>
          {w.text.trim()}
        </span>
      ))}
    </div>
  );
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tq = Math.floor(t * 12) / 12; // animate on twos
  const seed = (Math.floor(t * 6) % 5) + 1;
  const idx = STATIONS.findIndex((s, k) => tq >= s.a && tq < (STATIONS[k + 1]?.a ?? 1e9));
  const cur = STATIONS[idx];
  const scene = cur.fn(tq, tq - cur.a, END);
  const prev = idx > 0 && tq - cur.a < DISSOLVE ? STATIONS[idx - 1] : null;
  const fade = prev ? 1 - (t - cur.a) / DISSOLVE : 0;
  return (
    <AbsoluteFill style={{ background: scene.bg }}>
      <Layer html={svg(scene, seed)} />
      {prev && <Layer html={svg(prev.fn(tq, tq - prev.a, END), seed)} opacity={Math.max(0, fade)} />}
      <Captions t={t} />
      <Img src={staticFile("grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1350 }} />
      <Audio src={staticFile("voice.wav")} />
    </AbsoluteFill>
  );
};
