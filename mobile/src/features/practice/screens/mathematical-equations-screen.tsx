import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import {
  EquationOption,
  MathematicalEquationRenderer,
} from '../mathematical-equations/renderer';
import {
  advanceMathematicalEquationSession,
  createMathematicalEquationSession,
  getMathematicalEquationResult,
  selectMathematicalEquationAnswer,
  skipMathematicalEquationQuestion,
  submitMathematicalEquationAnswer,
  timeoutMathematicalEquationQuestion,
  type MathematicalEquationSessionState,
} from '../mathematical-equations/session-adapter';
import { savePracticeSession } from '../history/practice-history';

export function MathematicalEquationsScreen() {
  const [state, setState] = useState<MathematicalEquationSessionState>(() =>
    createMathematicalEquationSession(Date.now()),
  );
  const question = state.questions[state.session.currentQuestionIndex];
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
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (state.questionStatus !== 'active' || now < state.questionDeadlineAt)
      return;
    const timeout = setTimeout(
      () =>
        setState((current) =>
          timeoutMathematicalEquationQuestion(current, Date.now()),
        ),
      0,
    );
    return () => clearTimeout(timeout);
  }, [now, state.questionDeadlineAt, state.questionStatus]);
  const finishOrNext = () => {
    const next = advanceMathematicalEquationSession(state, Date.now());
    if (next.session.status === 'completed') {
      const result = getMathematicalEquationResult(next, Date.now());
      void savePracticeSession({
        id: result.sessionId,
        module: 'Mathematical Equations',
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
          module: 'Mathematical Equations',
          sessionId: result.sessionId,
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
    } else setState(next);
  };
  const submitted = state.questionStatus !== 'active';
  return (
    <AppScreen>
      <ThemedText type="label" themeColor="muted">
        MATHEMATICAL EQUATIONS
      </ThemedText>
      <View style={styles.header}>
        <ThemedText type="title">
          Question {state.session.currentQuestionIndex + 1} /{' '}
          {state.questions.length}
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
        <MathematicalEquationRenderer equations={question.equations} />
        <ThemedText type="caption" themeColor="muted">
          Choose the values that satisfy every equation.
        </ThemedText>
        <View style={styles.options}>
          {question.options.map((option) => (
            <Pressable
              key={option.id}
              disabled={submitted}
              onPress={() =>
                setState((current) =>
                  selectMathematicalEquationAnswer(current, option.id),
                )
              }
            >
              <EquationOption
                option={option}
                variables={question.variables}
                selected={state.selectedAnswer === option.id}
              />
            </Pressable>
          ))}
        </View>
      </Animated.View>
      {submitted ? (
        <AppButton
          label={
            state.session.currentQuestionIndex + 1 === state.questions.length
              ? 'See Results'
              : 'Next'
          }
          onPress={finishOrNext}
        />
      ) : (
        <>
          <AppButton
            label="Submit Answer"
            onPress={() =>
              setState((current) =>
                submitMathematicalEquationAnswer(current, Date.now()),
              )
            }
            disabled={!state.selectedAnswer}
          />
          <AppButton
            label="Skip"
            variant="outline"
            onPress={() =>
              setState((current) =>
                skipMathematicalEquationQuestion(current, Date.now()),
              )
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
  options: { marginVertical: Spacing.four },
});
