/**
 * core/camera: one camera per scene, and layers at different depths that move by different amounts (23 Nov 2026).
 * The camera eases between keys with a purpose (follow, reveal, push in on a payoff); the background moves
 * less than the subject (parallax), which is what gives depth. No idle drift by default: constant floating
 * reads as generated. Pass `drift` only for a deliberate handheld shot.
 *
 *   <Camera keys={[{f: 0, x: 960, y: 540, zoom: 1}, {f: 90, x: 1100, y: 500, zoom: 1.2}]}>
 *     <Layer depth={0.25}>…far wall…</Layer>
 *     <Layer depth={1}>…floor, characters, props…</Layer>
 *     <Layer depth={1.5} blur={6}>…foreground…</Layer>
 *   </Camera>
 * World space is 1920×1080 px. depth 0 = fixed to the screen, 1 = subject plane, above 1 = in front of the subject.
 */
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {E, lerp, wiggle} from './motion';

export type CamKey = {f: number; x?: number; y?: number; zoom?: number; rot?: number};
type Cam = {x: number; y: number; zoom: number; rot: number; cx: number; cy: number};
const Ctx = createContext<Cam>({x: 960, y: 540, zoom: 1, rot: 0, cx: 960, cy: 540});
export const useCamera = () => useContext(Ctx);

const full = (k: CamKey, cx: number, cy: number) => ({f: k.f, x: k.x ?? cx, y: k.y ?? cy, zoom: k.zoom ?? 1, rot: k.rot ?? 0});

export const camAt = (keys: CamKey[], f: number, cx: number, cy: number, drift = 0): Cam => {
  const ks = keys.map((k) => full(k, cx, cy));
  let a = ks[0], b = ks[0];
  for (let i = 0; i < ks.length; i++) {
    if (ks[i].f <= f) { a = ks[i]; b = ks[Math.min(ks.length - 1, i + 1)]; }
  }
  const k = b.f === a.f ? 1 : E.inOut(Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f))));
  return {
    x: lerp(a.x, b.x, k) + wiggle(f, 1, 0.35, drift),
    y: lerp(a.y, b.y, k) + wiggle(f, 2, 0.35, drift * 0.7),
    zoom: lerp(a.zoom, b.zoom, k),
    rot: lerp(a.rot, b.rot, k) + wiggle(f, 3, 0.3, drift * 0.02),
    cx, cy,
  };
};

export const Camera: React.FC<{keys: CamKey[]; drift?: number; children: React.ReactNode}> = ({keys, drift = 0, children}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return <Ctx.Provider value={camAt(keys, f, width / 2, height / 2, drift)}><AbsoluteFill>{children}</AbsoluteFill></Ctx.Provider>;
};

export const Layer: React.FC<{depth?: number; blur?: number; children: React.ReactNode}> = ({depth = 1, blur = 0, children}) => {
  const c = useCamera();
  const x = c.cx + (c.x - c.cx) * depth, y = c.cy + (c.y - c.cy) * depth;
  const z = 1 + (c.zoom - 1) * depth;
  return (
    <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${c.cx}px, ${c.cy}px) rotate(${c.rot * depth}deg) scale(${z}) translate(${-x}px, ${-y}px)`, filter: blur ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};
