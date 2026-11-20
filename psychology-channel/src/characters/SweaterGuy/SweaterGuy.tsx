/**
 * SweaterGuy renderer — pure SVG, pure function of `pose`.
 *
 * Same paint order and the same limb transform chain as StickGuy
 * (`rotate(leg,hip) → translate(hip) → thigh → translate(thigh) →
 * rotate(-knee) → shin → translate(shin) → rotate(foot) → shoe`), which is why
 * the shared stance-locked gait in ../StickGuy/gait.ts drives this character
 * unchanged.
 *
 * Art dimensions are the measured ones (see rig.ts): the feet are drawn pointing
 * -x, and because the right side renders inside a mirrored group both feet splay
 * outward exactly like the sheet's standing figures.
 */
import React, { useId } from 'react';
import type { Pose } from '../StickGuy/types';
import {
  CENTER_X,
  FOREARM,
  GROUND,
  HEAD,
  NECK,
  PALETTE,
  SHOULDER_L,
  SKELETON,
  UPPER_ARM,
  clamp,
  resolve,
  type SweaterPalette,
} from './rig';

export interface SweaterGuyProps {
  pose?: Partial<Pose>;
  palette?: Partial<SweaterPalette>;
  /** outline thickness in figure units (4.5 ≈ the sheet's line weight at 1000 tall) */
  strokeWidth?: number;
  shadow?: boolean;
  debug?: boolean;
  viewBox?: string;
  width?: number | string;
  height?: number | string;
  title?: string;
}

/** leaves room for strides, swings and raised arms */
export const VIEWBOX = '-90 -40 580 1090';
/** tight box for silhouette comparison against the sheet */
export const VIEWBOX_SHEET = '-40 -20 480 1060';
/**
 * Ground-anchored box for set work: the viewBox bottom sits at y 1016, so the
 * figure's ground line (1000) maps to (1000+90)/1106 = 0.98553 of the element
 * height. Placing the element with `top = GROUND_Y - 0.98553 * height` puts the
 * soles exactly on a screen ground line — and the contact shadow still fits.
 */
export const VIEWBOX_GROUND = '-90 -90 580 1106';
export const GROUND_FRACTION = (1000 + 90) / 1106;

/* ------------------------------ line art -------------------------------- */

const THIGH = 'M -32,-16 L 32,-16 L 28,272 L -30,272 Z';
const SHIN = 'M -28,-10 L 28,-10 L 22,254 L -24,254 Z';
/** flat slip-on, 65 long x 58 tall (both measured): toe toward -x at -40,
 *  heel at +25, sole bottom at y = SOLE_DROP so the stance sits flat on the ground */
const SHOE =
  'M 25,2 C 25,-8 16,-12 4,-10 C -12,-8 -28,2 -36,14 C -40,22 -38,38 -30,46' +
  ' C -18,56 -2,58 12,54 C 21,50 25,26 25,2 Z';
const SHOE_SOAL = 'M -36,36 C -26,52 -4,56 12,50 C 20,47 24,42 25,32';

/** oversized boxy sweater: narrow shoulders (150 wide, measured u175-200)
 *  flaring to a wide chest (239 at u400) and hem — the sheet's silhouette */
const TORSO =
  'M 125,178 C 125,168 135,162 147,162 L 253,162 C 265,162 275,168 275,178' +
  ' C 300,242 322,338 323,414 C 324,438 312,448 296,448 L 104,448' +
  ' C 88,448 76,438 77,414 C 78,338 100,242 125,178 Z';
const HEM_BAND =
  'M 77,424 C 130,436 270,436 323,424 C 323,436 312,446 296,446 L 104,446' +
  ' C 88,446 77,436 77,424 Z';
const COLLAR =
  'M 182,136 C 182,126 190,121 200,121 C 210,121 218,126 218,136 L 218,164' +
  ' C 218,174 210,178 200,178 C 190,178 182,174 182,164 Z';

