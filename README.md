# Stickman Shorts Kit (free, by The AI Signal)

From the YouTube channel **The AI Signal** ([@TheAISignalShow](https://www.youtube.com/@TheAISignalShow)).

Make silent, text-led 2D stickman Shorts like the one in our video: a header that says the idea, two sides, counters, day jumps, a twist and a closing line. Everything is code, so **Claude can write a new Short for you** and your computer renders it. There are no per-video credits and no watermark.

What's inside:
- `src/stickkit/`: a stick figure with real knees and elbows, walks whose feet stay planted, poses and moods, props, a chat-screen mock-up, counters, day cards and stamps.
- `src/core/`: the motion library underneath (IK, physics, easing, measured text).
- `public/stickkit/`: 15 sound effects and three music beds. We synthesised them in code (`tools/make_sfx.py`), so you can use them in your videos.
- `src/stickkit/shorts/TwoStudents.tsx`: the exact Short from our video.
- `src/shorts/MyShort.tsx`: a small starter to copy.
- `.claude/skills/stickman-shorts/`: the Claude skill that teaches Claude how to write a good Short with this kit.

## What you need (the fine print, checked 24 Nov 2026)
| Need | Free? | Notes |
|---|---|---|
| A computer: Windows x64, macOS 15+ or Linux | Yes | Rendering happens on your computer. It does not run on a phone |
| Node.js (current LTS) | Yes | nodejs.org |
| Remotion (installed by `npm install`) | Free for individuals, companies of up to 3 people and non-profits, commercial use included | Bigger companies need a Remotion company licence: remotion.dev/license |
| A headless browser | Yes | Remotion downloads it once, on your first render: about 137 MB on Windows |
| Internet | Yes | For `npm install`, and for the Inter font on each render |
| Claude | See below | Claude writes the code. You can also edit it yourself |

| How you use Claude | Plan | How |
|---|---|---|
| **Claude Code** (best: it writes the Short, runs the check, looks at the sheet and fixes it) | Pro ($20 a month, or $17 a month billed yearly) or higher, or API billing. Not on the Free plan | Open this folder in Claude Code (terminal or the desktop app's Code tab). The skill in `.claude/skills/` loads by itself. Say: *"Use the stickman-shorts skill to make…"* |
| **Claude in the browser or app** | Free works, within its usage limits (reset every 5 hours and every week) | Paste `SKILL.md` and `reference.md` into a chat and describe your Short. Save the file Claude writes as `src/shorts/<Name>.tsx` and add its line to `src/registry.ts`. You can also try uploading the `stickman-shorts` folder as a skill (Customize > Skills). Anthropic's own pages disagree on whether the Free plan allows custom skills |

Before installing any skill you didn't write, Anthropic advises reading every file in it. Please do: this one is two short Markdown files.

## Download
Click **Code → Download ZIP** above, or:
```bash
git clone https://github.com/Gunratna/stickman-shorts-kit
cd stickman-shorts-kit
```

## Start (5 minutes)
```bash
npm install
npx remotion studio                 # preview every Short in your browser
npm run check -- TwoStudents        # one contact sheet of the whole Short in out/check/
npx remotion render TwoStudents out/two-students.mp4
```
The first render downloads a small headless browser (Remotion does this once).

## Make your own
1. Ask Claude (with the skill): *"Use the stickman-shorts skill. Two friends, same goal: run 5K. One starts today, one starts Monday. 35 seconds."*
2. Claude writes `src/shorts/<Name>.tsx`, adds it to `src/registry.ts`, runs the check and fixes what it sees.
3. Render it: `npx remotion render <Name> out/<name>.mp4`. Add `--scale=2` for a 4K file.

## Honest notes
- Tell an original story. Don't recreate another creator's Short, characters or music.
- Invented numbers are fine in a story, but don't present them as real statistics.
- YouTube does not pay for mass-produced, repetitive videos. Use the kit to tell your own stories, not 100 copies of one template.

## Licences
- Our code, skill and sounds: MIT (see `LICENSE`).
- Remotion: its own licence (remotion.dev/license).
- matter-js: MIT.
- Inter font: SIL Open Font License, loaded from Google Fonts.
