import React from "react";
import { Img, staticFile } from "remotion";
import {
  ArrowUp,
  BatteryFull,
  Bot,
  Check,
  Coins,
  Cpu,
  FileText,
  Flag,
  Flame,
  Globe,
  HardDrive,
  LayoutGrid,
  Moon,
  MousePointer2,
  Plus,
  SlidersHorizontal,
  Sun,
  Target,
  Wifi,
  Workflow,
  Wrench,
} from "lucide-react";
import { OpenAILogo } from "./Logos";
import { C, LAYOUT, PASTEL, SAFE, lerp, mono, pop, prog, sans, serif, serifItalic, shadow, typed } from "./theme";
import { Badge, Card, In, IconTile, Pop, Spark, ease } from "./ui";

/* Every piece takes ABSOLUTE time `t` (edited timeline, seconds). Cue times are read straight off
   captions.json so sound and picture never drift. Visual language: cut out of the real Claude UI —
   white menu cards with pastel icon tiles, gray chips, a gliding hover block, the input box, one
   shared arrow cursor. Cue constants are re-exported so Sfx.tsx never duplicates a number. */

export const CLAY = "#D97757"; // Claude's spark, used only next to the word Claude
export const INK = "#141413";

const Top: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = SAFE.top }) => (
  <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top }}>{children}</div>
);

const Panel: React.FC<{ children: React.ReactNode; gap?: number; top?: number }> = ({ children, gap = 22, top = SAFE.top }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE.side,
      right: SAFE.side,
      top,
      height: LAYOUT.panelBottom - top - 30,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap,
    }}
  >
    {children}
  </div>
);

/** Thin clay text-height highlight, like a highlighter stroke behind a line of text. */
const Highlight: React.FC<{ p: number; style?: React.CSSProperties }> = ({ p, style }) => (
  <span
    style={{
      position: "absolute",
      left: -8,
      right: -8,
      top: "16%",
      height: "68%",
      background: CLAY,
      opacity: 0.22 * p,
      borderRadius: 6,
      transform: `scaleX(${p})`,
      transformOrigin: "left center",
      ...style,
    }}
  />
);

/** Pastel icon tile lifted from the real Claude UI dropdown. */
const PastelTile: React.FC<{ icon: React.ElementType; tone: keyof typeof PASTEL; size?: number; radius?: number }> = ({ icon, tone, size = 64, radius }) => (
  <IconTile icon={icon} bg={PASTEL[tone].bg} color={PASTEL[tone].color} size={size} radius={radius ?? size * 0.25} />
);

/** Large macOS-style arrow cursor, reused everywhere a click or hover is cued. */
export const Cursor: React.FC<{ x: number; y: number; press?: number; size?: number }> = ({ x, y, press = 0, size = 72 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${1 - 0.12 * Math.sin(Math.min(1, press) * Math.PI)})`,
      filter: "drop-shadow(0 10px 16px rgba(20,20,19,0.28))",
    }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M4 2.4 L4 19.6 L8.7 15.4 L11.8 21.7 L14.6 20.3 L11.6 14.1 L18.3 14.1 Z"
        fill="#fff"
        stroke={C.ink}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    {press > 0.02 && press < 0.97 && (
      <div
        style={{
          position: "absolute",
          left: size * -0.2,
          top: size * -0.2,
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: "50%",
          border: "2px solid rgba(20,20,19,0.35)",
          opacity: 1 - press,
        }}
      />
    )}
  </div>
);

/** A row of the Claude-UI menu component. */
type MenuRow = { at: number; tile: React.ReactNode; label: React.ReactNode; chip?: React.ReactNode };
const ROW_H = 96;

/** White card of menu rows with a hover block that glides between them, like the real dropdown.
 *  `hoverAt[i]` is when the cursor (and the hover highlight) arrives at row `i`. */
const Menu: React.FC<{ t: number; width: number; rows: MenuRow[]; hoverAt?: number[]; style?: React.CSSProperties }> = ({ t, width, rows, hoverAt = [], style }) => {
  // Don't paint the empty white card before the first row is due.
  if (t < rows[0].at - 0.15) return null;
  const containerP = ease(t, rows[0].at - 0.1, 0.35);

  let hoverY = -ROW_H;
  for (let i = 0; i < hoverAt.length; i++) {
    if (t >= hoverAt[i]) {
      const from = i === 0 ? -ROW_H : (i - 1) * ROW_H;
      const p = ease(t, hoverAt[i], 0.45);
      hoverY = lerp(from, i * ROW_H, p);
    }
  }
  const hovering = hoverAt.some((a) => t >= a);
  return (
    <div style={{ position: "relative", width, opacity: containerP, transform: `scale(${lerp(0.97, 1, containerP)})` }}>
      <Card style={{ width, borderRadius: 36, overflow: "hidden", position: "relative", ...style }}>
        {hovering && <div style={{ position: "absolute", left: 10, right: 10, top: hoverY + 6, height: ROW_H - 12, borderRadius: 22, background: "#F4F3EE" }} />}
        {rows.map((row, i) => {
          const p = ease(t, row.at, 0.5);
          return (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ height: 1.5, background: "#EAE8E1", marginLeft: 28, marginRight: 28 }} />}
              <div
                style={{
                  position: "relative",
                  height: ROW_H,
                  padding: "0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 14}px)`,
                  filter: p < 0.999 ? `blur(${(1 - p) * 6}px)` : undefined,
                }}
              >
                {row.tile}
                <div style={{ flexShrink: 0, fontFamily: sans, fontWeight: 500, fontSize: 40, color: C.ink, whiteSpace: "nowrap" }}>{row.label}</div>
                <div style={{ flex: 1 }} />
                {row.chip}
              </div>
            </React.Fragment>
          );
        })}
      </Card>
      {/* Sibling of the (clipped) card, resting just below-right of the hovered row's edge. */}
      {hovering && <Cursor x={width - 56} y={hoverY + ROW_H - 14} />}
    </div>
  );
};

