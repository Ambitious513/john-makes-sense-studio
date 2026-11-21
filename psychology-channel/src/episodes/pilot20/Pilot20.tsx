/**
 * PILOT 20 s — timing-locked previz for the Flow (Omni) test.
 *
 * This is NOT the deliverable. It is the clock: three framings, the generated
 * voiceover, and the keyword cards, cut to the numbers in `script.ts`. The three
 * generated clips replace the code plates one-for-one (`SHOTS[].plate`), so when
 * the takes arrive nothing in the timeline moves.
 *
 * Why previz first: a generated take cannot be re-rendered from a number. Fixing
 * the cut before spending the credits means a bad take costs one credit, not a
 * re-edit.
 */
import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion';
import type { Pose } from '../../characters/StickGuy/types';
import { GROUND_FRACTION, SweaterGuy, VIEWBOX_GROUND } from '../../characters/SweaterGuy/SweaterGuy';
import { GROUND_Y, Street } from '../../characters/SetKit/Street';
import { AMBIENCE, MUSIC, Bed } from '../../engine/music';
import { VoiceLine } from '../../engine/voice';
import { BUG, CARDS, LINES, SHOTS, type Card } from './script';

export { DURATION } from './script';

const PAPER = '#FCF5EB';
const INK = '#17161C';

/** screen px per rig unit — same figure size as the StreetWalk deliverable */
const FIG = 0.7;
const BOX_W = 580 * FIG;
const BOX_H = 1106 * FIG;
const HERO_TOP = GROUND_Y - GROUND_FRACTION * BOX_H;
const HERO_LEFT = 0.34 * 1920 - BOX_W / 2;
/** head centre (rig 200,59) in screen space, before any camera move */
const HEAD_X = HERO_LEFT + (200 + 90) * FIG;
const HEAD_Y = HERO_TOP + (59 + 90) * FIG;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** triangle eyelid: closed at the middle of a 4-frame window */
const blink = (f: number, times: number[], len = 4) => {
  let closed = 0;
  for (const t of times) {
    const d = f - t;
    if (d >= 0 && d < len) closed = Math.max(closed, 1 - Math.abs((2 * d) / len - 1));
  }
  return 1 - 0.94 * closed;
};

/** CSS camera: scales about (ox,oy), then shifts the anchor by (tx,ty) screen px */
const Cam: React.FC<{
  scale: number;
  tx?: number;
  ty?: number;
  ox: number;
  oy: number;
  children: React.ReactNode;
}> = ({ scale, tx = 0, ty = 0, ox, oy, children }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      transformOrigin: `${ox}px ${oy}px`,
      transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
      willChange: 'transform',
    }}
  >
    {children}
  </div>
);

const Figure: React.FC<{ pose: Partial<Pose>; size?: number; ground?: number; cx?: number }> = ({
  pose,
  size = 1,
  ground = GROUND_Y,
  cx,
}) => {
  const w = BOX_W * size;
  const h = BOX_H * size;
  const center = cx ?? HERO_LEFT + BOX_W / 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: center - w / 2,
        top: ground - GROUND_FRACTION * h,
        width: w,
        height: h,
      }}
    >
      <SweaterGuy pose={pose} viewBox={VIEWBOX_GROUND} width={w} height={h} title="hero previz" />
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * S1 — WIDE. He stands; the street moves.
 * ------------------------------------------------------------------ */
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 132], [1.0, 1.045], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const pose: Partial<Pose> = {
    headTurn: -0.22,
    lookX: -0.38,
    lookY: 0.08,
    browRaise: -1.5,
    eyeOpen: blink(f, [46, 104]) * 0.92,
    mouthSmile: 0.34,
    headBob: Math.sin(f / 34) * 1.2,
    lean: 0.4,
    armL: 92,
    elbowL: 6,
    armR: 88,
    elbowR: 8,
    legL: 1.5,
    legR: 1.5,
  };
  return (
    <>
      <Cam scale={scale} ox={780} oy={430}>
        <div style={{ position: 'absolute', inset: 0, filter: 'blur(2px)' }}>
          <Street scroll={-f * 0.55} />
        </div>
        {/* depth haze: the street is behind him and must stay behind him */}
        <AbsoluteFill style={{ background: 'rgba(252,245,235,0.26)' }} />
        {/* he stands on the near pavement, so the benches and lamp posts are behind him */}
        <Figure pose={pose} size={0.68} ground={974} cx={0.6 * 1920} />
      </Cam>
    </>
  );
};

