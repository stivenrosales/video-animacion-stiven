import React from "react";
import { siApple, siClaude, siGithub } from "simple-icons";
import { Img, Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { AppTile, Glass } from "./glass";
import { arrow, box, Ink } from "./hand";
import { ease, easeIn, In, Words } from "./ui";
import {
  A, C, claudeSerif, FPS, gaegu, GH, H, LAYOUT, lerp, oswald, panelShadow, pop, poppins, S, sans, serif, SERIF_AXES, sf, SOFT_AXES,
} from "./theme";

/** Every reveal is cued to a word timestamp in captions.json (edited timeline, seconds). */
export const CUES = {
  aparicion: [3.72, 5.91, 7.07, 11.95, 14.16, 21.34, 24.03, 25.82, 26.5, 29.2, 33.55, 34.62, 38.29, 39.18, 40.83],
  clic: [36.54, 38.36, 43.4],
};

const ser: React.CSSProperties = { fontFamily: serif, fontVariationSettings: SERIF_AXES };

const Icon: React.FC<{ path: string; color: string; size: number }> = ({ path, color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "none" }}>
    <path fill={color} d={path} />
  </svg>
);

type W = Array<{ w: string; at: number; key?: boolean }>;

/* ================================================================ Ali YouTube (base) */

/** White serif headline over the footage, keyword in salmon, words blur in as spoken. */
const Headline: React.FC<{ t: number; top: number; words: W; size?: number }> = ({ t, top, words, size = 84 }) => (
  <Words
    t={t}
    words={words}
    keyColor={A.salmonText}
    style={{
      ...ser,
      position: "absolute",
      left: 80,
      right: 80,
      top,
      textAlign: "center",
      color: "#fff",
      fontWeight: 560,
      fontSize: size,
      lineHeight: 1.08,
      letterSpacing: -1.2,
      textShadow: "0 2px 18px rgba(0,0,0,.25)",
    }}
  />
);

export const Hook: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline
      t={t}
      top={262}
      words={[
        { w: "Todos", at: 0.07 },
        { w: "los", at: 0.31 },
        { w: "videos", at: 0.5 },
        { w: "de", at: 1.76 },
        { w: "este", at: 1.76 },
        { w: "mes", at: 2.01 },
        { w: "y", at: 2.2 },
        { w: "el", at: 2.36 },
        { w: "pasado", at: 2.58, key: true },
      ]}
    />
    <In t={t} at={3.72} y={28} scale={0.9} style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          ...ser,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "16px 38px 18px 26px",
          borderRadius: 24,
          background: "#fff",
          color: A.ink,
          fontWeight: 650,
          fontSize: 54,
          boxShadow: "0 10px 30px rgba(0,0,0,.18)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, color: A.muted, marginRight: 4 }}>los editó</span>
        <Icon path={siClaude.path} color={C.spark} size={48} />
        Claude Opus 5.5
      </div>
    </In>
  </>
);

