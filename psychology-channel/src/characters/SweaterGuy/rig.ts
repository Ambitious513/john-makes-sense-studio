/**
 * SweaterGuy — the character from the supplied sheet, built in code.
 *
 * Every number here is MEASURED from `sheet-a.jpg` figure 1 (arms down, hands at
 * the pockets) by tools/sheet_profile.py + tools/sheet_feet.py, and normalised
 * to ONE anatomical definition: top of the head = 0, sole line = 1000.
 *
 * That normalisation matters. The sheet draws a beige ground-shadow under every
 * figure, and its dark speckles extend 7.6% below the soles — profiling against
 * the raw bounding box silently includes them and makes the whole body too
 * short and too wide. tools/sheet_feet.py separates shoe from shadow and puts
 * the sole at y1373 of the figure's 1225-px body.
 *
 * Measured landmarks (units of the 1000-tall body):
 *   head 0..118 (max width 126 with the hair spikes) · neck 118..172
 *   shoulder line 172 · sweater hem 446 · hip pivot 430
 *   knee 695 · ankle 925 · sole 1000
 *   hips 45 either side of centre, legs parallel
 *   sweater max half-width 119 (chest), 115 (hem) · feet 74 long, splayed out
 *
 * It consumes the SAME `Pose` channel contract and the SAME stance-locked gait
 * engine as StickGuy: one engine, many characters.
 */
import type { Pose } from '../StickGuy/types';
import type { GaitConfig, Skeleton } from '../StickGuy/gait';

/** Palette tokens sampled at landmark coordinates (median of real pixels). */
export const PALETTE = {
  ink: '#17161C',
  skin: '#FBF6EC',
  skinShade: '#EFE6D6',
  hair: '#393F47',
  hairShade: '#2E333A',
  sweater: '#546172',
  sweaterShade: '#4B586A',
  sweaterRib: '#5E6B7C',
  pants: '#383F45',
  pantsShade: '#2F353A',
  shoe: '#1A1512',
  shoeShade: '#0F0C0A',
  shadow: '#E4D8CB',
  paper: '#FCF5EB',
};
export type SweaterPalette = typeof PALETTE;

/* ---------------- geometry (measured, head 0 → sole 1000) ---------------- */

export const GROUND = 1000;
export const CENTER_X = 200;

export const HEAD = { x: 200, y: 59, r: 59 };
export const NECK = { x: 200, y: 118 };
export const SHOULDER_Y = 172;
export const SHOULDER_L = { x: 134, y: SHOULDER_Y };
export const SHOULDER_R = { x: 266, y: SHOULDER_Y };
export const UPPER_ARM = 120;
export const FOREARM = 100;

export const HIP_Y = 430;
export const KNEE_Y = 695;
export const ANKLE_Y = 942;
/** sole sits this far below the ankle frame (measured: trousers end u942,
 *  the shoe band is only 58u tall — the sheet's shoes are flat) */
export const SOLE_DROP = GROUND - ANKLE_Y;

export const SKELETON: Skeleton = {
  centerX: CENTER_X,
  hipL: { x: 152, y: HIP_Y },
  hipR: { x: 248, y: HIP_Y },
  ankleY: ANKLE_Y,
  thigh: { x: 0, y: KNEE_Y - HIP_Y },
  shin: { x: 0, y: ANKLE_Y - KNEE_Y },
};

/**
 * Cadence scaled from StickGuy's verified WALK (step 135 / speed 185 on a
 * 662-unit figure = 0.204 step/height, 0.280 height/s) onto a 1000-unit body:
 * step 205, speed 278 — the same 1.47 s cycle.
 */
export const GAIT: GaitConfig = { step: 205, speed: 278, duty: 0.62 };

/* ------------------------------- poses ---------------------------------- */

/** Rest state. Alert neutral face (the locked rule: eyeOpen 0.9). Arms at 90°
 *  hang the hand at the sweater hem, where this body's arm lengths put it. */
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
  browRaise: 0,
  browTilt: 0,
  mouthOpen: 0,
  mouthSmile: 0.5,
  mouthWidth: 0.9,
  pupil: 1,
  teeth: 0,
  sweat: 0,
  browBend: 0,

  armL: 90,
  armR: 90,
  elbowL: 3,
  elbowR: 3,
  wristL: -3,
  wristR: -3,

  legL: 0,
  legR: 0,
  kneeL: 0,
  kneeR: 0,
  footL: 0,
  footR: 0,
};

/** Standing, weight even — the pose the silhouette gate compares to the sheet. */
export const STAND: Pose = { ...T_POSE };

export const resolve = (p?: Partial<Pose>): Pose => ({ ...T_POSE, ...(p ?? {}) });

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
