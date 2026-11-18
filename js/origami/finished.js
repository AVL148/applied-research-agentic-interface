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
  const T = 3.2; // half thickness of the body (two fins side by side)
  const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const U = [0, 0, 52], D = [0, 0, -4], C = [0, 0, 20];
  const out = (pts) => sub(mid(pts), C); // body faces point away from the middle of the body
  // body: a closed little solid, every face shares its edges with the next one
  for (const s of [-1, 1]) {
    const F = [s * T, 30, 22], K = [s * T, -30, 22];
    for (const pts of [[F, U, K], [F, K, D]]) faces.push(poly(pts, [s, 0, 0]));
  }
  for (const y of [30, -30]) {
    const A = [T, y, 22], B = [-T, y, 22];
    faces.push(poly([A, B, U], out([A, B, U])));
    faces.push(poly([A, B, D], out([A, B, D])));
  }
  for (const s of [-1, 1]) {
    const F = [s * T, 30, 22], K = [s * T, -30, 22];
    // wings: attached along the two lower edges of the body, rising outwards in a V
    const tip = [s * 84, -12, 46];
    faces.push(poly([F, D, tip], [0, 0, 1]));
    faces.push(poly([D, K, tip], [0, 0, 1]));
    // neck and tail: thin sheets that continue the upper edges of the body and meet in one point
    const nt = [0, 64, 60], tt = [0, -64, 58], hd = [0, 80, 56];
    const E = lerp(F, U, 0.5), G = lerp(K, U, 0.5), H = lerp(F, nt, 0.8);
    faces.push(poly([F, E, nt], [s, 0, 0]));
    faces.push(poly([nt, H, hd], [s, 0, 0]));
    faces.push(poly([K, G, tt], [s, 0, 0]));
  }
  return faces;
}
