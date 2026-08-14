import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import LaunchRoute from '@/app/index';
import { ONBOARDING_COMPLETE_KEY } from '@/features/onboarding/onboarding-storage';
import { OnboardingScreen } from '@/features/onboarding/screens/onboarding-screen';

const MockText = Text;

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  Redirect: ({ href }: { href: string }) => (
    <MockText testID="redirect">{href}</MockText>
  ),
}));

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockRouter = jest.requireMock('expo-router').router as {
  replace: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  storage.getItem.mockResolvedValue(null);
  storage.setItem.mockResolvedValue(undefined);
});

describe('onboarding', () => {
  it('renders the first slide', async () => {
    const view = await render(<OnboardingScreen />);

    expect(view.getByText('Dreaming of Germany?')).toBeOnTheScreen();
    expect(
      view.getByText("We'll help you take one step closer."),
    ).toBeOnTheScreen();
  });

  it('progresses through the slides', async () => {
    const view = await render(<OnboardingScreen />);

    await fireEvent.press(view.getByLabelText('Next'));
    expect(view.getByText('Beat the timer. Crack dMAT.')).toBeOnTheScreen();
    await fireEvent.press(view.getByLabelText('Next'));
    expect(view.getByText('Everything you need.')).toBeOnTheScreen();
  });

  it('persists completion and navigates to Home', async () => {
    const view = await render(<OnboardingScreen />);

    await fireEvent.press(view.getByLabelText('Next'));
    await fireEvent.press(view.getByLabelText('Next'));
    await fireEvent.press(view.getByLabelText('Get started'));

    await waitFor(() => {
      expect(storage.setItem).toHaveBeenCalledWith(
        ONBOARDING_COMPLETE_KEY,
        'true',
      );
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('skips onboarding when completion is persisted', async () => {
    storage.getItem.mockResolvedValue('true');
    const view = await render(<LaunchRoute />);

    await waitFor(() =>
      expect(view.getByTestId('redirect')).toHaveTextContent('/(tabs)'),
    );
  });
});
