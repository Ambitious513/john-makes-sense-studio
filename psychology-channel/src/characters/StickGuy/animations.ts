import type { Pose } from './types';
import { IDLE_POSE, T_POSE, VISEMES, clamp, hash01, lerp } from './rig';
import { gaitPose, withGait, walkDistance, WALK, RUN, type GaitConfig } from './gait';
import type { Viseme } from './rig';

/**
 * Frame-driven animation clips.
 *
 * They are PURE functions of (frame, fps) — no hooks, no state, no randomness —
 * so a Remotion render is deterministic and every frame is seekable:
 *
 *   const frame = useCurrentFrame();
 *   const { fps } = useVideoConfig();
 *   <StickGuy pose={ANIMATIONS.wave.fn(frame, fps)} />
 */

export interface AnimOptions {
  /** 0 = frozen, 1 = normal, 2 = exaggerated */
  amplitude?: number;
  /** playback rate multiplier */
  speed?: number;
  /** changes blink timing / talk pattern, never the shape of the motion */
  seed?: number;
  /** pose the clip is layered on top of */
  base?: Pose;
  /** disable automatic blinking */
  blink?: boolean;
}

/** travel options for the stance-locked `walk`/`run` clips. */
export interface TravelOptions {
  /** traversal direction: -1 = travels/faces LEFT (default), +1 = right */
  direction?: -1 | 1;
  /** override the travel speed (rig units / second). Default = the gait's own
   *  speed, i.e. the planted soles are world-locked. */
  travel?: number;
  /** use a different gait config (step / speed / duty) */
  gait?: GaitConfig;
  /** end of the speed ramp, in clip-local seconds (default = unbounded) */
  rampEnd?: number;
}

const TAU = Math.PI * 2;
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);

/** 1 = eyes open, 0 = eyes shut. Deterministic blink track. */
export function blinkTrack(t: number, seed = 0): number {
  const period = 2.6 + hash01(seed + 1) * 1.8;
  const dur = 0.15;
  for (let i = Math.floor(t / period) - 1; i <= Math.floor(t / period); i++) {
    const start = i * period + hash01(i * 3.7 + seed * 11.3) * (period - dur - 0.2) + 0.1;
    const d = t - start;
    if (d >= 0 && d <= dur) {
      const u = d / dur;
      return u < 0.42 ? 1 - u / 0.42 : (u - 0.42) / 0.58;
    }
  }
  return 1;
}

interface Ctx {
  t: number;
  a: number;
  seed: number;
  base: Pose;
  blink: boolean;
}

function ctx(frame: number, fps: number, o: AnimOptions = {}): Ctx {
  return {
    t: (frame / Math.max(fps, 1)) * (o.speed ?? 1),
    a: o.amplitude ?? 1,
    seed: o.seed ?? 0,
    base: o.base ?? IDLE_POSE,
    blink: o.blink ?? true,
  };
}

const withBlink = (p: Pose, k: Ctx, open = 0.5): Pose => ({
  ...p,
  eyeOpen: k.blink ? open * blinkTrack(k.t, k.seed) : open,
});

/* ------------------------------- clips ------------------------------- */

const tpose = (): Pose => ({ ...T_POSE });

const idle = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const br = Math.sin((t * TAU) / 3.6);
  const drift = Math.sin((t * TAU) / 7.3);
  return withBlink(
    {
      ...k.base,
      x: k.base.x + 1.2 * a * drift,
      y: k.base.y - 1.6 * a * br,
      squash: 1 + 0.014 * a * br,
      lean: 0.7 * a * Math.sin((t * TAU) / 9.1),
      headTilt: 1.8 * a * Math.sin((t * TAU) / 6.1),
      headBob: 0.9 * a * Math.sin((t * TAU) / 3.6 + 0.7),
      headTurn: 0.16 * a * Math.sin((t * TAU) / 11.3),
      lookX: 0.3 * Math.sin((t * TAU) / 8.7),
      lookY: 0.12 * Math.sin((t * TAU) / 5.3),
      browRaise: 0.5 + 0.5 * Math.sin((t * TAU) / 12.7),
      armL: 74 + 2.6 * a * Math.sin((t * TAU) / 3.6 + 0.35),
      armR: 74 + 2.6 * a * Math.sin((t * TAU) / 3.6 + 0.05),
      elbowL: 9 + 2.2 * a * Math.sin((t * TAU) / 4.2),
      elbowR: 9 + 2.2 * a * Math.sin((t * TAU) / 4.2 + 0.9),
      wristL: -6 + 3 * a * Math.sin((t * TAU) / 3.9),
      wristR: -6 + 3 * a * Math.sin((t * TAU) / 3.9 + 0.6),
      legL: 2.5,
      legR: 2.5,
      footL: 3,
      footR: 3,
      mouthSmile: 0.55 + 0.06 * drift,
    },
    k,
  );
};

