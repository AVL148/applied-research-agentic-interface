import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_NAME, PROJECT, STEPS, TECHNIQUES } from '../js/data.js';
import {
  defaultState, loadState, saveState, resetState, currentStepId, stepStatus,
  completeStep, toggleSaved, filterTechniques, STORAGE_KEY,
  setVideoMeta, clearVideo, setAnalysis, setSegmentStep, adoptAnalysis, segmentForStep,
} from '../js/store.js';
import { askCoach } from '../js/coach.js';
import { sampleAnalysis } from '../js/video.js';

const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };

test('naam en project zijn de origami-onderzoeksversie', () => {
  assert.equal(APP_NAME, 'applied research agentic interface');
  assert.match(PROJECT.title, /kraanvogel/i);
  assert.match(STORAGE_KEY, /applied-research-agentic-interface/);
});

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
  assert.deepEqual(loadState(st).completed, [1, 2, 3]);
  assert.deepEqual(resetState(st).completed, [1, 2]);
  assert.equal(st.getItem(STORAGE_KEY), null);
  st.setItem(STORAGE_KEY, '{kapot');
  assert.deepEqual(loadState(st).completed, [1, 2]);
});

test('oude opgeslagen staat zonder videovelden blijft werken', () => {
  const st = memory();
  st.setItem(STORAGE_KEY, JSON.stringify({ completed: [1, 2, 3] }));
  const s = loadState(st);
  assert.deepEqual(s.completed, [1, 2, 3]);
  assert.equal(s.video, null);
  assert.equal(s.analysis, null);
});

test('technieken opslaan, verwijderen, zoeken en filteren', () => {
  let s = toggleSaved(defaultState(), 't2');
  assert.ok(s.saved.includes('t2'));
  s = toggleSaved(s, 't2');
  assert.ok(!s.saved.includes('t2'));
  assert.ok(filterTechniques(TECHNIQUES, { query: 'valley' }).length >= 1);
  assert.ok(filterTechniques(TECHNIQUES, { craft: 'Research' }).every((t) => t.craft === 'Research'));
  assert.equal(filterTechniques(TECHNIQUES, { query: 'bestaatniet' }).length, 0);
});

test('video-analyse telt pas mee na bevestiging door de gebruiker', () => {
  let s = setVideoMeta(defaultState(), { name: 'kraanvogel.mp4', size: 10, type: 'video/mp4', duration: 80 });
  assert.equal(s.analysis, null);
  s = setAnalysis(s, sampleAnalysis(80, STEPS));
  assert.equal(s.analysis.adopted, false);
  assert.equal(segmentForStep(s, 3), null, 'niet overgenomen = niet gebruikt');
  s = setSegmentStep(s, 's3', 5);
  s = adoptAnalysis(s);
  assert.equal(segmentForStep(s, 5).id, 's3');
  s = setSegmentStep(s, 's3', 4);
  assert.equal(s.analysis.adopted, false, 'aanpassen vraagt opnieuw bevestiging');
  assert.equal(clearVideo(s).analysis, null);
  assert.equal(setVideoMeta(s, { name: 'ander.mp4', size: 1, type: 'video/mp4', duration: 5 }).analysis, null, 'nieuwe video wist oude analyse');
});

test('voorbeeldanalyse is duidelijk gemarkeerd als gesimuleerd', () => {
  const a = sampleAnalysis(100, STEPS);
  assert.equal(a.source, 'sample');
  assert.equal(a.segments.length, STEPS.length);
  assert.ok(a.segments.every((x) => x.uncertain));
  assert.match(a.summary, /gesimuleerd/i);
  assert.equal(a.segments.at(-1).end, 100);
});

test('coach valt zonder server terug op voorbeeldantwoorden en blijft eerlijk', async () => {
  const step = STEPS[2];
  const a = await askCoach({ kind: 'question', step, question: 'mijn vallei is te scherp' });
  assert.equal(a.simulated, true);
  assert.match(a.text, /valley/i);
  const b = await askCoach({ kind: 'question', step, question: 'wat is de zin van het leven' });
  assert.equal(b.simulated, true);
  const h = await askCoach({ kind: 'hint', step, history: [] });
  assert.equal(h.text, step.hints[0]);
});

test('elke stap heeft volledige inhoud', () => {
  for (const s of STEPS) {
    assert.ok(s.instructions.length >= 3 && s.tip && s.easier && s.hints.length >= 2, `stap ${s.id}`);
    assert.ok(s.reflection.options.length >= 3, `stap ${s.id} reflectie`);
  }
});