/** The Claude-UI input box: placeholder / typed text, a "+" left, a round send button right. */
export const InputBox: React.FC<{
  width?: number;
  placeholder: string;
  typedText?: string;
  sendActive?: boolean;
  sendPulse?: number;
  style?: React.CSSProperties;
}> = ({ width = 820, placeholder, typedText, sendActive = false, sendPulse = 0, style }) => (
  <Card style={{ width, borderRadius: 40, padding: "34px 36px 26px", boxSizing: "border-box", ...style }}>
    <div style={{ fontFamily: sans, fontSize: 38, color: typedText ? C.ink : C.placeholder, minHeight: 48, whiteSpace: "nowrap", overflow: "hidden" }}>{typedText || placeholder}</div>
    <div style={{ display: "flex", alignItems: "center", marginTop: 26 }}>
      <Plus size={32} color={C.ink} strokeWidth={1.75} />
      <div style={{ flex: 1 }} />
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          background: sendActive ? CLAY : C.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 + 0.16 * Math.sin(Math.min(1, sendPulse) * Math.PI)})`,
        }}
      >
        <ArrowUp size={30} color="#fff" strokeWidth={2.2} />
      </div>
    </div>
  </Card>
);

/* =======================================================================================
   P1 · EventFlyer — CARD, 1.30–11.60 (the real event flyer, then the "Workflows" menu row)
   ======================================================================================= */
export const FLYER_AT = 1.4;
export const FLYER_LEFT_AT = 5.08;
export const FAN_AT = 5.72;
export const MENU_AT = 7.39;
export const MENU_HOVER_AT = 7.72;
export const STAT_AT = 8.82;

// Peek out from behind the flyer's final (small) position, like a tilted pile of photos:
// same rough center, each rotated a different amount so corners show past the flyer's edges.
const FLYER_CENTER_X = 90 + (470 * 0.64) / 2; // 240.4
const FLYER_CENTER_Y = 290 + (588 * 0.64) / 2; // 478.2
const FAN_W = 236;
const FAN_H = 300;
const FAN_ROT = [-11, -3, 8];
const FAN_DX = [-16, 8, 28];
const FAN_DY = [-18, 10, -8];
const FanCards: React.FC<{ t: number }> = ({ t }) => (
  <>
    {FAN_ROT.map((rot, i) => {
      const p = ease(t, FAN_AT + i * 0.08, 0.5);
      const left = FLYER_CENTER_X - FAN_W / 2 + FAN_DX[i];
      const top = FLYER_CENTER_Y - FAN_H / 2 + FAN_DY[i];
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left,
            top,
            width: FAN_W,
            height: FAN_H,
            opacity: p,
            transform: `translateY(${(1 - p) * 20}px) rotate(${rot}deg)`,
            filter: p < 0.999 ? `blur(${(1 - p) * 6}px)` : undefined,
            zIndex: i,
          }}
        >
          <Card style={{ width: FAN_W, height: FAN_H, padding: "22px 22px", borderRadius: 24, boxSizing: "border-box" }}>
            <div style={{ height: 22, borderRadius: 6, background: C.border, marginBottom: 18 }} />
            {[0.85, 0.6, 0.72, 0.5].map((w, j) => (
              <div key={j} style={{ height: 13, width: `${w * 100}%`, borderRadius: 7, background: C.chip, marginBottom: 12 }} />
            ))}
          </Card>
        </div>
      );
    })}
  </>
);

const StatCard: React.FC<{ t: number; at: number; width: number }> = ({ t, at, width }) => {
  const p = ease(t, at, 0.5);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 16}px) scale(${lerp(0.94, 1, p)})` }}>
      <Card style={{ width, padding: "24px 32px", borderRadius: 32, display: "flex", alignItems: "center", gap: 24, boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
          <svg width={120} height={120}>
            <circle cx={60} cy={60} r={50} fill="none" stroke={C.chip} strokeWidth={11} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontSize: 64, fontWeight: 500, color: C.ink }}>0</div>
        </div>
        <span style={{ fontFamily: sans, fontSize: 34, fontWeight: 500, color: C.muted }}>lo aplican</span>
      </Card>
    </div>
  );
};

