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
    words: ['vallei', 'dal', 'naar binnen', 'scherp', 'vleugel', 'druk'],
    text: 'Deze valley fold voelt nog wat te hard of te ruw aan. Laat de binnenkant juist zacht tegen elkaar leggen en controleer de vouw nogmaals aan de hand van de kraanvogelvideo.',
    followUp: 'Was de vouw te strak of te los?',
  },
  {
    words: ['berg', 'omhoog', 'buiten', 'contour', 'snavel', 'staart'],
    text: 'Bij een mountain fold helpt het om de contour eerst heel licht te markeren. Dan blijft de vorm scherp zonder dat het papier scheurt.',
    followUp: 'Wil je de bergvouw nog in een kleine stap voor de kraanvogel zien?',
  },
  {
    words: ['symmetrie', 'links', 'rechts', 'scheef', 'midden', 'even'],
    text: 'Controleer beide vleugels tegelijk. Kleine asymmetrie aan één kant blijft vaak zichtbaar in het hele model.',
    followUp: 'Zit het probleem vooral links of rechts?',
  },
  {
    words: ['hoek', 'punt', 'rand', 'vleugel', 'snavel', 'staart'],
    text: 'Je zit dicht bij de juiste vorm. Maak de buitenste contour nog iets scherper en vergelijk dat daarna weer met de referentievideo.',
    followUp: 'Welke hoek of rand valt het meest op?',
  },
  {
    words: ['papier', 'scheur', 'krimp', 'kreukel', 'vouw'],
    text: 'Neem even een rustmoment en bekijk de vouw van dichtbij. Een nette kraanvogel ontstaat vaak door kleine, gecontroleerde vouwen in plaats van een harde druk.',
  },
];

const FALLBACKS = [
  'Ik zie nog niet precies wat je aan de vouw wilt verbeteren. Laat me weten waar de kraanvogel in de video anders is dan op jouw papier.',
  'Dat kan ik niet alleen uit de omschrijving bepalen. Vergelijk één duidelijke plek met de video en dan kunnen we focussen op de afwijking.',
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function localReply({ kind, step, question = '', history = [] }) {
  if (kind === 'welcome') {
    return { simulated: true, text: `We werken aan “${step.title}”. Je bepaalt zelf het tempo. Upload eerst een bestaande kraanvogelvideo, vergelijk daarna de vouw met de referentie en vraag me wat je wilt.` };
  }
  if (kind === 'explain') {
    return { simulated: true, text: step.easier, followUp: 'Is dit duidelijker, of zal ik een onderdeel nog anders uitleggen?' };
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
      return { ...localReply(args), notice: `De AI is nu niet bereikbaar (${e.message}). Dit is een voorbeeldantwoord.` };
    }
  }
  await delay(350);
  return localReply(args);
}
