import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getPracticeSummary,
  loadPracticeHistory,
} from '@/features/practice/history/practice-history';
import { loadProfile, saveProfile, type LocalProfile } from './profile-storage';
import { loadGamification } from '@/features/gamification/storage';

export function ProfileScreen() {
  const theme = useTheme();
  const [profile, setProfile] = useState<LocalProfile>();
  const [editing, setEditing] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [questions, setQuestions] = useState(0);
  useEffect(() => {
    Promise.all([
      loadProfile(),
      loadPracticeHistory(),
      loadGamification(),
    ]).then(([value, history, gamification]) => {
      setProfile({ ...value, xp: gamification.totalXp });
      const summary = getPracticeSummary(history);
      setSessions(summary.totalSessions);
      setQuestions(summary.totalQuestions);
    });
  }, []);
  if (!profile)
    return (
      <AppScreen>
        <ThemedText type="title">Loading your space…</ThemedText>
      </AppScreen>
    );
  const update = (field: 'name' | 'email', value: string) =>
    setProfile({ ...profile, [field]: value });
  const save = async () => {
    await saveProfile(profile);
    setEditing(false);
  };
  return (
    <AppScreen>
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.accentGreen, borderColor: theme.border },
          ]}
        >
          <ThemedText type="display">
            {profile.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.identity}>
          <ThemedText type="label" themeColor="muted">
            YOUR SPACE
          </ThemedText>
          <ThemedText type="title">{profile.name}</ThemedText>
          <ThemedText themeColor="muted">{profile.email}</ThemedText>
        </View>
      </View>
      <AppCard color="purple" style={styles.level}>
        <ThemedText type="label">DMAT LEVEL</ThemedText>
        <ThemedText type="title">{profile.level}</ThemedText>
        <ThemedText type="caption">
          {profile.xp} XP · prototype profile
        </ThemedText>
      </AppCard>
      <View style={styles.stats}>
        <AppCard style={styles.stat}>
          <ThemedText type="label">SESSIONS</ThemedText>
          <ThemedText type="display">{sessions}</ThemedText>
        </AppCard>
        <AppCard style={styles.stat}>
          <ThemedText type="label">QUESTIONS</ThemedText>
          <ThemedText type="display">{questions}</ThemedText>
        </AppCard>
      </View>
      {editing && (
        <AppCard style={styles.form}>
          <ThemedText type="label">EDIT PROFILE</ThemedText>
          <TextInput
            accessibilityLabel="Name"
            value={profile.name}
            onChangeText={(value) => update('name', value)}
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.textPrimary,
                backgroundColor: theme.background,
              },
            ]}
            placeholder="Name"
          />
          <TextInput
            accessibilityLabel="Email"
            value={profile.email}
            onChangeText={(value) => update('email', value)}
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.textPrimary,
                backgroundColor: theme.background,
              },
            ]}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppButton label="Save profile" variant="primary" onPress={save} />
        </AppCard>
      )}
      <AppButton
        label={editing ? 'Cancel editing' : 'Edit profile'}
        variant="outline"
        onPress={() => setEditing(!editing)}
      />
      <AppButton
        label="Settings"
        variant="dark"
        onPress={() => router.push('/settings' as never)}
      />
      <ThemedText type="caption" themeColor="muted">
        Bookmarks and notes will appear as your practice library grows.
      </ThemedText>
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.five,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, gap: Spacing.one },
  level: { gap: Spacing.two, marginBottom: Spacing.three },
  stats: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  stat: { flex: 1, gap: Spacing.two },
  form: { gap: Spacing.three, marginBottom: Spacing.three },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.small,
    padding: Spacing.three,
  },
});
