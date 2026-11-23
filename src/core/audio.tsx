/**
 * core/audio: the three sound layers, done the safe way (23 Nov 2026).
 * Music never uses <Audio loop>: a looped tag restarts its volume curve on every loop. It sits inside a Sequence that ends, so it cannot come back.
 * After any change here, measure the rendered mix (ebur128, or a difference against a no-music render).
 */
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {fr} from './time';

/** the narration, from frame 0 */
export const Voice: React.FC<{src: string; volume?: number}> = ({src, volume = 1}) => <Audio src={staticFile(src)} volume={volume} />;

/** Soft music for the opening only: fades in over 0.5 s, holds, fades out by `seconds`. */
export const IntroMusic: React.FC<{src: string; seconds?: number; volume?: number}> = ({src, seconds = 10, volume = 0.03}) => (
  <Sequence from={0} durationInFrames={fr(seconds + 1)}>
    <Audio src={staticFile(src)} volume={(f) => interpolate(f, [0, 15, fr(seconds - 1.5), fr(seconds + 0.5)], [0, volume, volume, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
  </Sequence>
);

export type SfxCue = {at: number; src: string; volume?: number};
/** sound effects on visual events; `at` in frames */
export const Sfx: React.FC<{cues: SfxCue[]}> = ({cues}) => (
  <>
    {cues.map((c, i) => (
      <Sequence key={i} from={Math.max(0, Math.round(c.at))}><Audio src={staticFile(c.src)} volume={c.volume ?? 0.5} /></Sequence>
    ))}
  </>
);