export const EventFlyer: React.FC<{ t: number }> = ({ t }) => {
  const shrink = ease(t, FLYER_LEFT_AT, 0.7);
  const enter = ease(t, FLYER_AT, 0.6);
  const kb = 1 + 0.04 * Math.min(1, Math.max(0, (t - FLYER_AT) / 8));
  const bigW = 470;
  const bigH = 588;
  const smallW = bigW * 0.64;
  const smallH = bigH * 0.64;
  const w = lerp(bigW, smallW, shrink);
  const h = lerp(bigH, smallH, shrink);
  const left = lerp((1080 - bigW) / 2, 90, shrink);
  const top = lerp(256, 290, shrink);
  const rot = lerp(-2, -3, shrink);

  return (
    <>
      <FanCards t={t} />
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: w,
          height: h,
          opacity: enter,
          transform: `rotate(${rot}deg) scale(${lerp(0.9, 1, enter)})`,
          filter: enter < 0.999 ? `blur(${(1 - enter) * 14}px)` : undefined,
          zIndex: 10,
        }}
      >
        <div style={{ background: "#fff", borderRadius: 28, padding: 10, boxShadow: "0 30px 70px rgba(20,20,19,0.22)", width: "100%", height: "100%", boxSizing: "border-box" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 20, overflow: "hidden" }}>
            <Img src={staticFile("event-build-with-claude-lima.png")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${kb})` }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 430, top: 300, width: 560 }}>
        <Menu
          t={t}
          width={560}
          rows={[
            {
              at: MENU_AT,
              tile: <PastelTile icon={Workflow} tone="purple" />,
              label: "Workflows",
              chip: (
                <Badge style={{ fontSize: 24 }}>Multiagente</Badge>
              ),
            },
          ]}
          hoverAt={[MENU_HOVER_AT]}
        />
      </div>
      <div style={{ position: "absolute", left: 430, top: 430, width: 560 }}>
        <StatCard t={t} at={STAT_AT} width={560} />
      </div>
    </>
  );
};

/* =======================================================================================
   P3 · TokenTradeoff — FULL, top card, 11.85–15.10
   ======================================================================================= */
export const TOKENS_AT = 13.25;
export const RESULTS_AT = 14.5;
export const RESULTS_CHECK_AT = 14.87;
const TOKENS_CHIP_POP_AT = 13.55;

export const TokenTradeoff: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center" }}>
    <In t={t} at={11.85} y={-24} scale={0.94}>
      <Menu
        t={t}
        width={900}
        rows={[
          {
            at: TOKENS_AT,
            tile: <PastelTile icon={Coins} tone="orange" />,
            label: "Tokens",
            chip: (
              <Pop t={t} at={TOKENS_CHIP_POP_AT} from="scale">
                <Badge bg="#F9EBDD" color="#B8741F">
                  Muchos
                </Badge>
              </Pop>
            ),
          },
          {
            at: RESULTS_AT,
            tile: <PastelTile icon={Target} tone="green" />,
            label: "Resultados",
            chip: (
              <Pop t={t} at={RESULTS_CHECK_AT} from="scale">
                <Badge bg="#E6F2E8" color="#2F7D48">
                  Muy efectivos
                </Badge>
              </Pop>
            ),
          },
        ]}
      />
    </In>
  </div>
);

/* =======================================================================================
   P4 · WhatIsWorkflow — OFF (full canvas), 15.30–25.00
   ======================================================================================= */
const QUE_AT = 16.21;
const TILES_AT = 17.42;
const PULSE_START = 18.87;
const DURACION_AT = 19.24;
const H1_AT = 19.84;
const H2_AT = 20.52;
const HOLD_END = 20.9;
const H8_AT = 21.63;
const SHIMMER_AT = 22.0;
export const TOKENS_CHIP_AT = 22.9;
export const INPUT_RISE_AT = 23.51;
export const SEND_ARRIVE_AT = 24.14;
export const SEND_PRESS_AT = 24.72;

const AGENT_SIZE = 180;
const AGENT_GAP = 40; // 4*180 + 3*40 = 840 -> row spans x 120-960 exactly
const AGENT_COUNT = 4;
const ROW_TOP = 500;
const ROW_WIDTH = AGENT_COUNT * AGENT_SIZE + (AGENT_COUNT - 1) * AGENT_GAP;
const ROW_LEFT = 540 - ROW_WIDTH / 2;
const tileCx = (i: number) => ROW_LEFT + i * (AGENT_SIZE + AGENT_GAP) + AGENT_SIZE / 2;
const AGENT_TONES: Array<keyof typeof PASTEL> = ["blue", "orange", "purple", "green"];

const TITLE_WORDS: Array<[string, boolean]> = [["¿Qué", false], ["es", false], ["un", false], ["workflow?", true]];

const hoursAt = (t: number) => {
  if (t < DURACION_AT) return 0;
  if (t < H1_AT) return lerp(0, 1, ease(t, DURACION_AT, 0.55));
  if (t < H2_AT) return lerp(1, 2, ease(t, H1_AT, 0.5));
  if (t < HOLD_END) return 2;
  if (t < H8_AT) return lerp(2, 8, ease(t, HOLD_END, 0.55));
  return 8;
};

const PLAYER_LEFT = 140;
const PLAYER_RIGHT = 930;
const PLAYER_TOP = 860;

const AgentChain: React.FC<{ t: number }> = ({ t }) => {
  const draw = prog(t, 17.6, 18.2);
  const looping = t >= PULSE_START;
  const phase = looping ? ((t - PULSE_START) % 1.2) / 1.2 : 0;
  const pulseX = lerp(tileCx(0), tileCx(AGENT_COUNT - 1), phase);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: ROW_TOP, height: AGENT_SIZE + 20 }}>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width={1080} height={AGENT_SIZE}>
        {Array.from({ length: AGENT_COUNT - 1 }).map((_, i) => {
          const x1 = tileCx(i) + AGENT_SIZE / 2;
          const x2 = tileCx(i + 1) - AGENT_SIZE / 2;
          const len = x2 - x1;
          return <line key={i} x1={x1} y1={AGENT_SIZE / 2} x2={x2} y2={AGENT_SIZE / 2} stroke="#D6D3C8" strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />;
        })}
        {looping && <circle cx={pulseX} cy={AGENT_SIZE / 2} r={12} fill={CLAY} opacity={0.9} />}
      </svg>
      {Array.from({ length: AGENT_COUNT }).map((_, i) => {
        const p = pop(t, TILES_AT + i * 0.09, { damping: 11, stiffness: 220 });
        const dist = Math.abs(phase - i / (AGENT_COUNT - 1)) * (AGENT_COUNT - 1);
        const glow = looping ? Math.max(0, 1 - dist * 2.2) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: tileCx(i) - AGENT_SIZE / 2, top: 0, width: AGENT_SIZE, opacity: Math.min(1, p * 1.5), transform: `scale(${lerp(0.6, 1, Math.min(1, p))})` }}>
            <Card
              style={{
                width: AGENT_SIZE,
                height: AGENT_SIZE,
                borderRadius: 32,
                border: `1.5px solid ${glow > 0.5 ? CLAY : C.border}`,
                boxShadow: glow > 0.15 ? `0 0 ${26 * glow}px rgba(217,119,87,${0.55 * glow})` : shadow,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <PastelTile icon={Bot} tone={AGENT_TONES[i]} size={84} />
              <span style={{ fontFamily: sans, fontSize: 30, color: C.muted }}>Agente {i + 1}</span>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

const PlayerCard: React.FC<{ t: number }> = ({ t }) => {
  const appear = ease(t, DURACION_AT, 0.5);
  const hours = hoursAt(t);
  const w = PLAYER_RIGHT - PLAYER_LEFT;
  const landing = pop(t, H8_AT, { damping: 8, stiffness: 320, mass: 0.35 });
  const bump = hours >= 7.9 ? 1 + 0.1 * Math.sin(Math.min(1, landing) * Math.PI) : 1;
  const shimmerOn = t >= SHIMMER_AT;
  const chipP = pop(t, TOKENS_CHIP_AT, { damping: 12, stiffness: 220 });
  const roll = Math.max(0, Math.floor((t - TOKENS_CHIP_AT) * 1370));

  return (
    <div style={{ position: "absolute", left: PLAYER_LEFT, top: PLAYER_TOP, width: w, opacity: appear, transform: `translateY(${(1 - appear) * 16}px)` }}>
      <div style={{ position: "relative" }}>
        <Card style={{ padding: "30px 36px 32px", borderRadius: 32, boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: sans, fontSize: 30, color: C.muted }}>Duración</span>
            <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 52, color: C.ink, whiteSpace: "nowrap", transform: `scale(${bump})`, display: "inline-block" }}>{Math.round(hours)} h</span>
          </div>
          <div style={{ position: "relative", height: 18, borderRadius: 9, background: "#EFEEEA", marginTop: 22, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(hours / 8) * 100}%`,
                borderRadius: 9,
                background: CLAY,
                backgroundImage: shimmerOn
                  ? "repeating-linear-gradient(115deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 10px, transparent 10px, transparent 22px)"
                  : undefined,
                backgroundSize: "60px 100%",
                backgroundPositionX: shimmerOn ? -(t - SHIMMER_AT) * 90 : 0,
              }}
            />
          </div>
        </Card>
        {/* Sibling, not a child of the card, so nothing clips it. */}
        <div style={{ position: "absolute", right: 24, top: -22, opacity: Math.min(1, chipP * 1.5), transform: `scale(${lerp(0.7, 1, Math.min(1, chipP))})` }}>
          <Badge bg="#F9EBDD" color="#B8741F" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, whiteSpace: "nowrap" }}>
            <Flame size={22} /> {roll.toLocaleString("en-US")} tokens
          </Badge>
        </div>
      </div>
    </div>
  );
};

