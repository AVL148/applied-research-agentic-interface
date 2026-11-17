// Which fold steps are played for which drawing. A clip = a list of segments of fold steps, or one still pose.
import { SIZE, buildSequence, squarePaper, side, centroid } from './engine.js';
import { buildCrane } from './crane.js';

const H = SIZE / 2;
const PI = Math.PI;
const xy = (f) => centroid(f).slice(0, 2);

let crane = null;
let basic = null;

/** Two small demonstration folds on a fresh square: a valley fold and a mountain fold. */
function buildBasic() {
  const line = [[-H, 0], [H, 0]];
  return buildSequence([
    {
      id: 'valley', title: 'Valley fold', creases: [{ kind: 'valley', a: line[0], b: line[1] }],
      moves: [{ sel: (f) => side(line[0], line[1], ...xy(f)) < 0, chain: [{ p: line[1], q: line[0], angle: PI, t: [0.05, 0.95] }] }],
    },
  ]).concat(buildSequence([
    {
      id: 'mountain', title: 'Mountain fold', creases: [{ kind: 'mountain', a: line[0], b: line[1] }],
      moves: [{ sel: (f) => side(line[0], line[1], ...xy(f)) < 0, chain: [{ p: line[1], q: line[0], angle: -PI, t: [0.05, 0.95] }] }],
    },
  ]));
}

export function getOps() {
  crane = crane || Object.fromEntries(buildCrane().map((o) => [o.id, o]));
  basic = basic || Object.fromEntries(buildBasic().map((o) => [o.id, o]));
  return { ...crane, ...basic };
}

const seg = (op, from = 0, to = 1, dur) => ({ op, from, to, dur });
const still = (op, t = 1) => ({ still: { op, t } });
const V = { az: 0, el: 1.12 };
const SIDE = { az: 0.55, el: 0.75 };

export const CLIPS = {
  // project plan
  'p1-paper': { ...still('diagonals', 0), cam: V },
  'p1-goal': { ...still('wings', 1), cam: { az: 0.6, el: 0.62 }, target: [0, 20, 0] },
  'p2-diagonals': { segs: [seg('diagonals')], cam: V },
  'p2-centre': { segs: [seg('flip'), seg('midlines')], cam: V },
  'p2-result': { ...still('midlines', 1), cam: V },
  'p3-collapse': { segs: [seg('foldV'), seg('foldH'), seg('turn', 0, 1, 1.4)], cam: V },
  'p3-base': { ...still('turn', 1), cam: { az: 0.35, el: 0.95 } },
  'p3-kite': { segs: [seg('kiteF')], cam: V },
  'p3-kite-done': { ...still('kiteF', 1), cam: V },
  'p4-top': { segs: [seg('topF', 0, 1, 2.2), seg('unkiteF', 0, 1, 1.6)], cam: V },
  'p4-petal': { segs: [seg('petalF', 0, 1, 3)], cam: { az: 0.35, el: 0.85 }, target: [0, 20, 0] },
  'p4-petal-done': { ...still('petalF', 1), cam: { az: 0.45, el: 0.9 }, target: [0, 20, 0] },
  'p4-bird': { segs: [seg('flipBird', 0, 1, 1.4), seg('kiteB', 0, 1, 1.6), seg('topB', 0, 1, 1.4), seg('unkiteB', 0, 1, 1.2), seg('petalB', 0, 1, 2.6)], cam: { az: 0.3, el: 0.9 }, target: [0, 20, 0] },
  'p4-bird-done': { ...still('petalB', 1), cam: { az: 0.45, el: 0.9 }, target: [0, 20, 0] },
  'p5-legs': { segs: [seg('legs', 0, 0.32, 2.2)], cam: { az: 0.2, el: 1.0 }, target: [0, 20, 0] },
  'p5-reverse': { segs: [seg('legs', 0.3, 0.72, 3)], cam: SIDE, target: [0, 20, 0] },
  'p6-head': { segs: [seg('legs', 0.7, 1, 2.2)], cam: SIDE, target: [0, 20, 0] },
  'p6-wings': { segs: [seg('wings', 0, 1, 3)], cam: { az: 0.7, el: 0.7 }, target: [0, 20, 0] },
  // techniques
  'tq-valley': { segs: [seg('valley', 0, 1, 2.6)], cam: { az: 0.1, el: 0.8 } },
  'tq-valley-start': { ...still('valley', 0), cam: V },
  'tq-valley-done': { ...still('valley', 1), cam: { az: 0.1, el: 0.8 } },
  'tq-mountain': { segs: [seg('mountain', 0, 1, 2.6)], cam: { az: 0.1, el: 0.8 } },
  'tq-mountain-start': { ...still('mountain', 0), cam: V },
  'tq-mountain-done': { ...still('mountain', 1), cam: { az: 0.1, el: 0.8 } },
  'tq-prelim': { segs: [seg('diagonals', 0, 1, 2.2), seg('flip', 0, 1, 1.2), seg('midlines', 0, 1, 2.2), seg('foldV', 0, 1, 1.8), seg('foldH', 0, 1, 1.8), seg('turn', 0, 1, 1.2)], cam: V },
  'tq-bird': { segs: [seg('kiteF', 0, 1, 1.8), seg('topF', 0, 1, 1.6), seg('unkiteF', 0, 1, 1.2), seg('petalF', 0, 1, 2.6), seg('flipBird', 0, 1, 1.2), seg('kiteB', 0, 1, 1.4), seg('topB', 0, 1, 1.2), seg('unkiteB', 0, 1, 1), seg('petalB', 0, 1, 2.4)], cam: { az: 0.3, el: 0.9 }, target: [0, 20, 0] },
  'tq-petal': { segs: [seg('topF', 0, 1, 1.6), seg('unkiteF', 0, 1, 1.2), seg('petalF', 0, 1, 3)], cam: { az: 0.3, el: 0.9 }, target: [0, 20, 0] },
  'tq-reverse': { segs: [seg('legs', 0, 0.72, 4)], cam: SIDE, target: [0, 20, 0] },
};

/** total duration in seconds of a clip */
export const isStill = (id) => !!CLIPS[id]?.still;
export const clipDuration = (c) => (c.segs ? c.segs.reduce((a, s) => a + (s.dur ?? 2.4) * (s.to - s.from), 0) : 0);

/** Pose of a clip at progress p (0..1). */
export function clipPose(poseOp, ops, c, p) {
  if (c.still) return { faces: poseOp(ops[c.still.op], c.still.t), op: ops[c.still.op], k: c.still.t };
  const total = clipDuration(c);
  let at = Math.min(Math.max(p, 0), 1) * total;
  for (const s of c.segs) {
    const d = (s.dur ?? 2.4) * (s.to - s.from);
    if (at <= d + 1e-9) { const k = d ? at / d : 1; return { faces: poseOp(ops[s.op], s.from + (s.to - s.from) * k), op: ops[s.op], k: s.from + (s.to - s.from) * k }; }
    at -= d;
  }
  const last = c.segs[c.segs.length - 1];
  return { faces: poseOp(ops[last.op], last.to), op: ops[last.op], k: last.to };
}