/** Ali's chat pills (salmon / sky, white serif text) stacking like DMs. */
export const Asked: React.FC<{ t: number }> = ({ t }) => {
  const items = [
    { text: "¿cómo lo haces?", at: 5.91, side: "right", bg: A.sky },
    { text: "¿con qué editas?", at: 6.25, side: "left", bg: A.salmon },
    { text: "¿me enseñas?", at: 6.6, side: "right", bg: A.sky },
  ] as const;
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: 270, display: "flex", flexDirection: "column", gap: 20 }}>
      {items.map(({ text, at, side, bg }) => (
        <In key={at} t={t} at={at} y={30} scale={0.9} style={{ alignSelf: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ ...ser, padding: "14px 34px 18px", borderRadius: 999, background: bg, color: "#fff", fontWeight: 600, fontSize: 48, boxShadow: "0 10px 30px rgba(0,0,0,.14)", whiteSpace: "nowrap" }}>
            {text}
          </div>
        </In>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------- split: citation (option C) */

const CITE_AT = 6.9;

/** Ali citing his own video: white card with the animated thumbnail, title and date. */
export const Citation: React.FC<{ t: number }> = ({ t }) => (
  <In t={t} at={7.07} y={40} scale={0.94} style={{ position: "absolute", left: 90, right: 90, top: 250 }}>
    <div style={{ height: 450, background: "#fff", borderRadius: 40, boxShadow: panelShadow, display: "flex", gap: 34, padding: 22, boxSizing: "border-box" }}>
      <div style={{ width: 228, height: 406, borderRadius: 24, overflow: "hidden", position: "relative", flex: "none", background: "#000" }}>
        <Sequence from={Math.round(CITE_AT * FPS)} layout="none">
          <Video src={staticFile("clips/opus-hook.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Sequence>
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 74, height: 74, margin: -37, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "grid", placeItems: "center" }}>
          <svg width={30} height={30} viewBox="0 0 24 24">
            <path d="M7 4.5v15l13-7.5z" fill={A.ink} />
          </svg>
        </div>
      </div>
      <div style={{ paddingTop: 40, minWidth: 0 }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 26, letterSpacing: 2, color: A.muted }}>MI REEL · 26 SEP</div>
        <div style={{ ...ser, fontWeight: 600, fontSize: 58, lineHeight: 1.08, letterSpacing: -1, color: A.ink, marginTop: 18 }}>
          Cómo edito videos con <span style={{ color: A.orange, fontWeight: 700 }}>Opus 5.5</span>
        </div>
        <In t={t} at={8.08} y={14} scale={1}>
          <div style={{ display: "inline-block", marginTop: 26, padding: "8px 22px 10px", borderRadius: 999, background: A.chip, fontFamily: sans, fontWeight: 600, fontSize: 28, color: A.chipText }}>
            paso a paso
          </div>
        </In>
      </div>
    </div>
  </In>
);

/* ---------------------------------------------------------------- split: GitHub */

const GithubHeader: React.FC<{ star?: React.ReactNode }> = ({ star }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "26px 30px 20px", borderBottom: `2px solid ${A.tileBorder}`, fontFamily: sans, fontSize: 29, color: GH.text }}>
    <Icon path={siGithub.path} color={GH.text} size={38} />
    <span style={{ whiteSpace: "nowrap" }}>
      <span style={{ color: GH.muted }}>stivenrosales / </span>
      <b style={{ fontWeight: 600 }}>video-animacion-stiven</b>
    </span>
    <span style={{ border: `2px solid ${GH.border}`, borderRadius: 999, padding: "1px 14px 3px", fontSize: 22, color: GH.muted, fontWeight: 500 }}>Public</span>
    <span style={{ flex: 1 }} />
    {star}
  </div>
);

const StarIcon: React.FC<{ size: number; fill: number }> = ({ size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block" }}>
    <path
      d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
      fill={fill > 0.5 ? GH.star : "none"}
      stroke={fill > 0.5 ? GH.star : GH.muted}
      strokeWidth={1.3}
    />
  </svg>
);

/** Rows of the real file list (public/gh-files.png, a 2x crop of the repo page, 1448 px wide). */
const FILES_W = 1448;
const ROW_SKILLS = { y: 191, h: 82 }; // "skills/talking-head-reel" row inside the crop

export const Repo: React.FC<{ t: number }> = ({ t }) => {
  const inner = 900; // panel 90..990
  const k = 1.25 * inner / FILES_W; // zoomed: names + commit messages, dates cropped
  const hl = ease(t, 14.16, 0.5); // "estilos"
  return (
    <In t={t} at={11.95} y={40} scale={0.94} style={{ position: "absolute", left: 90, right: 90, top: 245 }}>
      <div style={{ background: "#fff", borderRadius: 40, boxShadow: panelShadow, overflow: "hidden", height: 445 }}>
        <GithubHeader
          star={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, border: `2px solid ${GH.border}`, borderRadius: 12, background: GH.btn, padding: "4px 12px", fontWeight: 600, fontSize: 24 }}>
              <StarIcon size={22} fill={0} />5
            </span>
          }
        />
        <div style={{ position: "relative", height: 340, overflow: "hidden", opacity: ease(t, 12.4, 0.5) }}>
          <Img src={staticFile("gh-files.png")} style={{ position: "absolute", left: 0, top: -6, width: FILES_W * k }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: ROW_SKILLS.y * k - 6,
              height: ROW_SKILLS.h * k,
              width: inner * hl,
              background: "rgba(241,126,60,.16)",
              mixBlendMode: "multiply",
            }}
          />
        </div>
      </div>
    </In>
  );
};

/* ---------------------------------------------------------------- off: "3 tipos" text slide */

