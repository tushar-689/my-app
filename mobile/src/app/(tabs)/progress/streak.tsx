import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { loadPracticeHistory } from '@/features/practice/history/practice-history';
import {
  getStreakSummary,
  type StreakSummary,
} from '@/features/progress/streaks';

export default function StreakRoute() {
  const [summary, setSummary] = useState<StreakSummary>(() =>
    getStreakSummary([]),
  );
  useEffect(() => {
    loadPracticeHistory().then((history) =>
      setSummary(getStreakSummary(history)),
    );
  }, []);
  return (
    <AppScreen>
      <ThemedText type="label" themeColor="muted">
        PROGRESS / STREAK
      </ThemedText>
      <ThemedText type="title">Keep the spark alive.</ThemedText>
      <ThemedText themeColor="muted">
        {summary.currentStreak
          ? 'You are building a beautiful rhythm.'
          : 'Start a practice session today to begin your streak.'}
      </ThemedText>
      <AppCard color="yellow" style={styles.hero}>
        <ThemedText type="label">CURRENT STREAK</ThemedText>
        <ThemedText type="display">{summary.currentStreak}</ThemedText>
        <ThemedText type="caption">active days in a row</ThemedText>
      </AppCard>
      <View style={styles.stats}>
        <AppCard style={styles.stat}>
          <ThemedText type="label">LONGEST</ThemedText>
          <ThemedText type="title">{summary.longestStreak} days</ThemedText>
        </AppCard>
        <AppCard style={styles.stat}>
          <ThemedText type="label">ACTIVE DAYS</ThemedText>
          <ThemedText type="title">{summary.activeDays}</ThemedText>
        </AppCard>
      </View>
      <AppCard style={styles.week}>
        <ThemedText type="label">THIS WEEK</ThemedText>
        <View style={styles.days}>
          {summary.weeklyActivity.map((day) => (
            <View key={day.dateKey} style={styles.day}>
              <View style={[styles.dot, day.active && styles.active]}>
                <ThemedText type="caption">{day.active ? '✓' : ''}</ThemedText>
              </View>
              <ThemedText type="caption">{day.label}</ThemedText>
            </View>
          ))}
        </View>
      </AppCard>
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  hero: { marginTop: Spacing.five, gap: Spacing.one },
  stats: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.three },
  stat: { flex: 1, minHeight: 100, gap: Spacing.two },
  week: { marginTop: Spacing.three, gap: Spacing.four },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: Spacing.one },
  dot: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.light.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { backgroundColor: Colors.light.green },
});
