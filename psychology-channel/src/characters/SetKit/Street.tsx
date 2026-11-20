/**
 * Street — a side-on sidewalk set with true parallax, built in code.
 *
 * `scroll` is the distance the CAMERA has travelled along the pavement, in
 * SCREEN PIXELS at the ground plane. It is the only input, and the ground layer
 * must scroll at exactly 1.0 while the layers behind it scroll slower — that is
 * what makes a planted foot look planted instead of skating. The episode passes
 * `distance * pxPerUnit` from the same `walkState` that drives the legs, so the
 * feet and the pavement cannot disagree.
 *
 * Every colour is a tint of the sheet's paper (#FCF5EB) or the sweater's
 * blue-grey family. Red is deliberately absent from the world: it is the
 * character's identity token, and a red prop would compete with it.
 */
import React from 'react';

const PAPER = '#FCF5EB';
const INK = '#17161C';

const CLOUD = '#F3EADB';
const FAR = '#E4DCCC';
const FAR_WIN = '#D6CCBA';
const MID = '#D8CFBE';
const MID_DARK = '#C4BAA8';
const PANE = '#BDB4A2';
const DOOR = '#A79E8C';
const WALK_WAY = '#EDE5D6';
const JOINT = '#DAD1C0';
const CURB = '#C7BEAC';
const ROAD = '#D3CABB';
const DASH = '#E7DFD0';
const PROP = '#CFC6B4';
const PROP_DARK = '#B9AF9C';

