import { render } from '@testing-library/react-native';

import { FigureRenderer } from '@/features/practice/figure-sequences/figure-renderer';
import {
  FIGURE_RULES,
  generateQuestion,
} from '@/features/practice/figure-sequences/generator';

describe('Figure Sequences engine', () => {
  it('is deterministic for the same seed', () => {
    expect(generateQuestion(42, 1)).toEqual(generateQuestion(42, 1));
  });

  it('can produce different questions for different seeds', () => {
    expect(generateQuestion(42, 1)).not.toEqual(generateQuestion(43, 1));
  });

  it('includes a unique correct answer among its options', () => {
    const question = generateQuestion(99, 2);
    expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
    expect(question.correctAnswer).toBeLessThan(question.answerOptions.length);
    expect(
      new Set(question.answerOptions.map((option) => JSON.stringify(option)))
        .size,
    ).toBe(4);
  });

  it.each(FIGURE_RULES)('generates valid %s questions', (rule) => {
    let seed = 1;
    while (generateQuestion(seed).rule !== rule) seed += 1;
    const question = generateQuestion(seed);
    expect(question.sequence).toHaveLength(4);
    expect(question.answerOptions[question.correctAnswer]).toEqual(
      expect.objectContaining({ shape: expect.any(String) }),
    );
  });

  it('renders every generated figure model', async () => {
    const question = generateQuestion(123);
    const view = await render(<FigureRenderer figure={question.sequence[0]} />);
    expect(view.toJSON()).toBeTruthy();
  });
});
