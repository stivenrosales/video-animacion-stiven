import React from "react";
import { Img, staticFile } from "remotion";
import { Check, CircleHelp, Eye, FileText, ShieldCheck, User } from "lucide-react";
import logos from "./logos.json";
import { C, LAYOUT, SAFE, clamp01, lerp, mono, pop, prog, sans, serif, serifItalic, shadow } from "./theme";
import { Badge, Card, In, ease, easeIn } from "./ui";

/* Every piece takes ABSOLUTE time `t` (edited timeline, seconds). Cue times come from captions.json.
   Visual language follows the source article: near-black stage blocks, clay accent, mono stage labels.
   Source: "The AI-Native SDLC playbook", Louis Claxton, claude.com/blog (Aug 21, 2026). */

export const INK = "#141413";
export const CLAY = "#D97757";
export const PLUM = "#827DBD"; // article hero tile: data-illustration-bg="Plum" → --swatch--plum

const Simple: React.FC<{ d: string; size: number; fill: string }> = ({ d, size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d={d} fill={fill} />
  </svg>
);
const ClaudeMark: React.FC<{ size: number; color?: string }> = ({ size, color = CLAY }) => (
  <Simple d={logos.claude} size={size} fill={color} />
);

const Panel: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 22 }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE.side,
      right: SAFE.side,
      top: SAFE.top,
      height: LAYOUT.panelBottom - SAFE.top - 40,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap,
    }}
  >
    {children}
  </div>
);

const Top: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: 262 }}>{children}</div>
);

const float = (t: number, seed: number, amp = 4) => Math.sin(t * 1.3 + seed * 1.7) * amp;

/** The article's own header illustration (book in hand) on its Plum tile, as on claude.com. */
const ArticleLogo: React.FC<{ size: number; t: number; at: number }> = ({ size, t, at }) => {
  const p = pop(t, at, { damping: 12, stiffness: 200 });
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.2, background: PLUM, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Img src={staticFile("article-logo.svg")} style={{ width: size * 0.86, height: size * 0.86, transform: `scale(${lerp(0.6, 1, Math.min(1, p))}) rotate(${(1 - Math.min(1, p)) * -8}deg)` }} />
    </div>
  );
};

/** Small citation line; sits at the bottom of the panel (card mode) or under a top card (full mode). */
export const Source: React.FC<{ t: number; at: number; style?: React.CSSProperties }> = ({ t, at, style }) => (
  <div style={{ opacity: ease(t, at, 0.5) * 0.9, fontFamily: sans, fontSize: 22, color: C.muted, display: "flex", alignItems: "center", gap: 10, ...style }}>
    <ArticleLogo size={32} t={t} at={at} />
    <span style={{ fontWeight: 600, letterSpacing: 1, fontSize: 18 }}>FUENTE</span>
    <span>The AI-Native SDLC playbook · claude.com/blog</span>
  </div>
);
const PanelSource: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <Source t={t} at={at} style={{ position: "absolute", left: SAFE.side, top: LAYOUT.panelBottom - 44 }} />
);

/** Near-black stage block with a mono stage label, like the article diagrams. */
const Block: React.FC<{ label?: string; title: string; hot?: number; w?: number | string; h?: number; size?: number }> = ({
  label,
  title,
  hot = 0,
  w,
  h = 84,
  size = 30,
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 14,
      background: hot > 0.5 ? CLAY : INK,
      boxShadow: hot > 0.5 ? `0 0 0 ${6 * hot}px rgba(217,119,87,0.22)` : "none",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 22px",
      boxSizing: "border-box",
    }}
  >
    {label && <div style={{ fontFamily: mono, fontSize: 16, letterSpacing: 2, opacity: 0.7 }}>{label}</div>}
    <div style={{ fontFamily: label ? mono : sans, fontSize: size, fontWeight: label ? 500 : 500 }}>{title}</div>
  </div>
);

