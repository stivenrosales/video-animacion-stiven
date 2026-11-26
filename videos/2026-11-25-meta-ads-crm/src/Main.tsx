import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowRight, Check, ShoppingBag, X } from "lucide-react";
import rawWords from "./words.json";
import { MCP_PATHS, MCP_STROKE } from "./mcp";
import { C, MONO, SANS, prog, rise } from "./theme";

const EASE_IO = Easing.inOut(Easing.cubic);
const SOFT = "#B9B3A6";
const GREY = "#55554E";
const CLAUDE = "claude.png"; // Claude's spark: only ever next to the word Claude
const META = "meta-symbol.svg"; // about.meta.com/brand/resources (the symbol of the official lockup, untouched)
const AIRTABLE = "airtable-mark-white.svg"; // airtable.com header mark (monochrome), in arena for the dark canvas
const GITHUB = "github-mark-white.svg"; // github.com/logos
/** "Este repositorio público": his public repo (confirmed by the owner's team, 2026-11-26). Only the name and address are shown. */
const REPO_OWNER = "stivenrosales";
const REPO_NAME = "ads-vs-realidad";
const REPO = `${REPO_OWNER}/${REPO_NAME}`;

// ---------- words ----------
type Word = { t: number; e: number; w: string; big?: boolean };
const HEAVY = ["más allá", "total"];
const WORDS: Word[] = (rawWords as Word[]).map((w) => (HEAVY.includes(w.w) ? { ...w, w: w.w.toUpperCase(), big: true } : w));
const norm = (s: string) => s.toLowerCase().replace(/[¿?,.:]/g, "");
/** Start of the n-th time he says a word (0-based), so every beat stays glued to his voice if the cut changes. */
const at = (word: string, n = 0) => {
  const hits = (rawWords as Word[]).filter((w) => norm(w.w) === word);
  if (!hits[n]) throw new Error(`word not found: ${word} #${n}`);
  return hits[n].t;
};
const endOf = (word: string, n = 0) => (rawWords as Word[]).filter((w) => norm(w.w) === word)[n].e;

// ---------- timeline (seconds on the edited video) ----------
const END = 49.06;
/** Full-screen sumi cutaways: one explaining element each, hard cut in and out. */
const CUT_C: [number, number] = [at("desde"), endOf("llegando", 1)]; // "desde Meta hasta mi CRM, para ver quiénes están llegando, quiénes están comprando, de qué publicidad"
const CUT_D: [number, number] = [at("claude code"), endOf("meta", 2)]; // "Claude Code. No usas el MCP como tal, sino la API de Meta"
const CUT_F: [number, number] = [at("y", 8), at("no", 2) - 0.05]; // "y tener un panel de dashboard para ver qué está funcionando y qué…": he is back on "no"
const CUT_E: [number, number] = [at("gratis"), at("para", 2)]; // "gratis en este repositorio público, si quieres usarlo"
const CUTAWAYS = [CUT_C, CUT_D, CUT_E, CUT_F];
const TAG_HOOK: [number, number] = [at("meta ads"), at("sin")]; // "Meta Ads ya se pueden conectar a tu Claude mediante el MCP"
const HOOK_CLAUDE = at("conectar");
const HOOK_MCP = at("mcp");
const TAG_ONE: [number, number] = [at("solo", 1) - 0.1, at("quiénes", 2) - 0.1]; // "en un solo software puedes ver las métricas"
// cutaway E: the repository
const E_PUBLIC = at("público");
const CTA_AT = at("lo", 2); // "lo puedes usar ahí"
const TAG_CTA: [number, number] = [CUT_F[1], END + 1]; // the repository again, from the moment he is back until the end

