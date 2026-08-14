import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useAppTheme } from '@/providers/theme-provider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemeStatusBar />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

function ThemeStatusBar() {
  const { darkMode } = useAppTheme();
  return <StatusBar style={darkMode ? 'light' : 'dark'} />;
}
