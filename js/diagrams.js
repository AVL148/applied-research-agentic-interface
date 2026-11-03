// Kleine tekenbibliotheek voor vouwdiagrammen (SVG, geen afbeeldingen van internet nodig).
// Ruimte: 240 x 240. Conventies zoals in gewone origamidiagrammen:
//   valley fold  = streeplijn  - - - -
//   mountain fold = streep-punt-lijn  - . - .
//   pijl = bewegingsrichting
// Kleur: 'f' = gekleurde kant van het papier, 'b' = witte achterkant.

import { t } from './i18n.js';

const r1 = (n) => Math.round(n * 10) / 10;
const pts = (a) => a.map((p) => `${r1(p[0])},${r1(p[1])}`).join(' ');

export const poly = (points, side = 'f') => ({ k: 'poly', points, side });
export const valley = (a, b) => ({ k: 'line', a, b, style: 'valley' });
export const mountain = (a, b) => ({ k: 'line', a, b, style: 'mountain' });
export const crease = (a, b) => ({ k: 'line', a, b, style: 'crease' });
export const hidden = (a, b) => ({ k: 'line', a, b, style: 'hidden' });
export const edge = (a, b) => ({ k: 'line', a, b, style: 'edge' });
// bend: sideways bulge of the arrow in px (0 = straight)
export const arrow = (a, b, bend = 0) => ({ k: 'arrow', a, b, bend });
export const label = (text, x, y, anchor = 'middle') => ({ k: 'label', text, x, y, anchor });
export const dot = (p) => ({ k: 'dot', p });

/** Spiegel punt p in de lijn door a en b. Handig om omgevouwen delen exact te tekenen. */
export function reflect(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const fx = a[0] + t * dx;
  const fy = a[1] + t * dy;
  return [2 * fx - p[0], 2 * fy - p[1]];
}
export const reflectAll = (list, a, b) => list.map((p) => reflect(p, a, b));
/** Spiegel in de verticale middenlijn x = 120. */
export const mirror = (list) => list.map(([x, y]) => [240 - x, y]);

let uid = 0;

function renderShape(s, mid) {
  switch (s.k) {
    case 'poly':
      return `<polygon class="p-${s.side}" points="${pts(s.points)}"/>`;
    case 'line':
      return `<line class="l-${s.style}" x1="${r1(s.a[0])}" y1="${r1(s.a[1])}" x2="${r1(s.b[0])}" y2="${r1(s.b[1])}"/>`;
    case 'arrow': {
      const [x1, y1] = s.a;
      const [x2, y2] = s.b;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const cx = mx + (-(y2 - y1) / len) * s.bend;
      const cy = my + ((x2 - x1) / len) * s.bend;
      const d = s.bend ? `M${r1(x1)},${r1(y1)} Q${r1(cx)},${r1(cy)} ${r1(x2)},${r1(y2)}` : `M${r1(x1)},${r1(y1)} L${r1(x2)},${r1(y2)}`;
      return `<path class="arrow" d="${d}" marker-end="url(#${mid})"/>`;
    }
    case 'label':
      return `<text class="lbl" x="${r1(s.x)}" y="${r1(s.y)}" text-anchor="${s.anchor}">${String(s.text).replace(/[&<]/g, '')}</text>`;
    case 'dot':
      return `<circle class="dotm" cx="${r1(s.p[0])}" cy="${r1(s.p[1])}" r="3"/>`;
    default:
      return '';
  }
}

