// ============================================================
// LUST FILM — scenes, part 1: Day 1 → Day 7
// All scene content renders inside a <Stage> svg viewport.
// ============================================================
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { C, F, FLOOR } from './theme';
import { Cam, Whisper, Pill, AlarmClock, ease, Stage, Floor, Vignette as Vign } from './kit';
import { MainChar, Entity } from './actors';
import {
  BedFull, Window, Dresser, PhoneFlat, GymSet, WeightPlate, StreetLamp,
} from './props';

// ============ DAY 1 — bedroom, sitting with phone ============
export const S_D1Bed: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.0, 1.07]} zoomEnd={160} panY={[0, -6]}>
      <Stage>
        <Floor />
        <BedFull x={460} y={FLOOR} />
        <Window x={1060} y={195} />
        <Dresser x={1105} y={FLOOR} />
        <MainChar pose="sitBedPhone" x={680} y={FLOOR} face={{ eyes: 'half', brows: 'worried', mouth: 'line' }} glow />
      </Stage>
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 1 — phone close-up ============
export const S_D1Phone: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.0, 1.08]} zoomEnd={150}>
        <Stage>
          <g transform="translate(640,388)">
            <rect x={-118} y={-232} width={236} height={470} rx={36} fill="#0A0A0D" stroke="#3A3A44" strokeWidth={5} />
            <path d="M -100 -180 L 100 -220 L 100 40 L -100 90 Z" fill="rgba(255,255,255,0.035)" />
            <rect x={-152} y={62} width={44} height={38} rx={19} fill={C.CREAM} />
            <rect x={-152} y={106} width={44} height={38} rx={19} fill={C.CREAM} />
            <rect x={-152} y={150} width={44} height={38} rx={19} fill={C.CREAM} />
            <rect x={-152} y={194} width={44} height={38} rx={19} fill={C.CREAM} />
            <path d="M 130 300 Q 120 210 60 176 Q 20 158 -8 190 Q -30 218 10 244 Q 60 274 92 306 Z" fill={C.CREAM} />
          </g>
        </Stage>
      </Cam>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: ease(f, 100, 130, 0, 0.35), zIndex: 20 }} />
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 1 — placing phone on dresser ============
const DresserScene: React.FC<{ place: boolean }> = ({ place }) => (
  <Stage>
    <Floor />
    <BedFull x={-120} y={FLOOR} />
    <Dresser x={790} y={FLOOR} />
    <MainChar
      pose={place ? 'standPlace' : 'stand'}
      x={600}
      y={FLOOR}
      face={{ eyes: 'open', brows: 'angry', mouth: 'smirk' }}
    />
    {place && <PhoneFlat x={806} y={FLOOR - 118} scale={0.9} />}
  </Stage>
);

export const S_D1Dresser: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.06, 1.0]} zoomEnd={170}>
      <DresserScene place />
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 1 — "never again." framed pull-back ============
export const S_D1Never: React.FC = () => (
  <AbsoluteFill style={{ background: '#0A0A0B' }}>
    <Cam zoom={[1.12, 1.0]} zoomEnd={150} panY={[0, -4]}>
      <div style={{ position: 'absolute', inset: 64, border: '3px solid #2C2C32', borderRadius: 10, overflow: 'hidden', background: C.BG }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <DresserScene place />
          <Pill text="never again." x={600} y={208} start={18} />
        </div>
      </div>
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 1 — infinite grid zoom-out ============
const GridTile: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <svg viewBox="0 0 300 170" style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: '1.5px solid #26262B', background: C.BG }}>
    <line x1={0} y1={140} x2={300} y2={140} stroke={C.FLOOR_LINE} strokeWidth={2} />
    <path d="M -60 140 Q -40 118 -10 120 L 44 124 Q 56 128 54 136 L -66 140 Z" fill={C.BED_SHEET} opacity={0.9} />
    <rect x={158} y={82} width={86} height={58} rx={9} fill={C.FURN_DARK} stroke={C.FURN_EDGE} strokeWidth={2} />
    {/* tiny standing char looking at phone */}
    <rect x={106} y={74} width={30} height={56} rx={15} fill={C.CREAM} />
    <circle cx={121} cy={62} r={16} fill={C.CREAM} />
    {/* phone held in front, below the face */}
    <rect x={136} y={78} width={9} height={15} rx={3} fill="#0B0B0D" />
    <text x={121} y={40} textAnchor="middle" fontFamily={F.HAND} fontSize={13} fill={C.TEXT_WHITE}>never again.</text>
  </svg>
);

