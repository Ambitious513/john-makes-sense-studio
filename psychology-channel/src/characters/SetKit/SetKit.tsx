/**
 * SetKit — the Day One Films prop department.
 *
 * Void-world staging furniture from docs/reference-style-study.md §4:
 * everything is dark fills + soft cream edges, every prop's viewBox bottom
 * edge sits ON the ground line, and light sources are the only gradients.
 *
 * Palette: void #0d0d0d · cream #F2EAD8 · red #E8392F · ink #0B1016
 */
import React from 'react';
import { useId } from 'react';

const VOID_FILL = '#15191F';
const VOID_FILL_DARK = '#10141A';
const EDGE = 'rgba(242,234,216,0.55)';
const EDGE_SOFT = 'rgba(242,234,216,0.30)';
const CREAM = '#F2EAD8';
const RED = '#E8392F';

interface SvgProps {
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
}

/* ------------------------------------------------------------------ *
 * VoidRoom — the default stage: black field, one thin grey ground line
 * ------------------------------------------------------------------ */
export const VoidRoom: React.FC<{
  width?: number | string;
  height?: number | string;
  /** ground line y as a fraction of height from the bottom (default 0.22) */
  groundFrac?: number;
  /** optional second (wall) line, fraction from the bottom */
  wallFrac?: number;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = '100%', groundFrac = 0.22, wallFrac, style }) => (
  <div style={{ position: 'relative', width, height, background: '#0d0d0d', overflow: 'hidden', ...style }}>
    <div style={{
      position: 'absolute', left: '4%', right: '4%', bottom: `${groundFrac * 100}%`,
      height: 2, background: 'rgba(242,234,216,0.22)',
    }} />
    {wallFrac !== undefined && (
      <div style={{
        position: 'absolute', left: '4%', right: '4%', bottom: `${wallFrac * 100}%`,
        height: 1.5, background: 'rgba(242,234,216,0.10)',
      }} />
    )}
  </div>
);

/* ------------------------------------------------------------------ *
 * SpotlightCone — soft light cone from above, isolating the figure
 * ------------------------------------------------------------------ */
export const SpotlightCone: React.FC<{
  x: number;      // % centre
  topY: number;   // % top
  bottomY: number;// % floor spread centre
  spread?: number;// % half-width at the floor
  opacity?: number;
  color?: string;
}> = ({ x, topY, bottomY, spread = 16, opacity = 0.5, color = CREAM }) => {
  const uid = useId().replace(/:/g, '');
  return (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${uid}-cone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0.04} />
        </linearGradient>
        <radialGradient id={`${uid}-floor`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={opacity * 0.55} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <polygon
        points={`${x - 2.2},${topY} ${x + 2.2},${topY} ${x + spread},${bottomY} ${x - spread},${bottomY}`}
        fill={`url(#${uid}-cone)`}
      />
      <ellipse cx={x} cy={bottomY} rx={spread} ry={2.4} fill={`url(#${uid}-floor)`} />
    </svg>
  </div>
  );
};

/* ------------------------------------------------------------------ *
 * LedClock — red digital clock; time pressure is always diegetic
 * ------------------------------------------------------------------ */
export const LedClock: React.FC<{
  /** "2:14" or "5:00" — blink the colon every second when blink */
  time: string;
  blink?: boolean;
  frame?: number;
  fontSize?: number;
} & SvgProps> = ({ time, blink = false, frame = 0, fontSize = 54, width, height, style }) => {
  const colonOn = !blink || Math.floor(frame / 15) % 2 === 0;
  const text = time.replace(':', colonOn ? ':' : ' ');
  return (
    <div style={{ position: 'relative', width: width ?? 260, height: height ?? 120, background: VOID_FILL_DARK, borderRadius: 10, border: `2px solid ${EDGE_SOFT}`, boxShadow: `0 0 22px rgba(232,57,47,0.22)`, ...style }}>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontWeight: 700, fontSize,
        color: RED, textShadow: `0 0 14px rgba(232,57,47,0.85), 0 0 42px rgba(232,57,47,0.4)`,
        letterSpacing: 4,
      }}>
        {text}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * WallClock — minimal analog wall clock (Drummond-style)
 * ------------------------------------------------------------------ */