const wave = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const w = Math.sin((t * TAU) / 0.62);
  const br = Math.sin((t * TAU) / 3.2);
  return withBlink(
    {
      ...idle(frame, fps, { ...o, blink: false }),
      y: -1.8 * a * br,
      lean: -1.6 * a,
      headTilt: -3.4 * a + 1.2 * a * w,
      headTurn: -0.12,
      browRaise: 3.5 + 1.2 * w,
      eyeOpen: 0.66,
      mouthSmile: 0.85,
      mouthWidth: 1.0,
      mouthOpen: 0.06 + 0.05 * (0.5 + 0.5 * w),
      armR: -48 - 4 * a * br,
      elbowR: -46 + 24 * a * w,
      wristR: 12 * a * w,
      armL: 76 + 2 * a * br,
      elbowL: 10,
    },
    k,
    0.66,
  );
};

/**
 * Walk — stance-locked gait (src/characters/StickGuy/gait.ts).
 *
 * By default the feet are world-locked and the box must be moved by the
 * caller at `gaitDistance/t` (see `walkDistance`), or the soles skate. Set
 * `travel` (rig units/s) to override the speed; `direction` flips the
 * travel axis (-1 = travels LEFT, the character's default facing).
 */
const walk = (frame: number, fps: number, o?: AnimOptions & TravelOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const g = o?.gait ?? WALK;
  const dir = o?.direction ?? -1;
  const speed = o?.travel ?? g.speed;
  const cfg: GaitConfig = { ...g, speed };
  const distance = walkDistance(t, o?.rampEnd ?? t + 3, cfg);
  const gp = gaitPose(distance, cfg, { direction: dir, amplitude: a });
  const base: Pose = {
    ...k.base,
    x: k.base.x,
    y: k.base.y - gp.bob + 1.5,
    squash: 1 + 0.025 * a * Math.cos(gp.phase * Math.PI * 4),
    lean: -1.4 * dir * Math.cos(gp.phase * Math.PI * 2),
    headTilt: 1.6 * dir * Math.cos(gp.phase * Math.PI * 2),
    headBob: 1.4 * a * Math.sin(gp.phase * Math.PI * 4 + 0.4),
    armL: 78 + dir * 13 * Math.cos(gp.phase * Math.PI * 2),
    armR: 78 - dir * 13 * Math.cos(gp.phase * Math.PI * 2),
    elbowL: 8,
    elbowR: 8,
    wristL: -4,
    wristR: -4,
    mouthSmile: 0.6,
  };
  return withGait(withBlink(base, k), gp, a);
};

/**
 * Run — stance-locked gait at RUN cadence, with a forward lean and a bigger
 * swing (see `walk` for the options).
 */
const run = (frame: number, fps: number, o?: AnimOptions & TravelOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const g = o?.gait ?? RUN;
  const dir = o?.direction ?? -1;
  const speed = o?.travel ?? g.speed;
  const cfg: GaitConfig = { ...g, speed };
  const distance = walkDistance(t, o?.rampEnd ?? t + 3, cfg);
  const gp = gaitPose(distance, cfg, { direction: dir, amplitude: a, bob: 8 });
  const base: Pose = {
    ...k.base,
    x: k.base.x,
    y: k.base.y - gp.bob + 4,
    squash: 1 + 0.05 * a * Math.cos(gp.phase * Math.PI * 4),
    lean: dir * 4.5 + dir * 1.6 * a * Math.cos(gp.phase * Math.PI * 2),
    headTilt: -3 - 1.4 * a * Math.cos(gp.phase * Math.PI * 2),
    headBob: 2.2 * a * Math.sin(gp.phase * Math.PI * 4),
    armL: 46 + dir * 30 * Math.cos(gp.phase * Math.PI * 2),
    armR: 46 - dir * 30 * Math.cos(gp.phase * Math.PI * 2),
    elbowL: 62 + 16 * a * Math.cos(gp.phase * Math.PI * 2),
    elbowR: 62 - 16 * a * Math.cos(gp.phase * Math.PI * 2),
    wristL: -10,
    wristR: -10,
    eyeOpen: 0.68,
    mouthOpen: 0.22 + 0.12 * Math.abs(Math.sin(gp.phase * Math.PI * 2)),
    mouthSmile: 0.35,
    browRaise: -1.5,
    browTilt: 5,
  };
  return withGait(withBlink(base, k, 0.68), gp, a);
};

