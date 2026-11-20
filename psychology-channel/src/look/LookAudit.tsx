/**
 * LOOK AUDIT — our rendered StickGuy laid out exactly like the reference
 * character sheet: Front / ¾ / Side views, the 8 canonical expressions,
 * and the canon poses. Purpose: see the gap between what we render and
 * what the sheet dictates, so the character's LOOK becomes a decision,
 * not an accident.
 */

import React from 'react';
import { AbsoluteFill, Composition } from 'remotion';
import { StickGuy } from '../characters/StickGuy/StickGuy';
import { T_POSE } from '../characters/StickGuy/rig';
import type { Pose } from '../characters/StickGuy/types';

const BG = '#EDE7DA';
const INK = '#2A2622';

/** neutral standing pose, arms relaxed */
const STAND: Partial<Pose> = {
  armL: 78,
  armR: 78,
  elbowL: 10,
  elbowR: 10,
  wristL: -4,
  wristR: -4,
  mouthSmile: 0.1,
};

const EXPRESSIONS: Array<{ name: string; pose: Partial<Pose> }> = [
  { name: 'Neutral', pose: {} },
  {
    name: 'Happy',
    pose: { mouthSmile: 1, mouthOpen: 0.12, eyeOpen: 0.72, browRaise: 2 },
  },
  {
    name: 'Sad',
    pose: { mouthSmile: -0.85, browTilt: 12, eyeOpen: 0.65, lookY: -0.35, headTilt: 4 },
  },
  {
    name: 'Angry',
    pose: { browTilt: -16, browBend: 1, mouthSmile: -0.5, mouthWidth: 1.1, eyeOpen: 0.9 },
  },
  {
    name: 'Surprised',
    pose: { browRaise: 9, eyeOpen: 1, mouthOpen: 0.9, mouthWidth: 0.8, pupil: 0.75 },
  },
  {
    name: 'Tired',
    pose: { eyeOpen: 0.3, browRaise: -4, mouthSmile: -0.1, headTilt: 7, headBob: 4 },
  },
  {
    name: 'Skeptical',
    pose: { eyeOpen: 0.55, mouthSmile: 0.3, mouthWidth: 0.72, headTilt: -5, lookX: 0.6, browRaise: 3 },
  },
  {
    name: 'Thinking',
    pose: { lookX: -0.75, lookY: 0.25, mouthWidth: 0.65, mouthSmile: 0, browRaise: 4, pupil: 0.85 },
  },
];

const VIEWS: Array<{ name: string; pose: Partial<Pose> }> = [
  { name: 'FRONT', pose: { headTurn: 0 } },
  { name: '3/4', pose: { headTurn: -0.5, lookX: -0.4 } },
  { name: 'SIDE', pose: { headTurn: -0.95, lookX: -0.8 } },
];

const Cell: React.FC<{ label: string; pose: Partial<Pose>; scale: number; w: number }> = ({
  label,
  pose,
  scale,
  w,
}) => (
  <div style={{ width: w, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ height: 360 * scale, width: '100%', overflow: 'visible' }}>
      <div
        style={{
          width: 312,
          height: 360,
          transform: `scale(${scale}) translate(${(312 / 2) * (1 / scale - 1)}px, 0)`,
          transformOrigin: '0 0',
        }}
      >
        <StickGuy pose={{ ...STAND, ...pose }} shadow={false} />
      </div>
    </div>
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 17,
        letterSpacing: 1,
        color: INK,
        marginTop: 12,
      }}
    >
      {label}
    </div>
  </div>
);

const Row: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 10 }}>
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 20,
        letterSpacing: 3,
        color: '#8A8070',
        marginBottom: 6,
      }}
    >
      {title}
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      {children}
    </div>
  </div>
);

export const LookAudit: React.FC = () => (
  <AbsoluteFill style={{ background: BG, padding: '18px 0' }}>
    <Row title="VIEWS">
      {VIEWS.map((v) => (
        <Cell key={v.name} label={v.name} pose={v.pose} scale={0.6} w={340} />
      ))}
    </Row>
    <Row title="EXPRESSIONS">
      {EXPRESSIONS.map((e) => (
        <Cell key={e.name} label={e.name} pose={e.pose} scale={0.42} w={230} />
      ))}
    </Row>
    <Row title="POSES">
      <Cell label="T-POSE" pose={T_POSE} scale={0.5} w={340} />
      <Cell
        label="HANDS ON HIPS"
        pose={{ armL: 20, armR: 20, elbowL: 90, elbowR: 90, wristL: -10, wristR: -10 }}
        scale={0.5}
        w={340}
      />
      <Cell label="IDLE" pose={{}} scale={0.5} w={340} />
    </Row>
  </AbsoluteFill>
);

export const LookAuditRoot: React.FC = () => (
  <Composition
    id="LookAudit"
    component={LookAudit}
    durationInFrames={30}
    fps={30}
    width={1920}
    height={1080}
  />
);

/* ------------------------- style variants ------------------------- */

import { RedHeadband, RedBeanie } from '../characters/SetKit/SetKit';

const HEAD_BOX = '238 -12 214 214';

