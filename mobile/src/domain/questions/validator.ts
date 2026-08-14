import type { Question } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface QuestionValidator<T extends Question> {
  validate(question: T): ValidationResult;
}
