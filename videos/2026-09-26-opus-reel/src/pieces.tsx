import React from "react";
import { Img, staticFile } from "remotion";
import { Check, X } from "lucide-react";
import logos from "./logos.json";
import { C, LAYOUT, SAFE, clamp01, lerp, mono, pop, prog, sans, serif, serifItalic, shadow } from "./theme";
import { Badge, Card, Caret, In, ease } from "./ui";

/* All pieces take ABSOLUTE time `t` (edited timeline, seconds); cue times come from captions.json.
   Card mode draws inside the panel (y 250..860). Full mode draws a top card (y 250..600). */

const Simple: React.FC<{ d: string; size: number; fill: string }> = ({ d, size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d={d} fill={fill} />
  </svg>
);
const ClaudeMark: React.FC<{ size: number }> = ({ size }) => <Simple d={logos.claude} size={size} fill={C.spark} />;

const Panel: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 24 }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE.side,
      right: SAFE.side,
      top: SAFE.top,
      height: LAYOUT.panelBottom - SAFE.top,
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

/** Gentle idle float so nothing sits dead still. */
const float = (t: number, seed: number, amp = 5) => Math.sin(t * 1.3 + seed * 1.7) * amp;

/* ---------- Hook (full): "editado con Opus 5.5" ---------- */
export const HookChip: React.FC<{ t: number }> = ({ t }) => (
  <Top>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <In t={t} at={2.7} y={-30} scale={0.9}>
        <Card style={{ padding: "22px 34px", display: "flex", alignItems: "center", gap: 22, borderRadius: 34 }}>
          <ClaudeMark size={62} />
          <div>
            <div style={{ fontFamily: sans, fontSize: 28, color: C.muted, fontWeight: 500 }}>Editado 100% con</div>
            <div style={{ fontFamily: serif, fontSize: 58, fontWeight: 500, color: C.ink, letterSpacing: -1.5, lineHeight: 1 }}>
              Claude Opus 5.5
            </div>
          </div>
        </Card>
      </In>
    </div>
  </Top>
);

/* ---------- P1 DMs (card) ---------- */
const DMS = [
  { f: "dm1.png", w: 702, x: 40, y: 360, r: -3 },
  { f: "dm2.png", w: 696, x: 300, y: 410, r: 2.5 },
  { f: "dm3.png", w: 697, x: 30, y: 560, r: 1.5 },
  { f: "dm6.png", w: 682, x: 330, y: 625, r: -2 },
  { f: "dm5.png", w: 611, x: 90, y: 700, r: 3 },
  { f: "dm7.png", w: 501, x: 470, y: 745, r: -1.5 },
  { f: "dm4.png", w: 685, x: 150, y: 450, r: -1 },
];
export const DM_TIMES = DMS.map((_, i) => 5.55 + i * 0.26);

export const DmsPiece: React.FC<{ t: number }> = ({ t }) => {
  const n = DM_TIMES.filter((a) => t >= a).length;
  const bump = n > 0 ? pop(t, DM_TIMES[n - 1], { damping: 9, stiffness: 320, mass: 0.4 }) : 0;
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: 262, display: "flex", alignItems: "center", gap: 18 }}>
        <In t={t} at={5.3} x={-30} y={0}>
          <div style={{ fontFamily: serif, fontSize: 62, fontWeight: 500, color: C.ink, letterSpacing: -1.5 }}>
            Me preguntaron…
          </div>
        </In>
        <In t={t} at={5.5} scale={0.6} y={0}>
          <Badge
            bg={C.redBg}
            color={C.red}
            style={{ fontWeight: 700, display: "inline-block", transform: `scale(${1 + 0.12 * Math.sin(Math.min(1, bump) * Math.PI)})` }}
          >
            {n} DMs
          </Badge>
        </In>
      </div>
      {DMS.map((d, i) => {
        const at = DM_TIMES[i];
        const p = ease(t, at, 0.55);
        const scale = Math.min(1, 560 / d.w) * (i === DMS.length - 1 ? 1.12 : 1);
        return (
          <div
            key={d.f}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y + float(t, i, 4),
              width: d.w * scale,
              opacity: ease(t, at, 0.25),
              transform: `translateY(${(1 - p) * 120}px) rotate(${d.r * p + (1 - p) * d.r * 3}deg) scale(${lerp(0.8, 1, p)})`,
              filter: p < 0.999 ? `blur(${(1 - p) * 8}px)` : undefined,
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 22px 60px rgba(0,0,0,0.30)",
              zIndex: i,
            }}
          >
            <Img src={staticFile(d.f)} style={{ width: "100%", display: "block" }} />
          </div>
        );
      })}
    </>
  );
};

