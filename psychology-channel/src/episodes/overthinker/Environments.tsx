// ============================================================
// ENVIRONMENT SCENES â€” All room/setting backgrounds
// Built as SVG components, dark-themed, single light source
// ============================================================
import React from 'react';
import { useCurrentFrame } from 'remotion';
export { interpolate } from 'remotion'; // re-export for consumers
import { COLORS } from './tokens';

// ============================================================
// BEDROOM SCENE
// Moon through window, nightstand with red LED clock, bed
// ============================================================
interface BedroomProps {
  screenTime?: string;    // e.g. "0h 05m"
  clockTime?: string;     // e.g. "2:14"
  moonVisible?: boolean;
}

export const BedroomScene: React.FC<BedroomProps> = ({
  screenTime,
  clockTime = '2:14',
  moonVisible = true,
}) => {
  const frame = useCurrentFrame();
  // Subtle clock flicker
  const clockOpacity = 0.9 + Math.sin(frame * 0.5) * 0.1;

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* Background â€” pure black */}
      <rect width={1920} height={1080} fill={COLORS.BLACK} />

      {/* Floor line */}
      <line x1={0} y1={820} x2={1920} y2={820}
        stroke={COLORS.FLOOR_LINE} strokeWidth={2} opacity={0.5} />

      {/* Window â€” top right, moon glow */}
      {moonVisible && (
        <g transform="translate(1500, 80)">
          {/* Window frame */}
          <rect x={0} y={0} width={200} height={240} rx={8}
            fill={COLORS.WINDOW_NIGHT} stroke="#2A2A3A" strokeWidth={4} />
          {/* Window panes */}
          <line x1={100} y1={0} x2={100} y2={240} stroke="#2A2A3A" strokeWidth={4} />
          <line x1={0} y1={120} x2={200} y2={120} stroke="#2A2A3A" strokeWidth={4} />
          {/* Moon */}
          <circle cx={100} cy={70} r={35} fill={COLORS.MOON_WHITE} />
          {/* Moon glow through window */}
          <ellipse cx={100} cy={300} rx={120} ry={80}
            fill={COLORS.MOON_GLOW} style={{ filter: 'blur(30px)' }} />
        </g>
      )}

      {/* Bed frame */}
      <rect x={320} y={560} width={900} height={280} rx={16}
        fill={COLORS.BED_FRAME} />
      {/* Mattress */}
      <rect x={340} y={580} width={860} height={240} rx={12}
        fill={COLORS.BED_SHEET} />
      {/* Pillow */}
      <rect x={360} y={590} width={220} height={120} rx={30}
        fill={COLORS.BED_PILLOW} />
      {/* Duvet wrinkle lines */}
      <path d="M400 720 Q600 700 800 720 Q1000 740 1150 720"
        fill="none" stroke="#1A2030" strokeWidth={3} opacity={0.5} />

      {/* Nightstand â€” left */}
      <rect x={180} y={640} width={130} height={180} rx={8}
        fill="#111118" />
      {/* Drawer handles */}
      <rect x={225} y={690} width={40} height={6} rx={3} fill="#222" />
      <rect x={225} y={740} width={40} height={6} rx={3} fill="#222" />

      {/* LED Clock */}
      <g transform="translate(185, 600)">
        <rect x={0} y={0} width={120} height={50} rx={8}
          fill={COLORS.CLOCK_BG} />
        <text x={60} y={35}
          fill={COLORS.CLOCK_RED}
          fontSize={28} fontFamily='"Courier New", monospace'
          textAnchor="middle"
          opacity={clockOpacity}>
          {clockTime}
        </text>
      </g>

      {/* Screen time counter â€” top left (like Day One Films) */}
      {screenTime && (
        <g transform="translate(60, 60)">
          <text x={0} y={0} fill="#888" fontSize={22}
            fontFamily='"Courier New", monospace'>
            SCREEN TIME TODAY
          </text>
          <text x={0} y={36} fill="#CCC" fontSize={36}
            fontFamily='"Courier New", monospace'
            fontWeight="bold">
            {screenTime}
          </text>
        </g>
      )}
    </svg>
  );
};

