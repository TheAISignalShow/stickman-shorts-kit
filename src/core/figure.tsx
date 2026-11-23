/**
 * core/figure: one articulated 2D character rig for every channel (23 Nov 2026).
 * Elbows and knees are solved (IK), the walk keeps its feet planted, the far-side limbs are shaded for depth,
 * and it breathes and blinks without being asked. A stick host, a cartoon person or a caricature body can all
 * use it: change `look`, keep the motion.
 *
 *   <Figure x={600} groundY={860} h={520} facing={1} dist={walkedPx} gait={0..1} pose={POSES.point} frame={f} />
 *
 * Hands are placed, not rotated: a pose says WHERE each hand is, relative to the shoulder, in arm lengths
 * (x = forward in the facing direction, y = down). Blend poses with mixPose(a, b, k).
 */
import React from 'react';
import {twoBone, walkCycle} from './ik';
import {blink, lerp, lerpP, P, wiggle} from './motion';
import {shade} from './light';

export type Mood = 'neutral' | 'happy' | 'worried' | 'shocked' | 'thinking' | 'sad' | 'smug';
export type Pose = {
  /** near-camera hand and far-side hand, in arm lengths from the shoulder */
  handF?: P; handB?: P;
  lean?: number; crouch?: number; headTilt?: number;
  lookX?: number; lookY?: number;
  mood?: Mood; talk?: number; shrug?: number;
};
export const POSES: Record<string, Pose> = {
  stand: {handF: {x: 0.1, y: 0.97}, handB: {x: -0.06, y: 0.97}},
  point: {handF: {x: 0.96, y: -0.12}, handB: {x: -0.08, y: 0.96}, lean: 3, lookX: 1},
  pointUp: {handF: {x: 0.55, y: -0.8}, handB: {x: -0.08, y: 0.96}, lookX: 0.6, lookY: -1},
  think: {handF: {x: 0.2, y: -0.42}, handB: {x: 0.32, y: 0.3}, headTilt: -6, mood: 'thinking', lookY: -0.6},
  hips: {handF: {x: 0.3, y: 0.52}, handB: {x: -0.3, y: 0.52}},
  shrug: {handF: {x: 0.72, y: 0.12}, handB: {x: -0.72, y: 0.12}, shrug: 1, headTilt: 5},
  shield: {handF: {x: 0.42, y: -0.72}, handB: {x: 0.18, y: -0.78}, crouch: 0.6, lean: -6, mood: 'shocked', lookY: -1},
  cheer: {handF: {x: 0.45, y: -0.9}, handB: {x: -0.45, y: -0.9}, mood: 'happy'},
};
const num = (a: number | undefined, b: number | undefined, k: number, d = 0) => lerp(a ?? d, b ?? d, k);
export const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  handF: lerpP(a.handF ?? POSES.stand.handF!, b.handF ?? POSES.stand.handF!, k),
  handB: lerpP(a.handB ?? POSES.stand.handB!, b.handB ?? POSES.stand.handB!, k),
  lean: num(a.lean, b.lean, k), crouch: num(a.crouch, b.crouch, k), headTilt: num(a.headTilt, b.headTilt, k),
  lookX: num(a.lookX, b.lookX, k), lookY: num(a.lookY, b.lookY, k), talk: num(a.talk, b.talk, k), shrug: num(a.shrug, b.shrug, k),
  mood: k < 0.5 ? a.mood : b.mood,
});

export type Look = {
  ink: string;
  /** line thickness as a share of the height */
  line: number;
  /** limb and body colour inside the ink outline; omit for a pure line figure */
  body?: string;
  head: string;
  /** torso thickness as a share of the height (line figure = same as line) */
  torso?: number;
};
export const LOOKS: Record<string, Look> = {
  stick: {ink: '#1b1a1f', line: 0.03, head: '#ffffff'},
  person: {ink: '#1b1a1f', line: 0.05, body: '#3E5C76', head: '#F2B880', torso: 0.17},
};