const SLEEVE_UPPER = `M 6,-22 L ${-UPPER_ARM + 2},-18 L ${-UPPER_ARM + 2},18 L 6,22 Z`;
const SLEEVE_FORE = `M 4,-18 L ${-FOREARM},-14 L ${-FOREARM},14 L 4,18 Z`;
const CUFF = `M ${-FOREARM - 5},-16 L ${-FOREARM + 5},-16 L ${-FOREARM + 5},16 L ${-FOREARM - 5},16 Z`;
/** relaxed hand, fingers toward -x */
const HAND = 'M 2,-15 C -11,-18 -27,-14 -34,-5 C -37,1 -34,9 -24,12 C -12,15 0,13 2,5 Z';

/** messy cap on the skull, jagged hairline, three cowlick tufts */
const HAIR =
  'M 137,76 C 131,28 162,-1 200,-1 C 238,-1 269,28 263,76' +
  ' L 252,52 L 240,68 L 228,44 L 212,64 L 200,38 L 188,64 L 172,44 L 160,68 L 148,52 Z';
const TUFTS = 'M 158,18 L 148,-6 L 172,8 Z M 191,2 L 200,-22 L 214,2 Z M 234,12 L 250,-6 L 250,20 Z';

/* ------------------------------- parts ---------------------------------- */

function Leg({
  c,
  sw,
  leg,
  knee,
  foot,
  debug,
}: {
  c: SweaterPalette;
  sw: number;
  leg: number;
  knee: number;
  foot: number;
  debug?: boolean;
}) {
  const H = SKELETON.hipL;
  const T = SKELETON.thigh;
  const S = SKELETON.shin;
  return (
    <g transform={`rotate(${leg} ${H.x} ${H.y})`}>
      <g transform={`translate(${H.x} ${H.y})`}>
        <path d={THIGH} fill={c.pants} stroke={c.ink} strokeWidth={sw} strokeLinejoin="round" />
        <g transform={`translate(${T.x} ${T.y}) rotate(${-knee})`}>
          <g transform={`translate(${S.x} ${S.y}) rotate(${foot})`}>
            <path d={SHOE} fill={c.shoe} stroke={c.ink} strokeWidth={sw} strokeLinejoin="round" />
            <path
              d={SHOE_SOAL}
              fill="none"
              stroke={c.ink}
              strokeWidth={sw * 0.7}
              strokeLinecap="round"
              opacity={0.8}
            />
            {debug && <circle r={5} fill="#FFB020" />}
          </g>
          <path d={SHIN} fill={c.pants} stroke={c.ink} strokeWidth={sw} strokeLinejoin="round" />
          {debug && <circle r={5} fill="#35E0F2" />}
        </g>
        {debug && <circle r={5} fill="#C8FF3D" />}
      </g>
    </g>
  );
}

function Arm({
  c,
  sw,
  arm,
  elbow,
  wrist,
  debug,
}: {
  c: SweaterPalette;
  sw: number;
  arm: number;
  elbow: number;
  wrist: number;
  debug?: boolean;
}) {
  const S = SHOULDER_L;
  return (
    <g transform={`rotate(${-arm} ${S.x} ${S.y})`}>
      <g transform={`translate(${S.x} ${S.y})`}>
        <path
          d={SLEEVE_UPPER}
          fill={c.sweater}
          stroke={c.ink}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <g transform={`translate(${-UPPER_ARM} 0) rotate(${-elbow})`}>
          <g transform={`translate(${-FOREARM} 0) rotate(${-wrist})`}>
            <path d={HAND} fill={c.skin} stroke={c.ink} strokeWidth={sw} strokeLinejoin="round" />
            {[-8, 2].map((fy) => (
              <path
                key={fy}
                d={`M -30,${fy} q -6,2 -9,5`}
                fill="none"
                stroke={c.ink}
                strokeWidth={sw * 0.5}
                strokeLinecap="round"
                opacity={0.75}
              />
            ))}
            {debug && <circle r={4} fill="#FF3D8A" />}
          </g>
          <path
            d={SLEEVE_FORE}
            fill={c.sweater}
            stroke={c.ink}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d={CUFF} fill={c.sweaterRib} stroke={c.ink} strokeWidth={sw * 0.65} />
          {debug && <circle r={4} fill="#35E0F2" />}
        </g>
        {debug && <circle r={5} fill="#C8FF3D" />}
      </g>
    </g>
  );
}

