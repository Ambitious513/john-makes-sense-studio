import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  gaitPose,
  walkDistance,
  cycleSeconds,
  footAt,
  WALK,
  STAND_ANKLE_Y,
  type GaitConfig,
} from './gait';

const FPS = 30;

/**
 * Foot-slip test — the ported version of stride-character-kit's
 * plantedFootVelocity. A planted foot must have WORLD velocity ~0 when the
 * box travels at the gait's speed.
 *
 * World sole x = rig toe x + box x. The rig toe sits at hip.x + dir*relX
 * (+ a flat-foot toe offset); the box moves by dir*distance. Slip is the
 * frame-to-frame change of that world position, measured ONLY while the foot
 * is planted at BOTH ends of the interval (crossing stance→swing is not a
 * slip — the foot is being released).
 */
function soleWorldX(distance: number, g: GaitConfig, dir: number): number {
  const phase = (((distance / (2 * g.step)) % 1) + 1) % 1;
  const f = footAt(phase, g);
  /* left foot: hip (315,398); the toe (contact point) extends forward */
  const toeRig = 315 + dir * f.relX + dir * 42;
  /* the box moved by dir*distance rig units (see DayArcSlice) */
  return toeRig + dir * distance;
}

test('stance-locked gait: planted foot world slip < 0.5 px/frame', () => {
  const g = WALK;
  const dt = 1 / FPS;
  const dist0 = g.speed * dt; // matched speed: box and gait share `speed`
  let worstSlip = 0;
  let worstFrame = 0;
  for (let i = 0; i < 400; i++) {
    const d0 = i * dist0;
    const d1 = (i + 1) * dist0;
    const p0 = (((d0 / (2 * g.step)) % 1) + 1) % 1;
    const p1 = (((d1 / (2 * g.step)) % 1) + 1) % 1;
    const f0 = footAt(p0, g);
    const f1 = footAt(p1, g);
    if (!f0.contact || !f1.contact) continue; // only planted-at-both-ends
    const slip = Math.abs(soleWorldX(d0, g, -1) - soleWorldX(d1, g, -1));
    if (slip > worstSlip) {
      worstSlip = slip;
      worstFrame = i;
    }
  }
  assert.ok(worstSlip < 0.5, `planted foot slipped ${worstSlip.toFixed(3)} px at frame ${worstFrame}`);
});

test('walkDistance: monotonic, ends at total, mid is half (in the linear middle)', () => {
  const g = WALK;
  const T = cycleSeconds(g);
  const tEnd = T * 10; // a long walk so the ramps never overlap
  const total = walkDistance(tEnd, tEnd, g);
  assert.ok(total > 0, `walk covers distance (${total})`);
  /* the middle of a long walk is exactly linear: half the duration = half distance */
  const mid = walkDistance(tEnd / 2, tEnd, g);
  assert.ok(Math.abs(mid - total / 2) < 1, `mid ${mid} vs total ${total}`);
  /* monotonic */
  let prev = 0;
  for (let t = 0; t <= tEnd; t += 0.1) {
    const d = walkDistance(t, tEnd, g);
    assert.ok(d >= prev - 1e-9, `distance decreased at t=${t}`);
    prev = d;
  }
});

test('footAt: stance travels backward, swing lifts and returns', () => {
  const g = WALK;
  const stance = footAt(0.1, g);
  assert.ok(stance.contact && stance.lift === 0, 'stance: on ground, no lift');
  const swing = footAt(0.8, g);
  assert.ok(!swing.contact && swing.lift > 0, 'swing: lifted');
  const a = footAt(0.2, g).relX;
  const b = footAt(0.3, g).relX;
  assert.ok(b < a, 'stance foot travels backward (relX decreases)');
});

test('gaitPose is deterministic', () => {
  const a = gaitPose(123.4, WALK, { direction: -1 });
  const b = gaitPose(123.4, WALK, { direction: -1 });
  assert.deepEqual(a, b);
});

test('STAND_ANKLE_Y is the locked ground reference', () => {
  assert.ok(STAND_ANKLE_Y === 630, 'ground reference locked at 630');
});