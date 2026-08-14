import type { Difficulty } from '@/domain/questions/types';
import { createSeededRandom, shuffle } from './rng';
import { replaySequence } from './transformations';
import { validateFigureSequenceQuestion } from './validator';
import type {
  BoundaryBehavior,
  Direction,
  Figure,
  FigureColor,
  FigureMatrix,
  FigureSequenceQuestionV2,
  TransformationSpec,
} from './model';

export const FIGURE_SEQUENCE_GENERATOR_VERSION = 'figure-sequence-v2' as const;

export class QuestionGenerationError extends Error {
  readonly reason: string;
  readonly seed: number;
  readonly difficulty: Difficulty;
  readonly generatorVersion = FIGURE_SEQUENCE_GENERATOR_VERSION;

  constructor(reason: string, seed: number, difficulty: Difficulty) {
    super(`Unable to generate Figure Sequence question: ${reason}`);
    this.name = 'QuestionGenerationError';
    this.reason = reason;
    this.seed = seed;
    this.difficulty = difficulty;
  }
}

const shapes: Figure['shape'][] = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'arrow',
];
const colors: FigureColor[] = ['ink', 'green', 'purple', 'yellow'];
const directions: Direction[] = [
  'right',
  'down',
  'left',
  'up',
  'down-right',
  'up-left',
  'up-right',
  'down-left',
];

function emptyMatrix(): FigureMatrix {
  return {
    rows: 3,
    columns: 3,
    cells: Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => ({ figures: [] })),
    ),
  };
}

function initialMatrix(random: () => number, count: number): FigureMatrix {
  const matrix = emptyMatrix();
  const positions = new Set<string>();
  for (let index = 0; index < count; index += 1) {
    let x = 0;
    let y = 0;
    do {
      x = Math.floor(random() * 3);
      y = Math.floor(random() * 3);
    } while (positions.has(`${x}:${y}`));
    positions.add(`${x}:${y}`);
    const figure: Figure = {
      shape: shapes[Math.floor(random() * shapes.length)],
      position: { x, y },
      rotation: ([0, 90, 180, 270] as const)[Math.floor(random() * 4)],
      fill: random() > 0.5 ? 'solid' : 'outline',
      size: 18 + Math.floor(random() * 9),
      color: colors[Math.floor(random() * colors.length)],
    };
    matrix.cells[y][x].figures.push(figure);
  }
  return matrix;
}

function move(
  direction: Direction,
  boundary: BoundaryBehavior,
  step = 1,
  stepIncrement?: number,
): TransformationSpec {
  return {
    type: 'move',
    id: `${direction}-${boundary}-${step}-${stepIncrement ?? 0}`,
    direction,
    boundary,
    step,
    stepIncrement,
  };
}

function chooseRules(
  random: () => number,
  difficulty: Difficulty,
): TransformationSpec[] {
  const direction = directions[Math.floor(random() * directions.length)];
  if (difficulty === 'low') {
    return random() > 0.45
      ? [move(direction, 'bounce')]
      : [{ type: 'rotate', id: 'rotation-90', increment: 90 }];
  }
  if (difficulty === 'medium') {
    if (random() > 0.66) return [move(direction, 'boundary-follow')];
    const movement = move(direction, 'bounce');
    const secondary: TransformationSpec =
      random() > 0.5
        ? {
            type: 'rotate',
            id: 'rotation-changing',
            increment: 90,
            incrementStep: 90,
          }
        : {
            type: 'color',
            id: 'color-cycle',
            colors: ['green', 'purple', 'yellow'],
          };
    return [movement, secondary];
  }
  const movement = move(direction, 'bounce', 1, 1);
  const secondaryTransformation: TransformationSpec =
    random() > 0.5
      ? {
          type: 'rotate',
          id: 'rotation-changing',
          increment: 90,
          incrementStep: 90,
        }
      : {
          type: 'color',
          id: 'color-cycle',
          colors: ['green', 'purple', 'yellow'],
        };
  const secondary: TransformationSpec = {
    type: 'per-figure',
    id: 'secondary-figure-rule',
    figureIndex: 1,
    transformation: secondaryTransformation,
  };
  const alternating: TransformationSpec = {
    type: 'per-figure',
    id: 'alternating-diagonal',
    figureIndex: 2,
    transformation: {
      type: 'move',
      id: 'alternating-diagonal-movement',
      direction: [
        direction,
        directions[(directions.indexOf(direction) + 1) % directions.length],
      ],
      boundary: 'bounce',
      step: 1,
    },
  };
  return [
    {
      type: 'combined',
      id: 'high-combination',
      transformations: [movement, secondary, alternating],
    },
  ];
}

function cloneMatrix(matrix: FigureMatrix): FigureMatrix {
  return {
    rows: 3,
    columns: 3,
    cells: matrix.cells.map((row) =>
      row.map((cell) => ({
        figures: cell.figures.map((figure) => ({
          ...figure,
          position: { ...figure.position },
        })),
      })),
    ),
  };
}

