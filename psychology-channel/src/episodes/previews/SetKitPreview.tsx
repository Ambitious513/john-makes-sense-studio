// ============================================================
// SetKitPreview — the prop department showcase
// Each cell stages a prop in its signature scene from the
// reference study (§4): couch doomscroll, spotlight defeat,
// clock beats, mirror shame, costume states.
// ============================================================
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { StickGuy } from '../../characters/StickGuy/StickGuy';
import { ANIMATIONS } from '../../characters/StickGuy/animations';
import { Entity } from '../../characters/Entity/Entity';
import { ENTITY_STATES } from '../../characters/Entity/states';
import {
  VoidRoom, SpotlightCone, LedClock, WallClock, DeskLamp,
  Couch, Dresser, CrackedMirror, SoccerBall, RedHeadband, RedBeanie,
} from '../../characters/SetKit/SetKit';

export const SETKIT_PREVIEW_DURATION = 300;

/* Small titled cell with a ground line */
const Cell: React.FC<{ label: string; w: number; h: number; children: React.ReactNode }> = ({ label, w, h, children }) => (
  <div style={{ position: 'relative', width: w, height: h, background: '#0d0d0d', borderRadius: 10, border: '1px solid rgba(242,234,216,0.10)', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 20, right: 20, bottom: h * 0.18, height: 2, background: 'rgba(242,234,216,0.20)' }} />
    <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
      <span style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 14, color: 'rgba(242,234,216,0.6)', letterSpacing: 2 }}>{label}</span>
    </div>
    {children}
  </div>
);

/* Hero figure anchored bottom-centre; headSlot / handSlotR pass through */
const Hero: React.FC<{
  pose: React.ComponentProps<typeof StickGuy>['pose'];
  h?: number;
  headSlot?: React.ReactNode;
  handSlotR?: React.ReactNode;
  dx?: number;
}> = ({ pose, h = 220, headSlot, handSlotR, dx = 0 }) => {
  const w = h * 780 / 900;
  return (
    <div style={{ position: 'absolute', bottom: '18%', left: `calc(50% + ${dx}px - ${w / 2}px)`, width: w, height: h, display: 'flex' }}>
      <StickGuy pose={pose} width={w} height={h} shadow={false} headSlot={headSlot} handSlotR={handSlotR} />
    </div>
  );
};

const PhoneGlow: React.FC = () => (
  <g transform="translate(-40 -34)">
    <rect x={-15} y={-27} width={30} height={54} rx={6} fill="#12161C" stroke="#0B1016" strokeWidth={3} />
    <rect x={-11} y={-23} width={22} height={46} rx={4} fill="#7FB8E8" opacity={0.85} />
  </g>
);

export const SetKitPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slouchPose = ANIMATIONS.slouch.fn(frame, fps);
  const huddlePose = ANIMATIONS.huddle.fn(frame, fps);
  const resolvePose = ANIMATIONS.resolve.fn(frame, fps);
  const sitEdgePose = ANIMATIONS['sit-edge'].fn(frame, fps);

  return (
    <AbsoluteFill style={{ background: '#161616', padding: '30px 50px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 15, color: '#E8392F', letterSpacing: 4 }}>
        SET KIT — VOID ROOM · LIGHTS · CLOCKS · FURNITURE · COSTUME
      </div>

      {/* Row 1 */}
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
        <Cell label="VOID ROOM + COUCH DOOMSCROLL" w={620} h={400}>
          <VoidRoom groundFrac={0.18} />
          <div style={{ position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%)' }}>
            <Couch width={560} height={268} />
          </div>
          <Hero pose={slouchPose} h={190} handSlotR={<PhoneGlow />} />
          {/* phone glow light on the face */}
          <div style={{ position: 'absolute', bottom: '30%', left: '50%', transform: 'translateX(-30px)', width: 90, height: 110, background: 'radial-gradient(ellipse at center, rgba(127,184,232,0.18) 0%, transparent 70%)' }} />
        </Cell>

        <Cell label="SPOTLIGHT + DESK LAMP" w={620} h={400}>
          <VoidRoom groundFrac={0.18} />
          <SpotlightCone x={38} topY={0} bottomY={82} spread={17} opacity={0.4} />
          <Hero pose={huddlePose} h={190} dx={-140} />
          <div style={{ position: 'absolute', bottom: '18%', right: 30 }}>
            <DeskLamp width={240} height={280} />
          </div>
          {/* dresser + wall clock behind */}
          <div style={{ position: 'absolute', bottom: '18%', right: 250, opacity: 0.9 }}>
            <Dresser width={200} height={140} />
          </div>
          <div style={{ position: 'absolute', top: 40, right: 290 }}>
            <WallClock h={2} m={14} width={70} height={70} />
          </div>
        </Cell>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
        <Cell label="RED LED CLOCK — 2:14 AM" w={470} h={400}>
          <VoidRoom groundFrac={0.18} />
          <div style={{ position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)' }}>
            <LedClock time="2:14" blink frame={frame} width={190} height={88} />
          </div>
          <Hero pose={sitEdgePose} h={185} />
        </Cell>

        <Cell label="CRACKED MIRROR — REFLECTION = THE ENTITY" w={470} h={400}>
          <VoidRoom groundFrac={0.18} />
          <div style={{ position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-32%)' }}>
            <CrackedMirror crack={1} width={210} height={330} reflection={<Entity pose={{ ...ENTITY_STATES.mirror.pose, scale: 0.62, x: 0 }} width={210} height={330} viewBox="-240 -100 660 900" />} />
          </div>
          <Hero pose={ANIMATIONS.idle.fn(frame, fps)} h={165} dx={-120} />
        </Cell>

        <Cell label="COSTUME = MINDSET" w={470} h={400}>
          <VoidRoom groundFrac={0.18} />
          <Hero pose={resolvePose} h={180} dx={-105} headSlot={<RedHeadband />} />
          <div style={{ position: 'absolute', bottom: '18%', left: '50%', width: 2, height: 140, background: 'rgba(242,234,216,0.12)' }} />
          <Hero pose={ANIMATIONS.wave.fn(frame, fps)} h={130} dx={105} headSlot={<RedBeanie />} />
          <div style={{ position: 'absolute', bottom: '20%', right: 44 }}>
            <SoccerBall width={54} height={54} />
          </div>
        </Cell>
      </div>
    </AbsoluteFill>
  );
};
