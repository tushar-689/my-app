import { fireEvent, render } from '@testing-library/react-native';

import { PracticeScreen } from '@/features/practice/screens/practice-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

const mockRouter = jest.requireMock('expo-router').router as {
  push: jest.Mock;
};

describe('PracticeScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the core module cards', async () => {
    const view = await render(<PracticeScreen />);

    expect(view.getByText('Figure Sequences')).toBeOnTheScreen();
    expect(view.getByText('Connected Figures')).toBeOnTheScreen();
    expect(view.getByText('Rules & Relations')).toBeOnTheScreen();
  });

  it('switches to the Special Module state', async () => {
    const view = await render(<PracticeScreen />);

    await fireEvent.press(view.getByText('Special Module'));

    expect(view.getByText('Special modules are coming soon')).toBeOnTheScreen();
    expect(view.queryByText('Figure Sequences')).toBeNull();
  });

  it('navigates when Figure Sequences is selected', async () => {
    const view = await render(<PracticeScreen />);

    await fireEvent.press(view.getByLabelText('Start Figure Sequences'));

    expect(mockRouter.push).toHaveBeenCalledWith('/practice/figure-sequences');
  });

  it('marks non-functional modules as coming soon', async () => {
    const view = await render(<PracticeScreen />);

    expect(
      view.getByLabelText('Connected Figures, coming soon'),
    ).toBeOnTheScreen();
    expect(view.getAllByText('Coming soon')).toHaveLength(4);
  });
});
