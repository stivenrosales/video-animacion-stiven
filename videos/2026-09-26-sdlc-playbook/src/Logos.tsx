import React from "react";
import logos from "./logos.json";
import { C, sans } from "./theme";

/** TypeSafe AI isometric mark — the brand behind Jev (typesafe.ai). */
export const JevMark: React.FC<{ size: number; color?: string; style?: React.CSSProperties }> = ({
  size,
  color = C.jevInk,
  style,
}) => (
  <svg width={(size * 99) / 144} height={size} viewBox="0 0 99 144" style={style}>
    <path fillRule="evenodd" clipRule="evenodd" d={logos.typesafe} fill={color} />
  </svg>
);

/** Mark + "Jev" set in a tight grotesk like the TypeSafe wordmark. */
export const JevLogo: React.FC<{ size: number; gap?: number }> = ({ size, gap = 0.28 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * gap }}>
    <JevMark size={size} />
    <span
      style={{
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size * 1.02,
        letterSpacing: -size * 0.055,
        color: C.jevInk,
        lineHeight: 1,
        marginTop: -size * 0.08,
      }}
    >
      Jev
    </span>
  </div>
);

const Simple: React.FC<{ d: string; size: number; fill: string }> = ({ d, size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d={d} fill={fill} />
  </svg>
);

export const OpenAILogo: React.FC<{ size: number }> = ({ size }) => (
  <Simple d={logos.openai} size={size} fill="#000000" />
);

export const ClaudeLogo: React.FC<{ size: number }> = ({ size }) => (
  <Simple d={logos.claude} size={size} fill="#D97757" />
);

export const GeminiLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="gemini-grad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#1C7DFF" />
        <stop offset="0.52" stopColor="#8E75B2" />
        <stop offset="1" stopColor="#E0685C" />
      </linearGradient>
    </defs>
    <path d={logos.gemini} fill="url(#gemini-grad)" />
  </svg>
);
