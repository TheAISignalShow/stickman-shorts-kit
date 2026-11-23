/**
 * Stickman Shorts kit: the stick figure (24 Nov 2026, The AI Signal). Built on the shared core rig:
 * knees and elbows are solved with core's two-bone IK, walking uses core's walkCycle (feet stay planted
 * because the walk phase comes from distance walked), and it breathes, sways and blinks on its own.
 *
 *   const pose = poseAt(f, [{f: 0, pose: POSE.sitIdle}, {f: 90, pose: POSE.type, dur: 8}]);
 *   <svg ...><Stick x={300} groundY={1290} h={430} facing={1} pose={pose} frame={f} /></svg>
 *
 * Coordinates: x = the hips over the ground, groundY = the floor line, h = standing height in px.
 * Hands are placed relative to the shoulder in arm lengths (x = forward in the facing direction, y = down).
 */
import React from 'react';
import {blink, clamp, E, lerp, lerpP, P, twoBone, walkCycle, wiggle, tween, anticipate, springRatio} from '../core';
import {THEME} from './theme';

export type Mood = 'neutral' | 'happy' | 'worried' | 'shocked' | 'thinking' | 'sad' | 'smug' | 'determined';
export type SPose = {
  handF?: P; handB?: P;
  /** torso lean in degrees, forward positive */
  lean?: number;
  /** head rotation in degrees (forward positive) on top of the lean */
  nod?: number;
  /** 0..1 knee bend while standing */
  crouch?: number;
  /** 0..1 seated (needs a chair: pass seatH to the figure) */
  sit?: number;
  lookX?: number; lookY?: number;
  mood?: Mood;
  /** 0..1 mouth open (talking) */
  talk?: number;
  shrug?: number;
  /** 0..1 hands tapping a keyboard / scribbling with a pen / bouncing with laughter */
  typing?: number; writing?: number;
  /** px off the ground (a jump); the legs tuck a little */
  lift?: number;
  /** 0..1 seated with both feet up on the desk in front (needs sit: 1) */
  feetUp?: number;
};

/** The pose library. Add your own: any pose is just numbers. */
export const POSE: Record<string, SPose> = {
  stand: {handF: {x: 0.1, y: 0.97}, handB: {x: -0.06, y: 0.97}},
  point: {handF: {x: 0.96, y: -0.1}, handB: {x: -0.06, y: 0.96}, lean: 3, lookX: 1},
  pointUp: {handF: {x: 0.5, y: -0.82}, handB: {x: -0.06, y: 0.96}, lookX: 0.5, lookY: -1},
  present: {handF: {x: 0.78, y: 0.28}, handB: {x: -0.1, y: 0.95}, lean: 2, lookX: 0.6, mood: 'happy'},
  think: {handF: {x: 0.32, y: -0.3}, handB: {x: 0.28, y: 0.42}, nod: -6, mood: 'thinking', lookY: -0.8, lookX: 0.4},
  hips: {handF: {x: 0.28, y: 0.5}, handB: {x: -0.28, y: 0.5}},
  shrug: {handF: {x: 0.7, y: 0.14}, handB: {x: -0.62, y: 0.14}, shrug: 1, nod: -4, mood: 'worried'},
  cheer: {handF: {x: 0.42, y: -0.95}, handB: {x: -0.38, y: -0.95}, mood: 'happy', nod: -8},
  stress: {handF: {x: 0.34, y: -0.62}, handB: {x: -0.02, y: -0.66}, mood: 'worried', nod: 8, crouch: 0.2},
  shocked: {handF: {x: 0.5, y: 0.3}, handB: {x: -0.45, y: 0.3}, mood: 'shocked', lean: -6, lookX: 1},
  shield: {handF: {x: 0.42, y: -0.72}, handB: {x: 0.18, y: -0.78}, crouch: 0.6, lean: -6, mood: 'shocked', lookY: -1},
  slumpStand: {handF: {x: 0.12, y: 1}, handB: {x: -0.02, y: 1}, lean: 14, nod: 22, mood: 'sad', crouch: 0.15},
  // seated (give the figure a chair with seatH)
  sitIdle: {sit: 1, handF: {x: 0.58, y: 0.74}, handB: {x: 0.5, y: 0.78}, lean: 4},
  type: {sit: 1, lean: 10, handF: {x: 0.96, y: 0.6}, handB: {x: 0.84, y: 0.64}, typing: 1, lookX: 1, lookY: 0.2, mood: 'determined'},
  typeFast: {sit: 1, lean: 6, handF: {x: 0.96, y: 0.6}, handB: {x: 0.84, y: 0.64}, typing: 1.6, lookX: 1, mood: 'smug'},
  feetUp: {sit: 1, feetUp: 1, lean: -22, handF: {x: -0.34, y: -0.46}, handB: {x: -0.44, y: -0.4}, mood: 'smug', nod: -12, lookY: -0.3},
  leanBack: {sit: 1, lean: -16, handF: {x: -0.34, y: -0.46}, handB: {x: -0.44, y: -0.4}, mood: 'smug', nod: -10, lookY: -0.4},
  phone: {sit: 1, lean: -8, handF: {x: 0.6, y: 0.02}, handB: {x: 0.5, y: 0.1}, lookY: 0.5, lookX: 0.6, mood: 'happy', nod: 8},
  sitThink: {sit: 1, lean: 8, handF: {x: 0.34, y: -0.3}, handB: {x: 0.7, y: 0.66}, mood: 'thinking', lookY: -0.7, nod: -8},
  write: {sit: 1, lean: 22, handF: {x: 0.98, y: 0.62}, handB: {x: 0.78, y: 0.7}, writing: 1, lookX: 1, lookY: 1, nod: 14, mood: 'determined'},
  sitStress: {sit: 1, lean: 16, handF: {x: 0.42, y: -0.6}, handB: {x: 0.1, y: -0.64}, mood: 'worried', nod: 14, lookY: 0.6},
  sitShocked: {sit: 1, lean: -10, handF: {x: 0.6, y: 0.3}, handB: {x: 0.4, y: 0.34}, mood: 'shocked', lookX: 1},
  slump: {sit: 1, lean: 44, nod: 34, handF: {x: 1.0, y: 0.3}, handB: {x: 0.86, y: 0.36}, mood: 'sad', lookY: 1},
  sitCheer: {sit: 1, handF: {x: 0.42, y: -0.95}, handB: {x: -0.3, y: -0.95}, mood: 'happy', nod: -10},
};

