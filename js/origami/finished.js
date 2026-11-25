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
  const pts = { F: [30, 20], K: [-30, 20], U: [0, 46], P: [26, -6], Q: [-26, -6], N: [0, 8] };
  // body: a compact pyramid-like diamond made of two fins, closed along its edges
  for (const s of [-1, 1]) {
    const F = V(s, ...pts.F), K = V(s, ...pts.K), U = V(s, ...pts.U), P = V(s, ...pts.P), Q = V(s, ...pts.Q), N = V(s, ...pts.N);
    // lower body: two pointed feet (front and back) with a notch between them
    faces.push(poly([F, U, K], [s, 0, 0]));
    faces.push(poly([F, P, N], [s, 0, 0]));
    faces.push(poly([K, N, Q], [s, 0, 0]));
    faces.push(poly([F, N, K], [s, 0, 0]));
  }
  for (const [a, b] of [[pts.F, pts.U], [pts.F, pts.P], [pts.P, pts.N], [pts.N, pts.Q], [pts.Q, pts.K], [pts.K, pts.U]]) {
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
  // close the neck, beak and tail into thin two-layer strips: both fins meet at the tip
  const nt = [0, 62, 88], tt = [0, -58, 96], hd = [0, 106, 80];
  const at = (P, k) => [k * T, P[1], P[2]]; // same point on the +/- fin (the fins are T apart from the middle)
  const Fp = [0, ...pts.F], Kp = [0, ...pts.K], Up = [0, ...pts.U];
  const E0 = lerp(Fp, Up, 0.45), G0 = lerp(Kp, Up, 0.45), H0 = lerp(Fp, nt, 0.8);
  const hw = (P, tip) => (P === H0 ? T * 0.2 : T);
  const closeEdge = (P, tip, cen) => {
    const tri = [[hw(P) , P[1], P[2]], tip, [-hw(P), P[1], P[2]]];
    faces.push(poly(tri, sub(mid(tri), cen)));
  };
  const cn = mid([Fp, E0, nt]), ct = mid([Kp, G0, tt]), ch = mid([H0, nt, hd]);
  closeEdge(Fp, nt, cn); closeEdge(E0, nt, cn);
  closeEdge(Kp, tt, ct); closeEdge(G0, tt, ct);
  closeEdge(H0, hd, ch);
  void at;
  return faces;
}
