import type {
  AssessmentModule,
  QuestionAnswer,
  TaskType,
} from '../questions/types';

export const DOMAIN_VERSION = 1;
export const SESSION_SCHEMA_VERSION = 1;

export type SessionMode = 'practice' | 'sprint' | 'exam-simulation' | 'review';

export type SessionStatus =
  'not-started' | 'in-progress' | 'completed' | 'expired' | 'abandoned';

export interface SessionConfig {
  questionCount: number;
  durationMs?: number;
  allowPause: boolean;
  allowHints: boolean;
  showImmediateFeedback: boolean;
  allowAnswerChanges: boolean;
  showExplanationAfterAnswer: boolean;
}

export interface AssessmentSession {
  id: string;
  module: AssessmentModule;
  taskType?: TaskType;
  mode: SessionMode;
  questionIds: string[];
  currentQuestionIndex: number;
  answers: QuestionAnswer[];
  startedAt: number;
  deadlineAt?: number;
  completedAt?: number;
  status: SessionStatus;
  score?: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  version: number;
}

export interface AssessmentScore {
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracyPercent: number;
  score: number;
}

export interface AssessmentResult {
  sessionId: string;
  module: AssessmentModule;
  taskType?: TaskType;
  mode: SessionMode;
  score: AssessmentScore;
  durationMs: number;
  completedAt: number;
}