// ============================================================
// LIVING ROOM SCENE
// Couch, TV with blue glow, low ambient light
// ============================================================
export const LivingRoomScene: React.FC<{ tvOn?: boolean }> = ({ tvOn = true }) => {
  const frame = useCurrentFrame();
  const tvFlicker = tvOn ? 0.85 + Math.sin(frame * 2.3) * 0.05 + Math.sin(frame * 7.1) * 0.03 : 0;

  return (
    <svg viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <rect width={1920} height={1080} fill={COLORS.BLACK} />
      <line x1={0} y1={830} x2={1920} y2={830} stroke={COLORS.FLOOR_LINE} strokeWidth={2} opacity={0.4} />

      {/* Couch */}
      <rect x={280} y={600} width={800} height={240} rx={30}
        fill={COLORS.COUCH_DARK} />
      {/* Couch cushions */}
      <rect x={295} y={610} width={370} height={160} rx={20} fill="#202020" />
      <rect x={675} y={610} width={390} height={160} rx={20} fill="#202020" />
      {/* Couch back */}
      <rect x={280} y={550} width={800} height={80} rx={20} fill="#181818" />
      {/* Couch arms */}
      <rect x={245} y={580} width={60} height={200} rx={15} fill="#181818" />
      <rect x={1055} y={580} width={60} height={200} rx={15} fill="#181818" />

      {/* TV stand */}
      <rect x={1200} y={680} width={340} height={20} rx={6} fill="#151515" />
      <rect x={1340} y={700} width={60} height={130} rx={6} fill="#151515" />

      {/* TV screen */}
      <rect x={1180} y={420} width={380} height={270} rx={12}
        fill={tvOn ? '#0A1830' : '#0A0A0A'}
        opacity={tvFlicker} />
      {/* TV frame */}
      <rect x={1175} y={415} width={390} height={280} rx={14}
        fill="none" stroke="#1A1A1A" strokeWidth={8} />
      {/* TV glow on floor/surroundings */}
      {tvOn && (
        <ellipse cx={1375} cy={900} rx={200} ry={80}
          fill={COLORS.TV_GLOW} style={{ filter: 'blur(25px)' }} />
      )}
    </svg>
  );
};

// ============================================================
// ABSTRACT MIND SCENE
// Pure black with floating elements â€” for psychological concepts
// ============================================================
export const MindScene: React.FC = () => {
  const frame = useCurrentFrame();
  // Floating particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: 200 + (i * 157) % 1500,
    y: 300 + Math.sin(frame * 0.03 + i * 0.8) * 60 + (i * 83) % 400,
    r: 3 + (i % 4),
    opacity: 0.1 + (i % 5) * 0.05,
  }));

  return (
    <svg viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <rect width={1920} height={1080} fill={COLORS.BLACK} />
      {particles.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r}
          fill={COLORS.TEXT_WHITE} opacity={p.opacity} />
      ))}
    </svg>
  );
};

// ============================================================
// DATA VISUALIZATION â€” Animated line chart (like Day 7 scene)
// ============================================================
interface DataChartProps {
  label: string;
  data: Array<{ x: string; y: number }>;  // normalized 0â€“1
  color?: string;
  drawProgress?: number;  // 0â€“1, animate drawing the line
}

export const DataChart: React.FC<DataChartProps> = ({
  label,
  data,
  color = COLORS.ACCENT_GOLD,
  drawProgress = 1,
}) => {
  const W = 700, H = 350;
  const PAD = { top: 40, right: 40, bottom: 60, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Build SVG path from data
  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top + (1 - d.y) * innerH,
  }));

  // Only draw up to drawProgress
  const visibleCount = Math.max(2, Math.ceil(points.length * drawProgress));
  const visiblePoints = points.slice(0, visibleCount);

  const pathD = visiblePoints.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x} ${p.y}`;
    const prev = visiblePoints[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
  }, '');

  // Glowing dot at end of line
  const lastPt = visiblePoints[visiblePoints.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}
      style={{ position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)' }}>
      {/* Background */}
      <rect width={W} height={H} fill="transparent" />

      {/* Chart title */}
      <text x={W / 2} y={22} textAnchor="middle"
        fill={COLORS.TEXT_WHITE} fontSize={20}
        fontFamily='"Patrick Hand", cursive' opacity={0.7}>
        {label}
      </text>

      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH}
        stroke="#333" strokeWidth={2} />
      <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH}
        stroke="#333" strokeWidth={2} />

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text key={i}
          x={PAD.left + (i / (data.length - 1)) * innerW}
          y={PAD.top + innerH + 24}
          textAnchor="middle"
          fill="#666" fontSize={14}
          fontFamily='"Courier New", monospace'>
          {d.x}
        </text>
      ))}

      {/* Chart line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />

      {/* Glow on line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round" opacity={0.25}
        style={{ filter: 'blur(4px)' }} />

      {/* Animated dot at current position */}
      {lastPt && (
        <circle cx={lastPt.x} cy={lastPt.y} r={8}
          fill={color}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      )}
    </svg>
  );
};
