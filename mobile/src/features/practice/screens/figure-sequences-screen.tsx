import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FigureRenderer } from '../figure-sequences/figure-renderer';
import { generateQuestion } from '../figure-sequences/generator';
import { savePracticeSession } from '../history/practice-history';
import {
  formatRemaining,
  QUESTION_DURATION_MS,
  startDeadlineTicker,
} from '../figure-sequences/timer';

const SESSION_SIZE = 10;
type SessionCounts = { correct: number; incorrect: number; skipped: number };

export function FigureSequencesScreen() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [counts, setCounts] = useState<SessionCounts>({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  const [status, setStatus] = useState<'active' | 'submitted' | 'expired'>(
    'active',
  );
  const [remaining, setRemaining] = useState(QUESTION_DURATION_MS);
  const countsRef = useRef<SessionCounts>(counts);
  const finalizedRef = useRef(false);
  const statusRef = useRef(status);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartedAtRef = useRef(0);
  const completedRef = useRef(false);
  const question = useMemo(() => generateQuestion(7100 + index, 1), [index]);

  const advance = async (nextCounts: SessionCounts) => {
    if (index === SESSION_SIZE - 1) {
      if (completedRef.current) return;
      completedRef.current = true;
      const percentage = Math.round((nextCounts.correct / SESSION_SIZE) * 100);
      await savePracticeSession({
        id: 'figure-sequences-' + sessionStartedAtRef.current,
        module: 'Figure Sequences',
        completedAt: new Date().toISOString(),
        total: SESSION_SIZE,
        correct: nextCounts.correct,
        incorrect: nextCounts.incorrect,
        skipped: nextCounts.skipped,
        percentage,
        durationMs: Date.now() - sessionStartedAtRef.current,
      });
      router.replace(
        ('/practice/figure-sequences/results?module=Figure%20Sequences&total=' +
          SESSION_SIZE +
          '&correct=' +
          nextCounts.correct +
          '&incorrect=' +
          nextCounts.incorrect +
          '&skipped=' +
          nextCounts.skipped +
          '&percentage=' +
          percentage) as never,
      );
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    finalizedRef.current = false;
    statusRef.current = 'active';
    setStatus('active');
  };

  const finalize = (kind: 'correct' | 'incorrect' | 'skipped') => {
    if (
      kind !== 'skipped' &&
      (statusRef.current !== 'active' || finalizedRef.current)
    )
      return;
    if (
      kind === 'skipped' &&
      statusRef.current !== 'expired' &&
      finalizedRef.current
    )
      return;
    if (kind === 'skipped' && statusRef.current !== 'expired')
      finalizedRef.current = true;
    const nextCounts = {
      ...countsRef.current,
      [kind]: countsRef.current[kind] + 1,
    };
    finalizedRef.current = true;
    countsRef.current = nextCounts;
    setCounts(nextCounts);
    if (kind === 'skipped') void advance(nextCounts);
  };

  const submit = () => {
    if (statusRef.current !== 'active' || selected === null) return;
    const isCorrect = selected === question.correctAnswer;
    finalize(isCorrect ? 'correct' : 'incorrect');
    statusRef.current = 'submitted';
    setStatus('submitted');
  };

  const next = () => {
    if (statusRef.current !== 'submitted') return;
    advance(countsRef.current);
  };
  const skip = () => {
    if (statusRef.current !== 'active') return;
    finalize('skipped');
  };

  useEffect(() => {
    if (index === 0) sessionStartedAtRef.current = Date.now();
    const deadline = Date.now() + QUESTION_DURATION_MS;
    finalizedRef.current = false;
    statusRef.current = 'active';
    const stopTicker = startDeadlineTicker(deadline, setRemaining, () => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      statusRef.current = 'expired';
      setStatus('expired');
      timeoutRef.current = setTimeout(() => finalize('skipped'), 350);
    });
    return () => {
      stopTicker();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // The effect intentionally restarts only when the active question changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const timerColor =
    status === 'expired' ? 'pink' : remaining <= 10_000 ? 'orange' : 'ink';
  return (
    <AppScreen>
      <View style={styles.top}>
        <ThemedText type="label" themeColor="muted">
          FIGURE SEQUENCES
        </ThemedText>
        <ThemedText type="button" themeColor={timerColor}>
          {status === 'expired' ? '00:00' : formatRemaining(remaining)}　♡
        </ThemedText>
      </View>
      <View style={styles.counter}>
        <ThemedText type="label">
          Q. {String(index + 1).padStart(2, '0')} / {SESSION_SIZE}
        </ThemedText>
        <ThemedText type="caption" themeColor="muted">
          {counts.correct} correct · {counts.incorrect} incorrect ·{' '}
          {counts.skipped} skipped
        </ThemedText>
      </View>
      <ProgressBar
        value={((index + 1) / SESSION_SIZE) * 100}
        color={Colors.light.green}
      />
      <AppCard color="surface" style={styles.questionCard}>
        <ThemedText type="title" style={styles.questionTitle}>
          Which option completes the pattern?
        </ThemedText>
        <View style={styles.sequence}>
          {question.sequence.map((figure, figureIndex) => (
            <View key={figureIndex} style={styles.figureTile}>
              <FigureRenderer figure={figure} />
            </View>
          ))}
          <View style={[styles.figureTile, styles.missing]}>
            <ThemedText type="display">?</ThemedText>
          </View>
        </View>
      </AppCard>
      <View style={styles.options}>
        {question.answerOptions.map((figure, optionIndex) => (
          <Pressable
            key={optionIndex}
            accessibilityRole="button"
            accessibilityLabel={`Answer option ${optionIndex + 1}`}
            disabled={status !== 'active'}
            onPress={() => setSelected(optionIndex)}
            style={[
              styles.option,
              selected === optionIndex && styles.selected,
              status === 'submitted' &&
                optionIndex === question.correctAnswer &&
                styles.correct,
              status === 'submitted' &&
                selected === optionIndex &&
                optionIndex !== question.correctAnswer &&
                styles.incorrect,
            ]}
          >
            <FigureRenderer figure={figure} size={82} />
            <ThemedText type="label">
              {String.fromCharCode(65 + optionIndex)}
            </ThemedText>
          </Pressable>
        ))}
      </View>
      {status === 'active' && (
        <Pressable
          accessibilityRole="button"
          onPress={skip}
          style={styles.skip}
        >
          <ThemedText type="button" themeColor="muted">
            Skip question
          </ThemedText>
        </Pressable>
      )}
      {status !== 'expired' && (
        <AppButton
          label={
            status === 'submitted'
              ? index === SESSION_SIZE - 1
                ? 'View Results'
                : 'Next Question'
              : 'Submit Answer'
          }
          onPress={status === 'submitted' ? next : submit}
          variant={selected === null ? 'outline' : 'dark'}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  counter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  questionCard: {
    marginTop: Spacing.five,
    marginBottom: Spacing.four,
    padding: Spacing.three,
  },
  questionTitle: { fontSize: 20, lineHeight: 26, marginBottom: Spacing.four },
  sequence: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.one,
  },
  figureTile: {
    flex: 1,
    minHeight: 76,
    borderWidth: 1.5,
    borderColor: Colors.light.line,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  missing: { borderStyle: 'dashed', backgroundColor: '#EFEDDE' },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  option: {
    width: '47%',
    minHeight: 112,
    borderWidth: 1.5,
    borderColor: Colors.light.line,
    borderRadius: Radius.medium,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  selected: {
    backgroundColor: Colors.light.green,
    transform: [{ rotate: '-2deg' }],
  },
  correct: { backgroundColor: Colors.light.green },
  incorrect: { backgroundColor: Colors.light.pink },
  skip: { alignItems: 'center', paddingVertical: Spacing.three },
});
