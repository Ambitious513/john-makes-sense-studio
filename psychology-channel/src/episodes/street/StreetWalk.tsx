/**
 * STREET WALK — the deliverable shot: the sheet character walking down a street.
 *
 * Built entirely in code on the shared engine: the stance-locked gait drives the
 * legs, and the SAME `distance` value scrolls the pavement, so the soles cannot
 * skate (verified by src/characters/SweaterGuy/gait.test.ts, which measures the
 * drawn chain, not the analytic promise).
 *
 *   distance (rig units) ──► walkState pose      ──► legs
 *                      └────► scroll = d * SCALE ──► ground layer at parallax 1.0
 *
 * One number, two consumers. That is the whole trick.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { GROUND_FRACTION, SweaterGuy, VIEWBOX_GROUND } from '../../characters/SweaterGuy/SweaterGuy';
import { walkState } from '../../characters/SweaterGuy/walk';
import { GROUND_Y, Street } from '../../characters/SetKit/Street';
import { SfxLayer } from '../../engine/sfx';
import { AMBIENCE, Bed } from '../../engine/music';

export const FPS = 30;
export const DURATION = 180; // 6 s
/** screen px per rig unit — the figure is 1000 units tall, drawn at 700 px */
export const SCALE = 0.7;

const BOX_W = 580 * SCALE;
const BOX_H = 1106 * SCALE;
/** the soles land exactly on the set's ground line, by construction */
const HERO_TOP = GROUND_Y - GROUND_FRACTION * BOX_H;
/** he walks LEFT (the rig's default facing), held a third of the way in */
export const HERO_LEFT = 0.34 * 1920 - BOX_W / 2;

export const StreetWalk: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const st = walkState(frame, fps, { direction: -1 });

  return (
    <AbsoluteFill style={{ background: '#FCF5EB' }}>
      <Street scroll={-st.distance * SCALE} />

      <div
        style={{
          position: 'absolute',
          left: HERO_LEFT,
          top: HERO_TOP,
          width: BOX_W,
          height: BOX_H,
        }}
      >
        <SweaterGuy
          pose={st.pose}
          viewBox={VIEWBOX_GROUND}
          width={BOX_W}
          height={BOX_H}
          title="walking"
        />
      </div>

      {/* A street needs a bed, not just steps: city-night ambience gives the mix
          the density that lets the delivery pass reach -14 LUFS honestly,
          instead of straining a sparse transient track up to its ceiling. */}
      <Bed bed={AMBIENCE['city-night']} volume={0.55} />

      {/* footsteps are the point of the shot; the horn is a distant event */}
      <SfxLayer
        cues={[
          { f: 0, sfx: 'footsteps-gravel', vol: 0.9 },
          { f: 88, sfx: 'footsteps-gravel', vol: 0.9 },
          { f: 52, sfx: 'city-horn', vol: 0.35 },
        ]}
      />
    </AbsoluteFill>
  );
};
