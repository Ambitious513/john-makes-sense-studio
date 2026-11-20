import { useId } from 'react';
import type { ReactNode } from 'react';
import type { StickGuyProps, Palette, Pose } from './types';
import { DEFAULT_PALETTE, DEFAULT_VIEWBOX, RIG, clamp, resolvePose } from './rig';

/* ------------------------------------------------------------------ *
 * Geometry — traced from the reference sheet, expressed in rig units.
 * Left-side limbs are authored once and mirrored for the right side.
 * ------------------------------------------------------------------ */

const SLEEVE_FILL =
  'M 12,-34 C -20,-33 -52,-30 -80,-25 L -84,32 C -56,40 -22,45 12,46 Z';
const SLEEVE_EDGE =
  'M -3,-33 C -28,-32 -54,-29 -80,-25 L -84,32 C -58,39 -28,44 -3,45';
const FOREARM =
  'M 18,-24 C -20,-25 -56,-22 -84,-19 L -84,19 C -56,22 -20,25 18,24 Z';
const FOREARM_SHADE =
  'M -84,19 C -56,22 -20,25 18,24 L 18,17 C -20,18 -56,15 -84,12 Z';
const GLOVE =
  'M 14,-20 C -18,-25 -46,-28 -70,-24 C -92,-20 -106,-8 -105,6 ' +
  'C -104,17 -92,23 -74,22 L -64,21 C -68,32 -63,43 -54,41 ' +
  'C -44,39 -35,29 -29,20 C -16,20 2,18 14,16 Z';
const GLOVE_FINGER_1 = 'M -96,-4 C -84,-8 -70,-9 -58,-7';
const GLOVE_FINGER_2 = 'M -99,7 C -86,3 -70,2 -56,4';

const TORSO =
  'M 310,176 C 300,178 291,180 283,183 L 275,262 L 268,398 ' +
  'Q 345,412 422,398 L 415,262 L 407,183 C 399,180 390,178 380,176 ' +
  'C 373,191 317,191 310,176 Z';
const NECK = 'M 314,146 L 376,146 L 376,174 Q 345,193 314,174 Z';
const PELVIS =
  'M 272,382 L 418,382 L 415,428 Q 382,441 348,437 L 345,425 L 342,437 ' +
  'Q 308,441 275,428 Z';
const CROTCH = 'M 341,437 L 345,425 L 349,437';
const FLY = 'M 345,429 L 363,423';

const THIGH = 'M -44,-18 L 31,-18 L 26,124 L -38,124 Z';
const SHIN_FILL =
  'M -29,-26 L 37,-26 L 24,92 C 23,106 22,116 16,121 ' +
  'C 2,127 -24,127 -36,121 C -42,116 -43,106 -42,92 Z';
const SHIN_EDGE =
  'M -29,-26 L -42,92 C -43,106 -42,116 -36,121 ' +
  'C -24,127 2,127 16,121 C 22,116 23,106 24,92 L 37,-26';
const CUFF = 'M -41,106 C -22,115 4,115 23,106';
const SHOE_FULL =
  'M -28,-10 C -12,-17 8,-18 22,-11 C 33,-6 36,6 33,19 ' +
  'C 30,32 12,40 -12,41 C -36,42 -58,39 -68,32 ' +
  'C -77,26 -75,13 -65,7 C -53,0 -40,-3 -28,-10 Z';
const SHOE_UPPER =
  'M -28,-10 C -12,-17 8,-18 22,-11 C 33,-6 36,4 33,12 ' +
  'C 26,24 10,31 -12,32 C -36,33 -56,30 -66,24 ' +
  'C -74,19 -74,12 -65,7 C -53,0 -40,-3 -28,-10 Z';
const SHOE_SEAM = 'M 8,-13 C 0,-1 -12,7 -27,12';

const HEAD = RIG.head;
const EYE_R = 23.5;
const EYE_LX = 317;
const EYE_RX = 373;
const EYE_Y = 89;

/* Rotate a point around the origin (SVG convention: degrees, +y down). */
const rot2 = (x: number, y: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
};

/**
 * Reach points of a hand (wrist anchor + glove tip), using the exact FK chain
 * the <Arm/> renderer uses: shoulder → rotate(-arm) → elbow at -82 →
 * rotate(-elbow) → wrist at -84 → rotate(-wrist) → glove spans to -106.
 * Returns rig-space points (mirror for the right arm at the call site).
 */
