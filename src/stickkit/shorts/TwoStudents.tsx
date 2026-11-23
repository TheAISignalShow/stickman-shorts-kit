/**
 * "Two students. Same AI." (The AI Signal, 24 Nov 2026, v5): an original ~32 s silent stickman Short built with the kit.
 * Format (studied, not copied, from the silent 2D Shorts that are winning): a header that states the idea from
 * frame 0, two sides compared, counters and a countdown that progress, an escalating turn, a closing line.
 * v5 follows three independent critiques: no score that gives the ending away, readable grades, time jumps inside
 * the chips instead of full-screen "DAY N" cards, an exam you can read, a short ending, and real fine print
 * (Bastani et al., PNAS 2025) instead of invented statistics. Times are frames at 30 fps.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  THEME, Stick, POSE, poseAt, walkAlong, solveStick, Desk, Chair, Laptop, Phone, Book, Sheet, Sweat, deskTop,
  ChatScreen, PaperMock, Header, Label, Counter, Tag, DayChip, BigCard, Stamp, EndLines, Cues, Bed, Cue, PoseKey,
  simulate, firstImpact, tween, E, wiggle, BodySpec,
} from '..';

export const TS_FRAMES = 950;
const G = 1270, FH = 470, SEAT = 0.25 * FH;
const LX = 165, RX = 915;
const DY = deskTop(G, FH);
const LD = {x0: 305, x1: 480}, RD = {x0: 575, x1: 775};

// ---- the beats (frames)
const B = {jump1: 196, jump2: 300, push: 362, exam: 430, papers: 512, results: 612, end: 700, ask: 884};

// ---- physics, described once: his feet push two books off the desk; the other's practice sheets pile up; exam papers drop
const desks: BodySpec[] = [
  {id: 'deskL', shape: 'box', x: (LD.x0 + LD.x1) / 2, y: DY + 7, w: LD.x1 - LD.x0, h: 14, isStatic: true},
  {id: 'deskR', shape: 'box', x: (RD.x0 + RD.x1) / 2, y: DY + 7, w: RD.x1 - RD.x0, h: 14, isStatic: true},
  {id: 'kerb', shape: 'box', x: 548, y: 1190, w: 10, h: 160, isStatic: true},
];
const BOOKS = [0, 1].map((i) => ({x: 440 + i * 6, y: DY - 11 - i * 22}));
const books: BodySpec[] = BOOKS.map((b, i) => ({id: `book${i}`, shape: 'box', x: b.x, y: b.y, w: 80, h: 22, vx: [250, 215][i], vy: -90, spin: 3, restitution: 0.2, friction: 0.3, density: 0.004, at: B.push}));
const sheets: BodySpec[] = Array.from({length: 6}, (_, i) => ({id: `sh${i}`, shape: 'box', x: 618 + ((i * 7) % 11) - 5, y: 980, w: 90, h: 7, angle: ((i % 3) - 1) * 0.12, restitution: 0.05, friction: 0.9, density: 0.002, at: 330 + i * 12}));
const exams: BodySpec[] = [
  {id: 'examL', shape: 'box', x: 365, y: 960, w: 112, h: 7, angle: 0.15, restitution: 0.05, friction: 0.9, at: 504},
  {id: 'examR', shape: 'box', x: 715, y: 960, w: 112, h: 7, angle: -0.15, restitution: 0.05, friction: 0.9, at: 506},
];
const SIM = simulate({frames: TS_FRAMES, pxPerMeter: 250, floorY: G, bodies: [...desks, ...books, ...sheets, ...exams]});

// ---- acting: every pose change sits on the beat that causes it
const L_POSE: PoseKey[] = [
  {f: 0, pose: POSE.stand}, {f: 38, pose: POSE.sitIdle, dur: 12, how: 'anticipate'}, {f: 52, pose: POSE.typeFast, dur: 8},
  {f: 96, pose: POSE.leanBack, dur: 12, how: 'spring'}, {f: 136, pose: POSE.phone, dur: 10}, {f: 168, pose: {...POSE.phone, talk: 0.7, mood: 'happy'}, dur: 5},
  {f: 210, pose: POSE.sitCheer, dur: 10, how: 'spring'}, {f: 250, pose: POSE.leanBack, dur: 12}, {f: 276, pose: POSE.phone, dur: 10},
  {f: 304, pose: POSE.typeFast, dur: 8}, {f: 340, pose: POSE.leanBack, dur: 10}, {f: B.push - 12, pose: POSE.feetUp, dur: 12, how: 'anticipate'},
  {f: B.push + 14, pose: {...POSE.feetUp, talk: 0.8, mood: 'happy'}, dur: 6}, {f: 400, pose: POSE.phone, dur: 12},
  {f: 500, pose: POSE.sitIdle, dur: 8}, {f: 516, pose: POSE.sitShocked, dur: 4, how: 'snap'}, {f: 534, pose: POSE.sitStress, dur: 10},
  {f: 562, pose: {...POSE.sitThink, mood: 'worried'}, dur: 10}, {f: 586, pose: POSE.sitStress, dur: 10},
  {f: B.results + 6, pose: POSE.slump, dur: 10},
];
const R_POSE: PoseKey[] = [
  {f: 0, pose: POSE.stand}, {f: 40, pose: POSE.sitIdle, dur: 12, how: 'anticipate'}, {f: 54, pose: POSE.type, dur: 8},
  {f: 96, pose: POSE.sitThink, dur: 10}, {f: 120, pose: POSE.type, dur: 8}, {f: 150, pose: POSE.sitThink, dur: 10}, {f: 178, pose: POSE.write, dur: 10},
  {f: 220, pose: {...POSE.sitShocked, mood: 'worried'}, dur: 6}, {f: 246, pose: {...POSE.sitIdle, mood: 'determined', nod: 6}, dur: 8}, {f: 262, pose: POSE.write, dur: 10},
  {f: 306, pose: POSE.type, dur: 8}, {f: 344, pose: POSE.write, dur: 10}, {f: 380, pose: POSE.sitThink, dur: 10}, {f: 398, pose: POSE.write, dur: 10},
  {f: 500, pose: POSE.sitIdle, dur: 8}, {f: 514, pose: POSE.write, dur: 10}, {f: 552, pose: POSE.sitThink, dur: 10}, {f: 566, pose: POSE.write, dur: 10},
  {f: B.results + 20, pose: POSE.sitCheer, dur: 8, how: 'spring'}, {f: 660, pose: {...POSE.sitCheer, lift: 24}, dur: 6}, {f: 668, pose: {...POSE.sitCheer, lift: 0}, dur: 6},
  {f: 760, pose: {...POSE.sitIdle, mood: 'happy'}, dur: 14},
];

// ---- the two chats (the app scrolls: only the last two messages show)
const you = (text: string, f: number) => ({who: 'you' as const, text, f, cps: 32});
const ai = (text: string, f: number) => ({who: 'ai' as const, text, f});
const L_CHATS = [
  {start: 50, hide: 186, msgs: [you('Do my homework for me.', 54), ai('Done. Here are all 20 answers.', 80)]},
  {start: 304, hide: 420, msgs: [you('Just give me the answers.', 308), ai('Sure! Answers 1 to 20:', 334)]},
];
const R_CHATS = [
  {start: 52, hide: 190, msgs: [you('Quiz me on chapter 3. No answers.', 56), ai('Q1. Why does ice float?', 92), you('Less dense than water?', 124), ai('Yes! Q2: why does that help fish?', 140)]},
  {start: 306, hide: 420, msgs: [you('Test me on everything.', 310), ai('Q1 of 30. Go.', 336)]},
];

const win = (f: number, a: number, b: number, fade = 6) => tween(f, a, a + fade, E.out) * (1 - tween(f, b, b + fade, E.in));

// ---- sound: every cue sits on something you see
const typing = (a: number, b: number, v = 0.22): Cue[] => Array.from({length: Math.ceil((b - a) / 8)}, (_, i) => ({at: a + i * 8, s: 'type', v}));
const CUES: Cue[] = [
  {at: 0, s: 'whoosh', v: 0.35}, {at: 9, s: 'step', v: 0.25}, {at: 22, s: 'step', v: 0.25}, {at: 34, s: 'step', v: 0.22}, {at: 28, s: 'pop', v: 0.3},
  {at: 45, s: 'chair', v: 0.35}, {at: 48, s: 'swish', v: 0.18},
  ...typing(54, 76), ...typing(56, 88, 0.16), {at: 92, s: 'ding', v: 0.3}, {at: 104, s: 'ding', v: 0.22}, {at: 136, s: 'pop', v: 0.25}, ...typing(124, 140, 0.16), {at: 152, s: 'ding', v: 0.22},
  {at: B.jump1, s: 'whoosh', v: 0.45}, {at: B.jump1 + 2, s: 'tick', v: 0.3}, {at: 206, s: 'stamp', v: 0.6}, {at: 214, s: 'stamp', v: 0.5}, {at: 212, s: 'rise', v: 0.25},
  {at: B.jump2, s: 'whoosh', v: 0.45}, {at: B.jump2 + 2, s: 'tick', v: 0.3}, ...typing(308, 330), ...typing(310, 330, 0.16), {at: 346, s: 'ding', v: 0.2}, {at: 348, s: 'ding', v: 0.2},
  {at: B.push - 2, s: 'swish', v: 0.3}, ...books.map((b, i) => ({at: firstImpact(SIM, b.id), s: 'thud' as const, v: 0.55 - i * 0.1})),
  ...sheets.map((s, i) => ({at: (s.at ?? 0) + 7, s: 'paper' as const, v: 0.2 + 0.02 * i})), {at: 372, s: 'pop', v: 0.25}, {at: 410, s: 'pop', v: 0.25},
  {at: B.exam, s: 'whoosh', v: 0.55}, {at: B.exam + 6, s: 'bell', v: 0.45}, {at: 498, s: 'swish', v: 0.25}, {at: 512, s: 'paper', v: 0.35}, {at: 514, s: 'paper', v: 0.3},
  ...Array.from({length: 6}, (_, i) => ({at: 520 + i * 16, s: 'clock' as const, v: 0.32})),
  ...[528, 548, 568, 588].map((at) => ({at, s: 'tick' as const, v: 0.3})), ...[540, 584].map((at) => ({at, s: 'buzz' as const, v: 0.16})),
  {at: B.results, s: 'stamp', v: 0.6}, {at: B.results + 14, s: 'stamp', v: 0.6}, {at: B.results + 16, s: 'thud', v: 0.3}, {at: B.results + 20, s: 'rise', v: 0.35}, {at: 662, s: 'ding', v: 0.3},
  {at: B.end + 6, s: 'pop', v: 0.28}, {at: 740, s: 'pop', v: 0.3}, {at: 790, s: 'tick', v: 0.25}, {at: B.ask, s: 'bell', v: 0.3},
];

export const TwoStudents: React.FC<{sound?: boolean}> = ({sound = true}) => {
  const f = useCurrentFrame();
  const wl = walkAlong(f, 0, 38, -10, LX), wr = walkAlong(f, 0, 38, 1090, RX);
  const lArgs = {x: wl.x, groundY: G, h: FH, facing: 1 as const, dist: wl.dist, gait: wl.gait, seatH: SEAT, pose: poseAt(f, L_POSE), frame: f, seed: 1};
  const rArgs = {x: wr.x, groundY: G, h: FH, facing: -1 as const, dist: wr.dist, gait: wr.gait, seatH: SEAT, pose: poseAt(f, R_POSE), frame: f, seed: 4};
  const lJ = solveStick(lArgs);
  const open = tween(f, 44, 56, E.out) * (1 - tween(f, 498, 506, E.inOut));
  const lapO = 1 - tween(f, 506, 514, E.in);
  const phoneOn = Math.max(win(f, 138, 200), win(f, 278, 302), win(f, 402, 426));
  const sheetsGone = 1 - tween(f, 498, 510, E.in);
  const dust = Array.from({length: 18}, (_, i) => ({x: (i * 173) % 1080 + wiggle(f, i, 0.3, 30), y: 520 + ((i * 97 + f * (0.25 + (i % 4) * 0.08)) % 760), r: 2 + (i % 3)}));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 45%, ${THEME.bg2} 0%, ${THEME.bg} 70%)`}}>
      {sound && <Bed src="stickkit/two-students-bed.mp3" frames={TS_FRAMES} volume={0.55} />}
      {sound && <Cues cues={CUES} />}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs><linearGradient id="ts-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={THEME.bg2} /><stop offset="1" stopColor={THEME.bg} /></linearGradient></defs>
        {dust.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={THEME.ink} opacity={0.06 + (i % 3) * 0.03} />)}
        <rect x={0} y={G} width={1080} height={1920 - G} fill="url(#ts-floor)" />
        <line x1={0} y1={G} x2={1080} y2={G} stroke={THEME.faint} strokeWidth={5} />
        <line x1={540} y1={480} x2={540} y2={G} stroke={THEME.faint} strokeWidth={4} strokeDasharray="14 14" />
        <path d={`M 300 846 L 384 ${DY - 76}`} stroke={THEME.faint} strokeWidth={4} strokeDasharray="8 10" opacity={open * lapO * (f < 430 ? 1 : 0)} />
        <path d={`M 780 846 L 696 ${DY - 76}`} stroke={THEME.faint} strokeWidth={4} strokeDasharray="8 10" opacity={open * lapO * (f < 430 ? 1 : 0)} />
        <Chair x={LX} groundY={G} h={FH} facing={1} seatH={SEAT} />
        <Chair x={RX} groundY={G} h={FH} facing={-1} seatH={SEAT} />
        <Desk x0={LD.x0} x1={LD.x1} groundY={G} h={FH} />
        <Desk x0={RD.x0} x1={RD.x1} groundY={G} h={FH} />
        <g opacity={lapO}>
          <Laptop x={312} deskY={DY} h={FH} facing={1} open={open} on={open} />
          <Laptop x={768} deskY={DY} h={FH} facing={-1} open={open} on={open} />
        </g>
        {BOOKS.map((b, i) => { const s = SIM[`book${i}`][f]; return s.alive ? <Book key={i} x={s.x} y={s.y} w={80} t={22} angle={s.angle} /> : <Book key={i} x={b.x} y={b.y} w={80} t={22} />; })}
        <g opacity={sheetsGone}>{sheets.map((s) => { const b = SIM[s.id][f]; return b.alive ? <Sheet key={s.id} x={b.x} y={b.y} w={90} angle={b.angle} /> : null; })}</g>
        {exams.map((s) => { const b = SIM[s.id][f]; return b.alive ? <Sheet key={s.id} x={b.x} y={b.y} w={112} angle={b.angle} /> : null; })}
        <Stick {...lArgs} />
        <Stick {...rArgs} />
        {phoneOn > 0 && <g opacity={phoneOn}><Phone at={lJ.armF.end} h={FH} facing={1} angle={-70 + wiggle(f, 2, 1, 4)} /></g>}
        {f >= 534 && f < B.results + 4 && [0, 1, 2].map((i) => <Sweat key={i} at={lJ.head} r={lJ.L.head} k={((f - 534 + i * 9) % 26) / 26} side={i === 1 ? -1 : 1} />)}
      </svg>

      {L_CHATS.map((c, i) => <ChatScreen key={'l' + i} x={40} y={506} w={460} start={c.start} hideFrom={c.hide} msgs={c.msgs} />)}
      {R_CHATS.map((c, i) => <ChatScreen key={'r' + i} x={580} y={506} w={460} start={c.start} hideFrom={c.hide} msgs={c.msgs} />)}
      <PaperMock x={40} y={520} w={460} start={B.papers} hideFrom={B.end} timer={{f0: 520, f1: 604, from: 60}} rows={[{f: 540, m: 'q'}, {f: 562, m: 'cross'}, {f: 584, m: 'q'}, {f: 0, m: 'blank'}]} />
      <PaperMock x={580} y={520} w={460} start={B.papers + 2} hideFrom={B.end} timer={{f0: 520, f1: 604, from: 60}} rows={[{f: 528, m: 'tick'}, {f: 548, m: 'tick'}, {f: 568, m: 'tick'}, {f: 588, m: 'tick'}]} />

      <Label text="ASKS FOR ANSWERS" x={30} y={462} w={480} start={20} color={THEME.ink} size={44} />
      <Label text="ASKS TO BE QUIZZED" x={570} y={462} w={480} start={24} color={THEME.ink} size={44} />
      <Label text="HOMEWORK GRADE" x={0} y={526} w={1080} start={B.jump1 + 4} until={B.jump2} color={THEME.ink} size={46} />
      <Stamp text="A" x={270} y={720} f0={206} f1={B.jump2} size={170} />
      <Stamp text="B+" x={810} y={720} f0={214} f1={B.jump2} size={170} rot={7} />
      <Stamp text="F" x={270} y={700} f0={B.results} f1={B.end} size={170} />
      <Stamp text="A" x={810} y={700} f0={B.results + 14} f1={B.end} size={170} rot={7} color={THEME.accent} />

      <Counter label="STUDY TIME" keys={[{f: 0, v: 0}, {f: 80, v: 2, dur: 12}]} format={(v) => `${Math.round(v)} min`} x={30} y={1296} w={205} start={22} />
      <Tag label="HOMEWORK" keys={[{f: 0, text: '–'}, {f: 206, text: 'A'}]} x={275} y={1296} w={205} start={24} />
      <Counter label="STUDY TIME" keys={[{f: 0, v: 0}, {f: 92, v: 45, dur: 98}, {f: 330, v: 38, dur: 16}, {f: 392, v: 25, dur: 16}]} format={(v) => `${Math.round(v)} min`} x={565} y={1296} w={190} start={26} />
      <Tag label="HOMEWORK" keys={[{f: 0, text: '–'}, {f: 214, text: 'B+'}, {f: 372, text: 'A-'}, {f: 410, text: 'A'}]} x={775} y={1296} w={180} start={28} />

      <BigCard text="EXAM DAY" sub="*NO PHONES. NO AI." f0={B.exam} f1={B.exam + 70} />
      <EndLines dimFrom={B.end} until={B.ask} lines={[
        {text: 'AI can do your homework.', f: B.end + 6},
        {text: "In the exam, it's just you.", f: 740, accent: ['you']},
        {text: '*Real study (PNAS 2025): practising with plain GPT-4 meant 17% lower exam scores.', f: 790, fine: true},
        {text: 'A hint-only AI tutor: no drop.', f: 830, fine: true},
      ]} />
      <EndLines dimFrom={B.ask - 8} y={760} lines={[{text: 'Answers or quiz?', f: B.ask + 2, size: 120, accent: ['quiz']}, {text: 'Be honest.', f: B.ask + 10, size: 96}]} />
      <DayChip keys={[{f: 0, v: 90}, {f: B.jump1, v: 60, dur: 14}, {f: B.jump2, v: 30, dur: 14}, {f: B.exam + 2, v: 0, dur: 10}]} format={(v) => (v > 0 ? `EXAM IN ${v} DAYS` : 'EXAM TODAY')} y={392} start={26} />
      <Header lines={['TWO STUDENTS.', 'SAME AI.']} accentWords={['AI']} top={110} max={128} start={-6} />
    </AbsoluteFill>
  );
};