/** "En mi caso uso Airtable como un CRM, porque ahí están mis clientes y todo lo demás": a tag over the camera. */
const TAG_CRM: [number, number] = [at("uso"), endOf("demás")];
const CRM_AT = at("crm", 1);
// cutaway C: the whole trace, from the ad to the sale
const C_TO = at("hasta");
const C_CRM = at("mi", 1);
const C_ARRIVE = at("quiénes");
const C_BUY = at("quiénes", 1);
const C_AD = at("qué");
// cutaway D: Claude Code talks to Meta's API, not to the MCP
const D_NOT = at("como", 2);
const D_API_IN = at("sino", 1);
const D_API = at("api");
// cutaway F: the dashboard
const F_WORKS = at("funcionando");
const F_NOT = at("y", 9); // "y qué no"

/** enter.mp3 swells for 0.36 s before its peak, so each entry cue starts early; going back to the camera is silent. */
const ENTER_PEAK = 0.36;
/** Sound cues, Ali Abdaal's approach: varied effects, each tied to something visible, all far below the voice.
 *  [second, file, volume]. */
const CUES: Array<[number, string, number]> = [
  [TAG_HOOK[0] - 0.04, "trans.mp3", 0.18], // hook tag: Meta Ads
  [HOOK_CLAUDE - 0.07, "plug.mp3", 0.17], // the tag grows "→ Claude": "conectar a tu Claude"
  [at("más allá") - 0.04, "trans.mp3", 0.18], // "MÁS ALLÁ" (with the punch-in)
  [at("métricas"), "pop.mp3", 0.13], // chart mark: "las métricas"
  [TAG_CRM[0] + 0.06, "click.mp3", 0.16], // tag: Airtable
  [at("total"), "thud.mp3", 0.12], // "TOTAL" (with the punch-in); quiet, the swell into cutaway C follows
  [CUT_C[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway C
  [C_ARRIVE, "pop.mp3", 0.15], // row: quiénes están llegando
  [C_BUY, "click.mp3", 0.17], // row: quiénes están comprando
  [C_AD, "tick.mp3", 0.14], // row: de qué publicidad
  [CUT_D[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway D
  [TAG_ONE[0] + 0.1, "chime.mp3", 0.12], // tag: un solo software
  [CUT_E[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway E
  [E_PUBLIC, "pop.mp3", 0.15], // "repositorio público"
  [CUT_F[0] - ENTER_PEAK, "enter.mp3", 0.2], // into cutaway F
  [F_WORKS + 0.05, "check.mp3", 0.16], // the first ad is marked: "qué está funcionando"
  [TAG_CTA[0], "chime.mp3", 0.12], // closing tag: the repository
];
const CUE_LEN: Record<string, number> = { "tick.mp3": 1.5 };
/** Suno bed under the whole video (scripts/suno.py "breezy", loudnorm -18). */
const MUSIC = 0.11;
const musicVolume = (t: number) =>
  interpolate(t, [0, 0.8, END - 1.5, END], [0, MUSIC, MUSIC, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IO });

/** Small hand-drawn marks, fine ballpoint line (Kie GPT Image 2.6, scripts/kie_icons.py style "b" → scripts/ink_mask.py),
 *  drawn when he names the thing. [in, out, file, size, center y]. Centered above his head, in sumi, never with a pill tag.
 *  Only one is left: the review asked for fewer devices so he stays the protagonist.
 *  On punched frames they are 150 px with the top edge at y 250. */
const INK: Array<[number, number, string, number, number]> = [
  [at("métricas"), at("ads"), "grafico", 150, 325], // "ver las métricas y publicaciones" (punched frame)
];

const inside = (t: number, [a, b]: [number, number]) => t >= a && t < b;
const inCutaway = (t: number) => CUTAWAYS.some((c) => inside(t, c));

// ---------- camera ----------
/** Punch-in by cut: the framing toggles between 1 and 1.12 at these moments, never animated; the visible ones are at least
 *  2.5 s apart. He is punched for "MÁS ALLÁ" and "TOTAL". Toggles that fall inside a cutaway only set the framing he comes back in. */
const PUNCHES = [
  at("más allá"), // in: the heavy word
  at("sino"), // out
  at("total"), // in: the heavy word
  CUT_C[0] + 2, // (inside C) he comes back at 1
  CUT_D[0] + 1, // (inside D) he comes back punched: "y en un solo software"
  at("y", 6), // out: "y la verdad es que esto me ha funcionado muy bien"
  at("he"), // in: "lo he implementado en mi empresa"
  at("si"), // (inside E) he comes back at 1 and closes at 1
];
const punched = (t: number) => PUNCHES.filter((c) => c <= t).length % 2 === 1;

const Camera: React.FC<{ t: number; proxy: boolean }> = ({ t, proxy }) => {
  const breath = 1 + 0.0175 * (1 + Math.sin((t / 6) * Math.PI)); // 1 → 1.035, never below 1
  const scale = breath * (punched(t) ? 1.12 : 1);
  return (
    <AbsoluteFill style={{ opacity: inCutaway(t) ? 0 : 1 }}>
      <Video
        src={staticFile(proxy ? "proxy.mp4" : "edited.mp4")}
        style={{ width: 1080, height: 1920, objectFit: "cover", transform: `scale(${scale})`, transformOrigin: "50% 38%" }}
      />
      {/* daylight + white polo: a sumi floor so the arena word reads */}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(26,26,24,.82) 0%, rgba(26,26,24,.6) 20%, rgba(26,26,24,0) 44%)" }} />
    </AbsoluteFill>
  );
};

// ---------- captions: one word at a time ----------
const Caption: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let k = 0; k < WORDS.length; k++) if (WORDS[k].t <= t) i = k;
  if (i < 0) return null;
  const w = WORDS[i];
  const until = Math.min(WORDS[i + 1]?.t ?? END, w.e + 0.9); // hold through short pauses, clear on long ones
  if (t >= until) return null;
  const p = prog(t, w.t, 0.12);
  const size = w.big ? 150 : 84;
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: w.big ? 1345 : 1405, textAlign: "center",
        fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: w.big ? -5 : -2.6, lineHeight: 1,
        color: t >= CTA_AT ? C.moss : C.arena, textShadow: t >= CTA_AT ? "0 2px 24px rgba(0,0,0,.6)" : "0 2px 18px rgba(0,0,0,.35)",
        opacity: p, transform: `translateY(${(1 - p) * 8}px)`,
      }}
    >
      {w.w}
    </div>
  );
};

