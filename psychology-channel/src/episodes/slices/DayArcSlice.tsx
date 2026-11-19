// ============================================================
// DayArcSlice — the reusable "one day" scene pattern (v2).
// THE integration test: characters + set kit + overlays + HUD +
// sound layer, following the shot grammar (study §4):
//
//   blackout → DAY title → scene (SFX hits on pose changes)
//   → Entity whisper / notifications → blackout → next day
//
// Episodes compose `DayBeat`s; each beat is one sequence with
// beat-local frames (seekable, deterministic). v2 adds: hero clip
// TIMELINES (`heroSeq`), the lying `lounge` shot, Entity GROW
// staging, ball choreography (`ball`) and push-in creeps.
// ============================================================
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { StickGuy } from '../../characters/StickGuy/StickGuy';
import { ANIMATIONS } from '../../characters/StickGuy/animations';
import { cycleSeconds, WALK, RUN, walkDistance } from '../../characters/StickGuy/gait';
import type { AnimationId } from '../../characters/StickGuy/animations';
import { Entity } from '../../characters/Entity/Entity';
import { ENTITY_STATES, cower, grow } from '../../characters/Entity/states';
import type { EntityPose } from '../../characters/Entity/types';
import {
  VoidRoom, Couch, SpotlightCone, RedHeadband, RedBeanie, SoccerBall,
} from '../../characters/SetKit/SetKit';
import {
  DayTitle, ScreenTimeHud, NotificationCluster, SpeedLines, ImpactFlash,
} from '../../characters/Overlays/Overlays';
import { SfxLayer, type SfxCue } from '../../engine/sfx';

export interface HeroStep {
  /** beat-local frame the step starts */
  from: number;
  clip: AnimationId;
  /** target box left, in % of frame width — the box walks here over the
   *  step's first ~26 frames (from the previous step's x) */
  x?: number;
  /** 'lounge' = wide lying box + expanded viewBox */
  layout?: 'stand' | 'lounge';
  /** phone prop in the right hand */
  phone?: boolean;
  /** if set, the box TRAVELS at this many rig units/sec for the step, and
   *  `x` is used only as the endpoint (the walk is stance-locked to it).
   *  -1 = travels LEFT (the character's facing), +1 = travels RIGHT. */
  travel?: number;
  /** traversal direction (default -1 = left) */
  direction?: -1 | 1;
}

export interface BallCue {
  /** css left where the ball rests before the kick */
  at: string;
  /** beat-local frame the foot connects — ball launches here */
  kickAt: number;
  /** flight: offset from the rest spot over `frames`, with an arc lift */
  fly?: { dx: number; dy: number; frames: number; arc?: number };
  size?: number;
}

export interface DayBeat {
  label: string;
  frames: number;
  /** costume state = mindset state */
  headSlot?: 'headband' | 'beanie' | 'none';
  set?: 'couch' | 'spotlight' | 'empty';
  screenTime?: { startMinutes: number; perSecond: number; alarmAt?: number };
  narration?: string;
  /** shorthand: one clip for the whole beat (use heroSeq for timelines) */
  hero?: AnimationId;
  heroX?: number;
  heroSeq?: HeroStep[];
  entity?: {
    mode: 'grow' | 'tempting' | 'shrunken' | 'none';
    say?: string;
    sayFrom?: number;
    growTo?: number;
    growSeconds?: number;
    /** beat-local frame the Entity fades in (panel 3: it appears small
     *  BESIDE the couch only after the notification beat) */
    growFrom?: number;
  };
  notifications?: {
    from: number;
    stagger?: number;
    /** where the bubbles anchor — keep it next to the phone */
    anchor: React.CSSProperties;
    items: Array<{ app?: string; text: string }>;
  };
  ball?: BallCue;
  /** creeping push-in for static holds (§8: 0.15–0.35 %/frame) */
  pushIn?: { from: number; rate: number };
  /** montage burst starting at this frame (~30 frames) */
  speedLinesFrom?: number;
  /** extra beat-local cues, on top of the auto whoosh/thud */
  sfx?: SfxCue[];
}

