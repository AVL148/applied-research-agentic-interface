// The crane as a list of fold steps. All coordinates are in the paper frame of the START of each step
// (square of 160, centre at the origin). See engine.js for how a step moves the paper.
import { fanPose } from './fan.js';
import { SIZE, buildSequence, squarePaper, side, centroid, lineIntersect, layerFaces } from './engine.js';

const H = SIZE / 2;
const PI = Math.PI;
const line = (a, b) => [a, b];

const xy = (f) => centroid(f).slice(0, 2);

/* ---------- the preliminary base (diamond, closed top, open bottom) ---------- */
const HD = 40 * Math.SQRT2; // half diagonal of the 80x80 square stack
const T = [0, HD], B = [0, -HD], Lc = [-HD, 0];
const KB = lineIntersect(B, [B[0] + Math.sin(PI / 8) * -1, B[1] + Math.cos(PI / 8)], T, Lc);
const KC = [-KB[0], KB[1]];
const yH = KB[1];

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

/* ---------- step 5 and 6: narrow the legs, reverse-fold them into neck and tail, head and wings ---------- */
// Measured from the reference animation (oru): the narrowing crease runs from the bottom point to the side
// edge above the old corner, the reverse folds start on the centre line a little below the corners, the head is
// the last 29 % of the neck and the wings fold down along the line between the two body corners.
const tagged = (f, k) => (f.tags || []).includes(k);
const TOPP = [0, 2 * yH - B[1]]; // top point of the bird base (the tips of the wings)
const NARROW = PI / 16; // the lower edge folds onto the centre line: the crease halves the 22.5 degree corner at the bottom
const C1L = lineIntersect(B, [B[0] - Math.sin(NARROW), B[1] + Math.cos(NARROW)], KB, TOPP);
const C1R = [-C1L[0], C1L[1]];
const REV = { y: 19.5, deg: 24.5 }; // reverse folds: crease from the centre line at this height, sloping down outwards
const N0 = [0, REV.y];
const HEAD = 0.29; // share of the neck (in height) that becomes the head
const WING_Y = C1L[1]; // the wings fold down along the line between the two body corners
const WING = (62 * PI) / 180; // how far the wings fold down: with the opened body they end just above horizontal, like the reference

/** the two halves of the bird base: B is folded first (and lies on top after turning over), F is the other one */
const half = (f, s) => tagged(f, 'layer' + s) || tagged(f, 'second' + s);
const onSide = (sgn) => (f) => sgn * centroid(f)[0] > 0;
const isLegDone = (f) => tagged(f, 'neck') || tagged(f, 'tail');

/** fold the lower edge of the top half (s) to the centre line, on the left (sgn -1) or right (sgn +1) */
function narrow(id, sgn, s) {
  const [p, q] = sgn < 0 ? [B, C1L] : [C1R, B]; // the strip to fold lies on the left of p->q
  const mine = (f) => half(f, s);
  return {
    id, title: 'Fold the lower edge to the centre line', fixed: true,
    splits: [[p, q, mine]],
    moves: [{ sel: (f) => mine(f) && side(p, q, ...xy(f)) > 0, chain: [{ p, q, angle: PI, t: [0.08, 0.92] }] }],
    creases: [{ kind: 'valley', a: B, b: sgn < 0 ? C1L : C1R }],
  };
}

/** crease of the reverse fold of the leg on side sgn, oriented so that the leg (tip B) lies on its left */
function revAxis(sgn) {
  const a = (REV.deg * PI) / 180;
  const far = [sgn * 90 * Math.cos(a), REV.y - 90 * Math.sin(a)];
  return side(N0, far, ...B) > 0 ? [N0, far] : [far, N0];
}
const revEdge = (sgn) => lineIntersect(...revAxis(sgn), B, sgn < 0 ? C1L : C1R); // where the crease meets the outer edge
const legOf = (sgn) => { const [p, q] = revAxis(sgn); return (f) => onSide(sgn)(f) && !isLegDone(f) && side(p, q, ...xy(f)) > 0; };

/** pre-crease: fold the whole leg up along the reverse-fold line and unfold it again (the hinge lies in the middle of
 *  the pile of the leg, so the thick pile turns about its own middle) */
function precrease(id, sgn) {
  return (state) => {
    const [p, q] = revAxis(sgn);
    const zl = state.faces.filter(legOf(sgn)).map((f) => f.P[0][2]);
    return {
      id, title: 'Pre-crease the leg', fixed: true,
      splits: [[p, q, onSide(sgn)]],
      moves: [{ sel: legOf(sgn), chain: [{ p, q, angle: PI * 0.98, keys: [[0, 0], [0.06, 0], [0.42, 1], [0.58, 1], [0.94, 0]], z: (Math.min(...zl) + Math.max(...zl)) / 2 }] }],
      creases: [{ kind: 'valley', a: N0, b: revEdge(sgn) }],
    };
  };
}

