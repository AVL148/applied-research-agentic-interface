// Origami fold engine (pure maths, no DOM).
// The paper is a set of convex faces. Every face keeps its paper coordinates (uv, never change) and its
// current 3D position (P). A step ("op") splits faces along crease lines, then moves groups of faces with
// rotations around hinge lines (hinge chains, nested like a real kinematic chain). At the end of a step
// the paper is flat again and the layers are re-ordered from the almost-final pose.

export const SIZE = 160;
export const LAYER = 0.9; // distance between stacked layers

const TAU = Math.PI * 2;
const v3 = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
};

/** Rotate point p about the axis through a with unit direction d by angle (Rodrigues). */
export function rotateAbout(p, a, d, ang) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const r = v3.sub(p, a);
  const k = v3.cross(d, r);
  const dd = v3.dot(d, r) * (1 - c);
  return [a[0] + r[0] * c + k[0] * s + d[0] * dd, a[1] + r[1] * c + k[1] * s + d[1] * dd, a[2] + r[2] * c + k[2] * s + d[2] * dd];
}

/* ------------------------------------------------------------------ faces */

let faceSeq = 0;
export const newFace = (uv, P, extra = {}) => ({ id: `f${++faceSeq}`, uv, P, ...extra });

export function squarePaper(size = SIZE) {
  const h = size / 2;
  return {
    faces: [newFace([[0, 0], [size, 0], [size, size], [0, size]], [[-h, -h, 0], [h, -h, 0], [h, h, 0], [-h, h, 0]])],
    flat: true,
  };
}

export const cloneFace = (f) => ({ ...f, uv: f.uv.map((p) => p.slice()), P: f.P.map((p) => p.slice()) });
export const cloneState = (s) => ({ ...s, faces: s.faces.map(cloneFace) });

export const lineIntersect = (a, b, c, d) => {
  const r = [b[0] - a[0], b[1] - a[1]], q = [d[0] - c[0], d[1] - c[1]];
  const den = r[0] * q[1] - r[1] * q[0];
  const t = ((c[0] - a[0]) * q[1] - (c[1] - a[1]) * q[0]) / den;
  return [a[0] + r[0] * t, a[1] + r[1] * t];
};

export function centroid(f) {
  const n = f.P.length;
  const c = [0, 0, 0];
  for (const p of f.P) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }
  return [c[0] / n, c[1] / n, c[2] / n];
}

/** Signed distance of an xy point to the directed line p->q (left positive). */
export function side(p, q, x, y) {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  return (dx * (y - p[1]) - dy * (x - p[0])) / Math.hypot(dx, dy);
}

/** Split a face by the directed xy line p->q. Returns { pos, neg } (either may be null). */
export function splitFace(f, p, q, tol = 1e-4) {
  const n = f.P.length;
  const d = f.P.map((v) => side(p, q, v[0], v[1]));
  if (d.every((x) => x >= -tol)) return { pos: f, neg: null };
  if (d.every((x) => x <= tol)) return { pos: null, neg: f };
  const posP = [], posU = [], negP = [], negU = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = f.P[i], b = f.P[j], ua = f.uv[i], ub = f.uv[j];
    const di = d[i], dj = d[j];
    if (di >= -tol) { posP.push(a); posU.push(ua); }
    if (di <= tol) { negP.push(a); negU.push(ua); }
    if ((di > tol && dj < -tol) || (di < -tol && dj > tol)) {
      const s = di / (di - dj);
      const P = [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
      const U = [ua[0] + (ub[0] - ua[0]) * s, ua[1] + (ub[1] - ua[1]) * s];
      posP.push(P); posU.push(U); negP.push(P.slice()); negU.push(U.slice());
    }
  }
  const mk = (P, uv, suffix) => (P.length >= 3 ? { ...f, id: f.id + suffix, uv, P } : null);
  return { pos: mk(posP, posU, 'a'), neg: mk(negP, negU, 'b') };
}

export function splitAll(faces, p, q) {
  const out = [];
  for (const f of faces) {
    const { pos, neg } = splitFace(f, p, q);
    if (pos && neg) { out.push(pos, neg); } else out.push(pos || neg);
  }
  return out;
}

/* --------------------------------------------------------- overlap / layers */

