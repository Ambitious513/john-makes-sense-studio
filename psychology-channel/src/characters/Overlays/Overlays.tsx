/**
 * Overlays — the Day One Films graphic department.
 *
 * Shared screen-space overlays from docs/reference-style-study.md §1 + §4:
 * speed lines, impact white-out, notification bubbles (the only soft-blue
 * "digital" color), day titles (three placement variants), stat cards
 * (emphasis through SCALE, never color) and the wavy red underline.
 *
 * All components are pure functions of the current frame (seekable), read
 * `useCurrentFrame()` themselves and take a `from` frame for their cue.
 * Palette: void #0d0d0d · cream #F2EAD8 · red #E8392F · soft blue (digital only).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const CREAM = '#F2EAD8';
const RED = '#E8392F';
/** the only cool color — always digital (phone UI, notifications) */
const DIGITAL = '#7FB8E8';
const TITLE_FONT = 'Chewy, Patrick Hand, monospace';
const LABEL_FONT = 'Patrick Hand, monospace';

/** clamp-eased 0..1 progress helper (frame window [a,b]) */
const win = (frame: number, a: number, b: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

/* ------------------------------------------------------------------ *
 * SpeedLines — montage burst streaks (DISCIPLINE punch-bag grammar)
 * ------------------------------------------------------------------ */
export const SpeedLines: React.FC<{
  /** streak color; DISCIPLINE's inversion montage uses yellow */
  color?: string;
  count?: number;
  /** overall opacity */
  opacity?: number;
  /** streak direction: 1 = fly left, -1 = fly right */
  direction?: number;
  /** px per frame at count mid-density */
  speed?: number;
  seed?: number;
}> = ({ color = 'rgba(242,234,216,0.16)', count = 9, opacity = 1, direction = 1, speed = 14, seed = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <svg
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const y = 120 + ((i * 173 + seed * 61) % 840);
        const len = 150 + ((i * 97 + seed * 31) % 260);
        const x = direction > 0
          ? (((frame * speed + i * 417 + seed * 200) % 2400)) - 300
          : 2220 - (((frame * speed + i * 417 + seed * 200) % 2400));
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={len}
            height={4 + (i % 3) * 2}
            rx={(4 + (i % 3) * 2) / 2}
            fill={color}
          />
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ *
 * ImpactFlash — one-frame spike white-out that decays (the "punch")
 * ------------------------------------------------------------------ */
export const ImpactFlash: React.FC<{
  /** frame the impact lands on */
  from: number;
  /** opacity at the spike */
  peak?: number;
  /** frames from spike to fully faded */
  decay?: number;
  color?: string;
}> = ({ from, peak = 0.92, decay = 9, color = '#FFFFFF' }) => {
  const frame = useCurrentFrame();
  if (frame < from) return null;
  const t = frame - from;
  const o = t < 2 ? peak : peak * Math.pow(1 - Math.min(1, (t - 2) / decay), 1.6);
  if (o <= 0.002) return null;
  return <div style={{ position: 'absolute', inset: 0, background: color, opacity: o, pointerEvents: 'none' }} />;
};

/* ------------------------------------------------------------------ *
 * NotificationBubble + NotificationCluster — the phone's voice.
 * Soft blue ONLY (digital rule), pop-in with overshoot.
 * ------------------------------------------------------------------ */
export const NotificationBubble: React.FC<{
  /** small app glyph word, e.g. "IG", "SMS", "YT" */
  app?: string;
  text: string;
  /** frame it pops */
  from: number;
  style?: React.CSSProperties;
}> = ({ app, text, from, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = win(frame, from, from + 9, Easing.out(Easing.back(1.9)));
  if (u <= 0) return null;
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: DIGITAL,
        borderRadius: 14, padding: '10px 16px',
        boxShadow: '0 4px 18px rgba(0,0,0,0.45)',
        opacity: u,
        transform: `scale(${0.6 + 0.4 * u}) translateY(${(1 - u) * 14}px)`,
        ...style,
      }}
    >
      {app && (
        <span style={{
          fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 700, color: '#0d0d0d',
          background: CREAM, borderRadius: 8, padding: '3px 7px', letterSpacing: 1,
        }}>{app}</span>
      )}
      <span style={{ fontFamily: LABEL_FONT, fontSize: 20, color: '#10151B', whiteSpace: 'nowrap' }}>{text}</span>
      <span style={{ fontSize: 11, color: 'rgba(16,21,27,0.55)', marginLeft: 2 }}>
        {Math.max(1, Math.round((frame - from) / fps))}m
      </span>
    </div>
  );
};

export const NotificationCluster: React.FC<{
  /** each bubble pops at from + i * stagger */
  items: Array<{ app?: string; text: string }>;
  from: number;
  stagger?: number;
  /** gentle vertical bob once settled */
  drift?: boolean;
  style?: React.CSSProperties;
}> = ({ items, from, stagger = 8, drift = true, style }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', ...style }}>
      {items.map((it, i) => (
        <div key={i} style={{ transform: drift ? `translateY(${Math.sin((frame - from - i * stagger) / 9) * 2.5}px)` : undefined }}>
          <NotificationBubble app={it.app} text={it.text} from={from + i * stagger} />
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * DayTitle — three per-video placement variants (study §1):
 *   'top-left'    small caps  DAY 47            (DISCIPLINE)
 *   'top-center'  large Chewy DAY 3             (QuitLust)
 *   'bottom-right' caps label THURSDAY / DAY 1  (PhoneKillingYou)
 * ------------------------------------------------------------------ */
export const DayTitle: React.FC<{
  label: string;
  variant?: 'top-left' | 'top-center' | 'bottom-right';
  /** fade-in start frame */
  from?: number;
  size?: number;
  color?: string;
}> = ({ label, variant = 'top-left', from = 0, size, color = CREAM }) => {
  const frame = useCurrentFrame();
  const o = win(frame, from, from + 14);
  const slide = (1 - o) * 16;

  const base: React.CSSProperties = {
    position: 'absolute', opacity: o, color, zIndex: 60,
    textShadow: '0 2px 0 rgba(0,0,0,0.6)', pointerEvents: 'none',
  };

  if (variant === 'top-center') {
    return (
      <div style={{
        ...base, top: 54, left: 0, right: 0, textAlign: 'center',
        fontFamily: TITLE_FONT, fontSize: size ?? 72, letterSpacing: 4,
        transform: `scale(${0.94 + 0.06 * o})`,
      }}>
        {label}
      </div>
    );
  }
  if (variant === 'bottom-right') {
    return (
      <div style={{
        ...base, bottom: 40, right: 56,
        fontFamily: LABEL_FONT, fontSize: size ?? 34, letterSpacing: 5,
        transform: `translateX(${slide}px)`,
      }}>
        {label}
      </div>
    );
  }
  return (
    <div style={{
      ...base, top: 44, left: 56,
      fontFamily: LABEL_FONT, fontSize: size ?? 30, letterSpacing: 5,
      transform: `translateX(${-slide}px)`,
    }}>
      {label}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * StatCard — the "data beat" breather (QuitLust): giant value + caps
 * label, emphasis through SCALE not color, beat-in pop.
 * ------------------------------------------------------------------ */
export const StatCard: React.FC<{
  value: string;
  label: string;
  from: number;
  /** relative value scale (the emphasis knob) */
  size?: number;
  /** red = urgency variant (used sparingly) */
  red?: boolean;
  style?: React.CSSProperties;
}> = ({ value, label, from, size = 1, red = false, style }) => {
  const frame = useCurrentFrame();
  const u = win(frame, from, from + 10, Easing.out(Easing.back(1.6)));
  const settle = win(frame, from + 10, from + 22);
  if (u <= 0) return null;
  return (
    <div style={{
      position: 'absolute', textAlign: 'center', opacity: Math.min(1, u),
      transform: `scale(${(0.8 + 0.2 * u) * (1 + 0.04 * (1 - settle))})`,
      ...style,
    }}>
      <div style={{
        fontFamily: TITLE_FONT, fontSize: 150 * size, lineHeight: 1.05,
        color: red ? RED : CREAM, textShadow: '0 4px 0 rgba(0,0,0,0.55)',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: LABEL_FONT, fontSize: 34 * size, letterSpacing: 8,
        color: CREAM, opacity: 0.85, marginTop: 10,
      }}>
        {label}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * ScreenTimeHud — the addiction arc quantified (study §4.6).
 * `SCREEN TIME TODAY 0h 06m → 9h 17m` ticking frame by frame.
 *
 * The value is computed by `screenTimeMinutes()` — a PURE function of the
 * frame driven by a schedule of segments, so scenes, charts and the HUD
 * can all read the SAME number:
 *
 *   { frames, perSecond, jumpTo } — perSecond = minutes added per second
 *   (per-frame increment = perSecond/fps); jumpTo resets the value at the
 *   segment start (the day-title blackout reset); omitting perSecond holds.
 * ------------------------------------------------------------------ */
export interface HudTick {
  /** duration of this segment in frames */
  frames: number;
  /** minutes added per second during this segment (0/undefined = hold) */
  perSecond?: number;
  /** value this segment STARTS from (day-reset jumps) */
  jumpTo?: number;
}

export const screenTimeMinutes = (
  frame: number,
  fps: number,
  from: number,
  startMinutes: number,
  schedule: HudTick[],
): number => {
  if (frame < from) return startMinutes;
  let m = startMinutes;
  let t = frame - from;
  for (const seg of schedule) {
    if (t <= 0) break;
    const used = Math.min(t, seg.frames);
    if (seg.jumpTo !== undefined) m = seg.jumpTo;
    m += ((seg.perSecond ?? 0) * used) / fps;
    t -= used;
  }
  return m;
};

/** `0h 06m` display format */
export const formatScreenTime = (m: number): string =>
  `${Math.floor(m / 60)}h ${String(Math.floor(m % 60)).padStart(2, '0')}m`;

export const ScreenTimeHud: React.FC<{
  /** frame the counter appears */
  from?: number;
  startMinutes?: number;
  schedule: HudTick[];
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  label?: string;
  /** minutes threshold where the value turns RED (urgency rule) */
  alarmAt?: number;
  /** fade-in duration in frames */
  fadeIn?: number;
  style?: React.CSSProperties;
}> = ({
  from = 0,
  startMinutes = 6,
  schedule,
  corner = 'top-left',
  label = 'SCREEN TIME TODAY',
  alarmAt,
  fadeIn = 10,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const minutes = screenTimeMinutes(frame, fps, from, startMinutes, schedule);
  const o = win(frame, from, from + fadeIn);
  if (o <= 0) return null;

  const pos: React.CSSProperties =
    corner === 'top-left' ? { top: 48, left: 56 }
      : corner === 'top-right' ? { top: 48, right: 56 }
        : corner === 'bottom-left' ? { bottom: 44, left: 56 }
          : { bottom: 44, right: 56 };

  const alarm = alarmAt !== undefined && minutes >= alarmAt;

  return (
    <div style={{ position: 'absolute', opacity: o, ...pos, ...style }}>
      <div style={{
        fontFamily: '"Courier New", monospace', fontSize: 21,
        color: 'rgba(242,234,216,0.55)', letterSpacing: '0.14em',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: '"Courier New", monospace', fontSize: 44, fontWeight: 700,
        letterSpacing: '0.04em', marginTop: 2,
        color: alarm ? RED : CREAM,
        textShadow: alarm ? `0 0 16px rgba(232,57,47,0.45)` : '0 2px 0 rgba(0,0,0,0.6)',
      }}>
        {formatScreenTime(minutes)}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * WavyUnderline — hand-drawn red underline stroke, draws itself in.
 * Title-card grammar: giant cream word + this underneath.
 * ------------------------------------------------------------------ */
export const WavyUnderline: React.FC<{
  width: number;
  /** stroke draw-in window */
  from?: number;
  color?: string;
  strokeWidth?: number;
  /** wave amplitude in px */
  amp?: number;
  style?: React.CSSProperties;
}> = ({ width, from = 0, color = RED, strokeWidth = 10, amp = 9, style }) => {
  const frame = useCurrentFrame();
  const u = win(frame, from, from + 16, Easing.out(Easing.cubic));
  const h = amp * 2 + strokeWidth * 2;
  // hand-drawn wave: slightly irregular periods
  const path = (() => {
    const segs = Math.max(4, Math.round(width / 90));
    const seg = width / segs;
    let d = `M 0,${h / 2}`;
    for (let i = 0; i < segs; i++) {
      const cx = seg * (i + 0.5);
      const cy = h / 2 + (i % 2 === 0 ? -amp : amp) * (i % 4 === 3 ? 0.7 : 1);
      d += ` Q ${cx},${cy} ${seg * (i + 1)},${h / 2}`;
    }
    return d;
  })();
  const totalLen = width * 1.25; // generous upper bound for the dash trick
  return (
    <svg
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={totalLen} strokeDashoffset={totalLen * (1 - u)} opacity={0.95} />
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth * 0.5} strokeLinecap="round"
        strokeDasharray={totalLen} strokeDashoffset={totalLen * (1 - u)} opacity={0.4}
        transform={`translate(0 ${strokeWidth * 0.35})`} />
    </svg>
  );
};
