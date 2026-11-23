/**
 * core/light: light, depth and the final grade, so flat vector art reads as a lit scene (23 Nov 2026).
 * One key light per scene. Everything that stands on the ground gets a contact shadow. Grade once, on top.
 * No glow and no blur on text or key numbers.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const hex = (c: string) => {
  const s = c.replace('#', '');
  const n = s.length === 3 ? s.split('').map((x) => x + x).join('') : s;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};
/** lighter (k > 0) or darker (k < 0) version of a hex colour; k in -1..1 */
export const shade = (c: string, k: number) => {
  const t = k < 0 ? 0 : 255, a = Math.abs(k);
  return '#' + hex(c).map((v) => Math.round(v + (t - v) * a).toString(16).padStart(2, '0')).join('');
};
/** mix two hex colours */
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

/** Wall or sky: a vertical gradient plus one soft pool of key light. */
export const Backdrop: React.FC<{top: string; bottom: string; light?: {x: number; y: number; r: number; color?: string; strength?: number}}> = ({top, bottom, light}) => (
  <AbsoluteFill style={{background: `linear-gradient(${top}, ${bottom})`}}>
    {light && <AbsoluteFill style={{background: `radial-gradient(circle at ${light.x}px ${light.y}px, ${light.color ?? '#fff'} 0, transparent ${light.r}px)`, opacity: light.strength ?? 0.5, mixBlendMode: 'soft-light'}} />}
  </AbsoluteFill>
);

/** Ground plane from y to the bottom of the frame: lighter at the horizon, darker toward the camera. */
export const Floor: React.FC<{y: number; color: string; height?: number}> = ({y, color, height = 1400}) => (
  <div style={{position: 'absolute', left: -2000, width: 5920, top: y, height, background: `linear-gradient(${shade(color, -0.1)}, ${color} 9%, ${shade(color, -0.2)})`, borderTop: `5px solid ${shade(color, -0.42)}`}} />
);

/**
 * Shadow where an object meets the ground. `lift` = how far the object's bottom is above the ground:
 * the higher it is, the wider and fainter the shadow. `dx` shifts it away from the key light.
 */
export const ContactShadow: React.FC<{x: number; y: number; w: number; lift?: number; dx?: number; strength?: number}> = ({x, y, w, lift = 0, dx = 0, strength = 0.38}) => {
  const k = Math.min(1, Math.max(0, lift) / 500);
  const ww = w * (1 + k * 0.9), hh = Math.max(8, ww * 0.16);
  return <div style={{position: 'absolute', left: x - ww / 2 + dx * (1 + k * 4), top: y - hh / 2, width: ww, height: hh, borderRadius: '50%', background: '#000', opacity: strength * (1 - k * 0.85), filter: `blur(${6 + k * 18}px)`}} />;
};

/** Final pass over the whole frame: vignette, a touch of colour and moving grain. Add it once, last. */
export const Grade: React.FC<{vignette?: number; grain?: number; tint?: string; tintStrength?: number}> = ({vignette = 0.28, grain = 0.07, tint, tintStrength = 0.12}) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 97;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {tint && <AbsoluteFill style={{background: tint, opacity: tintStrength, mixBlendMode: 'soft-light'}} />}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, transparent 52%, rgba(0,0,0,${vignette}) 100%)`}} />
      {grain > 0 && (
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: grain, mixBlendMode: 'overlay'}}>
          <filter id={`core-grain-${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter={`url(#core-grain-${seed})`} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

/** Overlay that shows the frame-fill guides on stills (title-safe box and thirds). Never ship it. */
export const Guides: React.FC<{on?: boolean}> = ({on = true}) =>
  on ? (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: '5%', top: '5%', right: '5%', bottom: '5%', border: '2px dashed rgba(255,0,90,0.7)'}} />
      {[33.33, 66.66].map((p) => <div key={p} style={{position: 'absolute', left: `${p}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(255,0,90,0.45)'}} />)}
      {[33.33, 66.66].map((p) => <div key={p} style={{position: 'absolute', top: `${p}%`, left: 0, right: 0, borderTop: '1px solid rgba(255,0,90,0.45)'}} />)}
    </AbsoluteFill>
  ) : null;
