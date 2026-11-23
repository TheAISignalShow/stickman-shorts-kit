/** core/time: frames, voice-word timings and reading time. Shared by all channels (23 Nov 2026). */
export const FPS = 30;
/** seconds -> frames */
export const fr = (s: number) => Math.round(s * FPS);

/** one spoken word from ElevenLabs: [startSec, endSec, "word"] */
export type Word = [number, number, string];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');

/**
 * Build the timing helpers for one voice file. Never read the words JSON by eye: look times up by phrase.
 *   const {T, F, at, end} = makeTimeline(words as Word[]);
 *   T('margin call')        -> second the phrase starts
 *   F('margin call')        -> the same, in frames
 *   at(sceneStartSec, 'x')  -> frame of the phrase inside a scene that starts at sceneStartSec
 * A missing phrase throws at bundle time, so a script change can never silently shift a visual.
 */
export const makeTimeline = (words: Word[]) => {
  const tok = words.map((w) => norm(w[2]));
  const T = (phrase: string, after = 0): number => {
    const p = phrase.split(/\s+/).map(norm).filter(Boolean);
    for (let i = 0; i <= tok.length - p.length; i++) {
      if (words[i][0] < after) continue;
      if (p.every((x, k) => tok[i + k] === x)) return words[i][0];
    }
    throw new Error(`phrase not found in voice timings: "${phrase}" (after ${after}s)`);
  };
  return {
    T,
    F: (phrase: string, after = 0) => fr(T(phrase, after)),
    at: (sceneStart: number, phrase: string) => fr(T(phrase, sceneStart - 0.05) - sceneStart),
    end: words.length ? words[words.length - 1][1] : 0,
  };
};

/** Minimum seconds a line must stay readable: 0.3 s per word + 0.7 s, never under 1.5 s (project rule, 12 Nov). */
export const readSeconds = (text: string) => Math.max(1.5, text.trim().split(/\s+/).length * 0.3 + 0.7);
export const readFrames = (text: string) => fr(readSeconds(text));
