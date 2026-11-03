// Local sample data. None of this comes from the internet or an API.

export const APP_NAME = 'applied research agentic interface';

export const PROJECT = {
  id: 'origami-crane-study',
  title: 'Origami crane',
  summary:
    'Research into folding an origami crane: an existing video is analysed to assess whether an AI-supported interface gives better folding feedback than a normal video without extra guidance.',
  level: 'Research prototype',
};

// Fixed layout of the reference video (seconds). end: null = until the end of the video.
// 1: 0:00–1:01 · 2: 1:01–2:40 · 3: 2:40–5:40 · 4: 5:40–8:00 · 5: 8:00–10:30 · 6: 10:30–12:40 · 7: 12:40–end
export const VIDEO_SPEED = 2;

export const STEPS = [
  {
    id: 1,
    video: { start: 0, end: 61 },
    title: 'Prepare the paper and reference video',
    demoTitle: 'Start of the crane',
    demoCaption: 'Upload the existing crane video and place a square sheet of paper in a clear starting position.',
    instructions: [
      'Upload an existing origami crane video and check that the outlines are clearly visible.',
      'Lay a square sheet of paper flat with clear corners, coloured side up.',
      'Decide on the end goal: a neat, symmetrical crane with clearly shaped wings.',
    ],
    tip: 'A clear reference video with visible outlines makes the AI analysis more reliable.',
    easier: 'Start with a clear starting position: without a sharp base, the rest of the fold is hard to compare.',
    hints: [
      'Check that the video is not too dark or too bright.',
      'Pause the video at the first clear folding moment.',
    ],
    reflection: {
      question: 'What was most important when preparing the video?',
      options: ['The video was clear', 'The position of the paper was tricky', 'I wanted a different starting point', 'I do not know yet'],
    },
  },
  {
    id: 2,
    video: { start: 61, end: 160 },
    title: 'Create the base shape and centre lines',
    demoTitle: 'Setting the centre lines',
    demoCaption: 'Use the video to follow the centre lines and the first base shape exactly.',
    instructions: [
      'Fold both diagonals and unfold them, then turn the paper over and fold it in half both ways.',
      'Check that every crease is straight and even.',
      'Use the video to see where the first base shape begins.',
    ],
    tip: 'Good centre lines are the foundation of the crane. If they are crooked, everything after them will be crooked too.',
    easier: 'Think of the centre line as the compass of the fold: everything turns around it.',
    hints: [
      'Compare the left and right halves for symmetry.',
      'Make a small correction if a crease is not exactly in the centre.',
    ],
    reflection: {
      question: 'How did the centre lines go?',
      options: ['Good and straight', 'A little crooked', 'Not quite even', 'I want to practise more'],
    },
  },
  {
    id: 3,
    video: { start: 160, end: 340 },
    title: 'Make the valley folds',
    demoTitle: 'Valley folds for the base',
    demoCaption: 'The paper folds towards you and forms the first clear valley.',
    instructions: [
      'Collapse the paper into the base shape (preliminary base).',
      'Fold the kite fold: both lower edges to the centre line, as valley folds.',
      'Use the reference to check the angle and the sharpness of each fold.',
    ],
    tip: 'A valley fold should be sharp, but not crumpled. A sharp line matters more than brute force.',
    easier: 'Think of a valley: the paper dips towards the centre line.',
    hints: [
      'If a fold is rough, redo it with less pressure.',
      'Use the video as a visual check while folding.',
    ],
    reflection: {
      question: 'How did the valley folds feel?',
      options: ['Perfectly sharp', 'Pretty good', 'Not sharp enough', 'I had to start over'],
    },
  },
  {
    id: 4,
    video: { start: 340, end: 480 },
    title: 'Build the mountain folds',
    demoTitle: 'Mountain folds and petal fold',
    demoCaption: 'The paper folds away from you; the ridge points up and forms the bird base.',
    instructions: [
      'Make the petal fold: the lower point lifts up while the sides fold in as mountain folds.',
      'Turn the model over and repeat on the other side.',
      'Check with the video that the direction of every fold is correct.',
    ],
    tip: 'With a mountain fold the ridge points away from you: the opposite direction of a valley fold.',
    easier: 'Think of a mountain: the paper rises towards a clear peak.',
    hints: [
      'Crease lightly first so the shape does not go crooked.',
      'Compare the direction with the reference picture too.',
    ],
    reflection: {
      question: 'Which type of fold was harder?',
      options: ['Valley fold', 'Mountain fold', 'Both about the same', 'I do not know yet'],
    },
  },
  {
    id: 5,
    video: { start: 480, end: 630 },
    title: 'Make the reverse folds and wing shape',
    demoTitle: 'Neck and tail turning',
    demoCaption: 'A reverse fold gives the crane its characteristic neck, tail and wing shape.',
    instructions: [
      'Fold the lower edges to the centre line to make the shape narrow.',
      'Make the reverse folds for the neck and the tail in one smooth movement without tearing the corner.',
      'Compare the shape with the reference video of the crane.',
    ],
    tip: 'With a reverse fold, precision matters more than speed. One neat turn makes the model clearer.',
    easier: 'You turn a flap inside out and let the outline come back in the right direction.',
    hints: [
      'Make a pre-crease first so the fold turns easily.',
      'Work with small, controlled movements.',
    ],
    reflection: {
      question: 'How did turning the neck and tail go?',
      options: ['Smoothly', 'I needed a pause', 'I had to correct it', 'Not good enough'],
    },
  },
  {
    id: 6,
    video: { start: 630, end: 760 },
    title: 'Refine the head, beak and details',
    demoTitle: 'Final details of the crane',
    demoCaption: 'Refine the last outlines so the beak and wings are visible and sharp.',
    instructions: [
      'Fold the head with a small reverse fold and pull the wings apart gently.',
      'Check that the beak is clear and straight and that both wings are symmetrical.',
      'Compare the last details with the reference video of the crane.',
    ],
    tip: 'Small corrections often make the model look more realistic than big extra folds.',
    easier: 'You only refine what is not right yet and let the shape return to balance.',
    hints: [
      'Small corrections to the beak make the whole shape clearer.',
      'Compare the last detail steps with the video too.',
    ],
    reflection: {
      question: 'What was the most noticeable detail?',
      options: ['Beak', 'Wings', 'Tail', 'I had little to correct'],
    },
  },
  {
    id: 7,
    video: { start: 760, end: null },
    title: 'Test the final result and collect feedback',
    demoTitle: 'Review and comparison',
    demoCaption: 'Compare the final shape with the reference and note where the AI interface or the normal video helped most.',
    instructions: [
      'Compare the result with the video and mark the differences in shape and symmetry.',
      'Note which step was clearest and which stayed difficult.',
      'Ask the AI for a focus tip based on the biggest difference between your model and the reference.',
    ],
    tip: 'The best feedback comes from comparing detail and shape, not only the whole model.',
    easier: 'Look back at the model like a researcher: what works, what stands out and what could be better?',
    hints: [
      'Choose one clear improvement for the next trial round.',
      'Keep the video for comparison in the next round.',
    ],
    reflection: {
      question: 'What is your most important lesson for the next round?',
      options: ['A firmer starting point', 'More symmetry', 'Sharper outlines', 'I want to practise first'],
    },
  },
];

