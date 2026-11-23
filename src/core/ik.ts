/**
 * core/ik: limbs with two bones and a walk whose feet stay planted (23 Nov 2026).
 *
 * Why: rotating a straight leg from the hip makes a character skate. Here the foot gets a target on the ground,
 * the knee is solved from it, and the walk phase comes from DISTANCE travelled, so a planted foot never slides.
 */
import {clamp, lerp, P} from './motion';

/** Solve a two-bone limb from `root` to `target`. `bend` picks which side the middle joint goes (+1 or -1). */
export const twoBone = (root: P, target: P, l1: number, l2: number, bend: 1 | -1 = 1): {joint: P; end: P} => {
  const dx = target.x - root.x, dy = target.y - root.y;
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.001, l1 + l2 - 0.001);
  const a = Math.atan2(dy, dx);
  const b = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  return {
    joint: {x: root.x + Math.cos(a + bend * b) * l1, y: root.y + Math.sin(a + bend * b) * l1},
    end: {x: root.x + Math.cos(a) * d, y: root.y + Math.sin(a) * d},
  };
};

export type Gait = {
  /** foot positions relative to the hip's ground point (x forward-positive in walk direction, y up-negative) */
  footFront: P; footBack: P;
  /** vertical bob of the hips (px, negative = up) and forward lean in degrees */
  bob: number; lean: number;
  /** arm swing -1..1 (front arm goes back when the front leg goes forward) */
  swing: number;
};

/**
 * Walk cycle from distance travelled. `stride` = px covered in one full cycle (two steps).
 * Stance half: the foot moves back exactly as fast as the body moves forward, so it stays put on the ground.
 * Swing half: the foot lifts on an arc and eases forward.
 */
export const walkCycle = (dist: number, stride: number, lift: number): Gait => {
  const p = ((dist / stride) % 1 + 1) % 1;
  const foot = (offset: number): P => {
    const q = (p + offset) % 1;
    if (q < 0.5) return {x: lerp(stride / 4, -stride / 4, q / 0.5), y: 0};
    const t = (q - 0.5) / 0.5;
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    return {x: lerp(-stride / 4, stride / 4, e), y: -Math.sin(Math.PI * t) * lift};
  };
  return {
    footFront: foot(0),
    footBack: foot(0.5),
    bob: -Math.abs(Math.sin(p * Math.PI * 2)) * lift * 0.28,
    lean: 4,
    swing: Math.sin(p * Math.PI * 2),
  };
};
