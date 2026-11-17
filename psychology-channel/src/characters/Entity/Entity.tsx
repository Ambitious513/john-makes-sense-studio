import { useId } from 'react';
import type { CSSProperties } from 'react';
import type { EntityPose } from './types';
import { resolveEntityPose } from './types';

/**
 * Entity — the silhouette antagonist.
 *
 * Pure SVG, deterministic, no fonts, no images. The body is a union of black
 * shapes (no outline — it IS the outline); everything the viewer reads is
 * posture, size and the red glow. #E8392F is the study's accent red.
 */

export const ENTITY_VIEWBOX = '-80 -140 850 880';

/* Geometry (rig units, 690 x 700 — same box as StickGuy, ground at y 672). */
const HEAD = { x: 345, y: 112, r: 92 };
const SHOULDER = { x: 272, y: 252 }; // left arm pivot; right arm mirrors
const GROUND = 672;
const HIP = { x: 345, y: 470 };

/* Torso + legs as one closed silhouette. Head overlaps the shoulder curve. */
const BODY =
  'M 250,232 C 282,204 312,196 345,196 C 378,196 408,204 440,232 ' +
  'C 452,300 444,364 420,424 C 414,452 426,472 424,504 L 424,638 ' +
  'Q 424,664 398,664 L 366,664 Q 350,664 350,648 L 350,548 ' +
  'Q 345,534 340,548 L 340,648 Q 340,664 324,664 L 292,664 ' +
  'Q 266,664 266,638 L 266,504 C 264,472 276,452 270,424 ' +
  'C 246,364 238,300 250,232 Z';

/* One tapered hanging arm, drawn from the shoulder pivot pointing down. */
const ARM =
  'M 6,-14 C -18,26 -30,74 -27,124 C -26,144 -8,146 -5,128 ' +
  'C -4,86 2,44 16,0 Z';

const EYE_LX = 313;
const EYE_RX = 377;
const EYE_Y = 98;
const RED = '#E8392F';

export interface EntityProps {
  pose: EntityPose;
  width?: number;
  height?: number;
  viewBox?: string;
  className?: string;
  style?: CSSProperties;
}

export const Entity: React.FC<EntityProps> = ({
  pose: raw,
  width = 690,
  height = 700,
  viewBox = ENTITY_VIEWBOX,
  className,
  style,
}) => {
  const uid = useId().replace(/:/g, '');
  const p = resolveEntityPose(raw);
  const glow = Math.max(0, p.glow);

  /* cower: the whole body hunches — spine bows, head sinks, arms wrap in */
  const cower = Math.max(0, Math.min(1, p.cower));

  const bodyScaleY = 1 - 0.12 * cower;
  const headDy = 30 * cower;
  const cowerLean = 8 * cower;

  /* arm angle: outward from hanging (0) to raised over-head (>1);
     cower swings the arms inward across the front.
     With the shoulder-local transform, LEFT-arm outward = clockwise = + */
  const armAngle =
    p.armSpread * 100 - cower * 62;

  const scaleT =
    `translate(${p.x} ${p.y}) ` +
    `translate(345 ${GROUND}) scale(${p.scale}) translate(-345 ${-GROUND})`;

  const root =
    `${scaleT} rotate(${p.lean + cowerLean} ${HIP.x} ${HIP.y})`;

  const eyeRy = 2 + Math.max(0.08, Math.min(1, p.eyeOpen)) * 14;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width}
      height={height}
      className={className}
      style={style}
      role="img"
      aria-label="The Entity"
    >
      <title>The Entity</title>
      <defs>
        <radialGradient id={`${uid}-aura`} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor={RED} stopOpacity={0.5} />
          <stop offset="45%" stopColor={RED} stopOpacity={0.16} />
          <stop offset="78%" stopColor={RED} stopOpacity={0} />
        </radialGradient>
        <filter id={`${uid}-blur`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* soft red aura bleeding into the black — the silhouette's only definition */}
      <g transform={root}>
        <ellipse
          cx={345}
          cy={380}
          rx={430}
          ry={500}
          fill={`url(#${uid}-aura)`}
          opacity={Math.min(1.4, glow)}
        />
        <ellipse
          cx={HEAD.x}
          cy={HEAD.y}
          rx={250}
          ry={250}
          fill={`url(#${uid}-aura)`}
          opacity={0.5 * Math.min(1.4, glow)}
        />

        {/* body squash for the cower */}
        <g transform={`translate(0 ${(1 - bodyScaleY) * GROUND}) scale(1 ${bodyScaleY})`}>
          {/* arms behind the body plane — translated TO the shoulder first,
              then rotated around it (the path is authored near the origin) */}
          <g transform={`translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${armAngle})`}>
            <path d={ARM} fill="#000000" stroke={RED} strokeWidth={3} strokeOpacity={0.16 * p.rim} />
          </g>
          <g transform="translate(690 0) scale(-1 1)">
            <g transform={`translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${armAngle})`}>
              <path d={ARM} fill="#000000" stroke={RED} strokeWidth={3} strokeOpacity={0.16 * p.rim} />
            </g>
          </g>

          {/* torso + legs */}
          <path d={BODY} fill="#000000" stroke={RED} strokeWidth={3} strokeOpacity={0.2 * p.rim} />
        </g>

        {/* head */}
        <g transform={`translate(0 ${headDy}) rotate(${p.headTilt + 10 * cower} ${HEAD.x} ${HEAD.y + headDy})`}>
          <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill="#000000" stroke={RED} strokeWidth={3} strokeOpacity={0.2 * p.rim} />

          {/* eye slits — glow copy + crisp copy */}
          {[EYE_LX, EYE_RX].map((ex) => (
            <g key={ex}>
              <ellipse
                cx={ex}
                cy={EYE_Y}
                rx={14}
                ry={eyeRy}
                fill={RED}
                opacity={0.9 * Math.min(1.4, glow)}
                filter={`url(#${uid}-blur)`}
              />
              <ellipse cx={ex} cy={EYE_Y} rx={13} ry={eyeRy} fill={RED} />
            </g>
          ))}

          {/* thin red smile — tempting only, never animates */}
          {p.smile > 0.02 && (
            <g opacity={Math.min(1, p.smile)}>
              <path
                d="M 313,152 Q 345,166 377,152"
                fill="none"
                stroke={RED}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={0.55}
                filter={`url(#${uid}-blur)`}
              />
              <path
                d="M 313,152 Q 345,166 377,152"
                fill="none"
                stroke={RED}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};
