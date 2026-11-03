import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import {
  aiConfig, callClaude, coachReply, analyseVideo, validateAnalysis, validateFrames,
  parseJsonLoose, AiError, MAX_FRAMES,
} from '../server/ai.mjs';
import { createApp } from '../server.mjs';

const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==';
const frames = (n) => Array.from({ length: n }, (_, i) => ({ time: i * 5, image: JPEG }));
const project = { steps: [{ id: 1, title: 'Voorbereiden' }, { id: 2, title: 'Basis' }] };
const cfg = { key: 'test-key', model: 'test-model', base: 'https://api.example.test' };

// Nep-Claude: geeft vaste tekst terug en bewaart het verzoek.
function mockClaude(text, { status = 200 } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return { ok: status === 200, status, json: async () => ({ content: [{ type: 'text', text }] }) };
  };
  return { fetchImpl, calls };
}

test('geen sleutel = nette fout, geen netwerkverkeer', async () => {
  const m = mockClaude('x');
  await assert.rejects(callClaude({ ...cfg, key: '' }, { system: 's', content: 'c', fetchImpl: m.fetchImpl }), (e) => e instanceof AiError && e.code === 'no_key');
  assert.equal(m.calls.length, 0);
});

test('sleutel gaat alleen als header naar de API, nooit in de body', async () => {
  const m = mockClaude('{"text":"ok"}');
  await coachReply(cfg, { kind: 'question', question: 'hoi', step: { id: 1, title: 'Basis', instructions: ['a'] } }, { fetchImpl: m.fetchImpl });
  const c = m.calls[0];
  assert.equal(c.init.headers['x-api-key'], 'test-key');
  assert.ok(!JSON.stringify(c.body).includes('test-key'));
  assert.equal(c.url, 'https://api.example.test/v1/messages');
  assert.equal(c.body.model, 'test-model');
});

test('coach: JSON-antwoord wordt uitgepakt en begrensd', async () => {
  const m = mockClaude('Hier: {"text":"Strijk de vouw aan.","followUp":"Welke vouw?"}');
  const r = await coachReply(cfg, { kind: 'hint', step: { id: 1, title: 'Basis' } }, { fetchImpl: m.fetchImpl });
  assert.equal(r.text, 'Strijk de vouw aan.');
  assert.equal(r.followUp, 'Welke vouw?');
});

test('coach: ongeldige aanvraag wordt geweigerd', async () => {
  await assert.rejects(coachReply(cfg, { kind: 'hint' }), (e) => e.code === 'bad_request' && e.status === 400);
});

test('upstream-fouten lekken geen details', async () => {
  for (const [status, code] of [[401, 'bad_key'], [429, 'rate_limited'], [500, 'upstream_error']]) {
    const m = mockClaude('geheim', { status });
    await assert.rejects(callClaude(cfg, { system: 's', content: 'c', fetchImpl: m.fetchImpl }), (e) => e.code === code && !/geheim|test-key/.test(e.message));
  }
});

test('beelden worden gevalideerd', () => {
  assert.throws(() => validateFrames(frames(1)), /At least 2/);
  assert.throws(() => validateFrames(frames(MAX_FRAMES + 1)), /At most/);
  assert.throws(() => validateFrames([{ time: 1, image: 'data:image/png;base64,AAAA' }, { time: 2, image: JPEG }]), /Invalid/);
  assert.throws(() => validateFrames([{ time: -1, image: JPEG }, { time: 2, image: JPEG }]), /Invalid/);
  assert.equal(validateFrames(frames(3)).length, 3);
});

test('analyse: AI-uitvoer wordt opgeschoond (tijden, stap-id, volgorde)', () => {
  const raw = {
    summary: 'Samenvatting',
    segments: [
      { start: 30, end: 999, title: 'Laat', stepId: 2 },
      { start: 0, end: 20, title: 'Begin', description: 'x', stepId: 99, uncertain: 1 },
      { start: 5, end: 5.1, title: 'Te kort', stepId: 1 },
      { start: 'a', end: 10, title: 'Kapot' },
    ],
  };
  const r = validateAnalysis(raw, { duration: 60, stepIds: [1, 2] });
  assert.equal(r.segments.length, 2);
  assert.equal(r.segments[0].title, 'Begin');
  assert.equal(r.segments[0].stepId, null, 'onbekend stap-id wordt null');
  assert.equal(r.segments[0].uncertain, true);
  assert.equal(r.segments[1].end, 60, 'einde wordt begrensd op de videoduur');
});

