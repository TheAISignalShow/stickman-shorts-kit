---
name: stickman-shorts
description: Make silent, text-led 2D stickman Shorts (1080x1920) in code with this project's Remotion kit. Use for stickman animations or 'two people, same X, different choice' Shorts.
---

# Stickman Shorts

You write **one React file per Short** with the kit in `src/stickkit/`. The kit already does the hard parts: knees and elbows are solved (IK), walks keep their feet planted, falls are real physics, text is measured to fit, and sounds are included. Your job is a strong idea and exact timing. API details: [reference.md](reference.md). A complete example: `src/stickkit/shorts/TwoStudents.tsx`.

## 1. The idea first (no code yet)
The silent stickman Shorts that spread share one shape. Use it, but tell an **original** story: never recreate another creator's Short, characters, wording or music.

| Part | Rule |
|---|---|
| Header | The idea in 2 short lines (≤ 4 words each), on screen from frame 0 and kept to the end. One accent word. |
| Two sides | Same situation, different choice, each with a label ("ASKS FOR ANSWERS" / "ASKS TO BE QUIZZED"). |
| Progress | Something counts (a counter or meter) and time jumps (DAY 1 → DAY 30 → DAY 90). |
| Turn | A test or twist that reveals who was right (the exam, the race, the bill). |
| Close | One plain line that lands the lesson, then a short question that invites comments. Write a question that belongs to THIS story ("Answers or quiz?"), not the stock "Which one are you?" every Short in this format uses. |
| Length | 30–50 s. |

Invented numbers are fine in a story, but never present them as real statistics or name real people, brands or logos.

Write a **beat table** first (time · left · right · text on screen · counters · sound). If the user is present, show it and wait for their OK.

## 2. Build
1. Copy `src/shorts/MyShort.tsx` to `src/shorts/<Name>.tsx` (rename the component and its `*_FRAMES` constant) and add one line for it in `src/registry.ts` (`frames` = seconds × 30). That registers it for rendering and for the check.
2. Build from kit pieces only (reference.md). Anything else: simple SVG line art in `THEME` colours, line width about 2% of the figure height.
3. Layout for 1080×1920 (keep it unless the story needs otherwise):

| Band (y px) | What |
|---|---|
| 110–380 | `Header` |
| ~392 | `DayChip` |
| ~462 | `Label` for each side (x 30 / 570, width 480) |
| 520–860 | `ChatScreen`s, `Stamp`s, clocks: what each side is looking at |
| 880–1270 | The scene; floor line at y 1270. Seated figures up to h 560; standing figures h ≤ 440 when screens sit in 520–860 (the head must stay below 860) |
| 1296–1510 | `Counter` and `Meter` |
| below 1510, and x > 960 below y 900 | **No words or numbers**: YouTube's caption and buttons cover them. This band is floor, not "empty frame": it does not count against the quarter-of-the-frame rule |

4. Timing rules (frames at 30 fps):
   - Something visible changes at least every **1.5 s** (a pose, a counter, a message, a card).
   - Text stays readable for 0.3 s per word + 0.7 s (never under 1.5 s); the last line stays at least 2 s. That includes `BigCard`s: a 3-word card needs about 1.6 s, a card with a sub-line 2.2 s or more.
   - Each character changes pose on the beat that causes it, at least every 3–4 s (`poseAt` keys).
   - Moves take 0.3–0.6 s (`dur` 9–18). Use `how: 'anticipate'` before big actions and `'spring'` for joy, `'snap'` for shocks.
   - Walking: always `walkAlong` (feet stay planted). Never slide a standing figure. Running: the same, plus `run={1}` on `<Stick>`. Running in place (a long race): keep `x` fixed, pass `dist = speed * f` and `gait = 1`, and scroll the ground marks at the same speed.
   - Anything that falls, bounces or stacks: `simulate()` with static boxes for desks and walls, `pxPerMeter` ≈ figure height ÷ 1.7.
5. Sound: one `Bed` plus `Cues` on visible events (sound names in reference.md). Three beds ship in `public/stickkit/`; make a new one with `python tools/make_sfx.py bed …` (needs Python with numpy and scipy).
6. Screens: use `ChatScreen` for chats (with AI or with a person: `who: 'them'`), `PaperMock` for a test paper, and `Card` for anything else (a calendar, a tracker, a bank app).

## 3. Check before you render
1. `npm run typecheck`: no errors.
2. `npm run check -- <Id>` and **open `out/check/<Id>-sheet.jpg` and look at every tile**. Tiles too small to judge faces? Add `--tile=540`. Check one stretch closely with `--from=10 --to=16 --every=0.5`. Fix and re-check if you see any of:
   - overlapping or clipped text;
   - an element over a face;
   - any area bigger than a quarter of the frame with nothing in it;
   - text too small to read on a phone (under ~40 px);
   - a character in the same pose in neighbouring tiles.
3. For motion, render a small preview: `npx remotion render <Id> out/<Id>-preview.mp4 --scale=0.5`.
4. Final: `npx remotion render <Id> out/<Id>.mp4` (add `--scale=2` for a 4K master).

## 4. Report
Say what you made, its length, what the check sheet showed, what you fixed, and the exact render command.
