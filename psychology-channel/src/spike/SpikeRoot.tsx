/**
 * SPIKE — StickGuy walking inside the Stride engine, visual A/B.
 *
 * Two demo scenes, identical timeline and identical body travel:
 *   old — our current FK walk clip (legs step in place while the box glides
 *         → the soles skate along the ground)
 *   ik  — Stride's stance-locked gait ported to our channels (planted soles,
 *         heel-strike → toe-roll, IK knees)
 *
 * Ground ticks are static world marks: a planted foot stays glued to its
 * tick, a skating foot slides across them. Watch the soles, not the body.
 */

import React from 'react';
import { AbsoluteFill, Composition, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { StickGuy } from '../characters/StickGuy/StickGuy';
import { ANIMATIONS } from '../characters/StickGuy/animations';
import { RIG } from '../characters/StickGuy/rig';
import type { Pose } from '../characters/StickGuy/types';
import { VoidRoom } from '../characters/SetKit/SetKit';
import {
  legIK,
  footAt,
  walkDistance,
  cycleSeconds,
  WALK,
  STAND_ANKLE_Y,
  type LegChannels,
} from './gaitIK';

const FPS = 30;
const GROUND_PCT = 22;
const START_PCT = 60;
/** travel direction: -1 = toward the left (the character's facing) */
const DIR = -1;
/** walk starts at this frame */
const T0 = 18;
const CYCLES = 5;
const CYCLE_F = cycleSeconds(WALK) * FPS;
const WALK_END = T0 + CYCLES * CYCLE_F;
const BLEND = 18;
const TOTAL = Math.ceil(WALK_END + BLEND + 14);

const CREAM = '#F2EAD8';
const STANDING: LegChannels = { leg: 0, knee: 0, foot: 0 };

const lerpCh = (a: LegChannels, b: LegChannels, t: number): LegChannels => ({
  leg: a.leg + (b.leg - a.leg) * t,
  knee: a.knee + (b.knee - a.knee) * t,
  foot: a.foot + (b.foot - a.foot) * t,
});

/** 0 → 1 while the walk is active, with soft blend in/out at both ends. */
const walkActivity = (frame: number): number => {
  const inF = interpolate(frame, [T0 - 6, T0 + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outF = interpolate(frame, [WALK_END, WALK_END + BLEND], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.min(inF, outF);
};

/** body travel, shared by both demos (single source of truth) */
const boxLeftPx = (frame: number): number => {
  const t = Math.min(Math.max(frame - T0, 0), WALK_END - T0) / FPS;
  const d = walkDistance(t, (WALK_END - T0) / FPS, WALK);
  return (START_PCT / 100) * 1920 + DIR * d * 0.4;
};

/* ---------------- the OLD demo: current FK walk, box glide ---------------- */

const oldPose = (frame: number, fps: number): Pose => {
  const p = ANIMATIONS.walk.fn(frame, fps);
  const a = walkActivity(frame);
  const legs = lerpCh(STANDING, { leg: p.legL, knee: p.kneeL, foot: p.footL }, a);
  return {
    ...p,
    legL: legs.leg,
    kneeL: legs.knee,
    footL: legs.foot,
    legR: -legs.leg,
    kneeR: legs.knee,
    footR: legs.foot,
  };
};

/* ---------------- the NEW demo: IK gait driving our channels ---------------- */

const ikPose = (frame: number, fps: number): Pose => {
  const base = ANIMATIONS.walk.fn(frame, fps);
  const a = walkActivity(frame);
  const t = Math.min(Math.max(frame - T0, 0), WALK_END - T0) / FPS;
  const d = walkDistance(t, (WALK_END - T0) / FPS, WALK);
  const phase = (d / (2 * WALK.step)) % 1;
  const fL = footAt(phase, WALK);
  const fR = footAt((phase + 0.5) % 1, WALK);

  /* the root bob lifts the whole body — compensate the ankle targets so the
     soles stay exactly on the ground line while the hips bounce */
  const y = base.y * a;
  const ankleY = STAND_ANKLE_Y - y;

  /* left leg solved directly (rig space); right leg solved in mirrored
     space: its world hip is (375,398) → left-convention hip (315,398) */
  const tL = { x: RIG.hipL.x + DIR * fL.relX, y: ankleY - fL.lift };
  const tRw = { x: 375 + DIR * fR.relX, y: ankleY - fR.lift };
  const tR = { x: 690 - tRw.x, y: tRw.y };
  const gaitL = legIK(RIG.hipL, tL, fL.toe, -1);
  const gaitR = legIK({ x: 315, y: 398 }, tR, fR.toe, 1);

  const chL = lerpCh(STANDING, gaitL, a);
  const chR = lerpCh(STANDING, gaitR, a);

  /* Character-sheet facing rules: locomotion = SIDE view. The face slides to
     the leading edge (headTurn cheat), and the arms swing FORE-AFT along the
     travel axis, phase-locked to the gait (left arm forward when the right
     leg strikes) — not on the walk clip's unrelated 0.94s timer. */
  const armSwing = Math.cos(phase * Math.PI * 2);
  const armL = 84 + a * (78 - 13 * armSwing - 84);
  const armR = 84 + a * (78 + 13 * armSwing - 84);

  return {
    ...base,
    headTurn: -0.95,
    headTilt: base.headTilt * 0.5,
    eyeOpen: 0.85,
    mouthSmile: 0.1,
    x: 0,
    lean: 0,
    y,
    legL: chL.leg,
    kneeL: chL.knee,
    footL: chL.foot,
    legR: chR.leg,
    kneeR: chR.knee,
    footR: chR.foot,
    armL,
    armR,
    elbowL: 8,
    elbowR: 8,
    wristL: -4,
    wristR: -4,
  };
};

/* ------------------------------- the scene ------------------------------- */

const GroundTicks: React.FC = () => (
  <>
    {Array.from({ length: 17 }, (_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: i * 120,
          bottom: `calc(${GROUND_PCT}% - 16px)`,
          width: 2,
          height: 14,
          background: 'rgba(242,234,216,0.18)',
        }}
      />
    ))}
  </>
);

const Label: React.FC<{ text: string; color?: string }> = ({ text, color = CREAM }) => (
  <div
    style={{
      position: 'absolute',
      top: 10,
      left: 16,
      fontFamily: 'monospace',
      fontSize: 20,
      letterSpacing: 1,
      color,
      textShadow: '0 2px 0 rgba(0,0,0,0.6)',
      zIndex: 10,
    }}
  >
    {text}
  </div>
);

const DemoScene: React.FC<{ variant: 'old' | 'ik' }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pose = variant === 'ik' ? ikPose(frame, fps) : oldPose(frame, fps);
  return (
    <AbsoluteFill style={{ background: '#0d0d0d' }}>
      <VoidRoom groundFrac={0.22} wallFrac={0.62} />
      <GroundTicks />
      <div
        style={{
          position: 'absolute',
          width: 312,
          height: 360,
          bottom: `calc(${GROUND_PCT}% - 6px)`,
          left: boxLeftPx(frame),
        }}
      >
        <StickGuy pose={pose} />
      </div>
    </AbsoluteFill>
  );
};

const QUAD: React.CSSProperties = {
  position: 'absolute',
  top: 270,
  width: 960,
  height: 540,
  overflow: 'hidden',
};

/** full-size single demo (1920×1080) */
const Solo: React.FC<{ variant: 'old' | 'ik'; label: string }> = ({ variant, label }) => (
  <AbsoluteFill style={{ background: '#0d0d0d' }}>
    <DemoScene variant={variant} />
    <Label text={label} />
  </AbsoluteFill>
);

/** stacked A/B — both demos share the timeline and travel distance */
export const SpikeWalkAB: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <div style={{ ...QUAD, left: 0 }}>
      <div style={{ width: 1920, height: 1080, transform: 'scale(0.5)', transformOrigin: '0 0' }}>
        <DemoScene variant="old" />
      </div>
      <Label text="OLD — FK walk (soles skate)" />
    </div>
    <div style={{ ...QUAD, left: 960 }}>
      <div style={{ width: 1920, height: 1080, transform: 'scale(0.5)', transformOrigin: '0 0' }}>
        <DemoScene variant="ik" />
      </div>
      <Label text="NEW — Stride IK gait (soles plant)" color="#7ee787" />
    </div>
  </AbsoluteFill>
);

export const SpikeWalkOld: React.FC = () => (
  <Solo variant="old" label="OLD — current FK walk (soles skate)" />
);

export const SpikeWalkIK: React.FC = () => (
  <Solo variant="ik" label="NEW — Stride IK gait port (soles plant)" />
);

export const SpikeDuration = TOTAL;

export const SpikeRoot: React.FC = () => (
  <>
    <Composition
      id="SpikeWalkAB"
      component={SpikeWalkAB}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="SpikeWalkIK"
      component={SpikeWalkIK}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="SpikeWalkOld"
      component={SpikeWalkOld}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
