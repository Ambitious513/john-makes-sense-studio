// ============================================================
// VIDEO 1: "What Happens When You Stop Overthinking for 30 Days"
// FORMAT: Voice Animation (like "Quit Lust 30 Days")
// DURATION: ~4.5 min = 8100 frames @ 30fps
//
// SCENE BREAKDOWN:
//  0â€“90    ACT 1 HOOK  : Black screen â†’ Day 1, 2am, can't sleep
//  90â€“360  DAY 1       : Bedroom, character awake, inner critic present
//  360â€“600 DAY 3       : Spiral visible, inner critic panicking
//  600â€“900 DAY 7       : First moment of metacognition â€” catches himself
//  900â€“1200 DATA VIZ   : Brain / Default Mode Network chart
//  1200â€“1800 DAY 14    : Spirals shorter, flatline energy
//  1800â€“2400 DAY 21    : Real sleep, small wins
//  2400â€“3000 DAY 30    : Control, not perfection
//  3000â€“3300 CTA       : End card
// ============================================================
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from 'remotion';
import { COLORS } from './tokens';
import { MainChar } from './MainChar';
import { InnerCritic } from './InnerCritic';
import { DarkEntity } from './DarkEntity';
import { DayCounter } from './DayCounter';
import { TextCard, Subtitle } from './TextCard';
import {
  BedroomScene,
  LivingRoomScene,
  MindScene,
  DataChart,
} from './Environments';
import {
  DialogueBubble,
  SubscribeCTA,
} from './UIElements';
import { fadeIn, fadeOut } from './motion';

