// Music bed + ambience loop registry (generated with ElevenLabs, see tools/generate-audio.mjs).
// Files live in public/music/ and public/sfx/amb-*.mp3; durations probed with ffprobe.
// Ambience beds are seamless loops — let Remotion's <Audio loop> tile them.

import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

export type MusicEntry = { src: string; seconds: number; loop?: boolean; mood: string };

/** Named instrumental beds for the channel's recurring moods. */
export const MUSIC: Record<'calm-reflective' | 'anxious-tension' | 'hopeful-build' | 'melancholy-night' | 'quirky-playful', MusicEntry> = {
  'calm-reflective': { src: staticFile('music/music-calm-reflective.mp3'), seconds: 60, mood: 'Calm reflective minimal piano, quiet hopeful documentary underscore' },
  'anxious-tension': { src: staticFile('music/music-anxious-tension.mp3'), seconds: 60, mood: 'Anxious psychological tension, pulsing drone, ticking percussion' },
  'hopeful-build': { src: staticFile('music/music-hopeful-build.mp3'), seconds: 60, mood: 'Hopeful uplifting build into a bright gentle climax' },
  'melancholy-night': { src: staticFile('music/music-melancholy-night.mp3'), seconds: 60, mood: 'Melancholy late-night piano, introspective' },
  'quirky-playful': { src: staticFile('music/music-quirky-playful.mp3'), seconds: 60, mood: 'Quirky playful pizzicato and xylophone comedy' },
};

/** Seamless 30s ambience loops (play with loop: true for any length). */
export const AMBIENCE: Record<'bedroom-night' | 'rain-window' | 'cafe' | 'city-night' | 'forest' | 'library' | 'hospital' | 'tv-hiss', MusicEntry> = {
  'bedroom-night': { src: staticFile('sfx/amb-bedroom-night.mp3'), seconds: 30, loop: true, mood: 'Quiet bedroom at night, faint city hum' },
  'rain-window': { src: staticFile('sfx/amb-rain-window.mp3'), seconds: 30, loop: true, mood: 'Steady rain against a window' },
  cafe: { src: staticFile('sfx/amb-cafe.mp3'), seconds: 30, loop: true, mood: 'Cozy cafe chatter and cups' },
  'city-night': { src: staticFile('sfx/amb-city-night.mp3'), seconds: 30, loop: true, mood: 'City street at night, distant traffic' },
  forest: { src: staticFile('sfx/amb-forest.mp3'), seconds: 30, loop: true, mood: 'Gentle forest, birds and leaves' },
  library: { src: staticFile('sfx/amb-library.mp3'), seconds: 30, loop: true, mood: 'Silent library room tone' },
  hospital: { src: staticFile('sfx/amb-hospital.mp3'), seconds: 30, loop: true, mood: 'Hospital room, steady monitor beep' },
  'tv-hiss': { src: staticFile('sfx/amb-tv-hiss.mp3'), seconds: 30, loop: true, mood: 'Soft analog white noise hiss' },
};

export type BedProps = {
  bed: MusicEntry;
  startFrame?: number;
  volume?: number;
};

/** Place a music/ambience bed under a scene, starting at an exact frame. */
export const Bed: React.FC<BedProps> = ({ bed, startFrame = 0, volume = 1 }) => (
  <Sequence from={startFrame} name={`bed:${bed.src.split('/').pop()}`}>
    <Audio src={bed.src} volume={volume} loop={bed.loop ?? false} />
  </Sequence>
);