export const S_D1Grid: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 230], [1.05, 0.4], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: C.BG, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '50% 50%' }}>
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => (
            <GridTile key={`${row}-${col}`} x={col * 310 - 380} y={row * 182 - 130} w={300} h={170} />
          )),
        )}
      </div>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 1 — asleep, clock ticks 1:20→1:21 ============
export const S_D1Sleep: React.FC = () => {
  const f = useCurrentFrame();
  const worried = f > 175;
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.0, 1.32]} zoomStart={30} zoomEnd={260} panX={[0, 220]} panY={[0, 0]}>
        <Stage>
          <Floor />
          <BedFull x={460} y={FLOOR} />
          <Dresser x={-30} y={FLOOR} drawers={1} />
          <Window x={1120} y={200} />
          <Dresser x={1105} y={FLOOR} />
          <AlarmClock time="1:20" x={-70} y={FLOOR - 122} scale={0.8} />
          <MainChar
            pose="lieBed"
            x={130}
            y={FLOOR - 30}
            face={{ eyes: 'closed', brows: worried ? 'worried' : 'flat', mouth: worried ? 'line' : 'smile' }}
          />
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 3 — wide, eyes open ============
export const S_D3Wide: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.34, 1.18]} zoomEnd={160} panX={[120, 40]}>
      <Stage>
        <Floor />
        <BedFull x={460} y={FLOOR} />
        <Dresser x={-30} y={FLOOR} drawers={1} />
        <Window x={1120} y={200} />
        <AlarmClock time="2:14" x={-70} y={FLOOR - 122} scale={0.8} />
        <MainChar pose="lieBed" x={130} y={FLOOR - 30} face={{ eyes: 'open', brows: 'worried', mouth: 'line', sweat: true }} />
      </Stage>
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 3 — entity enters ============
export const S_D3Entity: React.FC = () => {
  const f = useCurrentFrame();
  const ex = interpolate(f, [10, 90], [1250, 950], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.06, 1.14]} zoomEnd={156}>
        <Stage>
          <Floor />
          <BedFull x={460} y={FLOOR} />
          <Dresser x={-30} y={FLOOR} drawers={1} />
          <Window x={1060} y={195} />
          <Dresser x={1140} y={FLOOR} />
          <AlarmClock time="2:14" x={-70} y={FLOOR - 122} scale={0.8} />
          <MainChar pose="lieBed" x={130} y={FLOOR - 30} face={{ eyes: 'glanceR', brows: 'worried', mouth: 'line', sweat: true }} />
          <Entity x={ex} y={FLOOR} scale={0.94} lean={6} />
        </Stage>
      </Cam>
      <Whisper text="just once." x={940} y={160} start={70} dur={80} />
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 3 — extreme face close-up ============
export const S_D3Close: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.05, 1.12]} zoomEnd={130}>
      <Stage>
        <path d="M -40 620 Q 200 560 420 640 L -40 700 Z" fill="#14161C" />
        <path d="M 900 660 Q 1100 600 1320 680 L 1320 720 L 900 720 Z" fill="#14161C" />
        <g transform="translate(590,400) scale(3.1)">
          <circle cx={0} cy={0} r={52} fill={C.CREAM} stroke="#18181C" strokeWidth={5} />
          <path d="M -38 -30 L -6 -36" stroke="#18181C" strokeWidth={8} strokeLinecap="round" />
          <path d="M 8 -36 L 40 -28" stroke="#18181C" strokeWidth={8} strokeLinecap="round" />
          <circle cx={-14} cy={-2} r={7.5} fill="#18181C" />
          <circle cx={16} cy={-2} r={7.5} fill="#18181C" />
          <ellipse cx={2} cy={26} rx={9} ry={11} fill="#18181C" />
          <path d="M 36 -28 q 7 12 0 18 q -7 -6 0 -18" fill="#9CC7F2" />
        </g>
      </Stage>
      <Vign />
    </Cam>
  </AbsoluteFill>
);

