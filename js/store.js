// Lokale staat met localStorage. Pure logica staat apart zodat ze testbaar is.
import { STEPS } from './data.js';

export const STORAGE_KEY = 'applied-research-agentic-interface:v1';

export function defaultState() {
  return {
    schema: 2,
    // Beginsituatie van de demo: stap 1 en 2 zijn al klaar, stap 3 is actief.
    completed: [1, 2],
    reflections: {}, // { [stapId]: { choice, note } | { skipped: true } }
    saved: ['t1'], // opgeslagen technieken
    recent: [2], // recent bekeken demonstraties (stap-id's)
    chats: {}, // { [stapId]: [{ from, text }] }
    video: null, // { name, size, type, duration } van de geüploade video (het bestand zelf staat in IndexedDB)
    analysis: null, // { source: 'ai'|'sample', summary, warnings, segments: [...], adopted }
  };
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...(parsed.schema === 2 ? parsed : migrateV1(parsed)) };
  } catch {
    return defaultState();
  }
}

// Oude indeling had 8 stappen. Stap 6 (symmetrie) is vervallen; 7 en 8 werden 6 en 7.
const OLD_TO_NEW = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 7: 6, 8: 7 };
function migrateV1(old) {
  const ids = (list) => [...new Set((list || []).map((i) => OLD_TO_NEW[i]).filter(Boolean))].sort((a, b) => a - b);
  const keys = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([k]) => OLD_TO_NEW[k]).map(([k, v]) => [OLD_TO_NEW[k], v]));
  const out = { ...old, schema: 2, completed: ids(old.completed), recent: ids(old.recent), reflections: keys(old.reflections), chats: keys(old.chats) };
  if (old.analysis?.segments) {
    out.analysis = { ...old.analysis, segments: old.analysis.segments.map((s) => ({ ...s, stepId: OLD_TO_NEW[s.stepId] ?? null })) };
  }
  return out;
}

export function saveState(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* opslag niet beschikbaar: de app blijft werken in het geheugen */
  }
}

export function resetState(storage = globalThis.localStorage) {
  try { storage?.removeItem(STORAGE_KEY); } catch { /* negeren */ }
  return defaultState();
}

// Huidige stap = eerste stap die nog niet is afgerond. null als alles klaar is.
export function currentStepId(state) {
  const next = STEPS.find((s) => !state.completed.includes(s.id));
  return next ? next.id : null;
}

export function stepStatus(state, id) {
  if (state.completed.includes(id)) return 'done';
  return id === currentStepId(state) ? 'current' : 'upcoming';
}

// Voortgang wordt alleen bijgewerkt via deze functie, na bevestiging van de gebruiker.
export function completeStep(state, id, reflection) {
  const completed = state.completed.includes(id) ? state.completed : [...state.completed, id].sort((a, b) => a - b);
  const reflections = reflection ? { ...state.reflections, [id]: reflection } : state.reflections;
  return { ...state, completed, reflections };
}

export function toggleSaved(state, techniqueId) {
  const saved = state.saved.includes(techniqueId)
    ? state.saved.filter((x) => x !== techniqueId)
    : [...state.saved, techniqueId];
  return { ...state, saved };
}

export function markViewed(state, stepId) {
  const recent = [stepId, ...state.recent.filter((x) => x !== stepId)].slice(0, 4);
  return { ...state, recent };
}

export function appendChat(state, stepId, messages) {
  const prev = state.chats[stepId] || [];
  return { ...state, chats: { ...state.chats, [stepId]: [...prev, ...messages] } };
}

export function filterTechniques(list, { query = '', craft = 'Alle', level = 'Alle' }) {
  const q = query.trim().toLowerCase();
  return list.filter((t) => {
    if (craft !== 'Alle' && t.craft !== craft) return false;
    if (level !== 'Alle' && t.level !== level) return false;
    if (!q) return true;
    return [t.name, t.description, t.material, t.craft].join(' ').toLowerCase().includes(q);
  });
}

/* ---------- Video en analyse ---------- */

export function setVideoMeta(state, meta) {
  // Een nieuwe video maakt een oude analyse ongeldig.
  return { ...state, video: meta, analysis: null };
}

export function clearVideo(state) {
  return { ...state, video: null, analysis: null };
}

export function setAnalysis(state, analysis) {
  const segments = analysis.segments.map((s, i) => ({ id: `s${i + 1}`, ...s }));
  return { ...state, analysis: { ...analysis, segments, adopted: false } };
}

export function setSegmentStep(state, segmentId, stepId) {
  if (!state.analysis) return state;
  const segments = state.analysis.segments.map((s) => (s.id === segmentId ? { ...s, stepId: stepId || null } : s));
  return { ...state, analysis: { ...state.analysis, segments, adopted: false } };
}

// De analyse telt pas mee in het leerpad nadat de gebruiker dit bevestigt.
export function adoptAnalysis(state) {
  if (!state.analysis) return state;
  return { ...state, analysis: { ...state.analysis, adopted: true } };
}

export function discardAnalysis(state) {
  return { ...state, analysis: null };
}

// De vaste indeling van de referentievideo (data.js) bepaalt altijd het fragment per stap,
// zodra er een video is. De AI-analyse blijft een extra overzicht en verandert de tijden niet.
export function segmentForStep(state, stepId) {
  return referenceSegment(state, stepId);
}

export function referenceSegment(state, stepId) {
  const step = STEPS.find((s) => s.id === stepId);
  const dur = state.video?.duration;
  if (!step?.video || !(dur > 0)) return null;
  const start = Math.min(step.video.start, Math.max(0, dur - 1));
  const end = step.video.end == null ? dur : Math.min(step.video.end, dur);
  return { id: `ref${stepId}`, stepId, start, end, title: step.title, description: '', source: 'reference' };
}
