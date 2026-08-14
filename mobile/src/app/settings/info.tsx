import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
export default function SettingsInfoRoute() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const content: Record<string, string> = {
    'About dMAT':
      'dMAT Prep is a local-first practice companion for building confidence across the Core reasoning modules.',
    'Terms & Conditions':
      'This alpha is for demonstration and personal practice. Content and scoring are prototype-only and are not an official exam service.',
    Privacy:
      'This prototype stores profile, settings, practice history, and gamification data locally on this device. No cloud account is connected.',
    'Help & Support':
      'For this alpha, return to Practice to start a module, use Profile to edit your local profile, and use Settings to control theme and preferences.',
  };
  return (
    <AppScreen>
      <Stack.Screen options={{ title: title ?? 'Information' }} />
      <ThemedText type="label" themeColor="muted">
        DMAT PREP / INFORMATION
      </ThemedText>
      <ThemedText type="title">{title ?? 'Information'}</ThemedText>
      <ThemedText themeColor="muted">
        {content[title ?? ''] ?? 'Information for this local prototype.'}
      </ThemedText>
    </AppScreen>
  );
}
