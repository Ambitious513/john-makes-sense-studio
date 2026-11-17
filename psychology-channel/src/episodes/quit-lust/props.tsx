// ============================================================
// LUST FILM — props: bed, window, dresser, phone, kitchen,
// couch+TV, bench, trees, lamps, lockers, gym, drawing paper
// ============================================================
import React from 'react';
import { C } from './theme';
import { AlarmClock } from './kit';

const EDGE = '#3E3E46';

// ---------------- BED (side view, char at right edge) ----------------
export const Bed: React.FC<{ x: number; y: number; scale?: number; flip?: boolean }> = ({ x, y, scale = 1, flip = false }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
    {/* headboard */}
    <rect x={-340} y={-128} width={22} height={128} rx={11} fill="#262A34" stroke={EDGE} strokeWidth={3} />
    {/* mattress + pillow */}
    <rect x={-320} y={-58} width={330} height={44} rx={10} fill="#1D2129" />
    <ellipse cx={-284} cy={-70} rx={44} ry={17} fill="#2A2F3B" />
    {/* blanket */}
    <path d={`M -280 -34 Q -240 -46 -180 -38 L 10 -34 Q 30 -30 28 -12 Q 26 0 6 0 L -318 0 Q -334 -6 -330 -22 Q -322 -34 -280 -34 Z`} fill={C.BED_SHEET} />
    <path d={`M -150 -40 Q -60 -46 20 -36`} stroke="rgba(255,255,255,0.10)" strokeWidth={3} fill="none" />
    {/* base */}
    <rect x={-330} y={-2} width={352} height={12} rx={6} fill="#14161C" />
  </g>
);

/** Standing bed (character under blanket, seen from side) — full-width version.
 *  Mattress top ≈ -104 so a sitting char (hips -104) rests on it;
 *  pillow center ≈ (-330, -116) matches lieBed head placement. */
export const BedFull: React.FC<{ x: number; y: number; scale?: number; grey?: boolean }> = ({ x, y, scale = 1, grey = false }) => {
  const sheet = grey ? '#33363C' : C.BED_SHEET;
  const pillow = grey ? '#3E4148' : '#2A2F3B';
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* headboard */}
      <rect x={-394} y={-172} width={22} height={172} rx={11} fill="#262A34" stroke={EDGE} strokeWidth={3} />
      {/* pillow */}
      <ellipse cx={-330} cy={-116} rx={48} ry={17} fill={pillow} />
      {/* mattress */}
      <rect x={-320} y={-108} width={560} height={54} rx={10} fill="#1D2129" />
      {/* blanket lump over the sleeper */}
      <path d="M -300 0 L -300 -44 Q -298 -92 -240 -96 Q -120 -104 0 -98 L 224 -92 Q 250 -84 248 -56 L 246 0 Z" fill={sheet} />
      <path d="M -160 -98 Q 20 -104 200 -94" stroke="rgba(255,255,255,0.10)" strokeWidth={3} fill="none" />
      {/* base */}
      <rect x={-360} y={-2} width={610} height={12} rx={6} fill="#14161C" />
    </g>
  );
};

// ---------------- WINDOW (4 panes + moon) ----------------
export const Window: React.FC<{ x: number; y: number; scale?: number; moon?: boolean; warm?: boolean; grey?: boolean }> = ({
  x,
  y,
  scale = 1,
  moon = true,
  warm = false,
  grey = false,
}) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-92} y={-92} width={184} height={184} rx={18} fill={warm ? '#141018' : grey ? '#0B0C0E' : C.WINDOW_NIGHT} stroke={grey ? '#3A3C42' : C.WINDOW_EDGE} strokeWidth={4} />
    <line x1={0} y1={-92} x2={0} y2={92} stroke={grey ? '#3A3C42' : C.WINDOW_EDGE} strokeWidth={3} />
    <line x1={-92} y1={0} x2={92} y2={0} stroke={grey ? '#3A3C42' : C.WINDOW_EDGE} strokeWidth={3} />
    {moon && <circle cx={44} cy={-44} r={22} fill={grey ? '#8E9096' : C.MOON} opacity={warm ? 0.5 : 0.9} />}
  </g>
);

