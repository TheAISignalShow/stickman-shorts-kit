/**
 * core/text: on-screen text that always fits and stays long enough to read (23 Nov 2026).
 * Text is never sized by eye: FitText measures it and picks the largest size that fits the box,
 * which ends the overlap and overflow bugs we kept fixing from stills.
 */
import React, {useMemo} from 'react';
import {loadFont} from '@remotion/google-fonts/Inter';
import {fitText} from '@remotion/layout-utils';
import {useCurrentFrame} from 'remotion';
import {stagger, tween, E} from './motion';

export const {fontFamily: FONT} = loadFont('normal', {weights: ['500', '600', '700', '800', '900'], subsets: ['latin']});

/** One line, as large as fits `width`, capped at `max` px. */
export const FitText: React.FC<{text: string; width: number; max?: number; weight?: number; color?: string; style?: React.CSSProperties}> = ({text, width, max = 200, weight = 900, color = '#1b1a1f', style}) => {
  const size = useMemo(() => Math.min(max, fitText({text, withinWidth: width, fontFamily: FONT, fontWeight: weight, letterSpacing: '-0.02em'}).fontSize), [text, width, max, weight]);
  return <div style={{fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: '-0.02em', color, whiteSpace: 'nowrap', width, ...style}}>{text}</div>;
};

/**
 * Headline that sharpens in word by word (blur 6 px -> 0 and fade, 2 frames apart, no slide), then stays dead still.
 * A landed title never keeps moving: the motion passes to the next element or the camera. `start` in frames.
 */
export const Headline: React.FC<{text: string; start: number; width: number; max?: number; color?: string; accent?: string; accentWords?: string[]; style?: React.CSSProperties}> = ({text, start, width, max = 120, color = '#1b1a1f', accent = '#E0473A', accentWords = [], style}) => {
  const f = useCurrentFrame();
  const size = useMemo(() => Math.min(max, fitText({text, withinWidth: width, fontFamily: FONT, fontWeight: 900, letterSpacing: '-0.02em'}).fontSize), [text, width, max]);
  return (
    <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: '-0.02em', color, whiteSpace: 'nowrap', ...style}}>
      {text.split(' ').map((w, i) => {
        const k = tween(stagger(f, i, 2), start, start + 4, E.out);
        return <span key={i} style={{display: 'inline-block', marginRight: '0.26em', filter: k < 1 ? `blur(${(1 - k) * 6}px)` : undefined, opacity: k, color: accentWords.includes(w.replace(/[^\w%$.]/g, '')) ? accent : color}}>{w}</span>;
      })}
    </div>
  );
};

/** A small label chip that slides in. Use for the 2–4 points a scene makes, in reading order. */
export const Chip: React.FC<{text: string; start: number; i?: number; bg?: string; color?: string; size?: number}> = ({text, start, i = 0, bg = '#1b1a1f', color = '#fff', size = 34}) => {
  const f = useCurrentFrame();
  const k = tween(stagger(f, i, 8), start, start + 12, E.back);
  return <div style={{display: 'inline-block', fontFamily: FONT, fontWeight: 800, fontSize: size, color, background: bg, borderRadius: size * 0.6, padding: `${size * 0.32}px ${size * 0.62}px`, transform: `translateX(${(1 - k) * -40}px) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, Math.max(0, k)), whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.18)'}}>{text}</div>;
};