/* ---------- Hook (FULL, top card): the article, then the headline "IA en empresas*" ---------- */
// The speaker says "inteligencia artificial" but means AI in companies; the edit makes that the headline.
export const ENTERPRISE_AT = 3.5;
export const HookPiece: React.FC<{ t: number }> = ({ t }) => {
  const away = easeIn(t, ENTERPRISE_AT - 0.1, 0.3);
  const hero = pop(t, ENTERPRISE_AT, { damping: 11, stiffness: 190, mass: 0.7 });
  const heroIn = ease(t, ENTERPRISE_AT, 0.45);
  const mark = ease(t, ENTERPRISE_AT + 0.45, 0.5);
  const star = pop(t, ENTERPRISE_AT + 0.75, { damping: 8, stiffness: 320, mass: 0.4 });
  return (
    <Top>
      {away < 1 && (
        <div style={{ opacity: 1 - away, transform: `translateY(${-away * 40}px) scale(${1 - away * 0.08})`, filter: away > 0 ? `blur(${away * 10}px)` : undefined }}>
          <In t={t} at={1.3} y={-30} scale={0.92}>
            <Card style={{ padding: "24px 30px", borderRadius: 34, display: "flex", gap: 24, alignItems: "center" }}>
              <ArticleLogo size={170} t={t} at={1.6} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <ClaudeMark size={40} />
                  <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, color: C.ink }}>Claude</div>
                  <div style={{ fontFamily: sans, fontSize: 26, color: C.muted }}>/ Blog</div>
                  <div style={{ flex: 1 }} />
                  <In t={t} at={2.0} scale={0.6} y={0}>
                    <Badge bg={C.chip} style={{ fontSize: 24 }}>Guía paso a paso</Badge>
                  </In>
                </div>
                <div style={{ fontFamily: serif, fontSize: 50, fontWeight: 500, color: C.ink, letterSpacing: -1.4, lineHeight: 1.02, marginTop: 14 }}>
                  The AI-Native SDLC playbook
                </div>
                <In t={t} at={2.9} y={10} blur={4}>
                  <div style={{ fontFamily: sans, fontSize: 24, color: C.muted, marginTop: 10 }}>
                    How to transform your software development lifecycle with AI — stage by stage.
                  </div>
                </In>
              </div>
            </Card>
          </In>
        </div>
      )}
      {t >= ENTERPRISE_AT && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ opacity: heroIn, transform: `scale(${lerp(0.7, 1, Math.min(1.04, hero))})`, filter: heroIn < 0.999 ? `blur(${(1 - heroIn) * 12}px)` : undefined }}>
            <Card style={{ padding: "26px 48px 30px", borderRadius: 40, textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <ArticleLogo size={40} t={t} at={ENTERPRISE_AT} />
                <div style={{ fontFamily: sans, fontSize: 32, color: C.muted, fontWeight: 500 }}>Guía para implementar IA</div>
              </div>
              <div style={{ marginTop: 6, lineHeight: 1 }}>
                <span
                  style={{
                    fontFamily: serifItalic,
                    fontSize: 124,
                    fontWeight: 500,
                    letterSpacing: -3,
                    color: C.accent,
                    backgroundImage: "linear-gradient(rgba(217,119,87,0.20), rgba(217,119,87,0.20))",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${mark * 100}% 62%`,
                    backgroundPosition: "0 70%",
                    padding: "0 14px",
                    borderRadius: 12,
                  }}
                >
                  en empresas
                  <sup style={{ display: "inline-block", fontSize: 80, marginLeft: 4, transform: `scale(${Math.min(1.15, star)})`, transformOrigin: "bottom left" }}>*</sup>
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </Top>
  );
};

/* ---------- P1 (CARD): the line becomes the loop, Plan lights up ---------- */
const STAGES = ["Plan", "Design", "Build", "Test", "Deploy", "Maintain"];
export const LoopPiece: React.FC<{ t: number }> = ({ t }) => {
  const morph = ease(t, 6.2, 1.1); // line → loop
  const planHot = ease(t, 7.0, 0.4);
  const cx = 450;
  const cy = 245;
  const R = 190;
  return (
    <>
      <div style={{ position: "absolute", left: SAFE.side, top: 262, width: 900, height: 560 }}>
        <In t={t} at={5.6} x={-20} y={0}>
          <div style={{ fontFamily: serif, fontSize: 48, fontWeight: 500, color: C.ink, letterSpacing: -1, textAlign: "center" }}>
            De la línea <span style={{ color: C.muted }}>→</span> al <span style={{ fontFamily: serifItalic, color: C.accent }}>loop</span>
          </div>
        </In>
        {/* Claude at the center of the loop, as in the article */}
        <div
          style={{
            position: "absolute",
            left: cx - 110,
            top: cy + 60 - 110,
            width: 220,
            height: 220,
            borderRadius: 110,
            background: CLAY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: morph,
            transform: `scale(${lerp(0.5, 1, morph)})`,
          }}
        >
          <ClaudeMark size={40} color="#fff" />
          <div style={{ fontFamily: serif, fontSize: 44, color: "#fff" }}>Claude</div>
        </div>
        {STAGES.map((s, i) => {
          const at = 5.7 + i * 0.09;
          const p = ease(t, at, 0.5);
          // Line: vertical list on the left. Loop: circle around Claude, Plan at the top.
          const lx = 40;
          const ly = 90 + i * 76;
          const a = -Math.PI / 2 + (i / STAGES.length) * Math.PI * 2;
          const ox = cx + Math.cos(a) * R - 80;
          const oy = cy + 60 + Math.sin(a) * R - 40;
          const x = lerp(lx, ox, morph);
          const y = lerp(ly, oy, morph);
          const w = lerp(300, 160, morph);
          const hot = i === 0 ? planHot : 0;
          return (
            <div
              key={s}
              style={{
                position: "absolute",
                left: x,
                top: y,
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px) scale(${1 + 0.1 * hot})`,
                filter: p < 0.999 ? `blur(${(1 - p) * 6}px)` : undefined,
              }}
            >
              <Block title={s} w={w} h={lerp(64, 80, morph)} hot={hot} size={28} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: cx + 110, top: 108, opacity: ease(t, 7.2, 0.4) }}>
          <Badge bg={C.redBg} color={C.red} style={{ fontWeight: 600, fontSize: 26 }}>Paso 1</Badge>
        </div>
      </div>
      <PanelSource t={t} at={6.0} />
    </>
  );
};

