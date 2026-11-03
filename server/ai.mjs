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
  if (!cfg.key) throw new AiError('no_key', 'No ANTHROPIC_API_KEY is set on the server.', 503);
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
    throw new AiError('upstream_unreachable', e?.name === 'AbortError' ? 'The AI took too long.' : 'The AI cannot be reached.', 504);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    // Geen details van de upstream doorgeven: die kunnen gevoelig zijn.
    const code = res.status === 401 || res.status === 403 ? 'bad_key' : res.status === 429 ? 'rate_limited' : 'upstream_error';
    const msg = code === 'bad_key' ? 'The API key is invalid or has no access.' : code === 'rate_limited' ? 'The AI is temporarily overloaded. Try again shortly.' : 'The AI returned an error.';
    throw new AiError(code, msg, 502);
  }
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  if (!text) throw new AiError('empty', 'The AI returned an empty answer.', 502);
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

export const COACH_SYSTEM = `You are the coach in an origami learning environment. You help a beginner fold a paper crane.
Rules:
- Answer in clear English, short and concrete (at most 4 sentences).
- You do NOT see the user's paper. Never judge work you have not seen; ask one clarifying question instead.
- Say honestly when information is missing or you are not sure. Do not invent folding steps outside the given step.
- You do not carry out steps and you never say that a step is finished. The user decides the pace and when something is done.
- If a video segment description is given you may refer to it, but it comes from an automatic analysis of single frames and can be wrong.
Give your answer ONLY as JSON: {"text": "...", "followUp": "optional follow-up question or empty"}`;

export function buildCoachContent({ kind, question, history, step, segment }) {
  const lines = [];
  lines.push(`Current step ${step.id}: ${clip(step.title, 120)}`);
  if (Array.isArray(step.instructions)) lines.push('Instructions:\n' + step.instructions.slice(0, 8).map((t, i) => `${i + 1}. ${clip(t, 200)}`).join('\n'));
  if (step.tip) lines.push(`Point of attention: ${clip(step.tip, 200)}`);
  if (segment) lines.push(`Video segment for this step (automatically analysed, uncertain): ${clip(segment.title, 100)}. ${clip(segment.description, 300)}`);
  const past = (history || []).slice(-8).map((m) => `${m.from === 'you' ? 'User' : 'Coach'}: ${clip(m.text, 300)}`);
  if (past.length) lines.push('Earlier in this conversation:\n' + past.join('\n'));
  const ask = {
    explain: 'The user asks: explain the current step in a simpler way.',
    hint: 'The user asks for a hint for the current step, without giving everything away.',
    question: `The user asks: ${clip(question, 400)}`,
  }[kind] || `The user asks: ${clip(question, 400)}`;
  lines.push(ask);
  return lines.join('\n\n');
}

export async function coachReply(cfg, body, opts = {}) {
  const step = body?.step;
  if (!step || typeof step.id !== 'number' || typeof step.title !== 'string') throw new AiError('bad_request', 'Invalid request.', 400);
  const content = buildCoachContent({ ...body, step });
  const raw = await callClaude(cfg, { system: COACH_SYSTEM, content, maxTokens: 500, ...opts });
  const obj = parseJsonLoose(raw);
  const text = clip(obj?.text ?? raw, 900);
  const followUp = clip(obj?.followUp ?? '', 300);
  return { text, followUp: followUp || undefined, model: cfg.model };
}

/* ---------- Video-analyse (op basis van losse beelden) ---------- */

export const ANALYSE_SYSTEM = `You analyse an origami instruction video from single frames taken from the video at fixed moments. You hear no sound and see no movement between the frames.
Rules:
- Describe only what you see in the frames. Do not invent details that are not visible. If in doubt, set "uncertain" to true.
- Divide the video into consecutive segments (folding phases). Use only the timestamps of the supplied frames and the total duration.
- Link each segment to the best matching step id from the list, or null if no step fits.
- Write in clear English. Give each segment a short title, a description (max 2 sentences) and one point of attention.
- The tone is supportive. Do not judge the user; you only see the video.
Give ONLY JSON in this format:
{"summary":"...","segments":[{"start":0,"end":12.5,"title":"...","description":"...","tip":"...","stepId":1,"uncertain":false}],"warnings":["..."]}`;

export function validateFrames(frames) {
  if (!Array.isArray(frames) || frames.length < 2) throw new AiError('bad_request', 'At least 2 frames are needed.', 400);
  if (frames.length > MAX_FRAMES) throw new AiError('bad_request', `At most ${MAX_FRAMES} frames.`, 400);
  return frames.map((f) => {
    const time = Number(f?.time);
    const image = String(f?.image ?? '');
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(image);
    if (!Number.isFinite(time) || time < 0 || !m) throw new AiError('bad_request', 'Invalid frame.', 400);
    if (image.length > MAX_FRAME_CHARS) throw new AiError('bad_request', 'A frame is too large.', 413);
    return { time, data: m[1] };
  });
}

export function buildAnalyseContent({ frames, duration, steps }) {
  const stepList = steps.map((s) => `${s.id}. ${clip(s.title, 100)}`).join('\n');
  const blocks = [{
    type: 'text',
    text: `Project: paper crane. Steps:\n${stepList}\n\nDuration of the video: ${duration.toFixed(1)} seconds. Below are ${frames.length} frames in time order.`,
  }];
  frames.forEach((f, i) => {
    blocks.push({ type: 'text', text: `Frame ${i + 1} (t=${f.time.toFixed(1)}s, ${fmtTime(f.time)})` });
    blocks.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: f.data } });
  });
  blocks.push({ type: 'text', text: 'Now produce the JSON with segments.' });
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
      title: clip(s?.title, 100) || 'Segment',
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
  if (!Number.isFinite(duration) || duration <= 0 || duration > 4 * 3600) throw new AiError('bad_request', 'Invalid video duration.', 400);
  const frames = validateFrames(body?.frames);
  const steps = (Array.isArray(body?.project?.steps) ? body.project.steps : []).filter((s) => Number.isInteger(s?.id) && typeof s?.title === 'string').slice(0, 20);
  if (!steps.length) throw new AiError('bad_request', 'Steps are missing.', 400);
  const content = buildAnalyseContent({ frames, duration, steps });
  const raw = await callClaude(cfg, { system: ANALYSE_SYSTEM, content, maxTokens: 2500, ...opts });
  const obj = parseJsonLoose(raw);
  if (!obj) throw new AiError('bad_output', 'The AI gave an answer that could not be read. Please try again.', 502);
  const result = validateAnalysis(obj, { duration, stepIds: steps.map((s) => s.id) });
  if (!result.segments.length) throw new AiError('bad_output', 'The AI found no usable segments in this video.', 502);
  result.warnings.unshift(`Based on ${frames.length} single frames, without sound. Details between the frames may be missing.`);
  return { ...result, framesUsed: frames.length, model: cfg.model };
}