/** Zet een lijst vormen om in een inline SVG-tekening. */
export function drawing(shapes, alt = 'Vouwdiagram') {
  const mid = `ah${++uid}`;
  const body = shapes.map((s) => renderShape(s, mid)).join('');
  const safe = String(alt).replace(/[&<>"]/g, '');
  return `<svg class="dg" viewBox="0 0 240 240" role="img" aria-label="${safe}" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="${mid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="ahead"/></marker></defs>
${body}</svg>`;
}

/* ------------------------------------------------------------------
   Basisgeometrie van de kraanvogel (vierkant 40..200)
   ------------------------------------------------------------------ */
export const SQ = [[40, 40], [200, 40], [200, 200], [40, 200]];
export const DIAMOND = [[120, 40], [200, 120], [120, 200], [40, 120]];
// kite fold: de vouwlijn halveert de hoek bij punt a (120,200)
export const KB = [73.1, 86.9];
export const KC = [166.9, 86.9];
export const KM = [120, 86.9]; // waar de omgevouwen randen elkaar raken

/* ------------------------------------------------------------------
   Veelgebruikte frames (tekeningen), hergebruikt door technieken en projectstappen
   ------------------------------------------------------------------ */
export const FR = {
  square: (side = 'f') => [poly(SQ, side)],

  diagonalFold: () => [
    poly(SQ, 'f'),
    valley([40, 40], [200, 200]),
    arrow([62, 178], [178, 62], -30),
    label(t('valley fold'), 120, 228),
  ],

  diagonalsCreased: () => [
    poly(SQ, 'f'),
    crease([40, 40], [200, 200]),
    crease([200, 40], [40, 200]),
    label(t('both diagonals folded and unfolded'), 120, 228),
  ],

  flippedMidlines: () => [
    poly(SQ, 'b'),
    mountain([40, 40], [200, 200]),
    mountain([200, 40], [40, 200]),
    valley([120, 40], [120, 200]),
    valley([40, 120], [200, 120]),
    arrow([210, 120], [190, 120], 0),
    label(t('turned over: white side up'), 120, 228),
  ],

  allCreased: () => [
    poly(SQ, 'b'),
    crease([40, 40], [200, 200]),
    crease([200, 40], [40, 200]),
    crease([120, 40], [120, 200]),
    crease([40, 120], [200, 120]),
    label(t('8 creases in the paper'), 120, 228),
  ],

  collapse: () => [
    poly(SQ, 'b'),
    mountain([40, 40], [200, 200]),
    mountain([200, 40], [40, 200]),
    valley([120, 40], [120, 200]),
    valley([40, 120], [200, 120]),
    arrow([22, 120], [70, 120]),
    arrow([218, 120], [170, 120]),
    arrow([120, 22], [120, 70]),
    label(t('push the sides inwards'), 120, 232),
  ],

  prelimBase: () => [
    poly(DIAMOND, 'f'),
    crease([120, 40], [120, 200]),
    label(t('closed point'), 120, 30),
    label(t('open end (4 flaps)'), 120, 222),
  ],

  kiteLines: () => [
    poly(DIAMOND, 'f'),
    crease([120, 40], [120, 200]),
    valley([120, 200], KB),
    valley([120, 200], KC),
    arrow([80, 160], [117, 144], -8),
    arrow([160, 160], [123, 144], 8),
    label(t('fold the lower edges to the centre'), 120, 20),
  ],

  kite: () => [
    poly([[120, 40], KB, [120, 200], KC], 'f'),
    poly([[120, 200], KB, KM], 'b'),
    poly([[120, 200], KC, KM], 'b'),
    crease([120, 40], KM),
    crease(KM, [120, 200]),
    label(t('kite shape'), 120, 228),
  ],

  /* ---- Bird base (tekening volgt panelen 12–13 van de referentie) ---- */
  petalLines: () => [
    poly([[120, 40], KB, [120, 200], KC], 'f'),
    poly([[120, 200], KB, KM], 'b'),
    poly([[120, 200], KC, KM], 'b'),
    valley(KB, KC),
    arrow([120, 46], [120, 80], 0),
    label(t('fold the top point down and unfold'), 120, 228),
  ],

  petalLift: () => [
    poly([[120, 40], KB, [120, 200], KC], 'f'),
    crease(KB, KC),
    crease([120, 40], [120, 200]),
    arrow([120, 196], [120, 58], 0),
    arrow([66, 118], [96, 118]),
    arrow([174, 118], [144, 118]),
    label(t('lift the bottom point, the sides fold in'), 120, 228),
  ],

  birdBase: () => [
    poly([[120, 24], [168, 112], [120, 216], [72, 112]], 'f'),
    crease([120, 24], [120, 216]),
    crease([72, 112], [120, 216]),
    crease([168, 112], [120, 216]),
    label(t('bird base'), 120, 14),
  ],

  /* ---- Smalle vogelbasis (panelen 13–15) ---- */
  narrowLines: () => [
    poly([[120, 24], [168, 112], [120, 216], [72, 112]], 'f'),
    crease([120, 24], [120, 216]),
    valley([84, 92], [120, 216]),
    valley([156, 92], [120, 216]),
    arrow([86, 150], [111, 150]),
    arrow([154, 150], [129, 150]),
    label(t('side edges to the centre line'), 120, 14),
  ],

  narrow: () => [
    poly([[120, 24], [146, 100], [120, 216], [94, 100]], 'f'),
    crease([120, 24], [120, 216]),
    label(t('narrow shape'), 120, 14),
  ],

  /* ---- Reverse fold op een smalle punt: exacte spiegeling over de vouwlijn ---- */
  reverseSetup: () => [
    poly([[105, 40], [135, 40], [135, 200], [105, 200]], 'f'),
    crease([120, 40], [120, 200]),
    valley([100, 150], [140, 110]),
    arrow([120, 196], [92, 150], 16),
    label(t('fold line'), 170, 100, 'start'),
  ],

  reverseDone: (side = 'f') => {
    // onderste deel: (105,145),(105,200),(135,200),(135,115) gespiegeld in de lijn x + y = 250
    const a = [100, 150];
    const b = [140, 110];
    const lower = [[105, 145], [105, 200], [135, 200], [135, 115]];
    return [
      poly([[105, 40], [135, 40], [135, 115], [105, 145]], 'f'),
      poly(reflectAll(lower, a, b), side),
      crease([105, 145], [135, 115]),
      label(t('the point now faces the other way'), 120, 228),
    ];
  },
};
