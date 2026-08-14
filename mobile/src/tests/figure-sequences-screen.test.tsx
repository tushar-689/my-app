import { fireEvent, render } from '@testing-library/react-native';

import { FigureSequencesScreen } from '@/features/practice/screens/figure-sequences-screen';
import { generateFigureSequenceQuestion } from '@/features/practice/figure-sequences/generator';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

const mockRouter = jest.requireMock('expo-router').router as {
  replace: jest.Mock;
};

describe('FigureSequencesScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the visual question and answer options', async () => {
    const view = await render(<FigureSequencesScreen />);

    expect(
      view.getByText('Which pair completes the pattern?'),
    ).toBeOnTheScreen();
    expect(view.getByLabelText('Answer option 1')).toBeOnTheScreen();
    expect(view.getByLabelText('Answer option 4')).toBeOnTheScreen();
  });

  it('selects an answer and progresses to the next question', async () => {
    const view = await render(<FigureSequencesScreen />);

    await fireEvent.press(view.getByLabelText('Answer option 1'));
    expect(view.getByText('Submit Answer')).toBeOnTheScreen();
    await fireEvent.press(view.getByText('Submit Answer'));
    expect(view.getByText('Next Question')).toBeOnTheScreen();
    await fireEvent.press(view.getByText('Next Question'));
    expect(view.getByText('Q. 02 / 10')).toBeOnTheScreen();
    expect(view.getAllByLabelText('figure matrix').length).toBeGreaterThan(0);
    expect(view.getAllByLabelText(/figure$/).length).toBeGreaterThan(0);
  });

  it('keeps figure primitives visible through sequential question transitions', async () => {
    const view = await render(<FigureSequencesScreen />);

    for (let question = 1; question <= 3; question += 1) {
      await fireEvent.press(view.getByLabelText('Answer option 1'));
      await fireEvent.press(view.getByText('Submit Answer'));
      await fireEvent.press(view.getByText('Next Question'));
      expect(view.getByText(`Q. 0${question + 1} / 10`)).toBeOnTheScreen();
      expect(view.getAllByLabelText('figure matrix').length).toBeGreaterThan(0);
      expect(view.getAllByLabelText(/figure$/).length).toBeGreaterThan(0);
    }
  });

  it('keeps figure primitives visible when skipping a question', async () => {
    const view = await render(<FigureSequencesScreen />);

    await fireEvent.press(view.getByText('Skip question'));
    expect(view.getByText('Q. 02 / 10')).toBeOnTheScreen();
    expect(view.getAllByLabelText('figure matrix').length).toBeGreaterThan(0);
    expect(view.getAllByLabelText(/figure$/).length).toBeGreaterThan(0);
  });

  it('navigates to Results after the tenth question', async () => {
    const view = await render(<FigureSequencesScreen />);
    for (let question = 0; question < 10; question += 1) {
      const generated = generateFigureSequenceQuestion({
        seed: 7100 + question,
        difficulty: 'low',
      });
      const correctIndex = generated.options.findIndex(
        (option) => option.id === generated.correctOptionId,
      );
      await fireEvent.press(
        view.getByLabelText(`Answer option ${correctIndex + 1}`),
      );
      await fireEvent.press(view.getByText('Submit Answer'));
      if (question < 9) await fireEvent.press(view.getByText('Next Question'));
    }
    await fireEvent.press(view.getByText('View Results'));
    expect(mockRouter.replace).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\/practice\/figure-sequences\/results\?module=Figure%20Sequences&sessionId=.+&total=10&correct=10&incorrect=0&skipped=0&percentage=100$/,
      ),
    );
  });
});