/** Cheap, deterministic "talking" mouth. Swap in `textToVisemes` for real lip-sync. */
const talk = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a, seed } = k;
  const step = 0.115;
  const i = Math.floor(t / step);
  const u = easeInOut(clamp((t - i * step) / step, 0, 1));
  const keys: Viseme[] = ['A', 'E', 'M', 'O', 'I', 'L', 'U', 'F', 'A', 'M', 'E', 'O'];
  const pick = (n: number): Viseme => {
    const r = hash01(n * 5.1 + seed * 31.7);
    if (r < 0.16) return 'rest';
    return keys[Math.floor(hash01(n * 9.3 + seed * 3.1) * keys.length) % keys.length];
  };
  const v0 = VISEMES[pick(i)];
  const v1 = VISEMES[pick(i + 1)];
  const nod = Math.sin((t * TAU) / 2.4);
  const gest = Math.sin((t * TAU) / 3.1);
  const base = idle(frame, fps, { ...o, blink: false });
  return withBlink(
    {
      ...base,
      headTilt: base.headTilt + 2.2 * a * nod,
      headBob: base.headBob + 1.4 * a * Math.sin((t * TAU) / 1.2),
      browRaise: 2 + 2.4 * hash01(i * 1.7 + seed),
      mouthOpen: lerp(v0.mouthOpen, v1.mouthOpen, u) * (0.6 + 0.4 * a),
      mouthSmile: lerp(v0.mouthSmile, v1.mouthSmile, u),
      mouthWidth: lerp(v0.mouthWidth, v1.mouthWidth, u),
      armL: 66 + 10 * a * gest,
      armR: 66 - 10 * a * gest,
      elbowL: 26 + 14 * a * (0.5 + 0.5 * gest),
      elbowR: 26 + 14 * a * (0.5 - 0.5 * gest),
      wristL: -12 * a * gest,
      wristR: 12 * a * gest,
    },
    k,
    0.56,
  );
};

const jump = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const a = k.a;
  const dur = 1.7;
  const u = clamp((k.t % dur) / dur, 0, 1);
  // 0.00-0.22 crouch | 0.22-0.34 launch | 0.34-0.72 air | 0.72-0.86 land | 0.86-1 recover
  let y = 0;
  let squash = 1;
  let arm = 74;
  let elbow = 10;
  let knee = 0;
  let leg = 2.5;
  let mouthOpen = 0;
  if (u < 0.22) {
    const e = easeInOut(u / 0.22);
    y = 16 * a * e;
    squash = 1 - 0.16 * a * e;
    arm = lerp(74, 104, e);
    elbow = lerp(10, 26, e);
    knee = 34 * a * e;
    leg = 2.5 + 5 * e;
  } else if (u < 0.34) {
    const e = easeOut((u - 0.22) / 0.12);
    y = lerp(16, -190 * a, e);
    squash = lerp(0.84, 1.16, e);
    arm = lerp(104, -74, e);
    elbow = lerp(26, 4, e);
    knee = lerp(34, 6, e);
    mouthOpen = 0.4 * e;
  } else if (u < 0.72) {
    const e = (u - 0.34) / 0.38;
    y = -190 * a * Math.sin(Math.PI * (0.18 + 0.82 * e)) * (1 - 0.06 * e);
    squash = 1.06 - 0.06 * e;
    arm = -74 + 16 * Math.sin(e * TAU);
    elbow = 6 + 12 * e;
    knee = 18 + 22 * Math.sin(Math.PI * e);
    leg = 2.5 + 9 * Math.sin(Math.PI * e);
    mouthOpen = 0.4 - 0.2 * e;
  } else if (u < 0.86) {
    const e = easeOut((u - 0.72) / 0.14);
    y = lerp(-34, 18 * a, e);
    squash = lerp(1.1, 0.82, e);
    arm = lerp(-60, 96, e);
    elbow = lerp(10, 30, e);
    knee = lerp(10, 40, e);
    leg = 2.5 + 6 * e;
    mouthOpen = 0.2 * (1 - e);
  } else {
    const e = easeInOut((u - 0.86) / 0.14);
    y = lerp(18 * a, 0, e);
    squash = lerp(0.82, 1, e);
    arm = lerp(96, 74, e);
    elbow = lerp(30, 10, e);
    knee = lerp(40, 0, e);
    leg = lerp(8.5, 2.5, e);
  }
  return withBlink(
    {
      ...IDLE_POSE,
      y,
      squash,
      armL: arm,
      armR: arm,
      elbowL: elbow,
      elbowR: elbow,
      kneeL: knee,
      kneeR: knee,
      legL: leg,
      legR: leg,
      footL: 3 + knee * 0.25,
      footR: 3 + knee * 0.25,
      headBob: -y * 0.02,
      headTilt: 0,
      browRaise: u > 0.22 && u < 0.8 ? 5 : 0,
      eyeOpen: 0.68,
      mouthOpen,
      mouthSmile: 0.6,
    },
    k,
    0.68,
  );
};

