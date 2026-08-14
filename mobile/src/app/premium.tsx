import { router } from 'expo-router';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import { RewardedAdPlaceholder } from '@/features/ads/components';
import { StyleSheet } from 'react-native';
export default function PremiumRoute() {
  return (
    <AppScreen>
      <ThemedText type="label" themeColor="muted">
        dMAT PREP+
      </ThemedText>
      <ThemedText type="display" style={styles.title}>
        More focus. Less friction.
      </ThemedText>
      <AppCard color="accentYellow" style={styles.card}>
        {[
          'Ad-free practice',
          'Advanced analytics',
          'Bonus practice modes',
          'Personalized training',
          'Future adaptive preparation',
        ].map((item) => (
          <ThemedText key={item} type="button">
            ✓ {item}
          </ThemedText>
        ))}
      </AppCard>
      <ThemedText type="button">
        Explore dMAT PREP+ · payments unavailable in local alpha
      </ThemedText>
      <ThemedText themeColor="muted" style={styles.note}>
        Payments and account synchronization will be enabled with backend
        integration.
      </ThemedText>
      <RewardedAdPlaceholder />
      <AppButton
        label="Back Home"
        variant="outline"
        onPress={() => router.replace('/' as never)}
      />
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  title: { marginVertical: Spacing.four },
  card: { gap: Spacing.three, marginBottom: Spacing.four },
  note: { marginVertical: Spacing.four },
});