const StyleChip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 36px 14px 16px", borderRadius: 999, background: "#fff", boxShadow: panelShadow, fontFamily: sans, fontWeight: 600, fontSize: 42, color: A.ink, whiteSpace: "nowrap" }}>
    {icon}
    {label}
  </div>
);

const roundIcon = (bg: string, child: React.ReactNode) => (
  <div style={{ width: 76, height: 76, borderRadius: "50%", background: bg, display: "grid", placeItems: "center", overflow: "hidden", flex: "none" }}>{child}</div>
);

export const ThreeSlide: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Words
      t={t}
      keyColor={A.orange}
      words={[
        { w: "Dentro", at: 19.9 },
        { w: "hay", at: 20.6 },
        { w: "3", at: 21.34, key: true },
        { w: "formas", at: 21.57 },
        { w: "de", at: 22.01 },
        { w: "editar", at: 22.59, key: true },
      ]}
      style={{ ...ser, position: "absolute", left: 80, right: 80, top: 560, textAlign: "center", color: A.ink, fontWeight: 600, fontSize: 104, lineHeight: 1.08, letterSpacing: -2 }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      {[
        { at: 21.45, icon: roundIcon("#F5F4ED", <Icon path={siClaude.path} color={C.spark} size={36} />), label: "Claude" },
        { at: 21.65, icon: roundIcon("#eee", <Img src={staticFile("ali.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 20%" }} />), label: "Ali Abdaal" },
        { at: 21.85, icon: roundIcon("linear-gradient(180deg,#5A5A60,#1C1C1E)", <Icon path={siApple.path} color="#fff" size={32} />), label: "Liquid Glass" },
      ].map(({ at, icon, label }, i) => (
        <In key={label} t={t} at={at} y={30} scale={0.9}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ ...ser, fontWeight: 700, fontSize: 58, color: A.orange, width: 50, textAlign: "right" }}>{i + 1}</span>
            <StyleChip icon={icon} label={label} />
          </div>
        </In>
      ))}
    </div>
  </>
);

/* ================================================================ Style 1 · Claude Carousel */

export const ClaudeStyle: React.FC<{ t: number }> = ({ t }) => (
  <>
    <In t={t} at={23.4} y={20} scale={1} style={{ position: "absolute", left: 90, top: 262 }}>
      <div style={{ fontFamily: claudeSerif, fontWeight: 500, fontSize: 66, color: C.ink, letterSpacing: -1 }}>
        Estilo <span style={{ color: H.clay, fontStyle: "italic" }}>gráfico</span> de Claude
      </div>
    </In>
    <Ink
      t={t}
      strokes={(s) => [
        box(s, 90, 400, 420, 180, H.ivory, 24.03),
        ...arrow(s + 5, [[525, 490], [560, 470], [592, 490]], 25.6),
        box(s + 9, 600, 400, 390, 180, H.peach, 25.82),
      ]}
    />
    <div style={{ position: "absolute", left: 90, top: 400, width: 420, height: 180, display: "flex", alignItems: "center", gap: 22, padding: "0 30px", boxSizing: "border-box", opacity: ease(t, 24.25, 0.4) }}>
      <div style={{ width: 92, height: 92, borderRadius: 14, background: H.clay, display: "grid", placeItems: "center", boxShadow: `inset 0 0 0 4px ${C.ink}`, flex: "none" }}>
        <Icon path={siClaude.path} color="#fff" size={56} />
      </div>
      <div style={{ fontFamily: claudeSerif, fontSize: 40, lineHeight: 1.1, color: C.ink }}>Claude</div>
    </div>
    <div style={{ position: "absolute", left: 600, top: 400, width: 390, height: 180, display: "grid", placeItems: "center", opacity: ease(t, 26.0, 0.4) }}>
      <div style={{ fontFamily: claudeSerif, fontSize: 40, lineHeight: 1.1, color: C.ink, textAlign: "center" }}>
        me gusta
        <br />
        <i>bastante</i>
      </div>
    </div>
  </>
);

/* ================================================================ Style 2 · Ali Abdaal Shorts */

