# Stickman kit reference

Import everything from `'../stickkit'` (inside `src/shorts/`). All positions are px in the 1080×1920 frame; all times are frames (30 = 1 s).

## Look
`THEME` = `{bg, bg2, ink, dim, faint, accent, dark}`: dark ground, light figures, **one** accent (yellow) for what matters (AI, key numbers, the winner). Change these seven values in `src/stickkit/theme.ts` to re-skin every Short.

## Figures
```tsx
const w = walkAlong(f, 0, 40, -40, 300);                 // walk from x -40 to 300 during frames 0-40 -> {x, dist, gait, facing}
const pose = poseAt(f, [
  {f: 0, pose: POSE.stand},
  {f: 60, pose: POSE.point, dur: 14, how: 'anticipate'},  // how: 'ease' (default) | 'anticipate' | 'spring' | 'snap'
  {f: 120, pose: {...POSE.cheer, lift: 40}, dur: 7},     // any field can be changed: a jump is lift
]);
<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
  <Stick x={w.x} groundY={1270} h={520} facing={1} dist={w.dist} gait={w.gait} pose={pose} frame={f} seed={1}
         seatH={130} look={{cap: true}} />                // look: {cap, glasses, ink, far, face, accent}
</svg>
```
- `facing` 1 = looks right, -1 = looks left. `seed` makes each figure blink and sway differently. `run={0..1}` turns the walk into a run.
- Types you can import: `SPose` (a pose), `PoseKey` (one key of a `poseAt` track), `NumKey` and `numAt(f, keys)` (any value that changes over time).
- Seated poses need `seatH` (seat height, default 0.25 × h) and a `<Chair>` at the same x. `seatH` ≈ 0.05 × h sits on the floor. It belongs to the figure, so change it by frame to go from chair to floor.
- `solveStick(sameArgs)` returns the joints (`head`, `armF.end` = front hand, `footF`, `hip`…) to attach props: `<Phone at={j.armF.end} …/>`.

**Poses** (`POSE.*`), standing: `stand`, `point`, `pointUp`, `present`, `think`, `hips`, `shrug`, `cheer`, `stress`, `shocked`, `shield` (hands up, ducking), `slumpStand`.
Seated: `sitIdle`, `type`, `typeFast`, `leanBack`, `feetUp` (feet on the desk), `phone`, `sitThink`, `write`, `sitStress`, `sitShocked`, `slump`, `sitCheer`.
A pose is just numbers, so make your own:
`{handF: {x, y}, handB: {x, y}, lean, nod, crouch, sit, feetUp, lookX, lookY, mood, talk, shrug, typing, writing, lift}`.
- Hands are given relative to the shoulder in arm lengths (x forward, y down).
- `mood` is one of `neutral`, `happy`, `worried`, `shocked`, `thinking`, `sad`, `smug`, `determined`.

## Props (SVG, inside the same `<svg>`)
| Prop | Use |
|---|---|
| `<Desk x0 x1 groundY h />` | Its top is at `deskTop(groundY, h)` |
| `<Chair x groundY h facing seatH />` | |
| `<Laptop x deskY h facing open on />` | |
| `<Phone at h facing angle />` | |
| `<Book x y w t angle />` | |
| `<Sheet x y w angle lines />` | |
| `<Clock x y r t />` | `t` = minutes |
| `<Sweat at r k side />` | |

## Text and screens (HTML, after the `<svg>`; later = on top)
| Piece | Use |
|---|---|
| `<Header lines={['TWO STUDENTS.', 'SAME AI.']} accentWords={['AI']} top={110} max={128} />` | Put it last so it is on top |
| `<Label text x y w start color size />` | |
| `<Counter label keys={[{f: 0, v: 0}, {f: 90, v: 45, dur: 120}]} format={(v) => `${Math.round(v)} min`} x y w />` | Also `until` (fade out), `labelSize`, `size`, `highlight`. `dur: 0` = jump |
| `<Tag label="GRADE" keys={[{f: 0, text: '–'}, {f: 200, text: 'A'}]} x y w />` | A word that changes (a grade, a status) |
| `<Meter label keys x y w />` | 0–100 bar |
| `<DayChip keys={[{f: 0, v: 1}, {f: 270, v: 30, dur: 16}]} y={392} />` | |
| `<BigCard text="DAY 30" sub="optional" f0={266} f1={296} />` | Dims the scene and jumps time |
| `<Stamp text="A" x y f0 f1 size color rot />` | A grade or verdict that slams down |
| `<ChatScreen x y w start hideFrom msgs={[{who: 'you', text, f}, {who: 'ai', text, f}]} off={{f, text: 'NO AI'}} keep={2} />` | A generic chat mock-up; types, then "thinks", then streams. A person instead of AI: `{who: 'them', name: 'M', text, f}` |
| `<PaperMock x y w start rows={[{f, m: 'tick'}, {f, m: 'cross'}, {f, m: 'q'}]} timer={{f0, f1, from: 60}} />` | A test paper whose marks appear |
| `<Card x y w start title="THIS WEEK">…anything…</Card>` | The frame of every mock-up, for your own screens (calendar, tracker, app) |
| `<EndLines dimFrom until lines={[{text, f, accent: ['word'], size}, {text: '*a footnote', f, fine: true}]} />` | The closing lines, in the band y 520, x 130–950 (clear of faces and YouTube's buttons). Use two: one block, then the question alone |

## Physics
```tsx
const SIM = simulate({frames: TOTAL, pxPerMeter: 250, floorY: 1270, bodies: [
  {id: 'desk', shape: 'box', x: 400, y: 1089, w: 200, h: 14, isStatic: true},
  {id: 'book', shape: 'box', x: 440, y: 1070, w: 80, h: 22, vx: 330, vy: -120, spin: 3, at: 470},  // appears at frame 470 with a push
]});
const b = SIM.book[f];  // {x, y, angle, alive}; draw it only when b.alive
firstImpact(SIM, 'book')  // frame it lands: put a 'thud' cue there
```

## Sound
- `<Bed src="stickkit/bed-steady.mp3" frames={TOTAL} volume={0.5} />`: a music bed (never loops). Beds: `bed-steady.mp3` (calm, building), `bed-tense.mp3` (tension, then a lift), `two-students-bed.mp3` (the example's). New ones: `python tools/make_sfx.py bed <out.wav> <seconds> '<sections json>'`.
- `<Cues cues={[{at: 30, s: 'pop', v: 0.3}]} />`
- Sounds: `tick`, `pop`, `type`, `whoosh`, `thud`, `stamp`, `paper`, `step`, `chair`, `bell`, `ding`, `buzz`, `rise`, `swish`, `clock`.