/* phone prop in the hero's hand, with the blue face glow.
   `lying` offsets it into the LEFT wrist frame — with the lounge L-arm
   (armL 25 / elbowL -35 / wristL 0) the slot frame sits ~10° off rig axes,
   so translate(1 12) puts the phone center just above the hand, tilted
   top-left like panels 2-3. Scaled up (~56x96 rig) so it reads at
   phone-to-head ratio ~0.7 like the storyboard. */
const PhoneGlow: React.FC<{ lying?: boolean }> = ({ lying }) => (
  <g transform={lying ? 'translate(1 12) rotate(-20)' : 'translate(-40 -34)'}>
    <rect x={-28} y={-48} width={56} height={96} rx={9} fill="#12161C" stroke="#0B1016" strokeWidth={3} />
    <rect x={-22} y={-42} width={44} height={84} rx={7} fill="#7FB8E8" opacity={0.85} />
  </g>
);

const GROUND = '22%';

/* hero box layouts — 'lounge' is a wide box with an expanded viewBox so the
   rotated (lying) rig never clips */
const HERO_BOX: Record<'stand' | 'lounge', { w: number; h: number; viewBox: string; bottom: string }> = {
  stand: { w: 312, h: 360, viewBox: '-45 -170 780 900', bottom: `calc(${GROUND} - 6px)` },
  lounge: { w: 620, h: 342, viewBox: '10 140 780 430', bottom: `calc(${GROUND} + 25px)` },
};

