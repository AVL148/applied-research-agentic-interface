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
  // body: two upright fins, closed at the top and bottom edge, seen from the side as a kite
  const F = [30, 22], K = [-30, 22], U = [0, 52], D = [0, -4];
  for (const s of [-1, 1]) {
    const q = (p) => [s * T, p[0], p[1]];
    faces.push(poly([q(F), q(U), q(K), q(D)], [s, 0, 0]));
  }
  faces.push(poly([[T, F[0], F[1]], [0, U[0], U[1]], [-T, F[0], F[1]]], [1, 1, 1]));
  faces.push(poly([[T, K[0], K[1]], [0, U[0], U[1]], [-T, K[0], K[1]]], [-1, -1, 1]));
  faces.push(poly([[T, F[0], F[1]], [0, D[0], D[1]], [-T, F[0], F[1]]], [1, 1, -1]));
  faces.push(poly([[T, K[0], K[1]], [0, D[0], D[1]], [-T, K[0], K[1]]], [-1, -1, -1]));
  // wings: a kite per side that rises outwards in a V, bent a little along its middle
  for (const s of [-1, 1]) {
    const a = [s * T, 34, 16], c = [s * T, -34, 14], low = [s * T, 2, -2], tip = [s * 84, -12, 46];
    faces.push(poly([a, tip, low], [0, 0, 1]));
    faces.push(poly([low, tip, c], [0, 0, 1]));
  }
  // neck and tail: thin double sheets that rise from the ends of the body; the head is a small bend
  for (const s of [-1, 1]) {
    const x = s * 2.2;
    faces.push(poly([[x, 24, 2], [x, 38, 34], [x, 62, 62]], [s, 0, 0]));
    faces.push(poly([[x, 62, 62], [x, 56, 52], [x, 80, 56]], [s, 0, 0]));
    faces.push(poly([[x, -24, 2], [x, -38, 34], [x, -64, 58]], [s, 0, 0]));
  }
  return faces;
}
