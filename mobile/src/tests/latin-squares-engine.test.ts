import { generateLatinSquareQuestion } from '@/features/practice/latin-squares/generator';
import { validateLatinSquareQuestion } from '@/features/practice/latin-squares/validator';
import {
  advanceLatinSquare,
  createLatinSquareSession,
  selectLatinSquareAnswer,
  skipLatinSquare,
  submitLatinSquareAnswer,
  timeoutLatinSquare,
} from '@/features/practice/latin-squares/session-adapter';

describe('Latin Squares engine', () => {
  it.each(['low', 'medium', 'high'] as const)(
    'generates valid %s puzzles',
    (difficulty) => {
      const question = generateLatinSquareQuestion({ seed: 42, difficulty });
      expect(validateLatinSquareQuestion(question)).toEqual({
        valid: true,
        errors: [],
      });
    },
  );
  it('is deterministic and varies by seed', () => {
    expect(
      generateLatinSquareQuestion({ seed: 4, difficulty: 'medium' }),
    ).toEqual(generateLatinSquareQuestion({ seed: 4, difficulty: 'medium' }));
    expect(
      generateLatinSquareQuestion({ seed: 4, difficulty: 'medium' }),
    ).not.toEqual(
      generateLatinSquareQuestion({ seed: 5, difficulty: 'medium' }),
    );
  });
  it('rejects malformed rows, columns, and duplicate options', () => {
    const question = generateLatinSquareQuestion({
      seed: 8,
      difficulty: 'high',
    });
    expect(
      validateLatinSquareQuestion({
        ...question,
        solution: question.solution.map((row, index) =>
          index === 0 ? [...row].reverse() : row,
        ),
      }),
    ).toEqual(expect.objectContaining({ valid: false }));
    expect(
      validateLatinSquareQuestion({
        ...question,
        options: [
          question.options[0],
          question.options[0],
          ...question.options.slice(2),
        ],
      }),
    ).toEqual(expect.objectContaining({ valid: false }));
  });
  it('supports selection, submit, skip, timeout, and completion', () => {
    const started = createLatinSquareSession(1000);
    const selected = selectLatinSquareAnswer(
      started,
      started.questions[0].correctOptionId,
    );
    const submitted = submitLatinSquareAnswer(selected, 1100);
    expect(submitted.session.correctCount).toBe(1);
    const skipped = skipLatinSquare(createLatinSquareSession(1000), 1200);
    expect(skipped.session.skippedCount).toBe(1);
    expect(
      timeoutLatinSquare(createLatinSquareSession(1000), 62000).questionStatus,
    ).toBe('expired');
    let completed = createLatinSquareSession(1000);
    for (let index = 0; index < 10; index += 1)
      completed = advanceLatinSquare(
        skipLatinSquare(completed, 2000 + index),
        3000 + index,
      );
    expect(completed.session.status).toBe('completed');
  });
  it('passes the 300-question batch', () => {
    const counts = { generated: 0, valid: 0, failed: 0 };
    for (const difficulty of ['low', 'medium', 'high'] as const)
      for (let seed = 0; seed < 100; seed += 1) {
        counts.generated += 1;
        const question = generateLatinSquareQuestion({
          seed: seed + difficulty.length * 1000,
          difficulty,
        });
        if (validateLatinSquareQuestion(question).valid) counts.valid += 1;
        else counts.failed += 1;
      }
    expect(counts).toEqual({ generated: 300, valid: 300, failed: 0 });
  });
});