export const WallClock: React.FC<{
  /** hours 0-23, minutes 0-59 — hands only, no numbers */
  h: number;
  m: number;
} & SvgProps> = ({ h, m, width = 200, height = 200, style }) => {
  const ha = ((h % 12) + m / 60) * 30 * Math.PI / 180;
  const ma = m * 6 * Math.PI / 180;
  const hand = (angle: number, len: number, w: number) => {
    const c = Math.PI / 2 - angle;
    return (
      <line
        x1={100} y1={100}
        x2={100 + Math.cos(c) * len} y2={100 - Math.sin(c) * len}
        stroke={CREAM} strokeWidth={w} strokeLinecap="round"
      />
    );
  };
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" style={style}>
      <circle cx={100} cy={100} r={92} fill={VOID_FILL} stroke={EDGE} strokeWidth={5} />
      {[0, 90, 180, 270].map((a) => (
        <line key={a}
          x1={100 + Math.cos((a * Math.PI) / 180) * 74} y1={100 + Math.sin((a * Math.PI) / 180) * 74}
          x2={100 + Math.cos((a * Math.PI) / 180) * 86} y2={100 + Math.sin((a * Math.PI) / 180) * 86}
          stroke={EDGE_SOFT} strokeWidth={4} strokeLinecap="round"
        />
      ))}
      {hand(ha, 42, 7)}
      {hand(ma, 64, 5)}
      <circle cx={100} cy={100} r={5} fill={CREAM} />
    </svg>
  );
};

/* ------------------------------------------------------------------ *
 * DeskLamp — desk lamp with a warm cone of light
 * ------------------------------------------------------------------ */
export const DeskLamp: React.FC<{ on?: boolean } & SvgProps> = ({ on = true, width = 360, height = 420, style }) => {
  const uid = useId().replace(/:/g, '');
  return (
  <svg width={width} height={height} viewBox="0 0 360 420" style={style}>
    <defs>
      <linearGradient id={`${uid}-lampcone`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CREAM} stopOpacity={0.42} />
        <stop offset="100%" stopColor={CREAM} stopOpacity={0.03} />
      </linearGradient>
    </defs>
    {on && (
      <polygon points="196,150 320,396 60,396" fill={`url(#${uid}-lampcone)`} />
    )}
    {/* base */}
    <ellipse cx={130} cy={400} rx={78} ry={14} fill={VOID_FILL_DARK} stroke={EDGE_SOFT} strokeWidth={3} />
    {/* arm */}
    <line x1={130} y1={396} x2={172} y2={230} stroke={EDGE} strokeWidth={10} strokeLinecap="round" />
    <line x1={172} y1={230} x2={205} y2={158} stroke={EDGE} strokeWidth={10} strokeLinecap="round" />
    {/* head */}
    <path d="M 168,148 Q 205,132 238,150 L 222,186 Q 196,172 178,184 Z" fill={VOID_FILL} stroke={EDGE} strokeWidth={4} strokeLinejoin="round" />
    {on && <ellipse cx={208} cy={178} rx={22} ry={7} fill={CREAM} opacity={0.85} />}
  </svg>
  );
};

/* ------------------------------------------------------------------ *
 * Couch — the doomscroll couch
 * ------------------------------------------------------------------ */
