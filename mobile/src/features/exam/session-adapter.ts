import type {
  AssessmentResult,
  AssessmentSession,
} from '@/domain/sessions/types';
import type { QuestionAnswer } from '@/domain/questions/types';
import { calculateAssessmentScore } from '@/domain/sessions/scoring';
import { transitionSession } from '@/domain/sessions/state';
import { createDeadline } from '@/domain/sessions/timer';
import { CORE_MOCK_CONFIG } from './config';
import { selectCoreMockQuestions, type ExamQuestion } from './selection';

export type CoreMockState = {
  session: AssessmentSession;
  questions: ExamQuestion[];
  selectedAnswer: string | null;
  finalized: boolean;
};
export function createCoreMockSession(
  startedAt: number,
  sessionId = `core-mock-${startedAt}`,
): CoreMockState {
  const questions = selectCoreMockQuestions();
  return {
    session: {
      id: sessionId,
      module: 'core',
      taskType: undefined,
      mode: 'exam-simulation',
      questionIds: questions.map(({ question }) => question.id),
      currentQuestionIndex: 0,
      answers: [],
      startedAt,
      deadlineAt: createDeadline(
        startedAt,
        CORE_MOCK_CONFIG.durationSeconds * 1000,
      ),
      status: 'in-progress',
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      version: 1,
    },
    questions,
    selectedAnswer: null,
    finalized: false,
  };
}
function optionIds(item: ExamQuestion): string[] {
  return item.module === 'figure-sequences'
    ? item.question.options.map((option) => option.id)
    : item.question.options.map((option) => option.id);
}
function correctId(item: ExamQuestion) {
  return item.question.correctOptionId;
}
export function selectExamAnswer(
  state: CoreMockState,
  answerId: string,
): CoreMockState {
  const item = state.questions[state.session.currentQuestionIndex];
  return !state.finalized && optionIds(item).includes(answerId)
    ? { ...state, selectedAnswer: answerId }
    : state;
}
function append(
  state: CoreMockState,
  response: string | null,
  at: number,
): CoreMockState {
  if (state.finalized) return state;
  const item = state.questions[state.session.currentQuestionIndex];
  const answers: QuestionAnswer[] = [
    ...state.session.answers,
    {
      questionId: item.question.id,
      answeredAt: at,
      response,
      isCorrect: response === null ? undefined : response === correctId(item),
    },
  ];
  const score = calculateAssessmentScore(answers, state.questions.length);
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
    selectedAnswer: null,
  };
}
export function submitExamAnswer(state: CoreMockState, at: number) {
  return state.selectedAnswer ? append(state, state.selectedAnswer, at) : state;
}
export function skipExamQuestion(state: CoreMockState, at: number) {
  return append(state, null, at);
}
export function completeCoreMock(
  state: CoreMockState,
  at: number,
): CoreMockState {
  if (state.finalized) return state;
  const answers = [...state.session.answers];
  while (answers.length < state.questions.length)
    answers.push({
      questionId: state.questions[answers.length].question.id,
      answeredAt: at,
      response: null,
    });
  const score = calculateAssessmentScore(answers, state.questions.length);
  return {
    ...state,
    session: {
      ...transitionSession(
        {
          ...state.session,
          answers,
          correctCount: score.correctCount,
          incorrectCount: score.incorrectCount,
          skippedCount: score.skippedCount,
        },
        'completed',
        at,
      ),
      answers,
      correctCount: score.correctCount,
      incorrectCount: score.incorrectCount,
      skippedCount: score.skippedCount,
    },
    finalized: true,
    selectedAnswer: null,
  };
}
export function advanceExamQuestion(
  state: CoreMockState,
  at: number,
): CoreMockState {
  if (state.finalized) return state;
  if (state.session.currentQuestionIndex >= state.questions.length - 1)
    return completeCoreMock(state, at);
  return {
    ...state,
    session: {
      ...state.session,
      currentQuestionIndex: state.session.currentQuestionIndex + 1,
    },
  };
}
export function getCoreMockResult(
  state: CoreMockState,
  completedAt: number,
): AssessmentResult {
  return {
    sessionId: state.session.id,
    module: 'core',
    mode: 'exam-simulation',
    score: calculateAssessmentScore(
      state.session.answers,
      state.questions.length,
    ),
    durationMs: Math.max(0, completedAt - state.session.startedAt),
    completedAt,
  };
}
