import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
export default function SettingsInfoRoute() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  return (
    <AppScreen>
      <Stack.Screen options={{ title: title ?? 'Information' }} />
      <ThemedText type="label" themeColor="muted">
        DMAT PREP / INFORMATION
      </ThemedText>
      <ThemedText type="title">{title ?? 'Information'}</ThemedText>
      <ThemedText themeColor="muted">
        This prototype page is ready for the full{' '}
        {title?.toLowerCase() ?? 'information'} content in a later release.
      </ThemedText>
    </AppScreen>
  );
}