const dance = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const T = 1.6;
  const ph = (t * TAU) / T;
  const s = Math.sin(ph);
  const bounce = Math.abs(Math.sin(ph * 2));
  return withBlink(
    {
      ...IDLE_POSE,
      x: 14 * a * s,
      y: -12 * a * bounce,
      squash: 1 + 0.05 * a * Math.cos(ph * 4),
      lean: 5 * a * s,
      headTilt: -7 * a * s,
      headBob: 2 * a * bounce,
      headTurn: 0.3 * s,
      armL: 20 - 70 * a * (0.5 + 0.5 * s),
      armR: 20 + 70 * a * (0.5 - 0.5 * s),
      elbowL: 40 + 30 * a * (0.5 - 0.5 * s),
      elbowR: 40 + 30 * a * (0.5 + 0.5 * s),
      wristL: -20 * a * s,
      wristR: -20 * a * s,
      legL: 6 + 8 * a * (0.5 + 0.5 * s),
      legR: 6 + 8 * a * (0.5 - 0.5 * s),
      kneeL: 12 + 14 * a * bounce,
      kneeR: 12 + 14 * a * (1 - bounce),
      footL: 6,
      footR: 6,
      eyeOpen: 0.62,
      mouthSmile: 0.95,
      mouthOpen: 0.18 + 0.16 * bounce,
      mouthWidth: 1.05,
      browRaise: 3,
    },
    k,
    0.62,
  );
};

const shrug = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const T = 2.8;
  const u = (k.t % T) / T;
  const e = u < 0.25 ? easeInOut(u / 0.25) : u < 0.7 ? 1 : 1 - easeInOut((u - 0.7) / 0.3);
  const a = k.a * e;
  return withBlink(
    {
      ...IDLE_POSE,
      y: -3 * a,
      armL: lerp(74, 34, a),
      armR: lerp(74, 34, a),
      elbowL: lerp(9, 74, a),
      elbowR: lerp(9, 74, a),
      wristL: lerp(-6, -40, a),
      wristR: lerp(-6, -40, a),
      headTilt: 4 * a,
      headBob: -3 * a,
      browRaise: 8 * a,
      browTilt: -6 * a,
      eyeOpen: 0.5 + 0.16 * a,
      mouthSmile: lerp(0.55, -0.15, a),
      mouthWidth: lerp(0.92, 0.8, a),
      squash: 1 - 0.02 * a,
    },
    k,
    0.5 + 0.16 * a,
  );
};

const point = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const jitter = Math.sin((t * TAU) / 1.9);
  return withBlink(
    {
      ...IDLE_POSE,
      lean: -2 * a,
      headTurn: -0.35,
      headTilt: -2 * a,
      lookX: -0.6,
      browRaise: 3,
      eyeOpen: 0.62,
      mouthSmile: 0.4,
      mouthOpen: 0.1 + 0.06 * (0.5 + 0.5 * jitter),
      armR: -6 - 3 * a * jitter,
      elbowR: -4,
      wristR: -6,
      armL: 78,
      elbowL: 14,
    },
    k,
    0.62,
  );
};

