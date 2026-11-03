// Step-by-step plans with drawings: per technique and for the crane itself.
// The drawings are drawn in code (diagrams.js) and follow standard origami diagram
// conventions and the order of the 19-panel reference diagram.

import {
  poly, valley, mountain, crease, edge, hidden, arrow, label, dot,
  FR, SQ, DIAMOND, KB, KC, KM,
} from './diagrams.js';
import { t } from './i18n.js';

/* ---------- Extra drawings that are only needed here ---------- */

const HALF = [[40, 40], [200, 40], [200, 120], [40, 120]];
const LEFT = [[40, 40], [120, 40], [120, 200], [40, 200]];

export const SHAPES = {
  // Valley fold: horizontal crease, the bottom comes UP OVER the front
  valleySetup: () => [poly(SQ, 'f'), valley([40, 120], [200, 120]), arrow([120, 196], [120, 132], 0), label(t('valley fold: dashed line'), 120, 228)],
  valleyMid: () => [
    poly(HALF, 'f'),
    poly([[40, 120], [200, 120], [188, 72], [52, 72]], 'b'),
    crease([40, 120], [200, 120]),
    arrow([120, 196], [120, 132], 0),
    label(t('the bottom edge lifts up and over the front'), 120, 228),
  ],
  valleyDone: () => [
    poly(HALF, 'f'),
    poly([[40, 46], [200, 46], [200, 120], [40, 120]], 'b'),
    label(t('the crease is at the bottom'), 120, 150),
    label(t('(the white back now covers the coloured side)'), 120, 166),
  ],
  valleySide: () => [
    edge([30, 90], [120, 150]), edge([120, 150], [210, 90]),
    dot([120, 150]),
    label(t('side view: the crease is a V (valley)'), 120, 200),
  ],

  // Mountain fold: vertical crease, the right half goes BEHIND the paper
  mountainSetup: () => [
    poly(SQ, 'f'),
    mountain([120, 40], [120, 200]),
    hidden([120, 40], [200, 40]), hidden([200, 40], [200, 200]), hidden([200, 200], [120, 200]),
    arrow([186, 120], [150, 120], 0),
    label(t('mountain fold: dash-dot line'), 120, 228),
  ],
  mountainMid: () => [
    poly(LEFT, 'f'),
    hidden([120, 40], [172, 54]), hidden([172, 54], [172, 186]), hidden([172, 186], [120, 200]),
    crease([120, 40], [120, 200]),
    arrow([200, 120], [156, 120], -10),
    label(t('the right half folds back, behind the paper'), 120, 228),
  ],
  mountainDone: () => [
    poly(LEFT, 'f'),
    hidden([120, 40], [200, 40]), hidden([40, 40], [120, 40]),
    crease([120, 40], [120, 200]),
    label(t('the ridge points away from you'), 120, 224),
    label(t('(the folded half is hidden behind)'), 120, 236),
  ],
  mountainSide: () => [
    edge([30, 150], [120, 90]), edge([120, 90], [210, 150]),
    dot([120, 90]),
    label(t('side view: the crease is a Λ (mountain)'), 120, 200),
  ],
  vmCompare: () => [
    edge([20, 80], [60, 120]), edge([60, 120], [100, 80]), dot([60, 120]),
    edge([140, 120], [180, 80]), edge([180, 80], [220, 120]), dot([180, 80]),
    label(t('valley'), 60, 150), label(t('mountain'), 180, 150),
    label(t('crease at the bottom: V'), 60, 168), label(t('crease at the top: Λ'), 180, 168),
    label(t('same crease, opposite direction'), 120, 212),
  ],

  // Squash fold: open a flap and press it flat
  squashStart: () => [
    poly([[120, 44], [168, 200], [72, 200]], 'f'),
    crease([120, 44], [120, 200]),
    arrow([112, 120], [84, 120]),
    arrow([128, 120], [156, 120]),
    label(t('open the flap along the centre line'), 120, 228),
  ],
  squashMid: () => [
    poly([[120, 80], [190, 140], [120, 200], [50, 140]], 'f'),
    crease([120, 80], [120, 200]),
    arrow([120, 40], [120, 70]),
    label(t('press the top point down'), 120, 228),
  ],
  squashDone: () => [
    poly([[120, 60], [190, 130], [120, 200], [50, 130]], 'f'),
    crease([120, 60], [120, 200]),
    crease([50, 130], [190, 130]),
    label(t('pressed flat: a new diamond'), 120, 228),
  ],

  // Sink fold: push a point inside the model
  sinkSetup: () => [
    poly(DIAMOND, 'f'),
    valley([96, 78], [144, 78]),
    arrow([120, 44], [120, 72]),
    label(t('fold the point down and unfold'), 120, 228),
  ],
  sinkMid: () => [
    poly(DIAMOND, 'f'),
    crease([96, 78], [144, 78]),
    arrow([120, 30], [120, 90], 0),
    label(t('push the point inside (folds reverse)'), 120, 228),
  ],
  sinkDone: () => [
    poly(DIAMOND, 'f'),
    poly([[96, 78], [144, 78], [120, 104]], 'b'),
    label(t('the point has sunk inside'), 120, 228),
  ],

  // Crane: neck and tail (reverse folds), head and wings
  legsLines: () => [
    poly([[120, 24], [146, 100], [120, 216], [94, 100]], 'f'),
    crease([120, 24], [120, 216]),
    valley([92, 164], [124, 136]),
    arrow([112, 200], [92, 158], 12),
    label(t('neck and tail: reverse fold'), 120, 14),
  ],
  neckTail: () => {
    const body = [[120, 76], [152, 150], [120, 200], [88, 150]];
    return [
      poly([[88, 150], [96, 112], [52, 62], [44, 74]], 'f'),
      poly([[152, 150], [144, 112], [188, 62], [196, 74]], 'f'),
      poly(body, 'f'),
      crease([120, 76], [120, 200]),
      label(t('neck and tail point upwards'), 120, 228),
    ];
  },
  head: () => {
    const neck = [[152, 150], [144, 112], [188, 62], [196, 74]];
    return [
      poly([[88, 150], [96, 112], [52, 62], [44, 74]], 'f'),
      poly(neck, 'f'),
      poly([[120, 76], [152, 150], [120, 200], [88, 150]], 'f'),
      crease([120, 76], [120, 200]),
      valley([180, 70], [198, 58]),
      arrow([190, 40], [190, 56]),
      label(t('head: small reverse fold'), 120, 228),
    ];
  },
  wingsOpen: () => [
    poly([[120, 120], [44, 70], [112, 156]], 'f'),
    poly([[120, 120], [196, 70], [128, 156]], 'f'),
    poly([[120, 112], [150, 160], [120, 206], [90, 160]], 'f'),
    arrow([70, 100], [48, 80]),
    arrow([170, 100], [192, 80]),
    label(t('gently pull the wings apart'), 120, 228),
  ],
  crane: () => [
    poly([[40, 66], [64, 96], [88, 150], [66, 150]], 'f'),
    poly([[88, 150], [120, 62], [154, 150], [150, 192], [92, 192]], 'f'),
    crease([120, 62], [120, 192]),
    crease([92, 150], [120, 192]),
    crease([148, 150], [120, 192]),
    poly([[148, 150], [160, 98], [170, 64], [178, 68], [172, 104], [158, 150]], 'f'),
    poly([[170, 64], [208, 76], [176, 70]], 'f'),
    label(t('done: the crane'), 120, 224),
  ],

  // Research: comparing with the reference
  compare: () => [
    poly([[56, 54], [90, 124], [56, 194], [22, 124]], 'f'),
    poly([[184, 54], [218, 124], [190, 194], [150, 130]], 'f'),
    label(t('reference'), 56, 36), label(t('your model'), 184, 36),
    arrow([112, 124], [130, 124]),
    label(t('difference?'), 120, 214),
  ],
  frames: () => [
    poly([[20, 40], [100, 40], [100, 100], [20, 100]], 'b'),
    poly([[140, 40], [220, 40], [220, 100], [140, 100]], 'b'),
    poly([[20, 130], [100, 130], [100, 190], [20, 190]], 'b'),
    poly([[140, 130], [220, 130], [220, 190], [140, 190]], 'b'),
    poly([[60, 52], [76, 88], [60, 94], [44, 88]], 'f'),
    poly([[180, 50], [204, 80], [180, 96], [156, 80]], 'f'),
    poly([[60, 140], [88, 176], [60, 184], [32, 176]], 'f'),
    poly([[180, 138], [210, 166], [180, 186], [150, 166]], 'f'),
    label(t('0:10'), 60, 34), label(t('0:25'), 180, 34), label(t('0:40'), 60, 124), label(t('0:55'), 180, 124),
    label(t('single frames from the video'), 120, 220),
  ],
  symmetry: () => [
    poly([[120, 40], [190, 120], [120, 200], [56, 120]], 'f'),
    mountain([120, 20], [120, 220]),
    arrow([120, 120], [66, 120]),
    arrow([120, 120], [182, 120]),
    label(t('axis'), 128, 28, 'start'),
    label(t('left = right?'), 120, 234),
  ],
};