export const AliShorts: React.FC<{ t: number }> = ({ t }) => {
  const glow = 0.5 + 0.15 * Math.sin(t * 3);
  return (
    <>
      <In t={t} at={26.5} y={24} scale={0.9} style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 130,
            height: 86,
            border: `4px solid ${S.gold}`,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontFamily: serif,
            fontStyle: "italic",
            fontVariationSettings: SOFT_AXES,
            fontWeight: 700,
            fontSize: 56,
            color: S.gold,
            boxShadow: `0 0 40px rgba(247,201,91,${glow}), 0 0 90px rgba(141,140,255,.35)`,
          }}
        >
          2
        </div>
        <div style={{ fontFamily: oswald, fontWeight: 600, fontSize: 34, letterSpacing: 2.6, color: S.gold }}>
          SEGUNDO <span style={{ color: "#fff" }}>ESTILO:</span>
        </div>
      </In>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 362,
          textAlign: "center",
          fontFamily: serif,
          fontVariationSettings: SOFT_AXES,
          fontWeight: 600,
          fontSize: 78,
          letterSpacing: -1,
          color: "#fff",
          textShadow: "0 2px 20px rgba(0,0,0,.25)",
          whiteSpace: "nowrap",
        }}
      >
        {[
          { w: "El", at: 28.2 },
          { w: "estilo", at: 28.37 },
          { w: "de", at: 28.82 },
          { w: "Ali", at: 28.97, gold: true },
          { w: "Abdaal", at: 29.19, gold: true },
        ].map(({ w, at, gold }) => {
          const p = ease(t, at, 0.4);
          return (
            <span key={w} style={{ display: "inline-block", marginRight: 18, opacity: lerp(0.0, 1, p), filter: p < 0.999 ? `blur(${(1 - p) * 10}px)` : undefined, color: gold ? S.gold : "#fff", fontStyle: gold ? "italic" : "normal" }}>
              {w}
            </span>
          );
        })}
      </div>
      <In t={t} at={29.45} y={30} scale={0.86} style={{ position: "absolute", left: 110, top: 470 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", borderRadius: 999, padding: "12px 42px 12px 12px", boxShadow: `0 0 50px rgba(255,255,255,${0.45 * glow + 0.2}), 0 10px 30px rgba(0,0,0,.15)` }}>
          <Img src={staticFile("ali.jpg")} style={{ width: 112, height: 112, borderRadius: "50%", objectFit: "cover", objectPosition: "45% 20%" }} />
          <div>
            <div style={{ fontFamily: poppins, fontWeight: 700, fontSize: 40, color: S.ink, lineHeight: 1.1 }}>Ali Abdaal</div>
            <div style={{ fontFamily: poppins, fontWeight: 600, fontSize: 26, color: S.upcoming }}>YouTuber</div>
          </div>
        </div>
      </In>
      <In t={t} at={31.65} y={14} scale={0.95} style={{ position: "absolute", left: 610, top: 462 }}>
        <div style={{ fontFamily: gaegu, fontWeight: 700, fontSize: 46, lineHeight: 1.0, color: S.mint, textShadow: "0 2px 10px rgba(0,0,0,.28)" }}>
          ← un creador
          <br />
          que admiro
        </div>
      </In>
    </>
  );
};

/* ================================================================ Style 3 · Liquid Glass */

const AppleTile: React.FC<{ size: number }> = ({ size }) => (
  <AppTile size={size} bg="linear-gradient(180deg,#5A5A60,#1C1C1E)">
    <Icon path={siApple.path} color="#fff" size={size * 0.56} />
  </AppTile>
);

/** Glass that slides in from above with a spring; the backdrop keeps refracting while it moves. */
const Drop: React.FC<{ t: number; at: number; out?: number; children: React.ReactNode }> = ({ t, at, out, children }) => {
  if (t < at - 0.02) return null;
  const p = pop(t, at, { damping: 17, stiffness: 160, mass: 0.8 });
  const o = out !== undefined ? easeIn(t, out, 0.35) : 0;
  if (o >= 0.999) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, p * 1.5) * (1 - o), transform: `translateY(${(1 - p) * -60 - o * 40}px)` }}>{children}</div>
  );
};

const SEG_X = 36.54; // "Liquid"
const ANSWER = 37.85; // "verdad"

