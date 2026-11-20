import type { Palette, Pose } from './types';

/**
 * The rig lives in a 690 x 700 box. (0,0) is top-left, +y is down.
 * These are the exact pivots used by <StickGuy/> — use them to attach props,
 * to place speech bubbles above the head, or to parent extra layers.
 */
export const RIG = {
  width: 690,
  height: 700,
  centerX: 345,
  groundY: 672,
  head: { x: 345, y: 92, r: 82 },
  neck: { x: 345, y: 176 },
  shoulderL: { x: 280, y: 214 },
  shoulderR: { x: 410, y: 214 },
  elbowL: { x: 198, y: 214 },
  elbowR: { x: 492, y: 214 },
  wristL: { x: 114, y: 214 },
  wristR: { x: 576, y: 214 },
  hipL: { x: 315, y: 398 },
  hipR: { x: 375, y: 398 },
  kneeL: { x: 305, y: 518 },
  kneeR: { x: 385, y: 518 },
  ankleL: { x: 297, y: 630 },
  ankleR: { x: 393, y: 630 },
} as const;

/** Roomy default frame: head-room for jumps, side-room for the T-pose. */
export const DEFAULT_VIEWBOX = '-45 -170 780 900';
/** Tight frame around the artwork itself. */
export const TIGHT_VIEWBOX = '0 0 690 700';

export const DEFAULT_PALETTE: Palette = {
  ink: '#0B1016',
  skin: '#FFFFFF',
  skinShade: '#C6CAD2',
  shirt: '#2C2C2C',
  pants: '#2C2C2C',
  glove: '#0B1016',
  shoe: '#2C2C2C',
  sole: '#767C88',
  lid: '#BDC2CA',
  mouth: '#141A20',
  tongue: '#E0607A',
  shadow: '#0B1016',
};

/** The rig rest state — the reference sheet's alert neutral face.
 *  (Was eyeOpen 0.5 / "sleepy lid"; the look audit showed the resting face
 *  read exhausted. 0.9 + bigger pupils + slightly lowered brows = alert,
 *  matching the sheet. Emotional lows are still authored per-clip.) */
export const T_POSE: Pose = {
  x: 0,
  y: 0,
  scale: 1,
  lean: 0,
  squash: 1,

  headTilt: 0,
  headTurn: 0,
  headBob: 0,

  eyeOpen: 0.9,
  lookX: 0,
  lookY: 0,
  browRaise: -3,
  browTilt: 0,
  mouthOpen: 0,
  mouthSmile: 0.55,
  mouthWidth: 0.92,
  pupil: 1.35,
  teeth: 0,
  sweat: 0,
  browBend: 0,

  armL: 0,
  armR: 0,
  elbowL: 0,
  elbowR: 0,
  wristL: 0,
  wristR: 0,

  legL: 0,
  legR: 0,
  kneeL: 0,
  kneeR: 0,
  footL: 0,
  footR: 0,
};

/** A relaxed standing pose — arms down, weight on both feet. */
export const IDLE_POSE: Pose = {
  ...T_POSE,
  armL: 74,
  armR: 74,
  elbowL: 9,
  elbowR: 9,
  wristL: -6,
  wristR: -6,
  legL: 2.5,
  legR: 2.5,
  footL: 3,
  footR: 3,
};

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Blend two poses. Great for cross-fading animation clips. */
export function mixPose(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Pose;
  (Object.keys(T_POSE) as (keyof Pose)[]).forEach((k) => {
    out[k] = lerp(a[k], b[k], t);
  });
  return out;
}

/** Fill in any missing joint so partial poses are always safe to render. */
export function resolvePose(p?: Partial<Pose>): Pose {
  return { ...T_POSE, ...(p ?? {}) };
}

/** Deterministic hash-based noise — identical in the studio and in a Remotion render. */
export function hash01(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Mouth shapes for lip-sync. Feed these to `pose` from an audio transcript. */
export const VISEMES = {
  rest: { mouthOpen: 0.0, mouthSmile: 0.55, mouthWidth: 0.92 },
  M: { mouthOpen: 0.0, mouthSmile: 0.35, mouthWidth: 0.8 },
  A: { mouthOpen: 0.85, mouthSmile: 0.35, mouthWidth: 1.05 },
  E: { mouthOpen: 0.35, mouthSmile: 0.75, mouthWidth: 1.2 },
  I: { mouthOpen: 0.18, mouthSmile: 0.9, mouthWidth: 1.25 },
  O: { mouthOpen: 0.7, mouthSmile: -0.1, mouthWidth: 0.62 },
  U: { mouthOpen: 0.42, mouthSmile: -0.15, mouthWidth: 0.5 },
  F: { mouthOpen: 0.16, mouthSmile: 0.4, mouthWidth: 1.0 },
  L: { mouthOpen: 0.45, mouthSmile: 0.5, mouthWidth: 0.95 },
  W: { mouthOpen: 0.3, mouthSmile: -0.2, mouthWidth: 0.45 },
} as const;

export type Viseme = keyof typeof VISEMES;
