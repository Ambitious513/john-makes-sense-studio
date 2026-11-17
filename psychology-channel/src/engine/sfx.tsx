// Local SFX registry + frame-accurate playback layer.
// Sounds live in public/sfx/ (curated subset of "D:\DAY ONE FILM RECREATE\SOUND EFFECTS";
// the full 225-file library manifest is at docs/sfx-library-manifest.json).
// Durations were probed with ffprobe at 44.1 kHz; they are advisory, for scheduling overlap.

import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

export type SfxKey =
  | 'applause' | 'alarm-ring' | 'ascend' | 'aww' | 'bell' | 'blanket' | 'bloop' | 'boom' | 'breath-calm' | 'breath-shaky' | 'buildup'
  | 'camera-flash' | 'camera-shutter' | 'cash-ting' | 'city-horn' | 'click' | 'clock-tick' | 'clock-tick-fast' | 'coin' | 'correct' | 'crowd-murmur' | 'crowd-shock'
  | 'ding' | 'door-close' | 'door-creak'
  | 'fast-forward' | 'flare' | 'footsteps-gravel' | 'footsteps-wood'
  | 'glasses-clink' | 'gears-turning' | 'glitch'
  | 'heartbeat-fast' | 'heartbeat-slow' | 'hit' | 'hurt'
  | 'impact' | 'impact-cinematic'
  | 'key-press' | 'kids-cheer'
  | 'light-energy'
  | 'magic-shimmer' | 'match-strike' | 'message' | 'metal-slam' | 'microwave-beep' | 'mouse-click' | 'mouse-click-2'
  | 'neural-spark' | 'notification'
  | 'paper-crumple' | 'paper-flip' | 'paper-rip' | 'pencil' | 'phone-buzz' | 'phone-type' | 'pop' | 'popup' | 'pulse' | 'punch'
  | 'receive' | 'rewind' | 'riser' | 'riser-tension'
  | 'sci-fi-ui' | 'send' | 'siren-far' | 'spooky-wind' | 'suspense' | 'swipe' | 'switch-flick' | 'swoosh' | 'swoosh-fast'
  | 'terminal-glitch' | 'thud' | 'tv-static' | 'typewriter' | 'typing'
  | 'water-drop' | 'whoosh' | 'whoosh-2' | 'whoosh-arrow' | 'whoosh-fast' | 'whoosh-long' | 'whoosh-short'
  | 'writing' | 'wrong' | 'zipper';

export type SfxEntry = { src: string; seconds: number };

