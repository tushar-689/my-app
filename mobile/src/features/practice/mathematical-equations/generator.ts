import type { Difficulty } from '@/domain/questions/types';
import { createSeededRandom, shuffle } from '../figure-sequences/rng';
import {
  MATHEMATICAL_EQUATION_GENERATOR_VERSION,
  type Equation,
  type EquationSolution,
  type MathematicalEquationQuestion,
} from './model';
import { solveEquationSystem } from './solver';
import { validateMathematicalEquationQuestion } from './validator';

export class MathematicalEquationGenerationError extends Error {
  readonly seed: number;
  readonly difficulty: Difficulty;
  readonly reason: string;

  constructor(reason: string, seed: number, difficulty: Difficulty) {
    super(`Unable to generate Mathematical Equations question: ${reason}`);
    this.name = 'MathematicalEquationGenerationError';
    this.reason = reason;
    this.seed = seed;
    this.difficulty = difficulty;
  }
}

const configs = {
  low: { variables: 2, coefficient: 3, attempts: 160 },
  medium: { variables: 3, coefficient: 4, attempts: 220 },
  high: { variables: 4, coefficient: 5, attempts: 300 },
} as const;

function randomInt(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function makeEquation(
  random: () => number,
  variables: string[],
  solution: EquationSolution,
  coefficientLimit: number,
): Equation {
  const coefficients: number[] = variables.map(() =>
    randomInt(random, -coefficientLimit, coefficientLimit),
  );
  if (coefficients.every((coefficient) => coefficient === 0)) {
    (coefficients as number[])[0] = 1;
  }
  const terms = variables
    .map((variable, index) => ({ variable, coefficient: coefficients[index] }))
    .filter((term) => term.coefficient !== 0);
  return {
    terms,
    constant: terms.reduce(
      (sum, term) => sum + term.coefficient * solution[term.variable],
      0,
    ),
  };
}

function optionKey(values: EquationSolution, variables: string[]): string {
  return variables.map((variable) => values[variable]).join(',');
}

function makeDistractors(
  random: () => number,
  solution: EquationSolution,
  variables: string[],
): EquationSolution[] {
  const candidates: EquationSolution[] = [];
  const add = (values: EquationSolution) => {
    if (
      variables.every(
        (variable) => values[variable] >= 1 && values[variable] <= 20,
      ) &&
      !candidates.some(
        (candidate) =>
          optionKey(candidate, variables) === optionKey(values, variables),
      )
    )
      candidates.push(values);
  };
  for (let index = 0; index < variables.length; index += 1) {
    for (const delta of [-2, -1, 1, 2]) {
      const values = { ...solution };
      values[variables[index]] += delta;
      add(values);
    }
  }
  for (let index = 0; index < variables.length - 1; index += 1) {
    const values = { ...solution };
    [values[variables[index]], values[variables[index + 1]]] = [
      values[variables[index + 1]],
      values[variables[index]],
    ];
    add(values);
  }
  return shuffle(candidates, random).slice(0, 3);
}

export function generateMathematicalEquationQuestion(options: {
  seed: number;
  difficulty: Difficulty;
}): MathematicalEquationQuestion {
  const { seed, difficulty } = options;
  const config = configs[difficulty];
  const variables = Array.from({ length: config.variables }, (_, index) =>
    String.fromCharCode(65 + index),
  );
  const random = createSeededRandom(seed);
  for (let attempt = 0; attempt < config.attempts; attempt += 1) {
    const solution = Object.fromEntries(
      variables.map((variable) => [variable, randomInt(random, 2, 19)]),
    ) as EquationSolution;
    const equations = Array.from({ length: config.variables }, () =>
      makeEquation(random, variables, solution, config.coefficient),
    );
    const verified = solveEquationSystem(equations, variables);
    if (verified.length !== 1) continue;
    const distractors = makeDistractors(random, solution, variables);
    if (distractors.length !== 3) continue;
    const values = shuffle([solution, ...distractors], random);
    const question: MathematicalEquationQuestion = {
      id: `mathematical-equation-${difficulty}-${seed}`,
      taskType: 'mathematical-equations',
      module: 'core',
      difficulty,
      generatorVersion: MATHEMATICAL_EQUATION_GENERATOR_VERSION,
      seed,
      variables,
      equations,
      options: values.map((option, index) => ({
        id: `option-${index + 1}`,
        values: option,
      })),
      correctOptionId: `option-${values.indexOf(solution) + 1}`,
      solution,
      skillTags: [
        'equation-solving',
        'numerical-reasoning',
        ...(config.variables > 2 ? ['multi-step'] : []),
      ],
      complexityScore: config.variables * 3 + config.coefficient,
    };
    const validation = validateMathematicalEquationQuestion(question);
    if (validation.valid) return question;
  }
  throw new MathematicalEquationGenerationError(
    'bounded generation failed',
    seed,
    difficulty,
  );
}
