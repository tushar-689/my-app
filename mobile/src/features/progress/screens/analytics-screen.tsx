import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SectionTabs } from '@/components/ui/section-tabs';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getPracticeSummary,
  loadPracticeHistory,
  type PracticeSession,
} from '@/features/practice/history/practice-history';
import { useEffect, useState } from 'react';

export function AnalyticsScreen() {
  const theme = useTheme();
  const [summary, setSummary] = useState(() => getPracticeSummary([]));
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [range, setRange] = useState('Week');

  useEffect(() => {
    loadPracticeHistory().then((history) => {
      setHistory(history);
      setSummary(getPracticeSummary(history));
    });
  }, []);

  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <ThemedText type="label" themeColor="muted">
            PROGRESS
          </ThemedText>
          <ThemedText type="title">Analytics</ThemedText>
        </View>
        <ThemedText type="title">⌁</ThemedText>
      </View>
      <SectionTabs
        items={['Week', 'Month', 'All Time']}
        active={range}
        onChange={setRange}
      />
      <AppCard color="surface" style={styles.chart}>
        <ThemedText type="label">ACCURACY</ThemedText>
        <View style={styles.scoreRow}>
          <ThemedText type="display">{summary.accuracy}%</ThemedText>
          <ThemedText type="button" themeColor="greenDark">
            {summary.totalSessions} session
            {summary.totalSessions === 1 ? '' : 's'}
          </ThemedText>
        </View>
        {history.length > 0 ? (
          <View style={styles.graph}>
            {history
              .slice(0, 7)
              .reverse()
              .map((session, index) => (
                <View
                  key={session.id}
                  style={[
                    styles.graphLine,
                    {
                      height: Math.max(8, session.percentage * 0.88),
                      backgroundColor:
                        index % 2 ? theme.accentPurple : theme.accentGreen,
                    },
                  ]}
                />
              ))}
          </View>
        ) : (
          <ThemedText themeColor="muted">No practice data yet.</ThemedText>
        )}
        <ThemedText type="caption" themeColor="muted">
          {summary.totalQuestions} questions completed
        </ThemedText>
      </AppCard>
      <ThemedText type="label" themeColor="muted" style={styles.sectionLabel}>
        TOPIC MASTERY
      </ThemedText>
      <AppCard color="surface">
        {(
          [
            'Figure Sequences',
            'Mathematical Equations',
            'Latin Squares',
          ] as const
        ).map((label, index) => {
          const rows = history.filter((session) => session.module === label);
          const total = rows.reduce((sum, session) => sum + session.total, 0);
          const correct = rows.reduce(
            (sum, session) => sum + session.correct,
            0,
          );
          const value = total ? Math.round((correct / total) * 100) : 0;
          const colors = ['green', 'purple', 'yellow'] as const;
          return (
            <View key={label} style={styles.mastery}>
              <View style={styles.masteryLabel}>
                <ThemedText type="caption">{label}</ThemedText>
                <ThemedText type="caption">
                  {total ? `${value}%` : 'No data yet'}
                </ThemedText>
              </View>
              <ProgressBar value={value} color={theme[colors[index]]} />
            </View>
          );
        })}
      </AppCard>
      <View style={styles.links}>
        <Link href={'/progress/streak' as never} asChild>
          <ThemedText type="button" themeColor="greenDark">
            View streak →
          </ThemedText>
        </Link>
        <Link href={'/progress/achievements' as never} asChild>
          <ThemedText type="button" themeColor="purple">
            Achievements →
          </ThemedText>
        </Link>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.five,
  },
  chart: { marginTop: Spacing.five, gap: Spacing.three },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  graph: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
  },
  graphLine: { width: 18, borderRadius: 8 },
  sectionLabel: { marginTop: Spacing.six, marginBottom: Spacing.three },
  mastery: { gap: Spacing.two, marginBottom: Spacing.four },
  masteryLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.six,
  },
});
