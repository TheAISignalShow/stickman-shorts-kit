/**
 * core/physics: real 2D rigid-body physics (matter-js), precomputed once and read by frame (23 Nov 2026).
 *
 * Why: hand-timed "falls" and "bounces" look wrong because gravity, bounce height, spin and stacking are guessed.
 * Here they are simulated at the scene's real scale, then played back, so they are right by construction.
 *
 *   const sim = simulate({frames: 240, floorY: 900, bodies: [{id: 'coin1', shape: 'circle', r: 26, x: 700, y: -60, at: 30}]});
 *   const s = sim.coin1[frame];   // {x, y, angle, vx, vy, alive}
 *
 * Scale: `pxPerMeter` says how many pixels are one metre in THIS shot (default 360: a 1.7 m person is ~610 px tall).
 * Gravity is then the real 9.81 m/s². Change the scale, not the gravity, when a shot is wider or tighter.
 */
import Matter from 'matter-js';
import {FPS} from './time';

export type BodySpec = {
  id: string;
  shape: 'circle' | 'box';
  x: number; y: number;
  r?: number; w?: number; h?: number;
  angle?: number;
  /** start velocity in px per second, spin in radians per second */
  vx?: number; vy?: number; spin?: number;
  /** bounciness 0..1 (coin on wood ~0.35, rubber ball ~0.8, cardboard box ~0.1) */
  restitution?: number;
  friction?: number;
  density?: number;
  /** frame the body appears (default 0) */
  at?: number;
  isStatic?: boolean;
};
export type SimSpec = {
  frames: number;
  bodies: BodySpec[];
  fps?: number;
  pxPerMeter?: number;
  /** y of the ground surface; omit for no floor */
  floorY?: number;
  /** left and right wall x; omit for none */
  walls?: [number, number];
  substeps?: number;
};
export type BodyState = {x: number; y: number; angle: number; vx: number; vy: number; alive: boolean};
export type Sim = Record<string, BodyState[]>;

const cache = new Map<string, Sim>();

export const simulate = (spec: SimSpec): Sim => {
  const key = JSON.stringify(spec);
  const hit = cache.get(key);
  if (hit) return hit;
  const {frames, bodies, fps = FPS, pxPerMeter = 360, floorY, walls, substeps = 4} = spec;
  const engine = Matter.Engine.create();
  engine.gravity.y = 1;
  engine.gravity.scale = (9.81 * pxPerMeter) / 1e6; // px per ms²
  const world = engine.world;
  const statics: Matter.Body[] = [];
  if (floorY !== undefined) statics.push(Matter.Bodies.rectangle(960, floorY + 200, 8000, 400, {isStatic: true, friction: 0.8, restitution: 0.2}));
  if (walls) for (const x of walls) statics.push(Matter.Bodies.rectangle(x + (x < 960 ? -200 : 200), 0, 400, 8000, {isStatic: true}));
  Matter.Composite.add(world, statics);

  const made = new Map<string, Matter.Body>();
  const out: Sim = {};
  for (const b of bodies) out[b.id] = [];
  const dt = 1000 / fps / substeps;
  const perStep = 1 / 60; // matter-js velocities are px per 1/60 s whatever the step size (checked 23 Nov: a 0.5 s fall = 449 px vs 441 px by formula)
  for (let f = 0; f < frames; f++) {
    for (const b of bodies) {
      if ((b.at ?? 0) === f) {
        const o = {restitution: b.restitution ?? 0.3, friction: b.friction ?? 0.4, frictionAir: 0.004, density: b.density ?? 0.002, angle: b.angle ?? 0, isStatic: b.isStatic};
        const body = b.shape === 'circle' ? Matter.Bodies.circle(b.x, b.y, b.r ?? 20, o) : Matter.Bodies.rectangle(b.x, b.y, b.w ?? 60, b.h ?? 60, o);
        Matter.Body.setVelocity(body, {x: (b.vx ?? 0) * perStep, y: (b.vy ?? 0) * perStep});
        Matter.Body.setAngularVelocity(body, (b.spin ?? 0) * perStep);
        Matter.Composite.add(world, body);
        made.set(b.id, body);
      }
    }
    for (const b of bodies) {
      const body = made.get(b.id);
      out[b.id].push(body
        ? {x: body.position.x, y: body.position.y, angle: body.angle, vx: body.velocity.x / perStep, vy: body.velocity.y / perStep, alive: true}
        : {x: b.x, y: b.y, angle: b.angle ?? 0, vx: 0, vy: 0, alive: false});
    }
    for (let s = 0; s < substeps; s++) Matter.Engine.update(engine, dt);
  }
  cache.set(key, out);
  return out;
};

/** state of one body at a (possibly fractional or out-of-range) frame */
export const bodyAt = (sim: Sim, id: string, frame: number): BodyState => {
  const a = sim[id];
  return a[Math.max(0, Math.min(a.length - 1, Math.round(frame)))];
};

/** first frame at which a body touches down (speed drops sharply near the floor); -1 if never */
export const firstImpact = (sim: Sim, id: string): number => {
  const a = sim[id];
  for (let f = 1; f < a.length; f++) if (a[f - 1].alive && a[f - 1].vy > 200 && a[f].vy < a[f - 1].vy * 0.5) return f;
  return -1;
};