const VariantsRow: React.FC<{ title: string; headBox?: boolean }> = ({ title, headBox }) => (
  <div style={{ marginBottom: 14 }}>
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 20,
        letterSpacing: 3,
        color: '#8A8070',
        marginBottom: 6,
      }}
    >
      {title}
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 30 }}>
      {VARIANTS.map((v) => (
        <div
          key={v.name}
          style={{ width: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={{ height: headBox ? 200 : 288, width: '100%' }}>
            <div
              style={{
                width: 312,
                height: 360,
                transform: `scale(${headBox ? 1.0 : 0.8}) translate(${(312 / 2) * (1 / (headBox ? 1 : 0.8) - 1)}px, 0)`,
                transformOrigin: '0 0',
              }}
            >
              <StickGuy
                pose={STAND}
                shadow={false}
                palette={v.palette}
                viewBox={headBox ? HEAD_BOX : undefined}
                headSlot={v.slot}
              />
            </div>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 17, color: INK, marginTop: 14 }}>
            {v.name}
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface Variant {
  name: string;
  palette?: Partial<import('../characters/StickGuy/types').Palette>;
  slot?: React.ReactNode;
}

const VARIANTS: Variant[] = [
  { name: 'A · BASELINE (today)' },
  { name: 'B · RED HEADBAND', slot: <RedHeadband /> },
  { name: 'C · RED BEANIE', slot: <RedBeanie /> },
  {
    name: 'D · CONTRAST PANTS',
    palette: { pants: '#4A505C', shoe: '#31353D' },
  },
];

export const LookVariants: React.FC = () => (
  <AbsoluteFill style={{ background: BG, padding: '20px 0' }}>
    <VariantsRow title="FULL BODY" />
    <VariantsRow title="HEAD CLOSE-UP" headBox />
  </AbsoluteFill>
);

export const LookVariantsRoot: React.FC = () => (
  <Composition
    id="LookVariants"
    component={LookVariants}
    durationInFrames={30}
    fps={30}
    width={1920}
    height={1080}
  />
);

/* ----------------------------- eye study ----------------------------- */

const EyeCell: React.FC<{ label: string; pose: Partial<Pose> }> = ({ label, pose }) => (
  <div style={{ width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ height: 214, width: '100%' }}>
      <div style={{ width: 312, height: 360, transformOrigin: '0 0' }}>
        <StickGuy pose={pose} shadow={false} viewBox={HEAD_BOX} />
      </div>
    </div>
    <div style={{ fontFamily: 'monospace', fontSize: 16, color: INK, marginTop: 10 }}>{label}</div>
  </div>
);

const EYES: Array<{ label: string; pose: Partial<Pose> }> = [
  { label: 'eyeOpen 0.5 (today\u2019s default)', pose: { eyeOpen: 0.5 } },
  { label: 'eyeOpen 0.7', pose: { eyeOpen: 0.7 } },
  { label: 'eyeOpen 0.9', pose: { eyeOpen: 0.9 } },
  { label: 'eyeOpen 0.9 · pupil 1.35 · brows -3', pose: { eyeOpen: 0.9, pupil: 1.35, browRaise: -3 } },
];

export const EyeStudy: React.FC = () => (
  <AbsoluteFill style={{ background: BG, padding: '26px 0' }}>
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 22,
        letterSpacing: 3,
        color: '#8A8070',
        margin: '0 0 16px 20px',
      }}
    >
      RESTING-FACE STUDY — head close-up (viewBox {HEAD_BOX})
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
      {EYES.map((e) => (
        <EyeCell key={e.label} label={e.label} pose={{ mouthSmile: 0.1, ...e.pose }} />
      ))}
    </div>
  </AbsoluteFill>
);

export const EyeStudyRoot: React.FC = () => (
  <Composition
    id="EyeStudy"
    component={EyeStudy}
    durationInFrames={30}
    fps={30}
    width={1920}
    height={1080}
  />
);

/* ------------------------- head-slot audit ------------------------- */

/**
 * Costume slots are drawn LAST (over the face), so each one has to be checked
 * for occlusion: a brim on the eye line hides pupils, and a hidden pupil reads
 * as a dead character. This composition renders the head large and unobstructed
 * so `out/look/measure_slots.py` can count ink inside the eye band per slot.
 */
const SLOT_POSE: Partial<Pose> = { mouthSmile: 0.55 };
const SLOT_SCALE = 1.35;
const SIDE: Partial<Pose> = { headTurn: -0.95, lookX: -0.8 };

const SlotPanel: React.FC<{ label: string; slot?: React.ReactNode; view?: Partial<Pose> }> = ({
  label,
  slot,
  view,
}) => (
  <div style={{ width: 440, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ width: 312 * SLOT_SCALE, height: 312 * SLOT_SCALE, position: 'relative' }}>
      <div
        style={{ width: 312, height: 360, transform: `scale(${SLOT_SCALE})`, transformOrigin: '0 0' }}
      >
        <StickGuy
          pose={{ ...STAND, ...SLOT_POSE, ...view }}
          shadow={false}
          viewBox={HEAD_BOX}
          headSlot={slot}
        />
      </div>
    </div>
    <div style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 2, color: INK, marginTop: 6 }}>
      {label}
    </div>
  </div>
);

export const HeadSlotAudit: React.FC = () => (
  <AbsoluteFill style={{ background: BG, padding: '14px 0' }}>
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 20,
        letterSpacing: 3,
        color: '#8A8070',
        margin: '0 0 4px 20px',
      }}
    >
      HEAD-SLOT AUDIT — eye band must stay clear, front AND profile
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
      <SlotPanel label="FRONT · NONE" />
      <SlotPanel label="SIDE · NONE" view={SIDE} />
      <SlotPanel label="FRONT · BEANIE" slot={<RedBeanie />} />
      <SlotPanel label="SIDE · BEANIE" slot={<RedBeanie />} view={SIDE} />
      <SlotPanel label="FRONT · BAND" slot={<RedHeadband />} />
      <SlotPanel label="SIDE · BAND" slot={<RedHeadband />} view={SIDE} />
    </div>
  </AbsoluteFill>
);

export const HeadSlotAuditRoot: React.FC = () => (
  <Composition
    id="HeadSlotAudit"
    component={HeadSlotAudit}
    durationInFrames={30}
    fps={30}
    width={2720}
    height={600}
  />
);