/* ------------------------------------------------------------------ *
 * S2 — MEDIUM. He turns to camera and shrugs one hand palm-up.
 * Local frames: 0..234 (four absolute 132..366).
 * ------------------------------------------------------------------ */
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 234], [1.45, 1.56], { ...clamp, easing: Easing.inOut(Easing.quad) });

  const turn = interpolate(f, [6, 42], [-0.42, 0.38], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lookX = interpolate(f, [0, 36], [-0.9, 0.4], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const shrug = interpolate(f, [48, 78, 150, 190], [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  const pose: Partial<Pose> = {
    headTurn: turn,
    lookX,
    lookY: 0.05,
    browRaise: -1 + 3.2 * shrug,
    eyeOpen: blink(f, [34, 132, 206]),
    mouthSmile: 0.36 + 0.12 * shrug,
    headBob: Math.sin(f / 40) * 0.8,
    lean: 0.9,
    armL: 92,
    elbowL: 6,
    armR: 90 - 56 * shrug,
    elbowR: 3 + 46 * shrug,
    wristR: -3 - 22 * shrug,
    legL: 1.5,
    legR: 1.5,
  };

  return (
    <Cam scale={scale} tx={1120 - HEAD_X} ty={380 - HEAD_Y} ox={HEAD_X} oy={HEAD_Y}>
      <Street scroll={-132 * 0.55 - f * 0.3} />
      <Figure pose={pose} />
    </Cam>
  );
};

/* ------------------------------------------------------------------ *
 * S3 — CLOSE. Paper backdrop, head and shoulders, the line lands.
 * Local frames: 0..234 (absolute 366..600).
 * ------------------------------------------------------------------ */
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const smile = interpolate(f, [140, 178], [0.42, 0.66], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const nod = interpolate(f, [150, 162, 176], [0, -3.2, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const breath = Math.sin(f / 52) * 0.8;

  const pose: Partial<Pose> = {
    headTurn: 0.14,
    lookX: 0.04,
    lookY: 0,
    browRaise: 1.4,
    eyeOpen: blink(f, [22, 78, 196], 5) * 0.9,
    mouthSmile: smile,
    headBob: nod + breath,
    lean: 0.2,
    armL: 92,
    elbowL: 4,
    armR: 92,
    elbowR: 4,
    legL: 1,
    legR: 1,
  };

  return (
    <>
      {/* the wall the close-up will be generated against: nothing readable, no hard edges */}
      <AbsoluteFill style={{ background: PAPER }} />
      <div
        style={{
          position: 'absolute',
          right: -300,
          top: -260,
          width: 1280,
          height: 1280,
          borderRadius: '50%',
          background: '#DCE2E5',
          opacity: 0.6,
          filter: 'blur(70px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -260,
          bottom: -420,
          width: 1500,
          height: 760,
          borderRadius: '50%',
          background: '#EFE5D6',
          filter: 'blur(50px)',
        }}
      />
      <Cam scale={5.0} tx={960 - HEAD_X} ty={450 - HEAD_Y} ox={HEAD_X} oy={HEAD_Y}>
        <Figure pose={pose} />
      </Cam>
    </>
  );
};

/* ------------------------------------------------------------------ *
 * Graphics: keyword card + corner bug. One card per beat, never a
 * full transcript — the narration already says the words.
 * ------------------------------------------------------------------ */
export const KeywordCard: React.FC<Card & { x?: number }> = ({ from, to, text, x }) => {
  const f = useCurrentFrame();
  const inU = interpolate(f, [from, from + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const outU = interpolate(f, [to - 8, to], [1, 0], clamp);
  const o = Math.min(inU, outU);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x ?? 132, top: 900, opacity: o, transform: `translateY(${(1 - inU) * 14}px)` }}>
      <div
        style={{
          fontFamily: '"Patrick Hand", monospace',
          fontSize: 66,
          lineHeight: 1,
          letterSpacing: '0.4px',
          color: INK,
        }}
      >
        {text}
      </div>
      <div style={{ marginTop: 12, height: 7, width: 360 * inU, borderRadius: 4, background: INK, opacity: 0.82 }} />
    </div>
  );
};

export const Bug: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      right: 132,
      top: 92,
      fontFamily: '"Patrick Hand", monospace',
      fontSize: 24,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: INK,
      opacity: 0.5,
    }}
  >
    {BUG}
  </div>
);

export const Pilot20: React.FC = () => {
  const [s1, s2, s3] = SHOTS;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Sequence from={s1.from} durationInFrames={s1.to - s1.from} name={s1.label}>
        <S1 />
      </Sequence>
      <Sequence from={s2.from} durationInFrames={s2.to - s2.from} name={s2.label}>
        <S2 />
      </Sequence>
      <Sequence from={s3.from} durationInFrames={s3.to - s3.from} name={s3.label}>
        <S3 />
      </Sequence>

      <Bug />
      {CARDS.map((c) => (
        <KeywordCard key={c.text} {...c} />
      ))}

      {/* narration: absolute frames, so a cut can never slide the words */}
      {LINES.map((l) => (
        <VoiceLine key={l.id} mp3={l.mp3} startFrame={l.from} />
      ))}

      <Bed bed={MUSIC['calm-reflective']} volume={0.16} />
      <Bed bed={AMBIENCE['city-night']} volume={0.22} />
    </AbsoluteFill>
  );
};
