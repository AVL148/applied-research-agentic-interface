// Verbinding met de AI-backend. De browser praat nooit rechtstreeks met Claude en heeft geen sleutel.
import { API_BASE } from './config.js';

let statusCache = null;

export function resetStatusCache() { statusCache = null; }

// { connected: boolean, model?: string }. Zonder backend (bijv. GitHub Pages) is connected altijd false.
export function getAiStatus(force = false) {
  if (statusCache && !force) return statusCache;
  statusCache = (async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3000);
      const res = await fetch(`${API_BASE}/api/status`, { cache: 'no-store', signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) return { connected: false };
      const data = await res.json();
      return { connected: Boolean(data.connected), model: data.model || null };
    } catch {
      return { connected: false };
    }
  })();
  return statusCache;
}

export async function postJson(path, body, timeoutMs = 120_000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch (e) {
    throw new Error(e?.name === 'AbortError' ? 'Het duurde te lang.' : 'De server is niet bereikbaar.');
  } finally {
    clearTimeout(t);
  }
  let data = null;
  try { data = await res.json(); } catch { /* geen JSON */ }
  if (!res.ok) throw new Error(data?.message || `Fout ${res.status}`);
  return data;
}