/* ---------- P2 (CARD): intent.md, the format for non-developers ---------- */
const SECTIONS: Array<[string, string, number]> = [
  ["Problem", "¿Qué problema hay?", 13.9],
  ["Proposed outcome", "¿Qué resultado buscas?", 14.4],
  ["Affected users and systems", "¿A quién afecta?", 14.9],
  ["Constraints", "¿Qué límites hay?", 15.4],
  ["Open questions", "¿Qué falta resolver?", 15.9],
];
export const IntentPiece: React.FC<{ t: number }> = ({ t }) => {
  const handoff = ease(t, 16.9, 0.5);
  return (
    <>
      <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: 262, display: "flex", gap: 22 }}>
        <In t={t} at={8.35} scale={0.9} y={40} style={{ flex: 1 }}>
          <div style={{ background: INK, borderRadius: 30, overflow: "hidden", boxShadow: "0 26px 70px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: "#26251F" }}>
              <FileText size={28} color={CLAY} />
              <div style={{ fontFamily: mono, fontSize: 28, color: "#F4F1EA" }}>intent.md</div>
              <div style={{ flex: 1 }} />
              <In t={t} at={11.0} scale={0.6} y={0}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontSize: 22, color: "#D8D4CA", background: "#3A3835", padding: "6px 14px", borderRadius: 12 }}>
                  <User size={20} /> Autor: no-dev
                </div>
              </In>
            </div>
            <div style={{ padding: "18px 26px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontFamily: mono, fontSize: 28, color: "#F4F1EA" }}>
                <span style={{ color: CLAY }}># </span>Intent: <span style={{ color: "#8C8A82" }}>tu idea</span>
              </div>
              {SECTIONS.map(([en, es, at]) => (
                <In key={en} t={t} at={at} x={-24} y={0} dur={0.45} blur={6}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                    <span style={{ fontFamily: mono, fontSize: 24, color: CLAY }}>##</span>
                    <span style={{ fontFamily: mono, fontSize: 25, color: "#F4F1EA" }}>{en}</span>
                    <span style={{ fontFamily: sans, fontSize: 22, color: "#8C8A82" }}>{es}</span>
                  </div>
                </In>
              ))}
            </div>
          </div>
        </In>
      </div>
      <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: 700, display: "flex", alignItems: "center", gap: 16, opacity: handoff, transform: `translateX(${(1 - handoff) * -40}px)` }}>
        <Badge bg={C.chip} style={{ fontSize: 26 }}>Idea en markdown</Badge>
        <div style={{ fontFamily: sans, fontSize: 34, color: C.muted }}>→</div>
        <Badge bg={C.blueBg} color={C.blue} style={{ fontSize: 26, fontWeight: 600 }}>Equipo de producto y desarrollo</Badge>
      </div>
      <PanelSource t={t} at={9.0} />
    </>
  );
};

