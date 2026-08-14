import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/ui/themed-text';
import { ONBOARDING_COMPLETE_KEY } from '@/features/onboarding/onboarding-storage';
import { useTheme } from '@/hooks/use-theme';

const slides = [
  {
    title: 'Dreaming of Germany?',
    body: "We'll help you take one step closer.",
    accent: 'green' as const,
    art: 'globe' as const,
  },
  {
    title: 'Beat the timer. Crack dMAT.',
    body: 'Real exam feel. Real progress.',
    accent: 'purple' as const,
    art: 'timer' as const,
  },
  {
    title: 'Everything you need.',
    body: 'Smart prep. All in one place.',
    accent: 'yellow' as const,
    art: 'notebook' as const,
  },
];

function Illustration({
  kind,
  accent,
}: {
  kind: (typeof slides)[number]['art'];
  accent: (typeof slides)[number]['accent'];
}) {
  const theme = useTheme();
  const color = theme[accent];
  if (kind === 'globe')
    return (
      <View style={[styles.globe, { borderColor: color }]}>
        <ThemedText style={styles.globeMark}>✦</ThemedText>
        <View
          style={[
            styles.pin,
            { backgroundColor: color, borderColor: theme.background },
          ]}
        />
      </View>
    );
  if (kind === 'timer')
    return (
      <View style={[styles.timer, { borderColor: theme.textPrimary }]}>
        <View
          style={[styles.timerHand, { backgroundColor: theme.textPrimary }]}
        />
        <ThemedText type="title" style={styles.timerTicks}>
          ✦
        </ThemedText>
        <View style={[styles.timerAccent, { backgroundColor: color }]} />
      </View>
    );
  return (
    <View style={styles.notebook}>
      <View
        style={[
          styles.notebookCover,
          { backgroundColor: color, borderColor: theme.textPrimary },
        ]}
      >
        <ThemedText type="title">Practice</ThemedText>
        <ThemedText type="body">Learn ✓</ThemedText>
        <ThemedText type="body">Analyze ✓</ThemedText>
        <ThemedText type="body">Improve ✓</ThemedText>
      </View>
      <View style={styles.pencil}>
        <ThemedText type="display">╱</ThemedText>
      </View>
    </View>
  );
}

export function OnboardingScreen() {
  const theme = useTheme();
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    router.replace('/(tabs)' as never);
  };
  const next = () =>
    current === slides.length - 1 ? finish() : setCurrent((value) => value + 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.logo}>
          dMAT
        </ThemedText>
        <ThemedText type="label" themeColor="muted">
          {current + 1} / {slides.length}
        </ThemedText>
      </View>
      <View style={styles.content}>
        <View style={styles.artArea}>
          <Illustration kind={slide.art} accent={slide.accent} />
        </View>
        <View style={styles.copy}>
          <ThemedText type="display" style={styles.title}>
            {slide.title}
          </ThemedText>
          <ThemedText type="body" themeColor="muted" style={styles.body}>
            {slide.body}
          </ThemedText>
        </View>
        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((item, index) => (
              <View
                key={item.title}
                style={[
                  styles.dot,
                  { backgroundColor: theme.surfaceElevated },
                  index === current && {
                    backgroundColor: theme[slide.accent],
                    width: 24,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.actions}>
            {current > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setCurrent((value) => value - 1)}
              >
                <ThemedText type="button" themeColor="muted">
                  Back
                </ThemedText>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                current === slides.length - 1 ? 'Get started' : 'Next'
              }
              onPress={next}
              style={[
                styles.next,
                {
                  backgroundColor:
                    current === slides.length - 1
                      ? theme.buttonPrimary
                      : theme[slide.accent],
                },
              ]}
            >
              <ThemedText
                type="display"
                themeColor="buttonPrimaryText"
                style={styles.nextArrow}
              >
                →
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.two,
  },
  logo: { fontFamily: Fonts?.display, fontSize: 30 },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
  artArea: {
    flex: 1,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { alignItems: 'center', paddingHorizontal: Spacing.two },
  title: { textAlign: 'center', fontSize: 36, lineHeight: 40 },
  body: { textAlign: 'center', marginTop: Spacing.four, maxWidth: 260 },
  footer: { marginTop: Spacing.eight },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.five,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  actions: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  next: {
    width: 56,
    height: 56,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  nextArrow: { lineHeight: 36 },
  globe: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  globeMark: { fontSize: 90 },
  pin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    top: 24,
    right: 28,
    borderWidth: 5,
  },
  timer: {
    width: 210,
    height: 210,
    borderWidth: 3,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerHand: {
    position: 'absolute',
    width: 3,
    height: 68,
    transform: [{ rotate: '35deg' }],
  },
  timerTicks: { fontSize: 48 },
  timerAccent: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    position: 'absolute',
    top: -4,
    right: 36,
  },
  notebook: { width: 230, height: 220, transform: [{ rotate: '-5deg' }] },
  notebookCover: {
    flex: 1,
    borderWidth: 2,
    borderRadius: Radius.small,
    padding: Spacing.five,
    gap: Spacing.three,
  },
  pencil: {
    position: 'absolute',
    right: -32,
    bottom: -28,
    transform: [{ rotate: '25deg' }],
  },
});
