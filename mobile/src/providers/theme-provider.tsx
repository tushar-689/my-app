import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { Colors, type Theme } from '@/constants/theme';

type ThemeContextValue = {
  darkMode: false;
  theme: Theme;
  setDarkMode: (enabled: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  theme: Colors.light,
  setDarkMode: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      darkMode: false as const,
      theme: Colors.light,
      setDarkMode: () => undefined,
    }),
    [],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