/* --------------------------- acting clips --------------------------- */
/*
 * Emotion-first poses studied from the reference films (see
 * docs/reference-style-study.md): the character does NOT talk — he shows the
 * feeling. Faces are baked in; override them by spreading a FACES entry on top.
 */

/** Sunken into the couch, phone low, doomscrolling. Pair with a phone in `handSlotR`. */
const slouch = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const br = Math.sin((t * TAU) / 4.2);
  const tap = Math.sin((t * TAU) / 0.72);
  return withBlink(
    {
      ...k.base,
      y: 128 + 2 * a * br,
      squash: 0.965,
      lean: 5,
      headTilt: 9 + 1.4 * a * br,
      headBob: 6,
      headTurn: 0.12,
      lookY: 0.55,
      eyeOpen: 0.26,
      browRaise: -2,
      browTilt: 2,
      mouthSmile: -0.2,
      mouthWidth: 0.85,
      pupil: 1.1,
      armL: 58 + 1.6 * a * br,
      armR: 58 - 1.6 * a * br,
      elbowL: 102 + 2.4 * a * tap,
      elbowR: 102 - 2.4 * a * tap,
      wristL: -8,
      wristR: 6 + 8 * tap,
      legL: -8,
      legR: -8,
      kneeL: -108,
      kneeR: -108,
      footL: 0,
      footR: 0,
    },
    k,
    0.26,
  );
};

/** On the floor, back rounded, arms wrapped around drawn-up knees. */
const huddle = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const br = Math.sin((t * TAU) / 5.1);
  return withBlink(
    {
      ...k.base,
      y: 236 + 2.5 * a * br,
      squash: 0.94,
      lean: 6,
      headTilt: 14 + 1.2 * a * br,
      headBob: 8,
      headTurn: 0.1,
      lookY: 0.5,
      eyeOpen: 0.2,
      browRaise: -2.5,
      browTilt: 4,
      mouthSmile: -0.3,
      mouthWidth: 0.8,
      pupil: 1.1,
      armL: 38 + 1.5 * a * br,
      armR: 38 - 1.5 * a * br,
      elbowL: 138,
      elbowR: 138,
      wristL: -18,
      wristR: -18,
      legL: -6,
      legR: -6,
      kneeL: -112,
      kneeR: -112,
      footL: 0,
      footR: 0,
    },
    k,
    0.2,
  );
};

/** Perched on the bed edge at 2 AM, hands clasped, hollow thousand-yard stare. */
const sitEdge = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const br = Math.sin((t * TAU) / 4.6);
  return withBlink(
    {
      ...k.base,
      y: 168 + 2 * a * br,
      lean: 2,
      headTilt: 2,
      headBob: 2 + 1 * a * br,
      headTurn: 0,
      lookY: 0.1,
      eyeOpen: 0.7,
      pupil: 0.55,
      browRaise: 4,
      browTilt: -4,
      mouthSmile: -0.05,
      mouthWidth: 0.78,
      armL: 36 + 1.4 * a * br,
      armR: 36 - 1.4 * a * br,
      elbowL: 52,
      elbowR: 52,
      wristL: -22,
      wristR: 22,
      legL: 0,
      legR: 0,
      kneeL: -38,
      kneeR: -38,
      footL: 0,
      footR: 0,
    },
    k,
    0.9,
  );
};

/** Slumped forward over the desk, head on the arms — Day 47 defeat. */
const slump = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const br = Math.sin((t * TAU) / 6.2);
  return withBlink(
    {
      ...k.base,
      y: 96 + 2 * a * br,
      squash: 0.96,
      lean: 8,
      headTilt: 18 + 1 * a * br,
      headBob: 10,
      headTurn: 0.2,
      lookY: 0.65,
      eyeOpen: 0.15,
      browRaise: -3,
      browTilt: 3,
      mouthSmile: -0.25,
      mouthWidth: 0.8,
      pupil: 1.05,
      armL: 45,
      armR: 45,
      elbowL: 118 + 2 * a * br,
      elbowR: 118 - 2 * a * br,
      wristL: -24,
      wristR: -24,
      legL: -6,
      legR: -6,
      kneeL: -108,
      kneeR: -108,
      footL: 0,
      footR: 0,
    },
    k,
    0.12,
  );
};