const BuildInput: React.FC<{ t: number }> = ({ t }) => {
  const rise = ease(t, INPUT_RISE_AT, 0.6);
  const cursorP = prog(t, INPUT_RISE_AT + 0.2, SEND_ARRIVE_AT);
  const press = pop(t, SEND_PRESS_AT, { damping: 8, stiffness: 300, mass: 0.3 });
  const width = 820;
  const left = (1080 - width) / 2;
  const top = 1100;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: rise, transform: `translateY(${(1 - rise) * 30}px) scale(${lerp(0.95, 1, rise)})` }}>
      <InputBox width={width} placeholder="¿Qué quieres construir?" sendActive={t >= SEND_PRESS_AT} sendPulse={Math.min(1, press)} />
      {cursorP > 0.001 && t < SEND_PRESS_AT + 0.4 && <Cursor x={left + width - 760} y={lerp(280, 118, cursorP)} press={press} />}
    </div>
  );
};

export const WhatIsWorkflow: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 22 }}>
      {TITLE_WORDS.map(([w, italic], i) => {
        const p = ease(t, QUE_AT + i * 0.06, 0.5);
        return (
          <span
            key={w}
            style={{
              opacity: p,
              transform: `translateY(${(1 - p) * 16}px)`,
              filter: p < 0.999 ? `blur(${(1 - p) * 8}px)` : undefined,
              fontFamily: italic ? serifItalic : serif,
              fontWeight: 500,
              fontSize: 92,
              color: italic ? CLAY : C.ink,
              letterSpacing: -2,
              whiteSpace: "nowrap",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
    <AgentChain t={t} />
    <PlayerCard t={t} />
    <BuildInput t={t} />
  </>
);

/* =======================================================================================
   P5 · Checklist — CARD, 25.30–36.80 and again 49.55–59.40 (persistent frame)
   ======================================================================================= */
const ITEM1_AT = 26.92;
export const ITEM2_AT = 32.4; // moved from 31.74 per the v2 correction
export const ITEM3_AT = 49.62;
export const SUB_AT = [29.47, 30.18, 31.28]; // Claude, ChatGPT, OpenCode hovers
const CODEX_TYPE_AT = 31.03;
const CLOCK_START_AT = 33.05;
const ENCENDIDA_AT = 34.77;
export const PLAN_DOC_AT = 51.0;
export const PLAN_STEP_AT = [55.81, 56.2, 56.74];
export const PLAN_AGENT_AT = 58.14;
export const PLAN_OBJECTIVE_AT = 58.58;
const PLAN_STEPS = ["Paso 1", "Paso 2", "Paso 3"];

const StepDots: React.FC<{ t: number }> = ({ t }) => {
  const current = t >= 49.55 ? 3 : t >= ITEM2_AT ? 2 : 1;
  return (
    <div style={{ display: "flex", gap: 14 }}>
      {[1, 2, 3].map((n) => {
        const done = n < current;
        const active = n === current;
        return (
          <div
            key={n}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: done ? C.green : active ? C.ink : "transparent",
              border: active || done ? "none" : `2px solid ${C.border}`,
            }}
          >
            {done ? <Check size={22} color="#fff" strokeWidth={3} /> : <span style={{ fontFamily: sans, fontSize: 20, fontWeight: 700, color: active ? "#fff" : C.faint }}>{n}</span>}
          </div>
        );
      })}
    </div>
  );
};

const ChecklistHeader: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 46 }}>
    <span style={{ fontFamily: serif, fontSize: 64, fontWeight: 500, color: C.ink, letterSpacing: -1 }}>Lo que necesitas</span>
    <StepDots t={t} />
  </div>
);