const handPoints = (arm: number, elbow: number, wrist: number) => {
  const S = RIG.shoulderL;
  const [ex, ey] = rot2(-82, 0, -arm);
  const elbowX = S.x + ex;
  const elbowY = S.y + ey;
  const [wx, wy] = rot2(-84, 0, -arm - elbow);
  const [tx, ty] = rot2(-106, 0, -arm - elbow - wrist);
  return [
    { x: elbowX + wx, y: elbowY + wy },
    { x: elbowX + wx + tx, y: elbowY + wy + ty },
  ];
};

/** True when the hand overlaps the head circle — such an arm must paint ABOVE the head. */
const armOverHead = (arm: number, elbow: number, wrist: number): boolean =>
  handPoints(arm, elbow, wrist).some(
    (p) => Math.hypot(p.x - HEAD.x, p.y - HEAD.y) < HEAD.r + 30,
  );

/* ----------------------------- pieces ----------------------------- */

function Eye({
  cx,
  pose,
  c,
  sw,
  clipId,
}: {
  cx: number;
  pose: Pose;
  c: Palette;
  sw: number;
  clipId: string;
}) {
  const open = clamp(pose.eyeOpen, 0, 1);
  const lidY = EYE_Y - EYE_R + (1 - open) * EYE_R * 2;
  const dy = clamp(lidY - EYE_Y, -EYE_R, EYE_R);
  const halfChord = Math.sqrt(Math.max(EYE_R * EYE_R - dy * dy, 0));
  const attach = clamp((0.72 - open) / 0.22, 0, 1);
  const pupilR = 8 * clamp(pose.pupil, 0.25, 1.7);
  const px = cx + clamp(pose.lookX, -1, 1) * 8;
  const py =
    (1 - attach) * EYE_Y + attach * (lidY + 7) + clamp(pose.lookY, -1, 1) * 6;
  const closed = clamp((0.14 - open) / 0.14, 0, 1);

  return (
    <g>
      <g opacity={1 - closed}>
        <clipPath id={clipId}>
          <circle cx={cx} cy={EYE_Y} r={EYE_R} />
        </clipPath>
        <circle cx={cx} cy={EYE_Y} r={EYE_R} fill={c.skin} />
        <g clipPath={`url(#${clipId})`}>
          <circle cx={px} cy={py} r={pupilR} fill={c.ink} />
          <rect
            x={cx - EYE_R - 1}
            y={EYE_Y - EYE_R - 1}
            width={EYE_R * 2 + 2}
            height={Math.max(lidY - (EYE_Y - EYE_R) + 1, 0)}
            fill={c.lid}
          />
          <line
            x1={cx - halfChord}
            y1={lidY}
            x2={cx + halfChord}
            y2={lidY}
            stroke={c.ink}
            strokeWidth={sw * 1.15}
            strokeLinecap="round"
          />
        </g>
        <circle
          cx={cx}
          cy={EYE_Y}
          r={EYE_R}
          fill="none"
          stroke={c.ink}
          strokeWidth={sw * 0.85}
        />
      </g>
      {closed > 0 && (
        <path
          d={`M ${cx - EYE_R + 2},${EYE_Y - 2} Q ${cx},${EYE_Y + 12} ${cx + EYE_R - 2},${EYE_Y - 2}`}
          fill="none"
          stroke={c.ink}
          strokeWidth={sw}
          strokeLinecap="round"
          opacity={closed}
        />
      )}
    </g>
  );
}