/* ---------- P2 DotCSV (card) ---------- */
const QUOTE: Array<[string, number]> = [
  ["el", 15.8],
  ["mejor", 15.95],
  ["modelo", 16.2],
  ["de", 16.55],
  ["diseño", 16.7],
];
export const DotCsvPiece: React.FC<{ t: number }> = ({ t }) => {
  const hl = ease(t, 16.85, 0.5);
  const kb = 1 + prog(t, 10.8, 19.4) * 0.06;
  return (
    <div style={{ position: "absolute", left: 180, right: 180, top: 250, height: 610, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
      <In t={t} at={10.9} scale={0.88} y={50} blur={14}>
        <Card style={{ padding: 18, borderRadius: 36, transform: `translateY(${float(t, 2, 3)}px)` }}>
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden" }}>
            <Img src={staticFile("dotcsv-thumb.png")} style={{ width: "100%", display: "block", transform: `scale(${kb})` }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 8px 6px" }}>
            <Simple d={logos.youtube} size={52} fill="#FF0000" />
            <In t={t} at={12.85} x={-16} y={0} dur={0.5}>
              <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 38, color: C.ink }}>DotCSV</div>
            </In>
            <div style={{ flex: 1 }} />
            <In t={t} at={17.45} scale={0.6} y={0}>
              <Badge bg={C.amberBg} color={C.amber} style={{ fontWeight: 600 }}>
                Excelente gusto
              </Badge>
            </In>
          </div>
        </Card>
      </In>
      <div style={{ fontFamily: serifItalic, fontSize: 48, color: C.ink, lineHeight: 1.2, textAlign: "center", minHeight: 58 }}>
        {QUOTE.map(([w, at], i) => {
          const p = ease(t, at, 0.45);
          const last = i === QUOTE.length - 1;
          return (
            <span
              key={w}
              style={{
                display: "inline-block",
                marginRight: 14,
                opacity: p,
                transform: `translateY(${(1 - p) * 18}px)`,
                filter: p < 0.999 ? `blur(${(1 - p) * 6}px)` : undefined,
                ...(last
                  ? {
                      backgroundImage: `linear-gradient(${C.amberBg}, ${C.amberBg})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${hl * 100}% 88%`,
                      backgroundPosition: "0 70%",
                      padding: "0 8px",
                      borderRadius: 8,
                    }
                  : {}),
              }}
            >
              {i === 0 ? "“" : ""}
              {w}
              {last ? "”" : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- P3 Terminal (full, top card) ---------- */
const PROMPT = "Por favor, edita este video";
export const TYPE_AT = 20.45;
export const TYPE_CPS = 21;
export const PROMPT_LEN = PROMPT.length;
// After typing, the Claude visual guide drops in large, then shrinks into an attachment chip.
export const GUIDE_AT = TYPE_AT + PROMPT.length / TYPE_CPS + 0.1;
export const GUIDE_DOCK = GUIDE_AT + 0.75;
export const SEND_AT = GUIDE_DOCK + 0.3;
const GUIDE_BIG = { x: 190, y: 20, w: 520 };
const GUIDE_CHIP = { x: 652, y: 76, w: 70 };
const GUIDE_RATIO = 929 / 1475;

const GuideFly: React.FC<{ t: number }> = ({ t }) => {
  if (t < GUIDE_AT || t > GUIDE_DOCK + 0.5) return null;
  const inP = ease(t, GUIDE_AT, 0.5);
  const dock = ease(t, GUIDE_DOCK, 0.45);
  const w = lerp(GUIDE_BIG.w, GUIDE_CHIP.w, dock);
  const x = lerp(GUIDE_BIG.x, GUIDE_CHIP.x, dock);
  const y = lerp(GUIDE_BIG.y + (1 - inP) * 140, GUIDE_CHIP.y, dock);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        opacity: ease(t, GUIDE_AT, 0.25) * (1 - clamp01((t - GUIDE_DOCK - 0.35) / 0.1)),
        transform: `scale(${lerp(0.85, 1, inP)}) rotate(${lerp(-3, 0, dock)}deg)`,
        filter: inP < 0.999 ? `blur(${(1 - inP) * 10}px)` : undefined,
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: lerp(26, 8, dock),
          overflow: "hidden",
          border: `${lerp(6, 2, dock)}px solid #fff`,
          boxShadow: `0 ${lerp(30, 4, dock)}px ${lerp(80, 10, dock)}px rgba(0,0,0,0.35)`,
        }}
      >
        <Img src={staticFile("claude-guide.png")} style={{ width: "100%", height: w * GUIDE_RATIO, display: "block", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 18, top: -26, opacity: 1 - dock * 3 }}>
        <Badge bg={C.ink} color="#fff" style={{ fontWeight: 600, fontSize: 28 }}>
          Guía visual de Claude
        </Badge>
      </div>
    </div>
  );
};

export const TerminalPiece: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.max(0, Math.min(PROMPT.length, Math.floor((t - TYPE_AT) * TYPE_CPS)));
  const sent = t >= SEND_AT;
  const work = clamp01((t - SEND_AT) / 0.9);
  const spin = ["✻", "✳", "✢", "·", "✢", "✳"][Math.floor(t * 10) % 6];
  return (
    <Top>
      <In t={t} at={19.45} scale={0.92} y={-40} blur={12}>
        <div style={{ background: "#1F1E1D", borderRadius: 30, boxShadow: "0 30px 80px rgba(0,0,0,0.35)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: "#2A2927" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
            ))}
            <div style={{ flex: 1, textAlign: "center", fontFamily: sans, fontSize: 24, color: "#8C8A82", marginRight: 60 }}>
              ~/video — claude
            </div>
          </div>
          <div style={{ padding: "24px 30px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <ClaudeMark size={46} />
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 34, color: "#F4F1EA" }}>Claude Code</div>
              <Badge bg="#3A3835" color="#D8D4CA" style={{ fontSize: 26, padding: "6px 16px" }}>
                Opus 5.5
              </Badge>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 6,
                  paddingRight: 16,
                  borderRadius: 12,
                  background: "#2E2D2B",
                  border: "2px solid #4A4844",
                  opacity: t >= GUIDE_DOCK + 0.3 ? 1 : 0,
                  transform: `scale(${1 + 0.08 * Math.sin(Math.min(1, pop(t, GUIDE_DOCK + 0.3, { damping: 9, stiffness: 300 })) * Math.PI)})`,
                }}
              >
                <Img src={staticFile("claude-guide.png")} style={{ width: 70, height: 44, objectFit: "cover", borderRadius: 6, display: "block" }} />
                <div style={{ fontFamily: sans, fontSize: 24, color: "#D8D4CA", fontWeight: 500 }}>guía visual</div>
              </div>
            </div>
            <div
              style={{
                border: `2px solid ${sent ? "#4A4844" : "#6A6760"}`,
                borderRadius: 16,
                padding: "18px 22px",
                fontFamily: mono,
                fontSize: 34,
                color: "#F4F1EA",
                display: "flex",
                alignItems: "center",
                height: 76,
                boxSizing: "border-box",
              }}
            >
              <span style={{ color: C.spark, marginRight: 14 }}>&gt;</span>
              {sent ? <span style={{ color: "#8C8A82" }}>{PROMPT}</span> : PROMPT.slice(0, n)}
              {!sent && <Caret t={t} h={38} />}
            </div>
            <div style={{ height: 34, display: "flex", alignItems: "center", gap: 14, fontFamily: mono, fontSize: 26, opacity: ease(t, SEND_AT, 0.3) }}>
              <span style={{ color: C.spark, width: 26 }}>{spin}</span>
              <span style={{ color: "#D8D4CA" }}>Editando video…</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#3A3835", overflow: "hidden" }}>
                <div style={{ width: `${work * 100}%`, height: "100%", background: C.spark }} />
              </div>
            </div>
          </div>
        </div>
      </In>
      <GuideFly t={t} />
    </Top>
  );
};

/* ---------- P4 Tools (card) ---------- */
type Tool = { name: string; desc: string; logo: React.ReactNode; tag: string; tagAt: number; tagBg: string; tagColor: string; at: number };
const TOOLS: Tool[] = [
  { name: "Whisper", desc: "Transcribe el audio", logo: <Simple d={logos.openai} size={62} fill="#000" />, tag: "Gratis · local", tagAt: 27.3, tagBg: C.greenBg, tagColor: C.green, at: 26.2 },
  { name: "FFmpeg", desc: "Convierte y corta el video", logo: <Simple d={logos.ffmpeg} size={62} fill="#007808" />, tag: "Open source", tagAt: 32.2, tagBg: C.chip, tagColor: "#5E5C55", at: 31.0 },
  { name: "Remotion", desc: "Edición de video con código", logo: <Img src={staticFile("remotion.png")} style={{ width: 58 }} />, tag: "React", tagAt: 39.5, tagBg: C.blueBg, tagColor: C.blue, at: 36.9 },
];
export const TOOL_TIMES = TOOLS.map((x) => x.at);
export const ToolsPiece: React.FC<{ t: number }> = ({ t }) => {
  const active = TOOLS.reduce((a, x, i) => (t >= x.at ? i : a), -1);
  return (
    <Panel>
      <In t={t} at={24.3} x={-24} y={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
          <ClaudeMark size={44} />
          <div style={{ fontFamily: serif, fontSize: 50, fontWeight: 500, color: C.ink, letterSpacing: -1 }}>Lo que usó Claude</div>
        </div>
      </In>
      {TOOLS.map((tool, i) => {
        const on = i === active;
        // Once the next tool is named, this one steps back.
        const next = TOOLS[i + 1]?.at ?? Infinity;
        const dim = ease(t, next, 0.5);
        const glow = on ? ease(t, tool.at, 0.4) : 1 - dim;
        return (
          <In key={tool.name} t={t} at={tool.at} x={-70} y={0} scale={0.94}>
            <Card
              style={{
                padding: "22px 28px",
                display: "flex",
                alignItems: "center",
                gap: 26,
                borderRadius: 32,
                border: `2px solid ${glow > 0.5 ? C.spark : C.border}`,
                opacity: 1 - dim * 0.4,
                transform: `scale(${1 - dim * 0.03})`,
              }}
            >
              <div style={{ width: 96, height: 96, borderRadius: 26, background: C.bg, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tool.logo}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: serif, fontSize: 48, fontWeight: 500, color: C.ink, letterSpacing: -1 }}>{tool.name}</div>
                <div style={{ fontFamily: sans, fontSize: 29, color: C.muted, marginTop: 2 }}>{tool.desc}</div>
              </div>
              <In t={t} at={tool.tagAt} scale={0.5} y={0} dur={0.5}>
                <Badge bg={tool.tagBg} color={tool.tagColor} style={{ fontSize: 26, fontWeight: 600 }}>
                  {tool.tag}
                </Badge>
              </In>
            </Card>
          </In>
        );
      })}
    </Panel>
  );
};

/* ---------- Ask again (full, top card) ---------- */
export const ASK_TIMES = [41.05, 43.15];
export const AskPiece: React.FC<{ t: number }> = ({ t }) => (
  <Top>
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <In t={t} at={ASK_TIMES[0]} x={40} y={0} style={{ alignSelf: "flex-end" }}>
        <div style={{ background: C.ink, color: "#fff", fontFamily: sans, fontWeight: 500, fontSize: 38, padding: "22px 30px", borderRadius: "32px 32px 8px 32px", boxShadow: shadow }}>
          ¿Es la mejor solución?
        </div>
      </In>
      <In t={t} at={ASK_TIMES[1]} x={-40} y={0} style={{ alignSelf: "flex-start" }}>
        <Card style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 28px", borderRadius: "32px 32px 32px 8px" }}>
          <ClaudeMark size={46} />
          <div style={{ fontFamily: sans, fontSize: 36, color: C.ink, fontWeight: 500 }}>Hay otras geniales, pero esta funciona</div>
        </Card>
      </In>
    </div>
  </Top>
);

/* ---------- P5 Captions fix (card) ---------- */
export const FIX_AT = 48.75;
export const CaptionsFixPiece: React.FC<{ t: number }> = ({ t }) => {
  const move = pop(t, FIX_AT, { damping: 14, stiffness: 150 });
  const W = 330;
  const H = 586;
  const capY = lerp(H * 0.34, H * 0.8, move);
  const ok = t >= FIX_AT + 0.15;
  const shake = !ok && t > 47.3 ? Math.sin(t * 60) * 5 * clamp01((FIX_AT - t) * 2) : 0;
  const okPop = ok ? Math.sin(Math.min(1, pop(t, FIX_AT + 0.15, { damping: 8, stiffness: 300 })) * Math.PI) : 0;
  return (
    <div style={{ position: "absolute", left: 110, right: 90, top: 250, height: 610, display: "flex", alignItems: "center", gap: 54 }}>
      <In t={t} at={45.9} scale={0.9} y={40}>
        <div style={{ position: "relative", width: W, height: H, borderRadius: 46, overflow: "hidden", border: "8px solid #141413", boxShadow: "0 30px 70px rgba(0,0,0,0.3)" }}>
          <Img src={staticFile("cam.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: capY, display: "flex", justifyContent: "center", transform: `translateX(${shake}px)` }}>
            <div style={{ background: "rgba(255,255,255,0.96)", borderRadius: 14, padding: "8px 16px", fontFamily: sans, fontWeight: 700, fontSize: 26, color: C.ink }}>
              subtítulos <span style={{ color: C.accent }}>aquí</span>
            </div>
          </div>
          {!ok && (
            <div style={{ position: "absolute", left: W * 0.14, right: W * 0.14, top: H * 0.31, height: 64, border: `4px dashed ${C.red}`, borderRadius: 16, opacity: ease(t, 46.9, 0.3) }} />
          )}
        </div>
      </In>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
        <In t={t} at={46.2} x={-20} y={0}>
          <div style={{ fontFamily: serif, fontSize: 60, fontWeight: 500, color: C.ink, letterSpacing: -1.5, lineHeight: 1.05 }}>Subtítulos</div>
        </In>
        <In t={t} at={46.9} scale={0.7} y={0}>
          <Badge
            bg={ok ? C.greenBg : C.redBg}
            color={ok ? C.green : C.red}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 32, fontWeight: 600, transform: `scale(${1 + 0.1 * okPop})` }}
          >
            {ok ? <Check size={30} /> : <X size={30} />}
            {ok ? "Corregido" : "Tapan la cara"}
          </Badge>
        </In>
      </div>
    </div>
  );
};

/* ---------- P6 Timer (full, top card) ---------- */
export const COUNT_AT = 51.95;
export const COUNT_END = 52.85;
export const TimerPiece: React.FC<{ t: number }> = ({ t }) => {
  const p = ease(t, COUNT_AT, COUNT_END - COUNT_AT + 0.25);
  const minutes = Math.round(p * 30);
  const R = 92;
  const circ = 2 * Math.PI * R;
  const land = pop(t, COUNT_END, { damping: 8, stiffness: 260, mass: 0.5 });
  const bump = 1 + 0.08 * Math.sin(Math.min(1, land) * Math.PI);
  return (
    <Top>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <In t={t} at={49.8} scale={0.9} y={-36}>
          <Card style={{ display: "flex", alignItems: "center", gap: 36, padding: "26px 44px 26px 30px", borderRadius: 40 }}>
            <div style={{ position: "relative", width: 230, height: 230, transform: `scale(${bump})` }}>
              <svg width={230} height={230} viewBox="-115 -115 230 230">
                <circle r={R} fill="none" stroke={C.border} strokeWidth={20} />
                <circle r={R} fill="none" stroke={C.spark} strokeWidth={20} strokeLinecap="round" strokeDasharray={`${circ * p * 0.5} ${circ}`} transform="rotate(-90)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontSize: 96, fontWeight: 500, color: C.ink, letterSpacing: -3 }}>
                {minutes}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: sans, fontSize: 34, color: C.muted, fontWeight: 500 }}>Solo</div>
              <div style={{ fontFamily: serif, fontSize: 84, fontWeight: 500, color: C.ink, letterSpacing: -2, lineHeight: 1 }}>minutos</div>
              <In t={t} at={COUNT_END - 0.05} scale={0.6} y={0} dur={0.45}>
                <Badge bg={C.greenBg} color={C.green} style={{ fontWeight: 600, display: "inline-block", marginTop: 12 }}>
                  Todo el video
                </Badge>
              </In>
            </div>
          </Card>
        </In>
      </div>
    </Top>
  );
};

