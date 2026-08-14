import type { Difficulty } from '@/domain/questions/types';

export const MATHEMATICAL_EQUATION_GENERATOR_VERSION =
  'mathematical-equation-v1' as const;

export type EquationTerm = {
  variable: string;
  coefficient: number;
};

export type Equation = {
  terms: EquationTerm[];
  constant: number;
};

export type EquationSolution = Record<string, number>;

export type MathematicalEquationOption = {
  id: string;
  values: EquationSolution;
};

export type MathematicalEquationQuestion = {
  id: string;
  taskType: 'mathematical-equations';
  module: 'core';
  difficulty: Difficulty;
  generatorVersion: typeof MATHEMATICAL_EQUATION_GENERATOR_VERSION;
  seed: number;
  variables: string[];
  equations: Equation[];
  options: MathematicalEquationOption[];
  correctOptionId: string;
  solution: EquationSolution;
  skillTags: string[];
  complexityScore: number;
};
