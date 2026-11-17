// ============================================================
// MAIN CHARACTER â€” Sheet 2: Exhausted, hunched, bloodshot eyes
// The "YOU" protagonist for every psychology video
// ============================================================
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, SIZES } from './tokens';
import { floatY } from './motion';

export type CharExpression =
  | 'neutral'
  | 'extremely_tired'
  | 'yawning'
  | 'irritated'
  | 'phone_glow'
  | 'determined'
  | 'sad'
  | 'shocked';

export type CharPose =
  | 'standing'
  | 'hunched'
  | 'sitting_bed'
  | 'sitting_couch'
  | 'walking'
  | 'lying_down';

interface MainCharProps {
  x: number;
  y: number;
  scale?: number;
  expression?: CharExpression;
  pose?: CharPose;
  facing?: 'left' | 'right';
  phoneGlow?: boolean;
  animated?: boolean;
}

// ---- Sub-components ----

const Head: React.FC<{ expression: CharExpression; phoneGlow: boolean }> = ({
  expression,
  phoneGlow,
}) => {
  const r = SIZES.CHAR_HEAD_R;

  // Eye parameters per expression
  const eyeConfig: Record<CharExpression, { 
    openness: number; 
    pupils: number; 
    darkCircle: number;
    tilt: number;
    mouthCurve: number;
  }> = {
    neutral:         { openness: 0.45, pupils: 0.4,  darkCircle: 0.6, tilt: 0,    mouthCurve: 0    },
    extremely_tired: { openness: 0.2,  pupils: 0.3,  darkCircle: 0.9, tilt: -3,   mouthCurve: -0.3 },
    yawning:         { openness: 0.9,  pupils: 0.6,  darkCircle: 0.8, tilt: 0,    mouthCurve: -0.8 },
    irritated:       { openness: 0.3,  pupils: 0.5,  darkCircle: 0.7, tilt: -6,   mouthCurve: -0.2 },
    phone_glow:      { openness: 0.25, pupils: 0.35, darkCircle: 1.0, tilt: -2,   mouthCurve: -0.1 },
    determined:      { openness: 0.55, pupils: 0.5,  darkCircle: 0.3, tilt: -4,   mouthCurve: 0.1  },
    sad:             { openness: 0.35, pupils: 0.4,  darkCircle: 0.8, tilt: 3,    mouthCurve: -0.5 },
    shocked:         { openness: 0.9,  pupils: 0.65, darkCircle: 0.4, tilt: 0,    mouthCurve: -0.1 },
  };

  const cfg = eyeConfig[expression];
  const eyeW = 28;
  const eyeH = 36 * cfg.openness;
  const leftEyeX = -32;
  const rightEyeX = 32;
  const eyeY = 5;

  // Phone glow â€” blue light from below
  const phoneLightColor = phoneGlow ? 'rgba(100,160,255,0.45)' : 'transparent';

  return (
    <g>
      {/* Phone light from below */}
      {phoneGlow && (
        <ellipse cx={0} cy={r * 0.6} rx={r * 0.9} ry={r * 0.4}
          fill={phoneLightColor} style={{ filter: 'blur(18px)' }} />
      )}

      {/* Head shape â€” round, bald */}
      <ellipse cx={0} cy={0} rx={r} ry={r * 1.05}
        fill={phoneGlow ? '#B8B0A4' : COLORS.CHAR_SKIN}
        stroke={COLORS.CHAR_SKIN_SHADOW} strokeWidth={2} />

      {/* Head shadow â€” bottom */}
      <ellipse cx={0} cy={r * 0.3} rx={r * 0.9} ry={r * 0.4}
        fill={COLORS.CHAR_SKIN_SHADOW} opacity={0.3} />

      {/* ---- LEFT EYE ---- */}
      <g transform={`translate(${leftEyeX}, ${eyeY}) rotate(${cfg.tilt})`}>
        {/* Dark circle under eye */}
        <ellipse cx={0} cy={eyeH * 0.6} rx={eyeW * 0.95} ry={eyeH * 0.7}
          fill={COLORS.CHAR_DARK_CIRCLE} opacity={cfg.darkCircle * 0.7} />
        {/* Sclera */}
        <ellipse cx={0} cy={0} rx={eyeW} ry={eyeH}
          fill={COLORS.CHAR_EYE_WHITE} />
        {/* Bloodshot veins */}
        {cfg.darkCircle > 0.5 && (
          <>
            <line x1={-eyeW * 0.5} y1={-eyeH * 0.3} x2={-eyeW * 0.1} y2={eyeH * 0.3}
              stroke="#CC6666" strokeWidth={1} opacity={cfg.darkCircle * 0.6} />
            <line x1={eyeW * 0.3} y1={-eyeH * 0.4} x2={eyeW * 0.1} y2={eyeH * 0.3}
              stroke="#CC6666" strokeWidth={1} opacity={cfg.darkCircle * 0.4} />
          </>
        )}
        {/* Iris */}
        <ellipse cx={0} cy={0} rx={eyeW * cfg.pupils} ry={Math.min(eyeH * cfg.pupils, eyeH * 0.85)}
          fill={COLORS.CHAR_EYE_IRIS} />
        {/* Pupil */}
        <ellipse cx={0} cy={0} rx={eyeW * cfg.pupils * 0.5} ry={Math.min(eyeH * cfg.pupils * 0.5, eyeH * 0.5)}
          fill="#1A0808" />
        {/* Eye highlight */}
        <ellipse cx={-eyeW * 0.2} cy={-eyeH * 0.2} rx={3} ry={3} fill="white" opacity={0.7} />
        {/* Eyelid */}
        <ellipse cx={0} cy={-eyeH * (1 - cfg.openness * 0.6)}
          rx={eyeW + 2} ry={eyeH * (1 - cfg.openness) + 4}
          fill={COLORS.CHAR_SKIN} />
        {/* Eyelid crease */}
        <path d={`M${-eyeW - 2} 0 Q0 ${-eyeH * 0.3} ${eyeW + 2} 0`}
          fill="none" stroke={COLORS.CHAR_SKIN_SHADOW} strokeWidth={1.5} opacity={0.6} />
      </g>

      {/* ---- RIGHT EYE ---- */}
      <g transform={`translate(${rightEyeX}, ${eyeY}) rotate(${-cfg.tilt})`}>
        <ellipse cx={0} cy={eyeH * 0.6} rx={eyeW * 0.95} ry={eyeH * 0.7}
          fill={COLORS.CHAR_DARK_CIRCLE} opacity={cfg.darkCircle * 0.7} />
        <ellipse cx={0} cy={0} rx={eyeW} ry={eyeH}
          fill={COLORS.CHAR_EYE_WHITE} />
        {cfg.darkCircle > 0.5 && (
          <>
            <line x1={eyeW * 0.5} y1={-eyeH * 0.3} x2={eyeW * 0.1} y2={eyeH * 0.3}
              stroke="#CC6666" strokeWidth={1} opacity={cfg.darkCircle * 0.6} />
          </>
        )}
        <ellipse cx={0} cy={0} rx={eyeW * cfg.pupils} ry={Math.min(eyeH * cfg.pupils, eyeH * 0.85)}
          fill={COLORS.CHAR_EYE_IRIS} />
        <ellipse cx={0} cy={0} rx={eyeW * cfg.pupils * 0.5} ry={Math.min(eyeH * cfg.pupils * 0.5, eyeH * 0.5)}
          fill="#1A0808" />
        <ellipse cx={-eyeW * 0.2} cy={-eyeH * 0.2} rx={3} ry={3} fill="white" opacity={0.7} />
        <ellipse cx={0} cy={-eyeH * (1 - cfg.openness * 0.6)}
          rx={eyeW + 2} ry={eyeH * (1 - cfg.openness) + 4}
          fill={COLORS.CHAR_SKIN} />
        <path d={`M${-eyeW - 2} 0 Q0 ${-eyeH * 0.3} ${eyeW + 2} 0`}
          fill="none" stroke={COLORS.CHAR_SKIN_SHADOW} strokeWidth={1.5} opacity={0.6} />
      </g>

      {/* ---- MOUTH ---- */}
      {expression === 'yawning' ? (
        // Open yawning mouth
        <ellipse cx={0} cy={r * 0.45} rx={22} ry={18}
          fill="#2A1010" stroke={COLORS.CHAR_SKIN_SHADOW} strokeWidth={1.5} />
      ) : (
        // Curved line mouth
        <path
          d={`M${-18} ${r * 0.42 - cfg.mouthCurve * 8} Q0 ${r * 0.42 + cfg.mouthCurve * 20} ${18} ${r * 0.42 - cfg.mouthCurve * 8}`}
          fill="none" stroke={COLORS.CHAR_SKIN_SHADOW} strokeWidth={2.5} strokeLinecap="round"
        />
      )}

      {/* Nose â€” tiny dot */}
      <ellipse cx={0} cy={r * 0.22} rx={4} ry={3}
        fill={COLORS.CHAR_SKIN_SHADOW} opacity={0.5} />
    </g>
  );
};

