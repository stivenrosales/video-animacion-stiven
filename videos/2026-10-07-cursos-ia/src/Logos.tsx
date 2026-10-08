import React from "react";
import logos from "./logos.json";

const Simple: React.FC<{ d: string; size: number; fill: string }> = ({ d, size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d={d} fill={fill} />
  </svg>
);

export const OpenAILogo: React.FC<{ size: number; color?: string }> = ({ size, color = "#000000" }) => (
  <Simple d={logos.openai} size={size} fill={color} />
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

export const YouTubeLogo: React.FC<{ size: number }> = ({ size }) => <Simple d={logos.youtube} size={size} fill="#FF0000" />;