export const Couch: React.FC<{ tint?: string } & SvgProps> = ({ tint = VOID_FILL, width = 900, height = 430, style }) => (
  <svg width={width} height={height} viewBox="0 0 900 430" style={style}>
    {/* back */}
    <path d="M 60,320 L 60,120 Q 60,78 102,78 L 798,78 Q 840,78 840,120 L 840,320 Z" fill={tint} stroke={EDGE_SOFT} strokeWidth={4} />
    {/* cushions */}
    <rect x={92} y={130} width={330} height={150} rx={26} fill={VOID_FILL_DARK} stroke={EDGE_SOFT} strokeWidth={3} />
    <rect x={478} y={130} width={330} height={150} rx={26} fill={VOID_FILL_DARK} stroke={EDGE_SOFT} strokeWidth={3} />
    {/* seat */}
    <path d="M 52,320 L 848,320 L 848,384 Q 848,410 820,410 L 80,410 Q 52,410 52,384 Z" fill={tint} stroke={EDGE_SOFT} strokeWidth={4} />
    {/* arms */}
    <path d="M 24,300 L 24,180 Q 24,140 64,140 L 96,140 L 96,410 L 64,410 Q 24,410 24,370 Z" fill={VOID_FILL_DARK} stroke={EDGE_SOFT} strokeWidth={4} />
    <path d="M 876,300 L 876,180 Q 876,140 836,140 L 804,140 L 804,410 L 836,410 Q 876,410 876,370 Z" fill={VOID_FILL_DARK} stroke={EDGE_SOFT} strokeWidth={4} />
  </svg>
);

/* ------------------------------------------------------------------ *
 * Dresser — low cabinet
 * ------------------------------------------------------------------ */
export const Dresser: React.FC<SvgProps> = ({ width = 520, height = 360, style }) => (
  <svg width={width} height={height} viewBox="0 0 520 360" style={style}>
    <rect x={20} y={20} width={480} height={326} rx={12} fill={VOID_FILL} stroke={EDGE_SOFT} strokeWidth={4} />
    {[86, 180, 274].map((y) => (
      <g key={y}>
        <rect x={52} y={y} width={416} height={78} rx={8} fill={VOID_FILL_DARK} stroke={EDGE_SOFT} strokeWidth={3} />
        <line x1={230} y1={y + 30} x2={290} y2={y + 30} stroke={EDGE_SOFT} strokeWidth={5} strokeLinecap="round" />
      </g>
    ))}
    <ellipse cx={72} cy={352} rx={10} ry={5} fill={EDGE_SOFT} />
    <ellipse cx={448} cy={352} rx={10} ry={5} fill={EDGE_SOFT} />
  </svg>
);

/* ------------------------------------------------------------------ *
 * CrackedMirror — standing mirror; the reflection is a staging slot
 * (put the Entity — or anything — behind the glass via `reflection`)
 * ------------------------------------------------------------------ */
export const CrackedMirror: React.FC<{
  /** 0 = intact, 1 = fully shattered */
  crack?: number;
  /** rendered clipped inside the glass, behind the crack lines */
  reflection?: React.ReactNode;
} & SvgProps> = ({ crack = 1, reflection, width = 360, height = 560, style }) => {
  const n = Math.round(5 + crack * 6);
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={width} height={height} viewBox="0 0 360 560" style={style}>
      <defs>
        <clipPath id={`${uid}-glass`}>
          <rect x={70} y={30} width={220} height={440} rx={100} />
        </clipPath>
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CREAM} stopOpacity={0.10} />
          <stop offset="45%" stopColor={CREAM} stopOpacity={0.02} />
          <stop offset="100%" stopColor={CREAM} stopOpacity={0.08} />
        </linearGradient>
      </defs>
      {/* stand feet */}
      <path d="M 96,548 L 122,470 M 264,548 L 238,470" stroke={EDGE} strokeWidth={10} strokeLinecap="round" fill="none" />
      {/* frame */}
      <rect x={58} y={18} width={244} height={464} rx={106} fill={VOID_FILL_DARK} stroke={EDGE} strokeWidth={6} />
      {/* glass + reflection */}
      <g clipPath={`url(#${uid}-glass)`}>
        <rect x={70} y={30} width={220} height={440} fill="#131820" />
        {reflection}
        <rect x={70} y={30} width={220} height={440} fill={`url(#${uid}-sheen)`} />
        {crack > 0.02 && (
          <g stroke={CREAM} strokeWidth={2.4} strokeLinecap="round" opacity={Math.min(1, crack)}>
            {Array.from({ length: n }).map((_, i) => {
              const a = (i / n) * Math.PI * 2 + 0.4;
              const len = 120 + crack * 90;
              return <line key={i} x1={180} y1={250} x2={180 + Math.cos(a) * len} y2={250 + Math.sin(a) * len} />;
            })}
            {Array.from({ length: n }).map((_, i) => {
              const a = ((i + 0.5) / n) * Math.PI * 2 + 0.4;
              return <line key={`s${i}`} x1={180 + Math.cos(a) * 46} y1={250 + Math.sin(a) * 46} x2={180 + Math.cos(a + 1.3) * 88} y2={250 + Math.sin(a + 1.3) * 88} />;
            })}
          </g>
        )}
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ *
 * SoccerBall — payoff prop
 * ------------------------------------------------------------------ */