function clipConvex(subject, clip) {
  // subject, clip: arrays of [x,y]; clip must be convex. Returns the clipped polygon.
  let area = 0;
  for (let i = 0; i < clip.length; i++) { const a = clip[i], b = clip[(i + 1) % clip.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sgn = area >= 0 ? 1 : -1;
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length];
    const inp = out; out = [];
    const sd = (p) => sgn * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]));
    for (let j = 0; j < inp.length; j++) {
      const p = inp[j], q = inp[(j + 1) % inp.length];
      const sp = sd(p), sq = sd(q);
      if (sp >= 0) out.push(p);
      if ((sp > 0 && sq < 0) || (sp < 0 && sq > 0)) {
        const s = sp / (sp - sq);
        out.push([p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s]);
      }
    }
  }
  return out;
}

const polyArea = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const u = p[i], w = p[(i + 1) % p.length]; a += u[0] * w[1] - w[0] * u[1]; } return Math.abs(a) / 2; };
const polyCentroid = (p) => { const c = [0, 0]; for (const v of p) { c[0] += v[0]; c[1] += v[1]; } return [c[0] / p.length, c[1] / p.length]; };

export function overlap(a, b) {
  // quick bbox reject
  let [ax0, ay0, ax1, ay1] = [1e9, 1e9, -1e9, -1e9];
  for (const p of a.P) { ax0 = Math.min(ax0, p[0]); ax1 = Math.max(ax1, p[0]); ay0 = Math.min(ay0, p[1]); ay1 = Math.max(ay1, p[1]); }
  let [bx0, by0, bx1, by1] = [1e9, 1e9, -1e9, -1e9];
  for (const p of b.P) { bx0 = Math.min(bx0, p[0]); bx1 = Math.max(bx1, p[0]); by0 = Math.min(by0, p[1]); by1 = Math.max(by1, p[1]); }
  if (ax1 < bx0 + 1e-3 || bx1 < ax0 + 1e-3 || ay1 < by0 + 1e-3 || by1 < ay0 + 1e-3) return null;
  const poly = clipConvex(a.P.map((p) => [p[0], p[1]]), b.P.map((p) => [p[0], p[1]]));
  if (poly.length < 3) return null;
  const area = polyArea(poly);
  if (area < 0.05) return null;
  return { area, c: polyCentroid(poly) };
}

function planeZ(f, x, y) {
  const [p0, p1, p2] = [f.P[0], f.P[1], f.P[2]];
  const u = v3.sub(p1, p0), w = v3.sub(p2, p0);
  const n = v3.cross(u, w);
  if (Math.abs(n[2]) < 1e-9) return (p0[2] + p1[2] + p2[2]) / 3;
  return p0[2] - (n[0] * (x - p0[0]) + n[1] * (y - p0[1])) / n[2];
}

/** Re-order the layers of a flat pile. `ref` supplies the pose used to decide who is above whom. */
export function layerFaces(faces, ref = faces) {
  const n = faces.length;
  const above = Array.from({ length: n }, () => []); // above[i] = faces that must lie above i
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const o = overlap(ref[i], ref[j]);
      if (!o) continue;
      const zi = planeZ(ref[i], o.c[0], o.c[1]);
      const zj = planeZ(ref[j], o.c[0], o.c[1]);
      if (Math.abs(zi - zj) < 1e-7) { // tie: keep the old order
        const a = faces[i].z ?? 0, b = faces[j].z ?? 0;
        if (a <= b) above[i].push(j); else above[j].push(i);
      } else if (zi < zj) above[i].push(j); else above[j].push(i);
    }
  }
  // longest path layering (iterative relaxation, protects against cycles)
  const layer = new Array(n).fill(0);
  for (let it = 0; it < n + 2; it++) {
    let changed = false;
    for (let i = 0; i < n; i++) for (const j of above[i]) if (layer[j] < layer[i] + 1) { layer[j] = layer[i] + 1; changed = true; }
    if (!changed) break;
  }
  const top = Math.max(0, ...layer);
  return layer.map((l) => (l - top / 2) * LAYER);
}

/* ------------------------------------------------------------------ motion */

const smooth = (x) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };

/** angle of a chain element at time t (0..1) */
export function chainAngle(c, t) {
  if (typeof c.angle === 'function') return c.angle(t);
  if (c.keys) { // keyframes of the fraction of c.angle: [[t, f], ...]
    const k = c.keys;
    if (t <= k[0][0]) return c.angle * k[0][1];
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i][0]) { const s = smooth((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])); return c.angle * (k[i - 1][1] + (k[i][1] - k[i - 1][1]) * s); }
    }
    return c.angle * k[k.length - 1][1];
  }
  const [t0, t1] = c.t || [0, 1];
  return c.angle * smooth((t - t0) / (t1 - t0));
}