// ---------------- DRESSER / NIGHTSTAND ----------------
export const Dresser: React.FC<{ x: number; y: number; scale?: number; drawers?: number; grey?: boolean }> = ({
  x,
  y,
  scale = 1,
  drawers = 2,
  grey = false,
}) => {
  const fill = grey ? '#2B2D31' : C.FURN_DARK;
  const edge = grey ? '#4A4C52' : C.FURN_EDGE;
  const h = drawers * 62 + 10;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <rect x={-92} y={-h} width={184} height={h} rx={16} fill={fill} stroke={edge} strokeWidth={3.5} />
      {Array.from({ length: drawers }).map((_, i) => (
        <g key={i}>
          <line x1={-78} y1={-h + (i + 1) * 62 - 8} x2={78} y2={-h + (i + 1) * 62 - 8} stroke={edge} strokeWidth={2.5} />
          <circle cx={0} cy={-h + i * 62 + 26} r={4.5} fill={edge} />
        </g>
      ))}
    </g>
  );
};

// ---------------- PHONE ----------------
export const PhoneFlat: React.FC<{ x: number; y: number; scale?: number; glow?: boolean }> = ({ x, y, scale = 1, glow = false }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {glow && <ellipse cx={0} cy={0} rx={60} ry={26} fill="rgba(140,180,255,0.18)" style={{ filter: 'blur(10px)' }} />}
    <rect x={-46} y={-9} width={92} height={18} rx={9} fill="#0B0B0E" stroke="#3A3A42" strokeWidth={3} />
  </g>
);

/** Phone close-up standing, lockscreen time */
export const PhoneLockscreen: React.FC<{ time: string; scale?: number }> = ({ time, scale = 1 }) => (
  <g transform={`scale(${scale})`} opacity={1}>
    <rect x={-120} y={-230} width={240} height={470} rx={38} fill="#0A0A0D" stroke="#3C3C46" strokeWidth={5} />
    <text x={0} y={-120} textAnchor="middle" fill="#EDEAE2" fontFamily="Patrick Hand" fontSize={64} letterSpacing={2}>
      {time}
    </text>
    <rect x={-30} y={218} width={60} height={6} rx={3} fill="#EDEAE2" opacity={0.8} />
  </g>
);

/** Phone back close-up (face down on table, day 30) */
export const PhoneBack: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <rect x={-110} y={-220} width={220} height={440} rx={36} fill="#0B0B0E" stroke="#3A3A44" strokeWidth={5} />
    <rect x={-64} y={-186} width={96} height={96} rx={22} fill="#18181E" stroke="#2E2E36" strokeWidth={3} />
    <circle cx={-38} cy={-162} r={11} fill="#0A0A0D" />
    <circle cx={-2} cy={-162} r={11} fill="#0A0A0D" />
    <circle cx={-38} cy={-128} r={11} fill="#0A0A0D" />
  </g>
);

// ---------------- TABLE + CHAIR ----------------
export const TableChair: React.FC<{ x: number; y: number; scale?: number; grey?: boolean }> = ({ x, y, scale = 1, grey = false }) => {
  const top = grey ? '#3A3C40' : '#4A4438';
  const leg = grey ? '#313337' : '#3B372E';
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* chair */}
      <rect x={-160} y={-118} width={12} height={118} fill={leg} />
      <rect x={-160} y={-118} width={52} height={10} rx={4} fill={leg} />
      <rect x={-158} y={-56} width={48} height={8} rx={3} fill={leg} />
      <rect x={-152} y={-4} width={8} height={4} fill={leg} />
      {/* table */}
      <rect x={-110} y={-78} width={330} height={12} rx={6} fill={top} />
      <rect x={-96} y={-66} width={10} height={66} fill={leg} />
      <rect x={116} y={-66} width={10} height={66} fill={leg} />
    </g>
  );
};

