import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { HomeScreen } from '@/features/home/screens/home-screen';
import { AnalyticsScreen } from '@/features/progress/screens/analytics-screen';
import { ResultsScreen } from '@/features/practice/screens/results-screen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(
      JSON.stringify([
        {
          id: 'session-1',
          module: 'Figure Sequences',
          completedAt: '2026-01-01',
          total: 10,
          correct: 7,
          incorrect: 2,
          skipped: 1,
          percentage: 70,
        },
      ]),
    ),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({
    module: 'Figure Sequences',
    total: '10',
    correct: '7',
    incorrect: '2',
    skipped: '1',
    percentage: '70',
  }),
  Link: ({ children }: { children: ReactNode }) => children,
}));

describe('results and local history UI', () => {
  it('displays correct totals and percentage', async () => {
    const view = await render(<ResultsScreen />);

    expect(view.getByText('70%')).toBeOnTheScreen();
    expect(view.getByText('Correct')).toBeOnTheScreen();
    expect(view.getByText('Incorrect')).toBeOnTheScreen();
    expect(view.getByText('Skipped')).toBeOnTheScreen();
  });

  it('offers Practice Again and Home actions', async () => {
    const view = await render(<ResultsScreen />);

    expect(view.getByText('Practice Again')).toBeOnTheScreen();
    expect(view.getByText('Back to Home')).toBeOnTheScreen();
    await fireEvent.press(view.getByText('Practice Again'));
  });

  it('shows the latest result on Home', async () => {
    const view = await render(<HomeScreen />);

    await waitFor(() =>
      expect(view.getAllByText('70%').length).toBeGreaterThan(0),
    );
    expect(view.getByText('1 completed session.')).toBeOnTheScreen();
  });

  it('derives analytics accuracy and question totals from history', async () => {
    const view = await render(<AnalyticsScreen />);

    await waitFor(() =>
      expect(view.getAllByText('70%').length).toBeGreaterThan(0),
    );
    expect(view.getByText('10 questions completed')).toBeOnTheScreen();
  });
});