const num = (a: number | undefined, b: number | undefined, k: number) => lerp(a ?? 0, b ?? 0, k);
/** Blend two poses. k may overshoot past 1 a little (anticipation and springs use that). */
export const mixPose = (a: SPose, b: SPose, k: number): SPose => ({
  handF: lerpP(a.handF ?? POSE.stand.handF!, b.handF ?? POSE.stand.handF!, k),
  handB: lerpP(a.handB ?? POSE.stand.handB!, b.handB ?? POSE.stand.handB!, k),
  lean: num(a.lean, b.lean, k), nod: num(a.nod, b.nod, k), crouch: num(a.crouch, b.crouch, k),
  sit: clamp(num(a.sit, b.sit, k)), lookX: num(a.lookX, b.lookX, k), lookY: num(a.lookY, b.lookY, k),
  talk: num(a.talk, b.talk, k), shrug: num(a.shrug, b.shrug, k), typing: clamp(num(a.typing, b.typing, k), 0, 2),
  writing: clamp(num(a.writing, b.writing, k), 0, 2), lift: num(a.lift, b.lift, k), feetUp: clamp(num(a.feetUp, b.feetUp, k)),
  mood: k < 0.5 ? a.mood : b.mood,
});

export type PoseKey = {f: number; pose: SPose; dur?: number; how?: 'ease' | 'spring' | 'anticipate' | 'snap'};
/**
 * Acting track: the pose changes on the beat that causes it. Each key blends from the pose before it
 * over `dur` frames (default 10). 'anticipate' dips back before it goes, 'spring' overshoots and settles
 * (damping 0.75: premium, not cartoon), 'snap' is a 3-frame cut for shocks.
 */
export const poseAt = (f: number, keys: PoseKey[]): SPose => {
  let p = keys[0].pose;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    const d = k.dur ?? 10;
    const how = k.how ?? 'ease';
    const t = how === 'snap' ? tween(f, k.f, k.f + 3, E.out) : how === 'spring' ? springRatio(f, k.f, 0.75, (d / 30) * 1.6) : how === 'anticipate' ? anticipate(f, k.f, d) : tween(f, k.f, k.f + d, E.inOut);
    p = mixPose(p, k.pose, t);
  }
  return p;
};