// ---------- pieces ----------
const Sumi: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 42%, #26261F 0%, ${C.sumi} 70%)` }} />
);

const pulseAt = (t: number, when: number) => (t >= when && t < when + 0.5 ? 1 - (t - when) / 0.5 : 0);
const Dot: React.FC<{ pulse?: number; color?: string }> = ({ pulse = 0, color = C.moss }) => (
  <div style={{ width: 12, height: 12, borderRadius: 6, background: color, flexShrink: 0, transform: `scale(${1 + 0.7 * pulse})` }} />
);

/** A group that opens from zero width, so a tag can grow a part when he says it. */
const Grow: React.FC<{ p: number; w: number; children: React.ReactNode }> = ({ p, w, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, width: w * p, opacity: p, overflow: "hidden", flexShrink: 0, whiteSpace: "pre", filter: `blur(${(1 - p) * 6}px)` }}>{children}</div>
);

/** The MCP mark: the three strokes of the official logo. `draw` 0→1 draws them on, one after another. */
const McpMark: React.FC<{ size: number; draw?: number; color?: string }> = ({ size, draw = 1, color = C.arena }) => (
  <svg width={size} height={size} viewBox="8 8 180 190" fill="none" style={{ flexShrink: 0 }}>
    {MCP_PATHS.map((d, i) => {
      const p = interpolate(draw, [i * 0.22, i * 0.22 + 0.56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return <path key={i} d={d} stroke={color} strokeWidth={MCP_STROKE} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0} />;
    })}
  </svg>
);

/** Pill tag over the camera: mono caps on sumi. A moss dot unless the content brings its own brand mark. */
const Tag: React.FC<{ t: number; win: [number, number]; pulses?: number[]; dot?: boolean; children: React.ReactNode }> = ({ t, win, pulses = [], dot = true, children }) => {
  if (!inside(t, win)) return null;
  const out = win[1] >= END ? 1 : 1 - prog(t, win[1] - 0.3, 0.3);
  const pulse = pulses.reduce((v, when) => Math.max(v, pulseAt(t, when)), 0);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ ...rise(t, win[0]), display: "flex", alignItems: "center", gap: 14, height: 68, boxSizing: "border-box", fontFamily: MONO, fontSize: 28, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "pre", color: C.arena, background: "rgba(26,26,24,.82)", padding: "0 26px", borderRadius: 999 }}>
        {dot ? <Dot pulse={pulse} /> : null}
        {children}
      </div>
    </div>
  );
};

