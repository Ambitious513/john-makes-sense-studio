// ============================================================
// HudPreview — the screen-time counter (study §4 item 6)
// The addiction arc quantified: 0h 06m → 9h 17m ticking frame
// by frame, red past the alarm threshold, day-reset jumps.
// ============================================================
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  ScreenTimeHud, DayTitle, NotificationCluster, type HudTick,
} from '../../characters/Overlays/Overlays';

export const HUD_PREVIEW_DURATION = 300;

const Cell: React.FC<{ label: string; w: number; h: number; children: React.ReactNode }> = ({ label, w, h, children }) => (
  <div style={{ position: 'relative', width: w, height: h, background: '#0d0d0d', borderRadius: 10, border: '1px solid rgba(242,234,216,0.10)', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', zIndex: 80 }}>
      <span style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 14, color: 'rgba(242,234,216,0.6)', letterSpacing: 2 }}>{label}</span>
    </div>
    {children}
  </div>
);

const VoidScene: React.FC = () => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: '#0d0d0d' }} />
    <div style={{ position: 'absolute', left: '5%', right: '5%', bottom: '18%', height: 2, background: 'rgba(242,234,216,0.20)' }} />
  </>
);

/* faint doomscroll phone in the hero's implied hand */
const Phone: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: 74, height: 130,
    borderRadius: 14, background: '#12161C', border: '2px solid rgba(242,234,216,0.22)',
    boxShadow: '0 0 46px rgba(127,184,232,0.20)',
  }} />
);

export const HudPreview: React.FC = () => {
  /* the arc: idle drift → spiral → pinned at 9h 17m; red past 8h */
  const ARC: HudTick[] = [
    { frames: 60, perSecond: 1.2 },     // casual morning drift
    { frames: 130, perSecond: 127 },    // the spiral → 9h 17m
    { frames: 60, perSecond: 0.5 },     // too deep to move
  ];

  /* day-reset: hold yesterday's total, blackout jump, new day ticks */
  const RESET: HudTick[] = [
    { frames: 70, perSecond: 0.6 },     // late-night tail (5h 11m)
    { frames: 12, perSecond: 0 },       // hold through the blackout
    { jumpTo: 6, frames: 10, perSecond: 0 }, // DAY 2 → counter reset
    { frames: 90, perSecond: 3.4 },     // day 2 ticking up again
  ];

  return (
    <AbsoluteFill style={{ background: '#161616', padding: '30px 50px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 15, color: '#E8392F', letterSpacing: 4 }}>
        HUD COUNTER — SCREEN TIME TODAY (THE ADDICTION ARC QUANTIFIED)
      </div>

      <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
        <Cell label="THE ARC — 0h 06m → 9h 17m, RED PAST 8h" w={600} h={380}>
          <VoidScene />
          <Phone x={70} y={210} />
          <ScreenTimeHud from={16} schedule={ARC} startMinutes={6} alarmAt={480} corner="top-left" />
          <DayTitle label="DAY 1" variant="bottom-right" from={16} />
          <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', fontFamily: 'Patrick Hand, monospace', fontSize: 15, color: 'rgba(242,234,216,0.4)' }}>
            drift → spiral 127 min/sec → red past 8h
          </div>
        </Cell>

        <Cell label="DAY RESET — JUMP VIA schedule jumpTo" w={600} h={380}>
          <VoidScene />
          <Phone x={70} y={210} />
          <ScreenTimeHud from={16} schedule={RESET} startMinutes={311} corner="bottom-left" />
          <DayTitle label="DAY 2" variant="top-center" from={102} />
          <div style={{ position: 'absolute', bottom: 16, right: 20, textAlign: 'right', fontFamily: 'Patrick Hand, monospace', fontSize: 14, color: 'rgba(242,234,216,0.4)' }}>
            5h 11m holds → resets to 0h 06m at frame 102
          </div>
        </Cell>
      </div>

      <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
        <Cell label="FULL PAIRING — HUD + NOTIFICATIONS + DAY LABEL" w={600} h={380}>
          <VoidScene />
          <Phone x={70} y={210} />
          <ScreenTimeHud
            from={16}
            startMinutes={41}
            schedule={[{ frames: 60, perSecond: 1.0 }, { frames: 140, perSecond: 9 }]}
            corner="top-left"
          />
          <NotificationCluster
            items={[
              { app: 'SMS', text: 'you up?' },
              { app: 'IG', text: '3 people watched this story' },
            ]}
            from={60}
            stagger={16}
            style={{ position: 'absolute', right: 40, top: 80 }}
          />
          <DayTitle label="THURSDAY" variant="bottom-right" from={16} />
        </Cell>

        <Cell label="CORNERS — ALL FOUR PLACEMENTS" w={600} h={380}>
          <VoidScene />
          <ScreenTimeHud from={16} schedule={[{ frames: 60, perSecond: 2 }]} startMinutes={6} corner="top-left" label="TOP-LEFT (DEFAULT)" />
          <ScreenTimeHud from={36} schedule={[{ frames: 60, perSecond: 2 }]} startMinutes={6} corner="top-right" label="TOP-RIGHT" />
          <ScreenTimeHud from={56} schedule={[{ frames: 60, perSecond: 2 }]} startMinutes={6} corner="bottom-left" label="BOTTOM-LEFT" />
          <ScreenTimeHud from={76} schedule={[{ frames: 60, perSecond: 2 }]} startMinutes={6} corner="bottom-right" label="BOTTOM-RIGHT" />
        </Cell>
      </div>
    </AbsoluteFill>
  );
};
