/**
 * StickGuy — a reusable, fully rigged 2D character for Remotion (and any React app).
 * Pure SVG. No images, no fonts, no runtime dependencies besides React.
 * Every joint is a number, so every property is animatable with `interpolate()` / `spring()`.
 */

import type { CSSProperties, ReactNode } from 'react';

/** All angles are degrees. All offsets are in character units (the rig is 690 x 700). */
export interface Pose {
  /* ---- root ---- */
  /** horizontal offset of the whole character */
  x: number;
  /** vertical offset (negative = up, e.g. a jump) */
  y: number;
  /** uniform scale, 1 = original size */
  scale: number;
  /** whole-body rotation around the hips */
  lean: number;
  /** squash & stretch around the feet. 1 = neutral, 0.85 = squashed, 1.15 = stretched */
  squash: number;

  /* ---- head ---- */
  /** head rotation around the neck */
  headTilt: number;
  /** fake 3/4 turn: slides the face across the skull, -1 .. 1 */
  headTurn: number;
  /** vertical head offset (nods) */
  headBob: number;

  /* ---- face ---- */
  /** 0 = closed, 0.5 = the reference sleepy lid, 1 = wide open */
  eyeOpen: number;
  /** pupil offset, -1 .. 1 */
  lookX: number;
  lookY: number;
  /** eyebrow lift in units, -6 .. 10 */
  browRaise: number;
  /** eyebrow rotation (anger / surprise), -20 .. 20 */
  browTilt: number;
  /** 0 = closed line, 1 = wide open */
  mouthOpen: number;
  /** -1 = frown, 0 = flat, 1 = big grin */
  mouthSmile: number;
  /** mouth width multiplier, 0.4 .. 1.4 */
  mouthWidth: number;
  /** pupil scale, 1 = normal; ~0.4 gives the "hollow stare" */
  pupil: number;
  /** 0 = none, 1 = full clenched-teeth band inside the open mouth */
  teeth: number;
  /** 0 = none, 1 = full sweat drop at the temple */
  sweat: number;
  /** brow shape bend: 0 = neutral arc, 1 = angry V (inner end down, outer up) */
  browBend: number;

  /* ---- arms: 0 = T-pose, 90 = hanging down, -90 = straight up ---- */
  armL: number;
  armR: number;
  /** elbow bend, 0 = straight, positive folds the forearm downward */
  elbowL: number;
  elbowR: number;
  /** hand rotation around the wrist */
  wristL: number;
  wristR: number;

  /* ---- legs: 0 = straight down, positive = outward ---- */
  legL: number;
  legR: number;
  /** knee bend, 0 = straight, positive folds the shin backward */
  kneeL: number;
  kneeR: number;
  /** foot rotation around the ankle, positive = toe outward */
  footL: number;
  footR: number;
}

export interface Palette {
  /** outline / ink */
  ink: string;
  /** skin (head + forearms) */
  skin: string;
  /** soft shading on skin */
  skinShade: string;
  /** t-shirt */
  shirt: string;
  /** pants */
  pants: string;
  /** gloves */
  glove: string;
  /** shoe upper */
  shoe: string;
  /** shoe sole */
  sole: string;
  /** eyelid */
  lid: string;
  /** inside of the mouth */
  mouth: string;
  /** tongue */
  tongue: string;
  /** ground shadow */
  shadow: string;
}

export interface StickGuyProps {
  pose?: Partial<Pose>;
  palette?: Partial<Palette>;
  /** outline thickness in character units (default 5) */
  strokeWidth?: number;
  /** contact shadow under the feet */
  shadow?: boolean;
  shadowOpacity?: number;
  /** draws the rig joints + bounding box (handy while animating) */
  debug?: boolean;
  /** svg viewBox — the default leaves head-room for jumps and raised arms */
  viewBox?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  /** anything rendered inside the left hand group (follows the hand) */
  handSlotL?: ReactNode;
  /** anything rendered inside the right hand group (follows the hand) */
  handSlotR?: ReactNode;
  /** costume/headwear drawn over the skull (follows head tilt) — see RedHeadband / RedBeanie in SetKit */
  headSlot?: ReactNode;
  /** rendered behind the character, in character space */
  background?: ReactNode;
}
