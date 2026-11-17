/**
 * Entity — the shared antagonist. A pure-black silhouette with red glowing eyes.
 *
 * Unlike StickGuy (a rigged bean figure), the Entity is a SHAPE, not a character:
 * no detail, no mouth movement, no face acting. Its only channel of emotion is
 * SIZE + posture + the red glow (see docs/reference-style-study.md §2):
 *
 *   | State      | Staging                                        |
 *   |------------|------------------------------------------------|
 *   | Tempting   | hero-sized, relaxed lean, thin red smile       |
 *   | Dominating | 2-3x hero height, arms spread                  |
 *   | Mirror     | hero-sized, dead calm — what the hero sees     |
 *   | Shrunken   | palm-sized, cowering                           |
 *
 * All angles are degrees, all offsets in rig units (690 x 700, same box as
 * StickGuy so `scale: 1` stands hero-height next to him).
 */

export interface EntityPose {
  /* ---- root ---- */
  /** horizontal offset */
  x: number;
  /** vertical offset (positive = sink toward/below the ground line) */
  y: number;
  /** uniform scale, 1 = hero height; ~0.16 = palm-size, ~2.6 = dominating */
  scale: number;
  /** whole-body rotation around the hips, + = lean right */
  lean: number;

  /* ---- head ---- */
  /** head rotation around the neck */
  headTilt: number;

  /* ---- arms ---- */
  /** 0 = hanging relaxed, 1 = full horizontal spread, >1 = raised over-head */
  armSpread: number;

  /* ---- posture ---- */
  /** 0 = standing, 1 = hunched/cowering (head sinks, spine bows, arms wrap) */
  cower: number;

  /* ---- the red ---- */
  /** eye slit openness, 0.1 = razor slit, 1 = round glow */
  eyeOpen: number;
  /** 0 = no mouth, 1 = the thin red smile (tempting only) */
  smile: number;
  /** aura/glow intensity, 1 = default presence, up to ~1.4 dominating */
  glow: number;
  /** faint red rim on the silhouette edge so it reads on the void, 0..1 */
  rim: number;
}

export const E_DEFAULT: EntityPose = {
  x: 0,
  y: 0,
  scale: 1,
  lean: 0,
  headTilt: 0,
  armSpread: 0.15,
  cower: 0,
  eyeOpen: 0.35,
  smile: 0,
  glow: 0.9,
  rim: 0.4,
};

/** Fill a partial pose over the defaults (mirrors rig.resolvePose). */
export const resolveEntityPose = (partial: Partial<EntityPose>): EntityPose => ({
  ...E_DEFAULT,
  ...partial,
});
