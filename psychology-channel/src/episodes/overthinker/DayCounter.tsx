// ============================================================
// DAY COUNTER COMPONENT
// The signature "DAY 1" / "DAY 7" drop-bounce title card
// ============================================================
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, FONTS, SIZES } from './tokens';
import { dropBounce, fadeIn } from './motion';

interface DayCounterProps {
  day: number | string;
  startFrame: number;
  position?: 'top-left' | 'top-center' | 'center';
  size?: 'small' | 'large';
}

export const DayCounter: React.FC<DayCounterProps> = ({
  day,
  startFrame,
  position = 'top-center',
  size = 'large',
}) => {
  const frame = useCurrentFrame();
  const translateY = dropBounce(frame, startFrame, 18);
  const opacity = fadeIn(frame, startFrame, 10);

  const posStyle: Record<string, React.CSSProperties> = {
    'top-left':   { position: 'absolute', top: 60,  left: 80  },
    'top-center': { position: 'absolute', top: 60,  left: '50%', transform: 'translateX(-50%)' },
    'center':     { position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' },
  };

  const fontSize = size === 'large' ? SIZES.DAY_LABEL_SIZE : 48;

  return (
    <div
      style={{
        ...posStyle[position],
        opacity,
        transform: `${posStyle[position].transform ?? ''} translateY(${translateY}px)`,
        fontFamily: FONTS.DAY_COUNTER,
        fontSize,
        color: COLORS.TEXT_WHITE,
        fontWeight: 900,
        letterSpacing: '0.04em',
        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {typeof day === 'number' ? `DAY ${day}` : day}
    </div>
  );
};