/** The sheet's face is minimal: dot eyes, short brows, a tick of a nose, a line mouth. */
function Face({ p, c, sw }: { p: Pose; c: SweaterPalette; sw: number }) {
  const open = clamp(p.eyeOpen, 0, 1);
  const eyeR = 6.5 * clamp(p.pupil, 0.4, 1.7);
  const eyeH = eyeR * open;
  const closed = open < 0.18;
  const eyeY = 74 + clamp(p.lookY, -1, 1) * 3;
  const browY = 50 - p.browRaise * 0.7;
  const mw = 15 * clamp(p.mouthWidth, 0.4, 1.4);
  const smile = clamp(p.mouthSmile, -1, 1);
  const mo = clamp(p.mouthOpen, 0, 1);

  return (
    <g>
      {[-1, 1].map((side) => (
        <path
          key={side}
          d={`M ${200 + side * 30},${browY + 3} Q ${200 + side * 20},${browY - 4} ${200 + side * 11},${browY + 1}`}
          fill="none"
          stroke={c.ink}
          strokeWidth={sw * 1.1}
          strokeLinecap="round"
          transform={`rotate(${-side * p.browTilt * 0.5} ${200 + side * 20} ${browY})`}
        />
      ))}
      {[-1, 1].map((side) => {
        const ex = 200 + side * 20 + clamp(p.lookX, -1, 1) * 5;
        return closed ? (
          <path
            key={side}
            d={`M ${ex - eyeR},${eyeY} Q ${ex},${eyeY + 4} ${ex + eyeR},${eyeY}`}
            fill="none"
            stroke={c.ink}
            strokeWidth={sw * 0.85}
            strokeLinecap="round"
          />
        ) : (
          <ellipse key={side} cx={ex} cy={eyeY} rx={eyeR} ry={eyeH} fill={c.ink} />
        );
      })}
      <path
        d="M 200,82 q 3,6 -1,8"
        fill="none"
        stroke={c.ink}
        strokeWidth={sw * 0.7}
        strokeLinecap="round"
        opacity={0.9}
      />
      {mo > 0.05 ? (
        <g>
          <path
            d={`M ${200 - mw},96 Q 200,${96 + smile * 7 - mo * 3} ${200 + mw},96
                Q 200,${96 + mo * 18 + smile * 5} ${200 - mw},96 Z`}
            fill={c.ink}
            stroke={c.ink}
            strokeWidth={sw * 0.5}
            strokeLinejoin="round"
          />
          {p.teeth > 0.02 && (
            <rect
              x={200 - mw * 0.8}
              y={97}
              width={mw * 1.6}
              height={3 + mo * 3}
              fill={c.skin}
              opacity={clamp(p.teeth, 0, 1)}
            />
          )}
        </g>
      ) : (
        <path
          d={`M ${200 - mw},96 Q 200,${96 + smile * 10} ${200 + mw},96`}
          fill="none"
          stroke={c.ink}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      )}
      {p.sweat > 0.02 && (
        <g
          transform={`translate(266 ${44 + (1 - clamp(p.sweat, 0, 1)) * 8})`}
          opacity={clamp(p.sweat, 0, 1)}
        >
          <path
            d="M 0,0 C -6,8 -7,13 -3,17 C -1,19 1,19 3,17 C 7,13 6,8 0,0 Z"
            fill="#8FD8F2"
            stroke={c.ink}
            strokeWidth={sw * 0.5}
          />
        </g>
      )}
    </g>
  );
}

/* ----------------------------- the figure -------------------------------- */