// ============ DAY 3 — wide, entity leaning in ============
export const S_D3Wide2: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.1, 1.2]} zoomEnd={180}>
      <Stage>
        <Floor />
        <BedFull x={460} y={FLOOR} />
        <Dresser x={-30} y={FLOOR} drawers={1} />
        <Window x={1060} y={195} />
        <Dresser x={1140} y={FLOOR} />
        <AlarmClock time="2:31" x={-70} y={FLOOR - 122} scale={0.8} />
        <MainChar pose="lieBed" x={130} y={FLOOR - 30} face={{ eyes: 'half', brows: 'worried', mouth: 'line', sweat: true }} />
        <Entity x={980} y={FLOOR} scale={0.96} lean={12} armReach />
      </Stage>
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 3 — craving wave chart (red) ============
export const S_D3Chart: React.FC = () => {
  const f = useCurrentFrame();
  const p = ease(f, 15, 165, 0, 1);
  const LEN = 1050;
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.02, 1.06]} zoomEnd={270}>
        <Stage>
          <line x1={310} y1={268} x2={310} y2={520} stroke="#B9B4A8" strokeWidth={3} />
          <line x1={310} y1={520} x2={980} y2={520} stroke="#B9B4A8" strokeWidth={3} />
          <path
            d="M 312 508 Q 400 470 470 420 Q 540 370 590 330 Q 640 300 680 318 Q 740 360 780 420 Q 840 490 930 506"
            stroke={C.ENTITY_RED}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={LEN}
            strokeDashoffset={LEN * (1 - p)}
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,42,24,0.5))' }}
          />
          <circle cx={930} cy={506} r={9} fill="#FFF6E8" opacity={ease(f, 130, 150, 0, 1)} style={{ filter: 'blur(1px)' }} />
          <circle cx={930} cy={506} r={26} fill="rgba(255,246,232,0.25)" opacity={ease(f, 130, 150, 0, 1)} style={{ filter: 'blur(6px)' }} />
          <text x={310} y={560} textAnchor="middle" fontFamily={F.HAND} fontSize={26} fill="#8E8E92">0 min</text>
          <text x={965} y={560} textAnchor="middle" fontFamily={F.HAND} fontSize={26} fill="#8E8E92">20 min</text>
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 3 — crawling away from the entity ============
export const S_D3Crawl: React.FC = () => {
  const f = useCurrentFrame();
  const cx = interpolate(f, [0, 150], [480, 640], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.04, 1.1]} zoomEnd={150} tilt={[-1.2, 0]}>
        <Stage>
          <Floor />
          <g transform="translate(120,340) rotate(-7)">
            <BedFull x={0} y={200} scale={0.9} />
          </g>
          <Window x={760} y={140} scale={0.8} moon={false} />
          <Dresser x={880} y={FLOOR} scale={0.9} />
          <MainChar pose="crawl" x={cx} y={FLOOR} face={{ eyes: 'open', brows: 'angry', mouth: 'grit', sweat: true }} frame={f} />
          <Entity x={700} y={FLOOR - 30} scale={1.02} lean={-8} />
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 3 — back under the blanket ============
export const S_D3Sleep2: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.05, 1.0]} zoomEnd={90}>
      <Stage>
        <Floor />
        <BedFull x={460} y={FLOOR} />
        <Dresser x={-30} y={FLOOR} drawers={1} />
        <Window x={1060} y={195} />
        <AlarmClock time="2:40" x={-70} y={FLOOR - 122} scale={0.8} />
        <MainChar pose="lieBed" x={130} y={FLOOR - 30} face={{ eyes: 'closed', brows: 'flat', mouth: 'line' }} />
      </Stage>
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 7 — clock close-up 5:58 ============
export const S_D7Clock: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.06, 1.0]} zoomEnd={110}>
      <Stage>
        <rect x={228} y={452} width={824} height={268} rx={10} fill="#232326" stroke={C.FURN_EDGE} strokeWidth={3.5} />
        <AlarmClock time="5:58" x={450} y={368} scale={1.35} glowPulse />
      </Stage>
      <Vign />
    </Cam>
  </AbsoluteFill>
);