/* ---------- Step-by-step plans per technique ---------- */

const SRC = {
  zen: { title: t('Zenfolds – Basics of Origami: Folding Techniques'), url: 'https://zenfolds.com/origami/basic-techniques' },
  vm: { title: t('Origami-Instructions – Valley and Mountain Folds'), url: 'http://origami-instructions.com/origami-valley-and-mountain-folds.html' },
  prelim: { title: t('Origami Resource Center – Preliminary Base'), url: 'https://origami-resource-center.com/preliminary-base/' },
  make: { title: t('Make-Origami – Preliminary Base'), url: 'https://make-origami.com/preliminary-base' },
  guide: { title: t('Origami.guide – Mountain and valley folds'), url: 'https://origami.guide/beginner-origami/origami-folding-techniques/origami-mountain-valley-folds/' },
};

export const GUIDES = {
  t1: {
    goal: t('The paper folds towards you, so the crease ends up at the bottom and forms a V.'),
    needs: [t('A square sheet of paper'), t('A flat, smooth surface'), t('A fingernail or bone folder to press the crease')],
    steps: [
      { title: t('Find the fold line'), text: t('A dashed line (- - - -) in a diagram always means a valley fold. Lay the paper with the coloured side up and take hold of the bottom edge.'), shapes: SHAPES.valleySetup(), tip: t('Lay the edges together first without pressing. Only make the crease when everything lines up.') },
      { title: t('Bring the edge up and over'), text: t('Lift the bottom edge and lay it exactly on the top edge, in front of the paper. Corners on corners, edges on edges.'), shapes: SHAPES.valleyMid() },
      { title: t('Sharpen the crease'), text: t('Start in the middle and stroke outwards with your thumb. A sharp crease matters more than lots of force.'), shapes: SHAPES.valleyDone() },
      { title: t('Check in side view'), text: t('Open the fold a little: the paper forms a V. If you see a Λ instead, you have made a mountain fold.'), shapes: SHAPES.valleySide() },
      { title: t('Valley or mountain?'), text: t('The same crease can be a valley or a mountain: it depends on which way the paper moves. For a valley the crease points down and the paper folds towards you.'), shapes: SHAPES.vmCompare() },
    ],
    mistakes: [t('Folding first and lining up afterwards: the crease ends up crooked.'), t('Not stroking the crease outwards from the middle: a bulge stays in the paper.'), t('Mixing up valley and mountain folds. Look at the line type in the diagram.')],
    sources: [SRC.vm, SRC.guide],
  },
  t2: {
    goal: t('The paper folds away from you, behind itself, so the crease forms a ridge (Λ).'),
    needs: [t('A square sheet of paper'), t('A flat, smooth surface')],
    steps: [
      { title: t('Recognise the mountain fold'), text: t('A dash-dot line (- · - ·) means mountain fold. Here the fold line is vertical: the right half is going to disappear behind the left half.'), shapes: SHAPES.mountainSetup() },
      { title: t('Fold it backwards'), text: t('Hold the paper and fold the right half backwards, behind the paper. Line up the edges neatly behind the model.'), shapes: SHAPES.mountainMid() },
      { title: t('Press the crease'), text: t('Stroke the crease from the middle outwards while you keep the paper flat on the table. The coloured side stays in front.'), shapes: SHAPES.mountainDone() },
      { title: t('Check in side view'), text: t('Open the fold a little: the paper forms a Λ. If you see a V instead, you have made a valley fold.'), shapes: SHAPES.mountainSide() },
      { title: t('Valley or mountain?'), text: t('A mountain is the mirror image of a valley: the crease points up, towards you, and the paper folds away from you.'), shapes: SHAPES.vmCompare() },
    ],
    mistakes: [t('Finding the mountain fold hard? Turn the paper over, make a valley fold and turn it back (tip from the source).'), t('Folding too fast so the back does not line up neatly.')],
    sources: [SRC.vm, SRC.guide],
  },
  t3: {
    goal: t('Turn a narrow point inside out so it points a different way. This is how the neck, tail and head of the crane are made.'),
    needs: [t('A narrow folded point (as on the crane)'), t('A sharp pre-crease')],
    steps: [
      { title: t('Make a pre-crease first'), text: t('Fold the point up along the chosen line (valley fold) and press the crease sharp. Unfold again.'), shapes: FR.reverseSetup(), tip: t('Make the crease at an angle: the angle decides the direction of the neck and tail.') },
      { title: t('Open the layers'), text: t('Push the point upwards and let the two sides of the point open slightly. The crease becomes a mountain fold on the inside.'), shapes: [...FR.reverseSetup(), arrow([140, 100], [120, 124], -10)] },
      { title: t('Push the point inside'), text: t('Push the point between the two layers, inwards. Flatten everything and press both creases sharp.'), shapes: FR.reverseDone() },
      { title: t('Outside reverse fold'), text: t('With an outside reverse fold you wrap the point around the outside of the model instead: same pre-crease, but the point goes over the model rather than into it. You then see the white back.'), shapes: FR.reverseDone('b') },
    ],
    mistakes: [t('Turning without a pre-crease: the paper tears or crumples.'), t('Making the pre-crease too far from the point: neck and tail get too long.'), t('Not flattening before you press the crease.')],
    sources: [SRC.zen],
  },
  t4: {
    goal: t('The bird base is the shape the crane begins with: a narrow diamond with two long points up and two points down.'),
    needs: [t('A square sheet (coloured side up)'), t('A prepared base shape (preliminary base)')],
    steps: [
      { title: t('Start with the base shape'), text: t('First fold the base shape (preliminary base): see the technique "Preliminary base". The open end faces you.'), shapes: FR.prelimBase() },
      { title: t('Kite fold'), text: t('Fold the two lower edges of the top layer to the centre line (valley folds). This makes a kite.'), shapes: FR.kiteLines() },
      { title: t('The kite'), text: t('The folded flaps show the white back. The creases lie exactly on the centre line.'), shapes: FR.kite() },
      { title: t('Petal fold'), text: t('Fold the top point down, unfold, lift the bottom point and let the sides fold in (see "Petal fold").'), shapes: FR.petalLift() },
      { title: t('Repeat on the back'), text: t('Turn the model over and do the kite fold and petal fold again. You now have a bird base.'), shapes: FR.birdBase() },
    ],
    mistakes: [t('Not laying the kite fold exactly against the centre line: the bird base ends up crooked.'), t('Forgetting to repeat on the back.'), t('Not pressing the model flat before you continue.')],
    sources: [SRC.prelim, SRC.make, SRC.zen],
  },
  t5: {
    goal: t('Open a flap and press it flat into a diamond. This happens mainly in the base shapes of the crane.'),
    needs: [t('A flap with a centre line'), t('Sharp pre-creases')],
    steps: [
      { title: t('Get the flap ready'), text: t('Lift the flap a little. If the creases are sharp enough, you can open it along the centre line.'), shapes: SHAPES.squashStart() },
      { title: t('Open and press down'), text: t('Press the top point down and let the sides move apart.'), shapes: SHAPES.squashMid() },
      { title: t('Press flat'), text: t('Flatten everything. The centre line is now the axis of symmetry of a new diamond.'), shapes: SHAPES.squashDone() },
    ],
    mistakes: [t('Not pre-creasing, so the diamond ends up crooked.'), t('Pressing too hard before the creases are in place.')],
    sources: [SRC.zen],
  },
  t6: {
    goal: t('Make a long, narrow shape (petal) from a kite. This fold is needed for the bird base of the crane.'),
    needs: [t('A kite (kite fold done)'), t('Sharp pre-creases')],
    steps: [
      { title: t('Start with the kite'), text: t('Make sure the kite lies flat and the flaps lie on the centre line.'), shapes: FR.kite() },
      { title: t('Make the pre-creases'), text: t('Fold the top point down along the line between the two side points and unfold again. This is your pre-crease.'), shapes: FR.petalLines() },
      { title: t('Lift the bottom point'), text: t('Take the lowest point of the top layer and lift it up. The sides fold towards the centre line by themselves.'), shapes: FR.petalLift() },
      { title: t('Press it flat'), text: t('Press everything flat. On this side you now have a long, narrow shape. Repeat on the back.'), shapes: FR.birdBase() },
    ],
    mistakes: [t('Skipping the pre-creases: the paper will not move by itself.'), t('Pulling on both sides at the same time instead of lifting upwards.'), t('Forgetting to repeat on the back.')],
    sources: [SRC.zen],
  },
  t7: {
    goal: t('Let a point sink into the model so it disappears inside.'),
    needs: [t('A model with a point'), t('Sharp pre-creases')],
    steps: [
      { title: t('Make a pre-crease'), text: t('Fold the point down along the line where it should sink and unfold again.'), shapes: SHAPES.sinkSetup() },
      { title: t('Let the point sink'), text: t('Push the point inwards. The creases reverse (mountain becomes valley, valley becomes mountain).'), shapes: SHAPES.sinkMid() },
      { title: t('Press it flat'), text: t('Flatten everything. The point is now inside.'), shapes: SHAPES.sinkDone() },
    ],
    mistakes: [t('Not pre-creased sharply enough: the point stays half up.'), t('Forcing it while the creases are not reversing yet.')],
    sources: [SRC.zen],
  },
  t8: {
    goal: t('Hold every folding step next to the reference and make deviations visible before you fold on.'),
    needs: [t('Reference video or reference diagram'), t('Your model after each step')],
    steps: [
      { title: t('Choose a checkpoint'), text: t('Pause the video at the end of the step, or look at the diagram of that step.'), shapes: SHAPES.frames() },
      { title: t('Hold model and reference side by side'), text: t('Check three things: shape, angles and fold direction (mountain or valley).'), shapes: SHAPES.compare() },
      { title: t('Write down the difference'), text: t('Write one sentence: what deviates, and in which step did it start?'), shapes: SHAPES.symmetry() },
    ],
    mistakes: [t('Only comparing at the end: mistakes from early steps can no longer be repaired by then.'), t('Looking only at the shape, not at the fold direction.')],
    sources: [],
  },
  t9: {
    goal: t('Let an AI look at single frames from your video to see which step starts where.'),
    needs: [t('An uploaded video'), t('An AI connection (optional)')],
    steps: [
      { title: t('Upload the video'), text: t('Go to Video analysis and choose your video. The video stays in your own browser.'), shapes: SHAPES.frames() },
      { title: t('Let 10 frames be analysed'), text: t('The browser takes 10 single frames from the video. The AI describes only what it sees on them and marks uncertain parts.'), shapes: SHAPES.frames() },
      { title: t('Check the suggested segments'), text: t('Adjust the link to steps where needed and confirm only afterwards. Nothing counts without your confirmation.'), shapes: SHAPES.compare() },
    ],
    mistakes: [t('Accepting the AI suggestions blindly: it sees single frames, not movement.'), t('Using a dark or blurry video.')],
    sources: [],
  },
  t10: {
    goal: t('Judge the final result on a fixed checklist, so the outcomes stay comparable between the trial with the video and the trial with the interface.'),
    needs: [t('A finished crane'), t('A reference photo or video')],
    steps: [
      { title: t('Look at symmetry'), text: t('Hold the crane straight in front of you and check that both wings are the same size.'), shapes: SHAPES.symmetry() },
      { title: t('Compare with the reference'), text: t('Put the crane next to the reference: look at the wing angle, neck and beak.'), shapes: SHAPES.compare() },
      { title: t('Write down your score'), text: t('Give each part a score from 1 to 5 and write down one improvement for the next round.'), shapes: SHAPES.crane() },
    ],
    mistakes: [t('Using different criteria in the two trials.'), t('Only deciding afterwards what to look at.')],
    sources: [],
  },
  t11: {
    goal: t('The base shape many traditional models start from, including the crane. The paper becomes a smaller square with four flaps.'),
    needs: [t('A square sheet, coloured side up')],
    steps: [
      { title: t('Fold the diagonals'), text: t('Coloured side up. Fold both diagonals and unfold them. You get an X.'), shapes: FR.diagonalFold() },
      { title: t('Turn over and fold the centre lines'), text: t('White side up. Fold the paper left onto right and top onto bottom, unfolding each time.'), shapes: FR.flippedMidlines() },
      { title: t('All creases are in'), text: t('You now have two lines through the middle and two diagonals. This lets the paper collapse by itself.'), shapes: FR.allCreased() },
      { title: t('Push the sides inwards'), text: t('Push the left and right edges towards each other while the top sinks down. The diagonals become mountain folds, the centre lines valley folds.'), shapes: FR.collapse() },
      { title: t('Press flat'), text: t('You are left with a square with four flaps and an open end. This is where the crane begins.'), shapes: FR.prelimBase() },
    ],
    mistakes: [t('Not folding all the diagonals and centre lines: the model will not collapse by itself.'), t('Accidentally starting with the wrong side up: the colour ends up inside.'), t('Holding the open end up instead of facing you.')],
    sources: [SRC.prelim, SRC.make],
  },
};