// ---------------- KITCHEN (counter + sink + pan) ----------------
export const Kitchen: React.FC<{ x: number; y: number; scale?: number; grey?: boolean }> = ({ x, y, scale = 1, grey = false }) => {
  const fill = grey ? '#2B2D31' : C.FURN_DARK;
  const edge = grey ? '#4A4C52' : C.FURN_EDGE;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* counter */}
      <rect x={-230} y={-108} width={520} height={108} rx={14} fill={fill} stroke={edge} strokeWidth={3.5} />
      {/* sink */}
      <path d={`M -150 -108 L -150 -160 Q -150 -168 -142 -168 L -128 -168`} stroke={edge} strokeWidth={8} fill="none" strokeLinecap="round" />
      {/* stove knobs */}
      <circle cx={60} cy={-54} r={7} fill={edge} />
      <circle cx={110} cy={-54} r={7} fill={edge} />
      <circle cx={160} cy={-54} r={7} fill={edge} />
      {/* frying pan */}
      <ellipse cx={130} cy={-114} rx={64} ry={12} fill="#1B1B1F" stroke={edge} strokeWidth={3} />
      <rect x={192} y={-122} width={70} height={7} rx={3.5} fill={edge} transform="rotate(4 227 -118)" />
    </g>
  );
};

// ---------------- FRIDGE (with Saturday note) ----------------
export const Fridge: React.FC<{ x: number; y: number; scale?: number; note?: boolean; grey?: boolean }> = ({ x, y, scale = 1, note = false, grey = false }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-95} y={-260} width={190} height={260} rx={26} fill={grey ? '#2B2D31' : '#202227'} stroke={grey ? '#4A4C52' : EDGE} strokeWidth={3.5} />
    <line x1={-95} y1={-160} x2={95} y2={-160} stroke={grey ? '#4A4C52' : EDGE} strokeWidth={3} />
    <rect x={62} y={-200} width={9} height={30} rx={4.5} fill={grey ? '#4A4C52' : EDGE} />
    {note && (
      <g transform="rotate(-4 -30 -210)">
        <rect x={-52} y={-236} width={78} height={62} rx={4} fill="#EFE9D9" />
        <text x={-13} y={-210} textAnchor="middle" fontFamily="Patrick Hand" fontSize={19} fill="#B03A2E">
          SATURDAY
        </text>
        <text x={-13} y={-190} textAnchor="middle" fontFamily="Patrick Hand" fontSize={17} fill="#33322E">
          morning walk?
        </text>
        <line x1={-40} y1={-180} x2={14} y2={-180} stroke="#8A8578" strokeWidth={2} />
      </g>
    )}
  </g>
);

// ---------------- COUCH + TV (grey flatline) ----------------
export const Couch: React.FC<{ x: number; y: number; scale?: number; grey?: boolean }> = ({ x, y, scale = 1, grey = true }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-190} y={-96} width={380} height={70} rx={30} fill={grey ? '#313338' : C.FURN_DARK} />
    <rect x={-218} y={-140} width={60} height={120} rx={26} fill={grey ? '#2C2E33' : '#1E1E22'} />
    <rect x={158} y={-140} width={60} height={120} rx={26} fill={grey ? '#2C2E33' : '#1E1E22'} />
    <rect x={-196} y={-30} width={392} height={20} rx={10} fill={grey ? '#3B3D43' : '#2A2A2E'} />
    <rect x={-206} y={-10} width={12} height={10} fill={grey ? '#3B3D43' : '#2A2A2E'} />
    <rect x={194} y={-10} width={12} height={10} fill={grey ? '#3B3D43' : '#2A2A2E'} />
  </g>
);

