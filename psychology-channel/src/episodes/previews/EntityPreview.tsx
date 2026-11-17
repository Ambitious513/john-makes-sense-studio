// ============================================================
// EntityPreview — the silhouette antagonist showcase
// Row 1: the four staging states. Row 2: the size arc
// (role-reversal — the Entity shrinks as the hero grows).
// ============================================================
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Entity, ENTITY_VIEWBOX } from '../../characters/Entity/Entity';
import { ENTITY_STATES, loom, tempt, cower, spread } from '../../characters/Entity/states';
import type { EntityPose } from '../../characters/Entity/types';
import { StickGuy } from '../../characters/StickGuy/StickGuy';
import { ANIMATIONS } from '../../characters/StickGuy/animations';

export const ENTITY_PREVIEW_DURATION = 240;

type EntityClip = (frame: number, fps: number, base: EntityPose) => EntityPose;

/* One void scene: thin ground line, figure(s) anchored bottom-centre.
   anchor 'top' = looming crop (head/eyes visible, legs run off-frame).
   entityCorner = the figure cowers in the corner instead of beside the hero. */
const Scene: React.FC<{
  label: string;
  sub?: string;
  heroPose?: React.ComponentProps<typeof StickGuy>['pose'];
  heroHeight?: number;
  entityPose: React.ComponentProps<typeof Entity>['pose'];
  entityScale: number;
  entityClip?: EntityClip;
  redText?: string;
  anchor?: 'bottom' | 'top';
  entityCorner?: boolean;
  width: number;
  height: number;
}> = ({ label, sub, heroPose, heroHeight = 170, entityPose, entityScale, entityClip, redText, anchor = 'bottom', entityCorner = false, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The BOX carries the visual scale; the pose's own scale is neutralized so
  // the two never multiply. Tiny states get an expanded viewBox so the red
  // aura bleed survives the small box.
  const tiny = entityScale < 0.4;
  const base: React.ComponentProps<typeof Entity>['pose'] = { ...entityPose, scale: 1 };
  const resolved = entityClip ? entityClip(frame, fps, base) : base;

  const entityH = Math.max(heroHeight * 1.35 * entityScale, tiny ? 96 : 0);
  const entityW = entityH * ENTITY_VIEWBOX_ASPECT_W / ENTITY_VIEWBOX_ASPECT_H;
  const vb = tiny ? '-240 -280 1170 1240' : ENTITY_VIEWBOX;
  const groundY = height * 0.22;

  const EntityFig = ({ style }: { style?: React.CSSProperties }) => (
    <div style={{ width: entityW, height: entityH, display: 'flex', ...style }}>
      <Entity pose={resolved} width={entityW} height={entityH} viewBox={vb} />
    </div>
  );

  return (
    <div style={{
      position: 'relative',
      width, height,
      background: '#0d0d0d',
      borderRadius: 10,
      border: '1px solid rgba(242,234,216,0.10)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ marginTop: 14, textAlign: 'center', zIndex: 2 }}>
        <div style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 20, color: '#F2EAD8', letterSpacing: 3 }}>{label}</div>
        {sub && <div style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 13, color: 'rgba(242,234,216,0.45)', marginTop: 2, maxWidth: width - 40 }}>{sub}</div>}
      </div>

      {/* the void scene */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* ground line */}
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: groundY, height: 2, background: 'rgba(242,234,216,0.22)' }} />

        {anchor === 'top' ? (
          /* looming crop: entity hangs from the top, legs run off-frame */
          <EntityFig style={{ position: 'absolute', top: 52, left: `${50 - (entityW / width) * 50}%` }} />
        ) : entityCorner ? (
          /* shrunken: cowering in the corner, hero centre-frame for scale */
          <>
            {heroPose && (
              <div style={{
                position: 'absolute', bottom: groundY - 2, left: `${50 - (heroHeight * 780 / 900 / width) * 60}%`,
                width: heroHeight * 780 / 900, height: heroHeight, display: 'flex',
              }}>
                <StickGuy pose={heroPose} width={heroHeight * 780 / 900} height={heroHeight} shadow={false} />
              </div>
            )}
            <EntityFig style={{ position: 'absolute', right: 26, bottom: groundY - 2 }} />
          </>
        ) : (
          /* default: both figures on the ground line */
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: groundY - 2,
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 18,
          }}>
            {heroPose && (
              <div style={{ width: heroHeight * 780 / 900, height: heroHeight, display: 'flex' }}>
                <StickGuy pose={heroPose} width={heroHeight * 780 / 900} height={heroHeight} shadow={false} />
              </div>
            )}
            <EntityFig />
          </div>
        )}

        {redText && (
          <div style={{
            position: 'absolute', right: width * 0.07, top: height * 0.42,
            fontFamily: 'Patrick Hand, monospace', fontSize: 17, color: '#E8392F',
            transform: 'rotate(-4deg)',
            textShadow: '0 0 12px rgba(232,57,47,0.5)',
          }}>
            {redText}
          </div>
        )}
      </div>
    </div>
  );
};

