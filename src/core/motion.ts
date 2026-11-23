/**
 * core/motion: the animation principles as small functions (23 Nov 2026).
 * Everything is a pure function of the frame, so previews and renders always match.
 *
 * Use these instead of bare interpolate():
 *   weight        -> springAt(f, start, 'heavy' | 'snappy' | 'bouncy' | 'gentle')
 *   anticipation  -> anticipate(f, start, dur)        (dips back before it goes)
 *   overlap       -> followSpring(driver, f)          (hair, props, head: arrive late and settle)
 *   arcs          -> arc(a, b, lift, k)               (things travel on curves, not straight lines)
 *   squash        -> stretchFromSpeed(v), impactSquash(f, hitFrame)
 *   life          -> wiggle(f, seed)                  (nothing alive is perfectly still)
 */
import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './time';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export type P = {x: number; y: number};
export const lerpP = (a: P, b: P, k: number): P => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});

/** Named easings. Default to `out` for arrivals, `inOut` for camera and travel, `in` only for exits. */
export const E = {
  out: Easing.out(Easing.cubic),
  in: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  expo: Easing.out(Easing.exp),
  back: Easing.out(Easing.back(1.6)),
  linear: (x: number) => x,
};
/** 0 -> 1 between frames a and b */
export const tween = (f: number, a: number, b: number, ease: (x: number) => number = E.out) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** How heavy a thing feels. Pick by the object, not by taste: a coin is snappy, a safe is heavy. */
export const FEEL = {
  snappy: {mass: 0.6, damping: 14, stiffness: 220},
  bouncy: {mass: 0.8, damping: 9, stiffness: 170},
  heavy: {mass: 2.2, damping: 20, stiffness: 120},
  gentle: {mass: 1, damping: 22, stiffness: 90},
} as const;
export type Feel = keyof typeof FEEL;
/** spring 0 -> 1 starting at `start` */
export const springAt = (f: number, start: number, feel: Feel = 'snappy', fps = FPS) =>
  f < start ? 0 : spring({frame: f - start, fps, config: FEEL[feel]});

/**
 * Spring named by damping ratio, the way motion designers judge it (HyperFrames motion reference, measured on
 * its launch films): 1.0 never bounces, 0.7–0.85 reads premium, 0.4–0.6 playful, under 0.3 a cartoon.
 * `period` = seconds for one swing. Position and size may bounce; opacity and colour never do.
 */
export const springRatio = (f: number, start: number, ratio = 0.8, period = 0.45, fps = FPS) => {
  const t = (f - start) / fps;
  if (t <= 0) return 0;
  const w = (2 * Math.PI) / period;
  if (ratio >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - ratio * ratio);
  return 1 - Math.exp(-ratio * w * t) * (Math.cos(wd * t) + ((ratio * w) / wd) * Math.sin(wd * t));
};

/** Anticipation: dips to -back in the first quarter, then drives to 1 with a small overshoot. */
export const anticipate = (f: number, start: number, dur: number, back = 0.12) => {
  const k = clamp((f - start) / dur);
  if (k <= 0) return 0;
  if (k < 0.25) return -back * E.inOut(k / 0.25);
  return lerp(-back, 1, Easing.out(Easing.back(1.4))((k - 0.25) / 0.75));
};

/** Reading-order stagger: item i starts `gap` frames after item i-1. */
export const stagger = (f: number, i: number, gap = 4) => f - i * gap;

/** A point on an arc from a to b that rises `lift` px at the middle (k = 0..1). */
export const arc = (a: P, b: P, lift: number, k: number): P => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - Math.sin(Math.PI * clamp(k)) * lift});

/**
 * Overlapping action: a value that chases `driver` through a spring, so it lags, overshoots and settles.
 * Use for anything attached to a moving thing (a held phone, hair, a head following the body).
 * Simulated from `window` frames back, so it is deterministic at any frame.
 */
export const followSpring = (driver: (f: number) => number, f: number, o: {stiffness?: number; damping?: number; window?: number; fps?: number} = {}) => {
  const {stiffness = 120, damping = 14, window = 90, fps = FPS} = o;
  const f0 = Math.max(0, Math.floor(f) - window);
  let x = driver(f0), v = 0;
  const dt = 1 / fps / 2;
  for (let i = f0; i < f; i++) {
    for (let s = 0; s < 2; s++) {
      const target = driver(i + (s + 1) / 2);
      v += (stiffness * (target - x) - damping * v) * dt;
      x += v * dt;
    }
  }
  return x;
};

/** Stretch along the direction of travel from speed (px per frame); volume is kept (sx * sy = 1). */
export const stretchFromSpeed = (speed: number, amount = 0.012, max = 0.3) => {
  const s = 1 + clamp(Math.abs(speed) * amount, 0, max);
  return {along: s, across: 1 / s};
};
/** Squash on landing at `hit`, ringing out over ~12 frames. Returns scale for x (wider) and y (flatter). */
export const impactSquash = (f: number, hit: number, strength = 0.22) => {
  const t = f - hit;
  if (t < 0) return {sx: 1, sy: 1};
  const s = strength * Math.exp(-t / 4.5) * Math.cos(t * 0.85);
  return {sx: 1 + s, sy: 1 - s};
};

/** Small organic drift in -amp..amp. Deterministic; different `seed` = different motion. */
export const wiggle = (f: number, seed = 0, speed = 1, amp = 1) =>
  amp * (Math.sin(f * 0.071 * speed + seed * 12.9898) * 0.6 + Math.sin(f * 0.173 * speed + seed * 78.233) * 0.3 + Math.sin(f * 0.031 * speed + seed * 37.719) * 0.1);

/** Blink: returns 0..1 lid closure. One blink every `every` frames with a seed-dependent offset. */
export const blink = (f: number, seed = 0, every = 96) => {
  const t = (f + seed * 37) % every;
  return t < 3 ? t / 3 : t < 6 ? 1 - (t - 3) / 3 : 0;
};
