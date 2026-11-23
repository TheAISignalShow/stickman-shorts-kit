/**
 * Stickman Shorts kit: props as line art (24 Nov 2026). All SVG <g>, drawn with the same ink and line weight
 * as the figures, filled with the ground colour so they hide what is behind them. Sizes take the figure
 * height `h` so a desk always fits the person sitting at it.
 */
import React from 'react';
import {P} from '../core';
import {THEME} from './theme';

const lwOf = (h: number) => Math.max(4, 0.022 * h);

/** A desk seen from the side. Top surface at groundY - 0.4 h. Returns nothing else: use deskTop(h) for its height. */
export const deskTop = (groundY: number, h: number) => groundY - 0.4 * h;
export const Desk: React.FC<{x0: number; x1: number; groundY: number; h: number; color?: string}> = ({x0, x1, groundY, h, color = THEME.ink}) => {
  const y = deskTop(groundY, h), lw = lwOf(h), t = 0.035 * h;
  return (
    <g stroke={color} strokeWidth={lw} strokeLinecap="round" strokeLinejoin="round">
      <line x1={x0 + 0.05 * h} y1={y + t} x2={x0 + 0.05 * h} y2={groundY} />
      <line x1={x1 - 0.05 * h} y1={y + t} x2={x1 - 0.05 * h} y2={groundY} />
      <rect x={x0} y={y} width={x1 - x0} height={t} rx={t * 0.3} fill={THEME.bg2} />
    </g>
  );
};

/** A chair under a seated figure at hip x. The backrest is behind the sitter. */
export const Chair: React.FC<{x: number; groundY: number; h: number; facing?: 1 | -1; seatH?: number; color?: string}> = ({x, groundY, h, facing = 1, seatH = 0.25 * h, color = THEME.dim}) => {
  const lw = lwOf(h), y = groundY - seatH, back = x - facing * 0.1 * h, front = x + facing * 0.1 * h;
  return (
    <g stroke={color} strokeWidth={lw} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={back} y1={y} x2={front} y2={y} />
      <line x1={back} y1={y} x2={back - facing * 0.03 * h} y2={y - 0.3 * h} />
      <line x1={back} y1={y} x2={back} y2={groundY} />
      <line x1={front} y1={y} x2={front} y2={groundY} />
    </g>
  );
};

/** A laptop on a desk, side view. `open` 0..1 folds the screen; `on` lights its inner face with the accent. */
export const Laptop: React.FC<{x: number; deskY: number; h: number; facing?: 1 | -1; open?: number; on?: number; color?: string}> = ({x, deskY, h, facing = 1, open = 1, on = 1, color = THEME.ink}) => {
  const lw = lwOf(h), w = 0.2 * h, sh = 0.16 * h;
  const hx = x + facing * w;
  // screen angle from upright: open leans a little away from the user, closed lies flat on the keyboard
  const th = (1 - open) * (Math.PI / 2) + open * -0.2;
  const sx = hx - facing * Math.sin(th) * sh, sy = deskY - lw - Math.cos(th) * sh;
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <line x1={x} y1={deskY - lw * 0.5} x2={hx} y2={deskY - lw * 0.5} stroke={color} strokeWidth={lw * 1.3} />
      <line x1={hx} y1={deskY - lw} x2={sx} y2={sy} stroke={color} strokeWidth={lw * 1.4} />
      {on > 0 && <line x1={hx - facing * lw * 0.9} y1={deskY - lw * 1.6} x2={sx - facing * lw * 0.9} y2={sy + lw * 0.4} stroke={THEME.accent} strokeWidth={lw * 0.8} opacity={on} />}
    </g>
  );
};

