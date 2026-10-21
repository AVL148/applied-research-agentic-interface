// Begeleider-laag. ALLE coachantwoorden lopen via `askCoach`.
//
// Nu: een lokale, regelgebaseerde simulatie (geen AI, geen netwerk).
// Later: vervang alleen de body van `askCoach` door een aanroep naar je EIGEN backend
// (bijv. POST /api/coach) die de Claude API gebruikt. Zet nooit een API-sleutel in
// frontendcode: de sleutel hoort op de server.
//
// Contract:
//   askCoach({ kind, step, question?, history? }) -> Promise<{ text, followUp?, simulated }>
//   kind: 'question' | 'explain' | 'hint' | 'welcome'

export const COACH_MODE = 'prototype'; // 'prototype' | 'claude' (toekomstig)

const KEYWORDS = [
  {
    words: ['strak', 'naar binnen', 'taille', 'smaller', 'trekt', 'inkeping'],
    text: 'Dat klinkt als te veel spanning op de inslag. Leg de draad voortaan in een zachte boog en trek hem pas aan als hij tegen de rand ligt.',
    followUp: 'Trok de rand naar binnen toen je de draad aanspande?',
  },
  {
    words: ['slap', 'los', 'rommelig', 'hangt'],
    text: 'Slappe draden komen vaak door te weinig spanning bij het opspannen. Tik met je vinger op de draden: klinken ze ongeveer gelijk? Trek de losse nog een beetje aan.',
    followUp: 'Gaat het om één draad of om meerdere?',
  },
  {
    words: ['kleur', 'patroon', 'streep'],
    text: 'Begin een nieuwe kleur aan dezelfde kant van het werk en laat het oude uiteinde aan de achterkant hangen. Voor strepen werkt vier tot zes rijen per kleur goed.',
    followUp: 'Welke kleuren wil je combineren?',
  },
  {
    words: ['knippen', 'schaar', 'afknippen', 'lengte'],
    text: 'Knip pas als je zeker bent dat het weefsel hoog genoeg is: terugdraaien kan niet. Een goede vuistregel voor de schering is vier keer de hoogte van je raam.',
    followUp: 'Heb je al gemeten hoe hoog het raam is?',
  },
  {
    words: ['tijd', 'lang', 'duurt', 'snel'],
    text: 'Neem er de tijd voor. Als beginner duurt elke stap vaak langer dan de schatting. Je kunt altijd pauzeren en later verder gaan.',
  },
];

const FALLBACKS = [
  'Dat kan ik zo niet goed beoordelen: ik zie je werkstuk niet. Kun je beschrijven wat je ziet of voelt? Dan denk ik graag met je mee.',
  'Ik wil je daar liever niet iets onzekers over vertellen. Vertel wat je precies probeerde en wat er gebeurde.',
];

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function askCoach({ kind, step, question = '', history = [] }) {
  await delay(kind === 'welcome' ? 0 : 350); // voelt als antwoorden, maar blijft snel

  if (kind === 'welcome') {
    return {
      simulated: true,
      text: `We werken aan “${step.title}”. Neem de tijd: je bepaalt zelf het tempo. Bekijk de demonstratie, probeer het uit en vraag me wat je wilt.`,
    };
  }
  if (kind === 'explain') {
    return { simulated: true, text: step.easier, followUp: 'Is dit duidelijker, of zal ik een onderdeel nog anders uitleggen?' };
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
