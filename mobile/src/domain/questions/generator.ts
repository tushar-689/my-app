import type { Difficulty, Question } from './types';

export interface QuestionGenerator<T extends Question> {
  generate(options: { difficulty: Difficulty; seed: number }): T;
}