export const TVSet: React.FC<{ x: number; y: number; scale?: number; grey?: boolean; on?: boolean }> = ({ x, y, scale = 1, grey = true, on = true }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-108} y={-64} width={8} height={64} fill={grey ? '#313338' : C.FURN_DARK} />
    <rect x={-120} y={0} width={260} height={26} rx={10} fill={grey ? '#313338' : C.FURN_DARK} />
    <rect x={-96} y={-190} width={240} height={150} rx={8} fill="#0C0D10" stroke={grey ? '#4A4C52' : EDGE} strokeWidth={4} />
    {on && (
      <>
        <rect x={-88} y={-182} width={224} height={134} rx={4} fill="#23262C" />
        <path d={`M -88 -80 Q -20 -130 136 -120 L 136 -48 L -88 -48 Z`} fill="#15171B" />
        <circle cx={60} cy={-108} r={4} fill="#0B0C0E" />
      </>
    )}
    {/* VHS tape */}
    <rect x={-130} y={-40} width={16} height={36} rx={2} fill={grey ? '#3E4046' : '#2E2E33'} />
    <text x={-122} y={-16} textAnchor="middle" fontFamily="Patrick Hand" fontSize={8} fill="#6E7076" transform="rotate(-90 -122 -22)">
      empty station
    </text>
  </g>
);

// ---------------- PARK: BENCH + TREES + STREET LAMP ----------------
export const Bench: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-110} y={-64} width={230} height={12} rx={6} fill="#4E4436" />
    <rect x={-110} y={-110} width={230} height={10} rx={5} fill="#4E4436" />
    <rect x={-104} y={-108} width={9} height={46} fill="#3B352C" />
    <rect x={107} y={-108} width={9} height={46} fill="#3B352C" />
    <rect x={-96} y={-52} width={10} height={52} fill="#3B352C" />
    <rect x={94} y={-52} width={10} height={52} fill="#3B352C" />
  </g>
);

export const TreeLine: React.FC<{ y: number; scale?: number; opacity?: number }> = ({ y, scale = 1, opacity = 1 }) => (
  <g transform={`translate(0,${y}) scale(${scale})`} opacity={opacity}>
    {Array.from({ length: 14 }).map((_, i) => (
      <circle key={i} cx={i * 105 - 40} cy={0} r={78 + (i % 3) * 14} fill="#0F100E" stroke="#1A1B18" strokeWidth={2} />
    ))}
  </g>
);

export const StreetLamp: React.FC<{ x: number; y: number; scale?: number; light?: boolean }> = ({ x, y, scale = 1, light = true }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-4} y={-330} width={8} height={330} fill="#2E2E33" />
    {light && (
      <>
        <ellipse cx={0} cy={-320} rx={16} ry={9} fill="#F5D9A0" />
        <ellipse cx={0} cy={-300} rx={90} ry={140} fill="rgba(245,217,160,0.08)" style={{ filter: 'blur(6px)' }} />
      </>
    )}
  </g>
);

// ---------------- LOCKER ROOM ----------------
export const Lockers: React.FC<{ y: number; scale?: number }> = ({ y, scale = 1 }) => (
  <g transform={`translate(0,${y}) scale(${scale})`}>
    {Array.from({ length: 16 }).map((_, i) => (
      <g key={i} transform={`translate(${i * 82 - 660},0)`}>
        <rect x={0} y={-260} width={72} height={260} rx={26} fill="#17181C" stroke="#2E2F36" strokeWidth={3} />
        <line x1={14} y1={-232} x2={58} y2={-232} stroke="#2E2F36" strokeWidth={3} />
        <line x1={14} y1={-222} x2={58} y2={-222} stroke="#2E2F36" strokeWidth={3} />
        <line x1={14} y1={-212} x2={58} y2={-212} stroke="#2E2F36" strokeWidth={3} />
        <rect x={30} y={-130} width={7} height={44} rx={3.5} fill="#2E2F36" />
      </g>
    ))}
  </g>
);