/* ---------- Step-by-step plan of the project (crane) ---------- */

export const PLANS = {
  1: [
    { title: t('Lay out the paper'), text: t('Square sheet, coloured side up, fixed direction. In this drawing the coloured area is the outside of the bird.'), shapes: FR.square('f') },
    { title: t('Goal'), text: t('This is what the finished shape looks like.'), shapes: SHAPES.crane() },
  ],
  2: [
    { title: t('Diagonals'), text: t('Fold both diagonals and unfold.'), shapes: FR.diagonalFold() },
    { title: t('Turn over, centre lines'), text: t('White side up: fold left onto right and top onto bottom, unfolding each time.'), shapes: FR.flippedMidlines() },
    { title: t('Result'), text: t('You have 8 creases. Check that they run straight through the centre.'), shapes: FR.allCreased() },
  ],
  3: [
    { title: t('Collapse into the base shape'), text: t('Push the sides inwards: the centre lines become valley folds.'), shapes: FR.collapse() },
    { title: t('Base shape'), text: t('Open end towards you.'), shapes: FR.prelimBase() },
    { title: t('Kite fold'), text: t('Fold the lower edges to the centre line: valley folds on both sides.'), shapes: FR.kiteLines() },
    { title: t('Result'), text: t('A kite. Turn over and repeat.'), shapes: FR.kite() },
  ],
  4: [
    { title: t('Top point down'), text: t('Pre-crease: fold the top point down and unfold.'), shapes: FR.petalLines() },
    { title: t('Petal fold'), text: t('Lift the bottom point; the sides fold inwards (mountain folds along the centre line).'), shapes: FR.petalLift() },
    { title: t('Bird base'), text: t('Repeat on the back.'), shapes: FR.birdBase() },
  ],
  5: [
    { title: t('Make it narrow'), text: t('Fold the lower edges to the centre line.'), shapes: FR.narrowLines() },
    { title: t('Narrow shape'), text: t('Turn over and repeat.'), shapes: FR.narrow() },
    { title: t('Reverse folds'), text: t('Make an angled pre-crease at both lower points.'), shapes: SHAPES.legsLines() },
    { title: t('Neck and tail'), text: t('Push both points inwards: one becomes the neck, the other the tail.'), shapes: SHAPES.neckTail() },
  ],
  6: [
    { title: t('Head'), text: t('Fold the tip of the neck over with a small reverse fold.'), shapes: SHAPES.head() },
    { title: t('Wings apart'), text: t('Slowly pull the wings down until they are horizontal and check that left and right are the same.'), shapes: SHAPES.wingsOpen() },
    { title: t('Inflate it'), text: t('Gently pull the wings outwards and press the belly out.'), shapes: SHAPES.crane() },
  ],
  7: [
    { title: t('Compare'), text: t('Put your crane next to the reference.'), shapes: SHAPES.compare() },
    { title: t('Done'), text: t('Note what went well and which step you found difficult.'), shapes: SHAPES.crane() },
  ],
};
