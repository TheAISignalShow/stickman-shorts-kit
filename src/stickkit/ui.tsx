/**
 * Stickman Shorts kit: everything that is TEXT (24 Nov 2026). The winning Shorts in this format are silent:
 * a header says the idea in the first 2 seconds and stays, labels name each side, counters show progress.
 * All text is measured to fit (fitText), lands fast, then stays dead still. Nothing that carries the story is
 * smaller than ~40 px on a 1080-wide frame (it is read on a phone).
 */
import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {clamp, E, FONT, lerp, springRatio, tween} from '../core';
import {THEME} from './theme';

/** largest font size (≤ max) at which `text` fits `width`, measured with the same weight and letter spacing it is drawn with */
export const fitSize = (text: string, width: number, max: number, weight = 900, spacing = '-0.02em') =>
  Math.min(max, fitText({text, withinWidth: width, fontFamily: FONT, fontWeight: weight, letterSpacing: spacing}).fontSize);

/** Value track for counters: keys say "be at v by frame f+dur". Linear while counting looks honest; ease for big jumps. */
export type NumKey = {f: number; v: number; dur?: number};
export const numAt = (f: number, keys: NumKey[]) => {
  let v = keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    v = lerp(v, k.v, tween(f, k.f, k.f + Math.max(1, k.dur ?? 12), E.out)); // dur 0 = a jump, never a zero-length range
  }
  return v;
};
/** 0..1 pulse for 8 frames after any key starts changing (a counter "ticks"). */
const pulseAt = (f: number, keys: {f: number; dur?: number}[]) => {
  let p = 0;
  for (const k of keys.slice(1)) if (f >= k.f && f < k.f + (k.dur ?? 12) + 8) p = Math.max(p, 1 - tween(f, k.f + (k.dur ?? 12) - 2, k.f + (k.dur ?? 12) + 8));
  return p;
};