/** layer order after an inside reverse fold: the folded tip goes between the two halves it came from, each part of it
 *  turned around (its outside is now inside). Everything else keeps its order, the top half stays above the bottom half. */
const insideLayers = (top, tipT, tipB) => (pre, ref, faces) => {
  const z0 = faces.map((f) => f.P[0][2]);
  const zs = faces.map((f, i) => (tipT(f) ? 500 - z0[i] : tipB(f) ? -500 - z0[i] : top(f) ? 1000 + z0[i] : -1000 + z0[i]));
  return layerFaces(pre.map((f, i) => ({ ...f, z: z0[i] })), pre.map((f, i) => ({ ...f, P: f.P.map((v) => [v[0], v[1], zs[i]]) })));
};
const mean = (a) => a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);

/** inside reverse fold of a leg, shown like the reference: the top half of this side opens like a page over the centre
 *  line (taking the top half of the leg along), that half of the leg swings back to join the other half, together they
 *  fold up along the pre-crease, and the page closes again over them, so the tip ends up inside */
function reverseLeg(id, sgn, mark, s) {
  return (state) => {
    const [p, q] = revAxis(sgn);
    const leg = legOf(sgn);
    const top = (f) => half(f, s);
    const zTop = Math.max(...state.faces.flatMap((f) => f.P.map((v) => v[2])));
    const page = sgn < 0 ? [[0, -2 * H], [0, 2 * H]] : [[0, 2 * H], [0, -2 * H]]; // this side lies on the left
    const zT = state.faces.filter((f) => top(f) && leg(f)).map((f) => f.P[0][2]);
    const zB = state.faces.filter((f) => !top(f) && leg(f)).map((f) => f.P[0][2]);
    const mid = (Math.min(...zT) + Math.max(...zB)) / 2;
    const pageKeys = [[0, 0], [0.04, 0], [0.28, 1], [0.7, 1], [0.95, 0]];
    const backKeys = [[0, 0], [0.32, 0], [0.5, 1], [0.7, 1], [0.95, 0]]; // the leg half that went along comes back
    const pageEl = { p: page[0], q: page[1], angle: PI, keys: pageKeys, z: zTop };
    const backEl = { p: page[0], q: page[1], angle: -PI, keys: backKeys, z: zTop };
    return {
      id, title: 'Reverse fold', fixed: true,
      splits: [[p, q, onSide(sgn)]],
      moves: [
        { sel: (f) => top(f) && onSide(sgn)(f) && !leg(f), chain: [pageEl] },
        { mark: [mark, mark + 'T'], sel: (f) => top(f) && leg(f), chain: [pageEl, backEl, { p, q, angle: PI, keys: [[0, 0], [0.4, 0], [0.78, 1]], z: (mid + mean(zT)) / 2 }] },
        { mark: [mark, mark + 'B'], sel: (f) => !top(f) && leg(f), chain: [{ p, q, angle: PI, keys: [[0, 0], [0.34, 0], [0.74, 1]], z: (mid + mean(zB)) / 2 }] },
      ],
      layers: insideLayers(top, (f) => tagged(f, mark + 'T'), (f) => tagged(f, mark + 'B')),
      creases: [{ kind: 'valley', a: N0, b: revEdge(sgn) }],
      creaseUntil: 0.3,
    };
  };
}

/** the line of the head: horizontal, across the top part of the neck; the head lies on its left */
function headLine(state) {
  const tip = state.faces.filter((f) => tagged(f, 'neck')).flatMap((f) => f.P).reduce((a, v) => (v[1] > a[1] ? v : a));
  const y = tip[1] - HEAD * (tip[1] - REV.y);
  return [[-2 * H, y], [2 * H, y]];
}

/** pre-crease the head: fold the tip of the neck down and unfold */
function headPre(state) {
  const [p, q] = headLine(state);
  return {
    id: 'headPre', title: 'Pre-crease the head', fixed: true,
    splits: [[p, q, (f) => tagged(f, 'neck')]],
    moves: [{ sel: (f) => tagged(f, 'neck') && side(p, q, ...xy(f)) > 0, chain: [{ p, q, angle: PI * 0.97, keys: [[0, 0], [0.06, 0], [0.4, 1], [0.6, 1], [0.94, 0]], z: mean(state.faces.filter((f) => tagged(f, 'neck')).map((f) => f.P[0][2])) }] }],
    creases: [{ kind: 'valley', a: p, b: q }],
  };
}

