import type {
  AssessmentResult,
  AssessmentSession,
  SessionConfig,
} from '@/domain/sessions/types';
import { calculateAssessmentScore } from '@/domain/sessions/scoring';
import { transitionSession } from '@/domain/sessions/state';
import { createDeadline } from '@/domain/sessions/timer';
import type { QuestionAnswer } from '@/domain/questions/types';
import { generateMathematicalEquationQuestion } from './generator';
import type { MathematicalEquationQuestion } from './model';

export const MATHEMATICAL_EQUATION_SESSION_CONFIG: SessionConfig = {
  questionCount: 10,
  durationMs: 60_000,
  allowPause: false,
  allowHints: false,
  showImmediateFeedback: true,
  allowAnswerChanges: false,
  showExplanationAfterAnswer: false,
};
export type MathematicalEquationSessionState = {
  session: AssessmentSession;
  questions: MathematicalEquationQuestion[];
  selectedAnswer: string | null;
  questionStatus: 'active' | 'submitted' | 'expired';
  questionDeadlineAt: number;
};

export function createMathematicalEquationSession(
  startedAt: number,
  sessionId = `mathematical-equations-${startedAt}`,
): MathematicalEquationSessionState {
  const questions = Array.from({ length: 10 }, (_, index) =>
    generateMathematicalEquationQuestion({
      seed: 9100 + index,
      difficulty: index < 4 ? 'low' : index < 8 ? 'medium' : 'high',
    }),
  );
  return {
    session: {
      id: sessionId,
      module: 'core',
      taskType: 'mathematical-equations',
      mode: 'practice',
      questionIds: questions.map((question) => question.id),
      currentQuestionIndex: 0,
      answers: [],
      startedAt,
      status: 'in-progress',
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      version: 1,
    },
    questions,
    selectedAnswer: null,
    questionStatus: 'active',
    questionDeadlineAt: createDeadline(startedAt, 60_000) as number,
  };
}

export function selectMathematicalEquationAnswer(
  state: MathematicalEquationSessionState,
  answerId: string,
) {
  return state.questionStatus === 'active' &&
    state.questions[state.session.currentQuestionIndex].options.some(
      (option) => option.id === answerId,
    )
    ? { ...state, selectedAnswer: answerId }
    : state;
}
function finalize(
  state: MathematicalEquationSessionState,
  response: string | null,
  at: number,
  questionStatus: 'submitted' | 'expired',
) {
  const question = state.questions[state.session.currentQuestionIndex];
  const answers: QuestionAnswer[] = [
    ...state.session.answers,
    {
      questionId: question.id,
      answeredAt: at,
      response,
      isCorrect: response === question.correctOptionId,
    },
  ];
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
    questionStatus,
  };
}
export function submitMathematicalEquationAnswer(
  state: MathematicalEquationSessionState,
  at: number,
) {
  return state.questionStatus === 'active' && state.selectedAnswer
    ? finalize(state, state.selectedAnswer, at, 'submitted')
    : state;
}
export function skipMathematicalEquationQuestion(
  state: MathematicalEquationSessionState,
  at: number,
) {
  return state.questionStatus === 'active'
    ? finalize(state, null, at, 'submitted')
    : state;
}
export function timeoutMathematicalEquationQuestion(
  state: MathematicalEquationSessionState,
  at: number,
) {
  return state.questionStatus === 'active'
    ? finalize(state, null, at, 'expired')
    : state;
}
export function advanceMathematicalEquationSession(
  state: MathematicalEquationSessionState,
  at: number,
) {
  if (state.questionStatus === 'active') return state;
  const next = state.session.currentQuestionIndex + 1;
  if (next >= state.questions.length)
    return {
      ...state,
      session: transitionSession(state.session, 'completed', at),
      selectedAnswer: null,
    };
  return {
    ...state,
    session: { ...state.session, currentQuestionIndex: next },
    selectedAnswer: null,
    questionStatus: 'active' as const,
    questionDeadlineAt: createDeadline(at, 60_000) as number,
  };
}
export function getMathematicalEquationResult(
  state: MathematicalEquationSessionState,
  completedAt: number,
): AssessmentResult {
  return {
    sessionId: state.session.id,
    module: 'core',
    taskType: 'mathematical-equations',
    mode: 'practice',
    score: calculateAssessmentScore(
      state.session.answers,
      state.questions.length,
    ),
    durationMs: Math.max(0, completedAt - state.session.startedAt),
    completedAt,
  };
}
