// ============================================================
// LUST FILM — actors: MainChar (multi-pose), Entity, Friend
// Skeleton (y=0 is ground contact):
//   feet 0 · hips -110 · shoulders -232 · head center -280 (r≈50)
// ============================================================
import React from 'react';
import { C } from './theme';

const OUT = '#18181C'; // outline ink
const LINE_W = 5;

// ------------------------------------------------------------
// FACE — eyes / brows / mouth / sweat (cy = head center)
// ------------------------------------------------------------
export type FaceOpts = {
  eyes?: 'open' | 'closed' | 'half' | 'wide' | 'glanceL' | 'glanceR' | 'tired';
  brows?: 'angry' | 'flat' | 'sad' | 'worried' | 'none';
  mouth?: 'line' | 'smile' | 'smirk' | 'frown' | 'O' | 'grit';
  sweat?: boolean;
  cx?: number; // face center x
  cy?: number; // face center y
  r?: number; // head radius
  flip?: boolean;
};

export const Face: React.FC<FaceOpts> = ({
  eyes = 'open',
  brows = 'flat',
  mouth = 'line',
  sweat = false,
  cx = 0,
  cy = 0,
  r = 52,
  flip = false,
}) => {
  const ex = cx + (flip ? r * 0.28 : -r * 0.02) * 1;
  const ey = cy - r * 0.08;
  const dx = r * 0.24;
  const s = flip ? -1 : 1;

  const eyeEls: React.ReactNode[] = [];
  for (const dir of [-1, 1]) {
    const x = ex + dir * dx;
    if (eyes === 'closed') {
      eyeEls.push(<path key={dir} d={`M ${x - 12} ${ey} Q ${x} ${ey + 8} ${x + 12} ${ey}`} stroke={OUT} strokeWidth={6} fill="none" strokeLinecap="round" />);
    } else if (eyes === 'half' || eyes === 'tired') {
      eyeEls.push(
        <g key={dir}>
          <rect x={x - 13} y={ey - 7} width={26} height={9} rx={4.5} fill={OUT} />
          <path d={`M ${x - 13} ${ey + 6} Q ${x} ${ey + 11} ${x + 13} ${ey + 6}`} stroke={OUT} strokeWidth={4} fill="none" />
        </g>,
      );
    } else if (eyes === 'wide') {
      eyeEls.push(<circle key={dir} cx={x} cy={ey} r={9} fill={OUT} />);
    } else if (eyes === 'glanceL' || eyes === 'glanceR') {
      const gx = x + (eyes === 'glanceR' ? 7 : -7) * s;
      eyeEls.push(<circle key={dir} cx={gx} cy={ey} r={7.5} fill={OUT} />);
    } else {
      eyeEls.push(<circle key={dir} cx={x} cy={ey} r={7.5} fill={OUT} />);
    }
  }

  const browY = ey - r * 0.34;
  const browEls: React.ReactNode[] = [];
  if (brows !== 'none') {
    for (const dir of [-1, 1]) {
      const x = ex + dir * dx;
      let d = '';
      if (brows === 'angry') d = `M ${x - 16 * s} ${browY + 7} L ${x + 16 * s} ${browY - 5}`;
      else if (brows === 'sad' || brows === 'worried') d = `M ${x - 16 * s} ${browY - 5} L ${x + 16 * s} ${browY + 7}`;
      else d = `M ${x - 16 * s} ${browY} L ${x + 16 * s} ${browY}`;
      browEls.push(<path key={dir} d={d} stroke={OUT} strokeWidth={8} strokeLinecap="round" fill="none" />);
    }
  }

  const my = cy + r * 0.38;
  let mouthEl: React.ReactNode = null;
  if (mouth === 'smile') mouthEl = <path d={`M ${ex - 15} ${my - 4} Q ${ex} ${my + 8} ${ex + 15} ${my - 4}`} stroke={OUT} strokeWidth={6} fill="none" strokeLinecap="round" />;
  else if (mouth === 'smirk') mouthEl = <path d={`M ${ex - 12} ${my - 1} Q ${ex + 4} ${my + 6} ${ex + 15} ${my - 6}`} stroke={OUT} strokeWidth={6} fill="none" strokeLinecap="round" />;
  else if (mouth === 'frown') mouthEl = <path d={`M ${ex - 14} ${my + 3} Q ${ex} ${my - 7} ${ex + 14} ${my + 3}`} stroke={OUT} strokeWidth={6} fill="none" strokeLinecap="round" />;
  else if (mouth === 'O') mouthEl = <ellipse cx={ex} cy={my} rx={8} ry={10} fill={OUT} />;
  else if (mouth === 'grit') mouthEl = <rect x={ex - 16} y={my - 5} width={32} height={10} rx={3} fill={OUT} />;
  else mouthEl = <rect x={ex - 13} y={my - 2} width={26} height={6} rx={3} fill={OUT} />;

  return (
    <g>
      {browEls}
      {eyeEls}
      {mouthEl}
      {sweat && (
        <path d={`M ${cx + r * 0.55} ${cy - r * 0.45} q 8 12 0 18 q -8 -6 0 -18`} fill="#9CC7F2" opacity={0.9} />
      )}
    </g>
  );
};