test('analyse: volledige keten met nep-Claude', async () => {
  const out = JSON.stringify({ summary: 'Twee fasen', segments: [{ start: 0, end: 10, title: 'A', stepId: 1 }, { start: 10, end: 20, title: 'B', stepId: 2 }], warnings: [] });
  const m = mockClaude(out);
  const r = await analyseVideo(cfg, { duration: 20, frames: frames(4), project }, { fetchImpl: m.fetchImpl });
  assert.equal(r.segments.length, 2);
  assert.equal(r.framesUsed, 4);
  assert.match(r.warnings[0], /single frames/);
  const imgs = m.calls[0].body.messages[0].content.filter((b) => b.type === 'image');
  assert.equal(imgs.length, 4);
  assert.match(m.calls[0].body.system, /Do not invent details/);
});

test('analyse: onleesbare AI-uitvoer geeft een duidelijke fout', async () => {
  const m = mockClaude('Sorry, dat lukt niet.');
  await assert.rejects(analyseVideo(cfg, { duration: 20, frames: frames(3), project }, { fetchImpl: m.fetchImpl }), (e) => e.code === 'bad_output');
});

test('parseJsonLoose', () => {
  assert.deepEqual(parseJsonLoose('tekst {"a":1} meer'), { a: 1 });
  assert.equal(parseJsonLoose('geen json'), null);
});

/* ---------- HTTP-laag ---------- */

async function withServer(env, fetchImpl, fn) {
  const server = createApp(env, fetchImpl);
  server.listen(0);
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await fn(base); } finally { server.close(); }
}

test('HTTP: status zonder sleutel = niet verbonden', async () => {
  await withServer({}, fetch, async (base) => {
    const r = await (await fetch(`${base}/api/status`)).json();
    assert.deepEqual(r, { connected: false, model: null });
  });
});

test('HTTP: status met sleutel verraadt de sleutel niet', async () => {
  await withServer({ ANTHROPIC_API_KEY: 'sk-geheim', ANTHROPIC_MODEL: 'm1' }, fetch, async (base) => {
    const txt = await (await fetch(`${base}/api/status`)).text();
    assert.ok(!txt.includes('sk-geheim'));
    assert.deepEqual(JSON.parse(txt), { connected: true, model: 'm1' });
  });
});

test('HTTP: coach zonder sleutel geeft 503 met duidelijke melding', async () => {
  await withServer({}, fetch, async (base) => {
    const res = await fetch(`${base}/api/coach`, { method: 'POST', body: JSON.stringify({ step: { id: 1, title: 'x' } }) });
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error, 'no_key');
  });
});

test('HTTP: analyse via server met nep-Claude', async () => {
  const m = mockClaude(JSON.stringify({ summary: 's', segments: [{ start: 0, end: 5, title: 'A', stepId: 1 }] }));
  await withServer({ ANTHROPIC_API_KEY: 'k' }, m.fetchImpl, async (base) => {
    const res = await fetch(`${base}/api/analyze-video`, { method: 'POST', body: JSON.stringify({ duration: 10, frames: frames(3), project }) });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).segments.length, 1);
  });
});

test('HTTP: kapotte JSON en onbekende paden', async () => {
  await withServer({ ANTHROPIC_API_KEY: 'k' }, fetch, async (base) => {
    assert.equal((await fetch(`${base}/api/coach`, { method: 'POST', body: '{kapot' })).status, 400);
    assert.equal((await fetch(`${base}/api/bestaatniet`)).status, 404);
  });
});

test('HTTP: geheime bestanden worden niet geserveerd', async () => {
  await withServer({}, fetch, async (base) => {
    for (const p of ['/.env', '/.env.example', '/server.mjs', '/server/ai.mjs', '/package.json', '/.git/config', '/tests/ai.test.mjs']) {
      assert.equal((await fetch(`${base}${p}`)).status, 404, p);
    }
    assert.equal((await fetch(`${base}/index.html`)).status, 200);
    assert.equal((await fetch(`${base}/js/app.js`)).status, 200);
  });
});

test('HTTP: CORS alleen voor de ingestelde herkomst', async () => {
  await withServer({ ALLOWED_ORIGIN: 'https://avl148.github.io' }, fetch, async (base) => {
    const ok = await fetch(`${base}/api/status`, { headers: { origin: 'https://avl148.github.io' } });
    assert.equal(ok.headers.get('access-control-allow-origin'), 'https://avl148.github.io');
    const no = await fetch(`${base}/api/status`, { headers: { origin: 'https://kwaad.example' } });
    assert.equal(no.headers.get('access-control-allow-origin'), null);
  });
});
