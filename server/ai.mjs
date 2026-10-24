// AI-laag: roept de Claude API aan. Draait ALLEEN op de server; de API-sleutel verlaat deze map nooit.
// Het model kan met ANTHROPIC_MODEL worden overschreven.

export const DEFAULT_MODEL = 'claude-sonnet-5-5';
export const MAX_FRAMES = 16;
export const MAX_FRAME_CHARS = 600_000; // ± 450 kB per beeld (base64)

export class AiError extends Error {
  constructor(code, message, status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function aiConfig(env = process.env) {
  return {
    key: (env.ANTHROPIC_API_KEY || '').trim(),
    model: (env.ANTHROPIC_MODEL || DEFAULT_MODEL).trim(),
    base: (env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, ''),
  };
}

export async function callClaude(cfg, { system, content, maxTokens = 1500, fetchImpl = fetch, timeoutMs = 90_000 }) {
  if (!cfg.key) throw new AiError('no_key', 'Er is geen ANTHROPIC_API_KEY ingesteld op de server.', 503);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(`${cfg.base}/v1/messages`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': cfg.key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content }],
      }),
    });
  } catch (e) {
    throw new AiError('upstream_unreachable', e?.name === 'AbortError' ? 'De AI deed er te lang over.' : 'De AI is niet bereikbaar.', 504);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    // Geen details van de upstream doorgeven: die kunnen gevoelig zijn.
    const code = res.status === 401 || res.status === 403 ? 'bad_key' : res.status === 429 ? 'rate_limited' : 'upstream_error';
    const msg = code === 'bad_key' ? 'De API-sleutel is ongeldig of heeft geen toegang.' : code === 'rate_limited' ? 'De AI is tijdelijk overbelast. Probeer het zo opnieuw.' : 'De AI gaf een fout terug.';
    throw new AiError(code, msg, 502);
  }
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  if (!text) throw new AiError('empty', 'De AI gaf een leeg antwoord.', 502);
  return text;
}

export function parseJsonLoose(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

const clip = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ---------- Coach ---------- */

export const COACH_SYSTEM = `Je bent de begeleider in een leeromgeving voor origami. Je helpt een beginner een papieren kraanvogel te vouwen.
Regels:
- Antwoord in begrijpelijk Nederlands, kort en concreet (maximaal 4 zinnen).
- Je ziet het papier van de gebruiker NIET. Beoordeel nooit een werkstuk dat je niet hebt gezien; stel liever één verduidelijkende vraag.
- Zeg eerlijk wanneer informatie ontbreekt of je het niet zeker weet. Verzin geen vouwstappen buiten de gegeven stap.
- Je voert geen stappen uit en je meldt nooit dat een stap klaar is. De gebruiker bepaalt zelf het tempo en wanneer iets af is.
- Als er een videofragment-beschrijving is meegegeven, mag je daarnaar verwijzen, maar die komt uit een automatische analyse van losse beelden en kan fout zijn.
Geef je antwoord UITSLUITEND als JSON: {"text": "...", "followUp": "optionele vervolgvraag of leeg"}`;

export function buildCoachContent({ kind, question, history, step, segment }) {
  const lines = [];
  lines.push(`Huidige stap ${step.id}: ${clip(step.title, 120)}`);
  if (Array.isArray(step.instructions)) lines.push('Instructies:\n' + step.instructions.slice(0, 8).map((t, i) => `${i + 1}. ${clip(t, 200)}`).join('\n'));
  if (step.tip) lines.push(`Aandachtspunt: ${clip(step.tip, 200)}`);
  if (segment) lines.push(`Videofragment bij deze stap (automatisch geanalyseerd, onzeker): ${clip(segment.title, 100)}. ${clip(segment.description, 300)}`);
  const past = (history || []).slice(-8).map((m) => `${m.from === 'you' ? 'Gebruiker' : 'Begeleider'}: ${clip(m.text, 300)}`);
  if (past.length) lines.push('Eerder in dit gesprek:\n' + past.join('\n'));
  const ask = {
    explain: 'De gebruiker vraagt: leg de huidige stap op een eenvoudigere manier uit.',
    hint: 'De gebruiker vraagt om een hint voor de huidige stap, zonder alles weg te geven.',
    question: `De gebruiker vraagt: ${clip(question, 400)}`,
  }[kind] || `De gebruiker vraagt: ${clip(question, 400)}`;
  lines.push(ask);
  return lines.join('\n\n');
}

export async function coachReply(cfg, body, opts = {}) {
  const step = body?.step;
  if (!step || typeof step.id !== 'number' || typeof step.title !== 'string') throw new AiError('bad_request', 'Ongeldige aanvraag.', 400);
  const content = buildCoachContent({ ...body, step });
  const raw = await callClaude(cfg, { system: COACH_SYSTEM, content, maxTokens: 500, ...opts });
  const obj = parseJsonLoose(raw);
  const text = clip(obj?.text ?? raw, 900);
  const followUp = clip(obj?.followUp ?? '', 300);
  return { text, followUp: followUp || undefined, model: cfg.model };
}

/* ---------- Video-analyse (op basis van losse beelden) ---------- */

export const ANALYSE_SYSTEM = `Je analyseert een instructievideo over origami aan de hand van losse beelden die op vaste momenten uit de video zijn gehaald. Je hoort geen geluid en ziet geen beweging tussen de beelden.
Regels:
- Beschrijf alleen wat je op de beelden ziet. Verzin geen details die niet zichtbaar zijn. Twijfel je, zet "uncertain" op true.
- Verdeel de video in opeenvolgende fragmenten (vouwfasen). Gebruik uitsluitend de tijdstippen van de aangeleverde beelden en de totale duur.
- Koppel elk fragment aan het best passende stap-id uit de lijst, of null als geen enkele stap past.
- Schrijf in begrijpelijk Nederlands. Geef per fragment een korte titel, een beschrijving (max 2 zinnen) en één aandachtspunt.
- Toon is ondersteunend. Beoordeel de gebruiker niet; je ziet alleen de video.
Geef UITSLUITEND JSON in dit formaat:
{"summary":"...","segments":[{"start":0,"end":12.5,"title":"...","description":"...","tip":"...","stepId":1,"uncertain":false}],"warnings":["..."]}`;

export function validateFrames(frames) {
  if (!Array.isArray(frames) || frames.length < 2) throw new AiError('bad_request', 'Er zijn minstens 2 beelden nodig.', 400);
  if (frames.length > MAX_FRAMES) throw new AiError('bad_request', `Maximaal ${MAX_FRAMES} beelden.`, 400);
  return frames.map((f) => {
    const time = Number(f?.time);
    const image = String(f?.image ?? '');
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(image);
    if (!Number.isFinite(time) || time < 0 || !m) throw new AiError('bad_request', 'Ongeldig beeld.', 400);
    if (image.length > MAX_FRAME_CHARS) throw new AiError('bad_request', 'Een beeld is te groot.', 413);
    return { time, data: m[1] };
  });
}

export function buildAnalyseContent({ frames, duration, steps }) {
  const stepList = steps.map((s) => `${s.id}. ${clip(s.title, 100)}`).join('\n');
  const blocks = [{
    type: 'text',
    text: `Project: papieren kraanvogel. Stappen:\n${stepList}\n\nDuur van de video: ${duration.toFixed(1)} seconden. Hieronder volgen ${frames.length} beelden in tijdsvolgorde.`,
  }];
  frames.forEach((f, i) => {
    blocks.push({ type: 'text', text: `Beeld ${i + 1} (t=${f.time.toFixed(1)}s, ${fmtTime(f.time)})` });
    blocks.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: f.data } });
  });
  blocks.push({ type: 'text', text: 'Maak nu de JSON met fragmenten.' });
  return blocks;
}