// ------------------------------------------------------------
// limb helper — dark outline stroke + cream core
// ------------------------------------------------------------
const Limb: React.FC<{ d: string; w?: number; color?: string }> = ({ d, w = 20, color = C.CREAM }) => (
  <>
    <path d={d} stroke={OUT} strokeWidth={w + LINE_W * 2} fill="none" strokeLinecap="round" />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
  </>
);

const BODY = (x: number, y: number, w: number, h: number) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={w / 2} fill={C.CREAM} stroke={OUT} strokeWidth={LINE_W} />
    <path d={`M ${x + w * 0.72} ${y + 12} q ${w * 0.28} ${h * 0.35} 0 ${h * 0.8}`} stroke="rgba(0,0,0,0.13)" strokeWidth={9} fill="none" strokeLinecap="round" />
  </g>
);

const Head: React.FC<{ cx?: number; cy?: number; r?: number; face?: FaceOpts }> = ({ cx = 0, cy = -280, r = 50, face = {} }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={C.CREAM} stroke={OUT} strokeWidth={LINE_W} />
    <Face cx={cx} cy={cy} r={r} {...face} />
  </g>
);

// ============================================================
// MAIN CHAR
// ============================================================
export type Pose =
  | 'stand'
  | 'standArmsDown'
  | 'sitBedPhone'
  | 'sitBed'
  | 'lieBed'
  | 'sitCouch'
  | 'walk'
  | 'run'
  | 'pushup'
  | 'sitDesk'
  | 'sitBench'
  | 'crawl'
  | 'standPlace'
  | 'eat';

export const MainChar: React.FC<{
  pose: Pose;
  face?: FaceOpts;
  x: number;
  y: number; // ground contact point (feet / pillow level)
  scale?: number;
  flip?: boolean;
  frame?: number; // for cycles (walk/run); defaults to useCurrentFrame
  glow?: boolean; // warm rim glow (phone/lamp light)
}> = ({ pose, face = {}, x, y, scale = 1, flip = false, frame: frameProp, glow = false }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
    {renderPose(pose, face, frameProp)}
    {glow && (
      <ellipse cx={0} cy={-160} rx={95} ry={125} fill="rgba(255,190,90,0.07)" style={{ filter: 'blur(3px)' }} />
    )}
  </g>
);

