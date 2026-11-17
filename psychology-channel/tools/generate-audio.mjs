// generate-audio.mjs — batch-generate SFX + ambience + music beds with ElevenLabs.
//
// Run: node --env-file=.env.local tools/generate-audio.mjs
// Safe to re-run: files that already exist are skipped (no wasted credits).
//
// Credits: SFX ~40/s (duration set), ambience loops 30s = 1,200 each (loop needs the
// v2 sound model), music ~250/min estimate. Logged per clip below.

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const SFX_DIR = 'public/sfx';
const MUSIC_DIR = 'public/music';
const SFX_V3 = 'eleven_text_to_sound_v3';
const SFX_V2 = 'eleven_text_to_sound_v2'; // v2 required for loop:true; deprecated 2027-03
const MUSIC_V = 'music_v2_5';

/** One-shot SFX: [name, prompt, seconds, promptInfluence] */
const SFX = [
  ['heartbeat-slow', 'Slow calm human heartbeat at rest, deep, close-miked, clean, no music', 3, 0.6],
  ['heartbeat-fast', 'Fast anxious human heartbeat racing, tense, close-miked, no music', 3, 0.6],
  ['breath-calm', 'Slow deep calm breath intake and slow release, close, quiet room', 3, 0.6],
  ['breath-shaky', 'Shaky nervous breathing, short anxious inhales, close mic', 2, 0.6],
  ['phone-buzz', 'Smartphone vibrating buzz on a wooden desk', 2, 0.6],
  ['phone-type', 'Thumb typing quickly on a smartphone glass screen', 3, 0.6],
  ['footsteps-wood', 'Slow footsteps on a creaky wooden floor, close, indoor', 3, 0.5],
  ['footsteps-gravel', 'Slow footsteps on loose gravel at night', 3, 0.5],
  ['door-creak', 'Old wooden door slowly creaking open, tense', 3, 0.5],
  ['door-close', 'Wooden door closing with a soft thud latch', 2, 0.6],
  ['switch-flick', 'Light switch flick, single clean click, close', 1, 0.8],
  ['water-drop', 'Single water drop echoing in a quiet empty room', 2, 0.5],
  ['alarm-ring', 'Harsh old mechanical alarm clock ringing insistently', 3, 0.6],
  ['microwave-beep', 'Microwave end-of-cycle beep, three short electronic beeps', 1, 0.8],
  ['glasses-clink', 'Two drinking glasses clinking together softly', 2, 0.7],
  ['zipper', 'Zipper being pulled up slowly, close fabric sound', 1, 0.7],
  ['blanket', 'Soft weighted blanket fabric rustling as someone settles in', 2, 0.5],
  ['tv-static', 'Old analog television static hiss', 2, 0.6],
  ['city-horn', 'Distant car horn in a city at night, slight reverb', 2, 0.5],
  ['siren-far', 'Distant emergency siren passing far away at night', 3, 0.5],
  ['crowd-murmur', 'Quiet cafe crowd murmur, soft indistinct chatter and cups', 3, 0.4],
  ['match-strike', 'Match striking and small flame igniting, close', 2, 0.7],
  ['riser-tension', 'Cinematic tension riser, rising strings and air, psychological', 3, 0.5],
  ['magic-shimmer', 'Magical shimmering whoosh transition with sparkle', 2, 0.5],
  ['neural-spark', 'Soft electric neural spark, subtle sci-fi synapse pulse', 2, 0.5],
];

/** Seamless ambience beds: [name, prompt] — all 30s, loop:true, v2 model */
const AMB = [
  ['amb-bedroom-night', 'Quiet bedroom at night, soft room tone, faint distant city hum through the window'],
  ['amb-rain-window', 'Steady rain against a window in a quiet dim apartment'],
  ['amb-cafe', 'Cozy cafe ambience, soft chatter, cups clinking, espresso machine hiss'],
  ['amb-city-night', 'City street at night, distant traffic, occasional passing car and far horn'],
  ['amb-forest', 'Gentle forest ambience, birds, wind through leaves, calm'],
  ['amb-library', 'Silent library room tone, very faint page turns, hushed'],
  ['amb-hospital', 'Hospital room with steady heart monitor beeping, soft air'],
  ['amb-tv-hiss', 'Soft analog white noise hiss, quiet television static'],
];

/** Instrumental music beds: [name, prompt] — 60s each */
const MUSIC = [
  ['music-calm-reflective', 'Calm reflective minimal piano with soft ambient pads, quiet hopeful documentary underscore, slow, intimate'],
  ['music-anxious-tension', 'Anxious psychological tension bed, low pulsing synth drone, ticking percussion, uneasy minimal, thriller undertone'],
  ['music-hopeful-build', 'Hopeful uplifting build, warm strings and piano growing into a bright gentle climax, inspirational documentary score'],
  ['music-melancholy-night', 'Melancholy late night piano with soft vinyl warmth, slow introspective ambient underscore'],
  ['music-quirky-playful', 'Quirky playful minimal underscore, pizzicato strings, xylophone, light curious comedy, bouncing rhythm'],
];

const client = new ElevenLabsClient();

const jobs = [];
for (const [name, text, seconds, pi] of SFX) {
  jobs.push({ kind: 'sfx', name, dir: SFX_DIR, seconds, run: () =>
    client.textToSoundEffects.convert({ text, modelId: SFX_V3, durationSeconds: seconds, promptInfluence: pi }) });
}
for (const [name, text] of AMB) {
  jobs.push({ kind: 'amb', name, dir: SFX_DIR, seconds: 30, run: () =>
    client.textToSoundEffects.convert({ text, modelId: SFX_V2, durationSeconds: 30, loop: true, promptInfluence: 0.4 }) });
}
for (const [name, prompt] of MUSIC) {
  jobs.push({ kind: 'music', name, dir: MUSIC_DIR, seconds: 60, run: () =>
    client.music.compose({ prompt, musicLengthMs: 60000, modelId: MUSIC_V, forceInstrumental: true }) });
}

mkdirSync(SFX_DIR, { recursive: true });
mkdirSync(MUSIC_DIR, { recursive: true });

let done = 0;
let skipped = 0;
let failed = 0;
const t0 = Date.now();

for (const job of jobs) {
  const file = path.join(job.dir, `${job.name}.mp3`);
  if (existsSync(file)) {
    skipped++;
    continue;
  }
  try {
    const t = Date.now();
    const audio = await job.run();
    const node = typeof audio.pipe === 'function' ? audio : Readable.fromWeb(audio);
    await pipeline(node, createWriteStream(file));
    done++;
    console.log(`[${done}/${jobs.length}] ${job.kind}/${job.name}.mp3  (${((Date.now() - t) / 1000).toFixed(1)}s)`);
  } catch (err) {
    failed++;
    console.error(`FAIL ${job.kind}/${job.name}: ${err.message ?? err}`);
  }
}

console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(0)}s — generated: ${done}, skipped: ${skipped}, failed: ${failed}`);
if (failed > 0) process.exitCode = 1;
