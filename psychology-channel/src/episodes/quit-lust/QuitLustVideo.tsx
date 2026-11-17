// ============================================================
// LUST FILM — MASTER: "What Happens When You Quit Lust For 30 Days"
// Shot-for-shot recreation. All scene timing derives from the
// reference audio track (voice + SFX), 261.15s @ 30fps.
// ============================================================
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { BAR, s } from './theme';
import { DayTitle } from './kit';
import {
  S_D1Bed, S_D1Phone, S_D1Dresser, S_D1Never, S_D1Grid, S_D1Sleep,
  S_D3Wide, S_D3Entity, S_D3Close, S_D3Wide2, S_D3Chart, S_D3Crawl, S_D3Sleep2,
  S_D7Clock, S_D7Gym, S_D7Run, S_D7Desk, S_D7Chart, S_D7Run2,
} from './scenes1';
import {
  S_D10Walk, S_D10Phone, S_D10Talk, S_D10Resist, S_D10Leave,
  S_D14Intro, S_D14Couch, S_D14Bed, S_D14Kitchen, S_D14Smile, S_D14Draw,
  S_D21Bench, S_D21Food, S_D21Lockers,
  S_D30Mirror, S_D30Phone, S_D30Morning,
  S_CTA, S_Subscribe, S_Skool,
} from './scenes2';

// ------------------------------------------------------------
// TIMELINE — seconds from the reference audio
// ------------------------------------------------------------
export const TL = {
  d1_bed: [0, 5.3],
  d1_phone: [5.3, 10.3],
  d1_dresser: [10.3, 16.0],
  d1_never: [16.0, 21.0],
  d1_grid: [21.0, 29.6],
  d1_sleep: [29.6, 38.3],
  d3_wide: [38.3, 44.0],
  d3_entity: [44.0, 49.2],
  d3_close: [49.2, 53.6],
  d3_wide2: [53.6, 59.6],
  d3_chart: [59.6, 68.6],
  d3_crawl: [68.6, 73.6],
  d3_sleep2: [73.6, 76.6],
  d7_clock: [76.6, 80.3],
  d7_gym: [80.3, 86.6],
  d7_run: [86.6, 92.4],
  d7_desk: [92.4, 95.7],
  d7_chart: [95.7, 100.7],
  d7_run2: [100.7, 104.9],
  d10_walk: [104.9, 109.9],
  d10_phone: [109.9, 114.7],
  d10_talk: [114.7, 130.0],
  d10_resist: [130.0, 135.1],
  d10_leave: [135.1, 140.0],
  d14_intro: [140.0, 143.6],
  d14_couch: [143.6, 151.6],
  d14_bed: [151.6, 158.1],
  d14_kitchen: [158.1, 163.3],
  d14_smile: [163.3, 170.0],
  d14_draw: [170.0, 180.3],
  d21_bench: [180.3, 192.6],
  d21_food: [192.6, 197.5],
  d21_lockers: [197.5, 206.6],
  d30_mirror: [206.6, 222.4],
  d30_phone: [222.4, 229.3],
  d30_morning: [229.3, 236.4],
  cta: [236.4, 245.4],
  subscribe: [245.4, 253.0],
  skool: [253.0, 261.1548],
} as const;

export type SceneKey = keyof typeof TL;
export const TOTAL = s(261.1548); // 7835 frames

// DAY label boundaries (seconds) — persistent top-center title
const DAYS: Array<{ from: number; to: number; label: string }> = [
  { from: 0, to: 38.3, label: 'DAY 1' },
  { from: 38.3, to: 76.6, label: 'DAY 3' },
  { from: 76.6, to: 104.9, label: 'DAY 7' },
  { from: 104.9, to: 140.0, label: 'DAY 10' },
  { from: 140.0, to: 180.3, label: 'DAY 14' },
  { from: 180.3, to: 211.5, label: 'DAY 21' },
  { from: 211.5, to: 236.4, label: 'DAY 30' },
];

const DayTitleLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <>
      {DAYS.map((d) => {
        const start = s(d.from);
        const end = s(d.to);
        const fadeIn = interpolate(frame, [start, start + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const fadeOut = interpolate(frame, [end - 16, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div key={d.label} style={{ opacity: fadeIn * fadeOut }}>
            <DayTitle label={d.label} />
          </div>
        );
      })}
      {/* d14 title gets a special grey centered variant inside its scene; hide top title there */}
      {t >= 140.0 && t < 143.6 && (
        <div style={{ position: 'absolute', inset: 0, background: '#020202', opacity: interpolate(frame, [s(140.0), s(140.0) + 10], [1, 0], { extrapolateRight: 'clamp' }) }} />
      )}
    </>
  );
};

// Scene wrapper: fades in/out through black at boundaries like the reference
const FadeWrap: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const fi = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const fo = interpolate(frame, [dur - 12, dur], [1, 0], { extrapolateLeft: 'clamp' });
  const o = Math.min(fi, fo);
  return (
    <AbsoluteFill>
      {children}
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 1 - o, zIndex: 55, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

const SCENES: Array<{ key: SceneKey; el: React.FC }> = [
  { key: 'd1_bed', el: S_D1Bed },
  { key: 'd1_phone', el: S_D1Phone },
  { key: 'd1_dresser', el: S_D1Dresser },
  { key: 'd1_never', el: S_D1Never },
  { key: 'd1_grid', el: S_D1Grid },
  { key: 'd1_sleep', el: S_D1Sleep },
  { key: 'd3_wide', el: S_D3Wide },
  { key: 'd3_entity', el: S_D3Entity },
  { key: 'd3_close', el: S_D3Close },
  { key: 'd3_wide2', el: S_D3Wide2 },
  { key: 'd3_chart', el: S_D3Chart },
  { key: 'd3_crawl', el: S_D3Crawl },
  { key: 'd3_sleep2', el: S_D3Sleep2 },
  { key: 'd7_clock', el: S_D7Clock },
  { key: 'd7_gym', el: S_D7Gym },
  { key: 'd7_run', el: S_D7Run },
  { key: 'd7_desk', el: S_D7Desk },
  { key: 'd7_chart', el: S_D7Chart },
  { key: 'd7_run2', el: S_D7Run2 },
  { key: 'd10_walk', el: S_D10Walk },
  { key: 'd10_phone', el: S_D10Phone },
  { key: 'd10_talk', el: S_D10Talk },
  { key: 'd10_resist', el: S_D10Resist },
  { key: 'd10_leave', el: S_D10Leave },
  { key: 'd14_intro', el: S_D14Intro },
  { key: 'd14_couch', el: S_D14Couch },
  { key: 'd14_bed', el: S_D14Bed },
  { key: 'd14_kitchen', el: S_D14Kitchen },
  { key: 'd14_smile', el: S_D14Smile },
  { key: 'd14_draw', el: S_D14Draw },
  { key: 'd21_bench', el: S_D21Bench },
  { key: 'd21_food', el: S_D21Food },
  { key: 'd21_lockers', el: S_D21Lockers },
  { key: 'd30_mirror', el: S_D30Mirror },
  { key: 'd30_phone', el: S_D30Phone },
  { key: 'd30_morning', el: S_D30Morning },
  { key: 'cta', el: S_CTA },
  { key: 'subscribe', el: S_Subscribe },
  { key: 'skool', el: S_Skool },
];

export const QuitLustVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Reference soundtrack: voice + SFX, drives all timing */}
      <Audio src={staticFile('lust-voice-sfx.mp3')} />

      {SCENES.map(({ key, el: Scene }) => {
        const [from, to] = TL[key];
        const dur = s(to) - s(from);
        if (dur <= 0) return null;
        return (
          <Sequence key={key} from={s(from)} durationInFrames={dur}>
            <FadeWrap dur={dur}>
              <Scene />
            </FadeWrap>
          </Sequence>
        );
      })}

      {/* Persistent DAY label */}
      <Sequence durationInFrames={TOTAL}>
        <DayTitleLayer />
      </Sequence>

      {/* Letterbox bars (reference is ~2.2:1 inside 16:9) */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000', zIndex: 70 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000', zIndex: 70 }} />
    </AbsoluteFill>
  );
};
