// ============================================================
// StickFigurePreview — Full character showcase using StickGuy rig
// Shows all 15 animation clips (incl. acting poses) + 7 emotion
// faces + 5 pose presets in Remotion Studio
// ============================================================
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { StickGuy } from '../../characters/StickGuy/StickGuy';
import { ANIMATIONS } from '../../characters/StickGuy/animations';
import { FACE_LIST } from '../../characters/StickGuy/faces';
import { IDLE_POSE, T_POSE } from '../../characters/StickGuy/rig';
import type { AnimationId } from '../../characters/StickGuy/animations';

// ── Pose presets ──────────────────────────────────────────────
const PRESETS = [
  { name: 'T-Pose',      pose: T_POSE },
  { name: 'Relaxed',     pose: IDLE_POSE },
  { name: 'Hands Up',    pose: { ...IDLE_POSE, armL: -78, armR: -78, elbowL: -14, elbowR: -14, eyeOpen: 0.85, mouthOpen: 0.4, mouthSmile: 0.9, browRaise: 6 } },
  { name: 'Wide Stance', pose: { ...IDLE_POSE, legL: 13, legR: 13, footL: 10, footR: 10, armL: 62, armR: 62 } },
  { name: 'Thinking',    pose: { ...IDLE_POSE, armR: 58, elbowR: -118, wristR: -20, headTilt: 7, headTurn: 0.3, lookX: 0.6, browRaise: 4, mouthSmile: 0.1 } },
];

// ── Clip IDs in display order (motion first, then acting) ─────
const CLIP_IDS: AnimationId[] = [
  'idle', 'wave', 'walk', 'run', 'talk', 'jump', 'dance', 'shrug', 'point', 'tpose',
  'slouch', 'huddle', 'sit-edge', 'slump', 'resolve',
];

// ── A phone for the hand slot (doomscroll) ────────────────────
const PhoneProp: React.FC = () => (
  <g transform="translate(-48 -32) rotate(-2)">
    <rect x={-19} y={-34} width={38} height={66} rx={8} fill="#12161C" stroke="#0B1016" strokeWidth={4} />
    <rect x={-15} y={-30} width={30} height={58} rx={5} fill="#7FB8E8" opacity={0.85} />
  </g>
);

// ── Section layout ────────────────────────────────────────────
const CLIP_SEC = 90;   // frames per clip
const FACE_SEC = 75;   // frames per face
const PRESET_SEC = 60; // frames per preset

const CLIP_FRAMES = CLIP_IDS.length * CLIP_SEC;               // 1350
const FACE_FRAMES = FACE_LIST.length * FACE_SEC;              // 525
// ── Total: 15 clips + 7 faces + 5 presets = 2175f (72.5s) ──
export const PREVIEW_DURATION = CLIP_FRAMES + FACE_FRAMES + PRESETS.length * PRESET_SEC;

