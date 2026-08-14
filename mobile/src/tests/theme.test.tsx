import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider, useAppTheme } from '@/providers/theme-provider';

function ThemeProbe() {
  const { theme } = useAppTheme();
  return (
    <Text testID="theme-values">
      {`${theme.background}|${theme.textPrimary}`}
    </Text>
  );
}

describe('application theme', () => {
  it.each([
    ['system light', 'light'],
    ['system dark', 'dark'],
  ] as const)(
    '%s keeps the app on the light dMAT palette',
    async (_label, _systemScheme) => {
      const view = await render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      );
      expect(view.getByTestId('theme-values')).toHaveTextContent(
        '#FFFDF0|#171717',
      );
    },
  );
});
