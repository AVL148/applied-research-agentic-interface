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

/* ---------- narrow legs, neck and tail, head and wings ---------- */
const tagged = (f, k) => (f.tags || []).includes(k);
const zc = (f) => f.P.reduce((a, p) => a + p[2], 0) / f.P.length;
const DW = (Math.abs(KB[0]) * (yH - B[1])) / ((yH - B[1]) + Math.hypot(KB[0], yH - B[1])); // where the lower edge lands on the centre line
const DL = [-DW, yH], DR = [DW, yH];
const REV = { s: 0.85, deg: -20 }; // where and how steeply the neck and tail are folded up
const HEAD_LEN = 12;

/** fold the lower edges of the top layers to the centre line (both sides) */
function narrow(id) {
  const low = (f) => zc(f) > 0.01 && centroid(f)[1] < yH - 0.5;
  return {
    id, title: 'Fold the lower edges to the centre line', fixed: true,
    splits: [[[-H, yH], [H, yH]], [B, DL, low], [DR, B, low]],
    moves: [
      { sel: (f) => low(f) && side(B, DL, ...xy(f)) > 0, chain: [{ p: B, q: DL, angle: PI, t: [0.08, 0.92] }] },
      { sel: (f) => low(f) && side(DR, B, ...xy(f)) > 0, chain: [{ p: DR, q: B, angle: PI, t: [0.08, 0.92] }] },
    ],
    creases: [{ kind: 'valley', a: B, b: DL }, { kind: 'valley', a: DR, b: B }],
  };
}

/** crease axis through point P with direction angle a, oriented so that `tip` lies on its left */
function axisFor(P, a, tip) {
  const e = [Math.cos(a), Math.sin(a)];
  const p = [P[0] - e[0] * 90, P[1] - e[1] * 90], q = [P[0] + e[0] * 90, P[1] + e[1] * 90];
  return side(p, q, tip[0], tip[1]) > 0 ? [p, q] : [q, p];
}
const edgeAt = (sgn, s) => [sgn * DW * s, B[1] + (yH - B[1]) * s];
const legFace = (sgn) => (f) => sgn * centroid(f)[0] > 0 && centroid(f)[1] < yH;

/** reverse folds: the right leg becomes the neck, the left leg the tail */
function legs() {
  const parts = [[1, 'neck', [0, 0.5]], [-1, 'tail', [0.45, 0.95]]].map(([sgn, mark, t]) => {
    const P = edgeAt(sgn, REV.s);
    const a = sgn > 0 ? (REV.deg * PI) / 180 : PI - (REV.deg * PI) / 180;
    const [p, q] = axisFor(P, a, B);
    const tipSide = (f) => legFace(sgn)(f) && side(p, q, ...xy(f)) > 0;
    return { sgn, mark, t, p, q, tipSide, leg: legFace(sgn), P };
  });
  return {
    id: 'legs', title: 'Reverse folds: neck and tail', fixed: true, flat: false,
    splits: parts.map((x) => [x.p, x.q, x.leg]),
    moves: parts.map((x) => ({ mark: x.mark, sel: x.tipSide, chain: [{ p3: [x.p[0], x.p[1], 0], q3: [x.q[0], x.q[1], 0], angle: PI * 0.98, t: x.t }] })),
  };
}

/** the small reverse fold at the tip of the neck makes the head */
function head(state) {
  const neck = state.faces.filter((f) => tagged(f, 'neck'));
  const P = edgeAt(1, REV.s);
  let tip = P, far = 0;
  for (const f of neck) for (const v of f.P) { const d = Math.hypot(v[0] - P[0], v[1] - P[1]); if (d > far) { far = d; tip = v; } }
  const dir = [(tip[0] - P[0]) / far, (tip[1] - P[1]) / far];
  const Hc = [tip[0] - dir[0] * HEAD_LEN, tip[1] - dir[1] * HEAD_LEN];
  const theta = Math.atan2(dir[1], dir[0]);
  const [p, q] = axisFor(Hc, (theta + (6 * PI) / 180) / 2, tip);
  const mine = (f) => tagged(f, 'neck');
  return {
    id: 'head', title: 'Fold the tip of the neck over (head)', fixed: true, flat: false,
    splits: [[p, q, mine]],
    moves: [{ mark: 'head', sel: (f) => mine(f) && side(p, q, ...xy(f)) > 0, chain: [{ p3: [p[0], p[1], 0], q3: [q[0], q[1], 0], angle: PI * 0.97, t: [0.05, 0.95] }] }],
  };
}

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
    fixed: true, settleT: 0.975,
    creases: [
      { kind: 'valley', a: [0, -H], b: [0, H] }, { kind: 'valley', a: [-H, 0], b: [H, 0] },
      { kind: 'mountain', a: [-H, -H], b: [H, H] }, { kind: 'mountain', a: [-H, H], b: [H, -H] },
    ], creaseUntil: 0.08,
  },
  ...frontPetal('F'),
  { id: 'flipBird', title: 'Turn the model over', flip: true, fixed: true },
  ...frontPetal('B'),
  narrow('narrowB'),
  { id: 'flipN', title: 'Turn the model over', flip: true, fixed: true },
  narrow('narrowF'),
  legs(),
  head,
  {
    id: 'wings', title: 'Pull the wings apart', fixed: true, flat: false,
    moves: [
      { sel: (f) => tagged(f, 'petalF'), chain: [{ p3: [0, yH, 0], q3: [1, yH, 0], angle: 1.7, t: [0, 1] }] },
      { sel: (f) => tagged(f, 'petalB'), chain: [{ p3: [0, yH, 0], q3: [1, yH, 0], angle: -1.7, t: [0, 1] }] },
    ],
  },
];

export const buildCrane = () => buildSequence(STEPS, squarePaper());