/** The idea, in big words, from frame 0 (pass start={-6} so frame 0 already shows the first line). Then it never moves again. */
export const Header: React.FC<{lines: string[]; accentWords?: string[]; top: number; width?: number; max?: number; start?: number}> = ({lines, accentWords = [], top, width = 960, max = 132, start = 0}) => {
  const f = useCurrentFrame();
  const sizes = useMemo(() => lines.map((l) => fitSize(l, width, max)), [lines, width, max]);
  let i = 0;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
      {lines.map((line, li) => (
        <div key={li} style={{fontFamily: FONT, fontWeight: 900, fontSize: sizes[li], lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>
          {line.split(' ').map((w, wi) => {
            const k = springRatio(f, start + 3 * i++, 0.7, 0.32);
            const o = clamp(k * 3);
            return <span key={wi} style={{display: 'inline-block', marginRight: '0.24em', opacity: o, transform: `translateY(${(1 - k) * 40}px) scale(${0.7 + 0.3 * k})`, color: accentWords.includes(w.replace(/[^\w%$]/g, '')) ? THEME.accent : THEME.ink}}>{w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

/** Label over each side ("ASKS FOR ANSWERS"). Measured with its own letter spacing, so it never overflows its box. */
export const Label: React.FC<{text: string; x: number; y: number; w: number; start?: number; color?: string; size?: number; until?: number}> = ({text, x, y, w, start = 0, color = THEME.dim, size = 40, until}) => {
  const f = useCurrentFrame();
  const k = tween(f, start, start + 8, E.out) * (until === undefined ? 1 : 1 - tween(f, until - 6, until, E.in));
  const s = useMemo(() => fitSize(text, w, size, 800, '0.04em'), [text, w, size]);
  if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: s, letterSpacing: '0.04em', color, opacity: k, transform: `translateY(${(1 - k) * 14}px)`, whiteSpace: 'nowrap'}}>{text}</div>;
};

const LABEL: React.CSSProperties = {fontWeight: 800, fontSize: 40, letterSpacing: '0.05em', color: THEME.ink, opacity: 0.78, whiteSpace: 'nowrap'};

/** A counter: label + number that rolls to each new value and ticks (scales, turns accent) as it changes. */
export const Counter: React.FC<{label: string; keys: NumKey[]; x: number; y: number; w: number; format?: (v: number) => string; start?: number; until?: number; highlight?: boolean; labelSize?: number; size?: number}> = ({label, keys, x, y, w, format = (v) => String(Math.round(v)), start = 0, until, highlight = false, labelSize = 40, size: maxSize = 80}) => {
  const f = useCurrentFrame();
  const v = numAt(f, keys), p = pulseAt(f, keys);
  const k = tween(f, start, start + 8, E.out) * (until === undefined ? 1 : 1 - tween(f, until - 6, until, E.in));
  const widest = useMemo(() => keys.reduce((a, b) => (format(b.v).length > a.length ? format(b.v) : a), format(keys[0].v)), [keys, format]);
  const size = useMemo(() => fitSize(widest, w, maxSize), [widest, w, maxSize]);
  const ls = useMemo(() => fitSize(label, w, labelSize, 800, '0.05em'), [label, w, labelSize]);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: FONT, opacity: k}}>
      <div style={{...LABEL, fontSize: ls}}>{label}</div>
      <div style={{fontWeight: 900, fontSize: size, lineHeight: 1.04, letterSpacing: '-0.02em', color: highlight ? THEME.accent : THEME.ink, transform: `scale(${1 + 0.12 * p})`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{format(v)}</div>
    </div>
  );
};

/** A word that changes over time (a grade, a status): label + the latest value, which pops when it changes. */
export type TagKey = {f: number; text: string};
export const Tag: React.FC<{label: string; keys: TagKey[]; x: number; y: number; w: number; start?: number; accent?: string[]; size?: number}> = ({label, keys, x, y, w, start = 0, accent = [], size: maxSize = 80}) => {
  const f = useCurrentFrame();
  let cur = keys[0];
  for (const kk of keys) if (f >= kk.f) cur = kk;
  const p = cur === keys[0] ? 0 : 1 - tween(f, cur.f, cur.f + 12, E.out);
  const k = tween(f, start, start + 8, E.out);
  const size = useMemo(() => Math.min(maxSize, ...keys.map((kk) => fitSize(kk.text, w, maxSize))), [keys, w, maxSize]);
  const ls = useMemo(() => fitSize(label, w, 40, 800, '0.05em'), [label, w]);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: FONT, opacity: k}}>
      <div style={{...LABEL, fontSize: ls}}>{label}</div>
      <div style={{fontWeight: 900, fontSize: size, lineHeight: 1.04, color: p > 0.3 || accent.includes(cur.text) ? THEME.accent : THEME.ink, transform: `scale(${1 + 0.22 * p})`, whiteSpace: 'nowrap'}}>{cur.text}</div>
    </div>
  );
};

/** A progress bar 0..100 with its number. Shows a measured-looking %, so use it only for things that are honest to measure. */
export const Meter: React.FC<{label: string; keys: NumKey[]; x: number; y: number; w: number; start?: number}> = ({label, keys, x, y, w, start = 0}) => {
  const f = useCurrentFrame();
  const v = clamp(numAt(f, keys) / 100), p = pulseAt(f, keys);
  const k = tween(f, start, start + 8, E.out);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: FONT, opacity: k}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16}}>
        <span style={{...LABEL, fontSize: 36}}>{label}</span>
        <span style={{fontWeight: 900, fontSize: 52, color: p > 0.5 ? THEME.accent : THEME.ink, fontVariantNumeric: 'tabular-nums'}}>{Math.round(v * 100)}%</span>
      </div>
      <div style={{height: 14, borderRadius: 7, background: THEME.faint, marginTop: 6, overflow: 'hidden'}}>
        <div style={{width: `${v * 100}%`, height: '100%', borderRadius: 7, background: THEME.accent}} />
      </div>
    </div>
  );
};

/** The chip that rolls a number: "DAY 30", or a countdown with format={(v) => `EXAM IN ${v} DAYS`}. */
export const DayChip: React.FC<{keys: NumKey[]; y: number; prefix?: string; format?: (v: number) => string; start?: number}> = ({keys, y, prefix = 'DAY', format, start = 0}) => {
  const f = useCurrentFrame();
  const v = Math.round(numAt(f, keys)), p = pulseAt(f, keys);
  const k = springRatio(f, start, 0.75, 0.35);
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: clamp(k * 2)}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, letterSpacing: '0.04em', color: THEME.dark, background: THEME.accent, borderRadius: 40, padding: '6px 30px', transform: `scale(${(0.8 + 0.2 * k) * (1 + 0.08 * p)})`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{format ? format(v) : `${prefix} ${v}`}</div>
    </div>
  );
};

