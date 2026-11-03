import test from 'node:test';
import assert from 'node:assert/strict';
import { NL } from '../js/lang/nl.js';
import { FR } from '../js/lang/fr.js';
import { readFileSync } from 'node:fs';

const keysIn = (f) => [...readFileSync(new URL('../' + f, import.meta.url), 'utf8').matchAll(/\bt(?:r)?\('((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'").trim());
const files = ['js/data.js', 'js/guides.js', 'js/diagrams.js', 'js/app.js', 'js/coach.js', 'js/video.js', 'js/api.js'];

test('every UI string has a Dutch and a French translation', () => {
  const missing = [];
  for (const f of files) for (const k of keysIn(f)) { if (!NL[k]) missing.push('nl: ' + k); if (!FR[k]) missing.push('fr: ' + k); }
  assert.deepEqual(missing, []);
});

test('placeholders are preserved in every translation', () => {
  const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const [k, v] of Object.entries(NL)) assert.equal(ph(v), ph(k), k);
  for (const [k, v] of Object.entries(FR)) assert.equal(ph(v), ph(k), k);
});
