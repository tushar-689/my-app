import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SectionTabs } from '@/components/ui/section-tabs';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { loadPracticeHistory } from '@/features/practice/history/practice-history';
import {
  evaluateAchievements,
  type Achievement,
} from '@/features/progress/achievements';

export default function AchievementsRoute() {
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState<Achievement[]>([]);
  useEffect(() => {
    loadPracticeHistory().then((history) =>
      setItems(evaluateAchievements(history)),
    );
  }, []);
  const visible = items.filter(
    (item) =>
      filter === 'All' ||
      (filter === 'Unlocked' ? item.unlocked : !item.unlocked),
  );
  return (
    <AppScreen>
      <ThemedText type="label" themeColor="muted">
        PROGRESS / ACHIEVEMENTS
      </ThemedText>
      <ThemedText type="title">Small wins, big momentum.</ThemedText>
      <SectionTabs
        items={['All', 'Unlocked', 'Locked']}
        active={filter}
        onChange={setFilter}
      />
      <ThemedText themeColor="muted">
        {visible.length} achievement{visible.length === 1 ? '' : 's'}
      </ThemedText>
      {visible.map((item) => (
        <AppCard
          key={item.id}
          color={item.unlocked ? 'green' : undefined}
          style={styles.card}
        >
          <ThemedText type="label">
            {item.unlocked ? 'UNLOCKED' : 'LOCKED'}
          </ThemedText>
          <ThemedText type="title">{item.title}</ThemedText>
          <ThemedText themeColor="muted">{item.description}</ThemedText>
          {item.progress && (
            <ProgressBar
              value={(item.progress.current / item.progress.target) * 100}
              color={item.unlocked ? Colors.light.ink : Colors.light.purple}
            />
          )}{' '}
        </AppCard>
      ))}
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  card: { marginTop: Spacing.three, gap: Spacing.two },
});