function Mouth({
  pose,
  c,
  sw,
  clipId,
}: {
  pose: Pose;
  c: Palette;
  sw: number;
  clipId: string;
}) {
  const open = clamp(pose.mouthOpen, 0, 1);
  const smile = clamp(pose.mouthSmile, -1, 1);
  const w = 29 * clamp(pose.mouthWidth, 0.3, 1.5);
  const cx = 345;
  const cy = 128;
  const lx = cx - w;
  const rx = cx + w;
  const ly = cy - smile * 5;
  const ry = cy - smile * 7;
  const linePath = `M ${lx},${ly} Q ${cx},${cy + smile * 13 + 2} ${rx},${ry}`;
  const openPath =
    `M ${lx},${ly} Q ${cx},${cy - open * 6} ${rx},${ry} ` +
    `Q ${cx},${cy + smile * 11 + open * 32} ${lx},${ly} Z`;
  const fade = clamp(open / 0.12, 0, 1);
  const hook = clamp(smile, 0, 1) * (1 - fade);

  return (
    <g>
      {hook > 0.01 && (
        <path
          d={`M ${lx + 3},${ly + 1} q -4,-3 -2,-8`}
          fill="none"
          stroke={c.ink}
          strokeWidth={sw * 0.8}
          strokeLinecap="round"
          opacity={hook}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={c.ink}
        strokeWidth={sw * 1.05}
        strokeLinecap="round"
        opacity={1 - fade}
      />
      {fade > 0.01 && (
        <g opacity={fade}>
          <clipPath id={clipId}>
            <path d={openPath} />
          </clipPath>
          <path
            d={openPath}
            fill={c.mouth}
            stroke={c.ink}
            strokeWidth={sw * 0.9}
            strokeLinejoin="round"
          />
          <g clipPath={`url(#${clipId})`}>
            {pose.teeth > 0.02 && open > 0.05 && (
              <g opacity={clamp(pose.teeth, 0, 1)}>
                <rect
                  x={lx}
                  y={cy - open * 6}
                  width={w * 2}
                  height={open * 18}
                  fill={c.skin}
                />
                {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1={cx + (i * w) / 3.5}
                    y1={cy - open * 6}
                    x2={cx + (i * w) / 3.5}
                    y2={cy - open * 6 + open * 18}
                    stroke={c.ink}
                    strokeWidth={sw * 0.45}
                  />
                ))}
              </g>
            )}
            <ellipse
              cx={cx}
              cy={cy + smile * 11 + open * 32}
              rx={w * 0.62}
              ry={open * 13}
              fill={c.tongue}
              opacity={clamp((open - 0.4) / 0.3, 0, 1)}
            />
            <rect
              x={cx - w}
              y={cy - open * 8 - 2}
              width={w * 2}
              height={5}
              fill={c.skin}
              opacity={clamp((open - 0.25) / 0.3, 0, 1) * clamp(smile, 0, 1) * 0.9}
            />
          </g>
        </g>
      )}
      <path
        d="M 340,142 Q 349,147 357,141"
        fill="none"
        stroke={c.skinShade}
        strokeWidth={sw * 0.75}
        strokeLinecap="round"
      />
    </g>
  );
}

function Arm({
  c,
  sw,
  arm,
  elbow,
  wrist,
  slot,
  mirrored,
  debug,
}: {
  c: Palette;
  sw: number;
  arm: number;
  elbow: number;
  wrist: number;
  slot?: ReactNode;
  mirrored?: boolean;
  debug?: boolean;
}) {
  const S = RIG.shoulderL;
  return (
    <g transform={`rotate(${-arm} ${S.x} ${S.y})`}>
      <g transform={`translate(${S.x} ${S.y})`}>
        <g transform={`translate(-82 0) rotate(${-elbow})`}>
          <g transform={`translate(-84 0) rotate(${-wrist})`}>
            <path
              d={GLOVE}
              fill={c.glove}
              stroke={c.ink}
              strokeWidth={sw}
              strokeLinejoin="round"
            />
            <path
              d={GLOVE_FINGER_1}
              fill="none"
              stroke={c.skinShade}
              strokeWidth={sw * 0.5}
              strokeLinecap="round"
              opacity={0.32}
            />
            <path
              d={GLOVE_FINGER_2}
              fill="none"
              stroke={c.skinShade}
              strokeWidth={sw * 0.5}
              strokeLinecap="round"
              opacity={0.32}
            />
            {slot && (
              <g transform={mirrored ? 'scale(-1 1)' : undefined}>{slot}</g>
            )}
            {debug && <circle r={4} fill="#FF3D8A" />}
          </g>
          <path
            d={FOREARM}
            fill={c.skin}
            stroke={c.ink}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d={FOREARM_SHADE} fill={c.skinShade} opacity={0.85} />
          {debug && <circle r={4} fill="#35E0F2" />}
        </g>
        <path d={SLEEVE_FILL} fill={c.shirt} />
        <path
          d={SLEEVE_EDGE}
          fill="none"
          stroke={c.ink}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {debug && <circle r={5} fill="#C8FF3D" />}
      </g>
    </g>
  );
}

function Leg({
  c,
  sw,
  leg,
  knee,
  foot,
  debug,
}: {
  c: Palette;
  sw: number;
  leg: number;
  knee: number;
  foot: number;
  debug?: boolean;
}) {
  const H = RIG.hipL;
  return (
    <g transform={`rotate(${leg} ${H.x} ${H.y})`}>
      <g transform={`translate(${H.x} ${H.y})`}>
        <path
          d={THIGH}
          fill={c.pants}
          stroke={c.ink}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <g transform={`translate(-10 120) rotate(${-knee})`}>
          <g transform={`translate(-8 112) rotate(${foot})`}>
            <path
              d={SHOE_FULL}
              fill={c.sole}
              stroke={c.ink}
              strokeWidth={sw}
              strokeLinejoin="round"
            />
            <path
              d={SHOE_UPPER}
              fill={c.shoe}
              stroke={c.ink}
              strokeWidth={sw * 0.85}
              strokeLinejoin="round"
            />
            <path
              d={SHOE_SEAM}
              fill="none"
              stroke={c.ink}
              strokeWidth={sw * 0.7}
              strokeLinecap="round"
            />
            {debug && <circle r={4} fill="#FFB020" />}
          </g>
          <path d={SHIN_FILL} fill={c.pants} />
          <path
            d={SHIN_EDGE}
            fill="none"
            stroke={c.ink}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={CUFF}
            fill="none"
            stroke={c.ink}
            strokeWidth={sw * 0.8}
            strokeLinecap="round"
          />
          {debug && <circle r={4} fill="#35E0F2" />}
        </g>
        {debug && <circle r={5} fill="#C8FF3D" />}
      </g>
    </g>
  );
}

