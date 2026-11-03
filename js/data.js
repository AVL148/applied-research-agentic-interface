// Local sample data. None of this comes from the internet or an API.

import { t } from './i18n.js';

export const APP_NAME = 'applied research agentic interface';

export const PROJECT = {
  id: 'origami-crane-study',
  title: t('Origami crane'),
  summary:
    t('Research into folding an origami crane: an existing video is analysed to assess whether an AI-supported interface gives better folding feedback than a normal video without extra guidance.'),
  level: t('Research prototype'),
};

// Fixed layout of the reference video (seconds). end: null = until the end of the video.
// 1: 0:00–1:01 · 2: 1:01–2:40 · 3: 2:40–5:40 · 4: 5:40–8:00 · 5: 8:00–10:30 · 6: 10:30–12:40 · 7: 12:40–end
export const VIDEO_SPEED = 2;

export const STEPS = [
  {
    id: 1,
    video: { start: 0, end: 61 },
    title: t('Prepare the paper and reference video'),
    demoTitle: t('Start of the crane'),
    demoCaption: t('Upload the existing crane video and place a square sheet of paper in a clear starting position.'),
    instructions: [t('Upload an existing origami crane video and check that the outlines are clearly visible.'), t('Lay a square sheet of paper flat with clear corners, coloured side up.'), t('Decide on the end goal: a neat, symmetrical crane with clearly shaped wings.')],
    tip: t('A clear reference video with visible outlines makes the AI analysis more reliable.'),
    easier: t('Start with a clear starting position: without a sharp base, the rest of the fold is hard to compare.'),
    hints: [t('Check that the video is not too dark or too bright.'), t('Pause the video at the first clear folding moment.')],
    reflection: {
      question: t('What was most important when preparing the video?'),
      options: [t('The video was clear'), t('The position of the paper was tricky'), t('I wanted a different starting point'), t('I do not know yet')],
    },
  },
  {
    id: 2,
    video: { start: 61, end: 160 },
    title: t('Create the base shape and centre lines'),
    demoTitle: t('Setting the centre lines'),
    demoCaption: t('Use the video to follow the centre lines and the first base shape exactly.'),
    instructions: [t('Fold both diagonals and unfold them, then turn the paper over and fold it in half both ways.'), t('Check that every crease is straight and even.'), t('Use the video to see where the first base shape begins.')],
    tip: t('Good centre lines are the foundation of the crane. If they are crooked, everything after them will be crooked too.'),
    easier: t('Think of the centre line as the compass of the fold: everything turns around it.'),
    hints: [t('Compare the left and right halves for symmetry.'), t('Make a small correction if a crease is not exactly in the centre.')],
    reflection: {
      question: t('How did the centre lines go?'),
      options: [t('Good and straight'), t('A little crooked'), t('Not quite even'), t('I want to practise more')],
    },
  },
  {
    id: 3,
    video: { start: 160, end: 340 },
    title: t('Make the valley folds'),
    demoTitle: t('Valley folds for the base'),
    demoCaption: t('The paper folds towards you and forms the first clear valley.'),
    instructions: [t('Collapse the paper into the base shape (preliminary base).'), t('Fold the kite fold: both lower edges to the centre line, as valley folds.'), t('Use the reference to check the angle and the sharpness of each fold.')],
    tip: t('A valley fold should be sharp, but not crumpled. A sharp line matters more than brute force.'),
    easier: t('Think of a valley: the paper dips towards the centre line.'),
    hints: [t('If a fold is rough, redo it with less pressure.'), t('Use the video as a visual check while folding.')],
    reflection: {
      question: t('How did the valley folds feel?'),
      options: [t('Perfectly sharp'), t('Pretty good'), t('Not sharp enough'), t('I had to start over')],
    },
  },
  {
    id: 4,
    video: { start: 340, end: 480 },
    title: t('Build the mountain folds'),
    demoTitle: t('Mountain folds and petal fold'),
    demoCaption: t('The paper folds away from you; the ridge points up and forms the bird base.'),
    instructions: [t('Make the petal fold: the lower point lifts up while the sides fold in as mountain folds.'), t('Turn the model over and repeat on the other side.'), t('Check with the video that the direction of every fold is correct.')],
    tip: t('With a mountain fold the ridge points away from you: the opposite direction of a valley fold.'),
    easier: t('Think of a mountain: the paper rises towards a clear peak.'),
    hints: [t('Crease lightly first so the shape does not go crooked.'), t('Compare the direction with the reference picture too.')],
    reflection: {
      question: t('Which type of fold was harder?'),
      options: [t('Valley fold'), t('Mountain fold'), t('Both about the same'), t('I do not know yet')],
    },
  },
  {
    id: 5,
    video: { start: 480, end: 630 },
    title: t('Make the reverse folds and wing shape'),
    demoTitle: t('Neck and tail turning'),
    demoCaption: t('A reverse fold gives the crane its characteristic neck, tail and wing shape.'),
    instructions: [t('Fold the lower edges to the centre line to make the shape narrow.'), t('Make the reverse folds for the neck and the tail in one smooth movement without tearing the corner.'), t('Compare the shape with the reference video of the crane.')],
    tip: t('With a reverse fold, precision matters more than speed. One neat turn makes the model clearer.'),
    easier: t('You turn a flap inside out and let the outline come back in the right direction.'),
    hints: [t('Make a pre-crease first so the fold turns easily.'), t('Work with small, controlled movements.')],
    reflection: {
      question: t('How did turning the neck and tail go?'),
      options: [t('Smoothly'), t('I needed a pause'), t('I had to correct it'), t('Not good enough')],
    },
  },
  {
    id: 6,
    video: { start: 630, end: 760 },
    title: t('Refine the head, beak and details'),
    demoTitle: t('Final details of the crane'),
    demoCaption: t('Refine the last outlines so the beak and wings are visible and sharp.'),
    instructions: [t('Fold the head with a small reverse fold and pull the wings apart gently.'), t('Check that the beak is clear and straight and that both wings are symmetrical.'), t('Compare the last details with the reference video of the crane.')],
    tip: t('Small corrections often make the model look more realistic than big extra folds.'),
    easier: t('You only refine what is not right yet and let the shape return to balance.'),
    hints: [t('Small corrections to the beak make the whole shape clearer.'), t('Compare the last detail steps with the video too.')],
    reflection: {
      question: t('What was the most noticeable detail?'),
      options: [t('Beak'), t('Wings'), t('Tail'), t('I had little to correct')],
    },
  },
  {
    id: 7,
    video: { start: 760, end: null },
    title: t('Test the final result and collect feedback'),
    demoTitle: t('Review and comparison'),
    demoCaption: t('Compare the final shape with the reference and note where the AI interface or the normal video helped most.'),
    instructions: [t('Compare the result with the video and mark the differences in shape and symmetry.'), t('Note which step was clearest and which stayed difficult.'), t('Ask the AI for a focus tip based on the biggest difference between your model and the reference.')],
    tip: t('The best feedback comes from comparing detail and shape, not only the whole model.'),
    easier: t('Look back at the model like a researcher: what works, what stands out and what could be better?'),
    hints: [t('Choose one clear improvement for the next trial round.'), t('Keep the video for comparison in the next round.')],
    reflection: {
      question: t('What is your most important lesson for the next round?'),
      options: [t('A firmer starting point'), t('More symmetry'), t('Sharper outlines'), t('I want to practise first')],
    },
  },
];

