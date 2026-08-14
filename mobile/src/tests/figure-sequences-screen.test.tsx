import { fireEvent, render } from '@testing-library/react-native';

import { FigureSequencesScreen } from '@/features/practice/screens/figure-sequences-screen';

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
      view.getByText('Which option completes the pattern?'),
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
  });

  it('navigates to Results after the tenth question', async () => {
    const view = await render(<FigureSequencesScreen />);
    for (let question = 0; question < 10; question += 1) {
      await fireEvent.press(view.getByLabelText('Answer option 1'));
      await fireEvent.press(view.getByText('Submit Answer'));
      if (question < 9) await fireEvent.press(view.getByText('Next Question'));
    }
    await fireEvent.press(view.getByText('View Results'));
    expect(mockRouter.replace).toHaveBeenCalledWith(
      '/practice/figure-sequences/results?total=10&correct=10&incorrect=0&skipped=0',
    );
  });
});