/** Final rotation of a hinge element (to decide on flat results). */
export const chainFinal = (c) => (typeof c.angle === 'function' ? c.angle(1) : chainAngle(c, 1));

/**
 * Build an op. spec:
 *   splits: [[p,q], ...]  crease lines in the start frame (xy), faces are cut along them first
 *   moves:  [{ sel(face, h) -> bool, chain: [{ p, q, angle, t|keys, z }] }, ...]
 *   flip:   true  -> turn the whole model over (x -> -x, z -> -z)
 *   spin:   radians of a global rotation about z (end of the op)
 *   inside: faces moved here are tucked between the other layers (reverse fold)
 */
export function buildOp(state, spec) {
  const start = cloneState(state);
  let faces = start.faces;
  const zc0 = (f) => f.P.reduce((a, p) => a + p[2], 0) / f.P.length;
  const topOf = (list) => (f) => !list.some((g) => g !== f && zc0(g) > zc0(f) + 1e-6 && overlap(f, g));
  if (spec.markTop) {
    const isTop0 = topOf(faces);
    const first = new Set(faces.filter((f) => isTop0(f)).map((f) => f.id));
    const rest = faces.filter((f) => !first.has(f.id));
    const isTop1 = topOf(rest);
    const second = new Set(rest.filter((f) => isTop1(f)).map((f) => f.id));
    faces = faces.map((f) => (first.has(f.id) ? { ...f, tags: [...(f.tags || []), spec.markTop] } : second.has(f.id) && spec.markSecond ? { ...f, tags: [...(f.tags || []), spec.markSecond] } : f));
  }
  for (const sp of spec.splits || []) {
    const [p, q, filt] = sp;
    const isTop = topOf(faces);
    const out = [];
    for (const f of faces) {
      if (filt && !filt(f, { isTop })) { out.push(f); continue; }
      const { pos, neg } = splitFace(f, p, q);
      if (pos && neg) out.push(pos, neg); else out.push(pos || neg);
    }
    faces = out;
  }
  faces = faces.map(cloneFace);
  const zTop = Math.max(...faces.map((f) => Math.max(...f.P.map((p) => p[2]))));
  const zBot = Math.min(...faces.map((f) => Math.min(...f.P.map((p) => p[2]))));
  const helpers = { zTop, zBot, side, centroid, isTop: topOf(faces) };
  const chains = new Map(); // face id -> [element]
  const moved = new Set();
  for (const m of spec.moves || []) {
    const picked = faces.filter((f) => m.sel(f, helpers));
    for (const f of picked) {
      if (m.mark) f.tags = [...(f.tags || []), m.mark];
      if (!chains.has(f.id)) chains.set(f.id, []);
      for (const c of m.chain) {
        const el = { ...c };
        // pivot height: valley sweeps over the top of the pile, mountain below it
        const cen = centroid(f);
        const left = c.p ? side(c.p, c.q, cen[0], cen[1]) > 0 : true;
        const up = (chainFinal(c) > 0) === left;
        if (!c.p3) el.z = c.z ?? (up ? zTop : zBot);
        chains.get(f.id).push(el);
      }
      moved.add(f.id);
    }
  }
  const rot = (el, p, ang) => {
    if (el.p3) {
      const d3 = v3.sub(el.q3, el.p3);
      const l3 = v3.len(d3);
      return rotateAbout(p, el.p3, [d3[0] / l3, d3[1] / l3, d3[2] / l3], ang);
    }
    const a = [el.p[0], el.p[1], el.z];
    const d = [el.q[0] - el.p[0], el.q[1] - el.p[1], 0];
    const l = Math.hypot(d[0], d[1]);
    return rotateAbout(p, a, [d[0] / l, d[1] / l, 0], ang);
  };
  const globalAt = (t, P, g) => {
    if (!g) return P;
    let [x, y, z] = P;
    if (spec.flip) { const s = smooth(t); const a = Math.PI * s; const c = Math.cos(a), si = Math.sin(a); const nx = x * c + z * si; const nz = -x * si + z * c; x = nx; z = nz; }
    if (g.rot) { const s = smooth((t - g.t0) / (1 - g.t0)); const a = g.rot * s; const c = Math.cos(a), si = Math.sin(a); const nx = x * c - y * si; const ny = x * si + y * c; x = nx; y = ny; }
    if (g.shift) { const s = smooth((t - g.t0) / (1 - g.t0)); x += g.shift[0] * s; y += g.shift[1] * s; }
    if (g.tilt) { // stand the model up: rotate about the x axis through (0, y0, 0)
      const s = smooth((t - g.tilt.from) / (1 - g.tilt.from)); const a = g.tilt.angle * s; const c = Math.cos(a), si = Math.sin(a);
      const dy = y - g.tilt.y0; const ny = g.tilt.y0 + dy * c - z * si; const nz = dy * si + z * c; y = ny; z = nz + (g.tilt.lift || 0) * s;
    }
    return [x, y, z];
  };
  const op = {
    id: spec.id, title: spec.title, kind: spec.kind || 'fold', creases: spec.creases || [],
    start: faces, moved, spec, g: spec.tilt ? { tilt: spec.tilt } : null,
    pose(t, scale = 1) {
      if (spec.custom) {
        const Ps = spec.custom(t, faces);
        return faces.map((f, i) => ({ ...f, P: Ps[i].map((p) => globalAt(t, p, op.g)) }));
      }
      return faces.map((f) => {
        const ch = chains.get(f.id) || [];
        const P = f.P.map((p0) => {
          let p = p0;
          for (let i = ch.length - 1; i >= 0; i--) {
            const ang = chainAngle(ch[i], t);
            p = rot(ch[i], p, Math.abs(ang) > 2.5 ? ang * scale : ang);
          }
          return globalAt(t, p, op.g);
        });
        return { ...f, P };
      });
    },
  };
  // ---- end state
  if (spec.flip) {
    op.g = { flip: true, t0: 0 };
    // turning the model over is exact: x and z are mirrored, so the old layer order is reversed
    const end = op.pose(1).map((f) => ({ ...f, P: f.P.map(([x, y, z]) => [Math.abs(x) < 1e-9 ? 0 : x, y, Math.abs(z) < 1e-9 ? 0 : z]) }));
    op.end = { faces: end.map((f) => ({ ...f, z: f.P[0][2] })), flat: true };
    return op;
  }
  if (spec.flat === false) {
    op.end = { faces: op.pose(1).map((f) => ({ ...f, z: f.P[0][2] })), flat: false };
    op.endRaw = op.pose(1);
    op.free = true;
    return op;
  }
  const pre = op.pose(1);
  const ref = spec.settleT != null ? op.pose(spec.settleT) : op.pose(1, 1 - (spec.settle ?? 0.04));
  let layers;
  if (spec.layers) layers = spec.layers(pre, ref, faces, moved, helpers);
  else layers = layerFaces(pre.map((f, i) => ({ ...f, z: faces[i].P[0][2] })), ref);
  // global recentering (+ optional spin) so the camera framing stays stable
  const cx = (a) => [Math.min(...a), Math.max(...a)];
  let rotZ = spec.spin || 0;
  const rotated = pre.map((f) => f.P.map(([x, y]) => [x * Math.cos(rotZ) - y * Math.sin(rotZ), x * Math.sin(rotZ) + y * Math.cos(rotZ)]));
  const xs = rotated.flat().map((p) => p[0]), ys = rotated.flat().map((p) => p[1]);
  const shift = [-(cx(xs)[0] + cx(xs)[1]) / 2, -(cx(ys)[0] + cx(ys)[1]) / 2];
  if (spec.fixed) { shift[0] = 0; shift[1] = 0; }
  if (Math.abs(rotZ) > 1e-9 || Math.hypot(shift[0], shift[1]) > 1e-6) op.g = { rot: rotZ, shift, t0: spec.globalFrom ?? 0.6 };
  const end = op.pose(1).map((f, i) => ({ ...f, P: f.P.map(([x, y]) => [x, y, layers[i]]), z: layers[i] }));
  op.end = { faces: end, flat: spec.flat !== false };
  op.endRaw = op.pose(1);
  return op;
}

/** Positions at time t (0..1) of an op, with the layer heights of the end state blended in. */
export function poseOp(op, t) {
  const faces = op.pose(t);
  if (!op.end || op.spec.flip || op.free) return faces;
  return faces.map((f, i) => {
    const e = op.end.faces[i];
    const endRaw = op.endRaw[i];
    const s = smooth(t);
    // keep the hinge geometry, only blend the small layer offsets of the finished state
    return { ...f, P: f.P.map((p, k) => [p[0], p[1], p[2] + (e.P[k][2] - endRaw.P[k][2]) * s]) };
  });
}

/** Run a list of op specs on a paper; returns the baked ops. */
export function buildSequence(specs, paper = squarePaper()) {
  let state = paper;
  const ops = [];
  for (const spec of specs) {
    const s = typeof spec === 'function' ? spec(state) : spec;
    const op = buildOp(state, s);
    ops.push(op);
    state = op.end;
  }
  return ops;
}