/** A pen mark tinted with any Koan color through a CSS mask. */
const Mark: React.FC<{ name: string; size: number; color: string; style?: React.CSSProperties }> = ({ name, size, color, style }) => {
  const url = staticFile(`ink/${name}.png`);
  return (
    <div
      style={{
        width: size, height: size, background: color, flexShrink: 0,
        WebkitMaskImage: `url(${url})`, maskImage: `url(${url})`, WebkitMaskSize: "contain", maskSize: "contain",
        WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", ...style,
      }}
    />
  );
};

/** A pen mark above his head: wipes in left to right like a stroke, fades out. */
const Ink: React.FC<{ t: number; win: [number, number]; name: string; size: number; y: number }> = ({ t, win, name, size, y }) => {
  if (!inside(t, [win[0], win[1] + 0.3])) return null;
  const p = prog(t, win[0], 0.45);
  const out = 1 - prog(t, win[1], 0.3);
  return <Mark name={name} size={size} color={C.sumi} style={{ position: "absolute", left: 540 - size / 2, top: y - size / 2, opacity: 0.9 * out, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, transform: `scale(${0.96 + 0.04 * p})` }} />;
};

/** Cutaway titles start this early, so the first frame after the hard cut already shows them about 60% in. */
const HEAD_LEAD = 0.1;
/** Header of a cutaway: an optional mark and a short title, centered at the top of the safe area. */
const Head: React.FC<{ t: number; at: number; text: string; mark?: React.ReactNode; size?: number }> = ({ t, at: when, text, mark, size = 76 }) => (
  <div style={{ ...rise(t, when), position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
    {mark}
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -2.4, lineHeight: 1, color: C.arena }}>{text}</div>
  </div>
);