/** Chin up, chest open, calm — "Day one, or one day." The payoff stance. */
const resolve = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const br = Math.sin((t * TAU) / 3.8);
  return withBlink(
    {
      ...k.base,
      y: -2 + 2 * a * br,
      squash: 1.02,
      lean: -1.5,
      headTilt: -2 + 1 * a * br,
      headBob: -3,
      headTurn: 0,
      lookY: -0.15,
      eyeOpen: 0.5,
      pupil: 0.95,
      browRaise: 1.5,
      browTilt: 0,
      mouthSmile: 0.8,
      mouthWidth: 0.95,
      armL: 70 + 2 * a * br,
      armR: 70 + 2 * a * br,
      elbowL: 4,
      elbowR: 4,
      wristL: -4,
      wristR: -4,
      legL: 3,
      legR: 3,
      footL: 3,
      footR: 3,
    },
    k,
    0.5,
  );
};

/** Lying on his back, phone held above the face, thumb tapping — the
 *  couch-surrender shot. `lean: 90` lays the body (head screen-RIGHT) and
 *  `headTilt ≈ -82` counter-rotates the HEAD UPRIGHT so the face reads
 *  normal, looking up-left at the phone (storyboard panels 2-3). The raised
 *  arm is an L: upper arm up-left (armL 25), forearm near-vertical
 *  (elbowL -35) — the phone rides in `handSlotL` with translate(1 12)
 *  rotate(-20) (see DayArcSlice PhoneGlow). Far arm folds hidden behind
 *  the head/torso. One knee folds up (kneeL -24) like panel 3's triangle
 *  leg, the other stays flat. Pair with a WIDE viewBox container
 *  (rotated content spans ~x 40-755, y 140-520 rig units — see SKILL §3f). */
const lounge = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const br = Math.sin((t * TAU) / 4.6);
  const tap = Math.sin((t * TAU) / 1.15) * (0.5 + 0.5 * Math.sin((t * TAU) / 0.62));
  return withBlink(
    {
      ...k.base,
      x: k.base.x + 6,
      lean: 90,
      headTilt: -82 + 1.4 * a * br,
      headTurn: -0.12,
      headBob: 2,
      lookX: -0.8,
      lookY: 0.5,
      eyeOpen: 0.3,
      browRaise: -2,
      browTilt: 2,
      mouthSmile: -0.2,
      mouthWidth: 0.8,
      pupil: 1.05,
      armL: 25 + 1.6 * a * br,
      armR: -172 - 1.6 * a * br,
      elbowL: -35 + 2.5 * tap,
      elbowR: 12 - 2.5 * tap,
      wristL: 0,
      wristR: -4 - 6 * tap,
      legL: 2 + 1.2 * a * br,
      legR: 2 - 1.2 * a * br,
      kneeL: -24,
      kneeR: -6,
      footL: -14,
      footR: -4,
    },
    k,
    0.3,
  );
};

/** Front-view cheat kick: weight onto the right leg, LEFT leg swings out
 *  and up (so the ball flies upper-left, matching the storyboard). One-shot
 *  ~1.15s — windup, strike, follow-through — then holds the end pose. */
const kick = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const f = Math.min(k.t / 1.15, 1);
  const seg = (p: number, from: number, to: number) => clamp((p - from) / (to - from), 0, 1);
  const eo = (u: number) => 1 - Math.pow(1 - u, 3);
  const wind = eo(seg(f, 0, 0.3));
  const strike = eo(seg(f, 0.3, 0.48));
  const follow = eo(seg(f, 0.48, 0.8));
  const settle = eo(seg(f, 0.8, 1));
  const K = (
    p0: number, p1: number, p2: number, p3: number, p4: number,
  ) => p0 + (p1 - p0) * wind + (p2 - p1) * strike + (p3 - p2) * follow + (p4 - p3) * settle;
  return withBlink(
    {
      ...k.base,
      /* panel 6: torso counters the kick (head swings right), eyes on the
         ball, LEFT arm fisted beside the head (sharp elbow fold), RIGHT
         arm extended back-down, support knee crouched, kick leg high */
      lean: K(-1, -12, 18, 14, 2),
      headTilt: K(-2, -5, 4, 1, -1),
      headTurn: 0,
      lookX: K(0, -0.3, -0.6, -0.4, -0.1),
      lookY: K(-0.1, -0.2, -0.35, -0.25, -0.1),
      eyeOpen: 0.62,
      browRaise: 2,
      browTilt: -2,
      mouthSmile: 0.5,
      mouthWidth: 0.95,
      armL: K(66, 40, -25, -22, 52),
      armR: K(66, 45, 22, 26, 45),
      elbowL: K(6, -25, -95, -88, 10),
      elbowR: K(6, 5, 4, 5, 8),
      wristL: K(-4, -6, -12, -10, -4),
      wristR: K(4, 6, 6, 5, 4),
      legL: K(4, -12, 75, 45, 22),
      legR: K(-3, -5, -6, -5, -2),
      kneeL: K(-18, -96, -6, -30, -34),
      kneeR: K(-4, -12, -22, -14, -4),
      footL: K(3, 14, -18, -6, 0),
      footR: K(3, 0, 0, 0, 0),
    },
    k,
    0.62,
  );
};

