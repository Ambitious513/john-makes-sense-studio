import { RIG } from './rig';
import type { Pose } from './types';

/**
 * Stance-locked gait — the locomotion layer (ported from the `src/spike/`
 * Stride proof, then productized).
 *
 * Origin: D:\downloads\2d character\src\rig\gait.ts (stride-character-kit),
 * adapted to the StickGuy rig:
 *   Leg chain: rotate(leg, hipL) → translate(-10,120) → rotate(-knee)
 *              → translate(-8,112) → rotate(foot)
 *   hip (315,398) · standing ankle y 630 · sole ~42 below the ankle.
 *
 * The phase is a PURE FUNCTION OF DISTANCE — phase = (distance / (2·step)) % 1
 * — so a planted foot's world velocity is exactly zero when the body box
 * travels at the gait's speed. That is the whole trick: no skating, ever,
 * as long as the caller moves the box at `speed`.
 *
 * The IK solve produces POINTS; `gaitPose` converts them into the rotation
 * channels StickGuy's renderer already consumes (legL/kneeL/footL), so the
 * renderer never changes.
 */

const DEG = 180 / Math.PI;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** StickGuy left-leg chain: rotate(leg,hip) → translate(-10,120) → rotate(-knee) → translate(-8,112) → rotate(foot) */
export const THIGH_VEC = { x: -10, y: 120 };
export const SHIN_VEC = { x: -8, y: 112 };
export const L1 = Math.hypot(THIGH_VEC.x, THIGH_VEC.y);
export const L2 = Math.hypot(SHIN_VEC.x, SHIN_VEC.y);
const THIGH_BASE = Math.atan2(THIGH_VEC.y, THIGH_VEC.x) * DEG;
const SHIN_BASE = Math.atan2(SHIN_VEC.y, SHIN_VEC.x) * DEG;
/** ankle y with the sole flat on the ground line */
export const STAND_ANKLE_Y = 630;

export interface LegChannels {
  leg: number;
  knee: number;
  foot: number;
}

/**
 * Two-bone IK in the LEFT leg's channel convention.
 * `toe` = desired world rotation of the foot frame (0 = sole flat on level
 * ground — matches the locked ballRest calibration). `bend` picks the knee
 * side: -1 bows the knee toward -x (forward for the left-facing character).
 */
export function legIK(
  hip: { x: number; y: number },
  target: { x: number; y: number },
  toe: number,
  bend: 1 | -1,
): LegChannels {
  const dx = target.x - hip.x;
  const dy = target.y - hip.y;
  const raw = Math.hypot(dx, dy) || 0.0001;
  const d = clamp(raw, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.01);
  const ux = dx / raw;
  const uy = dy / raw;
  const along = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const perp = Math.sqrt(Math.max(0, L1 * L1 - along * along));
  const kx = hip.x + along * ux + bend * perp * uy;
  const ky = hip.y + along * uy - bend * perp * ux;
  const leg = Math.atan2(ky - hip.y, kx - hip.x) * DEG - THIGH_BASE;
  const knee = leg + SHIN_BASE - Math.atan2(target.y - ky, target.x - kx) * DEG;
  const foot = knee - leg + toe;
  return { leg, knee, foot };
}

export interface GaitConfig {
  /** footprint spacing of ONE leg per cycle (rig units) */
  step: number;
  /** travel speed (rig units / second) */
  speed: number;
  /** fraction of the cycle the foot spends on the ground */
  duty: number;
}

export const WALK: GaitConfig = { step: 135, speed: 185, duty: 0.62 };
export const RUN: GaitConfig = { step: 170, speed: 340, duty: 0.42 };

export const cycleSeconds = (g: GaitConfig) => (2 * g.step) / g.speed;

/**
 * Distance travelled over a walk of `t` seconds, with a one-cycle speed ramp
 * in and out (so the first and last steps grow/shrink naturally).
 * Closed form, deterministic.
 */
export function walkDistance(t: number, tEnd: number, g: GaitConfig): number {
  const c = cycleSeconds(g);
  if (t <= 0) return 0;
  if (t >= tEnd) t = tEnd;
  if (t < c) return (g.speed * t * t) / (2 * c);
  if (t > tEnd - c) {
    const r = tEnd - t;
    return g.speed * (tEnd - 1.5 * c) + (g.speed * (c * c - r * r)) / (2 * c);
  }
  return g.speed * (t - c / 2);
}

export interface FootGait {
  /** position along the travel axis relative to the hip (rig units) */
  relX: number;
  /** swing lift (rig units) */
  lift: number;
  /** world rotation of the foot frame: +13 heel strike → 0 flat → -19 toe-off */
  toe: number;
  contact: boolean;
}