/* --------------------------- one beat --------------------------- */
const Beat: React.FC<{ beat: DayBeat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ---- hero: active step of the clip timeline ---- */
  const steps: HeroStep[] = beat.heroSeq ?? [
    { from: 0, clip: beat.hero ?? 'idle', x: beat.heroX ?? (beat.set === 'couch' ? 34 : 44), layout: 'stand' },
  ];
  let stepIdx = 0;
  for (let i = 0; i < steps.length; i++) if (frame >= steps[i].from) stepIdx = i;
  const step = steps[stepIdx];
  const prevStep = steps[Math.max(0, stepIdx - 1)];
  const clip = ANIMATIONS[step.clip];
  const local = clip.loops
    ? (frame - step.from) % Math.max(1, Math.round(clip.duration * fps))
    : frame - step.from;

  /* ---- stance-locked travel ----
     When a step declares `travel`, the box moves at that rig speed and the
     clip runs the IK gait at the SAME speed, so the planted sole is
     world-locked. The box's x in % is the integrated gait distance, and the
     clip's own speed ramp (1 cycle) covers start/stop. */
  const travel = step.travel;
  const isTravelStep = travel !== undefined && (step.clip === 'walk' || step.clip === 'run');
  const travelCfg = step.clip === 'run' ? RUN : WALK;
  const travelEnd = cycleSeconds(travelCfg);
  let heroX: number;
  let localForClip: number;
  if (isTravelStep) {
    const t = Math.max(0, frame - step.from) / fps;
    const d = walkDistance(t, travelEnd, { ...travelCfg, speed: travel });
    /* 312px box on a 1920 frame → 1% = 19.2px; a rig unit = 0.4 screen px */
    heroX = (step.x ?? 38) - (step.direction ?? -1) * (d * 0.4) / 19.2;
    localForClip = t * fps;
  } else {
    const xFrom = prevStep.x ?? step.x ?? 44;
    const xTo = step.x ?? xFrom;
    heroX = interpolate(frame, [step.from, step.from + 26], [xFrom, xTo], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    localForClip = local;
  }
  const heroPose = isTravelStep
    ? clip.fn(localForClip, fps, { direction: step.direction ?? -1, travel })
    : clip.fn(local, fps);
  const layout = step.layout ?? 'stand';
  const box = HERO_BOX[layout];

  /* headband tails stream during the kick (panel 6), relax after */
  const headbandStream = step.clip === 'kick'
    ? Math.min(1, local / 10)
    : step.clip === 'resolve' && prevStep?.clip === 'kick'
      ? Math.max(0, 1 - local / 24)
      : 0;

  /* ---- entity pose ---- */
  const ent = beat.entity;
  const sayFrom = ent?.sayFrom ?? 160;
  /* grow renders at pose scale 1 in the DEFAULT viewBox (the aura must stay
     inside it or the blur clips into a hard rectangle) — the SIZE ramp is a
     CSS scale on the wrapper, pivot on the figure axis (50% — the Entity's
     hips sit at viewBox x 345 = div center) and its internal ground line
     (88%). Staging per storyboard panels 3-4: the Entity FADES IN small
     standing on the GROUND beside the couch's right armrest, then grows and
     slides left BEHIND the couch — the couch occludes the body and the head
     crests the back line, craning down toward the hero (headTilt CCW). */
  const entityGrow: {
    pose: EntityPose; css: number; bottomPx: number; leftPx: number; opacity: number;
  } | null = (() => {
    if (ent?.mode !== 'grow') return null;
    const gBase: EntityPose = { ...ENTITY_STATES.tempting.pose, armSpread: 0.24, lean: 5, headTilt: 7 };
    const growFrom = ent.growFrom ?? 0;
    const toScale = ent.growTo ?? 2.4;
    const gf = Math.max(0, frame - growFrom);
    const g = grow(gf, fps, gBase, { fromScale: 0.9, toScale, seconds: ent.growSeconds ?? 2.6 });
    // once grown: crane the head over the couch back, toward the hero's ear
    const w = interpolate(frame, [sayFrom - 15, sayFrom + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    /* the grow clip's own eased progress, read back off its scale */
    const ramp = interpolate(g.scale, [0.9, toScale], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    /* feet stay ON the floor line while the Entity is visible beside the
       couch, sink slightly only once hidden behind it; at full size the
       head rides 197.6·scale above the pivot and crests the back line */
    const bottomPx = interpolate(ramp, [0, 0.7, 1], [-41, -41, -55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    /* x: hold beside the couch while small (visible, panel 3), then slide
       left-BEHIND the couch late so the body occludes and the head crests */
    const leftPx = interpolate(ramp, [0, 0.55, 1], [-14, -40, -159], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const opacity = interpolate(frame, [growFrom, growFrom + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return {
      pose: {
        ...g,
        scale: 1,
        /* headTilt spins the face in place (negative = CCW = looks down-left
           at the hero); lean 0 keeps the head on the computed axis */
        lean: 0,
        headTilt: g.headTilt - 18 * w,
        /* the aura blur scales with the CSS scale — damp it so the full-size
           Entity doesn't wash half the frame red (panel 4 keeps it tight) */
        glow: g.glow * (1 - 0.55 * ramp),
      },
      css: g.scale,
      bottomPx,
      leftPx,
      opacity,
    };
  })();
  const entityPose: EntityPose | null = (() => {
    if (!ent || ent.mode === 'none') return null;
    if (ent.mode === 'grow') return entityGrow?.pose ?? null;
    if (ent.mode === 'shrunken') return cower(frame, fps, ENTITY_STATES.shrunken.pose);
    return null; // 'tempting' renders via temptingPose below
  })();
  const temptingPose = (() => {
    if (ent?.mode !== 'tempting') return null;
    const p = ENTITY_STATES.tempting.pose;
    return { ...p, armSpread: 0.02, rim: 0.3 } as EntityPose;
  })();

  /* ---- ball: rest → launch → parabolic flight with spin ---- */
  const ball = beat.ball;
  const ballState: {
    flying: boolean; u: number; rot: number;
    fly: NonNullable<BallCue['fly']>; arc: number;
  } | null = (() => {
    if (!ball) return null;
    const fly = ball.fly ?? { dx: -430, dy: -470, frames: 60, arc: 90 };
    if (frame < ball.kickAt) return { flying: false, u: 0, rot: 0, fly, arc: 0 };
    const u = Math.min(1, (frame - ball.kickAt) / fly.frames);
    const e = 1 - Math.pow(1 - u, 2.2); // ease-out: leaves fast, drifts at the top
    const arc = (fly.arc ?? 90) * Math.sin(u * Math.PI);
    return { flying: true, u: e, rot: -10 * (frame - ball.kickAt), fly, arc };
  })();

  /* blackout edges: fade up from black, fade down at the reset */
  const fadeIn = interpolate(frame, [0, 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [beat.frames - 9, beat.frames - 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const blackout = Math.max(fadeIn, fadeOut);

  /* push-in creep on the world (never on HUD/title/narration) */
  const push = beat.pushIn
    ? 1 + beat.pushIn.rate * Math.max(0, frame - beat.pushIn.from)
    : 1;

  /* red say text: fades in at sayFrom, gently bobs */
  const sayIn = interpolate(frame, [sayFrom, sayFrom + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sayBob = Math.sin(frame / 9) * 3;

  /* narration: beat-by-beat cream line */
  const narrIn = interpolate(frame, [14, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const narrOut = interpolate(frame, [beat.frames - 26, beat.frames - 12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  /* speed-lines burst window */
  const burstIn = beat.speedLinesFrom !== undefined
    ? interpolate(frame, [beat.speedLinesFrom, beat.speedLinesFrom + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      * interpolate(frame, [beat.speedLinesFrom + 24, beat.speedLinesFrom + 34], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  /* auto SFX: whoosh on the blackout + thud as the pose lands +
     a notification cue per bubble pop + kick impact wiring */
  const notif = beat.notifications;
  const cues: SfxCue[] = [
    { f: 0, sfx: 'whoosh-short', vol: 0.55 },
    { f: 14, sfx: 'thud', vol: 0.5 },
    ...(notif ? notif.items.map((_, i) => ({
      f: notif.from + i * (notif.stagger ?? 14), sfx: 'notification' as const, vol: 0.55,
    })) : []),
    ...(ball ? [
      { f: ball.kickAt - 4, sfx: 'swoosh-fast' as const, vol: 0.55 },
      { f: ball.kickAt, sfx: 'impact' as const, vol: 0.6 },
      { f: ball.kickAt + 14, sfx: 'light-energy' as const, vol: 0.35 },
    ] : []),
    ...(beat.sfx ?? []),
  ];

  return (
    <AbsoluteFill style={{ background: '#0d0d0d' }}>
      {/* push-in wrapper — the WORLD creeps, UI stays pinned */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `scale(${push})`, transformOrigin: '50% 62%',
      }}>
        {/* the void scene */}
        <VoidRoom groundFrac={0.22} wallFrac={0.62} />

        {beat.set === 'spotlight' && <SpotlightCone x={44} topY={0} bottomY={78} spread={19} opacity={0.42} />}

        {/* the Entity paints BEFORE the couch so the couch occludes it —
            small = standing on the ground beside the armrest (panel 3),
            grown = towering behind the couch, craning over it (panel 4) */}
        {ent?.mode === 'grow' && entityPose && (
          <div style={{
            position: 'absolute',
            bottom: `calc(${GROUND} + ${entityGrow?.bottomPx ?? 0}px)`,
            left: `calc(62% + ${entityGrow?.leftPx ?? 0}px)`,
            width: 300, height: 344, display: 'flex',
            opacity: entityGrow?.opacity ?? 1,
            /* pivot on the figure axis (50% — hips at viewBox x 345 = div
               center) and the internal ground line (88%) */
            transform: `scale(${entityGrow?.css ?? 1})`, transformOrigin: '50% 88%',
          }}>
            <Entity pose={entityPose} width={300} height={344} />
          </div>
        )}
        {ent?.mode === 'shrunken' && entityPose && (
          <div style={{
            position: 'absolute', right: 120, bottom: `calc(${GROUND} - 4px)`, width: 150, height: 154, display: 'flex',
          }}>
            <Entity pose={entityPose} width={150} height={154} />
          </div>
        )}
        {ent?.mode === 'tempting' && temptingPose && (
          <div style={{
            position: 'absolute', bottom: `calc(${GROUND} - 6px)`, right: '18%', width: 300, height: 344, display: 'flex',
          }}>
            <Entity pose={temptingPose} width={300} height={344} />
          </div>
        )}

        {/* furniture */}
        {beat.set === 'couch' && (
          <div style={{ position: 'absolute', bottom: GROUND, left: '50%', transform: 'translateX(-62%)' }}>
            <Couch width={820} height={392} />
          </div>
        )}

        {/* hero */}
        <div style={{
          position: 'absolute', bottom: box.bottom, left: `${heroX}%`,
          width: box.w, height: box.h, display: 'flex',
        }}>
          <StickGuy
            pose={heroPose}
            width={box.w} height={box.h} viewBox={box.viewBox}
            shadow={layout === 'stand'}
            headSlot={beat.headSlot === 'headband' ? <RedHeadband stream={headbandStream} /> : beat.headSlot === 'beanie' ? <RedBeanie /> : undefined}
            handSlotL={step.phone && layout === 'lounge' ? <PhoneGlow lying /> : undefined}
            handSlotR={step.phone && layout !== 'lounge' ? <PhoneGlow /> : undefined}
          />
        </div>

        {/* phone glow light on the face during the doomscroll —
            lying: the glow sits on the upturned face; standing: over the chest */}
        {step.phone && (
          <div style={{
            position: 'absolute',
            ...(layout === 'lounge'
              ? { left: 'calc(58.5% - 130px)', top: 'calc(48% - 150px)' }
              : { left: '55%', top: '34%' }),
            width: 260, height: 300,
            background: 'radial-gradient(ellipse at center, rgba(127,184,232,0.17) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* the ball: rests at `at`, launches at kickAt, flies with spin.
            The visible circle sits 4px inside the div's bottom edge, so
            bottom − 4px puts the ball exactly ON the ground line. */}
        {ball && (() => {
          const size = ball.size ?? 64;
          const st = ballState!;
          if (!st.flying) {
            return (
              <div style={{ position: 'absolute', bottom: `calc(${GROUND} - 4px)`, left: ball.at }}>
                <SoccerBall width={size} height={size} />
              </div>
            );
          }
          const f = st.fly;
          return (
            <div style={{
              position: 'absolute',
              left: `calc(${ball.at} + ${f.dx * st.u}px)`,
              bottom: `calc(${GROUND} + ${-f.dy * st.u + st.arc - 4}px)`,
              width: size, height: size,
            }}>
              {/* motion trail — streaks back along the flight vector (panel 6) */}
              <div style={{
                position: 'absolute', left: size / 2, top: size / 2,
                width: 24 + 150 * st.u, height: 6, borderRadius: 3,
                transformOrigin: '0 50%',
                transform: `rotate(${Math.atan2(-f.dy, -f.dx) * 180 / Math.PI}deg)`,
                background: `linear-gradient(90deg, rgba(242,234,216,${0.75 * st.u}), rgba(242,234,216,0))`,
              }} />
              <div style={{ position: 'absolute', inset: 0, transform: `rotate(${st.rot}deg)` }}>
                <SoccerBall width={size} height={size} />
              </div>
            </div>
          );
        })()}

        {/* kick impact flash */}
        {ball && <ImpactFlash from={ball.kickAt} peak={0.22} decay={6} />}
      </div>

      {/* HUD + day title */}
      {beat.screenTime && (
        <ScreenTimeHud
          from={12}
          schedule={[{ frames: beat.frames, perSecond: beat.screenTime.perSecond }]}
          startMinutes={beat.screenTime.startMinutes}
          alarmAt={beat.screenTime.alarmAt}
          corner="top-left"
        />
      )}
      <DayTitle label={beat.label} variant="top-center" from={12} />

      {/* the whisper — below-right of the Entity's head (panel 4) */}
      {ent?.say && (
        <div style={{
          position: 'absolute', left: '72%', top: '39%',
          fontFamily: 'Patrick Hand, monospace', fontSize: 46, color: '#E8392F',
          transform: `rotate(-4deg) translateY(${sayBob}px)`,
          opacity: sayIn,
          textShadow: '0 0 18px rgba(232,57,47,0.55)',
        }}>
          {ent.say}
        </div>
      )}

      {/* notifications — anchored where the phone is, not floating in space;
          they fade as the whisper approaches (panel 4 has none) */}
      {notif && (() => {
        const fade = ent?.say
          ? interpolate(frame, [sayFrom - 45, sayFrom - 15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          : 1;
        return (
          <NotificationCluster
            items={notif.items}
            from={notif.from}
            stagger={notif.stagger ?? 14}
            style={{ position: 'absolute', opacity: fade, ...notif.anchor }}
          />
        );
      })()}

      {/* narration */}
      {beat.narration && (
        <div style={{
          position: 'absolute', bottom: 84, left: 0, right: 0, textAlign: 'center',
          fontFamily: 'Patrick Hand, monospace', fontSize: 44, color: '#F2EAD8',
          opacity: Math.min(narrIn, narrOut), letterSpacing: 1,
          textShadow: '0 2px 0 rgba(0,0,0,0.6)',
        }}>
          {beat.narration}
        </div>
      )}

      {burstIn > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, opacity: burstIn, pointerEvents: 'none' }}>
          <SpeedLines count={10} opacity={0.85} />
        </div>
      )}

      {/* sound */}
      <SfxLayer cues={cues} />

      {/* the blackout reset */}
      {blackout > 0.001 && (
        <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: blackout, pointerEvents: 'none' }} />
      )}
    </AbsoluteFill>
  );
};

/* --------------------- the slice composition --------------------- */
export const DayArcSlice: React.FC<{ beats: DayBeat[] }> = ({ beats }) => {
  let offset = 0;
  return (
    <AbsoluteFill style={{ background: '#0d0d0d' }}>
      {beats.map((beat, i) => {
        const from = offset;
        offset += beat.frames;
        return (
          <Sequence key={i} from={from} durationInFrames={beat.frames} name={beat.label}>
            <Beat beat={beat} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** total frames a beat list needs (for Root registrations) */
export const dayArcFrames = (beats: DayBeat[]) => beats.reduce((n, b) => n + b.frames, 0);

/* --------------------- demo: the two-day arc --------------------- */
/* Shot plan: docs/day-arc-slice-v2-shotplan.md — rebuilt from the
   user-generated storyboard (out/storyboard/01-06.jpg). */
export const DEMO_BEATS: DayBeat[] = [
  {
    label: 'DAY 1',
    frames: 240,
    heroSeq: [{ from: 0, clip: 'lounge', x: 37.5, layout: 'lounge', phone: true }],
    set: 'couch',
    screenTime: { startMinutes: 6, perSecond: 1.1 },
    entity: { mode: 'grow', say: 'just one sec.', sayFrom: 205, growTo: 2.4, growSeconds: 2.6, growFrom: 120 },
    notifications: {
      from: 98, stagger: 14, anchor: { left: '65%', top: '40%' },
      items: [
        { app: 'SMS', text: 'you up?' },
        { app: 'IG', text: '3 people watched this story' },
      ],
    },
    pushIn: { from: 30, rate: 0.0022 },
    narration: 'day one. the couch wins.',
    sfx: [
      { f: 40, sfx: 'typing', vol: 0.35 },
      { f: 140, sfx: 'riser-tension', vol: 0.4 },
      { f: 205, sfx: 'suspense', vol: 0.5 },
    ],
  },
  {
    label: 'DAY 2',
    frames: 240,
    headSlot: 'headband',
    set: 'spotlight',
    entity: { mode: 'shrunken' },
    heroSeq: [
      { from: 0, clip: 'resolve', x: 26 },
      {
        from: 30,
        clip: 'walk',
        x: 38,
        /* travel speed solved so the stance-locked walk covers exactly the
           12% (230px) to x=38 in one 1.459s cycle at 0.4 screen px/unit */
        travel: (12 * 19.2) / (cycleSeconds(WALK) * 0.4),
      },
      { from: 84, clip: 'ballRest', x: 38 },
      { from: 160, clip: 'kick' },
      { from: 230, clip: 'resolve', x: 38 },
    ],
    /* the ball waits under the hero's LEFT foot (panel 5): ballRest's sole
       spans scaled x 765-812 (center 788) and the ball top must center
       under it → ball center = hero axis − 67px; kick strike lands ~13f
       into the kick clip. */
    ball: { at: 'calc(38% + 57px)', kickAt: 171, fly: { dx: -430, dy: -470, frames: 60, arc: 90 } },
    speedLinesFrom: 171,
    pushIn: { from: 26, rate: 0.0024 },
    narration: 'day two. the couch loses.',
    screenTime: { startMinutes: 7, perSecond: 0.3, alarmAt: 7 },
    sfx: [{ f: 40, sfx: 'footsteps-wood', vol: 0.4 }],
  },
];
