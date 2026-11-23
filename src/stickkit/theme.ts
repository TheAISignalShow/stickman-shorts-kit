/**
 * Stickman Shorts kit: the look (24 Nov 2026, The AI Signal).
 * Dark ground, light figure, ONE accent colour that carries meaning (here: what AI touches and the numbers
 * that matter). Change these seven values to re-skin every Short made with the kit.
 */
export const THEME = {
  /** the ground: near-black with a little blue */
  bg: '#0E1015',
  bg2: '#161922',
  /** figures, line art and main text */
  ink: '#F2F0EA',
  /** far-side limbs, secondary text, inactive things */
  dim: '#8C92A0',
  faint: '#2A2F3B',
  /** the one accent: highlighter yellow */
  accent: '#FFD23F',
  /** text drawn ON the accent or on a white head */
  dark: '#0E1015',
};
export type Theme = typeof THEME;

/** Short format: 1080 × 1920, 30 fps. Keep words and numbers out of the bottom ~22% and the right ~120 px from y 900 down (YouTube's buttons and caption sit there). */
export const SHORT = {w: 1080, h: 1920, fps: 30, safeBottom: 1500, safeRight: 960};
