// Begeleider-laag. ALLE coachantwoorden lopen via `askCoach`.
//
// Is de AI-backend verbonden (zie server.mjs, ANTHROPIC_API_KEY): dan vraagt dit de server,
// die Claude aanroept. Anders, of bij een fout: lokale regelgebaseerde voorbeeldantwoorden.
// De browser heeft nooit een API-sleutel.
//
// Contract:
//   askCoach({ kind, step, question?, history?, segment? }) -> Promise<{ text, followUp?, simulated, notice? }>
//   kind: 'question' | 'explain' | 'hint' | 'welcome'

import { getAiStatus, postJson } from './api.js';

const KEYWORDS = [
  {
    words: ['valley', 'sharp', 'pressure', 'press', 'inside', 'rough'],
    text: 'This valley fold sounds a bit too hard or rough. Let the inside edges meet gently and check the fold again against the crane video.',
    followUp: 'Was the fold too tight or too loose?',
  },
  {
    words: ['mountain', 'ridge', 'outline', 'contour', 'beak', 'tail'],
    text: 'With a mountain fold it helps to mark the outline very lightly first. That keeps the shape sharp without tearing the paper.',
    followUp: 'Would you like to see the mountain fold as a small step for the crane?',
  },
  {
    words: ['symmetry', 'left', 'right', 'crooked', 'centre', 'center', 'uneven'],
    text: 'Check both wings at the same time. A small asymmetry on one side often stays visible in the whole model.',
    followUp: 'Is the problem mostly on the left or the right?',
  },
  {
    words: ['angle', 'corner', 'point', 'edge', 'wing', 'beak'],
    text: 'You are close to the right shape. Sharpen the outer outline a little more and then compare it with the reference video again.',
    followUp: 'Which angle or edge stands out most?',
  },
  {
    words: ['paper', 'tear', 'torn', 'crumple', 'wrinkle', 'fold'],
    text: 'Take a short rest and look at the fold up close. A neat crane usually comes from small, controlled folds rather than hard pressure.',
  },
];

const FALLBACKS = [
  'I cannot see exactly what you want to improve about the fold. Tell me where the crane in the video differs from your paper.',
  'I cannot tell from the description alone. Compare one clear spot with the video and then we can focus on the difference.',
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function localReply({ kind, step, question = '', history = [] }) {
  if (kind === 'welcome') {
    return { simulated: true, text: `We are working on “${step.title}”. You set the pace. Follow the step-by-step plan, compare your fold with the reference and ask me whatever you like.` };
  }
  if (kind === 'explain') {
    return { simulated: true, text: step.easier, followUp: 'Is this clearer, or shall I explain a part differently?' };
  }
  if (kind === 'hint') {
    const used = history.filter((m) => m.from === 'coach' && m.kind === 'hint').length;
    return { simulated: true, text: step.hints[used % step.hints.length] };
  }
  const q = question.toLowerCase();
  const hit = KEYWORDS.find((k) => k.words.some((w) => q.includes(w)));
  if (hit) return { simulated: true, text: hit.text, followUp: hit.followUp };
  const idx = history.filter((m) => m.from === 'coach').length % FALLBACKS.length;
  return { simulated: true, text: FALLBACKS[idx] };
}

export async function askCoach(args) {
  const { kind, step, question = '', history = [], segment = null } = args;
  if (kind === 'welcome') return localReply(args);

  const status = await getAiStatus();
  if (status.connected) {
    try {
      const out = await postJson('/api/coach', {
        kind,
        question,
        history: history.slice(-8).map((m) => ({ from: m.from, text: m.text })),
        step: { id: step.id, title: step.title, instructions: step.instructions, tip: step.tip },
        segment: segment ? { title: segment.title, description: segment.description } : null,
      }, 60_000);
      return { simulated: false, text: out.text, followUp: out.followUp };
    } catch (e) {
      await delay(100);
      return { ...localReply(args), notice: `The AI cannot be reached right now (${e.message}). This is a sample answer.` };
    }
  }
  await delay(350);
  return localReply(args);
}