/* ---------- P7 CTA (card) ---------- */
export const CtaPiece: React.FC<{ t: number }> = ({ t }) => {
  const shine = prog(t, 55.2, 56.2);
  return (
    <Panel gap={40}>
      <div style={{ fontFamily: serif, fontSize: 92, fontWeight: 500, color: C.ink, textAlign: "center", lineHeight: 1.05, letterSpacing: -2.5 }}>
        <In t={t} at={53.4} y={30}>
          ¿Y tú qué
        </In>
        <In t={t} at={53.95} y={30}>
          <span style={{ fontFamily: serifItalic, color: C.accent }}>esperas?</span>
        </In>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <In t={t} at={54.5} scale={0.85} y={30}>
          <Card
            style={{
              position: "relative",
              overflow: "hidden",
              padding: "26px 40px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              borderRadius: 999,
              transform: `translateY(${float(t, 4, 4)}px)`,
            }}
          >
            <ClaudeMark size={56} />
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 42, color: C.ink }}>Pruébalo con Claude Code</div>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 120,
                left: `${lerp(-20, 120, shine)}%`,
                background: "linear-gradient(100deg, transparent, rgba(217,119,87,0.18), transparent)",
              }}
            />
          </Card>
        </In>
      </div>
    </Panel>
  );
};
