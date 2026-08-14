import type { Difficulty } from '@/domain/questions/types';

export const LATIN_SQUARE_GENERATOR_VERSION = 'latin-square-v1' as const;
export type LatinSquareCell = number | null;
export type LatinSquareOption = { id: string; value: number };
export type LatinSquareQuestion = {
  id: string;
  taskType: 'latin-squares';
  module: 'core';
  difficulty: Difficulty;
  generatorVersion: typeof LATIN_SQUARE_GENERATOR_VERSION;
  seed: number;
  size: number;
  symbols: number[];
  puzzle: LatinSquareCell[][];
  solution: number[][];
  target: { row: number; column: number };
  options: LatinSquareOption[];
  correctOptionId: string;
  skillTags: string[];
  complexityScore: number;
};