/**
 * Walk (or run: pass run={1} to <Stick>) from x0 to x1 between frames f0 and f1. Returns x, dist (drives the feet) and gait.
 * In place (a treadmill, or a long run with a scrolling road): keep x fixed, pass dist = speed * frame and gait = 1,
 * and move the ground marks by the same speed.
 */
export const walkAlong = (f: number, f0: number, f1: number, x0: number, x1: number) => {
  const k = tween(f, f0, f1, E.inOut);
  const x = lerp(x0, x1, k);
  const gait = f <= f0 || f >= f1 ? 0 : Math.min(tween(f, f0, f0 + 6, E.out), 1 - tween(f, f1 - 9, f1, E.inOut));
  return {x, dist: Math.abs(x - x0), gait, facing: (x1 >= x0 ? 1 : -1) as 1 | -1};
};

export type StickArgs = {
  x: number; groundY: number; h: number; facing?: 1 | -1;
  dist?: number; gait?: number;
  /** seat height above the floor in px (default 0.25 h; about 0.05 h sits on the floor). Per figure, so swap it by frame to move from chair to floor */
  seatH?: number;
  /** 0 = walk, 1 = run (longer stride, higher knees, more lean). Feet stay planted at any value */
  run?: number;
  pose?: SPose; frame: number; seed?: number;
};

/** Every joint of the figure at one frame (also use it to attach props to a hand). */
export const solveStick = (a: StickArgs) => {
  const {x, groundY, h, facing = 1, dist = 0, gait = 0, pose = POSE.stand, frame, seed = 0} = a;
  const fc = facing;
  const L = {thigh: 0.235 * h, shin: 0.235 * h, upper: 0.165 * h, fore: 0.155 * h, head: 0.1 * h, torso: 0.32 * h};
  const sit = clamp(pose.sit ?? 0);
  const run = clamp(a.run ?? 0);
  const g = walkCycle(dist, lerp(0.62, 0.95, run) * h, lerp(0.075, 0.16, run) * h);
  const breathe = Math.sin(frame / 19 + seed) * 0.005 * h;
  const still = (1 - gait) * (1 - sit * 0.6);
  const sway = wiggle(frame, seed + 5, 0.5, 0.006 * h) * still;
  const lift = pose.lift ?? 0;
  const seatH = a.seatH ?? 0.25 * h;
  const hipStand = groundY - (0.452 * h - (pose.crouch ?? 0) * 0.13 * h) + g.bob * gait;
  const hipSit = groundY - seatH - 0.02 * h;
  const hip: P = {x: x + sway, y: lerp(hipStand, hipSit, sit) - lift};
  const leanDeg = (pose.lean ?? 0) + g.lean * gait * (1 + run * 2) + wiggle(frame, seed + 9, 0.45, 1.4) * (1 - gait);
  const lean = (leanDeg * Math.PI) / 180;
  const neck: P = {x: hip.x + Math.sin(lean) * L.torso * fc, y: hip.y - Math.cos(lean) * L.torso + breathe};
  const sh: P = {x: lerp(hip.x, neck.x, 0.9), y: lerp(hip.y, neck.y, 0.9) - (pose.shrug ?? 0) * 0.025 * h};
  const talkBob = (pose.talk ?? 0) * wiggle(frame, seed + 3, 3.2, 2.2);
  const rot = (((leanDeg * 0.45 + (pose.nod ?? 0) + talkBob) * fc) * Math.PI) / 180;
  const head: P = {x: neck.x + Math.sin(rot) * L.head * 1.22, y: neck.y - Math.cos(rot) * L.head * 1.22};

  // legs: standing / walking feet, blended to seated feet in front of the chair
  const standF: P = {x: 0.06 * h, y: 0}, standB: P = {x: -0.05 * h, y: 0};
  const wF = lerpP(standF, g.footFront, gait), wB = lerpP(standB, g.footBack, gait);
  const up = clamp(pose.feetUp ?? 0) * sit;
  const sF = lerpP(lerpP(wF, {x: 0.27 * h, y: 0}, sit), {x: 0.55 * h, y: -0.42 * h}, up), sB = lerpP(lerpP(wB, {x: 0.2 * h, y: 0}, sit), {x: 0.5 * h, y: -0.41 * h}, up);
  const footF: P = {x: x + fc * sF.x, y: groundY + sF.y - lift * 0.8}, footB: P = {x: x + fc * sB.x, y: groundY + sB.y - lift * 0.8};
  const knee = (-fc) as 1 | -1, elbow = fc as 1 | -1;
  const legF = twoBone(hip, footF, L.thigh, L.shin, knee), legB = twoBone(hip, footB, L.thigh, L.shin, knee);

  // arms: hands placed relative to the shoulder; walking swings them, typing and writing jiggle them
  const arm = L.upper + L.fore;
  const hF = pose.handF ?? POSE.stand.handF!, hB = pose.handB ?? POSE.stand.handB!;
  const swing = g.swing * (0.34 + 0.3 * run) * gait;
  const ty = pose.typing ?? 0, wr = pose.writing ?? 0;
  const tapF = ty * Math.max(0, Math.sin(frame * 1.7 + seed)) * 0.05, tapB = ty * Math.max(0, Math.sin(frame * 1.7 + seed + 2.1)) * 0.05;
  const scrX = wr * Math.sin(frame * 0.8 + seed) * 0.05, scrY = wr * Math.sin(frame * 1.9 + seed) * 0.018;
  const tF: P = {x: sh.x + fc * (hF.x - swing + scrX) * arm, y: sh.y + (hF.y - tapF + scrY) * arm + breathe * 0.5};
  const tB: P = {x: sh.x + fc * (hB.x + swing) * arm, y: sh.y + (hB.y - tapB) * arm + breathe * 0.5};
  const armF = twoBone(sh, tF, L.upper, L.fore, elbow), armB = twoBone(sh, tB, L.upper, L.fore, elbow);
  return {L, hip, neck, sh, head, rot, legF, legB, armF, armB, footF, footB, lw: 0.034 * h, fc};
};

