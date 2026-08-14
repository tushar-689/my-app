import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppCard } from '@/components/ui/app-card';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';

export function AdPlaceholder({
  placement = 'dMAT PREP+',
}: {
  placement?: string;
}) {
  return (
    <AppCard color="surface" style={styles.card}>
      <ThemedText type="label">AD · DEMO</ThemedText>
      <ThemedText type="button">{placement}</ThemedText>
      <ThemedText type="caption" themeColor="muted">
        A local preview placement. No live advertising is connected.
      </ThemedText>
    </AppCard>
  );
}
export function NativeAdPlaceholder() {
  return <AdPlaceholder placement="Keep your practice streak moving" />;
}
export function RewardedAdPlaceholder({ onReward }: { onReward?: () => void }) {
  const [claimed, setClaimed] = useState(false);
  const claim = () => {
    if (claimed) return;
    setClaimed(true);
    onReward?.();
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Watch demo ad for bonus XP"
      onPress={claim}
    >
      <AppCard color="accentYellow" style={styles.card}>
        <ThemedText type="label">AD · DEMO REWARD</ThemedText>
        <ThemedText type="button">
          {claimed ? 'Bonus XP claimed' : 'Watch to earn bonus XP'}
        </ThemedText>
        <ThemedText type="caption">
          {claimed ? '+5 XP demo reward' : 'Tap to preview the rewarded flow.'}
        </ThemedText>
      </AppCard>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: { gap: Spacing.two, marginVertical: Spacing.three },
});
