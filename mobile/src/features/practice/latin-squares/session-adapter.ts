import type {
  AssessmentResult,
  AssessmentSession,
} from '@/domain/sessions/types';
import { calculateAssessmentScore } from '@/domain/sessions/scoring';
import { transitionSession } from '@/domain/sessions/state';
import { createDeadline } from '@/domain/sessions/timer';
import { generateLatinSquareQuestion } from './generator';
import type { LatinSquareQuestion } from './model';

export type LatinSquareSessionState = {
  session: AssessmentSession;
  questions: LatinSquareQuestion[];
  selectedAnswer: string | null;
  questionStatus: 'active' | 'submitted' | 'expired';
  questionDeadlineAt: number;
};
export function createLatinSquareSession(
  startedAt: number,
  sessionId = `latin-squares-${startedAt}`,
): LatinSquareSessionState {
  const questions = Array.from({ length: 10 }, (_, index) =>
    generateLatinSquareQuestion({
      seed: 8100 + index,
      difficulty: index < 4 ? 'low' : index < 8 ? 'medium' : 'high',
    }),
  );
  return {
    session: {
      id: sessionId,
      module: 'core',
      taskType: 'latin-squares',
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
export function selectLatinSquareAnswer(
  state: LatinSquareSessionState,
  answerId: string,
) {
  return state.questionStatus === 'active' &&
    state.questions[state.session.currentQuestionIndex].options.some(
      (option) => option.id === answerId,
    )
    ? { ...state, selectedAnswer: answerId }
    : state;
}
function finish(
  state: LatinSquareSessionState,
  response: string | null,
  at: number,
  questionStatus: 'submitted' | 'expired',
) {
  const question = state.questions[state.session.currentQuestionIndex];
  const answers = [
    ...state.session.answers,
    {
      questionId: question.id,
      answeredAt: at,
      response,
      isCorrect:
        response === null ? undefined : response === question.correctOptionId,
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
export function submitLatinSquareAnswer(
  state: LatinSquareSessionState,
  at: number,
) {
  return state.questionStatus === 'active' && state.selectedAnswer
    ? finish(state, state.selectedAnswer, at, 'submitted')
    : state;
}
export function skipLatinSquare(state: LatinSquareSessionState, at: number) {
  return state.questionStatus === 'active'
    ? finish(state, null, at, 'submitted')
    : state;
}
export function timeoutLatinSquare(state: LatinSquareSessionState, at: number) {
  return state.questionStatus === 'active'
    ? finish(state, null, at, 'expired')
    : state;
}
export function advanceLatinSquare(state: LatinSquareSessionState, at: number) {
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
export function getLatinSquareResult(
  state: LatinSquareSessionState,
  completedAt: number,
): AssessmentResult {
  return {
    sessionId: state.session.id,
    module: 'core',
    taskType: 'latin-squares',
    mode: 'practice',
    score: calculateAssessmentScore(
      state.session.answers,
      state.questions.length,
    ),
    durationMs: Math.max(0, completedAt - state.session.startedAt),
    completedAt,
  };
}
