// Begeleider-laag. ALLE coachantwoorden lopen via `askCoach`.
//
// Nu: een lokale, regelgebaseerde simulatie (geen AI, geen netwerk).
// Later: vervang alleen de body van `askCoach` door een aanroep naar je EIGEN backend
// (bijv. POST /api/coach of /api/analyze-video) die een model gebruikt.
//
// Contract:
//   askCoach({ kind, step, question?, history? }) -> Promise<{ text, followUp?, simulated }>
//   kind: 'question' | 'explain' | 'hint' | 'welcome'

export const COACH_MODE = 'prototype';

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

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function askCoach({ kind, step, question = '', history = [] }) {
  await delay(kind === 'welcome' ? 0 : 350);

  if (kind === 'welcome') {
    return {
      simulated: true,
      text: `We werken aan “${step.title}”. Upload eerst een bestaande kraanvogelvideo, vergelijk daarna de vouw met de referentie en laat de AI je focussen op één duidelijk probleem.`,
    };
  }
  if (kind === 'explain') {
    return { simulated: true, text: step.easier, followUp: 'Is dit duidelijker, of wil ik nog een andere vouwstap anders uitleggen?' };
  }
  if (kind === 'hint') {
    const used = history.filter((m) => m.from === 'coach' && m.kind === 'hint').length;
    const text = step.hints[used % step.hints.length];
    return { simulated: true, text };
  }

  const q = question.toLowerCase();
  const hit = KEYWORDS.find((k) => k.words.some((w) => q.includes(w)));
  if (hit) return { simulated: true, text: hit.text, followUp: hit.followUp };
  const idx = history.filter((m) => m.from === 'coach').length % FALLBACKS.length;
  return { simulated: true, text: FALLBACKS[idx] };
}