const ClaudeTile = () => (
  <div style={{ width: 64, height: 64, borderRadius: 16, background: PASTEL.clay.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Spark size={30} color={PASTEL.clay.color} />
  </div>
);
const InkOpenAITile = () => (
  <div style={{ width: 64, height: 64, borderRadius: 16, background: INK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <OpenAILogo size={30} color="#fff" />
  </div>
);
const OpenCodeTile = () => <Img src={staticFile("opencode-icon.png")} style={{ width: 64, height: 64, borderRadius: 16, flexShrink: 0 }} />;

const Item1: React.FC<{ t: number }> = ({ t }) => {
  const p = ease(t, ITEM1_AT, 0.5);
  return (
    <div style={{ opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
        <span style={{ fontFamily: serif, fontSize: 90, fontWeight: 500, color: C.accent }}>1</span>
        <span style={{ fontFamily: serif, fontSize: 48, fontWeight: 500, color: C.ink }}>Una suscripción grande</span>
      </div>
      <div style={{ marginTop: 46, display: "flex", justifyContent: "center" }}>
        <Menu
          t={t}
          width={840}
          rows={[
            { at: 28.37, tile: <ClaudeTile />, label: "Claude" },
            {
              at: 28.55,
              tile: <InkOpenAITile />,
              label: (
                <>
                  ChatGPT
                  {t >= CODEX_TYPE_AT && <span style={{ color: C.muted }}> · {typed("Codex", t, CODEX_TYPE_AT, 22)}</span>}
                </>
              ),
            },
            { at: 28.73, tile: <OpenCodeTile />, label: "OpenCode" },
          ]}
          hoverAt={SUB_AT}
        />
      </div>
    </div>
  );
};

const formatClock = (secs: number) => {
  const s = Math.max(0, Math.min(28799, Math.floor(secs)));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const Item2: React.FC<{ t: number }> = ({ t }) => {
  const p = ease(t, ITEM2_AT, 0.5);
  const running = t >= CLOCK_START_AT;
  // Accelerated fake clock: reaches ~07:59:00 by 36.4s, per the spec.
  const elapsed = running ? Math.min(28799, (t - CLOCK_START_AT) * ((7 * 3600 + 59 * 60) / (36.4 - CLOCK_START_AT))) : 0;
  const encendida = ease(t, ENCENDIDA_AT, 0.4);
  return (
    <div style={{ opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
        <span style={{ fontFamily: serif, fontSize: 90, fontWeight: 500, color: C.accent }}>2</span>
        <span style={{ fontFamily: serif, fontSize: 48, fontWeight: 500, color: C.ink }}>La PC encendida</span>
      </div>
      <div style={{ position: "relative", margin: "58px auto 0", width: 840 }}>
        <div style={{ borderRadius: 32, overflow: "hidden", background: "#1F1E1D", boxShadow: "0 20px 50px rgba(0,0,0,0.28)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 26px", background: "#282725" }}>
            <div style={{ display: "flex", gap: 9 }}>
              <div style={{ width: 15, height: 15, borderRadius: 8, background: "#E4574C" }} />
              <div style={{ width: 15, height: 15, borderRadius: 8, background: "#E8B23D" }} />
              <div style={{ width: 15, height: 15, borderRadius: 8, background: "#5FB157" }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 24, color: "#C9C6BC", marginLeft: 8 }}>workflow</span>
          </div>
          <div style={{ padding: "26px 30px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontFamily: mono, fontSize: 30, color: "#F4F1EA" }}>
              <span style={{ color: CLAY }}>$</span> workflow run plan.md
            </div>
            <div style={{ fontFamily: mono, fontSize: 30, color: "#F4F1EA", display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: C.green, display: "inline-block", flexShrink: 0 }} />
              Corriendo · {formatClock(elapsed)}
            </div>
            <div style={{ height: 10, borderRadius: 5, background: "#3A3835", overflow: "hidden", marginTop: 4 }}>
              <div style={{ height: "100%", width: `${(elapsed / 28799) * 100}%`, background: CLAY }} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 24, top: -22, opacity: encendida, transform: `translateY(${(1 - encendida) * 20}px)` }}>
          <Badge bg="#282725" color="#DCD9CF" style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, whiteSpace: "nowrap" }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: C.green, display: "inline-block", flexShrink: 0 }} />
            Encendida
          </Badge>
        </div>
      </div>
    </div>
  );
};

/** The plan.md Docs artifact — shared header + body, used by P5's item 3 and P7. */
const DocCard: React.FC<{ children: React.ReactNode; headerRight?: React.ReactNode; style?: React.CSSProperties }> = ({ children, headerRight, style }) => (
  <Card style={{ width: 840, borderRadius: 32, overflow: "hidden", ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 28px", borderBottom: `1.5px solid ${C.border}` }}>
      <PastelTile icon={FileText} tone="blue" size={56} radius={14} />
      <span style={{ fontFamily: sans, fontSize: 32, fontWeight: 600, color: C.ink }}>plan.md</span>
      <Badge>Doc</Badge>
      <div style={{ flex: 1 }} />
      {headerRight}
    </div>
    <div style={{ padding: "30px 36px 34px" }}>{children}</div>
  </Card>
);

/** Lives on the right of the plan.md header — not floating outside the doc. */
export const AgentTag: React.FC<{ t: number }> = ({ t }) => {
  const agent = ease(t, PLAN_AGENT_AT, 0.4);
  return (
    <div style={{ opacity: agent, transform: `scale(${lerp(0.7, 1, agent)})`, transformOrigin: "right center" }}>
      <Badge style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 28, whiteSpace: "nowrap" }}>
        <Bot size={24} /> Agente
      </Badge>
    </div>
  );
};

/** The plan.md steps list, shared by P5's item 3 and P7 so the card reads as the same document. */
export const PlanSteps: React.FC<{ t: number; compress?: number }> = ({ t, compress = 0 }) => {
  const emptyCaret = t >= PLAN_DOC_AT && t < PLAN_STEP_AT[0];
  const objective = ease(t, PLAN_OBJECTIVE_AT, 0.4);
  return (
    <div style={{ position: "relative", transform: `scale(${lerp(1, 0.8, compress)})`, transformOrigin: "top center", opacity: lerp(1, 0.5, compress) }}>
      {emptyCaret && (
        <div style={{ display: "flex", fontFamily: mono, fontSize: 32, color: C.faint }}>
          <span style={{ display: "inline-block", width: 3, height: 32, background: CLAY, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.15 }} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {PLAN_STEPS.map((step, i) => {
          const p = ease(t, PLAN_STEP_AT[i], 0.35);
          const barW = ease(t, PLAN_STEP_AT[i] + 0.2, 0.4) * 280;
          return (
            <div key={step} style={{ opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>
              <div style={{ display: "flex", gap: 14, fontFamily: mono, fontSize: 32, color: "#141413" }}>
                <span style={{ color: CLAY }}>{i + 1}</span>
                <span>{step}</span>
              </div>
              <div style={{ height: 16, width: barW, borderRadius: 8, background: C.chip, marginTop: 10, marginLeft: 40 }} />
            </div>
          );
        })}
        <div style={{ opacity: objective, transform: `translateY(${(1 - objective) * 10}px)`, display: "flex", alignItems: "center", gap: 14 }}>
          <Flag size={28} color={CLAY} />
          <div style={{ position: "relative", display: "inline-block" }}>
            <Highlight p={objective} />
            <span style={{ position: "relative", fontFamily: sans, fontSize: 36, fontWeight: 600, color: C.ink }}>Objetivo final</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Item3: React.FC<{ t: number }> = ({ t }) => {
  const p = ease(t, ITEM3_AT, 0.5);
  const docIn = ease(t, PLAN_DOC_AT, 0.5);
  return (
    <div style={{ opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
        <span style={{ fontFamily: serif, fontSize: 90, fontWeight: 500, color: C.accent }}>3</span>
        <span style={{ fontFamily: serif, fontSize: 48, fontWeight: 500, color: C.ink }}>Un plan estructurado</span>
      </div>
      <div style={{ marginTop: 44, display: "flex", justifyContent: "center", opacity: docIn, transform: `translateY(${(1 - docIn) * 24}px) scale(${lerp(0.95, 1, docIn)})` }}>
        <DocCard headerRight={<AgentTag t={t} />}>
          <PlanSteps t={t} />
        </DocCard>
      </div>
    </div>
  );
};

export const Checklist: React.FC<{ t: number }> = ({ t }) => {
  const item = t >= 49.55 ? 3 : t >= ITEM2_AT ? 2 : 1;
  return (
    <Panel top={SAFE.top} gap={0}>
      <ChecklistHeader t={t} />
      {item === 1 && <Item1 t={t} />}
      {item === 2 && <Item2 t={t} />}
      {item === 3 && <Item3 t={t} />}
    </Panel>
  );
};

/* =======================================================================================
   P6 · VorssaintPanel — CARD, 41.30–49.45
   ======================================================================================= */
const MAC_AT = 41.78;
export const VORSSAINT_AT = 43.54;
const CURSOR_START_AT = 45.63;
const CURSOR_ARRIVE_AT = 46.2;
export const CLICK_AT = 46.3;
const APAGA_AT = 47.37;
const RING_AT = 48.66;

const TAB_ICONS = [Moon, SlidersHorizontal, Cpu, Globe, HardDrive, Sun, Wrench, LayoutGrid];

const SaturnMark: React.FC<{ size: number }> = ({ size }) => (
  <Img src={staticFile("vorssaint-mark.svg")} style={{ width: size, height: size, filter: "brightness(0) invert(1)" }} />
);

const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ width: 90, height: 54, borderRadius: 27, background: lerp(0, 1, on) > 0.5 ? "#0A84FF" : "#3A3A3C", position: "relative", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 4, left: lerp(4, 40, on), width: 46, height: 46, borderRadius: 23, background: "#fff" }} />
  </div>
);

const RingTimer: React.FC<{ p: number; label: string; size?: number }> = ({ p, label, size = 120 }) => {
  const r = size * 0.42;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.chip} strokeWidth={size * 0.09} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={CLAY}
        strokeWidth={size * 0.09}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + size * 0.07} textAnchor="middle" fontFamily={sans} fontSize={size * 0.275} fontWeight={700} fill={C.ink}>
        {label}
      </text>
    </svg>
  );
};

export const VorssaintPanel: React.FC<{ t: number }> = ({ t }) => {
  const macIn = ease(t, MAC_AT, 0.55);
  const openPop = pop(t, VORSSAINT_AT, { damping: 13, stiffness: 190, mass: 0.7 });
  const cursorP = prog(t, CURSOR_START_AT, CURSOR_ARRIVE_AT);
  const press = pop(t, CLICK_AT, { damping: 8, stiffness: 320, mass: 0.3 });
  const toggleOn = t >= CLICK_AT ? Math.min(1, ease(t, CLICK_AT, 0.25)) : 0;
  const activo = ease(t, APAGA_AT, 0.4);
  const ring = pop(t, RING_AT, { damping: 14, stiffness: 200, mass: 0.6 });

  const popoverW = 600;
  const popoverRight = 150; // right edge at x=930, under the Saturn icon
  const popoverLeft = 1080 - popoverRight - popoverW; // 330 — clear of the left column (90–320)
  const toggleX = popoverLeft + popoverW - 130;
  const toggleY = 660;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* macOS menu bar strip */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 250,
          width: 900,
          height: 64,
          borderRadius: 20,
          background: "rgba(28,28,30,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 26,
          padding: "0 30px",
          opacity: macIn,
          transform: `translateY(${(1 - macIn) * -40}px)`,
        }}
      >
        <Wifi size={28} color="#fff" />
        <BatteryFull size={32} color="#fff" />
        <span style={{ fontFamily: sans, fontSize: 28, color: "#fff", fontWeight: 500 }}>11:59</span>
        <div style={{ position: "relative" }}>
          {openPop > 0.02 && <div style={{ position: "absolute", inset: -10, borderRadius: 12, background: "rgba(255,255,255,0.16)", transform: `scale(${lerp(0.6, 1, Math.min(1, openPop))})` }} />}
          <div style={{ position: "relative" }}>
            <SaturnMark size={32} />
            {activo > 0.05 && <div style={{ position: "absolute", right: -5, bottom: -5, width: 13, height: 13, borderRadius: 7, background: "#0A84FF", opacity: activo }} />}
          </div>
        </div>
      </div>

      {/* Name tag + chip + ring timer, left column (x 90–320) — kept clear of the popover (330–930). */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 400,
          width: 230,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: openPop,
          transform: `scale(${lerp(0.92, 1, Math.min(1, openPop))})`,
        }}
      >
        <Img src={staticFile("vorssaint-icon.png")} style={{ width: 110, height: 110, borderRadius: 26 }} />
        <span style={{ fontFamily: sans, fontSize: 40, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>Vorssaint</span>
        <Badge>Keep awake</Badge>
      </div>
      {ring > 0.02 && (
        <div style={{ position: "absolute", left: 90, top: 690, width: 230, display: "flex", justifyContent: "center", opacity: Math.min(1, ring * 1.4) }}>
          <RingTimer p={Math.min(1, ring)} label="8 h" size={150} />
        </div>
      )}

      {/* Popover */}
      <div
        style={{
          position: "absolute",
          left: popoverLeft,
          top: 330,
          width: popoverW,
          borderRadius: 34,
          background: "#1C1C1E",
          border: "1px solid #3A3A3C",
          boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
          opacity: Math.min(1, openPop * 1.4),
          transform: `scale(${lerp(0.92, 1, Math.min(1, openPop))})`,
          transformOrigin: "top right",
          padding: "32px 32px 34px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <SaturnMark size={40} />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {TAB_ICONS.map((Icon, i) => (
            <div key={i} style={{ flex: 1, height: 56, borderRadius: 14, background: i === 0 ? "#0A84FF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={26} color={i === 0 ? "#fff" : "#8E8E93"} />
            </div>
          ))}
        </div>
        <div style={{ fontFamily: sans, fontSize: 26, fontWeight: 700, letterSpacing: 1.6, color: "#8E8E93", marginBottom: 10 }}>KEEP AWAKE</div>
        <div style={{ background: "#2A2A2C", border: "1px solid #3A3A3C", borderRadius: 20, padding: "18px 24px", display: "flex", alignItems: "center", gap: 18 }}>
          <Moon size={36} color="#0A84FF" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: sans, fontSize: 36, fontWeight: 700, color: "#fff" }}>Mac awake</div>
            <div style={{ fontFamily: sans, fontSize: 28, color: "#9C9CA1", marginTop: 4 }}>Active until you turn it off</div>
            {activo > 0.05 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, opacity: activo }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: "#32D74B" }} />
                <span style={{ fontFamily: sans, fontSize: 28, color: "#32D74B", fontWeight: 600 }}>Active</span>
              </div>
            )}
          </div>
          <Toggle on={toggleOn * (1 - 0.1 * Math.sin(Math.min(1, press) * Math.PI))} />
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
          {["+15 min", "+30 min", "+60 min"].map((chip) => (
            <div key={chip} style={{ background: "#3A3A3C", color: "#fff", fontFamily: sans, fontSize: 28, fontWeight: 600, padding: "12px 20px", borderRadius: 16, whiteSpace: "nowrap" }}>
              {chip}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 16, background: "#2A2A2C", borderRadius: 16, padding: 6 }}>
          <div style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRadius: 12, color: "#9C9CA1", fontFamily: sans, fontSize: 28, fontWeight: 600 }}>Duration</div>
          <div style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRadius: 12, background: "#4A4A4D", color: "#fff", fontFamily: sans, fontSize: 28, fontWeight: 600 }}>Indefinite</div>
        </div>
      </div>

      {cursorP > 0.001 && t < CLICK_AT + 0.4 && (
        <div style={{ position: "absolute", left: lerp(220, toggleX, cursorP), top: lerp(1000, toggleY, cursorP) }}>
          <MousePointer2 size={36} color="#fff" fill="#fff" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))", transform: `scale(${1 - 0.1 * Math.sin(Math.min(1, press) * Math.PI)})` }} />
        </div>
      )}
    </div>
  );
};

