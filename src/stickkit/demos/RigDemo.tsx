/**
 * Rig demo (The AI Signal host, 24 Nov 2026): 10 s that prove the stick host is alive. It walks in with planted
 * feet, stops with its weight, anticipates, points at a screen, talks, thinks, shrugs and cheers, and never
 * freezes. `joints` draws the solved hips, knees, feet, shoulders, elbows and hands in the accent colour.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {THEME, Stick, POSE, poseAt, walkAlong, solveStick, tween, E, FONT, springRatio, clamp} from '..';

export const RIG_DEMO_FRAMES = 300;
const G = 990, H = 640;

const KEYS = [
  {f: 0, pose: POSE.stand}, {f: 62, pose: {...POSE.stand, crouch: 0.25}, dur: 6}, {f: 70, pose: POSE.stand, dur: 10},
  {f: 82, pose: POSE.point, dur: 16, how: 'anticipate' as const}, {f: 104, pose: {...POSE.point, talk: 0.8, mood: 'happy' as const}, dur: 6},
  {f: 132, pose: {...POSE.present, talk: 0.8}, dur: 12}, {f: 160, pose: POSE.think, dur: 12}, {f: 190, pose: POSE.shrug, dur: 10, how: 'spring' as const},
  {f: 216, pose: POSE.cheer, dur: 12, how: 'spring' as const}, {f: 246, pose: {...POSE.present, talk: 0.7}, dur: 12},
];

const Code: React.FC<{k: number}> = ({k}) => {
  const rows: [string, string][] = [
    ['<Stick', THEME.ink], ['  pose={POSE.cheer}', THEME.accent], ['  facing={1}', THEME.dim], ['  frame={f} />', THEME.ink],
  ];
  return (
    <div style={{position: 'absolute', left: 1130, top: 210, width: 680, border: `5px solid ${THEME.ink}`, borderRadius: 28, background: '#12151C', fontFamily: 'Consolas, monospace', opacity: clamp(k * 3), transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: '0% 50%'}}>
      <div style={{display: 'flex', gap: 10, padding: '16px 22px', borderBottom: `2px solid ${THEME.faint}`}}>
        {[0, 1, 2].map((i) => <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: THEME.faint}} />)}
        <div style={{marginLeft: 12, fontFamily: FONT, fontWeight: 800, fontSize: 26, color: THEME.dim}}>MyShort.tsx</div>
      </div>
      <div style={{padding: '22px 30px 30px', fontSize: 46, lineHeight: 1.35}}>
        {rows.map(([t, c], i) => <div key={i} style={{color: c, whiteSpace: 'pre'}}>{t}</div>)}
      </div>
    </div>
  );
};

export const RigDemo: React.FC<{joints?: boolean}> = ({joints = false}) => {
  const f = useCurrentFrame();
  const w1 = walkAlong(f, 0, 66, -160, 620), w2 = walkAlong(f, 250, 290, 620, 760);
  const walk = f < 250 ? w1 : w2;
  const pose = poseAt(f, KEYS);
  const args = {x: walk.x, groundY: G, h: H, facing: 1 as const, dist: walk.dist, gait: walk.gait, pose, frame: f, seed: 7};
  const s = solveStick(args);
  const k = springRatio(f, 84, 0.8, 0.4);
  const pts = [s.hip, s.legF.joint, s.legB.joint, s.legF.end, s.legB.end, s.sh, s.armF.joint, s.armB.joint, s.armF.end, s.armB.end];
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 45% 45%, ${THEME.bg2} 0%, ${THEME.bg} 75%)`}}>
      <Code k={k} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <line x1={0} y1={G} x2={1920} y2={G} stroke={THEME.faint} strokeWidth={6} />
        <ellipse cx={walk.x + 10} cy={G + 4} rx={H * 0.16} ry={10} fill="#000" opacity={0.35} />
        <Stick {...args} />
        {joints && pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={10} fill={THEME.accent} stroke={THEME.bg} strokeWidth={4} />)}
      </svg>
      <div style={{position: 'absolute', left: 80, top: 70, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: THEME.ink, opacity: tween(f, 4, 12, E.out)}}>
        Knees, elbows, <span style={{color: THEME.accent}}>planted feet</span>
      </div>
    </AbsoluteFill>
  );
};
