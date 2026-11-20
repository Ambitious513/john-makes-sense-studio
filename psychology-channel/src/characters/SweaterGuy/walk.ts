/**
 * Walk clip for SweaterGuy — the shared stance-locked gait, tuned to this body.
 *
 * `walkState` returns the pose AND the distance, because the caller must scroll
 * the world by exactly `distance * scale` or the soles skate. Keeping both out
 * of one function is what makes that coupling impossible to get wrong.
 */
import { blinkTrack } from '../StickGuy/animations';
import { gaitPose, walkDistance, withGait } from '../StickGuy/gait';
import { GAIT, SKELETON, T_POSE } from './rig';
import type { Pose } from '../StickGuy/types';

export interface WalkOptions {
  /** -1 = travels/faces LEFT (default), +1 = right */
  direction?: -1 | 1;
  /** travel speed in figure units/s. Default = GAIT.speed, i.e. stance-locked. */
  travel?: number;
  /** 0 = frozen, 1 = normal, 2 = exaggerated */
  amplitude?: number;
  /** blink phase only */
  seed?: number;
  /** clip-local seconds where the speed ramp ends (default: unbounded) */
  rampEnd?: number;
  /** gait override (cadence knobs) */
  gait?: typeof GAIT;
}

export interface WalkState {
  pose: Pose;
  /** figure units travelled so far — scroll the world by distance * scale */
  distance: number;
  /** cycle phase 0..1 (0 = left heel strike) */
  phase: number;
  /** units per second actually being travelled */
  speed: number;
}

export function walkState(frame: number, fps: number, o: WalkOptions = {}): WalkState {
  const t = (frame / Math.max(fps, 1)) * (o.amplitude === 0 ? 0 : 1);
  const dir = o.direction ?? -1;
  const a = o.amplitude ?? 1;
  const g = o.gait ?? GAIT;
  const speed = o.travel ?? g.speed;
  const cfg = { ...g, speed };
  const distance = walkDistance(t, o.rampEnd ?? t + 3, cfg);
  const gp = gaitPose(distance, cfg, {
    sk: SKELETON,
    direction: dir,
    bob: 8,
    amplitude: a,
    arc: true,
  });

  const ph = gp.phase * Math.PI * 2;
  const base: Pose = {
    ...T_POSE,
    y: T_POSE.y - gp.bob,
    // No squash during the walk. The root scales about the GROUND point but about
    // CENTRE_X horizontally, so an oscillating squash slides any foot that is not
    // under the centre (~0.4 u/frame measured) — it breaks the stance lock. Squash
    // belongs to jumps and landings, not to a cycle that must plant.
    squash: 1,
    // A CONSTANT lean. An oscillating one rotates the planted foot about the hip
    // — ±1.6° is 2.3 units of skate per frame at 30 fps, which the slip gate
    // measured. Lean is posture, not cadence: hold it, don't swing it.
    lean: -1.4 * dir,
    headTilt: 1.8 * dir * a * Math.cos(ph),
    headBob: 1.3 * a * Math.sin(ph * 2),
    armL: 88 + dir * 14 * a * Math.cos(ph),
    armR: 88 - dir * 14 * a * Math.cos(ph),
    elbowL: 7 + 6 * a * (0.5 + 0.5 * Math.sin(ph)),
    elbowR: 7 + 6 * a * (0.5 - 0.5 * Math.sin(ph)),
    wristL: -6,
    wristR: -6,
    eyeOpen: 0.9 * blinkTrack(t, o.seed ?? 0),
    mouthSmile: 0.5,
  };

  return { pose: withGait(base, gp, a), distance, phase: gp.phase, speed };
}

export const walkPose = (frame: number, fps: number, o?: WalkOptions): Pose =>
  walkState(frame, fps, o).pose;