export const TECHNIQUES = [
  { id: 't1', name: t('Valley fold'), craft: 'Origami', material: t('Paper'), level: 'Beginner', description: t('A fold towards you that makes a V-shaped valley. The crease sits at the bottom.') },
  { id: 't2', name: t('Mountain fold'), craft: 'Origami', material: t('Paper'), level: 'Beginner', description: t('A fold away from you that makes a ridge (Λ). The paper goes behind itself.') },
  { id: 't3', name: t('Reverse fold'), craft: 'Origami', material: t('Paper'), level: 'Intermediate', description: t('Turning a narrow point inside out to make the neck, tail and head of the crane.') },
  { id: 't4', name: t('Bird base'), craft: 'Origami', material: t('Paper'), level: 'Beginner', description: t('The base shape the crane is built from.') },
  { id: 't5', name: t('Squash fold'), craft: 'Origami', material: t('Paper'), level: 'Intermediate', description: t('Opening a flap and pressing it flat into a new shape.') },
  { id: 't6', name: t('Petal fold'), craft: 'Origami', material: t('Paper'), level: 'Advanced', description: t('Lifting a point and folding the sides in to make a long, narrow petal shape.') },
  { id: 't7', name: t('Sink fold'), craft: 'Origami', material: t('Paper'), level: 'Advanced', description: t('Pushing a point into the model so it sinks inside.') },
  { id: 't11', name: t('Preliminary base'), craft: 'Origami', material: t('Paper'), level: 'Beginner', description: t('The base shape the crane starts from: fold the diagonals and centre lines, then collapse into a smaller square with four flaps.') },
  { id: 't8', name: t('Reference matching'), craft: 'Research', material: t('Video'), level: 'Beginner', description: t('Comparing your folding steps with the video to spot deviations.') },
  { id: 't9', name: t('AI frame check'), craft: 'Research', material: t('Video + prompts'), level: 'Intermediate', description: t('Using frame analysis to find the right fold or outline error.') },
  { id: 't10', name: t('Fold quality review'), craft: 'Research', material: t('Video'), level: 'Beginner', description: t('Judging the final quality against the standard crane video.') },
];

export const FILTERS = {
  crafts: ['All', 'Origami', 'Research'],
  levels: ['All', 'Beginner', 'Intermediate', 'Advanced'],
};