export const StickFigurePreview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isClipSection   = frame < CLIP_FRAMES;
  const isFaceSection   = !isClipSection && frame < CLIP_FRAMES + FACE_FRAMES;

  const clipIndex       = Math.min(Math.floor(frame / CLIP_SEC), CLIP_IDS.length - 1);
  const clipLocalFrame  = frame % CLIP_SEC;
  const faceIndex       = Math.min(Math.floor((frame - CLIP_FRAMES) / FACE_SEC), FACE_LIST.length - 1);
  const faceLocalFrame  = (frame - CLIP_FRAMES) % FACE_SEC;
  const presetIndex     = Math.min(Math.floor((frame - CLIP_FRAMES - FACE_FRAMES) / PRESET_SEC), PRESETS.length - 1);

  const currentClipId   = CLIP_IDS[clipIndex];
  const currentFace     = FACE_LIST[faceIndex];
  const currentPreset   = PRESETS[presetIndex];

  const sectionFade = interpolate(frame % CLIP_SEC, [0, 10, 80, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const faceFade = interpolate(faceLocalFrame, [0, 8, FACE_SEC - 8, FACE_SEC], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const wantsPhone = currentClipId === 'slouch';

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 32%, #17324f 0%, #0a0d13 72%)' }}>

      {/* ── SECTION: Animation clips ── */}
      {isClipSection && (
        <>
          {/* Hero character — large, centre */}
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 580, height: 660 }}>
              <StickGuy
                pose={ANIMATIONS[currentClipId].fn(clipLocalFrame, fps)}
                handSlotR={wantsPhone ? <PhoneProp /> : undefined}
                shadow
                shadowOpacity={0.22}
              />
            </div>
          </AbsoluteFill>

          {/* Clip strip — small thumbnails bottom row */}
          <div style={{
            position: 'absolute', bottom: 36, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 14,
          }}>
            {CLIP_IDS.map((id) => {
              const clip = ANIMATIONS[id];
              const isActive = id === currentClipId;
              const thumbPose = clip.fn(clipLocalFrame, fps);
              return (
                <div key={id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  opacity: isActive ? 1 : 0.38,
                }}>
                  <div style={{
                    width: 72, height: 84,
                    background: isActive ? 'rgba(200,255,61,0.10)' : 'rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    border: isActive ? '1.5px solid #C8FF3D' : '1.5px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}>
                    <StickGuy
                      pose={isActive ? thumbPose : clip.fn(Math.round(clip.duration * fps * 0.28), fps)}
                      handSlotR={id === 'slouch' ? <PhoneProp /> : undefined}
                      shadow={false}
                      viewBox="-30 -110 750 830"
                      width={72} height={84}
                      strokeWidth={7}
                    />
                  </div>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 10,
                    color: isActive ? '#C8FF3D' : 'rgba(255,255,255,0.4)',
                    fontWeight: isActive ? 700 : 400,
                  }}>
                    {clip.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Clip info top-left */}
          <div style={{
            position: 'absolute', top: 48, left: 72,
            opacity: sectionFade,
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#35E0F2', letterSpacing: 2, marginBottom: 6 }}>
              ANIMATION CLIP {clipIndex + 1} / {CLIP_IDS.length}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 46, fontWeight: 800, color: '#F2F6FF', lineHeight: 1 }}>
              {ANIMATIONS[currentClipId].label.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
              {ANIMATIONS[currentClipId].hint}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              {ANIMATIONS[currentClipId].duration.toFixed(2)}s loop · {Math.round(ANIMATIONS[currentClipId].duration * fps)}f
            </div>
          </div>

          {/* Frame counter top-right */}
          <div style={{
            position: 'absolute', top: 48, right: 72,
            fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'right',
          }}>
            <div>frame {frame} / {PREVIEW_DURATION}</div>
            <div style={{ marginTop: 4 }}>local {clipLocalFrame}f</div>
          </div>
        </>
      )}

      {/* ── SECTION: Emotion faces ── */}
      {isFaceSection && (
        <>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 560, height: 640 }}>
              <StickGuy
                pose={{
                  ...ANIMATIONS.idle.fn(faceLocalFrame, fps, { blink: false }),
                  ...currentFace.pose,
                }}
                shadow
                shadowOpacity={0.22}
              />
            </div>
          </AbsoluteFill>

          {/* Face strip */}
          <div style={{
            position: 'absolute', bottom: 36, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 24,
          }}>
            {FACE_LIST.map((f, i) => {
              const isActive = i === faceIndex;
              return (
                <div key={f.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  opacity: isActive ? 1 : 0.35,
                }}>
                  <div style={{
                    width: 80, height: 94,
                    background: isActive ? 'rgba(255,61,138,0.10)' : 'rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    border: isActive ? '1.5px solid #FF3D8A' : '1.5px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}>
                    <StickGuy
                      pose={{
                        ...ANIMATIONS.idle.fn(Math.round(4.6 * fps * 0.3), fps, { blink: false }),
                        ...f.pose,
                      }}
                      shadow={false}
                      viewBox="180 -40 330 330"
                      width={80} height={94}
                      strokeWidth={7}
                    />
                  </div>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 10,
                    color: isActive ? '#FF3D8A' : 'rgba(255,255,255,0.4)',
                    fontWeight: isActive ? 700 : 400,
                  }}>
                    {f.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Face label */}
          <div style={{ position: 'absolute', top: 48, left: 72, opacity: faceFade }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#FF3D8A', letterSpacing: 2, marginBottom: 6 }}>
              EMOTION FACE {faceIndex + 1} / {FACE_LIST.length}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 46, fontWeight: 800, color: '#F2F6FF', lineHeight: 1 }}>
              {currentFace.label.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
              {currentFace.hint}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              {'{ ...bodyPose, ...FACES.' + currentFace.id + ' }'}
            </div>
          </div>
        </>
      )}

      {/* ── SECTION: Pose presets ── */}
      {!isClipSection && !isFaceSection && (
        <>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 560, height: 640 }}>
              <StickGuy pose={currentPreset.pose} shadow shadowOpacity={0.22} />
            </div>
          </AbsoluteFill>

          {/* Preset strip */}
          <div style={{
            position: 'absolute', bottom: 36, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 24,
          }}>
            {PRESETS.map((p, i) => {
              const isActive = i === presetIndex;
              return (
                <div key={p.name} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  opacity: isActive ? 1 : 0.35,
                }}>
                  <div style={{
                    width: 80, height: 94,
                    background: isActive ? 'rgba(200,255,61,0.10)' : 'rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    border: isActive ? '1.5px solid #C8FF3D' : '1.5px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}>
                    <StickGuy
                      pose={p.pose}
                      shadow={false}
                      viewBox="-30 -110 750 830"
                      width={80} height={94}
                      strokeWidth={7}
                    />
                  </div>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 10,
                    color: isActive ? '#C8FF3D' : 'rgba(255,255,255,0.4)',
                    fontWeight: isActive ? 700 : 400,
                  }}>
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Preset label */}
          <div style={{ position: 'absolute', top: 48, left: 72 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#FF3D8A', letterSpacing: 2, marginBottom: 6 }}>
              POSE PRESET {presetIndex + 1} / {PRESETS.length}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 46, fontWeight: 800, color: '#F2F6FF', lineHeight: 1 }}>
              {currentPreset.name.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
              Static pose · use as a starting point for custom animation
            </div>
          </div>
        </>
      )}

      {/* ── Branding corner ── */}
      <div style={{
        position: 'absolute', bottom: 148, right: 72,
        fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.18)',
        textAlign: 'right', lineHeight: 1.6,
      }}>
        <div style={{ color: 'rgba(200,255,61,0.5)', fontWeight: 700 }}>STICKGUY RIG</div>
        <div>25 joints · 15 clips · 7 faces · pure SVG</div>
        <div>Remotion 4 · React 19</div>
      </div>

    </AbsoluteFill>
  );
};