const Face: React.FC<{c: P; r: number; fc: 1 | -1; rot: number; pose: SPose; frame: number; seed: number; ink: string}> = ({c, r, fc, rot, pose, frame, seed, ink}) => {
  const mood = pose.mood ?? 'neutral';
  const lid = blink(frame, seed, 84 + (seed % 3) * 9);
  const ex = fc * r * 0.26 + (pose.lookX ?? 0) * fc * r * 0.14, ey = -r * 0.06 + (pose.lookY ?? 0) * r * 0.16;
  const gap = r * 0.3, er = r * (mood === 'shocked' ? 0.15 : 0.1);
  const lift = mood === 'shocked' ? -r * 0.2 : mood === 'worried' || mood === 'sad' ? -r * 0.04 : 0;
  const tilt = mood === 'worried' || mood === 'sad' ? 1 : mood === 'smug' || mood === 'thinking' ? -0.6 : mood === 'determined' ? -0.5 : 0;
  const my = r * 0.44, mw = r * 0.3, t = pose.talk ?? 0, mx = c.x + ex * 0.7;
  const sw = r * 0.11;
  let mouth: React.ReactNode;
  if (t > 0.08 || mood === 'shocked') mouth = <ellipse cx={mx} cy={c.y + my} rx={mw * 0.48} ry={r * (mood === 'shocked' ? 0.19 : 0.05 + 0.15 * t * (0.6 + 0.4 * Math.abs(Math.sin(frame * 0.9))))} fill={ink} />;
  else if (mood === 'happy' || mood === 'smug') mouth = <path d={`M ${mx - mw} ${c.y + my - r * 0.06} Q ${mx + (mood === 'smug' ? fc * mw * 0.5 : 0)} ${c.y + my + r * (mood === 'smug' ? 0.14 : 0.26)} ${mx + mw} ${c.y + my - r * (mood === 'smug' ? 0.14 : 0.06)}`} fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />;
  else if (mood === 'sad' || mood === 'worried') mouth = <path d={`M ${mx - mw * 0.8} ${c.y + my + r * 0.1} Q ${mx} ${c.y + my - r * 0.12} ${mx + mw * 0.8} ${c.y + my + r * 0.1}`} fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />;
  else mouth = <line x1={mx - mw * 0.6} y1={c.y + my} x2={mx + mw * 0.6} y2={c.y + my} stroke={ink} strokeWidth={sw} strokeLinecap="round" />;
  return (
    <g transform={`rotate(${(rot * 180) / Math.PI} ${c.x} ${c.y})`}>
      {[-1, 1].map((s) => {
        const x = c.x + ex + s * gap, y = c.y + ey;
        const b = s * tilt * r * 0.07 * fc;
        return (
          <g key={s}>
            <ellipse cx={x} cy={y} rx={er} ry={Math.max(r * 0.012, er * (1 - lid * 0.92) * (mood === 'smug' ? 0.55 : 1))} fill={ink} />
            {mood !== 'neutral' && mood !== 'happy' && <line x1={x - er * 1.6} y1={y - r * 0.28 + lift + b} x2={x + er * 1.6} y2={y - r * 0.28 + lift - b} stroke={ink} strokeWidth={r * 0.085} strokeLinecap="round" />}
          </g>
        );
      })}
      {mouth}
    </g>
  );
};

