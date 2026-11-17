import type { Pose } from './types';

/**
 * Emotion faces — the acting layer for StickGuy.
 *
 * Each face is a *partial* pose touching only the face parameters, so it can be
 * spread over ANY body pose / animation clip:
 *
 *   const p = ANIMATIONS.idle.fn(frame, fps);
 *   <StickGuy pose={{ ...p, ...FACES.doom }} />
 *
 * or blended smoothly with mixPose over a resolved base:
 *
 *   const t = interpolate(frame, [0, 12], [0, 1]);
 *   pose = mixPose(resolvePose(base), resolvePose({ ...base, ...FACES.grit }), t);
 */

export type FaceId =
  | 'neutral'
  | 'doom'
  | 'grit'
  | 'hollow'
  | 'soft'
  | 'worried'
  | 'shocked';

export interface Face {
  id: FaceId;
  label: string;
  hint: string;
  pose: Partial<Pose>;
}

export const FACES: Record<FaceId, Face> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    hint: 'The rig baseline — mild open expression',
    pose: {},
  },
  doom: {
    id: 'doom',
    label: 'Doom',
    hint: 'Heavy half-lids, flat frown, looking down — the doomscroll stare',
    pose: {
      eyeOpen: 0.26,
      lookY: 0.55,
      browRaise: -2,
      browTilt: 2,
      mouthSmile: -0.2,
      mouthWidth: 0.85,
      pupil: 1.1,
      sweat: 0,
    },
  },
  grit: {
    id: 'grit',
    label: 'Grit',
    hint: 'V-brows, clenched teeth — effort, discipline, pushing through',
    pose: {
      eyeOpen: 0.55,
      lookX: 0,
      lookY: 0,
      browRaise: -2,
      browTilt: 6,
      browBend: 1,
      mouthOpen: 0.3,
      mouthSmile: -0.25,
      mouthWidth: 1.1,
      teeth: 1,
      pupil: 1.05,
    },
  },
  hollow: {
    id: 'hollow',
    label: 'Hollow',
    hint: 'Heavy lids, small pupils, flat mouth — the 2:14 AM insomnia stare',
    pose: {
      eyeOpen: 0.7,
      lookY: 0.2,
      browRaise: 4,
      browTilt: -4,
      mouthOpen: 0,
      mouthSmile: -0.05,
      mouthWidth: 0.78,
      pupil: 0.55,
      sweat: 0,
    },
  },
  soft: {
    id: 'soft',
    label: 'Soft',
    hint: 'Calm gentle smile, relaxed brows — the payoff / reconnection face',
    pose: {
      eyeOpen: 0.5,
      lookY: 0,
      browRaise: 1.5,
      browTilt: 0,
      mouthSmile: 0.8,
      mouthWidth: 0.95,
      pupil: 0.95,
      teeth: 0,
      sweat: 0,
    },
  },
  worried: {
    id: 'worried',
    label: 'Worried',
    hint: 'Raised inner brows, small frown, sweat drop — tempted / anxious',
    pose: {
      eyeOpen: 0.8,
      lookX: 0.35,
      lookY: 0.15,
      browRaise: 7,
      browTilt: -8,
      mouthOpen: 0.06,
      mouthSmile: -0.28,
      mouthWidth: 0.78,
      pupil: 1.15,
      sweat: 1,
    },
  },
  shocked: {
    id: 'shocked',
    label: 'Shocked',
    hint: 'Brows up, eyes wide, mouth agape — the realisation beat',
    pose: {
      eyeOpen: 1,
      lookY: 0,
      browRaise: 9,
      browTilt: -6,
      mouthOpen: 0.8,
      mouthSmile: -0.1,
      mouthWidth: 0.8,
      pupil: 0.8,
      sweat: 0.4,
    },
  },
};

export const FACE_LIST = Object.values(FACES);
