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
  const T = 4.5; // half thickness of the body
  // body: a kite seen from the side, with a little thickness
  const N = [0, 32, 5], U = [0, 0, 22], K = [0, -32, 5], D = [0, 0, -26];
  for (const s of [-1, 1]) {
    const q = (p) => [s * T, p[1], p[2]];
    faces.push(poly([q(N), q(U), q(K), q(D)], [s, 0, 0]));
  }
  faces.push(poly([[T, 32, 5], [0, 0, 22], [-T, 32, 5]], [0, 1, 1]));
  faces.push(poly([[T, -32, 5], [0, 0, 22], [-T, -32, 5]], [0, -1, 1]));
  // wings: one big triangle on each side, slightly drooping, plus a small flap at the body
  for (const s of [-1, 1]) {
    const root1 = [s * T, 26, 14], root2 = [s * T, -28, 12], tip = [s * 90, -6, 3], low = [s * T, 0, -3];
    faces.push(poly([root1, root2, tip], [0, 0, 1]));
    faces.push(poly([root1, tip, low], [0, 0, 1]));
  }
  // neck with head, tail
  for (const s of [-1, 1]) {
    const x = s * 1.2;
    faces.push(poly([[x, 28, 12], [x, 31, -1], [x, 64, 34]], [s, 0, 0]));
    faces.push(poly([[x, 64, 34], [x, 56, 27], [x, 78, 29]], [s, 0, 0]));
    faces.push(poly([[x, -28, 12], [x, -31, -1], [x, -68, 36]], [s, 0, 0]));
  }
  return faces;
}
