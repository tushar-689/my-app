import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SectionTabs } from '@/components/ui/section-tabs';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export function AnalyticsScreen() {
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
        active="Week"
        onChange={() => undefined}
      />
      <AppCard color="surface" style={styles.chart}>
        <ThemedText type="label">ACCURACY</ThemedText>
        <View style={styles.scoreRow}>
          <ThemedText type="display">78%</ThemedText>
          <ThemedText type="button" themeColor="greenDark">
            ↑ 8% vs last week
          </ThemedText>
        </View>
        <View style={styles.graph}>
          <View
            style={[
              styles.graphLine,
              { height: 36, backgroundColor: Colors.light.green },
            ]}
          />
          <View
            style={[
              styles.graphLine,
              { height: 20, backgroundColor: Colors.light.purple },
            ]}
          />
          <View
            style={[
              styles.graphLine,
              { height: 54, backgroundColor: Colors.light.green },
            ]}
          />
          <View
            style={[
              styles.graphLine,
              { height: 42, backgroundColor: Colors.light.yellow },
            ]}
          />
          <View
            style={[
              styles.graphLine,
              { height: 74, backgroundColor: Colors.light.green },
            ]}
          />
          <View
            style={[
              styles.graphLine,
              { height: 52, backgroundColor: Colors.light.purple },
            ]}
          />
          <View
            style={[
              styles.graphLine,
              { height: 88, backgroundColor: Colors.light.green },
            ]}
          />
        </View>
        <ThemedText type="caption" themeColor="muted">
          M T W T F S S
        </ThemedText>
      </AppCard>
      <ThemedText type="label" themeColor="muted" style={styles.sectionLabel}>
        TOPIC MASTERY
      </ThemedText>
      <AppCard color="surface">
        {[
          ['Figure Sequences', 82, 'green'],
          ['Connected Figures', 65, 'purple'],
          ['Row & Column Logic', 70, 'yellow'],
          ['Matrix Reasoning', 60, 'pink'],
        ].map(([label, value, color]) => (
          <View key={label} style={styles.mastery}>
            <View style={styles.masteryLabel}>
              <ThemedText type="caption">{label}</ThemedText>
              <ThemedText type="caption">{value}%</ThemedText>
            </View>
            <ProgressBar
              value={Number(value)}
              color={Colors.light[color as keyof typeof Colors.light]}
            />
          </View>
        ))}
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
    borderBottomColor: Colors.light.line,
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