function renderPose(pose: Pose, face: FaceOpts, frameProp?: number): React.ReactNode {
  switch (pose) {
    // ---------------- STANDING ----------------
    case 'stand':
    case 'standArmsDown':
    case 'standPlace': {
      const legSwing = frameProp ? Math.sin(frameProp * 0.22) * 8 : 0;
      const place = pose === 'standPlace';
      return (
        <g>
          <Limb d={`M ${-16} -112 L ${-18 + legSwing * 0.2} -12`} />
          <Limb d={`M ${16} -112 L ${20} -12`} />
          {BODY(-36, -236, 76, 128)}
          <Head cy={-282} face={face} />
          {place ? (
            <Limb d={`M 12 -212 Q 55 -198 80 -182`} />
          ) : (
            <>
              <Limb d={`M -26 -208 Q -46 -184 -40 -150`} />
              <Limb d={`M 26 -208 Q 48 -184 42 -150`} />
            </>
          )}
        </g>
      );
    }

    // ---------------- SITTING ON BED EDGE, HOLDING PHONE ----------------
    case 'sitBedPhone': {
      return (
        <g>
          {/* bent legs down over bed edge */}
          <Limb d={`M 18 -108 Q 48 -96 52 -34`} />
          <Limb d={`M 34 -112 Q 66 -98 68 -32`} />
          {/* torso */}
          {BODY(-34, -226, 74, 122)}
          <Head cy={-272} face={face} />
          {/* arms folded up holding phone near chest */}
          <Limb d={`M -20 -196 Q -50 -184 -38 -156 Q -20 -142 6 -156`} />
          <Limb d={`M 22 -200 Q 52 -188 40 -160`} />
          {/* phone with glow */}
          <rect x={-2} y={-190} width={30} height={52} rx={7} fill="#0B0B0E" stroke="#2C2C33" strokeWidth={3} />
          <ellipse cx={12} cy={-164} rx={34} ry={44} fill="rgba(120,170,255,0.16)" style={{ filter: 'blur(6px)' }} />
        </g>
      );
    }

    // ---------------- SITTING (chair / bench / desk) ----------------
    case 'sitBed':
    case 'sitDesk':
    case 'sitBench': {
      const eating = pose === 'sitDesk' && face.mouth === 'smile';
      return (
        <g>
          {/* thighs forward + shins down */}
          <Limb d={`M 16 -104 Q 60 -100 76 -64 Q 82 -34 80 -12`} />
          <Limb d={`M 32 -108 Q 78 -102 94 -66 Q 100 -36 96 -12`} />
          {BODY(-34, -230, 74, 128)}
          <Head cy={-276} face={face} />
          {pose === 'sitDesk' ? (
            <Limb d={`M 20 -206 Q 60 -196 ${eating ? 92 : 64} -178`} />
          ) : (
            <>
              <Limb d={`M -22 -206 Q -48 -182 -40 -156`} />
              <Limb d={`M 22 -206 Q 50 -182 44 -156`} />
            </>
          )}
        </g>
      );
    }

    // ---------------- LYING IN BED (head on pillow) ----------------
    case 'lieBed': {
      return (
        <g>
          {/* pillow shadow + blanket bump over body */}
          <ellipse cx={-10} cy={-24} rx={62} ry={20} fill="#33343E" />
          <path d="M 60 -34 Q 110 -52 170 -38 Q 200 -30 196 -14 Q 190 -2 160 -2 L 40 -2 Q 24 -8 28 -20 Z" fill={C.BED_SHEET} opacity={0.95} />
          <circle cx={0} cy={-56} r={50} fill={C.CREAM} stroke={OUT} strokeWidth={LINE_W} />
          <Face cx={0} cy={-56} r={50} {...face} />
        </g>
      );
    }

    // ---------------- SITTING ON COUCH (slouch) ----------------
    case 'sitCouch': {
      return (
        <g>
          <Limb d={`M 18 -104 Q 62 -98 80 -62 Q 86 -32 84 -10`} />
          <Limb d={`M 34 -108 Q 82 -100 98 -64 Q 104 -34 100 -10`} />
          {BODY(-36, -228, 74, 126)}
          <Head cy={-274} face={face} />
          <Limb d={`M -20 -202 Q -44 -178 -34 -152`} />
          <Limb d={`M 22 -202 Q 52 -178 44 -152`} />
        </g>
      );
    }

    // ---------------- WALK CYCLE ----------------
    case 'walk': {
      const f = frameProp ?? 0;
      const swing = Math.sin(f * 0.28);
      return (
        <g>
          <Limb d={`M -14 -114 L ${-14 + swing * 26} -10`} />
          <Limb d={`M 14 -114 L ${14 - swing * 26} -10`} />
          {BODY(-36, -238, 76, 128)}
          <Head cy={-284} face={face} />
          <Limb d={`M -24 -210 Q ${-46 - swing * 8} -186 -38 -154`} />
          <Limb d={`M 24 -210 Q ${46 + swing * 8} -186 38 -154`} />
        </g>
      );
    }

    // ---------------- RUN CYCLE (leaning) ----------------
    case 'run': {
      const f = frameProp ?? 0;
      const swing = Math.sin(f * 0.5);
      return (
        <g transform="rotate(8)">
          <Limb d={`M -10 -112 L ${-16 + swing * 34} -14`} />
          <Limb d={`M 12 -114 L ${20 - swing * 34} -16`} />
          {BODY(-38, -236, 78, 126)}
          <Head cx={6} cy={-282} face={face} />
          <Limb d={`M -22 -210 Q ${-52 + swing * 10} -190 -30 -160`} />
          <Limb d={`M 22 -210 Q ${50 - swing * 10} -190 28 -160`} />
        </g>
      );
    }

    // ---------------- PUSH-UP ----------------
    case 'pushup': {
      const f = frameProp ?? 0;
      const bob = Math.sin(f * 0.3) * 4;
      return (
        <g transform={`translate(0,${bob})`}>
          <Limb d={`M -34 -52 L -48 -6`} />
          <Limb d={`M 44 -52 L 58 -6`} />
          <rect x={-64} y={-94} width={132} height={80} rx={40} fill={C.CREAM} stroke={OUT} strokeWidth={LINE_W} />
          <circle cx={64} cy={-58} r={44} fill={C.CREAM} stroke={OUT} strokeWidth={LINE_W} />
          <Face cx={64} cy={-58} r={44} {...face} />
        </g>
      );
    }

    // ---------------- CRAWLING AWAY ----------------
    case 'crawl': {
      const f = frameProp ?? 0;
      const reach = Math.sin(f * 0.3) * 8;
      return (
        <g>
          <Limb d={`M -56 -40 L ${-70 + reach} -6`} />
          <Limb d={`M 60 -44 L 74 -6`} />
          <rect x={-64} y={-90} width={130} height={62} rx={30} fill={C.CREAM} stroke={OUT} strokeWidth={LINE_W} />
          <circle cx={70} cy={-66} r={42} fill={C.CREAM} stroke={OUT} strokeWidth={LINE_W} />
          <Face cx={70} cy={-66} r={42} {...face} />
          <Limb d={`M 28 -52 Q 56 -48 ${76 + reach} -32`} />
        </g>
      );
    }

    // ---------------- EATING (arm to spoon) ----------------
    case 'eat': {
      const f = frameProp ?? 0;
      const lift = (Math.sin(f * 0.25) + 1) / 2;
      return (
        <g>
          <Limb d={`M 16 -104 Q 60 -100 76 -64 Q 82 -34 80 -12`} />
          <Limb d={`M 32 -108 Q 78 -102 94 -66 Q 100 -36 96 -12`} />
          {BODY(-34, -232, 74, 126)}
          <Head cy={-278} face={face} />
          <Limb d={`M 20 -208 Q 58 -198 ${64 + lift * 34} ${-188 + lift * 40}`} />
          <g transform={`translate(${64 + lift * 34},${-188 + lift * 40}) rotate(${-20 - lift * 30})`}>
            <rect x={0} y={-3} width={44} height={7} rx={3.5} fill="#B9BCC6" stroke={OUT} strokeWidth={2.5} />
            <ellipse cx={50} cy={0} rx={11} ry={8} fill="#B9BCC6" stroke={OUT} strokeWidth={2.5} />
          </g>
        </g>
      );
    }
    default:
      return null;
  }
}

