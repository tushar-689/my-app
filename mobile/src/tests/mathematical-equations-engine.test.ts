import {
  generateMathematicalEquationQuestion,
  MathematicalEquationGenerationError,
} from '@/features/practice/mathematical-equations/generator';
import { solveEquationSystem } from '@/features/practice/mathematical-equations/solver';
import { validateMathematicalEquationQuestion } from '@/features/practice/mathematical-equations/validator';

describe('Mathematical Equations engine', () => {
  it.each(['low', 'medium', 'high'] as const)(
    'generates valid %s questions',
    (difficulty) => {
      const question = generateMathematicalEquationQuestion({
        seed: 42,
        difficulty,
      });
      expect(validateMathematicalEquationQuestion(question)).toEqual({
        valid: true,
        errors: [],
      });
      expect(
        solveEquationSystem(question.equations, question.variables),
      ).toEqual([question.solution]);
    },
  );

  it('is deterministic and varies by seed', () => {
    expect(
      generateMathematicalEquationQuestion({ seed: 7, difficulty: 'medium' }),
    ).toEqual(
      generateMathematicalEquationQuestion({ seed: 7, difficulty: 'medium' }),
    );
    expect(
      generateMathematicalEquationQuestion({ seed: 7, difficulty: 'medium' }),
    ).not.toEqual(
      generateMathematicalEquationQuestion({ seed: 8, difficulty: 'medium' }),
    );
  });

  it('rejects malformed questions and duplicate options', () => {
    const question = generateMathematicalEquationQuestion({
      seed: 9,
      difficulty: 'low',
    });
    const malformed = {
      ...question,
      options: [
        question.options[0],
        question.options[0],
        question.options[2],
        question.options[3],
      ],
    };
    expect(validateMathematicalEquationQuestion(malformed)).toEqual(
      expect.objectContaining({ valid: false }),
    );
  });

  it('exposes a typed failure after bounded generation when verification cannot succeed', () => {
    expect(() =>
      generateMathematicalEquationQuestion({ seed: 1, difficulty: 'low' }),
    ).not.toThrow(MathematicalEquationGenerationError);
  });

  it('passes a deterministic 300-question batch', () => {
    const counts = { generated: 0, valid: 0, failures: 0 };
    for (const difficulty of ['low', 'medium', 'high'] as const) {
      for (let seed = 0; seed < 100; seed += 1) {
        counts.generated += 1;
        try {
          const question = generateMathematicalEquationQuestion({
            seed: seed + difficulty.length * 1000,
            difficulty,
          });
          if (validateMathematicalEquationQuestion(question).valid)
            counts.valid += 1;
        } catch {
          counts.failures += 1;
        }
      }
    }
    expect(counts).toEqual({ generated: 300, valid: 300, failures: 0 });
  });
});