const Face: React.FC<{c: P; r: number; facing: 1 | -1; pose: Pose; ink: string; frame: number; seed: number}> = ({c, r, facing, pose, ink, frame, seed}) => {
  const mood = pose.mood ?? 'neutral';
  const lid = blink(frame, seed);
  const ex = facing * r * 0.22 + (pose.lookX ?? 0) * facing * r * 0.16, ey = -r * 0.08 + (pose.lookY ?? 0) * r * 0.14;
  const gap = r * 0.36, er = r * (mood === 'shocked' ? 0.17 : 0.12);
  const browLift = mood === 'shocked' ? -r * 0.22 : mood === 'worried' || mood === 'sad' ? -r * 0.05 : 0;
  const browTilt = mood === 'worried' || mood === 'sad' ? 1 : mood === 'smug' || mood === 'thinking' ? -0.6 : 0;
  const my = r * 0.45, mw = r * 0.34, t = pose.talk ?? 0;
  const mx = c.x + ex * 0.6;
  let mouth: React.ReactNode;
  if (t > 0.08 || mood === 'shocked') mouth = <ellipse cx={mx} cy={c.y + my} rx={mw * 0.5} ry={r * (mood === 'shocked' ? 0.2 : 0.06 + 0.16 * t)} fill={ink} />;
  else if (mood === 'happy' || mood === 'smug') mouth = <path d={`M ${mx - mw} ${c.y + my - r * 0.06} Q ${mx} ${c.y + my + r * 0.28} ${mx + mw} ${c.y + my - r * 0.06}`} fill="none" stroke={ink} strokeWidth={r * 0.1} strokeLinecap="round" />;
  else if (mood === 'sad' || mood === 'worried') mouth = <path d={`M ${mx - mw * 0.8} ${c.y + my + r * 0.1} Q ${mx} ${c.y + my - r * 0.14} ${mx + mw * 0.8} ${c.y + my + r * 0.1}`} fill="none" stroke={ink} strokeWidth={r * 0.1} strokeLinecap="round" />;
  else mouth = <line x1={mx - mw * 0.7} y1={c.y + my} x2={mx + mw * 0.7} y2={c.y + my} stroke={ink} strokeWidth={r * 0.1} strokeLinecap="round" />;
  return (
    <g>
      {[-1, 1].map((s) => {
        const x = c.x + ex + s * gap, y = c.y + ey;
        return (
          <g key={s}>
            <ellipse cx={x} cy={y} rx={er} ry={er * (1 - lid * 0.92) * (mood === 'smug' ? 0.6 : 1)} fill={ink} />
            <line x1={x - er * 1.5} y1={y - r * 0.3 + browLift + s * browTilt * r * 0.08 * facing} x2={x + er * 1.5} y2={y - r * 0.3 + browLift - s * browTilt * r * 0.08 * facing} stroke={ink} strokeWidth={r * 0.09} strokeLinecap="round" />
          </g>
        );
      })}
      {mouth}
    </g>
  );
};

export type FigureArgs = {
  x: number; groundY: number; h: number; facing?: 1 | -1;
  /** px walked so far (drives the walk phase) and how much of the walk is active, 0..1 */
  dist?: number; gait?: number;
  pose?: Pose; frame: number; seed?: number;
};
/** All joint positions of the figure at one frame. Used by the 2D drawing below and by the 3D figure. */
export const solveFigure = ({x, groundY, h, facing = 1, dist = 0, gait = 0, pose = POSES.stand, frame, seed = 0}: FigureArgs) => {
  const L = {thigh: 0.235 * h, shin: 0.235 * h, upper: 0.165 * h, fore: 0.155 * h, head: 0.098 * h, torso: 0.33 * h};
  const g = walkCycle(dist, 0.62 * h, 0.075 * h);
  const breathe = Math.sin(frame / 21 + seed) * 0.004 * h;
  const sway = wiggle(frame, seed + 5, 0.5, 0.004 * h) * (1 - gait);
  const hip: P = {x: x + sway, y: groundY - (0.452 * h - (pose.crouch ?? 0) * 0.13 * h) + g.bob * gait};
  const lean = (((pose.lean ?? 0) + g.lean * gait) * Math.PI) / 180;
  const neck: P = {x: hip.x + Math.sin(lean) * L.torso * facing, y: hip.y - Math.cos(lean) * L.torso + breathe};
  const sh: P = {x: lerp(hip.x, neck.x, 0.93), y: lerp(hip.y, neck.y, 0.93) - (pose.shrug ?? 0) * 0.02 * h};
  const tilt = (((pose.headTilt ?? 0) * facing) * Math.PI) / 180 + lean * 0.5 * facing;
  const head: P = {x: neck.x + Math.sin(tilt) * L.head * 1.15, y: neck.y - Math.cos(tilt) * L.head * 1.15};

  const standF: P = {x: 0.055 * h, y: 0}, standB: P = {x: -0.055 * h, y: 0};
  const fF = lerpP(standF, g.footFront, gait), fB = lerpP(standB, g.footBack, gait);
  const footF: P = {x: x + facing * fF.x, y: groundY + fF.y}, footB: P = {x: x + facing * fB.x, y: groundY + fB.y};
  const kneeBend = (-facing) as 1 | -1, elbowBend = facing as 1 | -1;
  const legF = twoBone(hip, footF, L.thigh, L.shin, kneeBend), legB = twoBone(hip, footB, L.thigh, L.shin, kneeBend);

  const arm = L.upper + L.fore;
  const hF = pose.handF ?? POSES.stand.handF!, hB = pose.handB ?? POSES.stand.handB!;
  const swing = g.swing * 0.34 * gait;
  const tF: P = {x: sh.x + facing * (hF.x - swing) * arm, y: sh.y + hF.y * arm + breathe * 0.5};
  const tB: P = {x: sh.x + facing * (hB.x + swing) * arm, y: sh.y + hB.y * arm + breathe * 0.5};
  const armF = twoBone(sh, tF, L.upper, L.fore, elbowBend), armB = twoBone(sh, tB, L.upper, L.fore, elbowBend);
  return {L, hip, neck, sh, head, legF, legB, armF, armB};
};

