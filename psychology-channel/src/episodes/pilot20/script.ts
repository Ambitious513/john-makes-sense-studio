/**
 * PILOT 20 s — the timing bible.
 *
 * Every number in here was measured, not guessed: the voice timings come from
 * `tools/tts.py` (edge-tts word boundaries at 30 fps, written to
 * public/voice/pilot20-lN.words.json), and the shots are cut against those
 * timings. The storyboard doc (docs/pilot/20s-test/storyboard.md) quotes the
 * same numbers, so picture, script and doc cannot drift apart.
 */

export const FPS = 30;
export const DURATION = 600; // 20.00 s

export type Shot = {
  id: 'S1' | 'S2' | 'S3';
  from: number;
  to: number;
  /** generated clip that will replace the previz plate */
  plate: string;
  label: string;
};

export const SHOTS: Shot[] = [
  { id: 'S1', from: 0, to: 132, plate: 'generated/pilot20/s1.mp4', label: 'WIDE — he stands still' },
  { id: 'S2', from: 132, to: 366, plate: 'generated/pilot20/s2.mp4', label: 'MEDIUM — the turn + shrug' },
  { id: 'S3', from: 366, to: 600, plate: 'generated/pilot20/s3.mp4', label: 'CLOSE — the line lands' },
];

export type Line = {
  id: 'L1' | 'L2' | 'L3';
  mp3: string;
  words: string;
  from: number;
  /** measured, and asserted against the mp3 at render time by the doc's table */
  seconds: number;
  text: string;
};

export const LINES: Line[] = [
  {
    id: 'L1',
    mp3: 'voice/pilot20-l1.mp3',
    words: 'voice/pilot20-l1.words.json',
    from: 10,
    seconds: 2.952,
    text: 'You ever feel tired after doing nothing all day?',
  },
  {
    id: 'L2',
    mp3: 'voice/pilot20-l2.mp3',
    words: 'voice/pilot20-l2.words.json',
    from: 141,
    seconds: 6.288,
    text: "Your brain isn't a battery. It's a prediction machine, and with nothing to confirm, it loops.",
  },
  {
    id: 'L3',
    mp3: 'voice/pilot20-l3.mp3',
    words: 'voice/pilot20-l3.words.json',
    from: 408,
    seconds: 4.584,
    text: "Rest isn't the absence of work. It's the presence of a finish line.",
  },
];

export type Card = { from: number; to: number; text: string };

export const CARDS: Card[] = [
  { from: 16, to: 124, text: 'Tired after doing nothing?' },
  { from: 300, to: 356, text: 'It loops.' },
  { from: 520, to: 592, text: 'A finish line.' },
];

export const BUG = 'John Makes Sense';

/* ------------------------------------------------------------------ *
 * AS-IS CUT — the generated clips are the hero. No motion transfer.
 *
 * Flow returned ~4 s clips, so the honest native-speed cut is 11.6 s, not
 * 20 s. Every frame of every clip is used at playbackRate 1; the picture is
 * never re-timed, re-animated or replaced. The VO below was re-cut to fit.
 * ------------------------------------------------------------------ */
export const GEN_DURATION = 348; // 11.60 s @ 30 fps

export type GenShot = { from: number; to: number; src: string; label: string };

export const GEN_SHOTS: GenShot[] = [
  { from: 0, to: 121, src: 'generated/pilot20/s1.mp4', label: 'S1 — Flow plate, native speed' },
  { from: 121, to: 227, src: 'generated/pilot20/s2.mp4', label: 'S2 — Flow plate, native speed' },
  { from: 227, to: 348, src: 'generated/pilot20/s3.mp4', label: 'S3 — Flow plate, native speed' },
];

export const GEN_LINES: Line[] = [
  {
    id: 'L1',
    mp3: 'voice/pilot20b-l1.mp3',
    words: 'voice/pilot20b-l1.words.json',
    from: 6,
    seconds: 2.952,
    text: 'You ever feel tired after doing nothing all day?',
  },
  {
    id: 'L2',
    mp3: 'voice/pilot20b-l2.mp3',
    words: 'voice/pilot20b-l2.words.json',
    from: 123,
    seconds: 3.456,
    text: "Your brain isn't a battery. It's a prediction machine.",
  },
  {
    id: 'L3',
    mp3: 'voice/pilot20b-l3.mp3',
    words: 'voice/pilot20b-l3.words.json',
    from: 232,
    seconds: 2.76,
    text: 'Rest is the presence of a finish line.',
  },
];

export const GEN_CARDS: Card[] = [
  { from: 12, to: 112, text: 'Tired after doing nothing?' },
  { from: 144, to: 216, text: 'Not a battery.' },
  { from: 268, to: 338, text: 'A finish line.' },
];
