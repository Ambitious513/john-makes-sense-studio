/**
 * SPIKE — Stride's motion engine ported onto the StickGuy rig.
 *
 * Source: D:\downloads\2d character\src\rig\gait.ts (stance-locked gait +
 * two-bone IK). Adapted to our rig:
 *   hipL (315,398) · thigh base vector (-10,120) · shin base vector (-8,112)
 *   standing ankle y 630 · ground 672
 *
 * The key insight: we do NOT replace the renderer. The IK solve produces
 * POINTS (ankle target, knee position) and those are converted back into
 * StickGuy's existing rotation channels (legL/kneeL/footL), so <StickGuy/>
 * consumes the result unchanged. Acting clips stay hand-authored FK;
 * locomotion + support limbs become target-driven.
 *
 * Stance-lock: phase is a pure function of DISTANCE (not time) —
 * phase = (distance / (2·step)) % 1 — so a planted foot's world velocity is
 * exactly zero when the body box travels at the gait's speed. No ice-skating.
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
 * Two-bone IK solved in the LEFT leg's channel convention.
 * `toe` = desired world rotation of the foot frame (0 = sole flat on level
 * ground — verified against the locked ballRest calibration).
 * `bend` picks the knee side: -1 bows the knee toward -x (forward for our
 * left-facing character) when solving in left-convention space.
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

export const cycleSeconds = (g: GaitConfig) => (2 * g.step) / g.speed;

/**
 * Distance travelled, with a one-cycle speed ramp in and out over a total
 * walk of `tEnd` seconds (so the first and last steps grow/shrink naturally).
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
  const u = (p - g.duty) / (1 - g.duty);
  const relX = -reach / 2 + reach * smooth(u);
  const lift = 45 * Math.pow(Math.sin(Math.PI * u), 1.15);
  const toe = -19 + 32 * smooth(u);
  return { relX, lift, toe, contact: false };
}