export const TECHNIQUES = [
  { id: 't1', name: 'Valley fold', craft: 'Origami', material: 'Paper', level: 'Beginner', description: 'A fold towards you that makes a V-shaped valley. The crease sits at the bottom.' },
  { id: 't2', name: 'Mountain fold', craft: 'Origami', material: 'Paper', level: 'Beginner', description: 'A fold away from you that makes a ridge (Λ). The paper goes behind itself.' },
  { id: 't3', name: 'Reverse fold', craft: 'Origami', material: 'Paper', level: 'Intermediate', description: 'Turning a narrow point inside out to make the neck, tail and head of the crane.' },
  { id: 't4', name: 'Bird base', craft: 'Origami', material: 'Paper', level: 'Beginner', description: 'The base shape the crane is built from.' },
  { id: 't5', name: 'Squash fold', craft: 'Origami', material: 'Paper', level: 'Intermediate', description: 'Opening a flap and pressing it flat into a new shape.' },
  { id: 't6', name: 'Petal fold', craft: 'Origami', material: 'Paper', level: 'Advanced', description: 'Lifting a point and folding the sides in to make a long, narrow petal shape.' },
  { id: 't7', name: 'Sink fold', craft: 'Origami', material: 'Paper', level: 'Advanced', description: 'Pushing a point into the model so it sinks inside.' },
  { id: 't11', name: 'Preliminary base', craft: 'Origami', material: 'Paper', level: 'Beginner', description: 'The base shape the crane starts from: fold the diagonals and centre lines, then collapse into a smaller square with four flaps.' },
  { id: 't8', name: 'Reference matching', craft: 'Research', material: 'Video', level: 'Beginner', description: 'Comparing your folding steps with the video to spot deviations.' },
  { id: 't9', name: 'AI frame check', craft: 'Research', material: 'Video + prompts', level: 'Intermediate', description: 'Using frame analysis to find the right fold or outline error.' },
  { id: 't10', name: 'Fold quality review', craft: 'Research', material: 'Video', level: 'Beginner', description: 'Judging the final quality against the standard crane video.' },
];

export const FILTERS = {
  crafts: ['All', 'Origami', 'Research'],
  levels: ['All', 'Beginner', 'Intermediate', 'Advanced'],
};