/* ---------- P3 (FULL, top card): one skill in every employee's Claude ---------- */
export const SKILL_AT = 21.6;
export const INSTALL_TIMES = [22.4, 22.55, 22.7, 22.85, 23.0, 23.15];
export const SkillPiece: React.FC<{ t: number }> = ({ t }) => (
  <Top>
    <In t={t} at={19.8} y={-30} scale={0.92}>
      <Card style={{ padding: "24px 30px", borderRadius: 34 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <In t={t} at={SKILL_AT} scale={0.6} y={0}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: INK, color: "#fff", borderRadius: 14, padding: "10px 18px", fontFamily: mono, fontSize: 26 }}>
              <span style={{ color: CLAY }}>/</span>intent-skill
            </div>
          </In>
          <div style={{ fontFamily: sans, fontSize: 28, color: C.muted }}>instalado en</div>
          <div style={{ fontFamily: serif, fontSize: 40, color: C.ink, fontWeight: 500 }}>todo el equipo</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
          {INSTALL_TIMES.map((at, i) => {
            const p = pop(t, at, { damping: 11, stiffness: 240 });
            const done = ease(t, at + 0.15, 0.3);
            return (
              <div key={i} style={{ position: "relative", width: 118, height: 118, transform: `scale(${lerp(0.6, 1, Math.min(1, p))})`, opacity: Math.min(1, p * 1.5) }}>
                <div style={{ width: 118, height: 118, borderRadius: 59, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${done > 0.5 ? CLAY : C.border}` }}>
                  <ClaudeMark size={54} />
                </div>
                <div style={{ position: "absolute", right: -4, bottom: -4, width: 40, height: 40, borderRadius: 20, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${done})` }}>
                  <Check size={26} color="#fff" strokeWidth={3} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </In>
  </Top>
);

/* ---------- P4 (FULL, lowered camera): the skill interviews the employee, 5 questions ---------- */
export const Q_TIMES = [32.2, 32.45, 32.7, 32.95, 33.2];
const QUESTIONS = ["¿Qué problema resuelve?", "¿Qué resultado esperas?", "¿A quién y a qué sistemas afecta?", "¿Qué restricciones hay?", "¿Qué preguntas siguen abiertas?"];
export const InterviewPiece: React.FC<{ t: number }> = ({ t }) => (
  <Top>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <In t={t} at={27.0} x={40} y={0} style={{ alignSelf: "flex-end" }}>
      <div style={{ background: INK, color: "#fff", fontFamily: sans, fontWeight: 500, fontSize: 32, padding: "18px 26px", borderRadius: "28px 28px 8px 28px" }}>
        Quiero pedir una nueva funcionalidad
      </div>
    </In>
    <In t={t} at={28.3} x={-40} y={0} style={{ alignSelf: "flex-start", width: "100%" }}>
      <Card style={{ padding: "20px 26px", borderRadius: "28px 28px 28px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ClaudeMark size={40} />
          <div style={{ fontFamily: mono, fontSize: 22, color: C.muted }}>/intent-skill</div>
        </div>
        {/* The card grows line by line instead of reserving empty space. */}
        <div style={{ height: 52 * ease(t, 29.3, 0.35), overflow: "hidden" }}>
          <In t={t} at={29.4} y={10} blur={4}>
            <div style={{ fontFamily: sans, fontSize: 32, color: C.ink, fontWeight: 600, marginTop: 10 }}>Ok, vamos a hacerlo paso a paso.</div>
          </In>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 4 }}>
          {QUESTIONS.map((q, i) => (
            <div key={q} style={{ height: 48 * ease(t, Q_TIMES[i] - 0.06, 0.28), overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
            <In t={t} at={Q_TIMES[i]} x={-20} y={0} dur={0.4} blur={5}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: CLAY, color: "#fff", fontFamily: mono, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
                <div style={{ fontFamily: sans, fontSize: 28, color: C.ink }}>{q}</div>
              </div>
            </In>
            </div>
          ))}
        </div>
      </Card>
    </In>
    </div>
  </Top>
);

/* ---------- P4b (FULL): intent.md assembles between the hands ("se arma el documento") ---------- */
// The camera eases out to zoom 1.0 for this gesture (Camera.tsx ZOOM_OUT).
const DOC = { x: 260, y: 1125, w: 560, h: 330 }; // centered on the canvas; chest height after the 0.86 zoom-out
export const ARMA_AT = 34.1;
export const INTENT_WORD_AT = 35.1;
const DOC_LINES: Array<[string, string]> = [
  ["##", "Problem"],
  ["##", "Proposed outcome"],
  ["##", "Affected users"],
  ["##", "Constraints"],
  ["##", "Open questions"],
];
export const ARMA_LINE_TIMES = DOC_LINES.map((_, i) => ARMA_AT + 0.32 + i * 0.12);
export const ArmaPiece: React.FC<{ t: number }> = ({ t }) => {
  const frame = ease(t, ARMA_AT, 0.45);
  const bar = ease(t, ARMA_AT + 0.2, 0.35);
  const done = pop(t, INTENT_WORD_AT, { damping: 9, stiffness: 260, mass: 0.5 });
  const perim = 2 * (DOC.w + DOC.h);
  return (
    <div style={{ position: "absolute", left: DOC.x, top: DOC.y, width: DOC.w, height: DOC.h, transform: `scale(${1 + 0.04 * Math.sin(Math.min(1, done) * Math.PI)})` }}>
      {/* Frame draws itself first, like the gesture */}
      <svg width={DOC.w} height={DOC.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={2} y={2} width={DOC.w - 4} height={DOC.h - 4} rx={22} fill="none" stroke={CLAY} strokeWidth={4} strokeDasharray={perim} strokeDashoffset={perim * (1 - frame)} />
      </svg>
      <div style={{ position: "absolute", inset: 6, borderRadius: 18, background: `rgba(20,20,19,${0.92 * ease(t, ARMA_AT + 0.15, 0.3)})`, overflow: "hidden", boxShadow: frame > 0.9 ? "0 24px 60px rgba(0,0,0,0.35)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 22px", background: "#26251F", transform: `translateY(${(1 - bar) * -60}px)`, opacity: bar }}>
          <FileText size={28} color={CLAY} />
          <div style={{ fontFamily: mono, fontSize: 29, color: "#F4F1EA" }}>intent.md</div>
        </div>
        <div style={{ padding: "14px 24px", display: "flex", flexDirection: "column", gap: 7 }}>
          {DOC_LINES.map(([h, txt], i) => {
            const p = ease(t, ARMA_LINE_TIMES[i], 0.35);
            const side = i % 2 === 0 ? -1 : 1;
            return (
              <div key={txt} style={{ display: "flex", gap: 10, fontFamily: mono, fontSize: 27, opacity: p, transform: `translateX(${side * (1 - p) * 120}px)`, filter: p < 0.999 ? `blur(${(1 - p) * 5}px)` : undefined }}>
                <span style={{ color: CLAY }}>{h}</span>
                <span style={{ color: "#F4F1EA" }}>{txt}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", right: -18, top: -22, transform: `scale(${Math.min(1.1, done)})`, opacity: Math.min(1, done * 2) }}>
        <Badge bg={C.greenBg} color={C.green} style={{ fontWeight: 700, fontSize: 24, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Check size={22} strokeWidth={3} /> listo
        </Badge>
      </div>
    </div>
  );
};

/* ---------- P5 (CARD): the artifact pipeline ---------- */
const ARTIFACTS: Array<[string, string, number]> = [
  ["PLAN", "intent.md", 36.5],
  ["DESIGN", "spec.md", 39.7],
  ["BUILD", "plan.md", 40.5],
  ["TEST · DEPLOY", "PR + tests", 41.3],
  ["MAINTAIN", "Incidentes → nuevo intent", 41.6],
];
export const PipelinePiece: React.FC<{ t: number }> = ({ t }) => {
  const loop = ease(t, 41.8, 0.6);
  return (
    <>
      <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: 262 }}>
        <In t={t} at={36.25} x={-20} y={0}>
          <div style={{ fontFamily: serif, fontSize: 46, fontWeight: 500, color: C.ink, letterSpacing: -1, marginBottom: 18, textAlign: "center" }}>
            Cada etapa deja un <span style={{ fontFamily: serifItalic, color: C.accent }}>artefacto</span>
          </div>
        </In>
        {/* Number column + blocks + loop arrow form one group, centered in the panel */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, width: 60 + 16 + 600 + 140, margin: "0 auto" }}>
          {ARTIFACTS.map(([label, title, at], i) => (
            <In key={title} t={t} at={at} x={-50} y={0} dur={0.5}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 60, fontFamily: mono, fontSize: 24, color: C.muted, textAlign: "right" }}>{String(i + 1).padStart(2, "0")}</div>
                <Block label={label} title={title} w={600} h={82} size={28} hot={i === 0 ? 1 : 0} />
              </div>
            </In>
          ))}
          {/* Loop-back arrow: Maintain feeds a new intent.md */}
          <svg style={{ position: "absolute", left: 60 + 16 + 600 + 2, top: 30, opacity: loop }} width={140} height={420} viewBox="0 0 140 420">
            <path
              d="M10 390 C 120 390, 120 30, 10 30"
              fill="none"
              stroke={CLAY}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray="520"
              strokeDashoffset={520 * (1 - loop)}
            />
            <path d="M24 18 L8 30 L24 42" fill="none" stroke={CLAY} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={loop > 0.9 ? 1 : 0} />
          </svg>
        </div>
      </div>
      <PanelSource t={t} at={36.5} />
    </>
  );
};

/* ---------- P6 (FULL, top card): build is no longer the constraint (article figure) ---------- */
// Horizontal like the article, wrapped in two rows so it fits the phone. When Build collapses,
// Test/Deploy/Maintain climb into row 1 and row 2 is left empty: that empty row is the time saved.
const ROW_W = 852;
const ROW_H = 76;
const GAP = 10;
const W: Record<string, number> = { Plan: 116, Design: 150, Test: 118, Deploy: 110, Maintain: 138 };
const BUILD_BEFORE = ROW_W - W.Plan - W.Design - 2 * GAP;
const BUILD_AFTER = 16;
export const SHRINK_AT = 43.4;
const CLIMB_AT = 43.95;
const SAVED_AT = 44.35;
export const BeforeAfterPiece: React.FC<{ t: number }> = ({ t }) => {
  const s = ease(t, SHRINK_AT, 0.7);
  const climb = ease(t, CLIMB_AT, 0.6);
  const saved = ease(t, SAVED_AT, 0.5);
  const hlPlan = ease(t, 44.9, 0.4);
  const buildW = lerp(BUILD_BEFORE, BUILD_AFTER, s);
  // Row-1 x positions after the collapse.
  const afterX = W.Plan + W.Design + BUILD_AFTER + 3 * GAP;
  const lower: Array<[string, number, number]> = [
    ["Test", 0, afterX],
    ["Deploy", W.Test + GAP, afterX + W.Test + GAP],
    ["Maintain", W.Test + W.Deploy + 2 * GAP, afterX + W.Test + W.Deploy + 2 * GAP],
  ];
  const box = (x: number, y: number, w: number, name: string, hot: boolean, extra: React.CSSProperties = {}) => (
    <div
      key={name}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: ROW_H,
        borderRadius: 12,
        background: hot ? CLAY : INK,
        color: "#fff",
        fontFamily: sans,
        fontSize: 23,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        whiteSpace: "nowrap",
        ...extra,
      }}
    >
      {name}
    </div>
  );
  return (
    <Top>
      <In t={t} at={42.4} y={-30} scale={0.94}>
        <Card style={{ padding: "22px 24px 20px", borderRadius: 30, background: "#F0EEE6" }}>
          <div style={{ fontFamily: sans, fontSize: 25, color: "#3D3D3A" }}>
            <b>{s < 0.5 ? "Antes de los agentes" : "Con agentes"}</b> — {s < 0.5 ? "todo a velocidad humana" : "build a velocidad de agente"}
          </div>
          <div style={{ position: "relative", height: 2 * ROW_H + GAP, marginTop: 14 }}>
            {box(0, 0, W.Plan, "Plan", hlPlan > 0.5, { transform: `scale(${1 + 0.06 * hlPlan})` })}
            {box(W.Plan + GAP, 0, W.Design, "Design", false)}
            <div
              style={{
                position: "absolute",
                left: W.Plan + W.Design + 2 * GAP,
                top: 0,
                width: buildW,
                height: ROW_H,
                borderRadius: lerp(12, 8, s),
                background: CLAY,
                color: "#fff",
                fontFamily: sans,
                fontSize: 23,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <span style={{ opacity: 1 - s * 3 }}>Build</span>
            </div>
            {lower.map(([name, x0, x1]) => box(lerp(x0, x1, climb), lerp(ROW_H + GAP, 0, climb), W[name], name, false))}
            {/* The emptied second row = cycle time reclaimed */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: ROW_H + GAP,
                height: ROW_H,
                border: "3px dashed #B9B6AC",
                borderRadius: 12,
                boxSizing: "border-box",
                opacity: saved,
                transform: `scale(${lerp(0.96, 1, saved)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: sans,
                fontSize: 24,
                color: C.muted,
              }}
            >
              tiempo recuperado
            </div>
          </div>
          <div style={{ marginTop: 14, fontFamily: sans, fontSize: 24, color: C.ink, opacity: hlPlan, height: 30 }}>
            El cuello de botella ahora es <b style={{ color: C.accent }}>definir bien la idea</b>.
          </div>
        </Card>
      </In>
      <Source t={t} at={42.8} style={{ marginTop: 12, justifyContent: "center", color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }} />
    </Top>
  );
};

/* ---------- P7 (CARD): non-devs now cover what devs care about ---------- */
const CHECKS: Array<{ icon: React.ElementType; text: string; at: number; bg: string; color: string }> = [
  { icon: User, text: "Usuarios y sistemas afectados", at: 48.8, bg: C.blueBg, color: C.blue },
  { icon: ShieldCheck, text: "Restricciones desde el inicio", at: 51.4, bg: C.amberBg, color: C.amber },
  { icon: Eye, text: "Nada pasa desapercibido", at: 52.7, bg: C.violetBg, color: C.violet },
  { icon: CircleHelp, text: "Preguntas abiertas a la vista", at: 53.2, bg: C.chip, color: "#5E5C55" },
];
export const VIABLE_AT = 54.3;
export const CoveragePiece: React.FC<{ t: number }> = ({ t }) => (
  <Panel gap={12}>
    <In t={t} at={45.9} x={-20} y={0}>
      <div style={{ fontFamily: serif, fontSize: 44, fontWeight: 500, color: C.ink, letterSpacing: -1.2, lineHeight: 1.05 }}>
        Lo que un dev preguntaría,
        <br />
        <span style={{ fontFamily: serifItalic, color: C.accent }}>ya viene resuelto</span>
      </div>
    </In>
    {CHECKS.map(({ icon: Icon, text, at, bg, color }, i) => (
      <In key={text} t={t} at={at} x={-50} y={0} dur={0.5}>
        <Card style={{ display: "flex", alignItems: "center", gap: 18, padding: "11px 20px", borderRadius: 22, transform: `translateY(${float(t, i, 2)}px)` }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={30} color={color} />
          </div>
          <div style={{ flex: 1, fontFamily: sans, fontSize: 28, color: C.ink, fontWeight: 500 }}>{text}</div>
          <Check size={34} color={C.green} strokeWidth={3} style={{ opacity: ease(t, at + 0.25, 0.3) }} />
        </Card>
      </In>
    ))}
    <In t={t} at={VIABLE_AT} scale={0.6} y={0} style={{ alignSelf: "flex-start" }}>
      <Badge bg={C.greenBg} color={C.green} style={{ fontWeight: 700, fontSize: 28 }}>✓ Idea viable</Badge>
    </In>
  </Panel>
);

/* ---------- P8 (CARD): read the article — image + title ---------- */
export const IMAGE_AT = 61.1;
export const TITLE_AT = 61.6;
export const EndPiece: React.FC<{ t: number }> = ({ t }) => {
  const kb = 1 + prog(t, 55.6, 64) * 0.05;
  return (
    <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: 262, display: "flex", flexDirection: "column", gap: 16 }}>
      <In t={t} at={55.8} x={-20} y={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ArticleLogo size={64} t={t} at={56.0} />
          <div style={{ fontFamily: serif, fontSize: 48, fontWeight: 500, color: C.ink, letterSpacing: -1 }}>Léelo completo</div>
          <Badge bg={C.chip} style={{ fontSize: 24 }}>claude.com/blog</Badge>
        </div>
      </In>
      <In t={t} at={Math.min(IMAGE_AT, 56.9)} scale={0.9} y={40} blur={12}>
        <Card style={{ padding: 16, borderRadius: 32, transform: `translateY(${float(t, 3, 3)}px)` }}>
          <div style={{ borderRadius: 20, overflow: "hidden", height: 330, background: "#F0EEE6" }}>
            <Img src={staticFile("sdlc-loop.png")} style={{ width: "100%", height: "100%", objectFit: "contain", transform: `scale(${kb * (1 + 0.04 * pop(t, IMAGE_AT, { damping: 9, stiffness: 280 }) * (1 - prog(t, IMAGE_AT + 0.3, IMAGE_AT + 0.7)))})` }} />
          </div>
          <div style={{ padding: "16px 8px 6px" }}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 44,
                fontWeight: 500,
                color: C.ink,
                letterSpacing: -1,
                lineHeight: 1.05,
                backgroundImage: "linear-gradient(rgba(217,119,87,0.26), rgba(217,119,87,0.26))",
                backgroundRepeat: "no-repeat",
                backgroundSize: `${ease(t, TITLE_AT, 0.6) * 100}% 74%`,
                backgroundPosition: "0 58%",
                padding: "0 10px",
                margin: "0 -10px",
                borderRadius: 8,
                display: "inline",
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }}
            >
              The AI-Native SDLC playbook
            </div>
            <div style={{ fontFamily: sans, fontSize: 24, color: C.muted, marginTop: 8 }}>Louis Claxton · 21 ago 2026 · Imagen: Anthropic</div>
          </div>
        </Card>
      </In>
    </div>
  );
};
