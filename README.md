# applied research agentic interface

Research prototype about **origami folding** (a paper crane). An existing instruction video is supported by an agentic interface, to investigate whether that leads to a better folding result than a normal video without extra guidance.

The user sets the pace and confirms when a step is done. The coach explains, gives hints and makes suggestions; it never carries anything out and never changes progress by itself.

## Getting started

Requires Node 18 or newer. There are no dependencies and no build step.

```bash
npm start        # http://localhost:5173  (other port: PORT=8080 npm start)
npm test         # tests: logic, AI layer, server and step-by-step plans
```

Double-clicking `index.html` does not work (browsers block JavaScript modules on `file://`). Use `npm start`.

## What the interface does

- **Dashboard, project and learning path** with 7 steps, progress and a reflection per step.
- **Animated 3D step plan**: most steps show the paper folding in 3D, built for exactly these steps. Play, pause, replay, scrub, *Slow* (0.4x); drag (or use the arrow keys) to rotate, *Reset view* or double-click to return. The drawings stay as a fallback (no WebGL, reduced motion) and for steps that are not animated (narrow, squash, sink).
- **Step-by-step plan with drawings** for every project step. It works without a video.
- **Techniques**: click a technique for a step-by-step plan with drawings (what you need, step by step, common mistakes, sources).
- **Video**: upload an existing video; every step jumps straight to its fixed segment, played at 2x speed. Fixed layout: 0:00–1:01, 1:01–2:40, 2:40–5:40, 5:40–8:00, 8:00–10:30, 10:30–12:40, 12:40–end.
- **Video analysis** (extra): the AI suggests segments; you decide what to adopt.
- **Coach** per step: *Explain differently*, *Give me a hint* and your own question.
- Progress, conversations and the video are kept in your browser. *Reset demo* erases everything.

## Connecting an AI

The browser never talks to Claude directly and contains no key. The server (`server.mjs`) calls the Claude API.

1. Create an API key at console.anthropic.com.
2. Copy `.env.example` to `.env` and fill in: `ANTHROPIC_API_KEY=...`
3. Restart with `npm start`. The terminal then says `AI connected`.

`.env` is in `.gitignore` and never ends up on GitHub. The model can be set with `ANTHROPIC_MODEL`.

Without a key everything keeps working: the coach gives marked sample answers and the video analysis offers a clearly marked simulated sample analysis.

## Putting it online

- **GitHub Pages** can only show the static page. No server runs there, so uploading, playing and the sample analysis work, but not the real AI.
- For a real AI online, `server.mjs` has to run somewhere. Then set `API_BASE` in `js/config.js` to that server and `ALLOWED_ORIGIN` on the server to the address of your page.
- Never put an API key in `js/`, `index.html` or the repository.

## Structure

```
index.html          shell and dialog
css/styles.css      design, responsive
js/data.js          project, steps (with video segments) and techniques
js/diagrams.js      drawing library for fold diagrams (SVG)
js/origami/engine.js   folding engine: split faces, hinge chains, layer ordering
js/origami/crane.js    the crane steps as fold operations
js/origami/fan.js      rigid collapse of the creased square into the base shape
js/origami/finished.js the finished crane as a small hand-built model (goal picture)
js/origami/clips.js    clips per step (segments, camera) used by the guides
js/origami/gl.js       small WebGL renderer (two-sided paper, crease lines)
js/origami/player.js   player: controls, orbit, fallback
js/guides.js        step-by-step plans with drawings per technique and project step
js/store.js         state, localStorage, pure logic
js/coach.js         coach: Claude via the server, otherwise sample answers
js/api.js           contact with the server
js/video.js         storing the video, taking frames, sample analysis
js/config.js        address of the AI server
js/app.js           routing and screens
server.mjs          static server + /api/status, /api/coach, /api/analyze-video
server/ai.mjs       Claude API calls and validation (server only)
tests/              node:test
```

## What is real and what is simulated

| Part | Status |
| --- | --- |
| Navigation, progress, reflection, storage, techniques | Really works, locally |
| Step-by-step plans with drawings | Drawn in code; the later steps (neck, head, wings) are schematic |
| Animated 3D folding | Real rigid folding for the creases, the collapse into the base shape (solved numerically, with one short stretch where it hops between two rigid paths), kite, petal, bird base, narrowing the legs, the reverse folds (neck on the right, tail on the left) and the head; the wings are a rigid approximation; the finished crane is a hand-built model, not a folded one |
| Uploading, storing and playing video, jumping to the fixed segment | Really works, locally |
| Coach and video analysis with Claude | Works once the server has a valid `ANTHROPIC_API_KEY`; tested with a mock Claude, not yet with a real key |
| Image analysis of your own folded model | Not built yet |
| Project memory and personal learning advice | Not built yet |
