// ============================================================
// DARK ENTITY â€” The addiction / inner demon
// Same shape as MainChar but black + glowing red eyes
// ============================================================
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from './tokens';

interface DarkEntityProps {
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  whisper?: string; // Text whispered by entity
  animated?: boolean;
}

export const DarkEntity: React.FC<DarkEntityProps> = ({
  x, y, scale = 1, opacity = 1, whisper, animated = true,
}) => {
  const frame = useCurrentFrame();
  // Slightly erratic float â€” unsettling
  const floatOffset = animated
    ? Math.sin(frame * 0.06) * 8 + Math.sin(frame * 0.13) * 3
    : 0;
  void floatOffset; // suppress if needed below
  // Eye glow pulse
  const eyeGlow = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1], [0.6, 1.0],
  );

  return (
    <g transform={`translate(${x}, ${y + floatOffset}) scale(${scale})`}
       opacity={opacity}>

      {/* Aura / shadow bloom behind entity */}
      <ellipse cx={10} cy={20} rx={80} ry={110}
        fill={COLORS.ENTITY_AURA}
        style={{ filter: 'blur(20px)' }} />

      {/* Body â€” near-black, same shape as MainChar torso */}
      <path
        d={`M-38 95 Q-42 185 -32 275 L32 275 Q42 185 38 95 Z`}
        fill={COLORS.ENTITY_BODY} />
      {/* Arms */}
      <path d="M-38 120 Q-72 165 -62 240"
        fill="none" stroke={COLORS.ENTITY_BODY} strokeWidth={28} strokeLinecap="round" />
      <path d="M38 120 Q72 165 62 240"
        fill="none" stroke={COLORS.ENTITY_BODY} strokeWidth={28} strokeLinecap="round" />
      {/* Legs */}
      <path d="M-25 275 Q-30 330 -22 370"
        fill="none" stroke={COLORS.ENTITY_BODY} strokeWidth={36} strokeLinecap="round" />
      <path d="M25 275 Q30 330 22 370"
        fill="none" stroke={COLORS.ENTITY_BODY} strokeWidth={36} strokeLinecap="round" />

      {/* Head â€” round, same as MainChar but black */}
      <ellipse cx={0} cy={0} rx={100} ry={105}
        fill={COLORS.ENTITY_BODY}
        stroke="rgba(255,0,0,0.1)" strokeWidth={2} />

      {/* Inner shadow on head â€” adds depth */}
      <ellipse cx={0} cy={20} rx={80} ry={70}
        fill="rgba(0,0,0,0.4)" />

      {/* Glowing red eyes â€” the defining feature */}
      <g opacity={eyeGlow}>
        {/* Left eye glow */}
        <ellipse cx={-30} cy={5} rx={22} ry={16}
          fill={COLORS.ENTITY_GLOW}
          style={{ filter: 'blur(6px)' }} />
        <ellipse cx={-30} cy={5} rx={12} ry={9}
          fill="#FF6644" />
        <ellipse cx={-30} cy={5} rx={6} ry={4}
          fill="#FFCC88" />

        {/* Right eye glow */}
        <ellipse cx={30} cy={5} rx={22} ry={16}
          fill={COLORS.ENTITY_GLOW}
          style={{ filter: 'blur(6px)' }} />
        <ellipse cx={30} cy={5} rx={12} ry={9}
          fill="#FF6644" />
        <ellipse cx={30} cy={5} rx={6} ry={4}
          fill="#FFCC88" />
      </g>

      {/* Thin smile â€” sinister */}
      <path d="M-20 55 Q0 68 20 55"
        fill="none" stroke="rgba(255,80,40,0.5)" strokeWidth={2} strokeLinecap="round" />

      {/* Whisper text bubble */}
      {whisper && (
        <g transform="translate(90, -40)">
          <rect x={0} y={0} width={whisper.length * 11 + 20} height={38}
            rx={8} fill="rgba(20,5,5,0.9)"
            stroke="rgba(255,30,0,0.4)" strokeWidth={1} />
          <text x={10} y={25}
            fill="rgba(255,180,160,0.95)"
            fontSize={18}
            fontFamily='"Patrick Hand", cursive'
            fontStyle="italic">
            {whisper}
          </text>
          {/* Bubble tail */}
          <path d="M0 15 L-10 20 L0 25" fill="rgba(20,5,5,0.9)" />
        </g>
      )}
    </g>
  );
};
