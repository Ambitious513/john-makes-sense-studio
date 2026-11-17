// ============================================================
// LUST FILM — design tokens extracted from the reference
// "What Happens When You Quit Lust For 30 Days"
// Canvas: 1280x720 (matches source), letterboxed to ~2.2:1
// ============================================================

export const FPS = 30;
export const W = 1280;
export const H = 720;
export const BAR = 56; // letterbox bar height (top & bottom)
export const FLOOR = 556; // y of floor line inside content area

export const C = {
  BG: '#050505',
  BG_VIGNETTE: 'rgba(20,16,12,0.55)',
  CREAM: '#EFE9D9', // main character / text cream
  CREAM_DIM: '#D8D2C2',
  INK: '#101010', // character line work
  FRIEND_SKIN: '#C9A184',
  FRIEND_HAIR: '#4A3226',

  // entity
  ENTITY: '#070608',
  ENTITY_RED: '#FF2A18',
  ENTITY_GLOW: 'rgba(255,42,24,0.55)',

  // environment
  FURN_DARK: '#232326', // dresser / couch / counters
  FURN_EDGE: '#4A4A50',
  BED_SHEET: '#2A3142',
  BED_SHEET_DIM: '#242A38',
  WINDOW_NIGHT: '#0A0F1A',
  WINDOW_EDGE: '#3D4C60',
  MOON: '#C9CBD4',
  CLOCK_RED: '#FF3B30',
  CLOCK_GREY: '#9A9AA2',
  FLOOR_LINE: '#2A2A2A',

  // accents
  GOLD: '#F5B93F',
  RED_TEXT: '#E8392A',
  TEXT_WHITE: '#F2EFE9',
  TEXT_GREY: '#8E8E92',
} as const;

export const F = {
  TITLE: 'Chewy', // "DAY 1" titles
  HAND: 'Patrick Hand', // narration cards, whispers, UI
} as const;

export const s = (sec: number) => Math.round(sec * FPS);
