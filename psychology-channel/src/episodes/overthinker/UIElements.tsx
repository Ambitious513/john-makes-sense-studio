// ============================================================
// SCREEN TIME COUNTER â€” UI overlay (like in Phone Killing You)
// Ticks up over time like a real screen time display
// ============================================================
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from './tokens';

interface ScreenTimeProps {
  startMinutes?: number;    // Starting value in minutes
  endMinutes?: number;      // End value in minutes
  startFrame: number;       // When counter starts ticking
  endFrame: number;         // When counter reaches end value
}

export const ScreenTimeCounter: React.FC<ScreenTimeProps> = ({
  startMinutes = 0,
  endMinutes = 65,
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const currentMinutes = Math.floor(
    interpolate(frame, [startFrame, endFrame], [startMinutes, endMinutes], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const hours = Math.floor(currentMinutes / 60);
  const mins = currentMinutes % 60;
  const display = `${hours}h ${String(mins).padStart(2, '0')}m`;

  return (
    <div style={{ position: 'absolute', top: 60, left: 70 }}>
      <div style={{
        fontFamily: '"Courier New", monospace',
        fontSize: 22,
        color: '#777',
        letterSpacing: '0.08em',
      }}>
        SCREEN TIME TODAY
      </div>
      <div style={{
        fontFamily: '"Courier New", monospace',
        fontSize: 44,
        color: '#DDD',
        fontWeight: 'bold',
        letterSpacing: '0.04em',
        marginTop: 2,
      }}>
        {display}
      </div>
    </div>
  );
};

// ============================================================
// DIALOGUE BUBBLE â€” Inner voice text that appears on screen
// ============================================================
interface DialogueBubbleProps {
  text: string;
  x: number;
  y: number;
  opacity?: number;
  color?: string;
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({
  text, x, y, opacity = 1, color = COLORS.TEXT_OFF_WHITE,
}) => (
  <div style={{
    position: 'absolute',
    left: x,
    top: y,
    opacity,
    background: 'rgba(15,8,8,0.88)',
    border: '1.5px solid rgba(255,80,40,0.35)',
    borderRadius: 10,
    padding: '10px 18px',
    fontFamily: '"Patrick Hand", cursive',
    fontSize: 32,
    fontStyle: 'italic',
    color,
    maxWidth: 320,
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 20px rgba(0,0,0,0.6)',
  }}>
    {text}
  </div>
);

// ============================================================
// SCENE TRANSITION â€” Full-screen black flash between scenes
// ============================================================
interface SceneTransitionProps {
  startFrame: number;
  duration?: number;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  startFrame, duration = 15,
}) => {
  const frame = useCurrentFrame();
  const half = duration / 2;
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + half, startFrame + duration],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  if (opacity <= 0) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#000',
      opacity,
      pointerEvents: 'none',
    }} />
  );
};

// ============================================================
// SUBSCRIBE CTA â€” Animated end card (the Day One Films style)
// ============================================================
interface CTAProps {
  startFrame: number;
  message?: string;
}

export const SubscribeCTA: React.FC<CTAProps> = ({
  startFrame,
  message = 'If this hit you,',
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity,
      background: COLORS.BLACK,
    }}>
      <div style={{
        fontFamily: '"Patrick Hand", cursive',
        fontSize: 52,
        color: COLORS.TEXT_OFF_WHITE,
        textAlign: 'center',
        marginBottom: 16,
      }}>
        {message}
      </div>
      <div style={{
        fontFamily: '"Patrick Hand", cursive',
        fontSize: 68,
        fontWeight: 700,
        color: COLORS.TEXT_WHITE,
        textAlign: 'center',
      }}>
        like and subscribe.
      </div>
    </div>
  );
};
