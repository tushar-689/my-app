import {
  advanceFigureSequenceSession,
  createFigureSequenceSession,
  getFigureSequenceResult,
  selectFigureSequenceAnswer,
  skipFigureSequenceQuestion,
  submitFigureSequenceAnswer,
  timeoutFigureSequenceQuestion,
  toPracticeHistoryRecord,
} from '@/features/practice/figure-sequences/session-adapter';

describe('Figure Sequences session adapter', () => {
  it('initializes a generic session with the current prototype configuration', () => {
    const state = createFigureSequenceSession(1_000);
    expect(state.session.status).toBe('in-progress');
    expect(state.session.module).toBe('core');
    expect(state.session.taskType).toBe('figure-sequences');
    expect(state.session.questionIds).toHaveLength(10);
    expect(state.questionDeadlineAt).toBe(61_000);
    expect(state.selectedAnswer).toBeNull();
  });

  it('keeps every session question renderable across all ten indexes', () => {
    const state = createFigureSequenceSession(1_000);
    state.questions.forEach((question) => {
      const figureCount = (matrix: (typeof question.sequence)[number]) =>
        matrix.cells
          .flat()
          .reduce((total, cell) => total + cell.figures.length, 0);
      expect(question.sequence).toHaveLength(5);
      expect(question.sequence.every((matrix) => figureCount(matrix) > 0)).toBe(
        true,
      );
      expect(question.targets.every((matrix) => figureCount(matrix) > 0)).toBe(
        true,
      );
      expect(
        question.options.every(
          (option) =>
            figureCount(option.first) > 0 && figureCount(option.second) > 0,
        ),
      ).toBe(true);
    });
  });

  it('advances to question two without changing its generated data', () => {
    let state = createFigureSequenceSession(1_000);
    const questionTwo = JSON.parse(JSON.stringify(state.questions[1]));
    state = selectFigureSequenceAnswer(
      state,
      state.questions[0].correctOptionId,
    );
    state = submitFigureSequenceAnswer(state, 2_000);
    state = advanceFigureSequenceSession(state, 2_001);

    expect(state.session.currentQuestionIndex).toBe(1);
    expect(state.questions[1]).toEqual(questionTwo);
  });

  it('does not mutate a question when selecting, submitting, or advancing', () => {
    let state = createFigureSequenceSession(1_000);
    const before = JSON.parse(JSON.stringify(state.questions));

    for (let index = 0; index < state.questions.length; index += 1) {
      const question = state.questions[state.session.currentQuestionIndex];
      state = selectFigureSequenceAnswer(state, question.correctOptionId);
      state = submitFigureSequenceAnswer(state, 2_000 + index);
      state = advanceFigureSequenceSession(state, 2_001 + index);
    }

    expect(state.questions).toEqual(before);
    expect(state.session.status).toBe('completed');
  });

  it('selects and submits a correct answer through generic QuestionAnswer data', () => {
    let state = createFigureSequenceSession(1_000);
    const correctOptionId = state.questions[0].correctOptionId;
    state = selectFigureSequenceAnswer(state, correctOptionId);
    state = submitFigureSequenceAnswer(state, 2_000);
    expect(state.questionStatus).toBe('submitted');
    expect(state.session.answers).toHaveLength(1);
    expect(state.session.answers[0]).toMatchObject({
      questionId: 'figure-sequence-v2-low-7100',
      response: correctOptionId,
      isCorrect: true,
      answeredAt: 2_000,
    });
    expect(state.session.correctCount).toBe(1);
    expect(state.session.incorrectCount).toBe(0);
  });

  it('handles incorrect answers and prevents submitting twice', () => {
    let state = createFigureSequenceSession(1_000);
    const wrongOption = state.questions[0].options.find(
      (option) => option.id !== state.questions[0].correctOptionId,
    )!;
    state = selectFigureSequenceAnswer(state, wrongOption.id);
    state = submitFigureSequenceAnswer(state, 2_000);
    const submitted = submitFigureSequenceAnswer(state, 3_000);
    expect(submitted).toEqual(state);
    expect(state.session.incorrectCount).toBe(1);
    expect(state.session.answers).toHaveLength(1);
  });

  it('skips and advances without counting unanswered questions as skipped', () => {
    let state = createFigureSequenceSession(1_000);
    state = skipFigureSequenceQuestion(state, 2_000);
    expect(state.session.skippedCount).toBe(1);
    expect(state.session.incorrectCount).toBe(0);
    state = advanceFigureSequenceSession(state, 2_001);
    expect(state.session.currentQuestionIndex).toBe(1);
    expect(state.questionStatus).toBe('active');
    expect(state.session.skippedCount).toBe(1);
  });

  it('times out once, prevents answering, and then advances', () => {
    let state = createFigureSequenceSession(1_000);
    state = timeoutFigureSequenceQuestion(state, 61_000);
    expect(state.questionStatus).toBe('expired');
    expect(state.session.skippedCount).toBe(1);
    expect(submitFigureSequenceAnswer(state, 61_001)).toEqual(state);
    expect(timeoutFigureSequenceQuestion(state, 61_002)).toEqual(state);
    state = advanceFigureSequenceSession(state, 61_350);
    expect(state.session.currentQuestionIndex).toBe(1);
    expect(state.session.skippedCount).toBe(1);
  });

  it('completes exactly after ten finalized questions and creates compatible results', () => {
    let state = createFigureSequenceSession(1_000);
    for (let index = 0; index < 10; index += 1) {
      state = selectFigureSequenceAnswer(
        state,
        state.questions[state.session.currentQuestionIndex].correctOptionId,
      );
      state = submitFigureSequenceAnswer(state, 2_000 + index);
      state = advanceFigureSequenceSession(state, 2_001 + index);
    }
    expect(state.session.status).toBe('completed');
    expect(state.session.correctCount).toBe(10);
    expect(state.session.incorrectCount).toBe(0);
    expect(state.session.skippedCount).toBe(0);
    const result = getFigureSequenceResult(state, 12_000);
    expect(result.score).toEqual({
      correctCount: 10,
      incorrectCount: 0,
      skippedCount: 0,
      accuracyPercent: 100,
      score: 10,
    });
    expect(result.durationMs).toBe(11_000);
    expect(toPracticeHistoryRecord(result)).toMatchObject({
      id: state.session.id,
      module: 'Figure Sequences',
      total: 10,
      correct: 10,
      percentage: 100,
    });
  });
});