/** Foot planted on the ball, hands on hips — panel 5's rest stance before
 *  the kick. Rig math (Leg chain: rotate(leg, hipL) → translate(-10,120)
 *  → rotate(-knee) → translate(-8,112), hip (315,398)): with the ball
 *  resting on the ground line its visible top sits at rig y ≈ 575, so the
 *  sole (42 below the ankle) needs the ankle at (194, 533) → kneeL −78
 *  with legL 0. The shin folds forward horizontal, knee over the ball's
 *  right edge. The foot INHERITS the shin's rotation (leg−knee), so
 *  footL = kneeL levels the sole onto the ball's top (empirically
 *  calibrated against the render: kneeL −62 lands the sole on the ball's
 *  crown). Arms akimbo: arm 20 / elbow 90 — upper arm out horizontal,
 *  forearm dropping to the waist (wrist ≈ (232, 321)), elbow well past
 *  the torso edge so the triangle reads at render scale. Confident smirk,
 *  eyes angled down toward the ball. Loop = slow determined breathing. */const ballRest = (frame: number, fps: number, o?: AnimOptions): Pose => {
  const k = ctx(frame, fps, o);
  const { t, a } = k;
  const br = Math.sin((t * TAU) / 3.4);
  return withBlink(
    {
      ...k.base,
      x: k.base.x + 4,
      lean: 2 + 0.8 * a * br,
      headTilt: 2 + 0.8 * a * br,
      headTurn: -0.1,
      lookY: 0.3,
      lookX: -0.25,
      eyeOpen: 0.42,
      browRaise: 0,
      browTilt: -2,
      mouthSmile: 0.5,
      mouthWidth: 0.82,
      armL: 20 + 1.2 * a * br,
      armR: 20 + 1.2 * a * br,
      elbowL: 90,
      elbowR: 90,
      wristL: -10,
      wristR: -10,
      legL: 0,
      legR: -3,
      kneeL: -62,
      kneeR: -2,
      footL: -62,
      footR: 3,
    },
    k,
    0.35,
  );
};

export type AnimationId =
  | 'tpose'
  | 'idle'
  | 'wave'
  | 'walk'
  | 'run'
  | 'talk'
  | 'jump'
  | 'dance'
  | 'shrug'
  | 'point'
  | 'slouch'
  | 'huddle'
  | 'sit-edge'
  | 'slump'
  | 'resolve'
  | 'lounge'
  | 'kick'
  | 'ballRest';

export interface AnimationClip {
  id: AnimationId;
  label: string;
  hint: string;
  /** seconds for one loop (or one shot for `jump`) */
  duration: number;
  loops: boolean;
  fn: (frame: number, fps: number, o?: AnimOptions & TravelOptions) => Pose;
}