function hasOverlap(matrix: FigureMatrix): boolean {
  const positions = new Set<string>();
  return matrix.cells.some((row) =>
    row.some((cell) =>
      cell.figures.some((figure) => {
        const key = `${figure.position.x}:${figure.position.y}`;
        if (positions.has(key)) return true;
        positions.add(key);
        return false;
      }),
    ),
  );
}

function findSolvableInitialMatrix(
  random: () => number,
  count: number,
  transformations: TransformationSpec[],
): FigureMatrix | null {
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const candidate = initialMatrix(random, count);
    const sequence = replaySequence(candidate, transformations, 6);
    if (sequence.every((matrix) => !hasOverlap(matrix))) return candidate;
  }
  return null;
}

function rotateFirstFigure(matrix: FigureMatrix): FigureMatrix {
  const result = cloneMatrix(matrix);
  const figure = result.cells.flatMap((row) =>
    row.flatMap((cell) => cell.figures),
  )[0];
  if (figure)
    figure.rotation = ((figure.rotation + 90) % 360) as Figure['rotation'];
  return result;
}

function complexityScore(
  difficulty: Difficulty,
  figureCount: number,
  rules: TransformationSpec[],
): number {
  const ruleCount = rules.flatMap((rule) =>
    rule.type === 'combined' ? rule.transformations : [rule],
  ).length;
  return (
    figureCount * 2 +
    ruleCount * 3 +
    (difficulty === 'high' ? 5 : difficulty === 'medium' ? 2 : 0)
  );
}

function buildQuestion(
  seed: number,
  difficulty: Difficulty,
  attempt: number,
): FigureSequenceQuestionV2 {
  const random = createSeededRandom(seed + attempt * 7919);
  const figureCount =
    difficulty === 'low'
      ? 1
      : difficulty === 'medium'
        ? random() > 0.55
          ? 2
          : 1
        : 3;
  const transformations = chooseRules(random, difficulty);
  const initial = findSolvableInitialMatrix(
    random,
    figureCount,
    transformations,
  );
  if (!initial) throw new Error('no solvable initial matrix found');
  const all = replaySequence(initial, transformations, 6);
  const sequence = all.slice(0, 5);
  const targets: [FigureMatrix, FigureMatrix] = [all[5], all[6]];
  const correct: FigureSequenceQuestionV2['options'][number] = {
    id: 'correct',
    first: cloneMatrix(targets[0]),
    second: cloneMatrix(targets[1]),
  };
  const options = shuffle(
    [
      correct,
      {
        id: 'off-by-one',
        first: cloneMatrix(sequence[4]),
        second: cloneMatrix(targets[0]),
        distractorType: 'off-by-one-step',
      },
      {
        id: 'wrong-direction',
        first: cloneMatrix(targets[0]),
        second: rotateFirstFigure(targets[1]),
        distractorType: 'wrong-orientation',
      },
      {
        id: 'reversed-pair',
        first: cloneMatrix(targets[1]),
        second: cloneMatrix(targets[0]),
        distractorType: 'reversed-pair',
      },
    ],
    random,
  ).map((option, index) => ({
    ...option,
    id: option.id === 'correct' ? `option-${index}` : option.id,
  }));
  return {
    id: `figure-sequence-v2-${difficulty}-${seed}`,
    taskType: 'figure-sequences',
    module: 'core',
    difficulty,
    generatorVersion: FIGURE_SEQUENCE_GENERATOR_VERSION,
    seed,
    sequence,
    targets,
    options,
    correctOptionId:
      options.find(
        (option) =>
          matrixEqual(option.first, targets[0]) &&
          matrixEqual(option.second, targets[1]),
      )?.id ?? '',
    initialMatrix: cloneMatrix(initial),
    ruleMetadata: { transformations },
    complexityScore: complexityScore(difficulty, figureCount, transformations),
    skillTags: [
      'movement',
      'direction',
      ...(difficulty === 'low' ? [] : ['rotation', 'boundary']),
      ...(difficulty === 'high'
        ? ['colour', 'step-progression', 'multi-figure']
        : []),
    ],
  };
}

function matrixEqual(first: FigureMatrix, second: FigureMatrix): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function generateFigureSequenceQuestion(options: {
  seed: number;
  difficulty: Difficulty;
}): FigureSequenceQuestionV2 {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const question = buildQuestion(options.seed, options.difficulty, attempt);
      if (validateFigureSequenceQuestion(question).valid) return question;
    } catch {
      // Try the next deterministic derived seed before reporting a failure.
    }
  }
  throw new QuestionGenerationError(
    'validation failed after eight deterministic attempts',
    options.seed,
    options.difficulty,
  );
}

export function generateQuestion(
  seed: number,
  difficulty: Difficulty | 1 | 2 | 3 = 'low',
): FigureSequenceQuestionV2 {
  const normalizedDifficulty: Difficulty =
    typeof difficulty === 'number'
      ? difficulty === 1
        ? 'low'
        : difficulty === 2
          ? 'medium'
          : 'high'
      : difficulty;
  return generateFigureSequenceQuestion({
    seed,
    difficulty: normalizedDifficulty,
  });
}