/* =======================================================================================
   P7 · PlanKPIs — CARD, 62.40–67.30
   ======================================================================================= */
export const KPI_ITEMS = ["Tests en verde", "Build sin errores", "Objetivo cumplido"];
export const KPI_HEADER_AT = 64.97;
export const KPI_AT = [65.2, 65.45, 65.7];
export const KPI_PULSE_AT = 66.35;

export const PlanKPIs: React.FC<{ t: number }> = ({ t }) => {
  const compress = ease(t, KPI_HEADER_AT - 0.3, 0.5);
  const header = ease(t, KPI_HEADER_AT, 0.4);
  const pulse = pop(t, KPI_PULSE_AT, { damping: 9, stiffness: 240, mass: 0.5 });
  return (
    <Panel top={SAFE.top} gap={18}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${lerp(1, 0.94, compress)})`, transformOrigin: "top center" }}>
          <DocCard headerRight={<AgentTag t={t} />}>
            <PlanSteps t={t} compress={compress} />
            <div style={{ height: 22 * compress }} />
            <div style={{ fontFamily: serif, fontSize: 40, fontWeight: 500, color: C.ink, opacity: header, transform: `translateY(${(1 - header) * 10}px)` }}>Indicadores de éxito</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 22 }}>
              {KPI_ITEMS.map((item, i) => {
                const p = ease(t, KPI_AT[i], 0.35);
                const scale = 1 + 0.1 * pulse * Math.max(0, 1 - i * 0.15);
                return (
                  <div key={item} style={{ opacity: p, transform: `translateX(${(1 - p) * -20}px)`, display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, border: `2px solid ${C.border}`, flexShrink: 0, transform: `scale(${scale})` }} />
                    <span style={{ fontFamily: sans, fontSize: 34, color: C.ink }}>{item}</span>
                  </div>
                );
              })}
            </div>
          </DocCard>
        </div>
      </div>
    </Panel>
  );
};

/* =======================================================================================
   P8 · RunWorkflow — OFF, 67.45–72.90
   ======================================================================================= */
export const TYPE_AT = 68.0;
export const RUN_PRESS_AT = 68.58;
const COLLAPSE_AT = 68.9;
const OLVIDAS_AT = 70.02;
const RING_CARD_AT = 70.02;
export const SWEEP_START_AT = 70.47;
export const SWEEP_END_AT = 71.95;
export const TERMINADO_AT = 72.46;

const StatusRow: React.FC<{ t: number }> = ({ t }) => {
  const enter = ease(t, COLLAPSE_AT, 0.3);
  const terminado = ease(t, TERMINADO_AT, 0.35);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", justifyContent: "center", opacity: enter, transform: `translateY(${(1 - enter) * -16}px) scale(${lerp(0.9, 1, enter)})` }}>
      <Card style={{ padding: "22px 34px", borderRadius: 34, display: "flex", alignItems: "center", gap: 16, boxSizing: "border-box" }}>
        {terminado > 0.5 ? (
          <>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={24} color="#fff" strokeWidth={3} />
            </div>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 40, color: C.ink, whiteSpace: "nowrap" }}>Terminado</span>
          </>
        ) : (
          <>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: C.green, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 40, color: C.ink, whiteSpace: "nowrap" }}>Corriendo · 4 agentes</span>
          </>
        )}
      </Card>
    </div>
  );
};

const TypingInput: React.FC<{ t: number }> = ({ t }) => {
  const enter = ease(t, TYPE_AT - 0.3, 0.5);
  const fade = 1 - ease(t, COLLAPSE_AT, 0.3);
  const press = pop(t, RUN_PRESS_AT, { damping: 8, stiffness: 300, mass: 0.3 });
  const width = 780;
  const chars = Math.max(0, Math.min("Ejecuta plan.md".length, Math.floor((t - TYPE_AT) * 20)));
  const typedText = "Ejecuta plan.md".slice(0, chars);
  const cursorP = prog(t, TYPE_AT + 0.5, RUN_PRESS_AT);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 480, display: "flex", justifyContent: "center", opacity: Math.min(enter, fade), transform: `scale(${lerp(0.95, 1, enter)})` }}>
      <div style={{ position: "relative" }}>
        <InputBox width={width} placeholder="¿Qué quieres construir?" typedText={typedText || undefined} sendActive={t >= RUN_PRESS_AT} sendPulse={Math.min(1, press)} />
        {cursorP > 0.001 && t < RUN_PRESS_AT + 0.4 && <Cursor x={width - 100} y={lerp(220, 128, cursorP)} press={press} />}
        {press > 0 && press < 1 && <div style={{ position: "absolute", right: 6, bottom: -2, width: 90, height: 90, borderRadius: 45, border: `3px solid ${CLAY}`, opacity: 1 - press, transform: `scale(${1 + press * 0.5})` }} />}
      </div>
    </div>
  );
};

const RingCard: React.FC<{ t: number }> = ({ t }) => {
  const cardIn = ease(t, RING_CARD_AT, 0.5);
  const sweep = t < SWEEP_START_AT ? 0 : t > SWEEP_END_AT ? 1 : prog(t, SWEEP_START_AT, SWEEP_END_AT);
  const terminado = ease(t, TERMINADO_AT, 0.3);
  const R = 250;
  const cx = 540;
  const cy = 980;
  const c = 2 * Math.PI * R;
  const hours = Math.round(sweep * 8);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx - 330,
          top: cy - 330,
          width: 660,
          height: 660,
          borderRadius: 64,
          background: "#fff",
          border: `1.5px solid ${C.border}`,
          boxShadow: shadow,
          opacity: cardIn,
          transform: `scale(${lerp(0.92, 1, cardIn)})`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: cardIn }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#EFEEEA" strokeWidth={22} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
          const x1 = cx + Math.cos(a) * (R - 30);
          const y1 = cy + Math.sin(a) * (R - 30);
          const x2 = cx + Math.cos(a) * (R + 30);
          const y2 = cy + Math.sin(a) * (R + 30);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(20,20,19,0.1)" strokeWidth={3} />;
        })}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={terminado > 0.5 ? C.green : CLAY}
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - sweep)}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{ position: "absolute", left: cx - 150, top: cy - 110, width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: cardIn }}>
        {terminado > 0.5 ? (
          <>
            <div style={{ width: 76, height: 76, borderRadius: 38, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.min(1.1, ease(t, TERMINADO_AT, 0.3))})` }}>
              <Check size={42} color="#fff" strokeWidth={3} />
            </div>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 56, color: C.ink, whiteSpace: "nowrap" }}>Terminado</span>
          </>
        ) : (
          <>
            <div style={{ position: "relative", width: 64, height: 64 }}>
              <Sun size={64} color={C.amber} style={{ position: "absolute", opacity: 1 - sweep }} />
              <Moon size={64} color={C.violet} style={{ position: "absolute", opacity: sweep }} />
            </div>
            <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 120, color: C.ink, whiteSpace: "nowrap" }}>{hours} h</span>
          </>
        )}
      </div>
    </>
  );
};

