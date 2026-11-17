// ============================================================
// LUST FILM — scenes, part 2: Day 10 → end cards
// All scene content renders inside a <Stage> svg viewport.
// ============================================================
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { C, F, FLOOR } from './theme';
import { Cam, Whisper, AlarmClock, ease, Stage, Floor, Vignette as Vign } from './kit';
import { MainChar, Entity, FriendChar } from './actors';
import {
  BedFull, Window, Dresser, PhoneFlat, PhoneLockscreen, PhoneBack, TableChair, Kitchen, Fridge,
  Couch, TVSet, Bench, TreeLine, StreetLamp, Lockers, HangingBulb, DrawingPaper, SoupBowl,
} from './props';

// ============ DAY 10 — kitchen walk ============
export const S_D10Walk: React.FC = () => {
  const f = useCurrentFrame();
  const cx = interpolate(f, [0, 150], [420, 560], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.0, 1.05]} zoomEnd={150}>
        <Stage>
          <Floor />
          <Fridge x={-30} y={FLOOR} />
          <Window x={1005} y={185} scale={0.9} />
          <TableChair x={330} y={FLOOR} />
          <Kitchen x={950} y={FLOOR} />
          <MainChar pose="walk" x={cx} y={FLOOR} face={{ eyes: 'open', brows: 'flat', mouth: 'smirk' }} frame={f} />
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 10 — phone lockscreen 23:48 ============
export const S_D10Phone: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 48%, #17171C 0%, #050505 78%)' }}>
    <Cam zoom={[1.0, 1.09]} zoomEnd={144}>
      <Stage>
        <g transform="translate(640,392) scale(0.92)">
          <PhoneLockscreen time="23:48" />
        </g>
      </Stage>
      <Vign />
    </Cam>
  </AbsoluteFill>
);

// ============ DAY 10 — the negotiation ============
export const S_D10Talk: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.0, 1.13]} zoomStart={20} zoomEnd={440} panX={[0, 30]}>
      <Stage>
        <Floor />
        <Window x={820} y={215} scale={0.8} moon={false} />
        <TableChair x={140} y={FLOOR} />
        <Kitchen x={880} y={FLOOR} />
        <PhoneFlat x={700} y={FLOOR - 102} scale={0.9} glow />
        <MainChar pose="stand" x={440} y={FLOOR} face={{ eyes: 'glanceR', brows: 'worried', mouth: 'line', sweat: true }} />
        <Entity x={920} y={FLOOR} scale={0.98} lean={10} armReach />
      </Stage>
    </Cam>
    <Whisper text="you've done so well." x={810} y={130} start={25} dur={195} size={34} />
    <Whisper text="you earned one." x={790} y={150} start={240} dur={170} size={34} />
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 10 — the resist close-up ============
export const S_D10Resist: React.FC = () => {
  const f = useCurrentFrame();
  const redGlow = 1 - ease(f, 60, 150, 0, 1);
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.04, 1.1]} zoomEnd={152}>
        <Stage>
          <ellipse cx={1240} cy={480} rx={190} ry={260} fill="rgba(255,42,24,0.35)" opacity={redGlow} style={{ filter: 'blur(40px)' }} />
          <g transform="translate(560,410) scale(3.4)">
            <circle cx={0} cy={0} r={52} fill={C.CREAM} stroke="#18181C" strokeWidth={5} />
            <path d="M -40 -32 L -8 -40" stroke="#18181C" strokeWidth={9} strokeLinecap="round" />
            <path d="M 10 -40 L 42 -32" stroke="#18181C" strokeWidth={9} strokeLinecap="round" />
            <circle cx={-14} cy={-2} r={8} fill="#18181C" />
            <circle cx={16} cy={-2} r={8} fill="#18181C" />
            <rect x={-20} y={22} width={40} height={9} rx={4} fill="#18181C" />
          </g>
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 10 — walking away, victory ============
export const S_D10Leave: React.FC = () => {
  const f = useCurrentFrame();
  const cx = interpolate(f, [0, 147], [640, 400], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.02, 1.0]} zoomEnd={147}>
        <Stage>
          <Floor />
          <Fridge x={-30} y={FLOOR} />
          <Window x={1005} y={185} scale={0.9} />
          <TableChair x={330} y={FLOOR} />
          <Kitchen x={950} y={FLOOR} />
          <MainChar pose="walk" x={cx} y={FLOOR} flip face={{ eyes: 'open', brows: 'flat', mouth: 'smirk' }} frame={f} />
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 14 — grey title card ============
export const S_D14Intro: React.FC = () => {
  const f = useCurrentFrame();
  const o = ease(f, 8, 40, 0, 0.55);
  return (
    <AbsoluteFill style={{ background: '#020202' }}>
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: F.TITLE, fontSize: 120, letterSpacing: 8, color: C.TEXT_WHITE, opacity: o }}>DAY 14</span>
      </div>
    </AbsoluteFill>
  );
};

