import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { AppButton } from '@/components/ui/app-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FigureRenderer } from '../figure-sequences/figure-renderer';
import { generateQuestion } from '../figure-sequences/generator';

const SESSION_SIZE = 10;

export function FigureSequencesScreen() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const question = useMemo(() => generateQuestion(7100 + index, 1), [index]);

  const submit = () => {
    if (selected === null) return;
    if (!submitted) {
      setSubmitted(true);
      if (selected === question.correctAnswer) setScore((value) => value + 1);
      return;
    }
    if (index === SESSION_SIZE - 1) {
      const totalScore = score + (selected === question.correctAnswer ? 1 : 0);
      router.replace(
        `/practice/figure-sequences/results?total=${SESSION_SIZE}&correct=${totalScore}&incorrect=${SESSION_SIZE - totalScore}&skipped=0` as never,
      );
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <AppScreen>
      <View style={styles.top}>
        <ThemedText type="label" themeColor="muted">
          FIGURE SEQUENCES
        </ThemedText>
        <ThemedText type="button">18:42　♡</ThemedText>
      </View>
      <View style={styles.counter}>
        <ThemedText type="label">
          Q. {String(index + 1).padStart(2, '0')} / {SESSION_SIZE}
        </ThemedText>
        <ThemedText type="caption" themeColor="muted">
          {score} correct
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
            onPress={() => !submitted && setSelected(optionIndex)}
            style={[
              styles.option,
              selected === optionIndex && styles.selected,
              submitted &&
                optionIndex === question.correctAnswer &&
                styles.correct,
              submitted &&
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
      <AppButton
        label={
          submitted
            ? index === SESSION_SIZE - 1
              ? 'View Results'
              : 'Next Question'
            : 'Submit Answer'
        }
        onPress={submit}
        variant={selected === null ? 'outline' : 'dark'}
      />
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
    marginBottom: Spacing.five,
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
});
