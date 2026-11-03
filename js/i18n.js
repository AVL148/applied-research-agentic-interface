// Tiny translation layer. English strings are the keys; nl.js and fr.js map them.
// The language is stored in localStorage and applied on load (switching reloads the page,
// all progress and the video are kept).
import { NL } from './lang/nl.js';
import { FR } from './lang/fr.js';

export const LANGS = { en: 'English', nl: 'Nederlands', fr: 'Français' };
const KEY = 'applied-research-agentic-interface:lang';
const DICTS = { en: null, nl: NL, fr: FR };

function readLang() {
  try {
    const saved = globalThis.localStorage?.getItem(KEY);
    if (saved && LANGS[saved]) return saved;
  } catch { /* storage not available */ }
  return 'en';
}

export let LANG = readLang();

export function setLang(code) {
  if (!LANGS[code]) return;
  try { globalThis.localStorage?.setItem(KEY, code); } catch { /* ignore */ }
  LANG = code;
}

/** Translate an English string. {name} placeholders are filled from vars. */
export function t(text, vars) {
  const d = DICTS[LANG];
  let out = (d && d[text]) || text;
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return out;
}
