import { CORE_MOCK_CONFIG } from '@/features/exam/config';
import { selectCoreMockQuestions } from '@/features/exam/selection';
import {
  advanceExamQuestion,
  completeCoreMock,
  createCoreMockSession,
  selectExamAnswer,
  skipExamQuestion,
  submitExamAnswer,
} from '@/features/exam/session-adapter';

describe('Core Practice Mock', () => {
  it('selects the configured deterministic distribution', () => {
    const questions = selectCoreMockQuestions(1);
    expect(questions).toHaveLength(CORE_MOCK_CONFIG.questionCount);
    expect(new Set(questions.map((item) => item.question.id)).size).toBe(30);
    expect(
      questions.filter((item) => item.module === 'figure-sequences'),
    ).toHaveLength(10);
    expect(questions).toEqual(selectCoreMockQuestions(1));
  });
  it('supports sequential answers and overall timeout finalization', () => {
    let state = createCoreMockSession(1000);
    state = selectExamAnswer(state, state.questions[0].question.options[0].id);
    state = submitExamAnswer(state, 1100);
    expect(state.session.answers).toHaveLength(1);
    state = advanceExamQuestion(state, 1200);
    expect(state.session.currentQuestionIndex).toBe(1);
    state = skipExamQuestion(state, 1300);
    state = completeCoreMock(state, 2000);
    expect(state.finalized).toBe(true);
    expect(state.session.answers).toHaveLength(30);
    expect(completeCoreMock(state, 3000)).toBe(state);
  });
});
