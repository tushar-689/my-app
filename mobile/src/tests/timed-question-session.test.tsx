import { act, fireEvent, render } from '@testing-library/react-native';

import { FigureSequencesScreen } from '@/features/practice/screens/figure-sequences-screen';
import {
  formatRemaining,
  getRemainingMs,
  startDeadlineTicker,
} from '@/features/practice/figure-sequences/timer';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

describe('timed question sessions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    jest.clearAllMocks();
  });

  afterEach(() => jest.useRealTimers());

  it('derives remaining time from a deadline and reaches zero', () => {
    const deadline = Date.now() + 60_000;
    expect(getRemainingMs(deadline)).toBe(60_000);
    jest.advanceTimersByTime(12_500);
    expect(getRemainingMs(deadline)).toBe(47_500);
    expect(formatRemaining(getRemainingMs(deadline))).toBe('00:48');
    jest.advanceTimersByTime(47_500);
    expect(getRemainingMs(deadline)).toBe(0);
  });

  it('starts each question with a sixty-second display timer', async () => {
    const view = await render(<FigureSequencesScreen />);

    expect(view.getByText(/01:00/)).toBeOnTheScreen();
  });

  it('times out once, skips the question, and does not count it as incorrect', async () => {
    const view = await render(<FigureSequencesScreen />);

    await act(async () => {
      jest.advanceTimersByTime(60_000);
      jest.advanceTimersByTime(350);
    });

    expect(view.getByText('Q. 02 / 10')).toBeOnTheScreen();
    expect(
      view.getByText('0 correct · 0 incorrect · 1 skipped'),
    ).toBeOnTheScreen();
  });

  it('skips once and advances without counting an incorrect answer', async () => {
    const view = await render(<FigureSequencesScreen />);

    await fireEvent.press(view.getByRole('button', { name: 'Skip question' }));

    expect(view.getByText('Q. 02 / 10')).toBeOnTheScreen();
    expect(
      view.getByText('0 correct · 0 incorrect · 1 skipped'),
    ).toBeOnTheScreen();
    expect(view.queryByText('Skip question')).toBeOnTheScreen();
  });

  it('cleans up the timer when the question unmounts', async () => {
    const stop = startDeadlineTicker(Date.now() + 60_000, jest.fn(), jest.fn());
    expect(jest.getTimerCount()).toBe(1);
    stop();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('counts an incorrect submission once', async () => {
    const view = await render(<FigureSequencesScreen />);

    await fireEvent.press(
      view.getByRole('button', { name: 'Answer option 2' }),
    );
    await fireEvent.press(view.getByText('Submit Answer'));

    expect(
      view.getByText('0 correct · 1 incorrect · 0 skipped'),
    ).toBeOnTheScreen();
    expect(view.queryByText('Submit Answer')).toBeNull();
  });
});
