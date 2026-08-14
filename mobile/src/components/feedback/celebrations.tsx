import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import { AppLottie } from './AppLottie';

function Feedback({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.86));
  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 22,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, visible]);
  if (!visible) return null;
  return (
    <Animated.View
      style={[styles.overlay, { opacity, transform: [{ scale }] }]}
      pointerEvents="none"
    >
      <AppLottie size={72} />
      {children}
    </Animated.View>
  );
}
export function CelebrationOverlay({
  visible,
  label = 'Nice work',
}: {
  visible: boolean;
  label?: string;
}) {
  return (
    <Feedback visible={visible}>
      <ThemedText type="hero">✓</ThemedText>
      <ThemedText type="button">{label}</ThemedText>
    </Feedback>
  );
}
export function XpFloat({
  visible,
  amount,
}: {
  visible: boolean;
  amount: number;
}) {
  return (
    <Feedback visible={visible}>
      <ThemedText type="title">+{amount} XP</ThemedText>
    </Feedback>
  );
}
export function ComboCelebration({
  visible,
  combo,
}: {
  visible: boolean;
  combo: number;
}) {
  return (
    <Feedback visible={visible}>
      <ThemedText type="title">🔥 {combo}x</ThemedText>
    </Feedback>
  );
}
export function LevelUpCelebration({
  visible,
  level,
}: {
  visible: boolean;
  level: number;
}) {
  return (
    <Feedback visible={visible}>
      <ThemedText type="label">LEVEL UP</ThemedText>
      <ThemedText type="numeric">{level}</ThemedText>
    </Feedback>
  );
}
export function AchievementCelebration({
  visible,
  title,
}: {
  visible: boolean;
  title: string;
}) {
  return (
    <Feedback visible={visible}>
      <ThemedText type="title">✦</ThemedText>
      <ThemedText type="button">{title}</ThemedText>
    </Feedback>
  );
}
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    zIndex: 10,
    top: '42%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: '#FFD23F',
    borderWidth: 2,
    borderColor: '#171717',
    padding: Spacing.four,
    borderRadius: 16,
  },
});