// ============ DAY 7 — gym push-up ============
export const S_D7Gym: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.06, 1.0]} zoomEnd={190} panX={[10, -6]}>
        <Stage>
          <Floor />
          <GymSet x={640} y={FLOOR} />
          <MainChar pose="pushup" x={620} y={FLOOR} face={{ eyes: 'open', brows: 'angry', mouth: 'grit', sweat: true }} frame={f} />
          <g transform={`translate(590,${FLOOR - 176})`}>
            <WeightPlate x={0} y={0} />
          </g>
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 7 — night run ============
const HouseScape: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Stage>
    <rect x={0} y={0} width={1280} height={720} fill="#0B0810" />
    <rect x={0} y={0} width={1280} height={330} fill="rgba(64,32,52,0.35)" />
    {Array.from({ length: 9 }).map((_, i) => {
      const x = i * 160 - 60;
      const h = 200 + (i % 3) * 60;
      return (
        <g key={i}>
          <path d={`M ${x} ${FLOOR} L ${x} ${FLOOR - h} Q ${x + 70} ${FLOOR - h - 66} ${x + 140} ${FLOOR} Z`} fill="#100D14" />
          {(i % 2 === 0 || i % 3 === 0) && <rect x={x + 34} y={FLOOR - h + 60} width={30} height={36} fill={C.GOLD} opacity={0.75} />}
        </g>
      );
    })}
    <rect x={0} y={FLOOR + 20} width={1280} height={60} fill="#08070A" />
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={i * 180} y={FLOOR + 46} width={70} height={7} rx={3.5} fill="#2E2E33" />
    ))}
    {children}
  </Stage>
);

const SpeedLines: React.FC<{ f: number }> = ({ f }) => (
  <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {Array.from({ length: 6 }).map((_, i) => {
      const y = 200 + i * 62;
      const x = ((f * 14 + i * 300) % 1500) - 200;
      return <rect key={i} x={x} y={y} width={150 + (i % 3) * 60} height={3.5} rx={1.75} fill="rgba(255,255,255,0.16)" />;
    })}
  </svg>
);