export type StickLook = {ink?: string; far?: string; face?: string; cap?: boolean; glasses?: boolean; accent?: string};
/** The figure, as SVG <g>: put it inside one <svg> per scene so props can sit in front of or behind it. */
export const Stick: React.FC<StickArgs & {look?: StickLook; opacity?: number}> = (args) => {
  const {pose = POSE.stand, frame, seed = 0, look = {}, opacity = 1} = args;
  const s = solveStick(args);
  const ink = look.ink ?? THEME.ink, far = look.far ?? '#B4B9C4', face = look.face ?? THEME.dark;
  const {lw, fc, L} = s;
  const limb = (a: P, j: P, e: P, w: number, c: string, key: string) => <path key={key} d={`M ${a.x} ${a.y} L ${j.x} ${j.y} L ${e.x} ${e.y}`} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
  const foot = (p: P, c: string, key: string) => <line key={key} x1={p.x} y1={p.y - lw * 0.45} x2={p.x + fc * 0.065 * args.h} y2={p.y - lw * 0.45} stroke={c} strokeWidth={lw * 1.05} strokeLinecap="round" />;
  const hand = (p: P, c: string, key: string) => <circle key={key} cx={p.x} cy={p.y} r={lw * 0.72} fill={c} />;
  const hd = s.head, r = L.head;
  const rotDeg = (s.rot * 180) / Math.PI;
  return (
    <g opacity={opacity}>
      {limb(s.sh, s.armB.joint, s.armB.end, lw, far, 'ab')}{hand(s.armB.end, far, 'hb')}
      {limb(s.hip, s.legB.joint, s.legB.end, lw * 1.08, far, 'lb')}{foot(s.legB.end, far, 'fb')}
      <line x1={s.hip.x} y1={s.hip.y} x2={s.neck.x} y2={s.neck.y} stroke={ink} strokeWidth={lw * 1.1} strokeLinecap="round" />
      {limb(s.hip, s.legF.joint, s.legF.end, lw * 1.08, ink, 'lf')}{foot(s.legF.end, ink, 'ff')}
      <circle cx={hd.x} cy={hd.y} r={r} fill={ink} />
      {look.cap && (
        <g transform={`rotate(${rotDeg} ${hd.x} ${hd.y})`}>
          <path d={`M ${hd.x - r * 1.02} ${hd.y - r * 0.12} A ${r * 1.02} ${r * 1.02} 0 0 1 ${hd.x + r * 1.02} ${hd.y - r * 0.12} Z`} fill={look.accent ?? THEME.dim} />
          <line x1={hd.x + fc * r * 0.2} y1={hd.y - r * 0.16} x2={hd.x + fc * r * 1.62} y2={hd.y - r * 0.16} stroke={look.accent ?? THEME.dim} strokeWidth={r * 0.2} strokeLinecap="round" />
        </g>
      )}
      <Face c={hd} r={r} fc={fc} rot={s.rot} pose={pose} frame={frame} seed={seed} ink={face} />
      {look.glasses && (
        <g transform={`rotate(${rotDeg} ${hd.x} ${hd.y})`} fill="none" stroke={face} strokeWidth={r * 0.07}>
          {[-1, 1].map((k) => <circle key={k} cx={hd.x + fc * r * 0.26 + (pose.lookX ?? 0) * fc * r * 0.14 + k * r * 0.3} cy={hd.y - r * 0.06 + (pose.lookY ?? 0) * r * 0.16} r={r * 0.21} />)}
        </g>
      )}
      {limb(s.sh, s.armF.joint, s.armF.end, lw, ink, 'af')}{hand(s.armF.end, ink, 'hf')}
    </g>
  );
};