export const RunWorkflow: React.FC<{ t: number }> = ({ t }) => (
  <>
    <TypingInput t={t} />
    <StatusRow t={t} />
    {t >= OLVIDAS_AT - 0.2 && <RingCard t={t} />}
  </>
);

/* =======================================================================================
   P9 · ReviewCard — FULL, top card, 73.05–75.40
   ======================================================================================= */
export const REVIEW_CHECK_AT = [73.63, 73.8, 73.97];

export const ReviewCard: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center" }}>
    <In t={t} at={73.05} y={-24} scale={0.94}>
      <Card style={{ width: 860, height: 338, boxSizing: "border-box", padding: "44px 48px", borderRadius: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: serif, fontSize: 46, fontWeight: 500, color: C.ink, letterSpacing: -1, marginBottom: 28 }}>Revisión final</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {KPI_ITEMS.map((item, i) => {
            const check = pop(t, REVIEW_CHECK_AT[i], { damping: 10, stiffness: 260, mass: 0.4 });
            return (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: check > 0.5 ? C.green : "transparent",
                    border: check > 0.5 ? "none" : `2px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transform: `scale(${lerp(0.7, 1, Math.min(1, check))})`,
                  }}
                >
                  {check > 0.5 && <Check size={24} color="#fff" strokeWidth={3} />}
                </div>
                <span style={{ fontFamily: sans, fontSize: 38, color: C.ink }}>{item}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </In>
  </div>
);

/* =======================================================================================
   SFX cues — grouped by category so Sfx.tsx wires one map without duplicating numbers.
   ======================================================================================= */
export const CUES = {
  aparicion: [FLYER_AT, MENU_AT, STAT_AT, TOKENS_AT, RESULTS_AT, TILES_AT, DURACION_AT, INPUT_RISE_AT, 28.37, ITEM2_AT, PLAN_DOC_AT, MAC_AT, VORSSAINT_AT, KPI_HEADER_AT, RING_CARD_AT, 73.05],
  clic: [SEND_PRESS_AT, CLICK_AT, RUN_PRESS_AT],
  tecleo: [TYPE_AT, ...PLAN_STEP_AT, KPI_HEADER_AT],
  check: [ITEM2_AT, ITEM3_AT, ...REVIEW_CHECK_AT],
  exito: [TERMINADO_AT],
  timelapse: [SWEEP_START_AT],
};