export const S_D7Run: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.02, 1.08]} zoomEnd={174} panX={[-14, 14]}>
        <HouseScape>
          <StreetLamp x={300} y={FLOOR} />
          <StreetLamp x={1000} y={FLOOR} />
          <MainChar pose="run" x={620 + Math.sin(f * 0.5) * 6} y={FLOOR} face={{ eyes: 'open', brows: 'angry', mouth: 'smirk' }} frame={f} />
        </HouseScape>
      </Cam>
      <SpeedLines f={f} />
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 7 — desk / put that energy somewhere ============
export const S_D7Desk: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.04, 1.0]} zoomEnd={100}>
      <Stage>
        <Floor />
        <rect x={470} y={FLOOR - 122} width={600} height={13} rx={6} fill="#4A4438" />
        <rect x={492} y={FLOOR - 109} width={11} height={109} fill="#3B372E" />
        <rect x={1036} y={FLOOR - 109} width={11} height={109} fill="#3B372E" />
        <g transform="translate(1010,FLOOR - 122)">
          <ellipse cx={0} cy={0} rx={40} ry={8} fill="#2E2E33" />
          <line x1={0} y1={-4} x2={-18} y2={-130} stroke="#4E4E56" strokeWidth={8} strokeLinecap="round" />
          <path d="M -44 -136 L 14 -160 L 30 -128 L -34 -108 Z" fill="#4E4E56" />
          <ellipse cx={-6} cy={-108} rx={13} ry={9} fill="#F5D9A0" />
          <path d="M -60 -90 L 60 -40 L 130 -30 L 40 -110 Z" fill="rgba(245,217,160,0.07)" style={{ filter: 'blur(4px)' }} />
        </g>
        <rect x={660} y={FLOOR - 132} width={74} height={10} rx={3} fill="#EFE9D9" opacity={0.9} transform="rotate(-3 697 -127)" />
        <rect x={418} y={FLOOR - 150} width={10} height={150} fill="#3B372E" />
        <MainChar pose="sitDesk" x={560} y={FLOOR - 4} face={{ eyes: 'open', brows: 'angry', mouth: 'line' }} />
      </Stage>
      <Vign />
    </Cam>
  </AbsoluteFill>
);

// ============ DAY 7 — testosterone curve (gold) ============
export const S_D7Chart: React.FC = () => {
  const f = useCurrentFrame();
  const p = ease(f, 12, 130, 0, 1);
  const LEN = 1000;
  const peak = ease(f, 96, 110, 0, 1);
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.02, 1.05]} zoomEnd={150}>
        <Stage>
          <line x1={310} y1={262} x2={310} y2={512} stroke="#B9B4A8" strokeWidth={3} />
          <line x1={310} y1={512} x2={980} y2={512} stroke="#B9B4A8" strokeWidth={3} />
          <path
            d="M 312 474 Q 420 462 500 424 Q 580 386 636 330 Q 668 300 700 330 Q 760 400 800 446 Q 870 480 972 476"
            stroke={C.GOLD}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={LEN}
            strokeDashoffset={LEN * (1 - p)}
            style={{ filter: 'drop-shadow(0 0 7px rgba(245,185,63,0.45))' }}
          />
          <g opacity={peak}>
            <circle cx={666} cy={302} r={9} fill={C.GOLD} style={{ filter: 'blur(0.5px)' }} />
            <circle cx={666} cy={302} r={30} fill="rgba(245,185,63,0.3)" style={{ filter: 'blur(7px)' }} />
            <text x={666} y={252} textAnchor="middle" fontFamily={F.TITLE} fontSize={30} letterSpacing={2} fill={C.GOLD}>
              DAY 7
            </text>
          </g>
          <circle cx={972} cy={476} r={24} fill="rgba(245,185,63,0.25)" opacity={ease(f, 118, 132, 0, 1)} style={{ filter: 'blur(6px)' }} />
          <text x={310} y={552} textAnchor="middle" fontFamily={F.HAND} fontSize={26} fill="#8E8E92">DAY 1</text>
          <text x={968} y={552} textAnchor="middle" fontFamily={F.HAND} fontSize={26} fill="#8E8E92">DAY 14</text>
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 7 — run close-up ============
export const S_D7Run2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.08, 1.18]} zoomEnd={126} panX={[10, -10]}>
        <HouseScape />
      </Cam>
      <SpeedLines f={f} />
      <Cam zoom={[1.08, 1.18]} zoomEnd={126} panX={[10, -10]} style={{ pointerEvents: 'none' }}>
        <Stage>
          <MainChar pose="run" x={620} y={FLOOR + 60} scale={1.5} face={{ eyes: 'open', brows: 'angry', mouth: 'line' }} frame={f} />
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};