export const LiquidGlass: React.FC<{ t: number }> = ({ t }) => {
  const seg = ease(t, SEG_X, 0.7);
  const yes = ease(t, 38.29, 0.35); // "sí"
  const knob = ease(t, 38.36, 0.4);
  return (
    <>
      {/* "Y tercero, quise probar": Apple notification */}
      <Drop t={t} at={33.55} out={34.5}>
        <Glass x={70} y={262} w={940} h={176} r={52}>
          <div style={{ display: "flex", alignItems: "center", height: "100%", padding: "0 34px", gap: 28, fontFamily: sf }}>
            <AppleTile size={96} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b style={{ fontSize: 38 }}>Estilo 3</b>
                <span style={{ fontSize: 28, opacity: 0.8 }}>ahora</span>
              </div>
              <div style={{ fontSize: 36, opacity: 0.95, marginTop: 6 }}>Liquid Glass de Apple</div>
            </div>
          </div>
        </Glass>
      </Drop>
      {/* "¿se puede aplicar en la edición…?": alert asks, segmented control slides */}
      <Drop t={t} at={34.62} out={ANSWER - 0.05}>
        <Glass x={130} y={250} w={820} h={262} r={56} tint="dark" refract={40} frost={5}>
          <div style={{ fontFamily: sf, textAlign: "center", padding: "26px 40px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AppleTile size={64} />
            </div>
            <div style={{ fontSize: 44, fontWeight: 700, marginTop: 16 }}>¿Se puede en la edición?</div>
            <div style={{ fontSize: 30, opacity: 0.85, marginTop: 8 }}>Liquid Glass en un reel</div>
          </div>
        </Glass>
        <Glass x={190} y={528} w={700} h={92} r={46} refract={30} bezel={24} />
        <Glass x={198 + 334 * seg} y={535} w={342} h={78} r={39} refract={62} bezel={40} frost={0.4} />
        <div style={{ position: "absolute", left: 190, top: 528, width: 700, height: 92, display: "flex", alignItems: "center", fontFamily: sf, fontSize: 38, fontWeight: 600, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.28)" }}>
          <span style={{ flex: 1, textAlign: "center", opacity: lerp(1, 0.7, seg) }}>Edición</span>
          <span style={{ flex: 1, textAlign: "center", opacity: lerp(0.7, 1, seg) }}>Liquid Glass</span>
        </div>
      </Drop>
      {/* "y la verdad que sí se puede": the alert answers */}
      <Drop t={t} at={ANSWER}>
        <Glass x={130} y={250} w={820} h={346} r={56} tint="dark" refract={40} frost={5}>
          <div style={{ fontFamily: sf, textAlign: "center", padding: "28px 40px" }}>
            <div style={{ fontSize: 44, fontWeight: 700 }}>¿Se puede en la edición?</div>
            <div style={{ display: "flex", gap: 22, marginTop: 26, position: "relative", height: 96 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, fontSize: 38, fontWeight: 600 }}>
              Liquid Glass
              <span style={{ width: 130, height: 70, borderRadius: 35, position: "relative", background: `rgba(${Math.round(lerp(120, 52, knob))},${Math.round(lerp(120, 199, knob))},${Math.round(lerp(128, 89, knob))},${lerp(0.45, 1, knob)})`, boxShadow: "inset 0 1px 2px rgba(255,255,255,.4)" }}>
                <i style={{ position: "absolute", left: lerp(6, 66, knob), top: 6, width: 58, height: 58, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }} />
              </span>
            </div>
          </div>
        </Glass>
        <Glass x={170} y={348} w={359} h={96} r={48} refract={30} bezel={26}>
          <div style={{ height: "100%", display: "grid", placeItems: "center", fontFamily: sf, fontSize: 38, fontWeight: 600 }}>No</div>
        </Glass>
        <Glass x={551} y={348} w={359} h={96} r={48} refract={30} bezel={26} tint={yes > 0.5 ? "green" : "clear"} style={{ transform: `scale(${1 + 0.06 * Math.sin(Math.PI * yes)})` }}>
          <div style={{ height: "100%", display: "grid", placeItems: "center", fontFamily: sf, fontSize: 38, fontWeight: 700 }}>Sí se puede</div>
        </Glass>
      </Drop>
    </>
  );
};

/* ---------------------------------------------------------------- split: free repo + star CTA */

const QUERY = "video-animacion-stiven";
const TYPE_AT = 41.51; // "puedes buscar"
const TYPE_END = 42.2;

export const RepoFree: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.round(QUERY.length * Math.min(1, Math.max(0, (t - TYPE_AT) / (TYPE_END - TYPE_AT))));
  return (
    <>
      <In t={t} at={39.18} y={40} scale={0.94} style={{ position: "absolute", left: 90, right: 90, top: 262 }}>
        <div style={{ background: "#fff", borderRadius: 40, boxShadow: panelShadow, overflow: "hidden" }}>
          <GithubHeader />
          <div style={{ display: "flex", gap: 16, padding: "24px 34px 30px" }}>
            {[
              { label: "Gratis", at: 40.83, bg: "#DAFBE1", color: GH.green },
              { label: "Apache-2.0", at: 41.0, bg: A.chip, color: A.chipText },
              { label: "Remotion + FFmpeg + Whisper", at: 41.15, bg: A.chip, color: A.chipText },
            ].map(({ label, at, bg, color }) => (
              <In key={label} t={t} at={at} y={16} scale={0.9}>
                <span style={{ display: "inline-block", padding: "10px 24px 12px", borderRadius: 999, background: bg, fontFamily: sans, fontWeight: 600, fontSize: 27, color, whiteSpace: "nowrap" }}>{label}</span>
              </In>
            ))}
          </div>
        </div>
      </In>
      <In t={t} at={41.4} y={24} scale={0.96} style={{ position: "absolute", left: 90, right: 90, top: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, height: 96, padding: "0 30px", background: "#fff", borderRadius: 999, boxShadow: panelShadow, fontFamily: sans, fontSize: 34, color: GH.text }}>
          <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={GH.muted} strokeWidth={2.4} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <span>
            {QUERY.slice(0, n)}
            <span style={{ display: "inline-block", width: 3, height: 38, marginLeft: 3, verticalAlign: -6, background: A.ink, opacity: Math.floor(t * 2.5) % 2 ? 0.2 : 1 }} />
          </span>
        </div>
      </In>
    </>
  );
};

const CLICK = 43.4; // "estrellita"

export const StarCta: React.FC<{ t: number }> = ({ t }) => {
  const press = t >= CLICK ? Math.sin(Math.PI * Math.min(1, (t - CLICK) / 0.22)) : 0;
  const filled = t >= CLICK + 0.06 ? 1 : 0;
  const bump = pop(t, CLICK + 0.06, { damping: 9, stiffness: 220 });
  const cur = ease(t, 42.6, 0.75);
  const burst = ease(t, CLICK + 0.06, 0.6);
  return (
    <>
      <In t={t} at={42.4} y={12} scale={1} style={{ position: "absolute", left: 0, right: 0, top: 262, textAlign: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: 1, color: A.muted }}>
          <Icon path={siGithub.path} color={A.ink} size={30} />
          github.com/stivenrosales/video-animacion-stiven
        </span>
      </In>
      <In t={t} at={42.37} y={40} scale={0.8} style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", transform: `scale(${1 - 0.06 * press + 0.08 * Math.sin(Math.PI * Math.min(1, bump))})` }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2;
            const r = 140 + 120 * burst;
            return (
              <div key={i} style={{ position: "absolute", left: 70 + Math.cos(a) * r, top: 70 + Math.sin(a) * r * 0.6, width: 16, height: 16, borderRadius: "50%", background: GH.star, opacity: burst > 0 ? 1 - burst : 0 }} />
            );
          })}
          <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "26px 40px", borderRadius: 26, border: `3px solid ${GH.border}`, background: GH.btn, boxShadow: "0 20px 50px rgba(60,40,20,.12)", fontFamily: sans, fontWeight: 600, fontSize: 64, color: GH.text }}>
            <StarIcon size={66} fill={filled} />
            {filled ? "Starred" : "Star"}
            <span style={{ background: GH.counter, borderRadius: 999, padding: "2px 28px 6px", fontSize: 56 }}>{filled ? 6 : 5}</span>
          </div>
        </div>
      </In>
      <div style={{ position: "absolute", left: lerp(820, 392, cur), top: lerp(720, 432, cur), opacity: ease(t, 42.5, 0.3), transform: `scale(${1 - 0.12 * press})` }}>
        <svg width={64} height={64} viewBox="0 0 24 24">
          <path d="M4 2l16 9-7 1.5L9.5 20z" fill={A.ink} stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

export { LAYOUT };
