import React from "react";
import logos from "./logos.json";
import { A, SERIF_AXES, ease, easeIn, lerp, sans, serif } from "./theme";

const C = { ink: A.ink, claude: A.claude, coral: A.orange, coralCam: A.salmonText };

const Pop: React.FC<{ t: number; at: number; out?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  t, at, out, style, children,
}) => {
  const p = ease(t, at, 0.6);
  const o = out !== undefined ? easeIn(t, out, 0.3) : 0;
  if (p <= 0 || o >= 1) return null;
  return (
    <div
      style={{
        opacity: Math.min(1, p * 1.8) * (1 - o),
        transform: `translateY(${(1 - p) * 30}px) scale(${lerp(0.94, 1, p)})`,
        filter: p < 0.999 ? `blur(${(1 - p) * 10}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Chip: React.FC<{ d: string; fill: string; label: string }> = ({ d, fill, label }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,.94)", borderRadius: 999,
      padding: "14px 28px 14px 20px", boxShadow: "0 10px 30px rgba(0,0,0,.18)",
    }}
  >
    <svg width={42} height={42} viewBox="0 0 24 24"><path d={d} fill={fill} /></svg>
    <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 36, color: C.ink }}>{label}</span>
  </div>
);

/** Hook: the tools he names, as brand chips on his chest (captions are off during the hook). */
const ToolChips: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 1330, width: "100%", display: "flex", justifyContent: "center", gap: 22 }}>
    <Pop t={t} at={2.3} out={3.05}><Chip d={logos.claude} fill={C.claude} label="Claude" /></Pop>
    <Pop t={t} at={2.82} out={3.05}><Chip d={logos.openai} fill="#000" label="ChatGPT" /></Pop>
  </div>
);

/** "hacer push · merge · commits" in Ali's serif, over his chest, below the chin. */
const GitWords: React.FC<{ t: number }> = ({ t }) => {
  if (t < 18.9 || t > 21.9) return null;
  const out = easeIn(t, 21.4, 0.35);
  const w = (at: number, color = "#fff") => {
    const p = ease(t, at, 0.5);
    return { display: "inline-block", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 26}px)`, filter: p < 0.999 ? `blur(${(1 - p) * 12}px)` : undefined, color: p < 0.98 ? `color-mix(in srgb, ${color} ${Math.round(p * 100)}%, #B8B2AC)` : color };
  };
  return (
    <div style={{ position: "absolute", top: 1215, width: "100%", textAlign: "center", opacity: 1 - out, fontFamily: serif, fontVariationSettings: SERIF_AXES, letterSpacing: "-0.015em", textShadow: "0 4px 26px rgba(0,0,0,.35)" }}>
      <div style={{ fontSize: 64, fontWeight: 500, ...w(18.94) }}>hacer</div>
      <div style={{ fontSize: 150, fontWeight: 700, lineHeight: 1 }}>
        <span style={w(19.25, C.coralCam)}>push</span> <span style={w(19.5)}>·</span> <span style={w(19.7, C.coralCam)}>merge</span>
      </div>
      <div style={{ fontSize: 120, fontWeight: 600, lineHeight: 1.05, ...w(20.22) }}>commits</div>
    </div>
  );
};

/** Ending: one clean comment pill where the caption would sit. */
const CommentPill: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 1400, width: "100%", display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
    <Pop t={t} at={79.92}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,.95)", borderRadius: 999, padding: "18px 36px 18px 28px", boxShadow: "0 10px 30px rgba(0,0,0,.18)" }}>
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.coral} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.2 7.5L3 21l2-5.6A8.4 8.4 0 1 1 21 11.5z" /></svg>
        <span style={{ fontFamily: serif, fontVariationSettings: SERIF_AXES, fontWeight: 600, fontSize: 48, color: C.ink, letterSpacing: -0.5 }}>Coméntame aquí abajo</span>
      </div>
    </Pop>
  </div>
);

export const Overlays: React.FC<{ t: number }> = ({ t }) => (
  <>
    {t < 3.7 && <ToolChips t={t} />}
    <GitWords t={t} />
    {t >= 79.9 && <CommentPill t={t} />}
  </>
);