/** deterministic pseudo-noise: same set, same street, every frame */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** repeat a tile across the frame with a scroll offset */
const Tiled: React.FC<{
  tile: number;
  scroll: number;
  y?: number;
  children: React.ReactNode;
}> = ({ tile, scroll, children }) => {
  const off = ((scroll % tile) + tile) % tile;
  const n = Math.ceil(1920 / tile) + 2;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${-off + i * tile} 0)`}>
          {children}
        </g>
      ))}
    </g>
  );
};

/* the ground line the soles plant on, in screen space */
export const GROUND_Y = 830;
export const CURB_Y = 950;

const FarBlock: React.FC = () => {
  const b = [
    { x: 0, w: 150, h: 300 },
    { x: 158, w: 110, h: 210 },
    { x: 276, w: 180, h: 360 },
    { x: 464, w: 120, h: 250 },
    { x: 592, w: 150, h: 320 },
  ];
  return (
    <g>
      {b.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={GROUND_Y - p.h} width={p.w} height={p.h} fill={FAR} />
          {Array.from({ length: Math.floor(p.h / 62) }, (_, r) =>
            Array.from({ length: Math.max(1, Math.floor(p.w / 54)) }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={p.x + 16 + c * 54}
                y={GROUND_Y - p.h + 26 + r * 62}
                width={20}
                height={30}
                fill={FAR_WIN}
                opacity={hash(i * 7 + r * 3 + c) > 0.35 ? 1 : 0.45}
              />
            ))
          )}
        </g>
      ))}
    </g>
  );
};

const MidFacade: React.FC = () => (
  <g>
    <rect x={0} y={430} width={620} height={GROUND_Y - 430} fill={MID} />
    <rect x={0} y={430} width={620} height={16} fill={MID_DARK} />
    {/* shopfront: two panes and a door, the only dark mass at head height */}
    <rect x={40} y={560} width={200} height={200} fill={PANE} />
    <rect x={40} y={560} width={200} height={200} fill="none" stroke={MID_DARK} strokeWidth={6} />
    <line x1={140} y1={560} x2={140} y2={760} stroke={MID_DARK} strokeWidth={5} />
    <rect x={300} y={590} width={90} height={GROUND_Y - 590} fill={DOOR} />
    <rect x={300} y={590} width={90} height={GROUND_Y - 590} fill="none" stroke={MID_DARK} strokeWidth={6} />
    <circle cx={378} cy={690} r={5} fill={MID_DARK} />
    <rect x={430} y={560} width={150} height={120} fill={PANE} />
    <rect x={430} y={560} width={150} height={120} fill="none" stroke={MID_DARK} strokeWidth={6} />
    {/* awning, straight-edged so it reads as a drawing, not a photo */}
    <path d="M 20,540 L 260,540 L 274,584 L 6,584 Z" fill={MID_DARK} />
    <path d="M 420,540 L 600,540 L 610,584 L 410,584 Z" fill={MID_DARK} />
  </g>
);

const LampPost: React.FC = () => (
  <g>
    <rect x={28} y={430} width={13} height={GROUND_Y - 430} fill={PROP_DARK} />
    <rect x={16} y={GROUND_Y - 14} width={37} height={14} fill={PROP_DARK} />
    <path d="M 34,436 C 34,404 60,398 86,404" fill="none" stroke={PROP_DARK} strokeWidth={11} strokeLinecap="round" />
    <path d="M 70,400 L 102,400 L 96,424 L 76,424 Z" fill={PROP} stroke={INK} strokeWidth={3} opacity={0.92} />
  </g>
);

const Bin: React.FC = () => (
  <g>
    <rect x={0} y={GROUND_Y - 92} width={62} height={92} rx={6} fill={PROP} stroke={INK} strokeWidth={3.5} />
    <rect x={-4} y={GROUND_Y - 104} width={70} height={16} rx={6} fill={PROP_DARK} stroke={INK} strokeWidth={3.5} />
    <line x1={20} y1={GROUND_Y - 78} x2={20} y2={GROUND_Y - 14} stroke={PROP_DARK} strokeWidth={4} />
    <line x1={42} y1={GROUND_Y - 78} x2={42} y2={GROUND_Y - 14} stroke={PROP_DARK} strokeWidth={4} />
  </g>
);

const Hydrant: React.FC = () => (
  <g>
    <rect x={0} y={GROUND_Y - 62} width={34} height={62} rx={10} fill={PROP} stroke={INK} strokeWidth={3.5} />
    <rect x={-8} y={GROUND_Y - 44} width={50} height={12} rx={6} fill={PROP_DARK} stroke={INK} strokeWidth={3} />
    <circle cx={17} cy={GROUND_Y - 66} r={11} fill={PROP} stroke={INK} strokeWidth={3.5} />
  </g>
);

const Bench: React.FC = () => (
  <g>
    <rect x={0} y={GROUND_Y - 78} width={190} height={14} rx={7} fill={PROP} stroke={INK} strokeWidth={3.5} />
    <rect x={0} y={GROUND_Y - 56} width={190} height={14} rx={7} fill={PROP} stroke={INK} strokeWidth={3.5} />
    <rect x={14} y={GROUND_Y - 78} width={10} height={78} fill={PROP_DARK} stroke={INK} strokeWidth={3} />
    <rect x={166} y={GROUND_Y - 78} width={10} height={78} fill={PROP_DARK} stroke={INK} strokeWidth={3} />
  </g>
);

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.85}>
    <ellipse cx={0} cy={0} rx={62} ry={20} fill={CLOUD} />
    <ellipse cx={38} cy={-10} rx={40} ry={17} fill={CLOUD} />
    <ellipse cx={-40} cy={-6} rx={34} ry={15} fill={CLOUD} />
  </g>
);

export const Street: React.FC<{ scroll: number }> = ({ scroll }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1920 1080"
    width="100%"
    height="100%"
    style={{ position: 'absolute', inset: 0 }}
  >
    <title>Street set</title>
    <rect x={0} y={0} width={1920} height={1080} fill={PAPER} />

    {/* sky — almost no parallax, it is the farthest thing */}
    <Tiled tile={900} scroll={scroll * 0.1}>
      <Cloud x={140} y={150} s={1} />
      <Cloud x={520} y={96} s={0.7} />
      <Cloud x={760} y={210} s={0.5} />
    </Tiled>

    {/* far skyline */}
    <Tiled tile={742} scroll={scroll * 0.25}>
      <FarBlock />
    </Tiled>

    {/* shopfronts, the layer the eye reads as "the street" */}
    <Tiled tile={620} scroll={scroll * 0.5}>
      <MidFacade />
    </Tiled>

    {/* ground plane: 1.0 — the reference the planted sole is measured against */}
    <rect x={0} y={GROUND_Y} width={1920} height={CURB_Y - GROUND_Y} fill={WALK_WAY} />
    <rect x={0} y={CURB_Y} width={1920} height={1080 - CURB_Y} fill={ROAD} />
    <rect x={0} y={CURB_Y - 8} width={1920} height={10} fill={CURB} />

    <Tiled tile={130} scroll={scroll}>
      <line x1={0} y1={GROUND_Y} x2={0} y2={CURB_Y - 8} stroke={JOINT} strokeWidth={5} />
      <line x1={0} y1={892} x2={130} y2={892} stroke={JOINT} strokeWidth={4} opacity={0.7} />
    </Tiled>

    <Tiled tile={260} scroll={scroll}>
      <rect x={40} y={1012} width={120} height={12} rx={6} fill={DASH} />
    </Tiled>

    {/* street furniture sits ON the pavement, so it scrolls at 1.0 too */}
    <Tiled tile={620} scroll={scroll}>
      <LampPost />
      <g transform="translate(250 0)">
        <Bench />
      </g>
      <g transform="translate(470 0)">
        <Bin />
      </g>
      <g transform="translate(560 0)">
        <Hydrant />
      </g>
    </Tiled>

    {/* the pavement's top edge, drawn last so nothing blurs the contact line */}
    <line x1={0} y1={GROUND_Y} x2={1920} y2={GROUND_Y} stroke={CURB} strokeWidth={4} />
  </svg>
);
