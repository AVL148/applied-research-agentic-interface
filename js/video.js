// Video: bewaren in IndexedDB (blijft na herladen, verlaat je apparaat niet) en beelden eruit halen.
// Alleen losse JPEG-beelden worden naar de server gestuurd als je zelf op "Analyseer" klikt.

const DB = 'agentic-interface';
const STORE = 'files';
const KEY = 'video';

function openDb() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('IndexedDB is not available'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(req?.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  } finally {
    db.close();
  }
}

export async function saveVideo(blob) { try { await tx('readwrite', (s) => s.put(blob, KEY)); return true; } catch { return false; } }
export async function loadVideo() { try { return (await tx('readonly', (s) => s.get(KEY))) || null; } catch { return null; } }
export async function deleteVideo() { try { await tx('readwrite', (s) => s.delete(KEY)); } catch { /* negeren */ } }

function loadMeta(url) {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    v.muted = true;
    v.preload = 'auto';
    v.playsInline = true;
    const timer = setTimeout(() => reject(new Error('The video could not be read (time limit).')), 15000);
    v.onloadedmetadata = async () => {
      // Sommige opnames melden geen duur (Infinity); dit trucje haalt hem alsnog op.
      if (v.duration === Infinity) {
        v.currentTime = 1e101;
        await new Promise((r) => { v.ontimeupdate = () => { v.ontimeupdate = null; r(); }; setTimeout(r, 3000); });
        v.currentTime = 0;
      }
      clearTimeout(timer);
      resolve(v);
    };
    v.onerror = () => { clearTimeout(timer); reject(new Error('Your browser cannot read this video format. Try MP4 (H.264) or WebM.')); };
    v.src = url;
  });
}

export async function readVideoInfo(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const v = await loadMeta(url);
    if (!Number.isFinite(v.duration) || v.duration <= 0) throw new Error('The duration of the video is unknown.');
    return { duration: v.duration, width: v.videoWidth, height: v.videoHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function seek(v, t) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Getting a frame took too long.')), 10000);
    v.onseeked = () => { clearTimeout(timer); resolve(); };
    v.currentTime = t;
  });
}

// Haalt `count` beelden op, gelijkmatig verdeeld over de video.
export async function extractFrames(blob, { count = 10, maxWidth = 512, quality = 0.7, onProgress } = {}) {
  const url = URL.createObjectURL(blob);
  try {
    const v = await loadMeta(url);
    const duration = v.duration;
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('The duration of the video is unknown.');
    const scale = Math.min(1, maxWidth / (v.videoWidth || maxWidth));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((v.videoWidth || maxWidth) * scale));
    canvas.height = Math.max(1, Math.round((v.videoHeight || maxWidth) * scale));
    const ctx = canvas.getContext('2d');
    const frames = [];
    for (let i = 0; i < count; i++) {
      const time = Math.min(duration - 0.05, ((i + 0.5) * duration) / count);
      await seek(v, Math.max(0, time));
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      frames.push({ time: Math.round(time * 10) / 10, image: canvas.toDataURL('image/jpeg', quality) });
      onProgress?.(i + 1, count);
    }
    return { duration, frames };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Voorbeeldanalyse zonder AI: duidelijk gemarkeerd als gesimuleerd, niet gebaseerd op de video.
export function sampleAnalysis(duration, steps) {
  const segments = steps.map((s) => ({
    start: Math.min(s.video.start, Math.max(0, duration - 1)),
    end: s.video.end == null ? duration : Math.min(s.video.end, duration),
    title: s.title,
    description: 'Fixed layout of the reference video. This is not based on an analysis of your video.',
    tip: '',
    stepId: s.id,
    uncertain: true,
  }));
  return {
    source: 'sample',
    summary: 'Simulated sample analysis: the segments follow the fixed layout and say nothing about what happens in your video. Connect the AI for a real analysis.',
    warnings: ['This is a sample and not an AI analysis.'],
    framesUsed: 0,
    segments,
  };
}