// ============ DAY 14 — flatline couch ============
export const S_D14Couch: React.FC = () => (
  <AbsoluteFill style={{ background: '#0A0A0B' }}>
    <Cam zoom={[1.08, 1.0]} zoomEnd={240} panY={[0, -4]}>
      <Stage>
        <line x1={0} y1={FLOOR} x2={1280} y2={FLOOR} stroke="#232326" strokeWidth={3} />
        <Couch x={430} y={FLOOR - 6} />
        <TVSet x={1060} y={FLOOR} />
        <MainChar pose="sitCouch" x={400} y={FLOOR + 8} face={{ eyes: 'tired', brows: 'flat', mouth: 'line' }} />
      </Stage>
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 14 — staring at the ceiling, 9:40 ============
export const S_D14Bed: React.FC = () => (
  <AbsoluteFill style={{ background: '#0A0A0B' }}>
    <Cam zoom={[1.0, 1.06]} zoomEnd={195}>
      <Stage>
        <line x1={0} y1={FLOOR} x2={1280} y2={FLOOR} stroke="#232326" strokeWidth={3} />
        <BedFull x={460} y={FLOOR} grey />
        <Dresser x={-30} y={FLOOR} drawers={1} grey />
        <AlarmClock time="9:40" x={-70} y={FLOOR - 122} scale={0.8} grey />
        <Dresser x={1105} y={FLOOR} grey />
        <MainChar pose="lieBed" x={130} y={FLOOR - 30} face={{ eyes: 'half', brows: 'flat', mouth: 'line' }} />
      </Stage>
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 14 — grey kitchen, phone in hand ============
export const S_D14Kitchen: React.FC = () => (
  <AbsoluteFill style={{ background: '#0A0A0B' }}>
    <Cam zoom={[1.14, 1.02]} zoomEnd={156} panX={[60, 0]}>
      <Stage>
        <line x1={0} y1={FLOOR} x2={1280} y2={FLOOR} stroke="#232326" strokeWidth={3} />
        <Window x={1005} y={185} scale={0.9} moon={false} grey />
        <Fridge x={-30} y={FLOOR} grey />
        <Kitchen x={950} y={FLOOR} grey />
        <MainChar
          pose="stand"
          x={620}
          y={FLOOR}
          face={{ eyes: 'half', brows: 'sad', mouth: 'frown' }}
        />
        <rect x={612} y={FLOOR - 262} width={26} height={44} rx={7} fill="#0B0B0E" stroke="#3A3A42" strokeWidth={2.5} />
      </Stage>
    </Cam>
    <Whisper text="see, it's not your day." x={640} y={140} start={40} dur={80} size={30} />
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 14 — color returns, small smile ============
export const S_D14Smile: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.0, 1.09]} zoomEnd={200} panX={[0, 40]}>
      <Stage>
        <Floor />
        <Window x={1005} y={185} scale={0.9} />
        <TableChair x={140} y={FLOOR} />
        <Kitchen x={950} y={FLOOR} />
        <MainChar pose="stand" x={620} y={FLOOR} face={{ eyes: 'open', brows: 'flat', mouth: 'smile' }} />
      </Stage>
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ DAY 14 — drawing ============
export const S_D14Draw: React.FC = () => {
  const f = useCurrentFrame();
  const p = ease(f, 30, 240, 0, 1);
  const armShift = Math.sin(f * 0.18) * 6;
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.03, 1.07]} zoomEnd={300}>
        <Stage>
          <DrawingPaper x={610} y={400} scale={0.95} drawProgress={p} />
          <g transform={`translate(${936 + armShift},${258 + armShift * 0.6}) rotate(${28 + armShift})`}>
            <rect x={-30} y={-34} width={110} height={64} rx={32} fill={C.CREAM} stroke="#18181C" strokeWidth={5} />
            <rect x={30} y={-20} width={420} height={56} rx={28} fill={C.CREAM} stroke="#18181C" strokeWidth={5} />
            <rect x={-64} y={-16} width={60} height={13} rx={6} fill={C.GOLD} transform="rotate(-24 -34 -10)" />
            <path d="M -76 -8 L -64 -22 L -60 -6 Z" fill="#B98A4A" />
          </g>
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 21 — park bench with a friend ============
export const S_D21Bench: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.0, 1.07]} zoomEnd={360} panX={[0, 16]}>
        <Stage>
          <Floor />
          <TreeLine y={FLOOR - 84} opacity={0.85} />
          <StreetLamp x={1180} y={FLOOR} />
          <Bench x={700} y={FLOOR} />
          <MainChar pose="sitBench" x={640} y={FLOOR + 38} face={{ eyes: 'open', brows: 'flat', mouth: 'smile' }} />
          <FriendChar pose="sit" x={780} y={FLOOR + 38} flip face={{ eyes: 'open', brows: 'flat', mouth: 'smile' }} />
          <Entity x={150} y={FLOOR} scale={0.5} opacity={0.9} frame={f} />
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 21 — hot food ============
export const S_D21Food: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.09, 1.0]} zoomEnd={147} panX={[40, 0]}>
        <Stage>
          <Floor />
          <Fridge x={1245} y={FLOOR} note={false} />
          <TableChair x={740} y={FLOOR} />
          <SoupBowl x={820} y={FLOOR - 96} frame={f} />
          <MainChar pose="eat" x={596} y={FLOOR + 48} face={{ eyes: 'open', brows: 'flat', mouth: 'smile' }} frame={f} />
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 21 — locker room, eye contact ============
export const S_D21Lockers: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[1.02, 1.12]} zoomEnd={270} panY={[0, -8]}>
        <Stage>
          <line x1={0} y1={FLOOR} x2={1280} y2={FLOOR} stroke="#232326" strokeWidth={3} />
          <Lockers y={FLOOR} />
          <HangingBulb x={640} y={220} />
          <MainChar pose="stand" x={560} y={FLOOR} face={{ eyes: 'open', brows: 'flat', mouth: 'smile' }} frame={f} />
          <FriendChar pose="stand" x={744} y={FLOOR} flip face={{ eyes: 'open', brows: 'flat', mouth: 'smile' }} />
        </Stage>
      </Cam>
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 30 — the mirror ============
export const S_D30Mirror: React.FC = () => {
  const f = useCurrentFrame();
  const entityO = ease(f, 60, 110, 0, 1) * (1 - ease(f, 260, 300, 1, 0));
  const zoom = interpolate(f, [0, 320], [1.06, 1.18], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: C.BG }}>
      <Cam zoom={[zoom, zoom]}>
        <Stage>
          <Floor />
          <HangingBulb x={830} y={120} />
          <rect x={716} y={430} width={228} height={126} rx={10} fill="#232326" stroke={C.FURN_EDGE} strokeWidth={3.5} />
          <ellipse cx={830} cy={330} rx={215} ry={265} fill="#0D0F16" stroke="#4A4C52" strokeWidth={9} />
          {/* reflection: head + shoulders */}
          <circle cx={790} cy={330} r={74} fill={C.CREAM} stroke="#18181C" strokeWidth={4} />
          <path d="M 700 480 Q 790 396 880 480 L 880 500 Q 790 460 700 500 Z" fill={C.CREAM} />
          <path d="M 764 322 L 800 314" stroke="#18181C" strokeWidth={7} strokeLinecap="round" />
          <path d="M 780 314 L 816 322" stroke="#18181C" strokeWidth={7} strokeLinecap="round" />
          <circle cx={782} cy={340} r={6.5} fill="#18181C" />
          <circle cx={808} cy={340} r={6.5} fill="#18181C" />
          <path d="M 782 366 Q 796 376 810 366" stroke="#18181C" strokeWidth={5} fill="none" strokeLinecap="round" />
          <MainChar pose="stand" x={470} y={FLOOR} face={{ eyes: 'open', brows: 'flat', mouth: 'smirk' }} />
          {/* tiny entity inside the reflection */}
          <g opacity={entityO} transform="translate(900,420) scale(0.62)" style={{ filter: `drop-shadow(0 0 10px ${C.ENTITY_GLOW})` }}>
            <circle cx={0} cy={-60} r={44} fill={C.ENTITY} />
            <rect x={-32} y={-30} width={64} height={90} rx={30} fill={C.ENTITY} />
            <path d="M -18 -68 Q -8 -78 2 -68" stroke={C.ENTITY_RED} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M 12 -68 Q 22 -78 32 -68" stroke={C.ENTITY_RED} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M -12 -44 Q 10 -30 32 -44" stroke={C.ENTITY_RED} strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        </Stage>
      </Cam>
      <Whisper text="just once." x={968} y={168} start={75} dur={170} size={32} />
      <Vign />
    </AbsoluteFill>
  );
};

