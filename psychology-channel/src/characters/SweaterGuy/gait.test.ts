import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gaitPose, cycleSeconds, footAt } from '../StickGuy/gait';
import { SKELETON, GAIT, GROUND, SOLE_DROP } from './rig';
import { walkState } from './walk';
import type { Pose } from '../StickGuy/types';

const FPS = 30;
const DEG = Math.PI / 180;

/** SVG rotate(θ): positive is clockwise with y down. */
const rot = (v: { x: number; y: number }, deg: number) => {
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
};

/** The sole of the shoe art, in the ankle frame: toe at -40, heel at +25,
 *  bottom edge at y = SOLE_DROP. Must match SweaterGuy.tsx's SHOE path. */
const SOLE = [-40, -25, -10, 5, 25].map((x) => ({ x, y: SOLE_DROP }));

/**
 * Replicates the renderer's leg chain exactly:
 *   rotate(leg, hip) → translate(hip) → translate(thigh) → rotate(-knee)
 *   → translate(shin) → rotate(foot) → shoe art
 * so the gate measures what is DRAWN, not what the analytic foot promises.
 */
function legPoints(p: Pose, hip: { x: number; y: number }, leg: number, knee: number, foot: number) {
  const a = SKELETON.thigh;
  const b = SKELETON.shin;
  const kneePt = { x: hip.x + rot(a, leg).x, y: hip.y + rot(a, leg).y };
  const ankle = { x: kneePt.x + rot(b, leg - knee).x, y: kneePt.y + rot(b, leg - knee).y };
  const sole = SOLE.map((s) => {
    const r = rot(s, leg - knee + foot);
    return { x: ankle.x + r.x, y: ankle.y + r.y };
  });
  return { ankle, sole };
}

/** The renderer's root transform, applied in the same order as StickGuy.tsx:
 *  rotate about the hip (lean), scale about the ground (squash), then translate. */
function root(p: Pose, q: { x: number; y: number }) {
  const squash = Math.min(1.6, Math.max(0.5, p.squash));
  const sx = p.scale / Math.sqrt(squash);
  const sy = p.scale * squash;
  const cx = SKELETON.centerX;
  const c = Math.cos(p.lean * DEG);
  const s = Math.sin(p.lean * DEG);
  const dx = q.x - cx;
  const dy = q.y - SKELETON.hipL.y;
  const rx = cx + dx * c - dy * s;
  const ry = SKELETON.hipL.y + dx * s + dy * c;
  const scx = cx + (rx - cx) * sx;
  const scy = GROUND + (ry - GROUND) * sy;
  return { x: scx + p.x, y: scy + p.y };
}

/** left-space solve for one side, then map the right side back out of the mirror.
 *  The renderer wraps everything in the root transform, so the world position is
 *  the body-space joint through that transform plus the box travel. */
function footWorld(p: Pose, distance: number, dir: number, side: 'L' | 'R') {
  const mirror = 2 * SKELETON.centerX;
  const put = (f: { ankle: { x: number; y: number }; sole: { x: number; y: number }[] }) => {
    const travel = (q: { x: number; y: number }) => {
      const r = root(p, q);
      return { x: r.x + dir * distance, y: r.y };
    };
    return { ankle: travel(f.ankle), sole: f.sole.map(travel) };
  };
  if (side === 'L') return put(legPoints(p, SKELETON.hipL, p.legL, p.kneeL, p.footL));
  const hipL = { x: mirror - SKELETON.hipR.x, y: SKELETON.hipR.y };
  const f = legPoints(p, hipL, p.legR, p.kneeR, p.footR);
  const mirrorOut = (q: { x: number; y: number }) => ({ x: mirror - q.x, y: q.y });
  return put({ ankle: mirrorOut(f.ankle), sole: f.sole.map(mirrorOut) });
}

const lowestSole = (p: Pose, distance: number, dir: number, side: 'L' | 'R') =>
  Math.max(...footWorld(p, distance, dir, side).sole.map((s) => s.y));

/** the mid-sole material point (SOLE index 2 = x -10), in world space */
const midSole = (p: Pose, distance: number, dir: number, side: 'L' | 'R') =>
  footWorld(p, distance, dir, side).sole[2];

/** the foot is carrying the body, flat: planted AND no heel/toe roll */
const flat = (phase: number, off: number) => {
  const f = footAt((phase + off) % 1, GAIT);
  return f.contact && Math.abs(f.toe) < 0.5;
};

test('SweaterGuy walk: planted sole world slip < 0.5 u/frame, both feet', () => {
  const dir = -1;
  let worst = 0;
  let worstAt = 0;
  let worstSide: 'L' | 'R' = 'L';
  for (let i = 0; i < 600; i++) {
    const a = walkState(i, FPS, { direction: dir });
    const b = walkState(i + 1, FPS, { direction: dir });
    for (const side of ['L', 'R'] as const) {
      const off = side === 'R' ? 0.5 : 0;
      if (!flat(a.phase, off) || !flat(b.phase, off)) continue;
      const slip = Math.abs(midSole(a.pose, a.distance, dir, side).x - midSole(b.pose, b.distance, dir, side).x);
      if (slip > worst) {
        worst = slip;
        worstAt = i;
        worstSide = side;
      }
    }
  }
  assert.ok(worst < 0.5, `planted ${worstSide} sole slipped ${worst.toFixed(3)} u at frame ${worstAt}`);
});

test('SweaterGuy walk: the planted sole stays on the ground line', () => {
  const dir = -1;
  let maxErr = 0;
  let at = 0;
  let checked = 0;
  for (let i = 0; i < 600; i++) {
    const st = walkState(i, FPS, { direction: dir });
    for (const side of ['L', 'R'] as const) {
      const off = side === 'R' ? 0.5 : 0;
      if (!flat(st.phase, off)) continue;
      checked++;
      /* lowest sole point = whatever part of the foot is carrying the body */
      const err = Math.abs(lowestSole(st.pose, st.distance, dir, side) - GROUND);
      if (err > maxErr) {
        maxErr = err;
        at = i;
      }
    }
  }
  assert.ok(checked > 100, `flat-stance window never sampled (${checked})`);
  assert.ok(maxErr < 6, `sole left the ground by ${maxErr.toFixed(2)} u at frame ${at}`);
});

test("SweaterGuy gait solves for its own skeleton, not StickGuy's", () => {
  const a = gaitPose(300, GAIT, { sk: SKELETON, direction: -1, arc: true });
  const b = gaitPose(300, GAIT, { direction: -1 });
  assert.notDeepEqual(a, b, 'different skeletons must give different channels');
  assert.deepEqual(a, gaitPose(300, GAIT, { sk: SKELETON, direction: -1, arc: true }));
});

test('SweaterGuy cadence is the scaled StickGuy cycle', () => {
  assert.ok(Math.abs(cycleSeconds(GAIT) - 1.474) < 0.01, `cycle ${cycleSeconds(GAIT)}`);
});

test('walkState reports the distance the world must scroll by', () => {
  const a = walkState(60, FPS, { direction: -1 });
  const b = walkState(61, FPS, { direction: -1 });
  assert.ok(b.distance > a.distance, 'distance grows with the frame');
  assert.ok(Math.abs(b.distance - a.distance - GAIT.speed / FPS) < 1e-6, 'linear middle = speed');
});