/* --------------------------- the character --------------------------- */

export function StickGuy({
  pose,
  palette,
  strokeWidth = 5,
  shadow = true,
  shadowOpacity = 0.16,
  debug = false,
  viewBox = DEFAULT_VIEWBOX,
  width = '100%',
  height = '100%',
  className,
  style,
  title = 'StickGuy character',
  handSlotL,
  handSlotR,
  headSlot,
  background,
}: StickGuyProps) {
  const p = resolvePose(pose);
  const c: Palette = { ...DEFAULT_PALETTE, ...palette };
  const raw = useId();
  const uid = 'sg' + raw.replace(/[^a-zA-Z0-9]/g, '');
  const sw = strokeWidth;

  const squash = clamp(p.squash, 0.5, 1.6);
  const sx = p.scale / Math.sqrt(squash);
  const sy = p.scale * squash;
  const lift = clamp(-p.y / 240, 0, 1);
  const shadowScale = p.scale * (1 - lift * 0.42) * (1 + (squash - 1) * 0.5);

  const root =
    `translate(${p.x} ${p.y}) ` +
    `translate(${RIG.centerX} ${RIG.groundY}) scale(${sx} ${sy}) ` +
    `translate(${-RIG.centerX} ${-RIG.groundY}) ` +
    `rotate(${p.lean} ${RIG.centerX} 420)`;

  const faceShift = clamp(p.headTurn, -1, 1) * 17;
  const faceSquash = 1 - Math.abs(clamp(p.headTurn, -1, 1)) * 0.14;
  const browY = -p.browRaise;
  const armFrontL = armOverHead(p.armL, p.elbowL, p.wristL);
  const armFrontR = armOverHead(p.armR, p.elbowR, p.wristR);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width}
      height={height}
      className={className}
      style={style}
      role="img"
      aria-label={title}
      shapeRendering="geometricPrecision"
    >
      <title>{title}</title>
      <defs>
        <clipPath id={`${uid}-head`}>
          <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r - sw / 2} />
        </clipPath>
      </defs>

      {background}

      {shadow && (
        <ellipse
          cx={RIG.centerX + p.x}
          cy={RIG.groundY + 8}
          rx={122 * shadowScale}
          ry={15 * shadowScale}
          fill={c.shadow}
          opacity={shadowOpacity * (1 - lift * 0.6)}
        />
      )}

      <g transform={root}>
        {/* legs */}
        <Leg c={c} sw={sw} leg={p.legL} knee={p.kneeL} foot={p.footL} debug={debug} />
        <g transform="translate(690 0) scale(-1 1)">
          <Leg c={c} sw={sw} leg={p.legR} knee={p.kneeR} foot={p.footR} debug={debug} />
        </g>

        {/* pelvis hides the leg roots */}
        <path d={PELVIS} fill={c.pants} />
        <path
          d={CROTCH}
          fill="none"
          stroke={c.ink}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d={FLY} fill="none" stroke={c.ink} strokeWidth={sw * 0.75} strokeLinecap="round" />

        {/* neck, then shirt over it */}
        <path d={NECK} fill={c.skinShade} stroke={c.ink} strokeWidth={sw} strokeLinejoin="round" />
        <path d={TORSO} fill={c.shirt} stroke={c.ink} strokeWidth={sw} strokeLinejoin="round" />

        {/* arms sit over the shirt so the shoulder seam disappears.
            An arm whose hand reaches the head paints AFTER the head instead. */}
        {(!armFrontL || !armFrontR) && (
          <>
            {!armFrontL && (
              <Arm c={c} sw={sw} arm={p.armL} elbow={p.elbowL} wrist={p.wristL} slot={handSlotL} debug={debug} />
            )}
            {!armFrontR && (
              <g transform="translate(690 0) scale(-1 1)">
                <Arm c={c} sw={sw} arm={p.armR} elbow={p.elbowR} wrist={p.wristR} slot={handSlotR} mirrored debug={debug} />
              </g>
            )}
          </>
        )}

        {/* head */}
        <g transform={`rotate(${p.headTilt} ${RIG.neck.x} ${RIG.neck.y}) translate(0 ${p.headBob})`}>
          <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={c.skin} />
          <g clipPath={`url(#${uid}-head)`}>
            <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={c.skinShade} />
            <circle cx={HEAD.x + 10} cy={HEAD.y - 10} r={HEAD.r} fill={c.skin} />
          </g>
          <circle
            cx={HEAD.x}
            cy={HEAD.y}
            r={HEAD.r}
            fill="none"
            stroke={c.ink}
            strokeWidth={sw * 1.1}
          />
          {/* costume/headwear slot — on the SKULL, not the face: it must not
              slide with headTurn (the features shift, a hat does not), and it
              sits under the features so it can never paint over the eyes. */}
          {headSlot}
          <g transform={`translate(${345 + faceShift} 0) scale(${faceSquash} 1) translate(-345 0)`}>
            {/* brows — browBend morphs the arc into an angry V */}
            <g transform={`translate(0 ${browY})`}>
              {[false, true].map((mirrored) => {
                const m = (v: number) => (mirrored ? 690 - v : v);
                const bx1 = 296 + (299 - 296) * (1 - p.browBend);
                const by1 = 46 + (58 - 46) * (1 - p.browBend);
                const qx = 314 + (312 - 314) * (1 - p.browBend);
                const qy = 56 + (44 - 56) * (1 - p.browBend);
                const bx2 = 334 + (331 - 334) * (1 - p.browBend);
                const by2 = 66 + (48 - 66) * (1 - p.browBend);
                const d = mirrored
                  ? `M ${m(bx2)},${by2} Q ${m(qx)},${qy} ${m(bx1)},${by1}`
                  : `M ${bx1},${by1} Q ${qx},${qy} ${bx2},${by2}`;
                return (
                  <path
                    key={mirrored ? 'browR' : 'browL'}
                    d={d}
                    fill="none"
                    stroke={c.ink}
                    strokeWidth={sw * 1.15}
                    strokeLinecap="round"
                    transform={
                      mirrored
                        ? `rotate(${-p.browTilt * (1 - p.browBend * 0.6)} 375 51)`
                        : `rotate(${p.browTilt * (1 - p.browBend * 0.6)} 315 51)`
                    }
                  />
                );
              })}
            </g>
            <Eye cx={EYE_LX} pose={p} c={c} sw={sw} clipId={`${uid}-eyeL`} />
            <Eye cx={EYE_RX} pose={p} c={c} sw={sw} clipId={`${uid}-eyeR`} />
            <Mouth pose={p} c={c} sw={sw} clipId={`${uid}-mouth`} />
            {p.sweat > 0.02 && (
              <g transform={`translate(424 ${54 + (1 - clamp(p.sweat, 0, 1)) * 10})`} opacity={clamp(p.sweat, 0, 1)}>
                <path
                  d="M 0,0 C -7,9 -8,15 -4,20 C -1,23 1,23 4,20 C 8,15 7,9 0,0 Z"
                  fill="#8FD8F2"
                  stroke={c.ink}
                  strokeWidth={sw * 0.55}
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
          {debug && (
            <circle cx={RIG.neck.x} cy={RIG.neck.y} r={5} fill="#FF3D8A" />
          )}
        </g>

        {/* raised hands paint above the head so they never hide behind it */}
        {armFrontL && (
          <Arm c={c} sw={sw} arm={p.armL} elbow={p.elbowL} wrist={p.wristL} slot={handSlotL} debug={debug} />
        )}
        {armFrontR && (
          <g transform="translate(690 0) scale(-1 1)">
            <Arm c={c} sw={sw} arm={p.armR} elbow={p.elbowR} wrist={p.wristR} slot={handSlotR} mirrored debug={debug} />
          </g>
        )}
      </g>

      {debug && (
        <g pointerEvents="none">
          <rect
            x={0}
            y={0}
            width={RIG.width}
            height={RIG.height}
            fill="none"
            stroke="#35E0F2"
            strokeWidth={1.5}
            strokeDasharray="8 8"
            opacity={0.5}
          />
          <line
            x1={-40}
            y1={RIG.groundY + 8}
            x2={730}
            y2={RIG.groundY + 8}
            stroke="#C8FF3D"
            strokeWidth={1.5}
            strokeDasharray="10 8"
            opacity={0.7}
          />
        </g>
      )}
    </svg>
  );
}

export default StickGuy;
