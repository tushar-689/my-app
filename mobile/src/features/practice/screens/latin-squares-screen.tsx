import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import {
  LatinSquareOption,
  LatinSquareRenderer,
} from '../latin-squares/renderer';
import {
  advanceLatinSquare,
  createLatinSquareSession,
  getLatinSquareResult,
  selectLatinSquareAnswer,
  skipLatinSquare,
  submitLatinSquareAnswer,
  timeoutLatinSquare,
  type LatinSquareSessionState,
} from '../latin-squares/session-adapter';
import { savePracticeSession } from '../history/practice-history';

export function LatinSquaresScreen() {
  const [state, setState] = useState<LatinSquareSessionState>(() =>
    createLatinSquareSession(Date.now()),
  );
  const [now, setNow] = useState(() => Date.now());
  const [questionMotion] = useState(() => new Animated.Value(0));
  useEffect(() => {
    questionMotion.setValue(0);
    Animated.timing(questionMotion, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [questionMotion, state.session.currentQuestionIndex]);
  const question = state.questions[state.session.currentQuestionIndex];
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (state.questionStatus !== 'active' || now < state.questionDeadlineAt)
      return;
    const timer = setTimeout(
      () => setState((current) => timeoutLatinSquare(current, Date.now())),
      0,
    );
    return () => clearTimeout(timer);
  }, [now, state.questionDeadlineAt, state.questionStatus]);
  const next = () => {
    const updated = advanceLatinSquare(state, Date.now());
    if (updated.session.status !== 'completed') return setState(updated);
    const result = getLatinSquareResult(updated, Date.now());
    void savePracticeSession({
      id: result.sessionId,
      module: 'Latin Squares',
      completedAt: new Date(result.completedAt).toISOString(),
      total:
        result.score.correctCount +
        result.score.incorrectCount +
        result.score.skippedCount,
      correct: result.score.correctCount,
      incorrect: result.score.incorrectCount,
      skipped: result.score.skippedCount,
      percentage: result.score.accuracyPercent,
      durationMs: result.durationMs,
    });
    router.replace({
      pathname: '/practice/figure-sequences/results',
      params: {
        module: 'Latin Squares',
        sessionId: result.sessionId,
        taskType: 'latin-squares',
        total: String(
          result.score.correctCount +
            result.score.incorrectCount +
            result.score.skippedCount,
        ),
        correct: String(result.score.correctCount),
        incorrect: String(result.score.incorrectCount),
        skipped: String(result.score.skippedCount),
        percentage: String(result.score.accuracyPercent),
      },
    });
  };
  const submitted = state.questionStatus !== 'active';
  return (
    <AppScreen>
      <ThemedText type="label" themeColor="muted">
        LATIN SQUARES
      </ThemedText>
      <View style={styles.header}>
        <ThemedText type="title">
          Question {state.session.currentQuestionIndex + 1} / 10
        </ThemedText>
        <ThemedText type="button">
          {Math.max(0, Math.ceil((state.questionDeadlineAt - now) / 1000))}s
        </ThemedText>
      </View>
      <Animated.View
        style={{
          opacity: questionMotion,
          transform: [
            {
              translateX: questionMotion.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        }}
      >
        <LatinSquareRenderer question={question} />
        <ThemedText type="caption" themeColor="muted">
          Complete the square: each number appears once per row and column.
        </ThemedText>
        <View style={styles.options}>
          {question.options.map((option) => (
            <Pressable
              key={option.id}
              disabled={submitted}
              onPress={() =>
                setState((current) =>
                  selectLatinSquareAnswer(current, option.id),
                )
              }
            >
              <LatinSquareOption
                option={option}
                selected={state.selectedAnswer === option.id}
              />
            </Pressable>
          ))}
        </View>
      </Animated.View>
      {submitted ? (
        <AppButton
          label={
            state.session.currentQuestionIndex === 9 ? 'See Results' : 'Next'
          }
          onPress={next}
        />
      ) : (
        <>
          <AppButton
            label="Submit Answer"
            disabled={!state.selectedAnswer}
            onPress={() =>
              setState((current) =>
                submitLatinSquareAnswer(current, Date.now()),
              )
            }
          />
          <AppButton
            label="Skip"
            variant="outline"
            onPress={() =>
              setState((current) => skipLatinSquare(current, Date.now()))
            }
          />
        </>
      )}
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  options: { flexDirection: 'row', marginVertical: Spacing.four },
});