// ============ DAY 30 — the phone, ignored ============
export const S_D30Phone: React.FC = () => (
  <AbsoluteFill style={{ background: '#0C0C0E' }}>
    <div
      style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 56px)',
      }}
    />
    <Cam zoom={[1.0, 1.07]} zoomEnd={200}>
      <Stage>
        <g transform="translate(640,392) rotate(-2) scale(0.88)">
          <PhoneBack />
        </g>
      </Stage>
      <Vign />
    </Cam>
  </AbsoluteFill>
);

// ============ DAY 30 — 7:00 AM, in control ============
export const S_D30Morning: React.FC = () => (
  <AbsoluteFill style={{ background: C.BG }}>
    <Cam zoom={[1.12, 1.0]} zoomEnd={210} panX={[60, 0]}>
      <Stage>
        <Floor />
        <BedFull x={460} y={FLOOR} />
        <Dresser x={-30} y={FLOOR} drawers={1} />
        <AlarmClock time="7:00" x={-70} y={FLOOR - 122} scale={0.8} />
        <Window x={1080} y={200} warm />
        <Dresser x={1140} y={FLOOR} />
        <MainChar pose="stand" x={820} y={FLOOR} flip face={{ eyes: 'open', brows: 'flat', mouth: 'smirk' }} />
      </Stage>
    </Cam>
    <Vign />
  </AbsoluteFill>
);