export const Figure: React.FC<FigureArgs & {look?: Look}> = (args) => {
  const {h, facing = 1, pose = POSES.stand, look = LOOKS.stick, frame, seed = 0} = args;
  const {L, hip, neck, sh, head, legF, legB, armF, armB} = solveFigure(args);

  const lw = look.line * h, tw = (look.torso ?? look.line) * h;
  const far = look.body ? shade(look.body, -0.28) : shade(look.ink, 0.32);
  const limb = (a: P, j: P, e: P, w: number, back: boolean, key: string) => {
    const d = `M ${a.x} ${a.y} L ${j.x} ${j.y} L ${e.x} ${e.y}`;
    return look.body ? (
      <g key={key}>
        <path d={d} fill="none" stroke={look.ink} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={back ? far : look.body} strokeWidth={w * 0.58} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ) : <path key={key} d={d} fill="none" stroke={back ? far : look.ink} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
  };
  const foot = (p: P, back: boolean, key: string) => <line key={key} x1={p.x} y1={p.y - lw * 0.35} x2={p.x + facing * 0.07 * h} y2={p.y - lw * 0.35} stroke={back ? far : look.ink} strokeWidth={lw * 1.05} strokeLinecap="round" />;
  const hand = (p: P, back: boolean, key: string) => <circle key={key} cx={p.x} cy={p.y} r={lw * 0.82} fill={look.body ? look.head : back ? far : look.ink} stroke={look.ink} strokeWidth={look.body ? lw * 0.24 : 0} />;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {limb(sh, armB.joint, armB.end, lw, true, 'ab')}{hand(armB.end, true, 'hb')}
      {limb(hip, legB.joint, legB.end, lw * 1.1, true, 'lb')}{foot(legB.end, true, 'fb')}
      {look.body ? (
        <g>
          <line x1={hip.x} y1={hip.y} x2={neck.x} y2={neck.y} stroke={look.ink} strokeWidth={tw} strokeLinecap="round" />
          <line x1={hip.x} y1={hip.y} x2={neck.x} y2={neck.y} stroke={look.body} strokeWidth={tw - lw * 0.42} strokeLinecap="round" />
          <line x1={hip.x - facing * tw * 0.2} y1={hip.y} x2={neck.x - facing * tw * 0.2} y2={neck.y} stroke={shade(look.body, -0.16)} strokeWidth={tw * 0.34} strokeLinecap="round" opacity={0.8} />
        </g>
      ) : <line x1={hip.x} y1={hip.y} x2={neck.x} y2={neck.y} stroke={look.ink} strokeWidth={lw} strokeLinecap="round" />}
      {limb(hip, legF.joint, legF.end, lw * 1.1, false, 'lf')}{foot(legF.end, false, 'ff')}
      <circle cx={head.x} cy={head.y} r={L.head} fill={look.head} stroke={look.ink} strokeWidth={lw * (look.body ? 0.5 : 0.85)} />
      <path d={`M ${head.x - facing * L.head * 0.2} ${head.y + L.head * 0.75} A ${L.head} ${L.head} 0 0 ${facing === 1 ? 1 : 0} ${head.x - facing * L.head * 0.92} ${head.y - L.head * 0.2}`} fill="none" stroke={shade(look.head, -0.14)} strokeWidth={L.head * 0.2} strokeLinecap="round" opacity={0.7} />
      <Face c={head} r={L.head} facing={facing} pose={pose} ink={look.ink} frame={frame} seed={seed} />
      {limb(sh, armF.joint, armF.end, lw, false, 'af')}{hand(armF.end, false, 'hf')}
    </svg>
  );
};