export const SoccerBall: React.FC<SvgProps> = ({ width = 120, height = 120, style }) => (
  <svg width={width} height={height} viewBox="0 0 120 120" style={style}>
    <circle cx={60} cy={60} r={52} fill={CREAM} stroke="#0B1016" strokeWidth={5} />
    <polygon points="60,42 76,54 70,72 50,72 44,54" fill="#0B1016" />
    {[[24, 34], [96, 34], [18, 84], [102, 84], [60, 106]].map(([x, y], i) => (
      <polygon key={i} points={
        `${x},${y - 11} ${x + 10},${y - 3} ${x + 6},${y + 9} ${x - 6},${y + 9} ${x - 10},${y - 3}`
      } fill="#0B1016" />
    ))}
  </svg>
);

/* ------------------------------------------------------------------ *
 * Costume slots for StickGuy's headSlot — authored in head space
 * (head centre 345,92 r 82). Red = discipline / the kid.
 * ------------------------------------------------------------------ */

/** Red headband — "costume state = mindset state": resolve/discipline mode.
 *  `stream` (0-1) stretches the knot into streaming tails — panel 6's kick,
 *  where the ribbons trail away from the strike. */
export const RedHeadband: React.FC<{ scale?: number; stream?: number }> = ({ scale = 1, stream = 0 }) => (
  <g transform={`translate(345 92) scale(${scale}) translate(-345 -92)`}>
    {/* shallow band across the forehead, following the skull curve */}
    <path
      d="M 269,74 Q 345,46 421,74"
      fill="none" stroke={RED} strokeWidth={16} strokeLinecap="round"
    />
    <path
      d="M 269,74 Q 345,46 421,74"
      fill="none" stroke="#FF6A5A" strokeWidth={16} strokeLinecap="round" opacity={0.25} transform="translate(0 -3)"
    />
    {/* knot tail on the right side */}
    <path d="M 421,74 Q 440,80 446,98" fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round" />
    {stream > 0.02 && (
      <g opacity={Math.min(1, stream)}>
        {/* ribbons peel off the knot and stream right, lifting with speed */}
        <path
          d={`M 417,66 Q ${445 + 45 * stream},${52 - 16 * stream} ${430 + 170 * stream},${80 - 34 * stream}`}
          fill="none" stroke={RED} strokeWidth={10} strokeLinecap="round"
        />
        <path
          d={`M 421,86 Q ${448 + 40 * stream},${104 + 10 * stream} ${425 + 125 * stream},${128 - 14 * stream}`}
          fill="none" stroke="#FF6A5A" strokeWidth={8} strokeLinecap="round" opacity={0.85}
        />
      </g>
    )}
  </g>
);

/** Red beanie — the kid */
export const RedBeanie: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`translate(345 92) scale(${scale}) translate(-345 -92)`}>
    <path
      d="M 267,64 Q 267,4 345,4 Q 423,4 423,64 L 423,74 L 267,74 Z"
      fill={RED}
    />
    <rect x={263} y={62} width={164} height={26} rx={13} fill="#B92A22" />
    <path d="M 345,4 Q 340,-14 358,-18 Q 376,-14 371,2 Z" fill={RED} stroke="#B92A22" strokeWidth={4} />
  </g>
);
