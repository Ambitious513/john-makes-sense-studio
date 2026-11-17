// ============================================================
// DESIGN TOKENS â€” All visual constants in one place
// Based on Day One Films analysis + upgraded psychology niche
// ============================================================

export const COLORS = {
  // Canvas
  BLACK: '#000000',
  NEAR_BLACK: '#050505',

  // Main character (Sheet 2 â€” exhausted protagonist)
  CHAR_SKIN: '#C8BBAA',         // Warm grey-beige skin
  CHAR_SKIN_SHADOW: '#A89880',  // Shadow tone
  CHAR_EYE_WHITE: '#E8E0D8',   // Slightly warm white sclera
  CHAR_EYE_IRIS: '#D4A0A0',    // Bloodshot pinkish iris
  CHAR_DARK_CIRCLE: '#7A6070', // Under-eye purple shadow
  CHAR_PANTS: '#5A6070',       // Muted grey-blue pajama pants

  // Inner critic / anxiety character (Sheet 1)
  CRITIC_SKIN: '#D8D0C4',      // Lighter, almost white â€” anxious pallor
  CRITIC_EYE: '#202020',       // Wide dark eyes
  CRITIC_SWEAT: 'rgba(180,220,255,0.7)', // Sweat drop tint

  // Dark entity (addiction / inner demon)
  ENTITY_BODY: '#0D0810',      // Near black with slight purple
  ENTITY_GLOW: '#FF2200',      // Red glowing eyes
  ENTITY_AURA: 'rgba(255,30,0,0.25)', // Soft aura

  // Environment
  BED_FRAME: '#1A1A2A',
  BED_SHEET: '#1E2535',
  BED_PILLOW: '#2A2F40',
  CLOCK_RED: '#FF2200',
  CLOCK_BG: '#0A0A0A',
  LAMP_GOLD: '#FFB347',
  LAMP_GLOW: 'rgba(255,180,70,0.15)',
  MOON_WHITE: 'rgba(240,240,255,0.9)',
  MOON_GLOW: 'rgba(200,210,255,0.08)',
  WINDOW_NIGHT: '#0A0F1A',
  COUCH_DARK: '#1A1A1A',
  TV_BLUE: '#4080FF',
  TV_GLOW: 'rgba(60,120,255,0.12)',
  PHONE_GLOW: 'rgba(100,160,255,0.35)', // Blue phone light on face
  FLOOR_LINE: '#1A1A1A',

  // Accent
  ACCENT_RED: '#FF2200',
  ACCENT_GOLD: '#FFB347',
  ACCENT_BLUE: '#4080FF',
  ACCENT_GREEN: '#00CC66',

  // Typography
  TEXT_WHITE: '#FFFFFF',
  TEXT_OFF_WHITE: '#F0EEE8',
  TEXT_RED: '#FF3322',
  TEXT_GOLD: '#FFB347',
} as const;

export const FONTS = {
  DAY_COUNTER: '"Chewy", cursive',      // Bold handwritten â€” day labels
  STORY_TEXT: '"Patrick Hand", cursive', // Softer â€” story narration text
  UI_MONO: '"Courier New", monospace',   // Screen time counter, UI elements
  DIALOGUE: '"Patrick Hand", cursive',   // Inner voice / speech bubbles
} as const;

export const SIZES = {
  // Canvas
  WIDTH: 1920,
  HEIGHT: 1080,
  FPS: 30,

  // Character (main) â€” proportions in px for 1080p canvas
  CHAR_HEAD_R: 100,       // Head radius
  CHAR_BODY_H: 160,       // Body/torso height
  CHAR_BODY_W: 90,        // Body width
  CHAR_LEG_H: 120,        // Leg height
  CHAR_ARM_L: 100,        // Arm length

  // Day counter font
  DAY_LABEL_SIZE: 90,     // "DAY 7" big label
  STORY_TEXT_SIZE: 52,    // Main centered story text
  SUBTITLE_SIZE: 38,      // Secondary / smaller text
  DIALOGUE_SIZE: 34,      // Speech bubble text
} as const;

export const TIMING = {
  // Frame durations (at 30fps)
  SCENE_TRANSITION: 15,   // 0.5s fade
  TEXT_FADE_IN: 20,       // 0.67s text appear
  TEXT_HOLD: 60,          // 2s text hold
  TEXT_FADE_OUT: 15,      // 0.5s text out
  DAY_COUNTER_DROP: 18,   // 0.6s day counter bounce
  SHORT_PAUSE: 30,        // 1s beat
  LONG_PAUSE: 60,         // 2s beat
} as const;
