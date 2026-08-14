import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export function HomeScreen() {
  return (
    <AppScreen>
      <View style={styles.top}>
        <View>
          <ThemedText type="label" themeColor="muted">
            MONDAY, 12 MAY
          </ThemedText>
          <ThemedText type="title">Hey Tushar 👋</ThemedText>
          <ThemedText themeColor="muted">
            Let&apos;s make today count.
          </ThemedText>
        </View>
        <View style={styles.avatar}>
          <ThemedText type="title">T</ThemedText>
        </View>
      </View>
      <AppCard color="green" style={styles.goal}>
        <View style={styles.goalText}>
          <ThemedText type="label">DAILY GOAL</ThemedText>
          <ThemedText type="display">3 / 5</ThemedText>
          <ThemedText type="caption">Mocks completed</ThemedText>
        </View>
        <ThemedText type="display">↗</ThemedText>
      </AppCard>
      <AppCard color="yellow" style={styles.streak}>
        <View>
          <ThemedText type="label">STREAK</ThemedText>
          <ThemedText type="display">22</ThemedText>
          <ThemedText type="caption">days — keep it up!</ThemedText>
        </View>
        <ThemedText type="display">♨</ThemedText>
      </AppCard>
      <AppCard color="purple" style={styles.progress}>
        <ThemedText type="label">OVERALL PROGRESS</ThemedText>
        <View style={styles.progressRow}>
          <ThemedText type="display">68%</ThemedText>
          <ThemedText type="caption">
            You&apos;re ahead of 68% of test takers.
          </ThemedText>
        </View>
        <ProgressBar value={68} color={Colors.light.ink} />
      </AppCard>
      <View style={styles.section}>
        <ThemedText type="title">Ready to practice?</ThemedText>
        <ThemedText themeColor="muted" style={styles.subtitle}>
          A focused 10-minute session can move you forward.
        </ThemedText>
        <AppButton
          label="Start Practice"
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
    backgroundColor: Colors.light.purple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.line,
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
  section: { gap: Spacing.three, marginTop: Spacing.seven },
  subtitle: { marginTop: -Spacing.two },
});