// ============ END CARDS ============
export const S_CTA: React.FC = () => {
  const f = useCurrentFrame();
  const o = ease(f, 20, 50, 0, 1);
  const g = ease(f, 20, 260, 1, 1.05);
  return (
    <AbsoluteFill style={{ background: '#030303' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o, transform: `scale(${g})` }}>
        <span style={{ fontFamily: F.HAND, fontSize: 46, color: C.TEXT_WHITE, marginBottom: 2 }}>Start your</span>
        <span style={{ fontFamily: F.HAND, fontSize: 104, color: C.TEXT_WHITE, fontWeight: 700 }}>Day 1 today.</span>
      </div>
    </AbsoluteFill>
  );
};

export const S_Subscribe: React.FC = () => {
  const f = useCurrentFrame();
  const o = ease(f, 10, 40, 0, 1);
  const click = f > 120 && f < 150 ? 1 - ease(f, 120, 128, 0, 0.12) : 1;
  return (
    <AbsoluteFill style={{ background: '#050505' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: F.HAND, fontSize: 44, color: C.TEXT_WHITE }}>If this video helped you,</div>
          <div style={{ fontFamily: F.HAND, fontSize: 44, color: C.TEXT_WHITE }}>
            like <b>and subscribe</b>.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <div
            style={{
              background: '#C62F2F',
              borderRadius: 999,
              padding: '14px 44px',
              fontFamily: F.HAND,
              fontSize: 30,
              letterSpacing: 1,
              color: '#FFF',
              transform: `scale(${click})`,
            }}
          >
            SUBSCRIBE
          </div>
          <div style={{ background: '#26262B', borderRadius: 999, padding: '10px 26px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <svg width={30} height={30} viewBox="0 0 24 24">
              <path d="M4 10 h4 v10 h-4 Z M9 20 h7 q3 0 3.4-3 L21 12 q0.4-3-2.4-3 L13 9 V5 q0-2-2-2 q-1.6 0-2 2 l-0 4 H9 Z" fill="#C8C8CE" />
            </svg>
            <span style={{ fontFamily: F.HAND, fontSize: 26, color: '#C8C8CE' }}>0</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const S_Skool: React.FC = () => {
  const f = useCurrentFrame();
  const o = ease(f, 10, 40, 0, 1);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 45%, #191207 0%, #070604 80%)' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o }}>
        <div style={{ fontFamily: F.HAND, fontSize: 52, color: C.TEXT_WHITE, fontWeight: 700 }}>Want to make videos like this?</div>
        <div style={{ fontFamily: F.HAND, fontSize: 30, color: '#9A948A', marginTop: 8 }}>Join the Day One Films community on Skool.</div>
        <div
          style={{
            marginTop: 34,
            border: `4px solid ${C.GOLD}`,
            borderRadius: 999,
            padding: '10px 40px',
            fontFamily: F.HAND,
            fontSize: 42,
            color: C.TEXT_WHITE,
            background: '#15100A',
          }}
        >
          skool.com/dayonefilms
        </div>
        <div style={{ fontFamily: F.HAND, fontSize: 28, color: C.GOLD, marginTop: 36 }}>Thank you to everyone who already joined.</div>
      </div>
    </AbsoluteFill>
  );
};
