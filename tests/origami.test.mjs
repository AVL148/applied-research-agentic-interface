import test from 'node:test';
import assert from 'node:assert/strict';
import { getOps, CLIPS, clipDuration, clipPose, isStill } from '../js/origami/clips.js';
import { poseOp, overlap, LAYER } from '../js/origami/engine.js';
import { GUIDES, PLANS } from '../js/guides.js';

const ops = getOps();
const key = (u) => u[0].toFixed(3) + ',' + u[1].toFixed(3);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

test('the paper stays rigid: every face keeps its edge lengths during every step', () => {
  for (const [id, op] of Object.entries(ops)) {
    for (const t of [0, 0.3, 0.6, 1]) {
      const faces = poseOp(op, t);
      faces.forEach((f, i) => {
        const base = op.start[i];
        for (let k = 0; k < f.P.length; k++) {
          const j = (k + 1) % f.P.length;
          assert.ok(Math.abs(dist(f.P[k], f.P[j]) - dist(base.P[k], base.P[j])) < 1.2, `${id} t=${t} face ${i}`);
        }
      });
    }
  }
});

test('the first folds (creases, base shape, valley and mountain) keep every hinge closed', () => {
  for (const id of ['diagonals', 'flip', 'midlines', 'collapse', 'valley', 'mountain']) {
    let worst = 0;
    for (const t of [0.2, 0.4, 0.5, 0.6, 0.8, 1]) {
      const map = new Map();
      poseOp(ops[id], t).forEach((f) => f.uv.forEach((u, i) => { const k = key(u); (map.get(k) || map.set(k, []).get(k)).push(f.P[i]); }));
      for (const pts of map.values()) for (let i = 1; i < pts.length; i++) worst = Math.max(worst, dist(pts[i], pts[0]));
    }
    assert.ok(worst < (id === 'collapse' ? 6 : 2.5), `${id} gap ${worst}`);
  }
});

test('flat results: faces that overlap never share a layer', () => {
  for (const [id, op] of Object.entries(ops)) {
    if (!op.end.flat) continue;
    const fs = op.end.faces;
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      if (overlap(fs[i], fs[j])) assert.ok(Math.abs(fs[i].P[0][2] - fs[j].P[0][2]) > LAYER * 0.5, `${id}: faces ${i} and ${j}`);
    }
  }
});

test('the preliminary base is a four-layer diamond and the bird base is narrow', () => {
  const ext = (faces, a) => { const v = faces.flatMap((f) => f.P.map((p) => p[a])); return Math.max(...v) - Math.min(...v); };
  const base = ops.collapse.end.faces;
  assert.ok(Math.abs(ext(base, 0) - 113.1) < 1, 'diamond width');
  assert.ok(Math.abs(ext(base, 1) - 113.1) < 1, 'diamond height');
  const bird = ops.petalB.end.faces;
  assert.ok(ext(bird, 0) < 70, 'bird base width');
  assert.ok(ext(bird, 1) > 150, 'bird base height');
});

test('every clip that is used by a plan or a technique exists and plays', () => {
  const frames = [...Object.values(PLANS).flat(), ...Object.values(GUIDES).flatMap((g) => g.steps || [])];
  const used = new Set(frames.filter((f) => f.clip).map((f) => f.clip));
  assert.ok(used.size >= 15);
  for (const id of used) {
    const c = CLIPS[id];
    assert.ok(c, `clip ${id} missing`);
    for (const p of [0, 0.5, 1]) {
      const r = clipPose(poseOp, ops, c, p);
      assert.ok(r.faces.length > 0);
      for (const f of r.faces) for (const pt of f.P) assert.ok(pt.every(Number.isFinite), `${id} p=${p}`);
    }
    assert.equal(isStill(id), !!c.still);
    if (!c.still) assert.ok(clipDuration(c) > 0);
  }
});

test('the collapse is rigid, ends flat in four layers and matches the base shape the later folds expect', () => {
  const end = ops.collapse.end.faces;
  const layers = new Set(end.map((f) => f.z.toFixed(2)));
  assert.ok(layers.size >= 4, 'at least four distinct layers');
  const at = (uvx, uvy) => end.flatMap((f) => f.uv.map((u, i) => (Math.abs(u[0] - uvx) < 1 && Math.abs(u[1] - uvy) < 1 ? f.P[i] : null)).filter(Boolean))[0];
  const centre = at(80, 80), corner = at(0, 0);
  assert.ok(Math.hypot(centre[0], centre[1] - 56.6) < 0.5, 'the centre of the paper is the closed top');
  assert.ok(Math.hypot(corner[0], corner[1] + 56.6) < 0.5, 'the corners meet at the open end');
});

test('the finished crane is a closed picture with wings, neck and tail', () => {
  const faces = ops.finished.end.faces;
  const xs = faces.flatMap((f) => f.P.map((p) => p[0])), ys = faces.flatMap((f) => f.P.map((p) => p[1]));
  assert.ok(Math.max(...xs) - Math.min(...xs) > 150, 'wings spread');
  assert.ok(Math.max(...ys) - Math.min(...ys) > 120, 'neck and tail');
  for (const f of faces) for (const p of f.P) assert.ok(p.every(Number.isFinite));
});

test('the legs are narrowed, then folded up and outwards into a neck on the right and a tail on the left', () => {
  const lowWidth = (faces) => { const v = faces.filter((f) => f.P.reduce((a, p) => a + p[1], 0) / f.P.length < 0).flatMap((f) => f.P).map((p) => p[0]); return Math.max(...v) - Math.min(...v); };
  assert.ok(lowWidth(ops.petalB.end.faces) > 60, 'bird base is wide at the legs');
  assert.ok(lowWidth(ops.narrowF.end.faces) < 40, 'legs are narrow after both narrowing folds');
  const end = ops.legs.end.faces;
  const tagged = (f, k) => (f.tags || []).includes(k);
  const tip = (k) => end.filter((f) => tagged(f, k)).flatMap((f) => f.P).reduce((a, p) => (p[1] > a[1] ? p : a));
  assert.ok(tip('neck')[0] > 30 && tip('neck')[1] > 30, 'neck points up and to the right');
  assert.ok(tip('tail')[0] < -30 && tip('tail')[1] > 30, 'tail points up and to the left');
  const h = ops.head.end.faces.filter((f) => tagged(f, 'head')).flatMap((f) => f.P);
  assert.ok(h.length > 0 && Math.max(...h.map((p) => p[0])) > tip('neck')[0] - 5, 'the head bends outwards');
});

test('the kite folds on both sides play as one clip', () => {
  const c = CLIPS['p3-kite-back'];
  assert.ok(c && clipDuration(c) > 3);
  for (const p of [0, 0.4, 0.7, 1]) assert.ok(clipPose(poseOp, ops, c, p).faces.length > 0);
});

test('every project step has at least one 3D clip, drawings stay as fallback', () => {
  for (const [n, frames] of Object.entries(PLANS)) {
    assert.ok(frames.some((f) => f.clip), `plan ${n} has no 3D clip`);
    for (const f of frames) assert.ok(f.shapes && f.shapes.length, `plan ${n} "${f.title}" lost its drawing`);
  }
});
