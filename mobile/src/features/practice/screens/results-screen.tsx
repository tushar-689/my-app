import { router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';

export function ResultsScreen() {
  const params = useLocalSearchParams<{ total?: string; correct?: string }>();
  const total = Number(params.total ?? 10);
  const correct = Number(params.correct ?? 0);
  return (
    <AppScreen>
      <ThemedText type="label" themeColor="muted">
        FIGURE SEQUENCES / RESULTS
      </ThemedText>
      <ThemedText type="display" style={styles.title}>
        Great effort! ✨
      </ThemedText>
      <AppCard color="green" style={styles.score}>
        <ThemedText type="display">
          {Math.round((correct / total) * 100)}%
        </ThemedText>
        <ThemedText type="button">Your Score</ThemedText>
      </AppCard>
      <View style={styles.stats}>
        <AppCard color="surface">
          <ThemedText type="display">{correct}</ThemedText>
          <ThemedText type="caption">Correct</ThemedText>
        </AppCard>
        <AppCard color="surface">
          <ThemedText type="display">{total - correct}</ThemedText>
          <ThemedText type="caption">Incorrect</ThemedText>
        </AppCard>
      </View>
      <AppButton
        label="Back to Practice"
        onPress={() => router.replace('/practice' as never)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: Spacing.two, marginBottom: Spacing.six },
  score: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginVertical: Spacing.four,
  },
});
