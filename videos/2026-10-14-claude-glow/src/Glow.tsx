import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadSerif } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { ArrowUp, ChevronDown, Plus, Pointer } from "lucide-react";
import T from "./timeline.json";

const serif = loadSerif("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
const serifItalic = loadSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const sans = loadSans("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
const mono = loadMono("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

const SPARK = "#D97757";
const INK = "#EDE6DC";

// Laptop screen inside the 1080x1920 frame (wider than the frame, cropped like a phone shot).
const SCR = { x: -20, y: 470, w: 1120, h: 660 };
const CX = SCR.w / 2;
const CY = SCR.h / 2;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (f: number, a: number, b: number, e = Easing.bezier(0.16, 1, 0.3, 1)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const expoInOut = Easing.bezier(0.87, 0, 0.13, 1);

// ---------- virtual camera inside the screen ----------
type Key = [number, number, number, number, ((t: number) => number)?];
const KEYS: Key[] = [
  [0, CX, CY, 1.22],
  [70, CX, CY, 1.0, Easing.bezier(0.33, 1, 0.68, 1)],
  [92, CX, CY - 8, 1.0],
  [T.typeStart, 440, 355, 1.75, expoInOut],
  [T.cursorIn, 650, 355, 1.8, Easing.inOut(Easing.sin)],
  [T.click - 4, 835, 383, 3.1, expoInOut],
  [T.whip, 835, 383, 3.3, Easing.bezier(0.33, 1, 0.68, 1)],
  [T.whip + 10, CX, 250, 1.75, expoInOut],
  [T.word1, CX, CY, 1.2, Easing.inOut(Easing.cubic)],
];
const cam = (f: number) => {
  if (f >= T.word1) {
    const t = ease(f, T.word1, T.duration, Easing.bezier(0.33, 1, 0.68, 1));
    return { x: CX, y: CY, s: 1.12 * Math.pow(1 / 1.12, t) };
  }
  let i = 0;
  while (i < KEYS.length - 1 && f > KEYS[i + 1][0]) i++;
  const a = KEYS[i];
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  if (a === b) return { x: a[1], y: a[2], s: a[3] };
  const t = (b[4] ?? ((v: number) => v))(Math.min(1, Math.max(0, (f - a[0]) / (b[0] - a[0]))));
  return {
    x: a[1] + (b[1] - a[1]) * t,
    y: a[2] + (b[2] - a[2]) * t,
    s: a[3] * Math.pow(b[3] / a[3], t),
  };
};

// ---------- pieces ----------
const Spark: React.FC<{ size: number; rotate?: number }> = ({ size, rotate = 0 }) => {
  const lengths = [1, 0.78, 0.92, 0.7, 0.97, 0.8, 0.9, 0.74, 1, 0.82, 0.88, 0.76];
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ transform: `rotate(${rotate}deg)`, overflow: "visible" }}>
      {lengths.map((l, i) => {
        const a = (i / lengths.length) * Math.PI * 2;
        return (
          <line key={i} x1={Math.cos(a) * 7} y1={Math.sin(a) * 7} x2={Math.cos(a) * 46 * l} y2={Math.sin(a) * 46 * l}
            stroke={SPARK} strokeWidth={8} strokeLinecap="round" />
        );
      })}
    </svg>
  );
};

const glowText = "0 0 18px rgba(255,190,160,0.45), 0 0 4px rgba(255,220,200,0.35)";

// Blur-in reveal for one token.
const Reveal: React.FC<{ f: number; at: number; out?: number; children: React.ReactNode; dy?: number }> = ({ f, at, out, children, dy = 14 }) => {
  const p = ease(f, at, at + 16);
  const q = out === undefined ? 0 : ease(f, out, out + 12, Easing.in(Easing.cubic));
  return (
    <span style={{
      display: "inline-block",
      opacity: p * (1 - q),
      filter: `blur(${(1 - p) * 12 + q * 10}px)`,
      transform: `translateY(${(1 - p) * dy - q * 10}px)`,
      whiteSpace: "pre",
    }}>{children}</span>
  );
};

const CODE: [string, string][] = [
  ["k", "import"], ["t", " { spring, useCurrentFrame } "], ["k", "from"], ["s", ' "remotion"'], ["n", ""],
  ["n", ""],
  ["k", "export const"], ["t", " Reel = () => {"], ["n", ""],
  ["t", "  "], ["k", "const"], ["t", " frame = useCurrentFrame();"], ["n", ""],
  ["t", "  "], ["k", "const"], ["t", " glow = spring({ frame, fps: "], ["s", "60"], ["t", " });"], ["n", ""],
  ["t", "  "], ["k", "return"], ["t", " ("], ["n", ""],
  ["t", "    <Screen light={glow}>"], ["n", ""],
  ["t", "      <Spark size={"], ["s", "64"], ["t", "} />"], ["n", ""],
  ["t", "      <Title>"], ["s", "Good morning, Stiven"], ["t", "</Title>"], ["n", ""],
  ["t", "      <Prompt text="], ["s", '"Help me build a reel"'], ["t", " />"], ["n", ""],
  ["t", "      <Send onClick={ship} />"], ["n", ""],
  ["t", "    </Screen>"], ["n", ""],
  ["t", "  );"], ["n", ""],
  ["t", "};"], ["n", ""],
];
const CODE_LINES: [string, string][][] = (() => {
  const lines: [string, string][][] = [[]];
  for (const tok of CODE) {
    if (tok[0] === "n") lines.push([]);
    else lines[lines.length - 1].push(tok);
  }
  return lines.filter((_, i, arr) => i < arr.length - 1);
})();
const tokColor = (k: string) => (k === "k" ? "#E9967A" : k === "s" ? "#E8C9A0" : "#F1E7DD");

// ---------- screen content (content space = SCR.w x SCR.h) ----------
const Content: React.FC<{ f: number }> = ({ f }) => {
  // spark ignite + title
  const ign = ease(f, T.ignite, T.ignite + 26, Easing.bezier(0.34, 1.56, 0.64, 1));
  const toGreet = ease(f, T.greet, T.greet + 22, expoInOut);
  const lift = ease(f, T.greet + 8, T.greet + 32, expoInOut);
  const groupY = CY - 80 * lift;
  const sparkSize = 66 - 20 * toGreet;
  const textW = T.claude > f ? 0 : interpolate(toGreet, [0, 1], [236, 528]);
  const sparkShift = ease(f, T.claude - 6, T.claude + 14, expoInOut);
  const uiOut = ease(f, T.whip, T.whip + 8, Easing.in(Easing.quad));

  // input box
  const box = ease(f, T.box, T.box + 22);
  const n = Math.floor(interpolate(f, [T.typeStart, T.typeEnd], [0, T.prompt.length], clamp));
  const typing = f >= T.typeStart && f < T.typeEnd + 4;
  const caretOn = typing || Math.floor(f / 18) % 2 === 0;

  // cursor + click
  const cur = ease(f, T.cursorIn, T.click - 3, Easing.bezier(0.22, 1, 0.36, 1));
  const press = interpolate(f, [T.click - 1, T.click + 2, T.click + 8], [1, 0.84, 1], clamp);
  const flash = interpolate(f, [T.click, T.click + 2, T.click + 16], [0, 1, 0], clamp);

  // code + final words
  const codeIn = ease(f, T.whip + 2, T.whip + 10);
  const codeOut = ease(f, T.word1 - 6, T.word1, Easing.in(Easing.quad));
  const w1 = f >= T.word1 && f < T.word2 + 6;
  const w2 = f >= T.word2 - 2 && f < T.spark + 6;
  const endSpark = ease(f, T.spark, T.spark + 22, Easing.bezier(0.34, 1.56, 0.64, 1));

  const showUI = f < T.whip + 8;
  const showCode = f >= T.whip && f < T.word1;

  return (
    <div style={{ position: "absolute", width: SCR.w, height: SCR.h }}>
      {/* panel light: Claude dark bg with a warm pool at the bottom */}
      <div style={{ position: "absolute", inset: 0, background: "#1E1D1B" }} />
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 70% 55% at 50% 108%, rgba(217,119,87,${0.1 + 0.32 * codeIn * (1 - codeOut) + 0.22 * (f >= T.word1 ? 1 : 0)}), transparent 70%)`,
      }} />

      {showUI && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - uiOut }}>
          {/* ignition flare */}
          <div style={{
            position: "absolute", left: CX - 160, top: CY - 160, width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,170,130,0.9), rgba(217,119,87,0.25) 35%, transparent 70%)",
            opacity: interpolate(f, [T.ignite, T.ignite + 6, T.ignite + 40], [0, 0.9, 0], clamp),
            transform: `scale(${0.4 + 1.2 * ease(f, T.ignite, T.ignite + 30)})`,
          }} />

          {/* spark + title */}
          <div style={{
            position: "absolute", left: 0, width: SCR.w, top: groupY - 60, height: 120,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * sparkShift,
          }}>
            <div style={{ transform: `scale(${ign})`, filter: `drop-shadow(0 0 ${14 + 30 * (1 - ign)}px rgba(255,140,100,0.8))` }}>
              <Spark size={sparkSize} rotate={-120 * (1 - ign) + f * 0.15} />
            </div>
            <div style={{ position: "relative", width: textW * sparkShift, height: 120 }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: 120, display: "flex", alignItems: "center",
                fontFamily: serif, fontSize: 80, color: INK, textShadow: glowText, letterSpacing: -1 }}>
                {"Claude".split("").map((c, i) => (
                  <Reveal key={i} f={f} at={T.claude + i * 3} out={T.greet + i * 1.5}>{c}</Reveal>
                ))}
              </div>
              <div style={{ position: "absolute", left: 0, top: 0, height: 120, display: "flex", alignItems: "center",
                fontFamily: serif, fontSize: 58, color: INK, textShadow: glowText, letterSpacing: -0.5, whiteSpace: "pre" }}>
                {["Good", " morning,", " Stiven"].map((w, i) => (
                  <Reveal key={i} f={f} at={T.greet + 8 + i * 6}>{w}</Reveal>
                ))}
              </div>
            </div>
          </div>

          {/* input box */}
          <div style={{
            position: "absolute", left: 250, top: 300, width: 620, height: 118, borderRadius: 22,
            background: "#2A2927", border: "1.5px solid rgba(255,255,255,0.09)",
            boxShadow: "0 0 40px rgba(255,170,140,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
            opacity: box, filter: `blur(${(1 - box) * 10}px)`,
            transform: `translateY(${(1 - box) * 24}px) scale(${0.94 + 0.06 * box})`,
          }}>
            <div style={{ position: "absolute", left: 26, top: 22, fontFamily: sans, fontSize: 21, color: n ? INK : "#8C8A83",
              textShadow: n ? "0 0 10px rgba(255,220,200,0.3)" : undefined, whiteSpace: "pre", display: "flex", alignItems: "center" }}>
              {n ? T.prompt.slice(0, n) : "How can I help you today?"}
              {f >= T.typeStart - 10 && caretOn && f < T.whip && (
                <span style={{ width: 2, height: 25, background: INK, marginLeft: 2, display: "inline-block" }} />
              )}
            </div>
            <div style={{ position: "absolute", left: 22, bottom: 16, color: "#9C9A92" }}><Plus size={22} /></div>
            <div style={{ position: "absolute", right: 70, bottom: 22, fontFamily: sans, fontSize: 15, color: "#9C9A92",
              display: "flex", alignItems: "center", gap: 4 }}>Opus 5.5 <ChevronDown size={14} /></div>
            <div style={{
              position: "absolute", right: 16, bottom: 14, width: 36, height: 36, borderRadius: 10,
              background: SPARK, display: "flex", alignItems: "center", justifyContent: "center",
              transform: `scale(${press})`,
              boxShadow: `0 0 ${10 + 50 * flash}px rgba(255,150,110,${0.4 + 0.6 * flash})`,
              filter: `brightness(${1 + 0.6 * flash})`,
            }}>
              <ArrowUp size={20} color="#fff" strokeWidth={2.4} />
            </div>
          </div>

          {/* hand cursor */}
          {f >= T.cursorIn && (
            <div style={{
              position: "absolute", left: 836 + 120 * (1 - cur), top: 386 + 90 * (1 - cur),
              opacity: cur, transform: `scale(${0.62 * (0.92 + 0.08 * press)})`, transformOrigin: "5px 2px",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
            }}>
              <Pointer size={34} color="#111" fill="#fff" strokeWidth={1.6} />
            </div>
          )}

          {/* click flash */}
          <div style={{
            position: "absolute", left: 835 - 120, top: 383 - 120, width: 240, height: 240, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,210,180,0.95), rgba(217,119,87,0.35) 30%, transparent 65%)",
            opacity: 0.75 * flash, transform: `scale(${0.6 + 0.8 * (1 - flash)})`,
          }} />
        </div>
      )}

      {/* code cascade */}
      {showCode && (
        <div style={{ position: "absolute", left: 300, top: 84, opacity: codeIn * (1 - codeOut), filter: `blur(${codeOut * 8}px)` }}>
          {CODE_LINES.map((line, i) => {
            const start = T.code + i * 2.4;
            const len = line.reduce((s, t) => s + t[1].length, 0);
            let shown = Math.floor(interpolate(f, [start, start + 9], [0, len], clamp));
            return (
              <div key={i} style={{ height: 27, fontFamily: mono, fontSize: 16.5, whiteSpace: "pre",
                textShadow: "0 0 12px rgba(255,180,140,0.55)" }}>
                {line.map((t, j) => {
                  const s = t[1].slice(0, Math.max(0, shown));
                  shown -= t[1].length;
                  return <span key={j} style={{ color: tokColor(t[0]) }}>{s}</span>;
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* final words */}
      {f >= T.word1 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {w1 && (
            <div style={{ position: "absolute", fontFamily: serif, fontSize: 132, color: INK, textShadow: glowText, letterSpacing: -2 }}>
              {"Code".split("").map((c, i) => <Reveal key={i} f={f} at={T.word1 + i * 2} out={T.word2 - 4} dy={24}>{c}</Reveal>)}
            </div>
          )}
          {w2 && (
            <div style={{ position: "absolute", fontFamily: serifItalic, fontSize: 118, color: INK, textShadow: glowText, letterSpacing: -1 }}>
              {"faster.".split("").map((c, i) => <Reveal key={i} f={f} at={T.word2 + i * 1.6} out={T.spark - 6} dy={24}>{c}</Reveal>)}
            </div>
          )}
          {f >= T.spark && (
            <>
              <div style={{
                position: "absolute", width: 360, height: 360, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,170,130,0.85), rgba(217,119,87,0.25) 35%, transparent 70%)",
                opacity: interpolate(f, [T.spark, T.spark + 5, T.spark + 34], [0, 0.85, 0.15], clamp),
              }} />
              <div style={{ transform: `scale(${endSpark})`, filter: "drop-shadow(0 0 22px rgba(255,140,100,0.85))" }}>
                <Spark size={92} rotate={-140 * (1 - endSpark) + f * 0.2} />
              </div>
            </>
          )}
        </div>
      )}

      {/* scanline-free panel vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.45))" }} />
    </div>
  );
};

// Screen content seen through the virtual camera, with directional motion blur from camera velocity.
const CameraView: React.FC<{ f: number; mb: boolean }> = ({ f, mb }) => {
  const c = cam(f);
  return (
    <div style={{ position: "absolute", inset: 0, filter: mb ? "url(#mblur)" : undefined }}>
      <div style={{
        position: "absolute", left: 0, top: 0, width: SCR.w, height: SCR.h,
        transformOrigin: "0 0",
        transform: `translate(${CX}px, ${CY}px) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`,
      }}>
        <Content f={f} />
      </div>
    </div>
  );
};

// How bright the screen is (drives the light it throws on the wall and keyboard).
const lightAt = (f: number) => {
  const ign = interpolate(f, [T.ignite, T.ignite + 6, T.ignite + 40], [0, 1, 0.35], clamp);
  const ui = interpolate(f, [T.claude, T.box + 20], [0.35, 0.55], clamp);
  const flash = interpolate(f, [T.click, T.click + 2, T.click + 18], [0, 0.6, 0], clamp);
  const code = interpolate(f, [T.whip, T.whip + 10, T.word1 - 4], [0, 0.25, 0.3], clamp) * (f < T.word1 ? 1 : 0);
  const end = interpolate(f, [T.word1, T.word1 + 10, T.spark, T.spark + 6, T.duration], [0, 0.55, 0.45, 0.95, 0.55], clamp);
  return Math.min(1, Math.max(ign, ui * (f < T.word1 ? 1 : 0)) + flash + code + end * (f >= T.word1 ? 1 : 0));
};

const Keyboard: React.FC<{ L: number }> = ({ L }) => {
  const rows = [14, 14, 13, 12, 11];
  return (
    <div style={{ position: "absolute", left: -140, top: 1196, width: 1360, height: 560, perspective: 900, filter: "blur(2.6px)" }}>
      <div style={{ transform: "rotateX(52deg)", transformOrigin: "50% 0", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ width: 70, height: 34, borderRadius: 8, background: "#141416",
              boxShadow: `inset 0 1px 0 rgba(255,190,160,${0.05 + 0.18 * L})` }} />
          ))}
        </div>
        {rows.map((k, r) => (
          <div key={r} style={{ display: "flex", gap: 14 }}>
            {Array.from({ length: k }).map((_, i) => (
              <div key={i} style={{ width: r === 4 && i === 5 ? 380 : 76, height: 76, borderRadius: 10, background: "#161618",
                boxShadow: `inset 0 2px 0 rgba(255,200,175,${0.05 + 0.2 * L}), 0 4px 0 #09090a` }}>
                <div style={{ width: 10, height: 4, margin: "16px 0 0 14px", borderRadius: 2, background: `rgba(255,235,220,${0.07 + 0.14 * L})` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Glow: React.FC = () => {
  const f = useCurrentFrame();
  const L = lightAt(f);

  // camera velocity -> motion blur
  const a = cam(f - 1);
  const b = cam(f);
  const sameShot = !(f === T.word1);
  const vx = sameShot ? Math.abs(b.s * (a.x - b.x)) : 0;
  const vy = sameShot ? Math.abs(b.s * (a.y - b.y)) : 0;
  const vz = sameShot ? Math.abs(Math.log(b.s / a.s)) * 140 : 0;
  const sx = Math.min(36, vx * 0.42 + vz);
  const sy = Math.min(36, vy * 0.42 + vz);
  const mb = sx + sy > 0.6;

  // handheld phone
  const hx = 4 * Math.sin(f * 0.031) + 2.2 * Math.sin(f * 0.073 + 1.3);
  const hy = 3.2 * Math.sin(f * 0.027 + 0.5) + 1.8 * Math.sin(f * 0.061 + 2.1);
  const hr = 0.28 * Math.sin(f * 0.021 + 0.7);
  const push = 1.035 + 0.025 * (f / T.duration);

  const warm = interpolate(f, [T.click, T.whip + 10], [0, 1], clamp);
  const spill = (alpha: number) => `rgba(${Math.round(190 + 27 * warm)},${Math.round(140 - 21 * warm)},${Math.round(150 - 63 * warm)},${alpha})`;

  const screen = (extra: React.CSSProperties, key: string) => (
    <div key={key} style={{ position: "absolute", left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, ...extra }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <CameraView f={f} mb={mb} />
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: "#0B0A0C" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="mblur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
        </filter>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 47} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      <AbsoluteFill style={{ transform: `translate(${hx}px, ${hy}px) rotate(${hr}deg) scale(${push})` }}>
        {/* wall lit by the screen */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 470,
          background: "linear-gradient(180deg, #121016 0%, #1d1820 55%, #2a2229 100%)" }} />
        <div style={{ position: "absolute", left: -300, top: -60, width: 1680, height: 600,
          background: `radial-gradient(ellipse 50% 70% at 50% 100%, ${spill(0.18 + 0.42 * L)}, transparent 75%)` }} />

        {/* lid bezel */}
        <div style={{ position: "absolute", left: -40, top: 436, width: 1160, height: 34, background: "#0A0A0B",
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.07)" }} />

        {/* screen + bloom */}
        {screen({}, "sharp")}
        {screen({ filter: "contrast(3.2) blur(12px)", opacity: 0.7, mixBlendMode: "screen" }, "bloom")}
        {screen({ filter: "contrast(3.2) blur(44px)", opacity: 0.5 + 0.35 * L, mixBlendMode: "screen" }, "halo")}
        {/* faint glass glare */}
        <div style={{ position: "absolute", left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h,
          background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.025) 45%, transparent 60%)" }} />

        {/* hinge + deck */}
        <div style={{ position: "absolute", left: -40, top: SCR.y + SCR.h, width: 1160, height: 40, background: "#08080a" }} />
        <div style={{ position: "absolute", left: -40, top: SCR.y + SCR.h + 40, width: 1160, height: 800,
          background: "linear-gradient(180deg, #19181b 0%, #111113 40%, #0b0b0c 100%)" }} />
        <div style={{ position: "absolute", left: -200, top: SCR.y + SCR.h + 30, width: 1480, height: 520,
          background: `radial-gradient(ellipse 50% 45% at 50% 0%, ${spill(0.1 + 0.3 * L)}, transparent 80%)` }} />
        <Keyboard L={L} />
        <div style={{ position: "absolute", left: 330, top: 1700, width: 420, height: 260, borderRadius: 18,
          background: "#0f0f11", boxShadow: `inset 0 1px 0 rgba(255,200,175,${0.03 + 0.06 * L})`, filter: "blur(5px)" }} />
      </AbsoluteFill>

      {/* lens: vignette + grain */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 65% at 50% 42%, transparent 50%, rgba(0,0,0,0.6))" }} />
      <AbsoluteFill style={{ filter: "url(#grain)", opacity: 0.09, mixBlendMode: "overlay" }} />

      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
