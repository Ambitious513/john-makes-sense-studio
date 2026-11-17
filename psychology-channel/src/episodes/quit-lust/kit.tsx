// ============================================================
// LUST FILM — shared UI kit: camera, day title, seven-seg clock,
// whisper text, vignette, pill bubble
// ============================================================
import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { C, F } from './theme';

/** Simple ease helper */
export const ease = (frame: number, a: number, b: number, from = 0, to = 1, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [a, b], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

// ------------------------------------------------------------
// STAGE — svg viewport for scene content (props/actors are <g> nodes)
// ------------------------------------------------------------
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg
    viewBox="0 0 1280 720"
    preserveAspectRatio="xMidYMid slice"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
  >
    {children}
  </svg>
);

/** Floor line as SVG node (for use inside <Stage>) */
export const Floor: React.FC = () => (
  <rect x={0} y={556} width={1280} height={3} fill="#2A2A2A" />
);

// ------------------------------------------------------------
// CAMERA — slow zoom / drift inside a scene
// usage: <Cam zoom={[1, 1.12]} pan={{x:[0,30], y:[0,0]}}>...</Cam>
// ------------------------------------------------------------
export const Cam: React.FC<{
  zoom?: [number, number];
  zoomStart?: number;
  zoomEnd?: number;
  panX?: [number, number];
  panY?: [number, number];
  tilt?: [number, number];
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ zoom = [1, 1], zoomStart = 0, zoomEnd = 10000, panX = [0, 0], panY = [0, 0], tilt = [0, 0], children, style }) => {
  const frame = useCurrentFrame();
  const z = ease(frame, zoomStart, zoomEnd, zoom[0], zoom[1]);
  const px = ease(frame, zoomStart, zoomEnd, panX[0], panX[1]);
  const py = ease(frame, zoomStart, zoomEnd, panY[0], panY[1]);
  const t = ease(frame, zoomStart, zoomEnd, tilt[0], tilt[1]);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${z}) translate(${px}px, ${py}px) rotate(${t}deg)`,
        transformOrigin: '50% 62%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ------------------------------------------------------------
// DAY TITLE — "DAY 1" top-center, Chewy, cream
// ------------------------------------------------------------
export const DayTitle: React.FC<{ label: string; grey?: boolean; size?: number }> = ({
  label,
  grey = false,
  size = 64,
}) => {
  const frame = useCurrentFrame();
  const o = ease(frame, 4, 22, 0, 1);
  return (
    <div
      style={{
        position: 'absolute',
        top: 62,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: F.TITLE,
        fontSize: size,
        letterSpacing: 4,
        color: grey ? C.TEXT_GREY : C.TEXT_WHITE,
        opacity: o,
        zIndex: 40,
        textShadow: grey ? 'none' : '0 2px 0 rgba(0,0,0,0.6)',
      }}
    >
      {label}
    </div>
  );
};

// ------------------------------------------------------------
// SEVEN-SEG DIGIT — for the alarm clock
// ------------------------------------------------------------
const SEG_MAP: Record<string, string[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
};

const SevenSegDigit: React.FC<{ ch: string; x: number; y: number; w: number; h: number; color: string }> = ({
  ch,
  x,
  y,
  w,
  h,
  color,
}) => {
  const segs = SEG_MAP[ch];
  const t = h * 0.16; // segment thickness
  const g = t * 0.55; // gap
  const segsPos: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
    a: { x1: x + g, y1: y + t / 2, x2: x + w - g, y2: y + t / 2 },
    b: { x1: x + w - t / 2, y1: y + g, x2: x + w - t / 2, y2: y + h / 2 - g },
    c: { x1: x + w - t / 2, y1: y + h / 2 + g, x2: x + w - t / 2, y2: y + h - g },
    d: { x1: x + g, y1: y + h - t / 2, x2: x + w - g, y2: y + h - t / 2 },
    e: { x1: x + t / 2, y1: y + h / 2 + g, x2: x + t / 2, y2: y + h - g },
    f: { x1: x + t / 2, y1: y + g, x2: x + t / 2, y2: y + h / 2 - g },
    g: { x1: x + g, y1: y + h / 2, x2: x + w - g, y2: y + h / 2 },
  };
  return (
    <>
      {Object.entries(segsPos).map(([k, p]) => (
        <line
          key={k}
          x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2}
          stroke={segs?.includes(k) ? color : 'rgba(255,255,255,0.06)'}
          strokeWidth={t}
          strokeLinecap="round"
        />
      ))}
    </>
  );
};

/** Alarm clock — seven-seg red digits with glow. */
export const AlarmClock: React.FC<{
  time: string; // "1:20"
  x: number;
  y: number; // top-left of clock body
  scale?: number;
  grey?: boolean;
  glowPulse?: boolean;
}> = ({ time, x, y, scale = 1, grey = false, glowPulse = false }) => {
  const frame = useCurrentFrame();
  const color = grey ? C.CLOCK_GREY : C.CLOCK_RED;
  const bodyW = 128;
  const bodyH = 62;
  const dw = 28;
  const dh = 44;
  const gap = 14; // gap around colon / between digits
  const [h, m] = time.split(':');
  const digits = [...h.split(''), ...m.split('')];
  const totalW = digits.length * dw + gap * (digits.length - 1);
  const startX = (bodyW - totalW) / 2;
  const colonX = startX + h.length * (dw + gap) - gap / 2;
  const glow = glowPulse ? 0.7 + 0.3 * Math.sin(frame * 0.25) : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* shadow + stand */}
      <ellipse cx={bodyW / 2} cy={bodyH + 2} rx={bodyW * 0.52} ry={8} fill="#151518" />
      <rect x={0} y={0} width={bodyW} height={bodyH} rx={26} fill="#0C0C0E" stroke="#2E2E34" strokeWidth={3} />
      {digits.map((ch, i) => (
        <SevenSegDigit key={i} ch={ch} x={startX + i * (dw + gap)} y={9} w={dw} h={dh} color={color} />
      ))}
      <circle cx={colonX} cy={9 + dh * 0.3} r={3.4} fill={color} opacity={glow} />
      <circle cx={colonX} cy={9 + dh * 0.72} r={3.4} fill={color} opacity={glow} />
    </g>
  );
};

// ------------------------------------------------------------
// WHISPER — red handwritten text near the entity
// ------------------------------------------------------------
export const Whisper: React.FC<{ text: string; x: number; y: number; size?: number; color?: string; start?: number; dur?: number; align?: 'left' | 'right' | 'center' }> = ({
  text,
  x,
  y,
  size = 30,
  color = C.ENTITY_RED,
  start = 0,
  dur = 90,
  align = 'center',
}) => {
  const frame = useCurrentFrame();
  const o = ease(frame, start, start + 14, 0, 1) * ease(frame, start + dur, start + dur + 14, 1, 0);
  const drift = ease(frame, start, start + dur, 0, -6);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,0) translateY(${drift}px)`,
        fontFamily: F.HAND,
        fontSize: size,
        color,
        opacity: Math.max(0, o),
        whiteSpace: 'nowrap',
        textShadow: `0 0 14px ${C.ENTITY_GLOW}`,
        zIndex: 45,
        textAlign: align,
      }}
    >
      {text}
    </div>
  );
};