export const HangingBulb: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <line x1={0} y1={-120} x2={0} y2={0} stroke="#2A2A2E" strokeWidth={3} />
    <ellipse cx={0} cy={8} rx={10} ry={13} fill="#F5D9A0" />
    <ellipse cx={0} cy={30} rx={110} ry={130} fill="rgba(245,217,160,0.06)" style={{ filter: 'blur(8px)' }} />
  </g>
);

// ---------------- GYM ----------------
export const GymSet: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {/* dumbbell rack */}
    <g transform="translate(-620,0)">
      <rect x={0} y={-56} width={10} height={56} fill="#2E2E33" />
      <rect x={200} y={-56} width={10} height={56} fill="#2E2E33" />
      <rect x={0} y={-62} width={210} height={9} rx={4} fill="#2E2E33" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${28 + i * 48},-88)`}>
          <circle cx={0} cy={0} r={26} fill="#26262C" stroke="#3A3A42" strokeWidth={3} />
          <circle cx={30} cy={0} r={26} fill="#26262C" stroke="#3A3A42" strokeWidth={3} />
        </g>
      ))}
    </g>
    {/* mirror edge */}
    <rect x={-320} y={-420} width={10} height={420} fill="#24242A" />
    <rect x={-310} y={-420} width={230} height={420} fill="#101014" />
    {/* squat-stand posts */}
    <rect x={290} y={-260} width={9} height={260} fill="#3E3E46" />
    <rect x={330} y={-260} width={9} height={260} fill="#3E3E46" />
    <circle cx={294} cy={-236} r={6} fill="#6E6E76" />
  </g>
);

export const WeightPlate: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <circle cx={0} cy={0} r={46} fill="#1B1B20" stroke="#3A3A42" strokeWidth={4} />
    <circle cx={0} cy={0} r={14} fill="#0E0E12" stroke="#3A3A42" strokeWidth={3} />
    <text x={0} y={7} textAnchor="middle" fontFamily="Patrick Hand" fontSize={17} fill="#8E8E96">
      20
    </text>
  </g>
);

// ---------------- DRAWING PAPER close-up ----------------
export const DrawingPaper: React.FC<{ x: number; y: number; scale?: number; drawProgress: number }> = ({ x, y, scale = 1, drawProgress }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-230} y={-180} width={460} height={360} rx={18} fill="#EFE9D9" />
    {/* mountain outline (path length ~ 560) */}
    <path
      d="M -180 110 L -60 40 L 10 96 L 96 30 L 150 118"
      stroke="#33322E"
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={560}
      strokeDashoffset={Math.max(0, 560 * (1 - Math.min(1, drawProgress * 1.4)))}
    />
    {/* tree */}
    <path
      d="M -20 60 L -22 -20 M -60 -40 L -20 -68 L 24 -44 L 14 -4 L -34 0 Z"
      stroke="#33322E"
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={420}
      strokeDashoffset={Math.max(0, 420 * (1 - Math.max(0, drawProgress * 1.4 - 0.35)))}
    />
  </g>
);

// ---------------- SOUP BOWL ----------------
export const SoupBowl: React.FC<{ x: number; y: number; scale?: number; frame?: number }> = ({ x, y, scale = 1, frame = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M -46 -18 L 46 -18 Q 40 18 0 18 Q -40 18 -46 -18 Z" fill="#DDDDD2" stroke="#2A2A2E" strokeWidth={3.5} />
    <path d="M -40 -18 L 40 -18" stroke="#B03A2E" strokeWidth={0} />
    <ellipse cx={0} cy={-16} rx={38} ry={7} fill="#D8923E" />
    {Array.from({ length: 2 }).map((_, i) => (
      <path
        key={i}
        d={`M ${-8 + i * 16} ${-34} q 6 -10 0 -20`}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        opacity={0.4 + 0.3 * Math.sin((frame ?? 0) * 0.12 + i * 2)}
      />
    ))}
  </g>
);

// ---------------- ALARM CLOCK re-export ----------------
export { AlarmClock };
