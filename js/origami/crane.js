// The crane as a list of fold steps. All coordinates are in the paper frame of the START of each step
// (square of 160, centre at the origin). See engine.js for how a step moves the paper.
import { fanPose, fanCornerEnd } from './fan.js';
import { SIZE, buildSequence, squarePaper, side, centroid, lineIntersect } from './engine.js';

const H = SIZE / 2;
const PI = Math.PI;
const line = (a, b) => [a, b];

const sm = (x) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
const xy = (f) => centroid(f).slice(0, 2);


/* ---------- the preliminary base (diamond, closed top, open bottom) ---------- */
const HD = 40 * Math.SQRT2; // half diagonal of the 80x80 square stack
const T = [0, HD], B = [0, -HD], Lc = [-HD, 0], Rc = [HD, 0];
const KB = lineIntersect(B, [B[0] + Math.sin(PI / 8) * -1, B[1] + Math.cos(PI / 8)], T, Lc);
const KC = [-KB[0], KB[1]];
const yH = KB[1];
const top = (f, h) => h.isTop(f);

export function frontPetal(tag) {
  const mine = (f) => (f.tags || []).includes('layer' + tag);
  const is = (f, k) => (f.tags || []).includes(k + tag);
  const flap = (f) => is(f, 'kL') || is(f, 'kR');
  return [
    {
      id: 'kite' + tag, title: 'Fold both lower edges to the centre line (kite fold)', fixed: true,
      markTop: 'layer' + tag, markSecond: 'second' + tag,
      splits: [[B, KB, mine], [KC, B, mine]],
      moves: [
        { mark: 'kL' + tag, sel: (f) => mine(f) && side(B, KB, ...xy(f)) > 0, chain: [{ p: B, q: KB, angle: PI, t: [0.08, 0.9] }] },
        { mark: 'kR' + tag, sel: (f) => mine(f) && side(KC, B, ...xy(f)) > 0, chain: [{ p: KC, q: B, angle: PI, t: [0.08, 0.9] }] },
      ],
      creases: [{ kind: 'valley', a: B, b: KB }, { kind: 'valley', a: KC, b: B }],
    },
    {
      id: 'top' + tag, title: 'Fold the top point down and unfold', fixed: true,
      splits: [[KB, KC, (f) => mine(f) && !flap(f)]],
      moves: [{ sel: (f) => mine(f) && !flap(f) && side(KB, KC, ...xy(f)) > 0, chain: [{ p: KB, q: KC, angle: PI, keys: [[0, 0], [0.1, 0], [0.45, 1], [0.58, 1], [0.92, 0]] }] }],
      creases: [{ kind: 'valley', a: KB, b: KC }],
    },
    {
      id: 'unkite' + tag, title: 'Unfold the kite folds', fixed: true,
      moves: [
        { sel: (f) => is(f, 'kL'), chain: [{ p: B, q: KB, angle: -PI, t: [0.08, 0.9] }] },
        { sel: (f) => is(f, 'kR'), chain: [{ p: KC, q: B, angle: -PI, t: [0.08, 0.9] }] },
      ],
    },
    {
      id: 'petal' + tag, title: 'Petal fold: lift the bottom point, the sides fold in', fixed: true,
      splits: [[B, KB, (f) => is(f, 'second')], [KC, B, (f) => is(f, 'second')]],
      moves: [
        { mark: 'legL' + tag, sel: (f) => is(f, 'second') && side(B, KB, ...xy(f)) > 0, chain: [{ p: B, q: KB, angle: PI, t: [0.55, 0.95] }] },
        { mark: 'legR' + tag, sel: (f) => is(f, 'second') && side(KC, B, ...xy(f)) > 0, chain: [{ p: KC, q: B, angle: PI, t: [0.55, 0.95] }] },
        { mark: 'petal' + tag, sel: (f) => mine(f) && !flap(f) && side(KC, KB, ...xy(f)) > 0, chain: [{ p: KC, q: KB, angle: PI, t: [0.08, 0.92] }] },
        { mark: 'petal' + tag, sel: (f) => is(f, 'kL'), chain: [{ p: KC, q: KB, angle: PI, t: [0.08, 0.92] }, { p: B, q: KB, angle: -PI, t: [0.3, 0.95] }] },
        { mark: 'petal' + tag, sel: (f) => is(f, 'kR'), chain: [{ p: KC, q: KB, angle: PI, t: [0.08, 0.92] }, { p: KC, q: B, angle: -PI, t: [0.3, 0.95] }] },
      ],
    },
  ];
}

/* ---------- neck, tail, head and wings (free 3D poses, no longer flat) ---------- */
const BETA = 0.62; // how far the two legs swing apart
const YC = -22; // height of the reverse fold crease
const YHEAD = B[1] + 13;
const tagged = (f, k) => (f.tags || []).includes(k);
const below = (f) => centroid(f)[1] < yH;

