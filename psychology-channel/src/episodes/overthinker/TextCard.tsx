// ============================================================
// TEXT CARD COMPONENT
// Centered story text â€” the voiceless video's storytelling engine
// ============================================================
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, FONTS, SIZES } from './tokens';
import { fadeInOut } from './motion';

interface TextCardProps {
  lines: string[];          // Up to 3 lines
  startFrame: number;
  fadeInDur?: number;
  holdDur?: number;
  fadeOutDur?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: 'story' | 'bold' | 'italic';
}

export const TextCard: React.FC<TextCardProps> = ({
  lines,
  startFrame,
  fadeInDur = 20,
  holdDur = 60,
  fadeOutDur = 15,
  size = 'medium',
  color = COLORS.TEXT_OFF_WHITE,
  align = 'center',
  style = 'story',
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, startFrame, fadeInDur, holdDur, fadeOutDur);

  const fontSizeMap = { small: SIZES.SUBTITLE_SIZE, medium: SIZES.STORY_TEXT_SIZE, large: 68 };
  const fontSize = fontSizeMap[size];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
        justifyContent: 'center',
        padding: '0 160px',
        opacity,
        pointerEvents: 'none',
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONTS.STORY_TEXT,
            fontSize: i === 0 && style === 'bold' ? fontSize * 1.2 : fontSize,
            fontWeight: style === 'bold' ? 700 : 400,
            fontStyle: style === 'italic' ? 'italic' : 'normal',
            color,
            textAlign: align,
            lineHeight: 1.3,
            marginBottom: i < lines.length - 1 ? fontSize * 0.2 : 0,
            textShadow: '0 2px 12px rgba(0,0,0,0.9)',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

// ---- SUBTITLE variant â€” for voice videos, bottom of screen ----
interface SubtitleProps {
  text: string;
  startFrame: number;
  duration: number;
}

export const Subtitle: React.FC<SubtitleProps> = ({ text, startFrame, duration }) => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, startFrame, 8, duration - 16, 8);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity,
        fontFamily: FONTS.STORY_TEXT,
        fontSize: SIZES.SUBTITLE_SIZE,
        color: COLORS.TEXT_WHITE,
        textAlign: 'center',
        textShadow: '0 2px 10px rgba(0,0,0,0.95)',
        maxWidth: 1400,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};
