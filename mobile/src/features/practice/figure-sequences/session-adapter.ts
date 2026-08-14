import type {
  AssessmentResult,
  AssessmentSession,
  SessionConfig,
} from '@/domain/sessions/types';
import { calculateAssessmentScore } from '@/domain/sessions/scoring';
import { transitionSession } from '@/domain/sessions/state';
import { createDeadline } from '@/domain/sessions/timer';
import type { QuestionAnswer } from '@/domain/questions/types';
import type { PracticeSession } from '../history/practice-history';
import { generateFigureSequenceQuestion } from './generator';
import type { FigureSequenceQuestionV2 } from './model';

export const FIGURE_SEQUENCE_SESSION_CONFIG: SessionConfig = {
  questionCount: 10,
  durationMs: 60_000,
  allowPause: false,
  allowHints: false,
  showImmediateFeedback: true,
  allowAnswerChanges: false,
  showExplanationAfterAnswer: false,
};

export type FigureSequenceQuestionStatus = 'active' | 'submitted' | 'expired';

export type FigureSequenceSessionState = {
  session: AssessmentSession;
  questions: FigureSequenceQuestionV2[];
  selectedAnswer: string | null;
  questionStatus: FigureSequenceQuestionStatus;
  questionDeadlineAt: number;
};

function questionId(question: FigureSequenceQuestionV2): string {
  return question.id;
}

function createQuestions(config: SessionConfig): FigureSequenceQuestionV2[] {
  return Array.from({ length: config.questionCount }, (_, index) =>
    generateFigureSequenceQuestion({ seed: 7100 + index, difficulty: 'low' }),
  );
}

export function createFigureSequenceSession(
  startedAt: number,
  sessionId = `figure-sequences-${startedAt}`,
): FigureSequenceSessionState {
  const questions = createQuestions(FIGURE_SEQUENCE_SESSION_CONFIG);
  const session: AssessmentSession = {
    id: sessionId,
    module: 'core',
    taskType: 'figure-sequences',
    mode: 'practice',
    questionIds: questions.map(questionId),
    currentQuestionIndex: 0,
    answers: [],
    startedAt,
    status: 'in-progress',
    correctCount: 0,
    incorrectCount: 0,
    skippedCount: 0,
    version: 1,
  };
  return {
    session,
    questions,
    selectedAnswer: null,
    questionStatus: 'active',
    questionDeadlineAt: createDeadline(
      startedAt,
      FIGURE_SEQUENCE_SESSION_CONFIG.durationMs,
    ) as number,
  };
}

export function selectFigureSequenceAnswer(
  state: FigureSequenceSessionState,
  answerId: string,
): FigureSequenceSessionState {
  if (state.questionStatus !== 'active') return state;
  if (
    !state.questions[state.session.currentQuestionIndex].options.some(
      (option) => option.id === answerId,
    )
  )
    return state;
  return { ...state, selectedAnswer: answerId };
}

function appendAnswer(
  state: FigureSequenceSessionState,
  answer: QuestionAnswer,
  nextStatus: FigureSequenceQuestionStatus,
): FigureSequenceSessionState {
  const answers = [...state.session.answers, answer];
  // Only finalized answers count while the session is in progress. Unseen
  // questions are not skipped until they are explicitly finalized.
  const score = calculateAssessmentScore(answers);
  return {
    ...state,
    session: {
      ...state.session,
      answers,
      correctCount: score.correctCount,
      incorrectCount: score.incorrectCount,
      skippedCount: score.skippedCount,
      score: score.score,
    },
    questionStatus: nextStatus,
  };
}

export function submitFigureSequenceAnswer(
  state: FigureSequenceSessionState,
  answeredAt: number,
): FigureSequenceSessionState {
  if (state.questionStatus !== 'active' || state.selectedAnswer === null)
    return state;
  const question = state.questions[state.session.currentQuestionIndex];
  return appendAnswer(
    state,
    {
      questionId: questionId(question),
      answeredAt,
      response: state.selectedAnswer,
      isCorrect: state.selectedAnswer === question.correctOptionId,
    },
    'submitted',
  );
}

export function skipFigureSequenceQuestion(
  state: FigureSequenceSessionState,
  answeredAt: number,
): FigureSequenceSessionState {
  if (state.questionStatus !== 'active') return state;
  return appendAnswer(
    state,
    {
      questionId: questionId(
        state.questions[state.session.currentQuestionIndex],
      ),
      answeredAt,
      response: null,
    },
    'submitted',
  );
}

export function timeoutFigureSequenceQuestion(
  state: FigureSequenceSessionState,
  answeredAt: number,
): FigureSequenceSessionState {
  if (state.questionStatus !== 'active') return state;
  return appendAnswer(
    state,
    {
      questionId: questionId(
        state.questions[state.session.currentQuestionIndex],
      ),
      answeredAt,
      response: null,
    },
    'expired',
  );
}

export function advanceFigureSequenceSession(
  state: FigureSequenceSessionState,
  at: number,
): FigureSequenceSessionState {
  if (
    state.questionStatus === 'active' ||
    state.session.status !== 'in-progress'
  )
    return state;
  const nextIndex = state.session.currentQuestionIndex + 1;
  if (nextIndex >= state.questions.length) {
    const completed = transitionSession(state.session, 'completed', at);
    return { ...state, session: completed, selectedAnswer: null };
  }
  return {
    ...state,
    session: { ...state.session, currentQuestionIndex: nextIndex },
    selectedAnswer: null,
    questionStatus: 'active',
    questionDeadlineAt: createDeadline(
      at,
      FIGURE_SEQUENCE_SESSION_CONFIG.durationMs,
    ) as number,
  };
}

export function getFigureSequenceResult(
  state: FigureSequenceSessionState,
  completedAt = state.session.completedAt ?? state.session.startedAt,
): AssessmentResult {
  const score = calculateAssessmentScore(
    state.session.answers,
    state.questions.length,
  );
  return {
    sessionId: state.session.id,
    module: state.session.module,
    taskType: state.session.taskType,
    mode: state.session.mode,
    score,
    durationMs: Math.max(0, completedAt - state.session.startedAt),
    completedAt,
  };
}

export function toPracticeHistoryRecord(
  result: AssessmentResult,
): PracticeSession {
  return {
    id: result.sessionId,
    module: 'Figure Sequences',
    completedAt: new Date(result.completedAt).toISOString(),
    total:
      result.score.correctCount +
      result.score.incorrectCount +
      result.score.skippedCount,
    correct: result.score.correctCount,
    incorrect: result.score.incorrectCount,
    skipped: result.score.skippedCount,
    percentage: result.score.accuracyPercent,
    durationMs: result.durationMs,
  };
}