/** crease through (0,y) at angle phi; oriented so the tip (below it) is on its left */
function tipCrease(y, phi) {
  const c = [0, y];
  const d = [Math.cos(phi), Math.sin(phi)];
  const p = [c[0] + d[0] * 70, c[1] + d[1] * 70];
  const q = [c[0] - d[0] * 70, c[1] - d[1] * 70];
  return side(p, q, 0, -80) > 0 ? [p, q] : [q, p];
}
const leg = (tag, sign) => {
  const own = (f) => tagged(f, 'second' + tag) && below(f);
  const c1 = tipCrease(YC, -sign * BETA);
  const c2 = tipCrease(YHEAD, -sign * BETA * 0 + 0);
  const ax = (c, z) => ({ p3: [c[0][0], c[0][1], z], q3: [c[1][0], c[1][1], z] });
  return {
    own, c1, c2,
    splits: [[c1[0], c1[1], own], [c2[0], c2[1], (f) => own(f) && side(c1[0], c1[1], ...xy(f)) > 0]],
    moves: [
      { sel: own, chain: [{ p3: [0, yH, 0], q3: [0, yH, 1], angle: sign * BETA, t: [0.0, 0.3] }] },
      { sel: (f) => own(f) && side(c1[0], c1[1], ...xy(f)) > 0, chain: [{ ...ax(c1, 1.2), angle: PI * 0.94, t: [0.3, 0.7] }] },
      ...(sign < 0 ? [{ sel: (f) => own(f) && side(c1[0], c1[1], ...xy(f)) > 0 && side(c2[0], c2[1], ...xy(f)) > 0, chain: [{ ...ax(c2, 1.2), angle: PI * 0.7, t: [0.72, 1] }] }] : []),
    ],
  };
};
const neck = leg('F', -1);
const tail = leg('B', 1);

export const STEPS = [
  {
    id: 'diagonals', title: 'Fold both diagonals and unfold',
    splits: [line([-H, -H], [H, H]), line([-H, H], [H, -H])],
    moves: [
      { sel: (f) => side([-H, -H], [H, H], ...xy(f)) > 0, chain: [{ p: [-H, -H], q: [H, H], angle: PI, keys: [[0, 0], [0.2, 0], [0.42, 1], [0.5, 0]] }] },
      { sel: (f) => side([-H, H], [H, -H], ...xy(f)) > 0, chain: [{ p: [-H, H], q: [H, -H], angle: PI, keys: [[0, 0], [0.55, 0], [0.74, 1], [0.95, 0]] }] },
    ],
    creases: [{ kind: 'valley', a: [-H, -H], b: [H, H] }, { kind: 'valley', a: [-H, H], b: [H, -H] }],
  },
  { id: 'flip', title: 'Turn the paper over', flip: true },
  {
    id: 'midlines', title: 'Fold the centre lines and unfold',
    splits: [line([0, -H], [0, H]), line([-H, 0], [H, 0])],
    moves: [
      { sel: (f) => side([0, -H], [0, H], ...xy(f)) > 0, chain: [{ p: [0, -H], q: [0, H], angle: PI, keys: [[0, 0], [0.2, 0], [0.42, 1], [0.5, 0]] }] },
      { sel: (f) => side([-H, 0], [H, 0], ...xy(f)) > 0, chain: [{ p: [-H, 0], q: [H, 0], angle: PI, keys: [[0, 0], [0.55, 0], [0.74, 1], [0.95, 0]] }] },
    ],
    creases: [{ kind: 'valley', a: [0, -H], b: [0, H] }, { kind: 'valley', a: [-H, 0], b: [H, 0] }],
  },
  {
    id: 'collapse', title: 'Collapse the square into the base shape', fixed: false, custom: fanPose,
    spin: -PI / 2 - Math.atan2(fanCornerEnd(H)[1], fanCornerEnd(H)[0]), globalFrom: 0.72, settleT: 0.975,
    creases: [
      { kind: 'valley', a: [0, -H], b: [0, H] }, { kind: 'valley', a: [-H, 0], b: [H, 0] },
      { kind: 'mountain', a: [-H, -H], b: [H, H] }, { kind: 'mountain', a: [-H, H], b: [H, -H] },
    ], creaseUntil: 0.08,
  },
  ...frontPetal('F'),
  { id: 'flipBird', title: 'Turn the model over', flip: true, fixed: true },
  ...frontPetal('B'),
  {
    id: 'legs', title: 'Reverse folds: neck and tail', fixed: true, flat: false,
    splits: [[KB, KC, (f) => tagged(f, 'secondF') || tagged(f, 'secondB')], ...neck.splits, ...tail.splits],
    moves: [...neck.moves, ...tail.moves],
  },
  {
    id: 'wings', title: 'Pull the wings apart', fixed: true, flat: false,
    moves: [
      { sel: (f) => tagged(f, 'petalF'), chain: [{ p3: [0, yH, 0], q3: [1, yH, 0], angle: 1.7, t: [0, 1] }] },
      { sel: (f) => tagged(f, 'petalB'), chain: [{ p3: [0, yH, 0], q3: [1, yH, 0], angle: -1.7, t: [0, 1] }] },
    ],
  },
];

export const buildCrane = () => buildSequence(STEPS, squarePaper());