// ------------------------------------------------------------
// PILL — dark rounded thought label above head ("never again.")
// ------------------------------------------------------------
export const Pill: React.FC<{ text: string; x: number; y: number; start?: number; size?: number }> = ({
  text,
  x,
  y,
  start = 0,
  size = 26,
}) => {
  const frame = useCurrentFrame();
  const o = ease(frame, start, start + 12, 0, 1);
  const pop = ease(frame, start, start + 12, 0.8, 1, Easing.out(Easing.back(2)));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,0) scale(${pop})`,
        opacity: o,
        background: '#0B0B0D',
        border: '2px solid #2A2A2E',
        borderRadius: 14,
        padding: '4px 16px',
        fontFamily: F.HAND,
        fontSize: size,
        color: C.TEXT_WHITE,
        whiteSpace: 'nowrap',
        zIndex: 45,
      }}
    >
      {text}
    </div>
  );
};

// ------------------------------------------------------------
// VIGNETTE — soft radial darkening like the reference
// ------------------------------------------------------------
export const Vignette: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(ellipse 78% 68% at 50% 52%, rgba(0,0,0,0) 55%, ${C.BG_VIGNETTE} 100%)`,
      zIndex: 30,
      pointerEvents: 'none',
    }}
  />
);

// ------------------------------------------------------------
// FADE — fade whole scene from/to black (scene-local frames)
// ------------------------------------------------------------
export const Fade: React.FC<{ inDur?: number; outDur?: number; total: number }> = ({ inDur = 12, outDur = 12, total }) => {
  const frame = useCurrentFrame();
  const o = Math.max(ease(frame, 0, inDur, 1, 0), ease(frame, total - outDur, total, 0, 1));
  return <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: o, zIndex: 60, pointerEvents: 'none' }} />;
};
