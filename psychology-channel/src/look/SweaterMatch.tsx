/**
 * SWEATER MATCH — fidelity harness against the supplied sheet.
 *
 * Renders ONE character per composition on a flat KEY COLOUR, with an explicit
 * pixel size (no flex, no labels). Keying rather than the sheet's paper is
 * deliberate: the character's skin is nearly the same colour as the paper, so a
 * paper background makes a threshold mask a hollow OUTLINE and the measurement
 * reads strokes instead of bodies. `tools/measure_sheet_fidelity.py` then
 * normalises both silhouettes to one height and reports IoU + the per-row
 * width profile, so the character is a measured match to the sheet.
 */
import React from 'react';
import { AbsoluteFill, Composition } from 'remotion';
import { SweaterGuy } from '../characters/SweaterGuy/SweaterGuy';
import type { Pose } from '../characters/StickGuy/types';

const KEY = '#F01FD4';
/** 1 rig unit = 1 px: the figure is 1000 tall inside a 1060-tall frame */
const VB = '-40 -20 480 1060';
const W = 480;
const H = 1060;

/** sheet fig1: standing, hands in pockets, head bowed, sad */
export const SHEET_FIG1_POSE: Partial<Pose> = {
  headTilt: -7,
  headTurn: -0.25,
  lookY: 0.4,
  eyeOpen: 0.5,
  browRaise: -2,
  browTilt: 9,
  mouthSmile: -0.4,
  mouthWidth: 0.8,
  armL: 86,
  armR: 86,
  elbowL: 24,
  elbowR: 24,
  wristL: -14,
  wristR: -14,
  legL: 0,
  legR: 0,
  footL: 0,
  footR: 0,
};

const Stage: React.FC<{ pose?: Partial<Pose>; title: string }> = ({ pose, title }) => (
  <AbsoluteFill style={{ background: KEY }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
      <SweaterGuy pose={pose} shadow={false} viewBox={VB} width={W} height={H} title={title} />
    </div>
  </AbsoluteFill>
);

export const SweaterMatch: React.FC = () => <Stage pose={SHEET_FIG1_POSE} title="ours, sheet fig1 pose" />;
export const SweaterNeutral: React.FC = () => <Stage title="ours, neutral" />;

export const SweaterMatchRoot: React.FC = () => (
  <>
    <Composition id="SweaterMatch" component={SweaterMatch} durationInFrames={30} fps={30} width={W} height={H} />
    <Composition id="SweaterNeutral" component={SweaterNeutral} durationInFrames={30} fps={30} width={W} height={H} />
  </>
);