// Maakt van de ruwe AI-uitvoer een betrouwbaar, begrensd resultaat.
export function validateAnalysis(raw, { duration, stepIds }) {
  const segs = Array.isArray(raw?.segments) ? raw.segments : [];
  const out = [];
  for (const s of segs.slice(0, 20)) {
    let start = Number(s?.start);
    let end = Number(s?.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    start = Math.min(Math.max(start, 0), duration);
    end = Math.min(Math.max(end, 0), duration);
    if (end - start < 0.5) continue;
    const stepId = stepIds.includes(Number(s?.stepId)) ? Number(s.stepId) : null;
    out.push({
      start: Math.round(start * 10) / 10,
      end: Math.round(end * 10) / 10,
      title: clip(s?.title, 100) || 'Fragment',
      description: clip(s?.description, 400),
      tip: clip(s?.tip, 250),
      stepId,
      uncertain: Boolean(s?.uncertain),
    });
  }
  out.sort((a, b) => a.start - b.start);
  const warnings = (Array.isArray(raw?.warnings) ? raw.warnings : []).slice(0, 5).map((w) => clip(w, 250)).filter(Boolean);
  return { summary: clip(raw?.summary, 600), segments: out, warnings };
}

export async function analyseVideo(cfg, body, opts = {}) {
  const duration = Number(body?.duration);
  if (!Number.isFinite(duration) || duration <= 0 || duration > 4 * 3600) throw new AiError('bad_request', 'Ongeldige videoduur.', 400);
  const frames = validateFrames(body?.frames);
  const steps = (Array.isArray(body?.project?.steps) ? body.project.steps : []).filter((s) => Number.isInteger(s?.id) && typeof s?.title === 'string').slice(0, 20);
  if (!steps.length) throw new AiError('bad_request', 'Stappen ontbreken.', 400);
  const content = buildAnalyseContent({ frames, duration, steps });
  const raw = await callClaude(cfg, { system: ANALYSE_SYSTEM, content, maxTokens: 2500, ...opts });
  const obj = parseJsonLoose(raw);
  if (!obj) throw new AiError('bad_output', 'De AI gaf een antwoord dat ik niet kon lezen. Probeer het opnieuw.', 502);
  const result = validateAnalysis(obj, { duration, stepIds: steps.map((s) => s.id) });
  if (!result.segments.length) throw new AiError('bad_output', 'De AI vond geen bruikbare fragmenten in deze video.', 502);
  result.warnings.unshift(`Gebaseerd op ${frames.length} losse beelden, zonder geluid. Details tussen de beelden kunnen ontbreken.`);
  return { ...result, framesUsed: frames.length, model: cfg.model };
}