/** A full-width card (a time jump or the turn: "EXAM DAY") over a dimmed scene, from f0 to f1. Use few: they stop the action. */
export const BigCard: React.FC<{text: string; sub?: string; f0: number; f1: number; y?: number}> = ({text, sub, f0, f1, y = 900}) => {
  const f = useCurrentFrame();
  if (f < f0 || f > f1 + 6) return null;
  const inK = tween(f, f0, f0 + 7, E.expo), out = tween(f, f1, f1 + 5, E.in);
  const o = inK * (1 - out);
  const s1 = fitSize(text, 900, 190), s2 = sub ? fitSize(sub, 860, 72, 800, '0.04em') : 0;
  return (
    <AbsoluteFill style={{background: `rgba(14,16,21,${0.74 * o})`}}>
      <div style={{position: 'absolute', top: y - s1 * 0.6, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, opacity: o, transform: `scale(${1.14 - 0.14 * inK})`}}>
        <div style={{fontWeight: 900, fontSize: s1, lineHeight: 1, letterSpacing: '-0.02em', color: THEME.ink}}>{text}</div>
        {sub && <div style={{marginTop: 18, fontWeight: 800, fontSize: s2, letterSpacing: '0.04em', color: THEME.accent}}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** A grade or verdict stamp that slams down at `f0` (big -> landed, with a short ring) and fades out by f1. */
export const Stamp: React.FC<{text: string; x: number; y: number; f0: number; size?: number; color?: string; rot?: number; f1?: number}> = ({text, x, y, f0, size = 110, color = THEME.ink, rot = -8, f1 = 99999}) => {
  const f = useCurrentFrame();
  if (f < f0 || f > f1) return null;
  const k = springRatio(f, f0, 0.55, 0.3);
  const out = tween(f, f1 - 6, f1, E.in);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${2.2 - 1.2 * k})`, opacity: clamp(k * 4) * (1 - out), fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, color, border: `${size * 0.08}px solid ${color}`, borderRadius: size * 0.18, padding: `${size * 0.08}px ${size * 0.22}px`, background: 'rgba(14,16,21,0.88)', whiteSpace: 'nowrap'}}>{text}</div>
  );
};

/**
 * Closing lines: each appears at its frame and stays until `until`. Keep them in a band clear of the faces
 * (default y 520, x 130-950: clear of YouTube's button column). `fine: true` = a smaller, wrapping footnote line.
 */
export type EndLine = {text: string; f: number; accent?: string[]; size?: number; fine?: boolean};
export const EndLines: React.FC<{lines: EndLine[]; y?: number; dimFrom?: number; until?: number; dim?: number; width?: number}> = ({lines, y = 520, dimFrom, until, dim = 0.8, width = 820}) => {
  const f = useCurrentFrame();
  const d = dimFrom === undefined ? 0 : tween(f, dimFrom, dimFrom + 10, E.inOut);
  const gone = until === undefined ? 0 : tween(f, until - 6, until, E.in);
  if (f >= (until ?? 1e9)) return null;
  return (
    <AbsoluteFill style={{background: `rgba(14,16,21,${dim * d * (1 - gone)})`}}>
      <div style={{position: 'absolute', top: y, left: (1080 - width) / 2, width, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: 1 - gone}}>
        {lines.map((l, i) => {
          if (f < l.f) return null;
          const k = springRatio(f, l.f, 0.8, 0.35);
          const word = (w: string, wi: number) => <span key={wi} style={{color: (l.accent ?? []).includes(w.replace(/[^\w%$']/g, '')) || w.startsWith('*') ? THEME.accent : undefined}}>{w}{' '}</span>;
          if (l.fine) {
            return <div key={i} style={{fontFamily: FONT, fontWeight: 700, fontSize: l.size ?? 46, lineHeight: 1.22, color: THEME.ink, opacity: clamp(k * 3) * 0.9, transform: `translateY(${(1 - k) * 18}px)`, textAlign: 'center', marginTop: 10}}>{l.text.split(' ').map(word)}</div>;
          }
          const s = fitSize(l.text, width, l.size ?? 92);
          return <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: s, lineHeight: 1.05, letterSpacing: '-0.02em', color: THEME.ink, opacity: clamp(k * 3), transform: `translateY(${(1 - k) * 24}px)`, whiteSpace: 'nowrap'}}>{l.text.split(' ').map(word)}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
