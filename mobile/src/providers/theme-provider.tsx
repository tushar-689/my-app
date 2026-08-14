import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { Colors, type Theme } from '@/constants/theme';
import {
  defaultSettings,
  loadSettings,
} from '@/features/profile/profile-storage';

type ThemeContextValue = {
  darkMode: boolean;
  theme: Theme;
  setDarkMode: (enabled: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  darkMode: defaultSettings.darkMode,
  theme: Colors.light,
  setDarkMode: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(defaultSettings.darkMode);

  useEffect(() => {
    loadSettings().then((settings) => setDarkMode(settings.darkMode));
  }, []);

  const value = useMemo(
    () => ({
      darkMode,
      theme: darkMode ? Colors.dark : Colors.light,
      setDarkMode,
    }),
    [darkMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
