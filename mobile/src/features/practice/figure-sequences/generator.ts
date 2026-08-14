import type {
  Figure,
  FigureSequenceQuestion,
  FigureSequenceRule,
} from './model';

export const FIGURE_RULES: FigureSequenceRule[] = [
  'rotation',
  'horizontal',
  'vertical',
  'alternating',
  'shape',
  'fill',
  'size',
];

const shapes: Figure['shape'][] = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'arrow',
];
const colors: Figure['color'][] = ['ink', 'green', 'purple', 'yellow'];

function seeded(seed: number) {
  let value = Math.abs(Math.floor(seed)) + 1;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function baseFigure(random: () => number): Figure {
  return {
    shape: shapes[Math.floor(random() * shapes.length)],
    position: { x: 1, y: 1 },
    rotation: 0,
    fill: random() > 0.5 ? 'solid' : 'outline',
    size: 28,
    color: colors[Math.floor(random() * colors.length)],
  };
}

function nextFigure(
  start: Figure,
  rule: FigureSequenceRule,
  index: number,
): Figure {
  const figure = { ...start, position: { ...start.position } };
  switch (rule) {
    case 'rotation':
      figure.rotation = (index * 90) % 360;
      break;
    case 'horizontal':
      figure.position.x = index % 3;
      break;
    case 'vertical':
      figure.position.y = index % 3;
      break;
    case 'alternating':
      figure.position.x = index % 2 === 0 ? 0 : 2;
      figure.rotation = index % 2 === 0 ? 0 : 180;
      break;
    case 'shape':
      figure.shape = shapes[index % shapes.length];
      break;
    case 'fill':
      figure.fill = index % 2 === 0 ? 'outline' : 'solid';
      break;
    case 'size':
      figure.size = 20 + index * 6;
      break;
  }
  return figure;
}

function differentFrom(candidate: Figure, figures: Figure[]) {
  return figures.some(
    (figure) => JSON.stringify(figure) === JSON.stringify(candidate),
  );
}

export function generateQuestion(
  seed: number,
  difficulty: 1 | 2 | 3 = 1,
): FigureSequenceQuestion {
  const random = seeded(seed);
  const rule = FIGURE_RULES[Math.floor(random() * FIGURE_RULES.length)];
  const start = baseFigure(random);
  const sequence = [0, 1, 2, 3].map((index) => nextFigure(start, rule, index));
  const correct = nextFigure(start, rule, 4);
  const answerOptions = [correct];
  const variations: Figure[] = [
    { ...correct, rotation: (correct.rotation + 90) % 360 },
    {
      ...correct,
      position: { x: (correct.position.x + 1) % 3, y: correct.position.y },
    },
    { ...correct, fill: correct.fill === 'solid' ? 'outline' : 'solid' },
  ];
  for (const variation of variations) {
    if (!differentFrom(variation, answerOptions)) answerOptions.push(variation);
  }
  return { seed, difficulty, rule, sequence, answerOptions, correctAnswer: 0 };
}