// ============================================================
// DARK ENTITY — black body, red glow, smiling red face
// (own skeleton: feet 0, hips -110, shoulders -252, head -282)
// ============================================================
export const Entity: React.FC<{
  x: number;
  y: number;
  scale?: number;
  lean?: number;
  armReach?: boolean;
  frame?: number;
  opacity?: number;
}> = ({ x, y, scale = 1, lean = 0, armReach = false, frame: frameProp, opacity = 1 }) => {
  const f = frameProp ?? 0;
  const breathe = Math.sin(f * 0.09) * 3;
  const RED = C.ENTITY_RED;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity} style={{ filter: `drop-shadow(0 0 16px ${C.ENTITY_GLOW}) drop-shadow(0 0 34px ${C.ENTITY_GLOW})` }}>
      <g transform={`rotate(${lean}) translate(0,${breathe})`}>
        <path d={`M -14 -110 L -18 -6`} stroke={C.ENTITY} strokeWidth={30} strokeLinecap="round" />
        <path d={`M 16 -110 L 22 -6`} stroke={C.ENTITY} strokeWidth={30} strokeLinecap="round" />
        <rect x={-42} y={-252} width={86} height={156} rx={43} fill={C.ENTITY} />
        <circle cx={2} cy={-282} r={56} fill={C.ENTITY} />
        <path d={`M -22 -290 Q -10 -302 2 -290`} stroke={RED} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M 12 -290 Q 24 -302 36 -290`} stroke={RED} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M -16 -262 Q 10 -244 36 -262`} stroke={RED} strokeWidth={7} fill="none" strokeLinecap="round" />
        {armReach ? (
          <path d={`M -30 -180 Q -80 -160 -110 -128`} stroke={C.ENTITY} strokeWidth={28} strokeLinecap="round" fill="none" />
        ) : (
          <path d={`M -30 -180 Q -50 -150 -44 -120`} stroke={C.ENTITY} strokeWidth={28} strokeLinecap="round" fill="none" />
        )}
        <path d={`M 32 -180 Q 52 -150 46 -120`} stroke={C.ENTITY} strokeWidth={28} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
};