const Pill: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 30, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "pre", color: C.arena, background: C.win, boxShadow: `0 0 0 1.5px ${C.line}`, padding: "18px 30px 19px", borderRadius: 999, ...style }}>
    {children}
  </div>
);
const Bar: React.FC<{ w: number | string; h?: number; color?: string; style?: React.CSSProperties }> = ({ w, h = 12, color = GREY, style }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: color, flexShrink: 0, ...style }} />
);
const CARD: React.CSSProperties = { position: "absolute", left: 140, right: 140, boxSizing: "border-box", background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.3)`, display: "flex", alignItems: "center" };
/** A row that names one thing with its pen mark. */
const Row: React.FC<{ t: number; at: number; top: number; mark?: string; icon?: React.ReactNode; label: string; pulse?: number }> = ({ t, at: when, top, mark, icon, label, pulse }) => (
  <div style={{ ...CARD, ...rise(t, when, 0.45, 16, 6), top, height: 122, borderRadius: 24, padding: "0 34px", gap: 26, fontFamily: MONO, fontSize: 38, color: C.arena, boxShadow: `0 0 0 1.5px ${C.line}` }}>
    {mark ? <Mark name={mark} size={74} color={C.arena} /> : icon}
    <span style={{ flex: 1 }}>{label}</span>
    {pulse === undefined ? null : <Dot pulse={pulseAt(t, pulse)} />}
  </div>
);

// ---------- cutaways ----------
/** C: the trace he wanted, from Meta to his CRM, and the three things it answers. */
const Endpoint: React.FC<{ t: number; at: number; labelAt: number; left: number; logo: string; label: string }> = ({ t, at: when, labelAt, left, logo, label }) => (
  <div style={{ ...rise(t, when, 0.5, 20, 8), position: "absolute", left, top: 440, width: 250, height: 206, boxSizing: "border-box", background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.3)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
    <Img src={staticFile(logo)} style={{ height: 84 }} />
    <span style={{ ...rise(t, labelAt, 0.4, 10, 6), fontFamily: MONO, fontSize: 30, color: SOFT }}>{label}</span>
  </div>
);
const CutC: React.FC<{ t: number }> = ({ t }) => {
  const line = prog(t, C_TO, 0.55);
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_C[0] - HEAD_LEAD} text="trazabilidad total" size={72} />
      <Endpoint t={t} at={CUT_C[0] - HEAD_LEAD} labelAt={CUT_C[0]} left={140} logo={META} label="desde Meta" />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M418 543 H 650" stroke={C.moss} strokeWidth={5} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} opacity={line > 0 ? 1 : 0} />
      </svg>
      <ArrowRight size={44} strokeWidth={2.6} color={C.moss} style={{ position: "absolute", left: 628, top: 521, opacity: prog(t, C_TO + 0.35, 0.25) }} />
      <Endpoint t={t} at={CUT_C[0] - HEAD_LEAD} labelAt={C_CRM} left={690} logo={AIRTABLE} label="hasta mi CRM" />
      <Row t={t} at={C_ARRIVE} top={720} mark="personas" label="quiénes están llegando" pulse={at("llegando")} />
      <Row t={t} at={C_BUY} top={866} icon={<ShoppingBag size={70} strokeWidth={1.5} color={C.arena} style={{ flexShrink: 0, margin: "0 2px" }} />} label="quiénes están comprando" pulse={at("comprando")} />
      <Row t={t} at={C_AD} top={1012} mark="megafono" label="de qué publicidad" pulse={at("publicidad")} />
    </AbsoluteFill>
  );
};

/** D: with Claude Code it is possible; the door is Meta's API, not the MCP as such. */
const CutD: React.FC<{ t: number }> = ({ t }) => {
  const not = prog(t, D_NOT, 0.4);
  const yes = prog(t, D_API, 0.4);
  const mcpColor = interpolateColors(not, [0, 1], [C.arena, GREY]);
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={CUT_D[0] - HEAD_LEAD} text="Claude Code" mark={<Img src={staticFile(CLAUDE)} style={{ height: 76 }} />} />
      <div style={{ ...CARD, ...rise(t, CUT_D[0] - HEAD_LEAD, 0.5, 20, 8), top: 450, height: 190, padding: "0 46px", gap: 28 }}>
        <McpMark size={104} draw={prog(t, CUT_D[0] - 0.25, 0.7)} color={mcpColor} />
        <span style={{ flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 80, letterSpacing: -2.6, color: mcpColor }}>MCP</span>
        <span style={{ ...rise(t, D_NOT, 0.35, 10, 6), display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 34, color: SOFT }}>
          <X size={40} strokeWidth={2.5} color={C.mute} />
          como tal, no
        </span>
      </div>
      <div style={{ ...CARD, ...rise(t, D_API_IN, 0.5, 20, 8), top: 676, height: 190, padding: "0 46px", gap: 28, boxShadow: `0 0 0 ${1.5 + 1.5 * yes}px ${interpolateColors(yes, [0, 1], [C.line, C.moss])}, 0 30px 80px rgba(0,0,0,.3)` }}>
        <Img src={staticFile(META)} style={{ height: 70 }} />
        <span style={{ flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 70, letterSpacing: -2.2, color: C.arena, whiteSpace: "pre" }}>la API de Meta</span>
        <Check size={54} strokeWidth={3} color={C.moss} style={rise(t, D_API, 0.35, 10, 6)} />
      </div>
    </AbsoluteFill>
  );
};

/** E: the public repository where it lives, free. Name and address only: nothing he did not say. */
const CutE: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Sumi />
    <Head t={t} at={CUT_E[0] - HEAD_LEAD} text="totalmente gratis" />
    <div style={{ ...CARD, ...rise(t, CUT_E[0] - HEAD_LEAD, 0.5, 20, 8), top: 450, height: 236, justifyContent: "center", gap: 34 }}>
      <Img src={staticFile(GITHUB)} style={{ height: 112 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 32, color: SOFT }}>{REPO_OWNER} /</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: -2, lineHeight: 1, color: C.arena }}>{REPO_NAME}</span>
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 730, display: "flex", justifyContent: "center" }}>
      <Pill style={rise(t, E_PUBLIC)}>
        <Dot pulse={pulseAt(t, E_PUBLIC + 0.3)} />
        repositorio público
      </Pill>
    </div>
    <div style={{ ...rise(t, at("repositorio")), position: "absolute", left: 140, right: 140, top: 856, textAlign: "center", fontFamily: MONO, fontSize: 30, color: SOFT, whiteSpace: "pre" }}>
      github.com/{REPO}
    </div>
  </AbsoluteFill>
);

/** F: the dashboard. Generic ads: the bars grow, one is marked as working and one as not. */
const ADS = [
  { label: "anuncio 1", w: 236 },
  { label: "anuncio 2", w: 150 },
  { label: "anuncio 3", w: 66 },
];
const CutF: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT_F[0];
  const works = prog(t, F_WORKS, 0.4);
  const fails = prog(t, F_NOT, 0.4);
  return (
    <AbsoluteFill>
      <Sumi />
      <Head t={t} at={a - HEAD_LEAD} text="tus métricas" />
      <div style={{ ...rise(t, a - 0.2), position: "absolute", left: 140, right: 140, top: 430, background: C.win, borderRadius: 28, boxShadow: `0 0 0 1.5px ${C.line}, 0 30px 80px rgba(0,0,0,.35)`, padding: "40px 44px 30px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", height: 34, fontFamily: MONO, fontSize: 34, color: SOFT, marginBottom: 30 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#3A3A36" }} />)}
          <span style={{ marginLeft: 14 }}>panel</span>
          <span style={rise(t, at("dashboard"), 0.35, 8, 4)}>· dashboard</span>
        </div>
        <div style={{ display: "flex", gap: 22, marginBottom: 14 }}>
          {[["quiénes te han", 190], ["cuánto te han", 130]].map(([label, w], i) => (
            <div key={label} style={{ ...rise(t, a - 0.14 + i * 0.08, 0.45, 16, 6), flex: 1, height: 184, boxSizing: "border-box", borderRadius: 20, background: "#2A2A27", padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: MONO, fontSize: 32, lineHeight: 1.2, color: SOFT, whiteSpace: "pre" }}>
              <span>{label}{"\n"}comprado</span>
              <Bar w={(w as number) * prog(t, a + 0.2 + i * 0.08, 0.6)} h={22} color="#8C877C" />
            </div>
          ))}
        </div>
        {ADS.map((ad, i) => {
          const on = i === 0 ? works : 0;
          const off = i === 2 ? fails : 0;
          return (
            <div key={ad.label} style={{ ...rise(t, a - 0.1 + i * 0.1, 0.45, 16, 6), display: "flex", alignItems: "center", gap: 22, height: 104, borderTop: `1.5px solid ${C.line}`, fontFamily: MONO, fontSize: 34, color: off ? interpolateColors(off, [0, 1], [SOFT, C.mute]) : SOFT }}>
              <span style={{ width: 196, flexShrink: 0, whiteSpace: "pre" }}>{ad.label}</span>
              <Bar w={ad.w * prog(t, a + 0.05 + i * 0.1, 0.7)} h={26} color={interpolateColors(on, [0, 1], [interpolateColors(off, [0, 1], ["#8C877C", GREY]), C.moss])} />
              <div style={{ flex: 1 }} />
              {i === 0 ? <span style={{ ...rise(t, F_WORKS, 0.35, 10, 6), display: "flex", alignItems: "center", gap: 10, color: C.moss }}><Check size={38} strokeWidth={3} />funciona</span> : null}
              {i === 2 ? <span style={{ ...rise(t, F_NOT, 0.35, 10, 6), display: "flex", alignItems: "center", gap: 10, color: SOFT }}><X size={38} strokeWidth={2.5} color={C.mute} />no</span> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- sound ----------
const Sfx: React.FC<{ fps: number }> = ({ fps }) => {
  const f = (sec: number) => Math.round(sec * fps);
  return (
    <>
      {CUES.map(([sec, file, volume]) => (
        <Sequence key={`${file}${sec}`} from={f(sec)} durationInFrames={f(CUE_LEN[file] ?? 1.1)}><Audio src={staticFile(file)} volume={volume} /></Sequence>
      ))}
      <Audio src={staticFile("music.mp3")} volume={(frame) => musicVolume(frame / fps)} />
    </>
  );
};

const TAG_LOGO: React.CSSProperties = { height: 30, flexShrink: 0 };
export const Main: React.FC<{ proxy: boolean }> = ({ proxy }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  return (
    <AbsoluteFill style={{ background: C.sumi }}>
      <Camera t={t} proxy={proxy} />
      {inside(t, CUT_C) && <CutC t={t} />}
      {inside(t, CUT_D) && <CutD t={t} />}
      {inside(t, CUT_E) && <CutE t={t} />}
      {inside(t, CUT_F) && <CutF t={t} />}
      {/* the hook grows as he says it: Meta Ads → Claude · MCP */}
      <Tag t={t} win={TAG_HOOK} dot={false}>
        <Img src={staticFile(META)} style={TAG_LOGO} />
        Meta Ads
        <div style={{ display: "flex", alignItems: "center", marginLeft: -14 }}>
          <Grow p={prog(t, HOOK_CLAUDE, 0.45)} w={232}>
            <ArrowRight size={28} strokeWidth={2.4} color={C.arena} style={{ marginLeft: 14, flexShrink: 0 }} />
            <Img src={staticFile(CLAUDE)} style={TAG_LOGO} />
            Claude
          </Grow>
          <Grow p={prog(t, HOOK_MCP, 0.45)} w={146}>
            <span style={{ marginLeft: 14 }}>·</span>
            <McpMark size={32} draw={prog(t, HOOK_MCP + 0.1, 0.6)} />
            MCP
          </Grow>
        </div>
      </Tag>
      <Tag t={t} win={TAG_CRM} dot={false}>
        <Img src={staticFile(AIRTABLE)} style={TAG_LOGO} />
        Airtable
        <div style={{ display: "flex", alignItems: "center", marginLeft: -14 }}>
          <Grow p={prog(t, CRM_AT, 0.45)} w={160}>
            <span style={{ marginLeft: 14 }}>·</span>
            mi CRM
          </Grow>
        </div>
      </Tag>
      <Tag t={t} win={TAG_ONE} pulses={[at("software")]}>un solo software</Tag>
      <Tag t={t} win={TAG_CTA} dot={false}>
        <Img src={staticFile(GITHUB)} style={TAG_LOGO} />
        <span style={{ textTransform: "none" }}>{REPO}</span>
      </Tag>
      {!inCutaway(t) && INK.map(([a, b, name, size, y]) => <Ink key={a} t={t} win={[a, b]} name={name} size={size} y={y} />)}
      <Caption t={t} />
      <Sfx fps={fps} />
    </AbsoluteFill>
  );
};
