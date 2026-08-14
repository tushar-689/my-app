import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import { setHapticsEnabled } from '@/services/haptics';
import { setSoundEnabled } from '@/services/sound';
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  type LocalSettings,
} from '@/features/profile/profile-storage';

const toggles: {
  key: 'soundEffects' | 'hapticFeedback' | 'emailPreferences';
  label: string;
}[] = [
  { key: 'soundEffects', label: 'Sound Effects' },
  { key: 'hapticFeedback', label: 'Haptic Feedback' },
  { key: 'emailPreferences', label: 'Email Preferences' },
];
export default function SettingsRoute() {
  const { theme } = useAppTheme();
  const [settings, setSettings] = useState<LocalSettings>(defaultSettings);
  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);
  const toggle = (key: keyof LocalSettings) => {
    const next = { ...settings, [key]: !settings[key] } as LocalSettings;
    setSettings(next);
    void saveSettings(next);
    if (key === 'hapticFeedback') setHapticsEnabled(next.hapticFeedback);
    if (key === 'soundEffects') setSoundEnabled(next.soundEffects);
  };
  return (
    <AppScreen>
      <ThemedText type="label" themeColor="muted">
        YOUR SPACE / SETTINGS
      </ThemedText>
      <ThemedText type="title">Make it yours.</ThemedText>
      <AppCard style={styles.card}>
        {toggles.map((item) => (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: settings[item.key] }}
            key={item.key}
            style={styles.row}
            onPress={() => toggle(item.key)}
          >
            <ThemedText>{item.label}</ThemedText>
            <View
              style={[
                styles.switch,
                {
                  backgroundColor: settings[item.key]
                    ? theme.accentGreen
                    : theme.border,
                },
              ]}
            >
              <View
                style={[styles.knob, settings[item.key] && styles.knobOn]}
              />
            </View>
          </Pressable>
        ))}
      </AppCard>
      <AppCard style={styles.card}>
        {[
          'Language · English',
          'Change Password · unavailable in local prototype',
        ].map((label) => (
          <ThemedText key={label} style={styles.info}>
            {label}
          </ThemedText>
        ))}
      </AppCard>
      <AppCard style={styles.card}>
        {[
          'About dMAT',
          'Terms & Conditions',
          'Privacy Policy',
          'Help & Support',
        ].map((label) => (
          <Pressable
            accessibilityRole="button"
            key={label}
            onPress={() =>
              router.push(
                `/settings/info?title=${encodeURIComponent(label)}` as never,
              )
            }
            style={styles.info}
          >
            <ThemedText>{label}</ThemedText>
            <ThemedText themeColor="muted">→</ThemedText>
          </Pressable>
        ))}
      </AppCard>
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  card: { gap: Spacing.four, marginTop: Spacing.four },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    width: 44,
    height: 26,
    borderRadius: 20,
    padding: 3,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  knobOn: { alignSelf: 'flex-end' },
  info: { flexDirection: 'row', justifyContent: 'space-between' },
});
