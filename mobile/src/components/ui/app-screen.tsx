import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated, ScrollView, StyleSheet } from 'react-native';
import { useEffect, useState, type ReactNode } from 'react';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppScreenProps = { children: ReactNode; scroll?: boolean };

export function AppScreen({ children, scroll = true }: AppScreenProps) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(8));
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);
  const content = (
    <Animated.View
      style={[styles.content, { opacity, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: Spacing.eight },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.five,
  },
});
