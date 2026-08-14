import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SectionTabs } from '@/components/ui/section-tabs';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

const modules = [
  ['✦', 'Figure Sequences', '24 / 50', 48, 'purple'],
  ['▧', 'Connected Figures', '18 / 40', 45, 'yellow'],
  ['●', 'Row & Column Logic', '20 / 45', 44, 'green'],
  ['▦', 'Matrix Reasoning', '16 / 30', 53, 'orange'],
  ['⌁', 'Rules & Relations', '10 / 25', 40, 'pink'],
] as const;

export function PracticeScreen() {
  const [active, setActive] = useState('Core Module');
  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <ThemedText type="label" themeColor="muted">
            YOUR PREP PLAN
          </ThemedText>
          <ThemedText type="title">Practice</ThemedText>
        </View>
        <ThemedText type="title">⌕</ThemedText>
      </View>
      <SectionTabs
        items={['Core Module', 'Special Module']}
        active={active}
        onChange={setActive}
      />
      <ThemedText type="label" themeColor="muted" style={styles.sectionLabel}>
        {active.toUpperCase()}
      </ThemedText>
      {modules.map(([icon, name, count, progress, color]) => (
        <Pressable key={name} accessibilityRole="button">
          <AppCard color="surface" style={styles.module}>
            <View
              style={[
                styles.moduleIcon,
                { backgroundColor: Colors.light[color] },
              ]}
            >
              <ThemedText type="title">{icon}</ThemedText>
            </View>
            <View style={styles.moduleInfo}>
              <ThemedText type="button">{name}</ThemedText>
              <ProgressBar value={progress} color={Colors.light[color]} />
              <ThemedText type="caption" themeColor="muted">
                {count} questions attempted
              </ThemedText>
            </View>
            <ThemedText type="label">›</ThemedText>
          </AppCard>
        </Pressable>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.five,
  },
  sectionLabel: { marginTop: Spacing.six, marginBottom: Spacing.three },
  module: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
    padding: Spacing.three,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleInfo: { flex: 1, gap: Spacing.two },
});