/** A phone held in a hand (pass the hand point from solveStick). The lit side faces the holder. */
export const Phone: React.FC<{at: P; h: number; facing?: 1 | -1; on?: number; angle?: number}> = ({at, h, facing = 1, on = 1, angle = -60}) => {
  const w = 0.03 * h, l = 0.085 * h;
  return (
    <g transform={`translate(${at.x} ${at.y}) rotate(${angle * facing})`}>
      <rect x={-w / 2} y={-l * 0.8} width={w} height={l} rx={w * 0.3} fill={THEME.bg2} stroke={THEME.ink} strokeWidth={lwOf(h) * 0.8} />
      <line x1={-facing * w * 0.6} y1={-l * 0.7} x2={-facing * w * 0.6} y2={l * 0.1} stroke={THEME.accent} strokeWidth={lwOf(h) * 0.7} opacity={on} strokeLinecap="round" />
    </g>
  );
};

/** A book lying flat (or at an angle, for physics). Centre x, y. */
export const Book: React.FC<{x: number; y: number; w: number; t: number; angle?: number; color?: string}> = ({x, y, w, t, angle = 0, color = THEME.ink}) => (
  <g transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI})`}>
    <rect x={-w / 2} y={-t / 2} width={w} height={t} rx={t * 0.18} fill={THEME.bg2} stroke={color} strokeWidth={Math.max(3, t * 0.16)} />
    <line x1={-w / 2 + t * 0.5} y1={-t * 0.2} x2={w / 2 - t * 0.3} y2={-t * 0.2} stroke={color} strokeWidth={Math.max(2, t * 0.08)} opacity={0.6} />
  </g>
);

/** A sheet of paper lying on a desk; `lines` 0..1 shows how much is written on it. */
export const Sheet: React.FC<{x: number; y: number; w: number; angle?: number; lines?: number; grade?: string; color?: string}> = ({x, y, w, angle = 0, lines = 0, color = THEME.ink}) => (
  <g transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI})`}>
    <rect x={-w / 2} y={-w * 0.04} width={w} height={w * 0.08} rx={2} fill={color} />
    {lines > 0 && <line x1={-w * 0.42} y1={-w * 0.06} x2={-w * 0.42 + w * 0.84 * lines} y2={-w * 0.06} stroke={THEME.accent} strokeWidth={w * 0.03} strokeLinecap="round" />}
  </g>
);

/** Wall clock. `t` = minutes past (drives both hands), so a fast exam clock is just a fast t. */
export const Clock: React.FC<{x: number; y: number; r: number; t: number; color?: string}> = ({x, y, r, t, color = THEME.ink}) => {
  const m = (t / 60) * Math.PI * 2, hr = (t / 720) * Math.PI * 2;
  return (
    <g stroke={color} strokeLinecap="round" fill="none">
      <circle cx={x} cy={y} r={r} fill={THEME.bg2} strokeWidth={r * 0.1} />
      {Array.from({length: 12}, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={x + Math.sin(a) * r * 0.78} y1={y - Math.cos(a) * r * 0.78} x2={x + Math.sin(a) * r * 0.9} y2={y - Math.cos(a) * r * 0.9} strokeWidth={r * 0.06} />; })}
      <line x1={x} y1={y} x2={x + Math.sin(hr) * r * 0.45} y2={y - Math.cos(hr) * r * 0.45} strokeWidth={r * 0.1} />
      <line x1={x} y1={y} x2={x + Math.sin(m) * r * 0.72} y2={y - Math.cos(m) * r * 0.72} strokeWidth={r * 0.07} stroke={THEME.accent} />
    </g>
  );
};

/** Sweat drops flying off a worried head. `k` 0..1 is the loop phase; draw 2–3 with different seeds. */
export const Sweat: React.FC<{at: P; r: number; k: number; side?: 1 | -1}> = ({at, r, k, side = 1}) => {
  const x = at.x + side * (r * 0.9 + k * r * 0.7), y = at.y - r * 0.4 + k * k * r * 1.6;
  return <path d={`M ${x} ${y - r * 0.22} Q ${x + r * 0.12} ${y} ${x} ${y + r * 0.06} Q ${x - r * 0.12} ${y} ${x} ${y - r * 0.22} Z`} fill={THEME.ink} opacity={1 - k * 0.8} />;
};
