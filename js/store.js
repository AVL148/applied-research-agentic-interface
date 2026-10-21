// Lokale staat met localStorage. Pure logica staat apart zodat ze testbaar is.
import { STEPS } from './data.js';

export const STORAGE_KEY = 'atelier-maat:v1';

export function defaultState() {
  return {
    // Beginsituatie van de demo: stap 1 en 2 zijn al klaar, stap 3 is actief.
    completed: [1, 2],
    reflections: {}, // { [stapId]: { choice, note } | { skipped: true } }
    saved: ['t1'], // opgeslagen technieken
    recent: [2], // recent bekeken demonstraties (stap-id's)
    chats: {}, // { [stapId]: [{ from, text }] }
  };
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
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
