// ============================================================
// INNER CRITIC CHARACTER â€” Sheet 1: Anxious, sweating, big eyes
// Used as the inner voice / overthinking mind / panic entity
// ============================================================
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS } from './tokens';
import { floatY, sweatDrip } from './motion';

export type CriticExpression = 'panicked' | 'exhausted' | 'anxious' | 'defeated' | 'neutral';

interface InnerCriticProps {
  x: number;
  y: number;
  scale?: number;
  expression?: CriticExpression;
  animated?: boolean;
}

const CriticHead: React.FC<{ expression: CriticExpression }> = ({ expression }) => {
  const frame = useCurrentFrame();
  const r = 95; // Oversized head â€” the defining feature

  // Eye size explodes on panic
  const eyeScale: Record<CriticExpression, number> = {
    panicked:  1.4,
    exhausted: 0.5,
    anxious:   1.1,
    defeated:  0.6,
    neutral:   0.9,
  };

  const eyeOpen = eyeScale[expression];
  const eyeW = 30 * eyeOpen;
  const eyeH = 38 * eyeOpen;

  // Sweat drops
  const sweat1 = sweatDrip(frame, 0);
  const sweat2 = sweatDrip(frame, 20);
  const sweat3 = sweatDrip(frame, 40);

  return (
    <g>
      {/* Head â€” large, slightly oval, rough sketch look */}
      <ellipse cx={0} cy={0} rx={r} ry={r * 1.08}
        fill={COLORS.CRITIC_SKIN}
        stroke="#C0B8A8" strokeWidth={2.5} />

      {/* Head shadow */}
      <ellipse cx={6} cy={r * 0.2} rx={r * 0.85} ry={r * 0.35}
        fill="#C0B8A8" opacity={0.2} />

      {/* ---- LEFT EYE â€” large, expressive ---- */}
      <g transform={`translate(-34, 2)`}>
        <ellipse cx={0} cy={0} rx={eyeW} ry={eyeH} fill="white" />
        {/* Iris */}
        <ellipse cx={0} cy={expression === 'panicked' ? 2 : 0}
          rx={eyeW * 0.55} ry={eyeH * 0.55} fill="#444" />
        {/* Pupil */}
        <ellipse cx={0} cy={expression === 'panicked' ? 2 : 0}
          rx={eyeW * 0.28} ry={eyeH * 0.28} fill="#111" />
        {/* Highlight */}
        <ellipse cx={-eyeW * 0.25} cy={-eyeH * 0.25} rx={4} ry={4} fill="white" opacity={0.9} />
        {/* Panic lines */}
        {expression === 'panicked' && (
          <>
            <line x1={-eyeW - 8} y1={-eyeH * 0.3} x2={-eyeW - 20} y2={-eyeH * 0.5}
              stroke="#888" strokeWidth={2} />
            <line x1={-eyeW - 6} y1={eyeH * 0.3} x2={-eyeW - 18} y2={eyeH * 0.5}
              stroke="#888" strokeWidth={2} />
          </>
        )}
        {/* Eyelid for tired */}
        {(expression === 'exhausted' || expression === 'defeated') && (
          <ellipse cx={0} cy={-eyeH * 0.3} rx={eyeW + 2} ry={eyeH * 0.6}
            fill={COLORS.CRITIC_SKIN} />
        )}
      </g>

      {/* ---- RIGHT EYE ---- */}
      <g transform={`translate(34, 2)`}>
        <ellipse cx={0} cy={0} rx={eyeW} ry={eyeH} fill="white" />
        <ellipse cx={0} cy={expression === 'panicked' ? 2 : 0}
          rx={eyeW * 0.55} ry={eyeH * 0.55} fill="#444" />
        <ellipse cx={0} cy={expression === 'panicked' ? 2 : 0}
          rx={eyeW * 0.28} ry={eyeH * 0.28} fill="#111" />
        <ellipse cx={-eyeW * 0.25} cy={-eyeH * 0.25} rx={4} ry={4} fill="white" opacity={0.9} />
        {expression === 'panicked' && (
          <>
            <line x1={eyeW + 8} y1={-eyeH * 0.3} x2={eyeW + 20} y2={-eyeH * 0.5}
              stroke="#888" strokeWidth={2} />
            <line x1={eyeW + 6} y1={eyeH * 0.3} x2={eyeW + 18} y2={eyeH * 0.5}
              stroke="#888" strokeWidth={2} />
          </>
        )}
        {(expression === 'exhausted' || expression === 'defeated') && (
          <ellipse cx={0} cy={-eyeH * 0.3} rx={eyeW + 2} ry={eyeH * 0.6}
            fill={COLORS.CRITIC_SKIN} />
        )}
      </g>

      {/* ---- MOUTH ---- */}
      {expression === 'panicked' && (
        <path d="M-18 55 Q0 70 18 55" fill="none" stroke="#555" strokeWidth={2.5} strokeLinecap="round" />
      )}
      {expression === 'anxious' && (
        // Hands on face â€” small circles for hands
        <>
          <ellipse cx={-28} cy={45} rx={18} ry={16} fill={COLORS.CRITIC_SKIN} stroke="#C0B8A8" strokeWidth={2} />
          <ellipse cx={28} cy={45} rx={18} ry={16} fill={COLORS.CRITIC_SKIN} stroke="#C0B8A8" strokeWidth={2} />
          <path d="M-14 50 Q0 42 14 50" fill="none" stroke="#555" strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {(expression === 'exhausted' || expression === 'defeated' || expression === 'neutral') && (
        <path d={`M-16 ${r * 0.52} Q0 ${r * 0.52 + (expression === 'defeated' ? -10 : 5)} 16 ${r * 0.52}`}
          fill="none" stroke="#888" strokeWidth={2.5} strokeLinecap="round" />
      )}

      {/* ---- SWEAT DROPS â€” always present ---- */}
      <g transform={`translate(${-r * 0.6}, ${-r * 0.3}) translate(0, ${sweat1.y})`}
        opacity={sweat1.opacity}>
        <path d="M0 0 Q-5 8 0 14 Q5 8 0 0" fill={COLORS.CRITIC_SWEAT} />
      </g>
      <g transform={`translate(${r * 0.5}, ${-r * 0.1}) translate(0, ${sweat2.y})`}
        opacity={sweat2.opacity}>
        <path d="M0 0 Q-4 7 0 12 Q4 7 0 0" fill={COLORS.CRITIC_SWEAT} />
      </g>
      <g transform={`translate(${0}, ${-r * 0.7}) translate(0, ${sweat3.y})`}
        opacity={sweat3.opacity}>
        <path d="M0 0 Q-3 5 0 9 Q3 5 0 0" fill={COLORS.CRITIC_SWEAT} />
      </g>
    </g>
  );
};

export const InnerCritic: React.FC<InnerCriticProps> = ({
  x, y, scale = 1, expression = 'anxious', animated = true,
}) => {
  const frame = useCurrentFrame();
  const floatOffset = animated ? floatY(frame, 7, 0.05) : 0;
  // Tiny stick-like limbs â€” the Sheet 1 character trait
  const bodyColor = '#3A3530';

  return (
    <g transform={`translate(${x}, ${y + floatOffset}) scale(${scale})`}>
      {/* Tiny dark body */}
      <rect x={-15} y={95} width={30} height={70} rx={12} fill={bodyColor} />
      {/* Stick arms */}
      <line x1={-15} y1={115} x2={-50} y2={150} stroke={bodyColor} strokeWidth={12} strokeLinecap="round" />
      <line x1={15} y1={115} x2={50} y2={150} stroke={bodyColor} strokeWidth={12} strokeLinecap="round" />
      {/* Stick legs */}
      <line x1={-10} y1={165} x2={-18} y2={215} stroke={bodyColor} strokeWidth={12} strokeLinecap="round" />
      <line x1={10} y1={165} x2={18} y2={215} stroke={bodyColor} strokeWidth={12} strokeLinecap="round" />
      {/* Head */}
      <CriticHead expression={expression} />
    </g>
  );
};
