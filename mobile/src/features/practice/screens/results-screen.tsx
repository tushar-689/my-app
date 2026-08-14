import { router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';

export function ResultsScreen() {
  const params = useLocalSearchParams<{
    module?: string;
    total?: string;
    correct?: string;
    incorrect?: string;
    skipped?: string;
    percentage?: string;
  }>();
  const total = Number(params.total ?? 10);
  const correct = Number(params.correct ?? 0);
  const incorrect = Number(params.incorrect ?? total - correct);
  const skipped = Number(params.skipped ?? 0);
  const percentage = Number(
    params.percentage ?? Math.round((correct / total) * 100),
  );
  return (
    <AppScreen>
      <ThemedText type="label" themeColor="muted">
        {params.module ?? 'FIGURE SEQUENCES'} / RESULTS
      </ThemedText>
      <ThemedText type="display" style={styles.title}>
        Great effort! ✨
      </ThemedText>
      <AppCard color="green" style={styles.score}>
        <ThemedText type="display">{percentage}%</ThemedText>
        <ThemedText type="button">Your Score</ThemedText>
      </AppCard>
      <View style={styles.stats}>
        <AppCard color="surface">
          <ThemedText type="display">{correct}</ThemedText>
          <ThemedText type="caption">Correct</ThemedText>
        </AppCard>
        <AppCard color="surface">
          <ThemedText type="display">{incorrect}</ThemedText>
          <ThemedText type="caption">Incorrect</ThemedText>
        </AppCard>
        <AppCard color="surface">
          <ThemedText type="display">{skipped}</ThemedText>
          <ThemedText type="caption">Skipped</ThemedText>
        </AppCard>
      </View>
      <AppButton
        label="Practice Again"
        onPress={() => router.replace('/practice/figure-sequences' as never)}
      />
      <AppButton
        label="Back to Home"
        variant="outline"
        onPress={() => router.replace('/' as never)}
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