const ENTITY_VIEWBOX_ASPECT_W = 850;
const ENTITY_VIEWBOX_ASPECT_H = 880;

/* ── Row 2: the size arc — entity shrinks, hero grows into resolve ── */
const ARC = [
  { entityScale: 2.2, state: ENTITY_STATES.dominating, hero: 'slouch' as const, red: "you can't." },
  { entityScale: 1.6, state: ENTITY_STATES.tempting, hero: 'huddle' as const, red: 'why even try?' },
  { entityScale: 1.0, state: ENTITY_STATES.mirror, hero: 'sit-edge' as const },
  { entityScale: 0.5, state: { ...ENTITY_STATES.tempting, pose: { ...ENTITY_STATES.tempting.pose, scale: 0.5 } }, hero: 'resolve' as const },
  { entityScale: 0.16, state: ENTITY_STATES.shrunken, hero: 'resolve' as const },
];

export const EntityPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;

  return (
    <AbsoluteFill style={{ background: '#161616', padding: '36px 60px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      {/* Row 1 — the four states */}
      <div style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 15, color: '#E8392F', letterSpacing: 4 }}>
        THE ENTITY — FOUR STAGING STATES
      </div>
      <div style={{ display: 'flex', gap: 22, justifyContent: 'center' }}>
        <Scene
          label="TEMPTING" sub={ENTITY_STATES.tempting.hint}
          entityPose={ENTITY_STATES.tempting.pose} entityScale={1}
          entityClip={tempt} redText="just one sec."
          width={420} height={430}
        />
        <Scene
          label="DOMINATING" sub={ENTITY_STATES.dominating.hint}
          entityPose={ENTITY_STATES.dominating.pose} entityScale={2.0}
          entityClip={spread} redText="you can't."
          anchor="top"
          width={420} height={430}
        />
        <Scene
          label="MIRROR" sub={ENTITY_STATES.mirror.hint}
          entityPose={ENTITY_STATES.mirror.pose} entityScale={1}
          entityClip={loom}
          width={420} height={430}
        />
        <Scene
          label="SHRUNKEN" sub={ENTITY_STATES.shrunken.hint}
          heroPose={ANIMATIONS.resolve.fn(frame, fps)}
          entityPose={ENTITY_STATES.shrunken.pose} entityScale={0.16}
          entityClip={cower}
          entityCorner
          width={420} height={430}
        />
      </div>

      {/* Row 2 — the size arc */}
      <div style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 15, color: '#E8392F', letterSpacing: 4 }}>
        THE ARC — SIZE IS THE EMOTION (ROLE-REVERSAL)
      </div>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
        {ARC.map((a, i) => {
          const heroPose = ANIMATIONS[a.hero].fn((frame + i * 13) % Math.round(ANIMATIONS[a.hero].duration * fps), fps);
          return (
            <Scene
              key={i}
              label={`STEP ${i + 1}`}
              heroPose={heroPose}
              heroHeight={150}
              entityPose={a.state.pose}
              entityScale={a.entityScale}
              entityClip={a.entityScale >= 0.4 ? loom : cower}
              redText={a.red}
              anchor={a.entityScale > 1.1 ? 'top' : 'bottom'}
              entityCorner={a.entityScale < 0.4}
              width={340}
              height={330}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
