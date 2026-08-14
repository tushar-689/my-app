import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/ui/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getPracticeSummary,
  loadPracticeHistory,
  type PracticeSession,
} from '@/features/practice/history/practice-history';
import { getStreakSummary } from '@/features/progress/streaks';
import { loadGamification } from '@/features/gamification/storage';
import { getLevelProgress } from '@/features/gamification/levels';
import { AdPlaceholder } from '@/features/ads/components';
import {
  loadProfile,
  type LocalProfile,
} from '@/features/profile/profile-storage';

export function HomeScreen() {
  const theme = useTheme();
  const [latest, setLatest] = useState<PracticeSession>();
  const [sessionCount, setSessionCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [profile, setProfile] = useState<LocalProfile>();
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    Promise.all([
      loadPracticeHistory(),
      loadProfile(),
      loadGamification(),
    ]).then(([history, value, gamification]) => {
      setProfile(value);
      const summary = getPracticeSummary(history);
      setLatest(summary.latest);
      setSessionCount(summary.totalSessions);
      setCurrentStreak(getStreakSummary(history).currentStreak);
      setTotalXp(gamification.totalXp);
    });
  }, []);
  const level = getLevelProgress(totalXp);

  return (
    <AppScreen>
      <View style={styles.top}>
        <View>
          <ThemedText type="label" themeColor="muted">
            YOUR DASHBOARD
          </ThemedText>
          <ThemedText type="title">
            Hey {profile?.name ?? 'Tushar'} 👋
          </ThemedText>
          <ThemedText themeColor="muted">
            Your next point is waiting.
          </ThemedText>
        </View>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.accentPurple, borderColor: theme.border },
          ]}
        >
          <ThemedText type="title">
            {profile?.name?.charAt(0).toUpperCase() ?? 'T'}
          </ThemedText>
        </View>
      </View>
      <AppCard color="accentGreen" style={styles.goal}>
        <View style={styles.goalText}>
          <ThemedText type="label">PRACTICE ACTIVITY</ThemedText>
          <ThemedText type="display">{sessionCount}</ThemedText>
          <ThemedText type="caption">
            completed session{sessionCount === 1 ? '' : 's'}
          </ThemedText>
        </View>
        <ThemedText type="display">↗</ThemedText>
      </AppCard>
      <AdPlaceholder placement="dMAT PREP+" />
      <AppButton
        label="Explore dMAT PREP+"
        variant="outline"
        onPress={() => router.push('/premium' as never)}
      />
      <AppCard color="accentYellow" style={styles.streak}>
        <View>
          <ThemedText type="label">STREAK</ThemedText>
          <ThemedText type="display">{currentStreak}</ThemedText>
          <ThemedText type="caption">days — keep it up!</ThemedText>
        </View>
        <ThemedText type="display">♨</ThemedText>
      </AppCard>
      <AppCard color="accentPurple" style={styles.progress}>
        <ThemedText type="label">OVERALL PROGRESS</ThemedText>
        <View style={styles.progressRow}>
          <ThemedText type="display">{latest?.percentage ?? 0}%</ThemedText>
          <ThemedText type="caption">
            {latest
              ? sessionCount +
                ' completed session' +
                (sessionCount === 1 ? '.' : 's.')
              : 'Complete a session to see your progress.'}
          </ThemedText>
        </View>
        <ProgressBar
          value={latest?.percentage ?? 0}
          color={theme.textPrimary}
        />
      </AppCard>
      <AppCard color="surface" style={styles.xpCard}>
        <View style={styles.progressRow}>
          <View>
            <ThemedText type="label">LEVEL {level.level}</ThemedText>
            <ThemedText type="title">{totalXp} XP</ThemedText>
          </View>
          <ThemedText type="display">✦</ThemedText>
        </View>
        <ProgressBar value={level.progressPercent} color={theme.accentGreen} />
        <ThemedText type="caption" themeColor="muted">
          {level.xpForNextLevel - level.xpIntoLevel} XP to next level ·{' '}
          {sessionCount} sessions
        </ThemedText>
      </AppCard>
      <View style={styles.section}>
        <ThemedText type="title">Ready to practice?</ThemedText>
        <ThemedText themeColor="muted" style={styles.subtitle}>
          A focused 10-minute session can move you forward.
        </ThemedText>
        <AppButton
          label="Let's go →"
          variant="dark"
          onPress={() => router.push('/practice' as never)}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.five,
    gap: Spacing.three,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  goal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 138,
    marginBottom: Spacing.three,
  },
  goalText: { gap: Spacing.one },
  streak: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 120,
    marginBottom: Spacing.three,
  },
  progress: { minHeight: 145, gap: Spacing.three },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  xpCard: { gap: Spacing.three, marginBottom: Spacing.three },
  section: { gap: Spacing.three, marginTop: Spacing.seven },
  subtitle: { marginTop: -Spacing.two },
});
