// Server voor lokaal gebruik: `npm start` -> http://localhost:5173
//  - serveert de statische app
//  - biedt een kleine AI-API (/api/status, /api/coach, /api/analyze-video)
// De Anthropic API-sleutel staat ALLEEN in de omgeving van deze server (.env of omgevingsvariabele).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aiConfig, coachReply, analyseVideo, AiError } from './server/ai.mjs';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));

// Minimale .env-lezer (geen dependency). Bestaande omgevingsvariabelen winnen.
const envFile = join(root, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon',
};
const BODY_LIMIT = 12 * 1024 * 1024;
const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 30;
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > BODY_LIMIT) throw new AiError('too_large', 'Request is too large.', 413);
    chunks.push(c);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new AiError('bad_request', 'Invalid JSON.', 400); }
}

function send(res, status, obj, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
  res.end(JSON.stringify(obj));
}

export function createApp(env = process.env, fetchImpl = fetch) {
  const cfg = () => aiConfig(env);
  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const p = decodeURIComponent(url.pathname);

    if (p.startsWith('/api/')) {
      const cors = {};
      const allowed = env.ALLOWED_ORIGIN;
      if (allowed && (allowed === '*' || req.headers.origin === allowed)) {
        cors['Access-Control-Allow-Origin'] = allowed === '*' ? '*' : req.headers.origin;
        cors['Access-Control-Allow-Headers'] = 'content-type';
        cors['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
        cors['Vary'] = 'Origin';
      }
      if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
      try {
        if (p === '/api/status' && req.method === 'GET') {
          const c = cfg();
          return send(res, 200, { connected: Boolean(c.key), model: c.key ? c.model : null }, cors);
        }
        if ((p === '/api/coach' || p === '/api/analyze-video') && req.method === 'POST') {
          if (limited(req.socket.remoteAddress || 'x')) throw new AiError('rate_limited', 'Too many requests. Please wait a moment.', 429);
          const body = await readJson(req);
          const out = p === '/api/coach' ? await coachReply(cfg(), body, { fetchImpl }) : await analyseVideo(cfg(), body, { fetchImpl });
          return send(res, 200, out, cors);
        }
        return send(res, 404, { error: 'not_found', message: 'Unknown address.' }, cors);
      } catch (e) {
        if (e instanceof AiError) return send(res, e.status, { error: e.code, message: e.message }, cors);
        console.error('Unexpected error:', e?.message);
        return send(res, 500, { error: 'server_error', message: 'Something went wrong on the server.' }, cors);
      }
    }

    try {
      let q = p;
      if (q.endsWith('/')) q += 'index.html';
      const file = normalize(join(root, q));
      const blocked = /\/(server\.mjs|server|package\.json|package-lock\.json|tests|\.git|\.env[^/]*|node_modules)(\/|$)/;
      if (!file.startsWith(root) || blocked.test(q)) throw new Error('nope');
      if (!(await stat(file)).isFile()) throw new Error('nofile');
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 5173;
  createApp().listen(port, () => {
    const c = aiConfig();
    console.log(`applied research agentic interface is running at http://localhost:${port}`);
    console.log(c.key ? `AI connected (model: ${c.model})` : 'AI NOT connected: set ANTHROPIC_API_KEY in .env to use the real analysis and coach.');
  });
}
