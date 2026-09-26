import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { SCENES } from "./scenes";
import { C, FPS, LAYOUT, sans } from "./theme";

const LEAD = 0.3;
const TAIL = 0.6;
export const PREVIEW_SEC = SCENES.reduce((a, s) => a + (s.end - s.start) + LEAD + TAIL, 0);

/* Pieces back to back on a still camera, each at its real timeline times. */
export const Piezas: React.FC = () => {
  const local = useCurrentFrame() / FPS;
  let acc = 0;
  for (const s of SCENES) {
    const len = s.end - s.start + LEAD + TAIL;
    if (local < acc + len) {
      const t = s.start - LEAD + (local - acc);
      const P = s.C;
      return (
        <AbsoluteFill style={{ background: C.bg }}>
          {s.full ? (
            <Img src={staticFile("cam.jpg")} style={{ position: "absolute", width: 1080, height: 1920, objectFit: "cover" }} />
          ) : (
            <div style={{ position: "absolute", left: 90, width: 900, top: LAYOUT.cardTop, height: LAYOUT.cardHeight, borderRadius: 48, overflow: "hidden" }}>
              <Img src={staticFile("cam.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%" }} />
            </div>
          )}
          <div style={{ position: "absolute", left: 0, right: 0, top: (s.full ? LAYOUT.fullCaptionY : LAYOUT.laneCenter) - 30, textAlign: "center", fontFamily: sans, fontWeight: 700, fontSize: 44, color: s.full ? "rgba(255,255,255,0.75)" : C.faint }}>
            subtítulos aquí
          </div>
          <P t={Math.min(t, s.end - 0.01)} />
        </AbsoluteFill>
      );
    }
    acc += len;
  }
  return null;
};