export const OverthinkerVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // ---- Shared transition opacity between scenes ----
  const transitionAt = (f: number) => {
    const half = 10;
    return interpolate(frame, [f, f + half, f + half * 2], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  return (
    <AbsoluteFill style={{ background: COLORS.BLACK }}>

      {/* ================================================
          ACT 1: COLD OPEN â€” Pure black, text only (0â€“90f)
          ================================================ */}
      <Sequence durationInFrames={90}>
        <AbsoluteFill style={{ background: COLORS.BLACK }}>
          <TextCard
            lines={['Day one.']}
            startFrame={0}
            fadeInDur={15}
            holdDur={35}
            fadeOutDur={15}
            size="large"
            style="bold"
          />
          <TextCard
            lines={["It's 2am.", "You're still awake."]}
            startFrame={40}
            fadeInDur={15}
            holdDur={25}
            fadeOutDur={10}
            size="medium"
          />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================
          DAY 1: BEDROOM â€” 90â€“360f (3â€“12s)
          Character sitting on bed, holding phone, inner critic nearby
          ================================================ */}
      <Sequence from={90} durationInFrames={270}>
        <AbsoluteFill>
          {/* Environment */}
          <BedroomScene clockTime="2:14" moonVisible screenTime="3h 45m" />

          {/* Day counter drops in */}
          <DayCounter day={1} startFrame={0} position="top-center" />

          {/* Main character â€” sitting on bed, phone glow */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
               viewBox="0 0 1920 1080">
            <MainChar
              x={700} y={520}
              scale={1.1}
              expression="phone_glow"
              pose="sitting_bed"
              facing="right"
              phoneGlow
            />
          </svg>

          {/* Inner critic appears (smaller, to the right) */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
               viewBox="0 0 1920 1080">
            <g opacity={fadeIn(frame, 60, 25)}>
              <InnerCritic x={1050} y={500} scale={0.7} expression="anxious" />
            </g>
          </svg>

          {/* Dialogue bubbles â€” inner critic thoughts */}
          <DialogueBubble
            text="what did you say to them?"
            x={1120} y={420}
            opacity={fadeIn(frame, 80, 20) * fadeOut(frame, 170, 20)}
          />
          <DialogueBubble
            text="they hate you now."
            x={1080} y={390}
            opacity={fadeIn(frame, 160, 15) * fadeOut(frame, 230, 15)}
          />
          <DialogueBubble
            text="you should've said something else."
            x={1020} y={380}
            opacity={fadeIn(frame, 220, 15) * fadeOut(frame, 270, 10)}
          />

          {/* Subtitle narration */}
          <Subtitle text="Not because you're tired." startFrame={5} duration={55} />
          <Subtitle text="Because your brain won't stop." startFrame={70} duration={60} />
          <Subtitle text="Every conversation. Replayed." startFrame={140} duration={60} />
          <Subtitle text="Every mistake. On loop." startFrame={210} duration={55} />

          {/* Scene wipe out */}
          <div style={{
            position: 'absolute', inset: 0, background: COLORS.BLACK,
            opacity: transitionAt(260),
          }} />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================
          DAY 3: MIND SPIRAL â€” 360â€“600f (12â€“20s)
          Abstract mind scene, inner critic in full panic
          ================================================ */}
      <Sequence from={360} durationInFrames={240}>
        <AbsoluteFill>
          <MindScene />
          <DayCounter day={3} startFrame={0} position="top-center" />

          {/* Inner critic â€” big, panicked, centre */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
               viewBox="0 0 1920 1080">
            <g opacity={fadeIn(frame, 15, 20)}>
              <InnerCritic x={960} y={340} scale={1.3} expression="panicked" />
            </g>
          </svg>

          {/* Swirling thought text â€” appears around character */}
          {['why did i say that', 'they noticed', 'what if i fail', 'everyone saw', 'too late now'].map((thought, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${18 + (i * 17) % 65}%`,
              top: `${15 + (i * 23) % 55}%`,
              fontFamily: '"Patrick Hand", cursive',
              fontSize: 28,
              color: 'rgba(255,255,255,0.18)',
              opacity: fadeIn(frame, 20 + i * 15, 20),
              transform: `rotate(${-15 + i * 8}deg)`,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              {thought}
            </div>
          ))}

          <Subtitle text="Day 3. The spiral is louder." startFrame={5} duration={55} />
          <Subtitle text="Your brain is running a highlight reel." startFrame={70} duration={60} />
          <Subtitle text="Of every embarrassing thing you've ever done." startFrame={140} duration={70} />
          <Subtitle text="This is your Default Mode Network talking." startFrame={220} duration={70} />

          <div style={{
            position: 'absolute', inset: 0, background: COLORS.BLACK,
            opacity: transitionAt(230),
          }} />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================
          DAY 7: THE CATCH â€” 600â€“900f (20â€“30s)
          Character catches himself mid-spiral. First moment of control.
          ================================================ */}
      <Sequence from={600} durationInFrames={300}>
        <AbsoluteFill>
          <BedroomScene clockTime="11:30" moonVisible={false} screenTime="1h 20m" />
          <DayCounter day={7} startFrame={0} position="top-center" />

          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
               viewBox="0 0 1920 1080">
            {/* Inner critic shrinking */}
            <g opacity={Math.max(0, 1 - frame / 200)}>
              <InnerCritic x={1050} y={480} scale={0.6 * Math.max(0.3, 1 - frame / 250)} expression="exhausted" />
            </g>

            {/* Main character â€” neutral, sitting, more composed */}
            <MainChar
              x={700} y={520}
              scale={1.1}
              expression="neutral"
              pose="sitting_bed"
              facing="right"
            />

            {/* Thought bubble: awareness */}
            <g opacity={fadeIn(frame, 120, 30)}>
              <text x={960} y={280}
                fill="rgba(255,255,255,0.7)"
                fontSize={38}
                fontFamily='"Patrick Hand", cursive'
                textAnchor="middle">
                wait.
              </text>
              <text x={960} y={330}
                fill="rgba(255,255,255,0.5)"
                fontSize={30}
                fontFamily='"Patrick Hand", cursive'
                textAnchor="middle">
                i'm doing it again.
              </text>
            </g>
          </svg>

          <Subtitle text="Day 7. It happens while you're in bed." startFrame={5} duration={55} />
          <Subtitle text="Mid-spiral â€” you catch yourself." startFrame={70} duration={55} />
          <Subtitle text="Just for a second." startFrame={135} duration={40} />
          <Subtitle text="But you notice." startFrame={185} duration={45} />
          <Subtitle text="That's your prefrontal cortex waking up." startFrame={240} duration={70} />

          <div style={{
            position: 'absolute', inset: 0, background: COLORS.BLACK,
            opacity: transitionAt(290),
          }} />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================
          DATA VISUALIZATION â€” 900â€“1200f (30â€“40s)
          Animated chart: Default Mode Network activity
          ================================================ */}
      <Sequence from={900} durationInFrames={300}>
        <AbsoluteFill style={{ background: COLORS.BLACK }}>
          <DayCounter day="THE SCIENCE" startFrame={0} position="top-center" size="small" />

          {/* Animated chart drawing in */}
          <DataChart
            label="Overthinking Activity (Default Mode Network)"
            data={[
              { x: 'DAY 1', y: 0.9 },
              { x: 'DAY 3', y: 1.0 },
              { x: 'DAY 7', y: 0.75 },
              { x: 'DAY 14', y: 0.55 },
              { x: 'DAY 21', y: 0.35 },
              { x: 'DAY 30', y: 0.2 },
            ]}
            color={COLORS.ACCENT_GOLD}
            drawProgress={interpolate(frame, [30, 240], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}
          />

          <Subtitle text="Your brain has a default mode." startFrame={15} duration={60} />
          <Subtitle text="When you're not focused on a task â€”" startFrame={85} duration={55} />
          <Subtitle text="it thinks about you. Your failures. Your future." startFrame={150} duration={70} />
          <Subtitle text="30 days of interrupting that pattern changes the wiring." startFrame={230} duration={75} />

          <div style={{
            position: 'absolute', inset: 0, background: COLORS.BLACK,
            opacity: transitionAt(290),
          }} />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================
          DAY 14: FLATLINE â€” 1200â€“1800f (40â€“60s)
          Living room, character on couch, blank, no energy
          ================================================ */}
      <Sequence from={1200} durationInFrames={600}>
        <AbsoluteFill>
          <LivingRoomScene tvOn />
          <DayCounter day={14} startFrame={0} position="top-center" />

          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
               viewBox="0 0 1920 1080">
            <MainChar
              x={560} y={490}
              scale={1.0}
              expression="extremely_tired"
              pose="sitting_couch"
              facing="right"
            />
          </svg>

          {/* Dark entity whispers from the side */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
               viewBox="0 0 1920 1080">
            <g opacity={fadeIn(frame, 180, 40)}>
              <DarkEntity x={1400} y={380} scale={0.9}
                whisper="see? it's not working." />
            </g>
          </svg>

          <Subtitle text="Day 14. The flatline." startFrame={5} duration={55} />
          <Subtitle text="No energy. No mood. No spirals." startFrame={70} duration={55} />
          <Subtitle text="But no joy either." startFrame={135} duration={45} />
          <Subtitle text="Your brain is used to noise." startFrame={190} duration={50} />
          <Subtitle text="Now it's learning quiet." startFrame={250} duration={50} />
          <Subtitle text="This is where most people quit." startFrame={350} duration={60} />
          <Subtitle text="It isn't broken. Keep going." startFrame={430} duration={70} />
          <Subtitle text="Boring always comes before better." startFrame={520} duration={70} />

          <div style={{
            position: 'absolute', inset: 0, background: COLORS.BLACK,
            opacity: transitionAt(590),
          }} />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================
          DAY 21: SMALL WINS â€” 1800â€“2400f (60â€“80s)
          Character interacting, more present, inner critic tiny
          ================================================ */}
      <Sequence from={1800} durationInFrames={600}>
        <AbsoluteFill>
          <BedroomScene clockTime="10:30" moonVisible={false} screenTime="0h 45m" />
          <DayCounter day={21} startFrame={0} position="top-center" />

          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
               viewBox="0 0 1920 1080">
            {/* Main char â€” standing, more upright, determined */}
            <MainChar
              x={800} y={440}
              scale={1.1}
              expression="determined"
              pose="standing"
              facing="right"
            />
            {/* Inner critic â€” tiny, far back, shrinking */}
            <g opacity={0.4}>
              <InnerCritic x={300} y={560} scale={0.35} expression="defeated" animated />
            </g>
          </svg>

          <Subtitle text="Day 21. Something shifts." startFrame={5} duration={55} />
          <Subtitle text="The spirals come. But they're shorter." startFrame={70} duration={60} />
          <Subtitle text="You catch them faster." startFrame={140} duration={45} />
          <Subtitle text="You sleep before midnight." startFrame={200} duration={50} />
          <Subtitle text="Food tastes like something again." startFrame={270} duration={55} />
          <Subtitle text="Your brain is rewiring." startFrame={350} duration={50} />
          <Subtitle text="New pathways forming where the spiral used to run." startFrame={420} duration={75} />
          <Subtitle text="It takes repetition. You're doing it." startFrame={510} duration={70} />

          <div style={{
            position: 'absolute', inset: 0, background: COLORS.BLACK,
            opacity: transitionAt(590),
          }} />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================
          DAY 30: CONTROL â€” 2400â€“3000f (80â€“100s)
          Pure black + text. The landing.
          ================================================ */}
      <Sequence from={2400} durationInFrames={600}>
        <AbsoluteFill style={{ background: COLORS.BLACK }}>
          <DayCounter day={30} startFrame={0} position="top-center" />

          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
               viewBox="0 0 1920 1080">
            {/* Main char â€” standing tall, calm */}
            <MainChar
              x={960} y={380}
              scale={1.2}
              expression="neutral"
              pose="standing"
              facing="right"
            />
            {/* Inner critic â€” barely visible, far away */}
            <g opacity={0.15}>
              <InnerCritic x={200} y={600} scale={0.25} expression="defeated" animated={false} />
            </g>
          </svg>

          <Subtitle text="Day 30. The thoughts didn't stop." startFrame={5} duration={65} />
          <Subtitle text="They just stopped running the show." startFrame={80} duration={65} />
          <Subtitle text="That's not perfection." startFrame={160} duration={50} />
          <Subtitle text="That's control." startFrame={220} duration={60} />
          <Subtitle text="And every person who made it to day 30..." startFrame={300} duration={70} />
          <Subtitle text="started exactly where you are right now." startFrame={385} duration={70} />
          <TextCard
            lines={['Start yours today.']}
            startFrame={480}
            fadeInDur={25}
            holdDur={80}
            fadeOutDur={20}
            size="large"
            style="bold"
          />

          <div style={{
            position: 'absolute', inset: 0, background: COLORS.BLACK,
            opacity: transitionAt(590),
          }} />
        </AbsoluteFill>
      </Sequence>

      {/* ================================================
          END CARD CTA â€” 3000â€“3300f (100â€“110s)
          ================================================ */}
      <Sequence from={3000} durationInFrames={300}>
        <SubscribeCTA
          startFrame={0}
          message="If your brain does this â€”"
        />
      </Sequence>

    </AbsoluteFill>
  );
};