/** reverse fold of the head, shown like the reference: the page opens, the neck swings back down, the head folds,
 *  the neck swings up again and the page closes over it */
function head(state) {
  const s = 'F'; // the half on top after the second narrowing
  const top = (f) => half(f, s);
  const [hp, hq] = headLine(state);
  const neck = (f) => tagged(f, 'neck');
  const hd = (f) => neck(f) && side(hp, hq, ...xy(f)) > 0;
  const [p, q] = revAxis(-1);
  const page = [[0, -2 * H], [0, 2 * H]];
  const pageEl = { p: page[0], q: page[1], angle: PI, keys: [[0, 0], [0.03, 0], [0.2, 1], [0.8, 1], [0.96, 0]] };
  const neckEl = { p, q, angle: -PI, keys: [[0, 0], [0.18, 0], [0.4, 1], [0.6, 1], [0.82, 0]] };
  const zh = mean(state.faces.filter((f) => neck(f)).map((f) => f.P[0][2]));
  const headEl = { p: hp, q: hq, angle: -PI, keys: [[0, 0], [0.42, 0], [0.58, 1]], z: zh };
  return {
    id: 'head', title: 'Reverse fold the head', fixed: true,
    splits: [[hp, hq, neck]],
    moves: [
      { sel: (f) => top(f) && onSide(-1)(f) && !neck(f), chain: [pageEl] },
      { sel: (f) => neck(f) && !hd(f), chain: [neckEl] },
      { mark: ['head', 'headT'], sel: (f) => top(f) && hd(f), chain: [neckEl, headEl] },
      { mark: ['head', 'headB'], sel: (f) => !top(f) && hd(f), chain: [neckEl, headEl] },
    ],
    layers: insideLayers(top, (f) => tagged(f, 'headT'), (f) => tagged(f, 'headB')),
    creases: [{ kind: 'valley', a: hp, b: hq }], creaseUntil: 0.2,
  };
}

const FEET = lineIntersect(...revAxis(-1), B, C1L)[1]; // height of the lowest points of the body (where neck and tail leave it)
const BELLY = (12 * PI) / 180; // the body opens a little at the top when the wings are pulled apart

/** stand the crane up on its feet, then fold the wings down on both sides until they stand out sideways; pulling them
 *  apart opens the body a little at the top (it stays closed at the feet, neck and tail stay in the middle) */
function wings() {
  const p = [-2 * H, WING_Y], q = [2 * H, WING_Y]; // faces above the line lie on its left
  const fp = [-2 * H, FEET], fq = [2 * H, FEET];
  const body = (f) => !isLegDone(f);
  const up = (f) => body(f) && side(p, q, ...xy(f)) > 0;
  const t = [0.42, 0.96];
  const open = (sgn) => ({ p: fp, q: fq, angle: sgn * BELLY, t, z: 0 });
  const wing = (sgn) => ({ p, q, angle: sgn * WING, t, z: 0 });
  return {
    id: 'wings', title: 'Fold the wings down', fixed: true, flat: false,
    splits: [[p, q, body]],
    moves: [
      { mark: 'wingT', sel: (f) => up(f) && half(f, 'F'), chain: [open(1), wing(1)] },
      { mark: 'wingB', sel: (f) => up(f) && half(f, 'B'), chain: [open(-1), wing(-1)] },
      { sel: (f) => body(f) && !up(f) && half(f, 'F'), chain: [open(1)] },
      { sel: (f) => body(f) && !up(f) && half(f, 'B'), chain: [open(-1)] },
    ],
    squeeze: { to: 0.45, t: [0, 0.4] },
    tilt: { angle: PI / 2, y0: FEET, from: 0.04, to: 0.46, lift: 0 }, // stand the crane up on its feet first
    creases: [{ kind: 'valley', a: p, b: q }], creaseUntil: 0.1,
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
  narrow('narrowBL', -1, 'B'),
  narrow('narrowBR', 1, 'B'),
  { id: 'flipN', title: 'Turn the model over', flip: true, fixed: true },
  narrow('narrowFL', -1, 'F'),
  narrow('narrowFR', 1, 'F'),
  precrease('preL', -1),
  precrease('preR', 1),
  reverseLeg('revL', -1, 'neck', 'F'),
  reverseLeg('revR', 1, 'tail', 'F'),
  headPre,
  head,
  wings(),
];

export const buildCrane = () => buildSequence(STEPS, squarePaper());