export const SFX: Record<SfxKey, SfxEntry> = {
  applause: { src: staticFile('sfx/applause.wav'), seconds: 25.73 },
  'alarm-ring': { src: staticFile('sfx/alarm-ring.mp3'), seconds: 3 },
  ascend: { src: staticFile('sfx/ascend.mp3'), seconds: 4.4 },
  aww: { src: staticFile('sfx/aww.mp3'), seconds: 1.76 },
  bell: { src: staticFile('sfx/bell.mp3'), seconds: 7.12 },
  blanket: { src: staticFile('sfx/blanket.mp3'), seconds: 2 },
  bloop: { src: staticFile('sfx/bloop.mp3'), seconds: 3 },
  boom: { src: staticFile('sfx/boom.wav'), seconds: 6.5 },
  'breath-calm': { src: staticFile('sfx/breath-calm.mp3'), seconds: 3 },
  'breath-shaky': { src: staticFile('sfx/breath-shaky.mp3'), seconds: 2 },
  buildup: { src: staticFile('sfx/buildup.mp3'), seconds: 1.92 },
  'camera-flash': { src: staticFile('sfx/camera-flash.wav'), seconds: 1.05 },
  'camera-shutter': { src: staticFile('sfx/camera-shutter.mp3'), seconds: 0.63 },
  'cash-ting': { src: staticFile('sfx/cash-ting.mp3'), seconds: 1.4 },
  'city-horn': { src: staticFile('sfx/city-horn.mp3'), seconds: 2 },
  click: { src: staticFile('sfx/click.wav'), seconds: 1.94 },
  'clock-tick': { src: staticFile('sfx/clock-tick.mp3'), seconds: 60.35 },
  'clock-tick-fast': { src: staticFile('sfx/clock-tick-fast.mp3'), seconds: 13.26 },
  coin: { src: staticFile('sfx/coin.mp3'), seconds: 1.78 },
  correct: { src: staticFile('sfx/correct.mp3'), seconds: 1.45 },
  'crowd-murmur': { src: staticFile('sfx/crowd-murmur.mp3'), seconds: 3 },
  'crowd-shock': { src: staticFile('sfx/crowd-shock.mp3'), seconds: 1.5 },
  ding: { src: staticFile('sfx/ding.mp3'), seconds: 2.81 },
  'door-close': { src: staticFile('sfx/door-close.mp3'), seconds: 2 },
  'door-creak': { src: staticFile('sfx/door-creak.mp3'), seconds: 3 },
  'fast-forward': { src: staticFile('sfx/fast-forward.mp3'), seconds: 2.76 },
  flare: { src: staticFile('sfx/flare.mp3'), seconds: 0.86 },
  'footsteps-gravel': { src: staticFile('sfx/footsteps-gravel.mp3'), seconds: 3 },
  'footsteps-wood': { src: staticFile('sfx/footsteps-wood.mp3'), seconds: 3 },
  'glasses-clink': { src: staticFile('sfx/glasses-clink.mp3'), seconds: 2 },
  'gears-turning': { src: staticFile('sfx/gears-turning.wav'), seconds: 9.66 },
  glitch: { src: staticFile('sfx/glitch.mp3'), seconds: 3.02 },
  'heartbeat-fast': { src: staticFile('sfx/heartbeat-fast.mp3'), seconds: 3 },
  'heartbeat-slow': { src: staticFile('sfx/heartbeat-slow.mp3'), seconds: 3 },
  hit: { src: staticFile('sfx/hit.mp3'), seconds: 5.86 },
  hurt: { src: staticFile('sfx/hurt.wav'), seconds: 12.47 },
  impact: { src: staticFile('sfx/impact.wav'), seconds: 5 },
  'impact-cinematic': { src: staticFile('sfx/impact-cinematic.mp3'), seconds: 7.94 },
  'key-press': { src: staticFile('sfx/key-press.mp3'), seconds: 0.39 },
  'kids-cheer': { src: staticFile('sfx/kids-cheer.mp3'), seconds: 4.83 },
  'light-energy': { src: staticFile('sfx/light-energy.mp3'), seconds: 7.41 },
  'magic-shimmer': { src: staticFile('sfx/magic-shimmer.mp3'), seconds: 2 },
  'match-strike': { src: staticFile('sfx/match-strike.mp3'), seconds: 2 },
  message: { src: staticFile('sfx/message.mp3'), seconds: 1.07 },
  'metal-slam': { src: staticFile('sfx/metal-slam.wav'), seconds: 7.41 },
  'microwave-beep': { src: staticFile('sfx/microwave-beep.mp3'), seconds: 1 },
  'mouse-click': { src: staticFile('sfx/mouse-click.mp3'), seconds: 0.34 },
  'mouse-click-2': { src: staticFile('sfx/mouse-click-2.mp3'), seconds: 0.46 },
  'neural-spark': { src: staticFile('sfx/neural-spark.mp3'), seconds: 2 },
  notification: { src: staticFile('sfx/notification.wav'), seconds: 1.9 },
  'paper-crumple': { src: staticFile('sfx/paper-crumple.mp3'), seconds: 2.32 },
  'paper-flip': { src: staticFile('sfx/paper-flip.mp3'), seconds: 1.65 },
  'paper-rip': { src: staticFile('sfx/paper-rip.mp3'), seconds: 0.67 },
  pencil: { src: staticFile('sfx/pencil.mp3'), seconds: 0.52 },
  'phone-buzz': { src: staticFile('sfx/phone-buzz.mp3'), seconds: 2 },
  'phone-type': { src: staticFile('sfx/phone-type.mp3'), seconds: 3 },
  pop: { src: staticFile('sfx/pop.mp3'), seconds: 1.74 },
  popup: { src: staticFile('sfx/popup.mp3'), seconds: 3.97 },
  pulse: { src: staticFile('sfx/pulse.wav'), seconds: 12.54 },
  punch: { src: staticFile('sfx/punch.mp3'), seconds: 0.82 },
  receive: { src: staticFile('sfx/receive.wav'), seconds: 0.79 },
  rewind: { src: staticFile('sfx/rewind.wav'), seconds: 1.92 },
  riser: { src: staticFile('sfx/riser.mp3'), seconds: 2.9 },
  'riser-tension': { src: staticFile('sfx/riser-tension.mp3'), seconds: 3 },
  'sci-fi-ui': { src: staticFile('sfx/sci-fi-ui.mp3'), seconds: 32.14 },
  send: { src: staticFile('sfx/send.wav'), seconds: 0.66 },
  'siren-far': { src: staticFile('sfx/siren-far.mp3'), seconds: 3 },
  'spooky-wind': { src: staticFile('sfx/spooky-wind.wav'), seconds: 8 },
  suspense: { src: staticFile('sfx/suspense.mp3'), seconds: 1.99 },
  swipe: { src: staticFile('sfx/swipe.mp3'), seconds: 9.58 },
  'switch-flick': { src: staticFile('sfx/switch-flick.mp3'), seconds: 1 },
  swoosh: { src: staticFile('sfx/swoosh.mp3'), seconds: 1.46 },
  'swoosh-fast': { src: staticFile('sfx/swoosh-fast.mp3'), seconds: 0.98 },
  'terminal-glitch': { src: staticFile('sfx/terminal-glitch.wav'), seconds: 4.38 },
  thud: { src: staticFile('sfx/thud.mp3'), seconds: 2.88 },
  'tv-static': { src: staticFile('sfx/tv-static.mp3'), seconds: 2 },
  typewriter: { src: staticFile('sfx/typewriter.mp3'), seconds: 5.06 },
  typing: { src: staticFile('sfx/typing.mp3'), seconds: 15.6 },
  'water-drop': { src: staticFile('sfx/water-drop.mp3'), seconds: 2 },
  whoosh: { src: staticFile('sfx/whoosh.mp3'), seconds: 0.48 },
  'whoosh-2': { src: staticFile('sfx/whoosh-2.mp3'), seconds: 0.89 },
  'whoosh-arrow': { src: staticFile('sfx/whoosh-arrow.wav'), seconds: 1.1 },
  'whoosh-fast': { src: staticFile('sfx/whoosh-fast.mp3'), seconds: 1.88 },
  'whoosh-long': { src: staticFile('sfx/whoosh-long.mp3'), seconds: 10.97 },
  'whoosh-short': { src: staticFile('sfx/whoosh-short.mp3'), seconds: 4 },
  writing: { src: staticFile('sfx/writing.mp3'), seconds: 3.07 },
  wrong: { src: staticFile('sfx/wrong.mp3'), seconds: 1.16 },
  zipper: { src: staticFile('sfx/zipper.mp3'), seconds: 1 },
};

/** True length of an effect in frames at the given fps (useful for spacing cues that must not overlap). */
export const sfxFrames = (key: SfxKey, fps: number) => Math.ceil(SFX[key].seconds * fps);

/** One cue: play an effect starting exactly at global frame `f`. */
export type SfxCue = { f: number; sfx: SfxKey; vol?: number };

/**
 * Frame-accurate one-shot layer. Place inside the same composition as the timeline:
 * <SfxLayer cues={[{f: 120, sfx: 'ding'}, {f: 145, sfx: 'whoosh', vol: 0.6}]} />
 */
export const SfxLayer: React.FC<{ cues: SfxCue[] }> = ({ cues }) => (
  <>
    {cues.map((cue, i) => (
      <Sequence key={`${cue.f}-${cue.sfx}-${i}`} from={cue.f} name={`sfx:${cue.sfx}`}>
        <Audio src={SFX[cue.sfx].src} volume={cue.vol ?? 1} />
      </Sequence>
    ))}
  </>
);
