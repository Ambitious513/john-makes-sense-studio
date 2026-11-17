// Voice engine: narration audio + real word timings → lip-sync track.
// Pairs with tools/tts.py (edge-tts), which writes <out>.mp3 + <out>.words.json.
// Output contract (mp3 + words.json) is provider-agnostic: an ElevenLabs generator
// can replace tools/tts.py later without changing any of this.
//
// Usage:
//   const timings = useVoiceTimings('voice/line-01.words.json');  // delayRender-safe
//   const mouth = useViseme(timings, frame);                       // spread into a StickGuy pose
//   <VoiceLine src="voice/line-01.mp3" startFrame={0} />           // the audio itself
//
// Or the combined hook: useVoiceLine({ words: 'voice/line-01.words.json', mp3: 'voice/line-01.mp3' })

import React, { useEffect, useState } from 'react';
import { Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame } from 'remotion';

export type WordTiming = { word: string; f0: number; f1: number };
export type VoiceTimings = {
  text: string;
  voice: string;
  fps: number;
  seconds: number;
  totalFrames: number;
  words: WordTiming[];
};

/** Mouth shapes — mirrors src/characters/StickGuy/rig.ts VISEMES so output plugs into a pose directly. */
const VISEMES = {
  rest: { mouthOpen: 0.0, mouthSmile: 0.55, mouthWidth: 0.92 },
  M: { mouthOpen: 0.0, mouthSmile: 0.35, mouthWidth: 0.8 },
  A: { mouthOpen: 0.85, mouthSmile: 0.35, mouthWidth: 1.05 },
  E: { mouthOpen: 0.35, mouthSmile: 0.75, mouthWidth: 1.2 },
  I: { mouthOpen: 0.18, mouthSmile: 0.9, mouthWidth: 1.25 },
  O: { mouthOpen: 0.7, mouthSmile: -0.1, mouthWidth: 0.62 },
  U: { mouthOpen: 0.42, mouthSmile: -0.15, mouthWidth: 0.5 },
  F: { mouthOpen: 0.16, mouthSmile: 0.4, mouthWidth: 1.0 },
  L: { mouthOpen: 0.45, mouthSmile: 0.5, mouthWidth: 0.95 },
  W: { mouthOpen: 0.3, mouthSmile: -0.2, mouthWidth: 0.45 },
} as const;
type Viseme = keyof typeof VISEMES;

/** Grapheme → viseme — mirrors StickGuy's CHAR_VISEME (kept local so the engine stays decoupled). */
const CHAR_VISEME: Record<string, Viseme> = {
  a: 'A', e: 'E', i: 'I', o: 'O', u: 'U',
  m: 'M', b: 'M', p: 'M',
  f: 'F', v: 'F',
  w: 'W', q: 'W',
  l: 'L', t: 'L', d: 'L', n: 'L',
  s: 'I', z: 'I', c: 'I', k: 'A', g: 'A', h: 'A', j: 'E', r: 'E', x: 'I', y: 'I',
};

/** Loads a .words.json produced by tools/tts.py, blocking the render until it arrives. */
export const useVoiceTimings = (wordsSrc: string): VoiceTimings | null => {
  const [data, setData] = useState<VoiceTimings | null>(null);
  const [handle] = useState(() => delayRender(`voice-timings:${wordsSrc}`));
  useEffect(() => {
    let alive = true;
    fetch(staticFile(wordsSrc))
      .then((r) => r.json() as Promise<VoiceTimings>)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => undefined)
      .finally(() => continueRender(handle));
    return () => {
      alive = false;
    };
  }, [wordsSrc, handle]);
  return data;
};

/** Builds a per-character viseme track from real word timings: each word's letters
 *  are spread across its actual spoken frame span, unlike the chars-per-second guess. */
export const timingsToVisemeTrack = (t: VoiceTimings): { frame: number; viseme: Viseme }[] =>
  t.words.flatMap((w) => {
    const letters = w.word
      .toLowerCase()
      .split('')
      .map((ch) => CHAR_VISEME[ch])
      .filter((v): v is Viseme => Boolean(v));
    if (letters.length === 0) return [{ frame: w.f0, viseme: 'rest' as Viseme }];
    const span = Math.max(w.f1 - w.f0, 1);
    return letters.map((viseme, i) => ({
      frame: Math.round(w.f0 + (span * i) / letters.length),
      viseme,
    }));
  });

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Sample the viseme track at a frame; returns mouth values spread-able into a StickGuy pose. */
export const visemeAt = (
  track: { frame: number; viseme: Viseme }[],
  frame: number,
  blendFrames = 2,
): { mouthOpen: number; mouthSmile: number; mouthWidth: number } => {
  if (track.length === 0) return VISEMES.rest;
  let idx = 0;
  for (let i = 0; i < track.length; i++) if (track[i].frame <= frame) idx = i;
  const cur = track[idx];
  const next = track[Math.min(idx + 1, track.length - 1)];
  const span = Math.max(next.frame - cur.frame, 1);
  const u = clamp01((frame - cur.frame) / Math.min(span, blendFrames));
  const a = VISEMES[cur.viseme];
  const b = VISEMES[next.viseme];
  return {
    mouthOpen: lerp(a.mouthOpen, b.mouthOpen, u),
    mouthSmile: lerp(a.mouthSmile, b.mouthSmile, u),
    mouthWidth: lerp(a.mouthWidth, b.mouthWidth, u),
  };
};

export type VoiceLineProps = {
  mp3: string; // path under public/, e.g. 'voice/line-01.mp3'
  words?: string; // path under public/, e.g. 'voice/line-01.words.json'
  startFrame?: number;
  volume?: number;
};

/** The narration audio itself, starting at an exact frame. */
export const VoiceLine: React.FC<VoiceLineProps> = ({ mp3, startFrame = 0, volume = 1 }) => (
  <Sequence from={startFrame} name={`voice:${mp3}`}>
    <Audio src={staticFile(mp3)} volume={volume} />
  </Sequence>
);

/** Combined hook: timings + the current frame's mouth values (null-safe before load). */
export const useVoiceMouth = (words: string): { mouth: { mouthOpen: number; mouthSmile: number; mouthWidth: number } | null; timings: VoiceTimings | null } => {
  const frame = useCurrentFrame();
  const timings = useVoiceTimings(words);
  if (!timings) return { mouth: null, timings: null };
  return { mouth: visemeAt(timingsToVisemeTrack(timings), frame), timings };
};