/** Gait geometry for one leg at cycle phase p (0 = heel strike). */
export function footAt(p: number, g: GaitConfig): FootGait {
  const reach = 2 * g.step * g.duty;
  if (p < g.duty) {
    const u = p / g.duty;
    const relX = reach / 2 - reach * u;
    const toe =
      u < 0.16 ? 13 * (1 - smooth(u / 0.16)) : u > 0.76 ? -19 * smooth((u - 0.76) / 0.24) : 0;
    return { relX, lift: 0, toe, contact: true };
  }
  /* swing: start at the stance end position (relX = -reach/2) and return to
     the heel-strike position (relX = +reach/2), with a smooth ease that
     matches the stance's linear velocity at the boundary (C1 continuity) */
  const u = (p - g.duty) / (1 - g.duty);
  const relX = -reach / 2 + reach * smooth(u);
  const lift = 45 * Math.pow(Math.sin(Math.PI * u), 1.15);
  const toe = -19 + 32 * smooth(u);
  return { relX, lift, toe, contact: false };
}

/** Right world hip → left-convention hip (the right leg is mirrored via translate(690)scale(-1 1)). */
export const RIGHT_HIP_LEFT_SPACE = { x: 315, y: 398 };

export interface GaitPoseOptions {
  /** 0 = frozen, 1 = normal, 2 = exaggerated */
  amplitude?: number;
  /** traversal direction: -1 = travels/faces LEFT (the character's default facing), +1 = right */
  direction?: -1 | 1;
  /** rig units travelled per second (default = gait's own speed, i.e. stance-locked) */
  speed?: number;
  /** clamp the speed ramp at both ends */
  ramps?: boolean;
  /** root bob amplitude scale (rig units) */
  bob?: number;
}

const lerpCh = (a: LegChannels, b: LegChannels, t: number): LegChannels => ({
  leg: a.leg + (b.leg - a.leg) * t,
  knee: a.knee + (b.knee - a.knee) * t,
  foot: a.foot + (b.foot - a.foot) * t,
});

const STANDING: LegChannels = { leg: 0, knee: 0, foot: 0 };

export interface GaitPose {
  legL: number;
  kneeL: number;
  footL: number;
  legR: number;
  kneeR: number;
  footR: number;
  /** root bob (rig units; y channel = -bob) */
  bob: number;
  /** travel axis phase 0..1 (for arm swing / secondary motion) */
  phase: number;
}

/**
 * Sample the gait as channel values at `distance` rig units of travel.
 * The caller MUST move the hero box by `-direction * distance * scale`
 * for the planted foot to stay world-locked.
 */
export function gaitPose(distance: number, g: GaitConfig, o: GaitPoseOptions = {}): GaitPose {
  const dir = o.direction ?? -1;
  const phase = (((distance / (2 * g.step)) % 1) + 1) % 1;
  const fL = footAt(phase, g);
  const fR = footAt((phase + 0.5) % 1, g);

  const yBob = (o.bob ?? 5) * Math.abs(Math.sin(phase * Math.PI * 2));
  const ankleY = STAND_ANKLE_Y - yBob;

  const tL = { x: RIG.hipL.x + dir * fL.relX, y: ankleY - fL.lift };
  const tRw = { x: 375 + dir * fR.relX, y: ankleY - fR.lift };
  const tR = { x: 690 - tRw.x, y: tRw.y };

  const gaitL = legIK(RIG.hipL, tL, fL.toe * dir, -1);
  const gaitR = legIK(RIGHT_HIP_LEFT_SPACE, tR, fR.toe * dir, 1);

  const chL = lerpCh(STANDING, gaitL, o.amplitude ?? 1);
  const chR = lerpCh(STANDING, gaitR, o.amplitude ?? 1);

  return {
    legL: chL.leg,
    kneeL: chL.knee,
    footL: chL.foot,
    legR: chR.leg,
    kneeR: chR.knee,
    footR: chR.foot,
    bob: yBob * (o.amplitude ?? 1),
    phase,
  };
}

/** Blend a partial Pose with gait channels at amplitude `a` (0..1). */
export function withGait(base: Pose, gp: GaitPose, a: number): Pose {
  return {
    ...base,
    legL: base.legL + (gp.legL - base.legL) * a,
    kneeL: base.kneeL + (gp.kneeL - base.kneeL) * a,
    footL: base.footL + (gp.footL - base.footL) * a,
    legR: base.legR + (gp.legR - base.legR) * a,
    kneeR: base.kneeR + (gp.kneeR - base.kneeR) * a,
    footR: base.footR + (gp.footR - base.footR) * a,
  };
}