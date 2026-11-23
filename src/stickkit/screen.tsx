/**
 * Stickman Shorts kit: a chat-app screen mock-up (24 Nov 2026). "Show the thing": when a character uses AI,
 * we show a real-looking chat screen, not a labelled box. Generic on purpose: no product logos or names.
 * The person's message types out letter by letter; the AI shows "typing" dots, then streams its answer.
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp, E, FONT, springRatio, tween} from '../core';
import {THEME} from './theme';

/** who: 'you' types on the right; 'ai' (or 'them', another person; name = the avatar's letters) answers on the left */
export type Msg = {who: 'you' | 'ai' | 'them'; text: string; f: number; cps?: number; name?: string};

const typed = (f: number, m: Msg, cps: number) => {
  const n = Math.floor(Math.max(0, f - m.f) * (cps / 30));
  return {s: m.text.slice(0, n), done: n >= m.text.length};
};

export const ChatScreen: React.FC<{x: number; y: number; w: number; msgs: Msg[]; start?: number; off?: {f: number; text?: string}; title?: string; hideFrom?: number; keep?: number}> = ({x, y, w, msgs: all, start = 0, off, title = 'AI chat', hideFrom, keep = 2}) => {
  const f = useCurrentFrame();
  // like a real chat app it scrolls: only the last `keep` messages that have started are shown
  const msgs = all.filter((m) => f >= m.f).slice(-keep);
  const k = springRatio(f, start, 0.78, 0.35);
  if (f < start) return null;
  const gone = hideFrom === undefined ? 0 : tween(f, hideFrom, hideFrom + 8, E.in);
  const offK = off ? tween(f, off.f, off.f + 6, E.out) : 0;
  const fs = Math.round(w * 0.086);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: FONT, transform: `scale(${(0.86 + 0.14 * k) * (1 - 0.15 * gone)})`, transformOrigin: '50% 100%', opacity: clamp(k * 3) * (1 - gone)}}>
      <div style={{border: `4px solid ${THEME.ink}`, borderRadius: 26, background: '#12151C', overflow: 'hidden', position: 'relative'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 9, padding: '12px 18px', borderBottom: `2px solid ${THEME.faint}`}}>
          {[0, 1, 2].map((i) => <div key={i} style={{width: 12, height: 12, borderRadius: 6, background: THEME.faint}} />)}
          <div style={{marginLeft: 10, fontSize: fs * 0.78, fontWeight: 800, color: THEME.dim, letterSpacing: '0.03em'}}>{title}</div>
        </div>
        <div style={{padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: w * 0.36}}>
          {msgs.map((m, i) => {
            if (f < m.f) return null;
            if (m.who === 'you') {
              const t = typed(f, m, m.cps ?? 26);
              const caret = !t.done && Math.floor(f / 8) % 2 === 0;
              return (
                <div key={i} style={{alignSelf: 'flex-end', maxWidth: '86%', background: THEME.faint, color: THEME.ink, borderRadius: 20, borderBottomRightRadius: 6, padding: '10px 16px', fontSize: fs, fontWeight: 700, lineHeight: 1.2}}>
                  {t.s}<span style={{opacity: caret ? 1 : 0, color: THEME.accent}}>|</span>
                </div>
              );
            }
            const think = m.who === 'ai' && f < m.f + 12;
            const shown = think ? '' : m.who === 'them' ? m.text.slice(0, Math.floor((f - m.f) * ((m.cps ?? 40) / 30))) : m.text.slice(0, Math.floor((f - m.f - 12) * ((m.cps ?? 70) / 30)));
            return (
              <div key={i} style={{alignSelf: 'flex-start', maxWidth: '92%', display: 'flex', gap: 10, alignItems: 'flex-start'}}>
                <div style={{flex: '0 0 auto', width: fs * 1.3, height: fs * 1.3, borderRadius: fs * 0.65, background: m.who === 'them' ? THEME.dim : THEME.accent, color: THEME.dark, fontSize: fs * 0.56, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{m.name ?? (m.who === 'them' ? '?' : 'AI')}</div>
                <div style={{color: THEME.ink, fontSize: fs, fontWeight: 600, lineHeight: 1.22, paddingTop: 2, whiteSpace: 'pre-line'}}>
                  {think ? <span style={{color: THEME.dim, letterSpacing: '0.2em'}}>{'•••'.slice(0, 1 + (Math.floor(f / 4) % 3))}</span> : shown}
                </div>
              </div>
            );
          })}
        </div>
        {off && f >= off.f && (
          <div style={{position: 'absolute', inset: 0, background: `rgba(10,11,15,${0.94 * offK})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: fs * 1.5, fontWeight: 900, color: THEME.ink, opacity: offK, letterSpacing: '0.02em', transform: `scale(${1.2 - 0.2 * offK})`}}>{off.text ?? 'NO AI'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

/** One answer mark on the exam paper, appearing at frame f. */
export type Mark = {f: number; m: 'tick' | 'cross' | 'q' | 'blank'};
/**
 * An exam paper mock-up (white paper, dark print): a title, a timer that counts down, and question rows whose
 * marks appear at their frames. The paper reads at phone size, where a sheet drawn side-on on a desk does not.
 */
export const PaperMock: React.FC<{x: number; y: number; w: number; start: number; title?: string; timer?: {f0: number; f1: number; from: number}; rows: Mark[]; hideFrom?: number}> = ({x, y, w, start, title = 'FINAL EXAM', timer, rows, hideFrom}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const k = springRatio(f, start, 0.8, 0.35);
  const gone = hideFrom === undefined ? 0 : tween(f, hideFrom, hideFrom + 8, E.in);
  const fs = Math.round(w * 0.085);
  const mins = timer ? Math.max(0, timer.from * (1 - tween(f, timer.f0, timer.f1, (t: number) => t))) : 0;
  const clock = `${String(Math.floor(mins)).padStart(2, '0')}:${String(Math.floor((mins % 1) * 60)).padStart(2, '0')}`;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: FONT, opacity: clamp(k * 3) * (1 - gone), transform: `translateY(${(1 - k) * 40}px) rotate(${(1 - k) * -3}deg)`}}>
      <div style={{background: THEME.ink, color: THEME.dark, borderRadius: 14, padding: '16px 22px 18px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `3px solid ${THEME.dark}`, paddingBottom: 6, marginBottom: 6}}>
          <span style={{fontWeight: 900, fontSize: fs, letterSpacing: '0.02em'}}>{title}</span>
          {timer && <span style={{fontWeight: 800, fontSize: fs * 0.9, fontVariantNumeric: 'tabular-nums'}}>{clock}</span>}
        </div>
        {rows.map((r, i) => {
          const on = f >= r.f && r.m !== 'blank';
          const p = on ? springRatio(f, r.f, 0.55, 0.28) : 0;
          const sz = fs * 1.05;
          const mark = r.m === 'q' ? '?' : (
            <svg width={sz} height={sz} viewBox="0 0 10 10" style={{display: 'block'}}>
              {r.m === 'tick' ? <path d="M1.5 5.5 L4 8 L8.8 1.8" fill="none" stroke={THEME.dark} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" /> : <path d="M2 2 L8 8 M8 2 L2 8" fill="none" stroke={THEME.dark} strokeWidth={1.6} strokeLinecap="round" />}
            </svg>
          );
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, height: fs * 1.45}}>
              <span style={{fontWeight: 800, fontSize: fs * 0.85, width: fs * 1.7}}>Q{i + 1}</span>
              <span style={{flex: 1, height: 4, background: 'rgba(14,16,21,0.25)', borderRadius: 2}} />
              <span style={{width: fs * 1.2, textAlign: 'center', fontWeight: 900, fontSize: fs * 1.15, opacity: clamp(p * 3), transform: `scale(${1.6 - 0.6 * p})`, display: 'inline-block'}}>{on ? mark : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * The frame every screen mock-up uses (a rounded dark card with a title bar). Put anything inside: a calendar,
 * a tracker, a bank app, a to-do list. It springs in at `start` and fades out from `hideFrom`.
 */
export const Card: React.FC<{x: number; y: number; w: number; start?: number; hideFrom?: number; title?: string; children?: React.ReactNode}> = ({x, y, w, start = 0, hideFrom, title, children}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const k = springRatio(f, start, 0.78, 0.35);
  const gone = hideFrom === undefined ? 0 : tween(f, hideFrom, hideFrom + 8, E.in);
  const fs = Math.min(44, Math.round(w * 0.07));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: FONT, transform: `scale(${(0.86 + 0.14 * k) * (1 - 0.15 * gone)})`, transformOrigin: '50% 100%', opacity: clamp(k * 3) * (1 - gone)}}>
      <div style={{border: `4px solid ${THEME.ink}`, borderRadius: 26, background: '#12151C', overflow: 'hidden', color: THEME.ink}}>
        {title && (
          <div style={{display: 'flex', alignItems: 'center', gap: 9, padding: '12px 18px', borderBottom: `2px solid ${THEME.faint}`}}>
            {[0, 1, 2].map((i) => <div key={i} style={{width: 12, height: 12, borderRadius: 6, background: THEME.faint}} />)}
            <div style={{marginLeft: 10, fontSize: Math.min(32, fs * 0.8), fontWeight: 800, color: THEME.dim, letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{title}</div>
          </div>
        )}
        <div style={{padding: 18, fontSize: fs}}>{children}</div>
      </div>
    </div>
  );
};
