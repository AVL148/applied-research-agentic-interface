import test from 'node:test';
import assert from 'node:assert/strict';
import { STEPS, TECHNIQUES } from '../js/data.js';
import {
  defaultState, loadState, saveState, resetState, currentStepId, stepStatus,
  completeStep, toggleSaved, filterTechniques, STORAGE_KEY,
} from '../js/store.js';
import { askCoach } from '../js/coach.js';

const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };

test('startsituatie: stap 3 van 8 is actief', () => {
  const s = defaultState();
  assert.equal(STEPS.length, 8);
  assert.equal(currentStepId(s), 3);
  assert.equal(stepStatus(s, 1), 'done');
  assert.equal(stepStatus(s, 3), 'current');
  assert.equal(stepStatus(s, 4), 'upcoming');
});

test('voortgang verandert alleen via completeStep', () => {
  const s = defaultState();
  const after = completeStep(s, 3, { choice: 'x' });
  assert.deepEqual(s.completed, [1, 2]);
  assert.deepEqual(after.completed, [1, 2, 3]);
  assert.equal(currentStepId(after), 4);
  assert.deepEqual(completeStep(after, 3).completed, [1, 2, 3]);
});

test('opslag, laden en resetten', () => {
  const st = memory();
  saveState(completeStep(defaultState(), 3), st);
  assert.ok(st.getItem(STORAGE_KEY));
  assert.deepEqual(loadState(st).completed, [1, 2, 3]);
  assert.deepEqual(resetState(st).completed, [1, 2]);
  assert.equal(st.getItem(STORAGE_KEY), null);
  st.setItem(STORAGE_KEY, '{kapot');
  assert.deepEqual(loadState(st).completed, [1, 2]);
});

test('technieken opslaan en verwijderen', () => {
  let s = defaultState();
  s = toggleSaved(s, 't2');
  assert.ok(s.saved.includes('t2'));
  s = toggleSaved(s, 't2');
  assert.ok(!s.saved.includes('t2'));
});

test('zoeken en filteren', () => {
  assert.ok(filterTechniques(TECHNIQUES, { query: 'zelfkant' }).length >= 1);
  assert.ok(filterTechniques(TECHNIQUES, { craft: 'Keramiek' }).every((t) => t.craft === 'Keramiek'));
  assert.equal(filterTechniques(TECHNIQUES, { query: 'bestaatniet' }).length, 0);
});

test('coach is gesimuleerd en eerlijk bij onbekende vragen', async () => {
  const step = STEPS[2];
  const a = await askCoach({ kind: 'question', step, question: 'mijn rand trekt naar binnen' });
  assert.equal(a.simulated, true);
  assert.match(a.text, /spanning/i);
  const b = await askCoach({ kind: 'question', step, question: 'wat is de zin van het leven' });
  assert.match(b.text, /niet|zie je werkstuk/i);
  const h = await askCoach({ kind: 'hint', step, history: [] });
  assert.equal(h.text, step.hints[0]);
});

test('elke stap heeft volledige inhoud', () => {
  for (const s of STEPS) {
    assert.ok(s.instructions.length >= 3 && s.tip && s.easier && s.hints.length >= 2);
    assert.ok(s.reflection.options.length >= 3);
  }
});
