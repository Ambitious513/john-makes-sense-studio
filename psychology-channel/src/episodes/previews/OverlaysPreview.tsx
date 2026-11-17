// ============================================================
// OverlaysPreview — the graphic department showcase
// Speed lines · impact flash · notification cluster · day-title
// variants · stat card · wavy red underline (title-card formula)
// ============================================================
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  SpeedLines, ImpactFlash, NotificationCluster, DayTitle, StatCard, WavyUnderline,
} from '../../characters/Overlays/Overlays';

export const OVERLAYS_PREVIEW_DURATION = 300;

const Cell: React.FC<{ label: string; w: number; h: number; children: React.ReactNode }> = ({ label, w, h, children }) => (
  <div style={{ position: 'relative', width: w, height: h, background: '#0d0d0d', borderRadius: 10, border: '1px solid rgba(242,234,216,0.10)', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', zIndex: 70 }}>
      <span style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 14, color: 'rgba(242,234,216,0.6)', letterSpacing: 2 }}>{label}</span>
    </div>
    {children}
  </div>
);

/* mini void scene used as backdrop for the title variants */
const VoidScene: React.FC<{ groundFrac?: number }> = ({ groundFrac = 0.2 }) => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: '#0d0d0d' }} />
    <div style={{ position: 'absolute', left: '5%', right: '5%', bottom: `${groundFrac * 100}%`, height: 2, background: 'rgba(242,234,216,0.20)' }} />
  </>
);

export const OverlaysPreview: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#161616', padding: '30px 50px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'Patrick Hand, monospace', fontSize: 15, color: '#E8392F', letterSpacing: 4 }}>
        OVERLAYS — SPEED · IMPACT · NOTIFICATIONS · DAY TITLES · STAT CARDS · UNDERLINE
      </div>

      {/* Row 1 */}
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
        <Cell label="SPEED LINES + IMPACT FLASH" w={620} h={340}>
          <VoidScene />
          {/* runner implied by lines only; flash every ~60 frames */}
          <SpeedLines count={9} opacity={0.9} />
          <ImpactFlash from={70} decay={10} />
          <ImpactFlash from={130} decay={10} />
          <ImpactFlash from={190} decay={10} />
          <div style={{ position: 'absolute', top: 46, left: 0, right: 0, textAlign: 'center', fontFamily: 'Chewy, monospace', fontSize: 60, color: '#F2EAD8', letterSpacing: 6 }}>
            PUNCH
          </div>
          <div style={{ position: 'absolute', bottom: 46, left: 0, right: 0, textAlign: 'center', fontFamily: 'Patrick Hand, monospace', fontSize: 17, color: 'rgba(242,234,216,0.5)' }}>
            flash lands at frames 70 / 130 / 190
          </div>
        </Cell>

        <Cell label="NOTIFICATION CLUSTER — SOFT BLUE = DIGITAL" w={620} h={340}>
          <VoidScene />
          {/* faint phone glow bottom-left */}
          <div style={{ position: 'absolute', left: 60, bottom: 40, width: 120, height: 210, borderRadius: 18, background: '#12161C', border: '2px solid rgba(242,234,216,0.25)' }} />
          <NotificationCluster
            items={[
              { app: 'IG', text: '3 people watched this story' },
              { app: 'SMS', text: 'you up?' },
              { app: 'YT', text: 'new upload from your channel' },
            ]}
            from={40}
            stagger={14}
            style={{ position: 'absolute', right: 40, top: 70 }}
          />
        </Cell>
      </div>

      {/* Row 2 — the three day-title variants, one per reference video */}
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
        <Cell label="DAY-TITLE: TOP-LEFT (DISCIPLINE)" w={400} h={290}>
          <VoidScene groundFrac={0.16} />
          <DayTitle label="DAY 47" variant="top-left" from={20} />
          <div style={{ position: 'absolute', bottom: 20, left: 20, fontFamily: 'Patrick Hand, monospace', fontSize: 14, color: 'rgba(242,234,216,0.35)' }}>small caps · persistent</div>
        </Cell>

        <Cell label="DAY-TITLE: TOP-CENTER (QUITLUST)" w={400} h={290}>
          <VoidScene groundFrac={0.16} />
          <DayTitle label="DAY 3" variant="top-center" from={20} />
          <div style={{ position: 'absolute', bottom: 20, left: 20, fontFamily: 'Patrick Hand, monospace', fontSize: 14, color: 'rgba(242,234,216,0.35)' }}>large Chewy · beat-in</div>
        </Cell>

        <Cell label="DAY-TITLE: BOTTOM-RIGHT (PHONEKILLINGYOU)" w={400} h={290}>
          <VoidScene groundFrac={0.16} />
          <DayTitle label="THURSDAY" variant="bottom-right" from={20} />
          <div style={{ position: 'absolute', bottom: 20, left: 20, fontFamily: 'Patrick Hand, monospace', fontSize: 14, color: 'rgba(242,234,216,0.35)' }}>HUD pairing · caps</div>
        </Cell>
      </div>

      {/* Row 3 — stat card + title-card formula */}
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
        <Cell label="STAT CARD — EMPHASIS THROUGH SCALE" w={620} h={270}>
          <VoidScene />
          <StatCard value="7 HOURS A DAY" label="THE AVERAGE SCROLL" from={30} size={0.62} style={{ left: 0, right: 0, top: 62 }} />
        </Cell>

        <Cell label="TITLE CARD FORMULA — WORD + WAVY RED UNDERLINE" w={620} h={270}>
          <VoidScene />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 52, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Chewy, monospace', fontSize: 78, color: '#F2EAD8', letterSpacing: 8 }}>DISCIPLINE</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <WavyUnderline width={420} from={40} strokeWidth={9} />
            </div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: 'Patrick Hand, monospace', fontSize: 24, color: '#F2EAD8' }}>
            you decide<span style={{ color: '#E8392F' }}>.</span>
          </div>
        </Cell>
      </div>
    </AbsoluteFill>
  );
};
