import test from 'node:test';
import assert from 'node:assert/strict';
import { TECHNIQUES, STEPS } from '../js/data.js';
import { GUIDES, PLANS } from '../js/guides.js';
import { drawing, reflect } from '../js/diagrams.js';

test('elke techniek heeft een stappenplan met tekeningen', () => {
  for (const t of TECHNIQUES) {
    const g = GUIDES[t.id];
    assert.ok(g, `${t.id} mist stappenplan`);
    assert.ok(g.steps.length >= 3 && g.needs.length && g.mistakes.length && g.goal, t.id);
    for (const s of g.steps) assert.ok(s.title && s.text && s.shapes.length, `${t.id}: ${s.title}`);
  }
});

test('elke projectstap heeft een stappenplan met tekeningen', () => {
  for (const s of STEPS) {
    assert.ok(PLANS[s.id]?.length >= 2, `stap ${s.id}`);
    for (const f of PLANS[s.id]) assert.ok(f.shapes.length && f.text, `stap ${s.id}`);
  }
});

test('bronnen zijn echte https/http-links', () => {
  for (const g of Object.values(GUIDES)) for (const s of g.sources) assert.match(s.url, /^https?:\/\//);
});

test('tekeningen zijn geldige SVG zonder scripts', () => {
  for (const g of Object.values(GUIDES)) for (const s of g.steps) {
    const svg = drawing(s.shapes, s.title);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
    assert.ok(!/<script|onerror|NaN|undefined/.test(svg), s.title);
  }
});

test('spiegelen in een vouwlijn is exact (reverse fold)', () => {
  const p = reflect([105, 200], [100, 150], [140, 110]);
  assert.deepEqual(p.map(Math.round), [50, 145]);
});

test('technieken zijn niet langer alleen een uitleg: nieuwe preliminary base is toegevoegd', () => {
  assert.ok(TECHNIQUES.some((t) => /preliminary/i.test(t.name)));
});

test('geen tijdsindicaties meer in stappen en project', async () => {
  const { PROJECT } = await import('../js/data.js');
  assert.ok(!('totalTime' in PROJECT));
  for (const s of STEPS) assert.ok(!('minutes' in s) && !('demoSeconds' in s));
});

test('valley fold en mountain fold hebben verschillende tekeningen en tekst', () => {
  const a = GUIDES.t1.steps.map((s) => drawing(s.shapes, 'x'));
  const b = GUIDES.t2.steps.map((s) => drawing(s.shapes, 'x'));
  for (let i = 0; i < 3; i++) assert.notEqual(a[i].replace(/ah\d+/g, ''), b[i].replace(/ah\d+/g, ''));
  assert.notEqual(GUIDES.t1.goal, GUIDES.t2.goal);
  assert.match(b[0], /l-hidden/);
});
