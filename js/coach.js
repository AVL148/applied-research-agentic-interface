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
    words: ['scheur', 'gescheurd', 'kapot', 'knip'],
    text: 'Papier scheurt meestal als je te hard aan een vouw trekt of dezelfde vouw vaak heen en weer buigt. Neem een nieuw vel als de scheur bij een belangrijke vouw zit, en strijk vouwen voortaan één keer scherp aan.',
    followUp: 'Op welke plek scheurde het papier?',
  },
  {
    words: ['scheef', 'niet symmetrisch', 'asymmetrisch', 'ongelijk', 'verschil'],
    text: 'Scheefheid begint vaak bij de eerste vouwen. Controleer of de hoeken precies op elkaar lagen en of de vouwlijnen in het midden kruisen. Corrigeer een kleine afwijking liever meteen dan pas aan het einde.',
    followUp: 'Zie je de afwijking al in de eerste vouwen, of ontstaat die later?',
  },
  {
    words: ['plat', 'klapt niet', 'klapt terug', 'wil niet', 'niet dicht'],
    text: 'Als het papier niet plat wil, liggen een of meer hulpvouwen waarschijnlijk niet scherp genoeg of staan ze de verkeerde kant op. Open het werk en strijk de vouwlijnen opnieuw aan, van het midden naar buiten.',
    followUp: 'Welke vouw wilde niet meewerken?',
  },
  {
    words: ['vouwlijn', 'scherp', 'knik', 'aanstrijken'],
    text: 'Strijk een vouw met je nagel of een vouwbeen aan, van het midden naar de rand. Een scherpe vouwlijn maakt latere stappen veel eenvoudiger.',
  },
  {
    words: ['dal', 'berg', 'welke kant', 'richting'],
    text: 'Een dalvouw vouw je naar je toe (een V), een bergvouw van je af (een omgekeerde V). Kijk in de demonstratie naar welke kant het papier beweegt.',
    followUp: 'Gaat het om een vouw uit de huidige stap?',
  },
  {
    words: ['papier', 'welk', 'dik', 'dun', 'maat'],
    text: 'Voor een kraanvogel werkt dun, vierkant origamipapier van 15 × 15 cm het best. Dik papier is lastig bij de omvouwen aan het einde.',
  },
  {
    words: ['tijd', 'lang', 'duurt', 'snel'],
    text: 'Neem er de tijd voor. Als beginner duurt elke stap vaak langer dan de schatting. Je kunt altijd pauzeren en later verder gaan.',
  },
];

const FALLBACKS = [
  'Dat kan ik zo niet goed beoordelen: ik zie je papier niet. Kun je beschrijven wat je ziet of voelt? Dan denk ik graag met je mee.',
  'Ik wil je daar liever niets onzekers over vertellen. Vertel wat je precies probeerde en wat er gebeurde.',
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function localReply({ kind, step, question = '', history = [] }) {
  if (kind === 'welcome') {
    return { simulated: true, text: `We werken aan “${step.title}”. Neem de tijd: je bepaalt zelf het tempo. Bekijk de demonstratie, probeer het uit en vraag me wat je wilt.` };
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
