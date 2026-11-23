/**
 * Stickman Shorts kit: sound (24 Nov 2026). Silent Shorts live on music and sound effects. The effects are
 * short WAV files in public/stickkit/sfx/ (made by tools/make_sfx.py, ours to use); cues sit on visual events.
 * Music never loops (<Audio loop> restarts its volume curve): one bed file the length of the Short.
 */
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';

export const SFX = ['tick', 'pop', 'type', 'whoosh', 'thud', 'stamp', 'paper', 'step', 'chair', 'bell', 'ding', 'buzz', 'rise', 'swish', 'clock'] as const;
export type SfxName = (typeof SFX)[number];
export type Cue = {at: number; s: SfxName; v?: number};

/** All cues at once. `at` in frames. Volumes are relative; the bed sits under them. */
export const Cues: React.FC<{cues: Cue[]; dir?: string}> = ({cues, dir = 'stickkit/sfx'}) => (
  <>
    {cues.filter((c) => c.at >= 0).map((c, i) => (
      <Sequence key={i} from={Math.round(c.at)} durationInFrames={60} layout="none">
        <Audio src={staticFile(`${dir}/${c.s}.wav`)} volume={c.v ?? 0.5} />
      </Sequence>
    ))}
  </>
);

/** The music bed: fades in over 0.4 s and out over the last 1 s of `frames`. */
export const Bed: React.FC<{src: string; frames: number; volume?: number}> = ({src, frames, volume = 0.5}) => (
  <Sequence from={0} durationInFrames={frames} layout="none">
    <Audio src={staticFile(src)} volume={(f) => interpolate(f, [0, 12, frames - 30, frames], [0, volume, volume, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
  </Sequence>
);
