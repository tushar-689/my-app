import { createSeededRandom, shuffle } from '../figure-sequences/rng';
import type { Difficulty } from '@/domain/questions/types';
import {
  LATIN_SQUARE_GENERATOR_VERSION,
  type LatinSquareCell,
  type LatinSquareQuestion,
} from './model';
import { validateLatinSquareQuestion } from './validator';

export class LatinSquareGenerationError extends Error {
  constructor(
    readonly seed: number,
    readonly difficulty: Difficulty,
    reason: string,
  ) {
    super(`Unable to generate Latin Squares question: ${reason}`);
    this.name = 'LatinSquareGenerationError';
  }
}

const config = {
  low: { size: 3, holes: 1 },
  medium: { size: 4, holes: 2 },
  high: { size: 5, holes: 3 },
} as const;

export function generateLatinSquareQuestion({
  seed,
  difficulty,
}: {
  seed: number;
  difficulty: Difficulty;
}): LatinSquareQuestion {
  const random = createSeededRandom(seed);
  const { size, holes } = config[difficulty];
  const solution = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => ((row + column) % size) + 1),
  );
  const cells = Array.from({ length: size * size }, (_, index) => index);
  const hidden = shuffle(cells, random).slice(0, holes);
  const targetIndex = hidden[0];
  const puzzle: LatinSquareCell[][] = solution.map((row) => [...row]);
  hidden.forEach((index) => {
    puzzle[Math.floor(index / size)][index % size] = null;
  });
  const targetValue =
    solution[Math.floor(targetIndex / size)][targetIndex % size];
  const distractors = Array.from({ length: size }, (_, index) => index + 1)
    .filter((value) => value !== targetValue)
    .slice(0, 3);
  const values = shuffle([targetValue, ...distractors], random);
  const question: LatinSquareQuestion = {
    id: `latin-square-${difficulty}-${seed}`,
    taskType: 'latin-squares',
    module: 'core',
    difficulty,
    generatorVersion: LATIN_SQUARE_GENERATOR_VERSION,
    seed,
    size,
    symbols: Array.from({ length: size }, (_, index) => index + 1),
    puzzle,
    solution,
    target: { row: Math.floor(targetIndex / size), column: targetIndex % size },
    options: values.map((value, index) => ({
      id: `option-${index + 1}`,
      value,
    })),
    correctOptionId: `option-${values.indexOf(targetValue) + 1}`,
    skillTags: [
      'latin-square',
      'numerical-reasoning',
      ...(holes > 1 ? ['multi-step'] : []),
    ],
    complexityScore: size * 2 + holes,
  };
  if (validateLatinSquareQuestion(question).valid) return question;
  throw new LatinSquareGenerationError(
    seed,
    difficulty,
    'bounded generation failed',
  );
}
