// Begeleider-laag. ALLE coachantwoorden lopen via `askCoach`.
//
// Nu: een lokale, regelgebaseerde simulatie (geen AI, geen netwerk).
// Later: vervang alleen de body van `askCoach` door een aanroep naar je EIGEN backend
// (bijv. POST /api/coach) die een AI-model gebruikt. Zet nooit een API-sleutel in
// frontendcode: de sleutel hoort op de server.
//
// Contract:
//   askCoach({ kind, step, question?, history? }) -> Promise<{ text, followUp?, simulated }>
//   kind: 'question' | 'explain' | 'hint' | 'welcome'

export const COACH_MODE = 'prototype'; // 'prototype' | 'claude' (toekomstig)

const KEYWORDS = [
  {
    words: ['vallei', 'dal', 'naar binnen', 'tension', 'druk', 'kromming', 'scherp'],
    text: 'Deze vouw voelt nog wat te hard of te onrustig aan. Laat de binnenkant zacht tegen elkaar leggen en toets de scherpe vallei opnieuw langs de referentievideo.',
    followUp: 'Was de vouw te strak of te los?',
  },
  {
    words: ['berg', 'omhoog', 'buiten', 'kubus', 'punt', 'breed'],
    text: 'Bij een bergvouw helpt het om de lijn eerst heel licht te markeren. Daardoor blijft de buitenste contour scherp zonder te scheuren.',
    followUp: 'Wil je de bergvouw nog eens in een kleinere stap zien?',
  },
  {
    words: ['symmetrie', 'links', 'rechts', 'scheef', 'midden', 'even'],
    text: 'Controleer beide zijden tegelijk. Een kleine asymmetrie aan één kant blijft vaak zichtbaar in de gehele vorm.',
    followUp: 'Zit het probleem vooral links of rechts?',
  },
  {
    words: ['hoek', 'punt', 'rand', 'contour', 'afgerond', 'scherp'],
    text: 'Jij bent dicht bij het juiste model. Maak de buitenste hoek nog wat strakker door de contour kort aan te zetten en daarna opnieuw te controleren.',
    followUp: 'Welke hoek of rand valt het meest op?',
  },
  {
    words: ['papier', 'scheur', 'krimp', 'kreukel', 'vouw'],
    text: 'Neem een rustmoment en bekijk de vouw van dichtbij. Grotere kwaliteit ontstaat vaak door een kleine, gecontroleerde vouw in plaats van een harde druk.',
  },
];

const FALLBACKS = [
  'Ik zie nog niet precies wat je aan de vouw wilt verbeteren. Laat me weten wat je model in de video doet en waar het op jouw papier anders is.',
  'Dat kan ik niet alleen uit de beschrijving bepalen. Vergelijk één duidelijke plek met de video en dan kunnen we focussen op het probleem.',
];

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function askCoach({ kind, step, question = '', history = [] }) {
  await delay(kind === 'welcome' ? 0 : 350); // voelt als antwoorden, maar blijft snel

  if (kind === 'welcome') {
    return {
      simulated: true,
      text: `We werken aan “${step.title}”. Upload eerst een video, vergelijk daarna de vouw met de referentie en laat de AI je op één focuspunt sturen.`,
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
