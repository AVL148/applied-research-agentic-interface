// The finished crane as a small hand-built model (same proportions as a 160 mm sheet), used as the "goal" picture.
// z is up, the wings point along x and the neck and tail along y. The coloured side faces outwards.
import { newFace } from './engine.js';

const mid = (pts) => pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length, a[2] + p[2] / pts.length], [0, 0, 0]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** polygon whose coloured side points towards `out` (a direction or a point's offset) */
function poly(pts, out) {
  const n = cross(sub(pts[1], pts[0]), sub(pts[2], pts[0]));
  const P = dot(n, out) >= 0 ? pts : pts.slice().reverse();
  return newFace(P.map((p) => [p[0], p[1]]), P.map((p) => p.slice()));
}

export function finishedCrane() {
  const faces = [];
  const T = 4; // half thickness of the body (two fins side by side)
  const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const C = [0, 0, 20];
  const out = (pts) => sub(mid(pts), C); // body faces point away from the middle of the body
  const V = (s, y, z) => [s * T, y, z];
  const pts = { F: [30, 20], K: [-30, 20], U: [0, 46], D: [0, 8] };
  // body: a compact pyramid-like diamond made of two fins, closed along its edges
  for (const s of [-1, 1]) {
    const F = V(s, ...pts.F), K = V(s, ...pts.K), U = V(s, ...pts.U), D = V(s, ...pts.D);
    faces.push(poly([F, U, K], [s, 0, 0]));
    faces.push(poly([F, K, D], [s, 0, 0]));
  }
  for (const [a, b] of [[pts.F, pts.U], [pts.F, pts.D], [pts.K, pts.U], [pts.K, pts.D]]) {
    const q = [V(1, ...a), V(1, ...b), V(-1, ...b), V(-1, ...a)];
    faces.push(poly(q, out(q)));
  }
  for (const s of [-1, 1]) {
    const F = V(s, ...pts.F), K = V(s, ...pts.K), U = V(s, ...pts.U);
    // wings: wide kite-shaped plates, nearly horizontal, slightly raised at the tips;
    // the fold lies underneath (valley seen from above), like in the photos
    const tip = [s * 88, -10, 34];
    const M = V(s, 0, 12);
    faces.push(poly([F, M, tip], [0, 0, 1]));
    faces.push(poly([M, K, tip], [0, 0, 1]));
    // neck and tail: steep sheets rising from the front and back edges; the head is a bent beak
    const nt = [0, 62, 88], tt = [0, -58, 96], hd = [0, 106, 80];
    const E = lerp(F, U, 0.45), G = lerp(K, U, 0.45), H = lerp(F, nt, 0.8);
    faces.push(poly([F, E, nt], [s, 0, 0]));
    faces.push(poly([nt, H, hd], [s, 0, 0]));
    faces.push(poly([K, G, tt], [s, 0, 0]));
  }
  return faces;
}
