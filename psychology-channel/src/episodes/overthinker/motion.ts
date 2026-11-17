// ============================================================
// ANIMATION HELPERS â€” Easing + interpolation utilities
// ============================================================
import { interpolate, Easing, random } from 'remotion';

/** Fade opacity from 0â†’1 over [start, start+duration] frames */
export const fadeIn = (frame: number, start: number, duration = 20) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

/** Fade opacity from 1â†’0 over [start, start+duration] frames */
export const fadeOut = (frame: number, start: number, duration = 15) =>
  interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

/** Fade in then fade out â€” returns opacity value */
export const fadeInOut = (
  frame: number,
  fadeInStart: number,
  fadeInDur: number,
  holdDur: number,
  fadeOutDur: number,
): number => {
  const fadeInEnd = fadeInStart + fadeInDur;
  const fadeOutStart = fadeInEnd + holdDur;
  const fadeOutEnd = fadeOutStart + fadeOutDur;

  return interpolate(
    frame,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
};

/** Bouncy drop-in â€” for day counter labels */
export const dropBounce = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [-80, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.8)),
  });

/** Slide in from left */
export const slideInLeft = (frame: number, start: number, duration = 20, distance = 120) =>
  interpolate(frame, [start, start + duration], [-distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

/** Slide in from right */
export const slideInRight = (frame: number, start: number, duration = 20, distance = 120) =>
  interpolate(frame, [start, start + duration], [distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

/** Gentle float â€” breathing / idle animation */
export const floatY = (frame: number, amplitude = 6, speed = 0.04) =>
  Math.sin(frame * speed) * amplitude;

/** Sweat drop drip â€” falls then fades */
export const sweatDrip = (frame: number, offset = 0) => {
  const f = (frame + offset) % 60;
  const y = interpolate(f, [0, 50], [0, 30], { extrapolateRight: 'clamp' });
  const opacity = interpolate(f, [0, 10, 40, 50], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return { y, opacity };
};

/** Scale pulse â€” heartbeat / emphasis */
export const pulse = (frame: number, start: number, intensity = 0.12) => {
  const f = frame - start;
  if (f < 0 || f > 24) return 1;
  return 1 + intensity * Math.sin((f / 24) * Math.PI);
};

/** Jitter â€” anxious shake */
export const jitter = (frame: number, amplitude = 3) => {
  const r = random(`jitter:${frame}`) - 0.5;
  return r * amplitude * (Math.sin(frame * 1.7) > 0 ? 1 : -1);
};

/** Screen transition â€” black flash */
export const sceneWipe = (frame: number, start: number, duration = 15) =>
  interpolate(frame, [start, start + duration / 2, start + duration], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