export const ANIMATIONS: Record<AnimationId, AnimationClip> = {
  tpose: { id: 'tpose', label: 'T-Pose', hint: 'The reference sheet — rig rest state', duration: 1, loops: true, fn: tpose },
  idle: { id: 'idle', label: 'Idle', hint: 'Breathing, weight shift, auto-blink', duration: 7.3, loops: true, fn: idle },
  wave: { id: 'wave', label: 'Wave', hint: 'Right-hand greeting loop', duration: 0.62, loops: true, fn: wave },
  walk: { id: 'walk', label: 'Walk', hint: 'Walk in place, 0.94s cycle', duration: 0.94, loops: true, fn: walk },
  run: { id: 'run', label: 'Run', hint: 'Faster cycle, forward lean', duration: 0.58, loops: true, fn: run },
  talk: { id: 'talk', label: 'Talk', hint: 'Viseme babble + gestures', duration: 2.4, loops: true, fn: talk },
  jump: { id: 'jump', label: 'Jump', hint: 'Squash & stretch, 1.7s one-shot', duration: 1.7, loops: true, fn: jump },
  dance: { id: 'dance', label: 'Dance', hint: 'Bounce + alternating arms', duration: 1.6, loops: true, fn: dance },
  shrug: { id: 'shrug', label: 'Shrug', hint: 'Palms up, brows raised', duration: 2.8, loops: true, fn: shrug },
  point: { id: 'point', label: 'Point', hint: 'Direct attention stage-left', duration: 1.9, loops: true, fn: point },
  slouch: { id: 'slouch', label: 'Slouch', hint: 'Couch doomscroll — sunk, phone low, doom eyes', duration: 4.2, loops: true, fn: slouch },
  huddle: { id: 'huddle', label: 'Huddle', hint: 'Floor, knees up, arms wrapped — rock bottom', duration: 5.1, loops: true, fn: huddle },
  'sit-edge': { id: 'sit-edge', label: 'Sit Edge', hint: 'Bed edge at 2 AM, hands clasped, hollow stare', duration: 4.6, loops: true, fn: sitEdge },
  slump: { id: 'slump', label: 'Slump', hint: 'Head down on the desk — defeat at day 47', duration: 6.2, loops: true, fn: slump },
  resolve: { id: 'resolve', label: 'Resolve', hint: 'Chin up, chest open, calm — the payoff stance', duration: 3.8, loops: true, fn: resolve },
  lounge: { id: 'lounge', label: 'Lounge', hint: 'Lying on the couch, phone above the face, texting', duration: 4.6, loops: true, fn: lounge },
  kick: { id: 'kick', label: 'Kick', hint: 'Windup → strike → follow-through one-shot, holds the end', duration: 1.15, loops: false, fn: kick },
  ballRest: { id: 'ballRest', label: 'Ball Rest', hint: 'Foot on the ball, hands on hips — pre-kick confidence', duration: 3.4, loops: true, fn: ballRest },
};

export const ANIMATION_LIST = Object.values(ANIMATIONS);

/* --------------------------- lip-sync helper --------------------------- */

const CHAR_VISEME: Record<string, Viseme> = {
  a: 'A', e: 'E', i: 'I', o: 'O', u: 'U', w: 'W',
  m: 'M', b: 'M', p: 'M', f: 'F', v: 'F', l: 'L', n: 'L', t: 'L', d: 'L',
  s: 'I', z: 'I', c: 'I', k: 'A', g: 'A', h: 'A', j: 'E', q: 'W', r: 'E',
  x: 'I', y: 'I', ' ': 'rest', '.': 'rest', ',': 'rest', '!': 'rest', '?': 'rest',
};

/**
 * Extremely small grapheme→viseme scheduler. Good enough for cartoon lip-sync;
 * replace with real phoneme timings (e.g. from Whisper / @remotion/captions) when you have them.
 */
export function textToVisemes(
  text: string,
  fps: number,
  charsPerSecond = 13,
): { frame: number; viseme: Viseme }[] {
  const perChar = fps / charsPerSecond;
  return text
    .toLowerCase()
    .split('')
    .map((ch, i) => ({
      frame: Math.round(i * perChar),
      viseme: CHAR_VISEME[ch] ?? 'A',
    }));
}

/** Sample a viseme track at a frame and return the mouth values for it. */
export function visemeAt(
  track: { frame: number; viseme: Viseme }[],
  frame: number,
  blendFrames = 2,
) {
  if (track.length === 0) return VISEMES.rest;
  let idx = 0;
  for (let i = 0; i < track.length; i++) if (track[i].frame <= frame) idx = i;
  const cur = track[idx];
  const next = track[Math.min(idx + 1, track.length - 1)];
  const span = Math.max(next.frame - cur.frame, 1);
  const u = clamp((frame - cur.frame) / Math.min(span, blendFrames), 0, 1);
  const a = VISEMES[cur.viseme];
  const b = VISEMES[next.viseme];
  return {
    mouthOpen: lerp(a.mouthOpen, b.mouthOpen, u),
    mouthSmile: lerp(a.mouthSmile, b.mouthSmile, u),
    mouthWidth: lerp(a.mouthWidth, b.mouthWidth, u),
  };
}
