/**
 * MyShort: the starter Short. Copy this file for every new Short (or ask Claude to, with the skill).
 * The pattern that works for silent Shorts: a HEADER says the idea from frame 0 and stays; LABELS name each side;
 * COUNTERS and DAY jumps show progress; a TURN; a closing LINE. Times are frames (30 = 1 second).
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  THEME, Stick, POSE, poseAt, walkAlong, Header, Label, Counter, DayChip, BigCard, EndLines, Cues, Bed, Cue,
} from '../stickkit';

export const MY_FRAMES = 450; // 15 s
const G = 1270, H = 560; // floor line and figure height (px)

// 1. Acting: each pose change sits on the beat that causes it.
const LEFT = [
  {f: 0, pose: POSE.stand}, {f: 60, pose: {...POSE.shrug, mood: 'neutral' as const}, dur: 10},
  {f: 200, pose: POSE.slumpStand, dur: 12}, {f: 300, pose: POSE.stress, dur: 10},
];
const RIGHT = [
  {f: 0, pose: POSE.stand}, {f: 60, pose: {...POSE.present, mood: 'determined' as const}, dur: 10},
  {f: 200, pose: POSE.hips, dur: 12}, {f: 300, pose: POSE.cheer, dur: 12, how: 'spring' as const},
];

// 2. Sound: every cue sits on something you see (files in public/stickkit/sfx).
const CUES: Cue[] = [{at: 0, s: 'whoosh', v: 0.35}, {at: 150, s: 'whoosh', v: 0.5}, {at: 300, s: 'stamp', v: 0.5}, {at: 360, s: 'pop', v: 0.3}];

export const MyShort: React.FC = () => {
  const f = useCurrentFrame();
  const wl = walkAlong(f, 0, 40, -40, 300), wr = walkAlong(f, 0, 40, 1120, 780);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 45%, ${THEME.bg2} 0%, ${THEME.bg} 70%)`}}>
      <Bed src="stickkit/bed-steady.mp3" frames={MY_FRAMES} volume={0.5} />
      <Cues cues={CUES} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={0} y1={G} x2={1080} y2={G} stroke={THEME.faint} strokeWidth={5} />
        <line x1={540} y1={480} x2={540} y2={G} stroke={THEME.faint} strokeWidth={4} strokeDasharray="14 14" />
        <Stick x={wl.x} groundY={G} h={H} facing={1} dist={wl.dist} gait={wl.gait} pose={poseAt(f, LEFT)} frame={f} seed={1} />
        <Stick x={wr.x} groundY={G} h={H} facing={-1} dist={wr.dist} gait={wr.gait} pose={poseAt(f, RIGHT)} frame={f} seed={4} look={{glasses: true}} />
      </svg>
      <Label text="SCROLLS IN BED" x={30} y={462} w={480} start={20} color={THEME.ink} size={44} />
      <Label text="PHONE IN THE HALL" x={570} y={462} w={480} start={24} color={THEME.ink} size={44} />
      <Counter label="SLEEP" keys={[{f: 0, v: 7}, {f: 160, v: 5, dur: 40}]} format={(v) => `${v.toFixed(1)} h`} x={40} y={1300} w={460} start={22} />
      <Counter label="SLEEP" keys={[{f: 0, v: 7}, {f: 160, v: 8, dur: 40}]} format={(v) => `${v.toFixed(1)} h`} x={580} y={1300} w={380} start={24} />
      <BigCard text="30 NIGHTS LATER" f0={140} f1={196} />
      <EndLines dimFrom={330} lines={[{text: 'Your phone can wait.', f: 340, accent: ['wait']}, {text: 'Can you?', f: 380, size: 110}]} />
      <DayChip keys={[{f: 0, v: 1}, {f: 146, v: 30, dur: 20}]} prefix="NIGHT" y={392} start={26} />
      <Header lines={['SAME PHONE.', 'TWO NIGHTS.']} accentWords={['PHONE']} top={110} max={128} start={-6} />
    </AbsoluteFill>
  );
};
