import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export function PlaceholderScreen({
  eyebrow,
  title,
  body,
  color,
}: {
  eyebrow: string;
  title: string;
  body: string;
  color: keyof typeof Colors.light;
}) {
  return (
    <AppScreen>
      <ThemedText type="label" themeColor="muted">
        {eyebrow}
      </ThemedText>
      <ThemedText type="display" style={styles.title}>
        {title}
      </ThemedText>
      <AppCard color={color} style={styles.card}>
        <ThemedText type="body">{body}</ThemedText>
        <View style={styles.doodle}>
          <ThemedText type="display">✦</ThemedText>
        </View>
      </AppCard>
      <AppButton label="Back to Home" onPress={() => router.replace('/')} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: Spacing.two, marginBottom: Spacing.six },
  card: {
    minHeight: 220,
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  doodle: { alignItems: 'center', paddingVertical: Spacing.five },
});
