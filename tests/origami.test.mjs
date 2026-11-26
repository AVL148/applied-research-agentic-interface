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
      if (overlap(fs[i], fs[j])) assert.ok(Math.abs(fs[i].P[0][2] - fs[j].P[0][2]) > LAYER * 0.2, `${id}: faces ${i} and ${j}`);
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

test('the base shape and the bird base show the coloured side on the outside, front and back', () => {
  // a face shows its coloured side upwards when its paper coordinates and its position turn the same way
  const turn = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.sign(a); };
  const colouredUp = (f) => turn(f.P) === turn(f.uv);
  for (const id of ['collapse', 'petalB', 'narrowFR']) {
    const fs = ops[id].end.faces;
    const zs = fs.map((f) => f.P[0][2]);
    const topF = fs[zs.indexOf(Math.max(...zs))], botF = fs[zs.indexOf(Math.min(...zs))];
    assert.ok(colouredUp(topF), `${id}: the top shows colour`);
    assert.ok(!colouredUp(botF), `${id}: the bottom shows colour`);
  }
});

test('the finished crane is the folded paper itself: wings open, neck, head and tail standing up', () => {
  const faces = ops.finished.end.faces;
  for (const f of faces) for (const p of f.P) assert.ok(p.every(Number.isFinite));
  const ext = (sel, a) => { const v = faces.filter(sel).flatMap((f) => f.P.map((p) => p[a])); return [Math.min(...v), Math.max(...v)]; };
  const all = () => true, tag = (k) => (f) => (f.tags || []).includes(k);
  const [x0, x1] = ext(all, 0), [y0, y1] = ext(all, 1), [z0, z1] = ext(all, 2);
  assert.ok(x1 - x0 > 100, 'neck and tail spread');
  assert.ok(y1 - y0 > 90, 'wings spread');
  assert.ok(z1 - z0 > 40, 'standing up');
  const [, wz1] = ext(tag('wingT'), 2), [wy0] = ext(tag('wingT'), 1);
  assert.ok(wy0 < -20 && wz1 > 20, 'one wing sticks out to the front, a little upwards');
  assert.ok(ext(tag('neck'), 0)[0] < -40 && ext(tag('tail'), 0)[1] > 40, 'neck on one side, tail on the other');
  assert.ok(faces.length === ops.wings.start.length, 'same paper as the last fold step');
});

test('the legs are narrowed, then reverse-folded up into a neck on the left and a tail on the right, with a head', () => {
  const lowWidth = (faces) => { const v = faces.filter((f) => f.P.reduce((a, p) => a + p[1], 0) / f.P.length < 0).flatMap((f) => f.P).map((p) => p[0]); return Math.max(...v) - Math.min(...v); };
  assert.ok(lowWidth(ops.petalB.end.faces) > 60, 'bird base is wide at the legs');
  assert.ok(lowWidth(ops.narrowFR.end.faces) < 40, 'legs are narrow after the narrowing folds on both sides');
  const tagged = (f, k) => (f.tags || []).includes(k);
  const end = ops.revR.end.faces;
  const tip = (k) => end.filter((f) => tagged(f, k)).flatMap((f) => f.P).reduce((a, p) => (p[1] > a[1] ? p : a));
  assert.ok(tip('neck')[0] < -30 && tip('neck')[1] > 30, 'neck points up and to the left');
  assert.ok(tip('tail')[0] > 30 && tip('tail')[1] > 30, 'tail points up and to the right');
  // inside reverse fold: in the neck the layers of the front half stay above the layers of the back half
  const zOf = (k) => end.filter((f) => tagged(f, k)).map((f) => f.P[0][2]);
  assert.ok(Math.min(...zOf('neckT')) > Math.max(...zOf('neckB')), 'the neck lies between the two halves');
  // pre-creases unfold again
  for (const id of ['preL', 'preR', 'headPre']) {
    ops[id].end.faces.forEach((f, i) => f.P.forEach((p, k) => assert.ok(Math.hypot(p[0] - ops[id].start[i].P[k][0], p[1] - ops[id].start[i].P[k][1]) < 1e-6, `${id} unfolds`)));
  }
  const h = ops.head.end.faces.filter((f) => tagged(f, 'head')).flatMap((f) => f.P);
  assert.ok(h.length > 0 && Math.min(...h.map((p) => p[1])) < tip('neck')[1] - 25, 'the head bends down');
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
