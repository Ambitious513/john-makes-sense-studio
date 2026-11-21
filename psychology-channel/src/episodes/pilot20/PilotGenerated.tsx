/**
 * PILOT — AS-IS CUT. The generated clips ARE the hero.
 *
 * Hard rule for this composition: the picture is never re-animated. Each Flow
 * clip plays at native speed (playbackRate 1) in a hard-cut Sequence; no rig,
 * no motion transfer, no freeze, no speed ramp. Code contributes only the
 * narration, keyword cards, corner bug, bed and final mix — the seams listed
 * in docs/architecture.md §2.4.
 *
 * Flow returned 4.03 / 3.54 / 4.03 s clips, so the native cut is 11.60 s.
 * Padding it to 20 s would mean freezing a performance, which would throw away
 * the one thing this test was for. If a 20 s piece is needed later, generate a
 * fourth clip from the last frame and extend the cut — do not hold a frame.
 */
import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from 'remotion';
import { AMBIENCE, MUSIC, Bed } from '../../engine/music';
import { VoiceLine } from '../../engine/voice';
import { Bug, KeywordCard } from './Pilot20';
import { GEN_CARDS, GEN_LINES, GEN_SHOTS } from './script';

export { GEN_DURATION as DURATION } from './script';

const PAPER = '#FCF5EB';

export const PilotGenerated: React.FC = () => {
  const [s1, s2, s3] = GEN_SHOTS;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {[s1, s2, s3].map((shot) => (
        <Sequence key={shot.src} from={shot.from} durationInFrames={shot.to - shot.from} name={shot.label}>
          <OffthreadVideo
            src={staticFile(shot.src)}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Sequence>
      ))}

      <Bug />
      {GEN_CARDS.map((c) => (
        // the generated hero stands on the LEFT, so the cards sit on the clear
        // pavement on the right; this is a graphics position, not a re-frame.
        <KeywordCard key={c.text} {...c} x={1060} />
      ))}
      {GEN_LINES.map((l) => (
        <VoiceLine key={l.id} mp3={l.mp3} startFrame={l.from} />
      ))}

      <Bed bed={MUSIC['calm-reflective']} volume={0.16} />
      <Bed bed={AMBIENCE['city-night']} volume={0.16} />
    </AbsoluteFill>
  );
};