// ============================================================
// FRIEND — tan skin, brown hair
// ============================================================
export const FriendChar: React.FC<{
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  face?: FaceOpts;
  pose?: 'stand' | 'sit' | 'walk';
  frame?: number;
}> = ({ x, y, scale = 1, flip = false, face = {}, pose = 'stand', frame: frameProp }) => {
  const f = frameProp ?? 0;
  const skin = C.FRIEND_SKIN;
  const HR = 50;
  const swing = pose === 'walk' ? Math.sin(f * 0.28) * 24 : 0;
  const limb = (d: string) => (
    <>
      <path d={d} stroke={OUT} strokeWidth={25} fill="none" strokeLinecap="round" />
      <path d={d} stroke={skin} strokeWidth={19} fill="none" strokeLinecap="round" />
    </>
  );
  const head = (
    <g>
      <circle cx={0} cy={-280} r={HR} fill={skin} stroke={OUT} strokeWidth={LINE_W} />
      {/* hair cap */}
      <path d={`M ${-HR} -288 A ${HR} ${HR} 0 0 1 ${HR} -288 L ${HR - 6} -298 A ${HR - 8} ${HR - 8} 0 0 0 ${-HR + 6} -298 Z`} fill={C.FRIEND_HAIR} />
      <path d={`M ${HR - 14} -292 Q ${HR + 8} -262 ${HR - 2} -228`} stroke={C.FRIEND_HAIR} strokeWidth={16} strokeLinecap="round" fill="none" />
      <Face cx={0} cy={-280} r={HR} {...face} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      {pose === 'sit' ? (
        <>
          {limb('M 18 -104 Q 60 -98 76 -62 Q 82 -32 78 -10')}
          <rect x={-34} y={-230} width={76} height={122} rx={38} fill={skin} stroke={OUT} strokeWidth={LINE_W} />
          {head}
          {limb('M -22 -206 Q -46 -182 -36 -156')}
          {limb('M 24 -206 Q 50 -182 42 -156')}
        </>
      ) : (
        <>
          {limb(`M -14 -114 L ${-16 + swing} -10`)}
          {limb(`M 14 -114 L ${16 - swing} -10`)}
          <rect x={-36} y={-236} width={78} height={126} rx={39} fill={skin} stroke={OUT} strokeWidth={LINE_W} />
          {head}
          {limb('M -26 -210 Q -48 -186 -38 -154')}
          {limb('M 26 -210 Q 48 -186 40 -154')}
        </>
      )}
    </g>
  );
};
