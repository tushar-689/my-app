import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider, useAppTheme } from '@/providers/theme-provider';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockGetItem = jest.requireMock(
  '@react-native-async-storage/async-storage',
).default.getItem as jest.Mock;

function ThemeProbe() {
  const { theme } = useAppTheme();
  return (
    <Text testID="theme-values">
      {`${theme.background}|${theme.textPrimary}`}
    </Text>
  );
}

describe('application theme', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['system light, dMAT light', 'light', false, '#FFFDF0', '#171717'],
    ['system light, dMAT dark', 'light', true, '#191A16', '#F7F6E8'],
    ['system dark, dMAT light', 'dark', false, '#FFFDF0', '#171717'],
    ['system dark, dMAT dark', 'dark', true, '#191A16', '#F7F6E8'],
  ] as const)(
    '%s keeps the app palette controlled by persisted dMAT mode',
    async (_label, _systemScheme, darkMode, background, textPrimary) => {
      mockGetItem.mockResolvedValueOnce(JSON.stringify({ darkMode }));
      const view = await render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(view.getByTestId('theme-values')).toHaveTextContent(
          `${background}|${textPrimary}`,
        );
      });
    },
  );
});