// ---- Body: torso + arms + pants + feet ----
const Body: React.FC<{ pose: CharPose; facing: 'left' | 'right' }> = ({ pose, facing }) => {
  const flipX = facing === 'left' ? 1 : -1;

  if (pose === 'lying_down') {
    return (
      <g transform={`rotate(90)`}>
        <rect x={-45} y={0} width={90} height={SIZES.CHAR_BODY_H * 0.7}
          rx={30} fill={COLORS.CHAR_SKIN} />
        <rect x={-40} y={SIZES.CHAR_BODY_H * 0.5} width={80} height={SIZES.CHAR_LEG_H * 0.8}
          rx={20} fill={COLORS.CHAR_PANTS} />
      </g>
    );
  }

  const hunchOffset = (pose === 'hunched' || pose === 'sitting_bed' || pose === 'sitting_couch') ? 12 : 0;

  return (
    <g transform={`scale(${flipX}, 1)`}>
      {/* Torso */}
      <path
        d={`M${-40} 0 Q${-45} ${SIZES.CHAR_BODY_H * 0.5} ${-35} ${SIZES.CHAR_BODY_H} 
            L${35} ${SIZES.CHAR_BODY_H} Q${45} ${SIZES.CHAR_BODY_H * 0.5} ${40} 0 Z`}
        fill={COLORS.CHAR_SKIN}
        transform={`translate(${hunchOffset}, 0)`}
      />
      {/* Belly shadow */}
      <ellipse cx={hunchOffset + 5} cy={SIZES.CHAR_BODY_H * 0.65} rx={22} ry={12}
        fill={COLORS.CHAR_SKIN_SHADOW} opacity={0.25} />

      {/* Left arm */}
      <path
        d={`M${-40 + hunchOffset} ${30} Q${-75 + hunchOffset} ${80} ${-65 + hunchOffset} ${SIZES.CHAR_BODY_H * 0.9}`}
        fill="none" stroke={COLORS.CHAR_SKIN} strokeWidth={28} strokeLinecap="round" />
      {/* Right arm */}
      <path
        d={`M${40 + hunchOffset} ${30} Q${75 + hunchOffset} ${80} ${65 + hunchOffset} ${SIZES.CHAR_BODY_H * 0.9}`}
        fill="none" stroke={COLORS.CHAR_SKIN} strokeWidth={28} strokeLinecap="round" />

      {/* Waistband */}
      <rect x={-38 + hunchOffset} y={SIZES.CHAR_BODY_H - 5} width={76} height={12}
        rx={6} fill={COLORS.CHAR_PANTS} opacity={0.8} />

      {/* Pants â€” loose pajama style */}
      {pose !== 'sitting_bed' && pose !== 'sitting_couch' && (
        <>
          {/* Left leg */}
          <path
            d={`M${-32 + hunchOffset} ${SIZES.CHAR_BODY_H} Q${-38} ${SIZES.CHAR_BODY_H + 60} ${-28} ${SIZES.CHAR_BODY_H + SIZES.CHAR_LEG_H}`}
            fill="none" stroke={COLORS.CHAR_PANTS} strokeWidth={42} strokeLinecap="round" />
          {/* Right leg */}
          <path
            d={`M${32 + hunchOffset} ${SIZES.CHAR_BODY_H} Q${38} ${SIZES.CHAR_BODY_H + 60} ${28} ${SIZES.CHAR_BODY_H + SIZES.CHAR_LEG_H}`}
            fill="none" stroke={COLORS.CHAR_PANTS} strokeWidth={42} strokeLinecap="round" />
          {/* Bare feet */}
          <ellipse cx={-28 + hunchOffset} cy={SIZES.CHAR_BODY_H + SIZES.CHAR_LEG_H + 8}
            rx={22} ry={10} fill={COLORS.CHAR_SKIN} />
          <ellipse cx={28 + hunchOffset} cy={SIZES.CHAR_BODY_H + SIZES.CHAR_LEG_H + 8}
            rx={22} ry={10} fill={COLORS.CHAR_SKIN} />
        </>
      )}

      {/* Sitting legs */}
      {(pose === 'sitting_bed' || pose === 'sitting_couch') && (
        <>
          <path
            d={`M${-28 + hunchOffset} ${SIZES.CHAR_BODY_H} Q${-60} ${SIZES.CHAR_BODY_H + 20} ${-80} ${SIZES.CHAR_BODY_H + 10}`}
            fill="none" stroke={COLORS.CHAR_PANTS} strokeWidth={42} strokeLinecap="round" />
          <path
            d={`M${28 + hunchOffset} ${SIZES.CHAR_BODY_H} Q${60} ${SIZES.CHAR_BODY_H + 20} ${80} ${SIZES.CHAR_BODY_H + 10}`}
            fill="none" stroke={COLORS.CHAR_PANTS} strokeWidth={42} strokeLinecap="round" />
          <ellipse cx={-80 + hunchOffset} cy={SIZES.CHAR_BODY_H + 14} rx={22} ry={10} fill={COLORS.CHAR_SKIN} />
          <ellipse cx={80 + hunchOffset} cy={SIZES.CHAR_BODY_H + 14} rx={22} ry={10} fill={COLORS.CHAR_SKIN} />
        </>
      )}
    </g>
  );
};

// ---- Main exported component ----
export const MainChar: React.FC<MainCharProps> = ({
  x,
  y,
  scale = 1,
  expression = 'neutral',
  pose = 'standing',
  facing = 'right',
  phoneGlow = false,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const floatOffset = animated ? floatY(frame, 5, 0.035) : 0;
  const headR = SIZES.CHAR_HEAD_R;

  // Hunch offset for hunched poses
  const poseOffsetY = (pose === 'hunched') ? 20 : 0;
  const headTilt = (pose === 'hunched') ? 8 : 0;

  return (
    <g transform={`translate(${x}, ${y + floatOffset}) scale(${scale})`}>
      {/* Body (drawn below head in z-order) */}
      <g transform={`translate(0, ${headR * 0.9 + poseOffsetY})`}>
        <Body pose={pose} facing={facing} />
      </g>
      {/* Head */}
      <g transform={`translate(${pose === 'hunched' ? 15 : 0}, 0) rotate(${headTilt})`}>
        <Head expression={expression} phoneGlow={phoneGlow} />
      </g>
    </g>
  );
};
