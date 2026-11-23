/**
 * Contact sheet: the target Short frozen at many moments, in one image, each tile labelled with its time.
 * Rendered by `npm run check -- <Id>`; you never need to open it in the studio.
 */
import React from 'react';
import {AbsoluteFill, Freeze} from 'remotion';
import {SHORTS} from './registry';

export type SheetProps = {target: string; every?: number; times?: number[]; tile?: number; from?: number; to?: number};
const COLS = 8;

const framesOf = (p: SheetProps) => {
  const s = SHORTS[p.target];
  if (!s) throw new Error(`No Short called "${p.target}" in src/registry.ts`);
  const last = s.frames - 1;
  if (p.times?.length) return p.times.map((t) => Math.min(last, Math.round(t * 30)));
  const out: number[] = [];
  const a = p.from !== undefined ? Math.round(p.from * 30) : 15, b = p.to !== undefined ? Math.min(last, Math.round(p.to * 30)) : last;
  for (let f = a; f <= b; f += Math.max(1, Math.round((p.every ?? 2.5) * 30))) out.push(f);
  if (out[out.length - 1] !== b) out.push(b);
  return out;
};
const tile = (p: SheetProps) => {
  const s = SHORTS[p.target];
  const w = s.width ?? 1080, h = s.height ?? 1920;
  const base = p.tile ?? 405;
  const tw = w > h ? base * 1.6 : base;
  return {w, h, tw, th: (tw * h) / w, scale: tw / w};
};
export const sheetSize = (p: SheetProps) => {
  const n = framesOf(p).length, t = tile(p), cols = Math.min((p.tile ?? 405) > 450 ? 5 : COLS, n);
  // the sheet is as long as its target, so a frozen frame is never clamped to frame 0
  return {width: Math.round(cols * (t.tw + 8)), height: Math.round(Math.ceil(n / cols) * (t.th + 8)), durationInFrames: SHORTS[p.target].frames};
};

export const Sheet: React.FC<SheetProps> = (p) => {
  const C = SHORTS[p.target].component, t = tile(p);
  const frames = framesOf(p), cols = Math.min((p.tile ?? 405) > 450 ? 5 : COLS, frames.length);
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      {frames.map((f, i) => (
        <div key={i} style={{position: 'absolute', left: (i % cols) * (t.tw + 8), top: Math.floor(i / cols) * (t.th + 8), width: t.tw, height: t.th, overflow: 'hidden'}}>
          <div style={{width: t.w, height: t.h, transform: `scale(${t.scale})`, transformOrigin: '0 0', position: 'relative'}}>
            <Freeze frame={f}><C /></Freeze>
          </div>
          <div style={{position: 'absolute', left: 0, top: 0, background: '#000', color: '#fff', font: '700 22px sans-serif', padding: '2px 8px'}}>{(f / 30).toFixed(1)} s</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
