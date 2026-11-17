import type { EntityPose } from './types';
import { E_DEFAULT } from './types';

/**
 * The Entity's four staging states, measured from the reference films
 * (docs/reference-style-study.md §2). SIZE is the emotion:
 *
 *   TEMPTING  hero-sized, relaxed lean, thin red smile, red text floats beside it
 *   DOMINATING 2.6x hero height, arms spread — "you can't."
 *   MIRROR    hero-sized, dead calm — the reflection that isn't the hero
 *   SHRUNKEN  palm-sized, cowering — the payoff of discipline
 */

export type EntityStateId = 'tempting' | 'dominating' | 'mirror' | 'shrunken';

export interface EntityState {
  id: EntityStateId;
  label: string;
  hint: string;
  pose: EntityPose;
}

export const ENTITY_STATES: Record<EntityStateId, EntityState> = {
  tempting: {
    id: 'tempting',
    label: 'Tempting',
    hint: 'Hero-sized, leaning in, red smile — the whisper beside the chair',
    pose: {
      ...E_DEFAULT,
      scale: 1,
      lean: 7,
      headTilt: 6,
      armSpread: 0.12,
      eyeOpen: 0.42,
      smile: 1,
      glow: 0.85,
    },
  },
  dominating: {
    id: 'dominating',
    label: 'Dominating',
    hint: '2.6x hero height, arms spread — blocking the way ("you can\'t.")',
    pose: {
      ...E_DEFAULT,
      scale: 2.6,
      lean: 0,
      headTilt: -3,
      armSpread: 1.05,
      eyeOpen: 0.38,
      smile: 0,
      glow: 1.25,
    },
  },
  mirror: {
    id: 'mirror',
    label: 'Mirror',
    hint: 'Hero-sized, dead calm, no smile — what the mirror shows instead',
    pose: {
      ...E_DEFAULT,
      scale: 1,
      lean: 2,
      headTilt: 0,
      armSpread: 0.08,
      eyeOpen: 0.3,
      smile: 0,
      glow: 0.95,
    },
  },
  shrunken: {
    id: 'shrunken',
    label: 'Shrunken',
    hint: 'Palm-sized, cowering — discipline wins, the Entity shrinks',
    pose: {
      ...E_DEFAULT,
      scale: 0.16,
      lean: 0,
      headTilt: 8,
      armSpread: 0.3,
      cower: 1,
      eyeOpen: 0.6,
      smile: 0,
      glow: 1.0,
    },
  },
};

export const ENTITY_STATE_LIST = Object.values(ENTITY_STATES);

/* ------------------------- clips (pure, seekable) ------------------------- */

const TAU = Math.PI * 2;
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

/** Slow breathing menace — the default idle. Loops every 3.6s. */
export const loom = (frame: number, fps: number, base: EntityPose = E_DEFAULT): EntityPose => {
  const t = (frame / fps) % 3.6;
  const br = Math.sin((t * TAU) / 3.6);
  const pulse = Math.sin((t * TAU) / 7.2 + 1.1);
  return {
    ...base,
    y: base.y - 2.5 * br,
    lean: base.lean + 1.8 * br,
    headTilt: base.headTilt + 1.2 * br,
    glow: base.glow + 0.08 * pulse,
    eyeOpen: base.eyeOpen + 0.05 * br,
  };
};

/** Leaning in and out — the whisper. Loops every 4.8s. */
export const tempt = (frame: number, fps: number, base = ENTITY_STATES.tempting.pose): EntityPose => {
  const t = (frame / fps) % 4.8;
  const u = (t % 4.8) / 4.8;
  const leanWave = Math.sin((t * TAU) / 4.8);
  const smileWave = 0.85 + 0.15 * Math.sin((t * TAU) / 2.4);
  return {
    ...loom(frame, fps, base),
    lean: 7 + 4.5 * leanWave,
    headTilt: 6 + 3 * leanWave,
    smile: Math.min(1, smileWave + 0.1 * Math.sin(u * TAU)),
    armSpread: 0.12 + 0.06 * easeInOut(0.5 + 0.5 * leanWave),
  };
};

/** Cowering tremble for the shrunken state. Loops every 0.9s. */
export const cower = (frame: number, fps: number, base = ENTITY_STATES.shrunken.pose): EntityPose => {
  const t = frame / fps;
  const tremble = Math.sin((t * TAU) / 0.9);
  const flinch = Math.sin((t * TAU) / 2.7);
  return {
    ...base,
    x: base.x + 1.2 * tremble,
    headTilt: base.headTilt + 3 * tremble + 2.5 * flinch,
    eyeOpen: base.eyeOpen + 0.12 * flinch,
    cower: Math.min(1, base.cower + 0.05 * flinch),
  };
};

/** Slowly spreading the arms — the block. One-shot over 2.2s, then holds. */
export const spread = (frame: number, fps: number, base = ENTITY_STATES.dominating.pose): EntityPose => {
  const u = Math.min(1, frame / fps / 2.2);
  const e = easeInOut(u);
  const p = loom(frame, fps, base);
  return {
    ...p,
    armSpread: base.armSpread * (0.55 + 0.45 * e),
    glow: base.glow * (0.8 + 0.2 * e),
  };
};

/** THE GROW — one-shot scale ramp (default 0.35 peek → 1.35 loom over 4.5s).
 *  The temptation builds in SIZE: starts small peeking over the couch
 *  armrest, ends hero-dwarfing, leaning toward the whisper. Holds at full
 *  size. Eager head-tilt while small, straightening as it towers. */
export const grow = (
  frame: number,
  fps: number,
  base: EntityPose = ENTITY_STATES.tempting.pose,
  ramp?: { fromScale?: number; toScale?: number; seconds?: number },
): EntityPose => {
  const fromScale = ramp?.fromScale ?? 0.35;
  const toScale = ramp?.toScale ?? 1.35;
  const seconds = ramp?.seconds ?? 4.5;
  const u = easeInOut(Math.min(1, frame / fps / seconds));
  const p = loom(frame, fps, base);
  return {
    ...p,
    scale: fromScale + (toScale - fromScale) * u,
    glow: p.glow * (0.72 + 0.28 * u),
    eyeOpen: base.eyeOpen + (1 - u) * 0.18,
    lean: base.lean + (1 - u) * 4,
    headTilt: base.headTilt + (1 - u) * 7,
  };
};