export const SweaterGuy: React.FC<SweaterGuyProps> = ({
  pose,
  palette,
  strokeWidth = 4.5,
  shadow = true,
  debug = false,
  viewBox = VIEWBOX,
  width = '100%',
  height = '100%',
  title = 'SweaterGuy character',
}) => {
  const p = resolve(pose);
  const c: SweaterPalette = { ...PALETTE, ...(palette ?? {}) };
  const uid = 'sguy' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const sw = strokeWidth;

  const squash = clamp(p.squash, 0.5, 1.6);
  const sx = p.scale / Math.sqrt(squash);
  const sy = p.scale * squash;

  const root =
    `translate(${p.x} ${p.y}) ` +
    `translate(${CENTER_X} ${GROUND}) scale(${sx} ${sy}) translate(${-CENTER_X} ${-GROUND}) ` +
    `rotate(${p.lean} ${CENTER_X} ${SKELETON.hipL.y})`;

  const faceShift = clamp(p.headTurn, -1, 1) * 13;
  const faceSquash = 1 - Math.abs(clamp(p.headTurn, -1, 1)) * 0.14;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width={width} height={height}>
      <title>{title}</title>
      {shadow && (
        <ellipse
          cx={CENTER_X + p.x}
          cy={GROUND + p.y * 0.2}
          rx={118 * sx}
          ry={15 * sx}
          fill={c.shadow}
          opacity={0.9}
        />
      )}
      <g transform={root}>
        {/* far leg first (mirrored), then near leg, then the hem covers both roots */}
        <g transform={`translate(${2 * CENTER_X} 0) scale(-1 1)`}>
          <Leg c={c} sw={sw} leg={p.legR} knee={p.kneeR} foot={p.footR} debug={debug} />
        </g>
        <Leg c={c} sw={sw} leg={p.legL} knee={p.kneeL} foot={p.footL} debug={debug} />

        <path
          d={`M ${NECK.x - 14},${NECK.y} L ${NECK.x + 14},${NECK.y} L ${NECK.x + 14},${NECK.y + 44} L ${NECK.x - 14},${NECK.y + 44} Z`}
          fill={c.skinShade}
          stroke={c.ink}
          strokeWidth={sw}
        />
        <path d={TORSO} fill={c.sweater} stroke={c.ink} strokeWidth={sw} strokeLinejoin="round" />
        <path d={HEM_BAND} fill={c.sweaterShade} opacity={0.85} />
        <path d={COLLAR} fill={c.sweaterRib} stroke={c.ink} strokeWidth={sw} strokeLinejoin="round" />

        {/* head */}
        <g transform={`rotate(${p.headTilt} ${NECK.x} ${NECK.y}) translate(0 ${p.headBob})`}>
          <clipPath id={`${uid}-head`}>
            <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} />
          </clipPath>
          <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={c.skin} />
          <g clipPath={`url(#${uid}-head)`}>
            <circle cx={HEAD.x - 10} cy={HEAD.y + 10} r={HEAD.r} fill={c.skinShade} opacity={0.3} />
          </g>
          {[-1, 1].map((side) => (
            <ellipse
              key={side}
              cx={HEAD.x + side * 58}
              cy={HEAD.y + 8}
              rx={9}
              ry={13}
              fill={c.skin}
              stroke={c.ink}
              strokeWidth={sw}
            />
          ))}
          <circle
            cx={HEAD.x}
            cy={HEAD.y}
            r={HEAD.r}
            fill="none"
            stroke={c.ink}
            strokeWidth={sw * 1.05}
          />
          <g
            transform={`translate(${HEAD.x + faceShift} 0) scale(${faceSquash} 1) translate(${-HEAD.x} 0)`}
          >
            <Face p={p} c={c} sw={sw} />
            <path d={TUFTS} fill={c.hair} stroke={c.ink} strokeWidth={sw * 0.8} strokeLinejoin="round" />
            <path d={HAIR} fill={c.hair} stroke={c.ink} strokeWidth={sw} strokeLinejoin="round" />
          </g>
        </g>

        {/* arms last: sleeves read over the sweater body */}
        <g transform={`translate(${2 * CENTER_X} 0) scale(-1 1)`}>
          <Arm c={c} sw={sw} arm={p.armR} elbow={p.elbowR} wrist={p.wristR} debug={debug} />
        </g>
        <Arm c={c} sw={sw} arm={p.armL} elbow={p.elbowL} wrist={p.wristL} debug={debug} />
      </g>
    </svg>
  );
};
