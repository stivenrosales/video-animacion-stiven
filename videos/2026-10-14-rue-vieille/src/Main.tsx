import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Marcellus";
import { captionAt, END as SONG_END, frameSvg } from "./board";

export const FPS = 24;
export const END = SONG_END;
loadFont("normal", { subsets: ["latin"] });

export const Main: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "#1c2b45" }}>
      <AbsoluteFill dangerouslySetInnerHTML={{ __html: frameSvg(t) }} />
      <div style={{ position: "absolute", left: 110, width: 860, top: 1185, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 13 }}>
        {captionAt(t).map((c, k) => (
          <span key={k} style={{ fontFamily: "Marcellus", fontSize: 48, lineHeight: "62px", color: "#f3f3e4", opacity: c.o, textShadow: "0 2px 10px rgba(16, 22, 36, .55)" }}>
            {c.w}
          </span>
        ))}
      </div>
      <Img src={staticFile("grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1350 }} />
      <Audio src={staticFile("song.wav")} />
    </AbsoluteFill>
  );
};
