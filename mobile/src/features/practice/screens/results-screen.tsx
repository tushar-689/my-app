import { router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Animated, StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { awardSessionXp } from '@/features/gamification/storage';
import { getLevelProgress } from '@/features/gamification/levels';
import { AdPlaceholder } from '@/features/ads/components';
import { CelebrationOverlay } from '@/components/feedback/celebrations';

export function ResultsScreen() {
  const params = useLocalSearchParams<{
    module?: string;
    total?: string;
    correct?: string;
    incorrect?: string;
    skipped?: string;
    percentage?: string;
    sessionId?: string;
    bestCombo?: string;
  }>();
  const total = Number(params.total ?? 10);
  const correct = Number(params.correct ?? 0);
  const incorrect = Number(params.incorrect ?? total - correct);
  const skipped = Number(params.skipped ?? 0);
  const percentage = Number(
    params.percentage ?? Math.round((correct / total) * 100),
  );
  const [xpEarned, setXpEarned] = useState(0);
  const [animatedXp, setAnimatedXp] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [scoreScale] = useState(() => new Animated.Value(0.94));
  const [scoreOpacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!params.sessionId) return;
    awardSessionXp(
      params.sessionId,
      correct,
      Number(params.bestCombo ?? 0),
    ).then((award) => {
      setXpEarned(award.earned);
      if (award.earned > 0) {
        const steps = Math.min(12, Math.max(1, Math.ceil(award.earned / 10)));
        let step = 0;
        const timer = setInterval(() => {
          step += 1;
          setAnimatedXp(Math.round((award.earned * step) / steps));
          if (step >= steps) clearInterval(timer);
        }, 35);
      } else setAnimatedXp(0);
      setTotalXp(award.state.totalXp);
    });
  }, [correct, params.bestCombo, params.sessionId]);
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scoreOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scoreScale, {
        toValue: 1,
        speed: 24,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scoreOpacity, scoreScale]);
  const level = getLevelProgress(totalXp);
  return (
    <AppScreen>
      <CelebrationOverlay visible={xpEarned > 0} label="Nice work" />
      <ThemedText type="label" themeColor="muted">
        {params.module ?? 'FIGURE SEQUENCES'} / RESULTS
      </ThemedText>
      <ThemedText type="display" style={styles.title}>
        That&apos;s a wrap.
      </ThemedText>
      <Animated.View
        style={{ opacity: scoreOpacity, transform: [{ scale: scoreScale }] }}
      >
        <AppCard color="green" style={styles.score}>
          <ThemedText type="numeric">{percentage}%</ThemedText>
          <ThemedText type="button">Your Score</ThemedText>
        </AppCard>
      </Animated.View>
      <View style={styles.stats}>
        <AppCard color="surface">
          <ThemedText type="display">{correct}</ThemedText>
          <ThemedText type="caption">Correct</ThemedText>
        </AppCard>
        <AppCard color="surface">
          <ThemedText type="display">{incorrect}</ThemedText>
          <ThemedText type="caption">Incorrect</ThemedText>
        </AppCard>
        <AppCard color="surface">
          <ThemedText type="display">{skipped}</ThemedText>
          <ThemedText type="caption">Skipped</ThemedText>
        </AppCard>
      </View>
      <AppCard color="accentYellow" style={styles.reward}>
        <View>
          <ThemedText type="label">REWARD</ThemedText>
          <ThemedText type="title">+{animatedXp || xpEarned} XP</ThemedText>
        </View>
        <View>
          <ThemedText type="label">LEVEL {level.level}</ThemedText>
          <ThemedText type="caption">
            {level.xpIntoLevel} / {level.xpForNextLevel} XP
          </ThemedText>
        </View>
        {Number(params.bestCombo ?? 0) > 0 && (
          <ThemedText type="title">🔥 {params.bestCombo}x</ThemedText>
        )}
      </AppCard>
      <AdPlaceholder placement="dMAT PREP+ · local demo" />
      <AppButton
        label="Practice Again"
        onPress={() =>
          router.replace(
            (params.module === 'Mathematical Equations'
              ? '/practice/mathematical-equations'
              : params.module === 'Latin Squares'
                ? '/practice/latin-squares'
                : params.module === 'CORE MOCK'
                  ? '/exam'
                  : '/practice/figure-sequences') as never,
          )
        }
      />
      <AppButton
        label="Back to Home"
        variant="outline"
        onPress={() => router.replace('/' as never)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: Spacing.two, marginBottom: Spacing.six },
  score: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginVertical: Spacing.four,
  },
  reward: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
});
