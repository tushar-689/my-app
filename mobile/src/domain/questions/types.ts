export type TaskType =
  | 'figure-sequences'
  | 'mathematical-equations'
  | 'latin-squares'
  | 'subject-single-choice';

export type AssessmentModule = 'core' | 'general-academic';
export type Difficulty = 'low' | 'medium' | 'high';

export interface QuestionIdentity {
  id: string;
  taskType: TaskType;
  module: AssessmentModule;
  difficulty: Difficulty;
  generatorVersion?: string;
  seed?: number;
}

export interface BaseQuestion extends QuestionIdentity {
  prompt?: string;
  responseType: string;
  skillTags?: string[];
  metadata?: Record<string, unknown>;
}

export interface FigureSequenceQuestionContract extends BaseQuestion {
  taskType: 'figure-sequences';
  module: 'core';
  choices: unknown[];
  correctAnswer: unknown;
}

export interface MathematicalEquationQuestion extends BaseQuestion {
  taskType: 'mathematical-equations';
  module: 'core';
  choices: unknown[];
  correctAnswer: unknown;
}

export interface LatinSquareQuestion extends BaseQuestion {
  taskType: 'latin-squares';
  module: 'core';
  choices: unknown[];
  correctAnswer: unknown;
}

export interface SubjectSingleChoiceQuestion extends BaseQuestion {
  taskType: 'subject-single-choice';
  module: 'general-academic';
  choices: unknown[];
  correctAnswer: unknown;
}

export type Question =
  | FigureSequenceQuestionContract
  | MathematicalEquationQuestion
  | LatinSquareQuestion
  | SubjectSingleChoiceQuestion;

export interface QuestionAnswer {
  questionId: string;
  answeredAt: number;
  response: unknown;
  isCorrect?: boolean;
  timeSpentMs?: number;
}
