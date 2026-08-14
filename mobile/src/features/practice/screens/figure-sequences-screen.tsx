import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/ui/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FigureMatrixRenderer } from '../figure-sequences/matrix-renderer';
import {
  advanceFigureSequenceSession,
  createFigureSequenceSession,
  getFigureSequenceResult,
  selectFigureSequenceAnswer,
  skipFigureSequenceQuestion,
  submitFigureSequenceAnswer,
  timeoutFigureSequenceQuestion,
  toPracticeHistoryRecord,
  type FigureSequenceSessionState,
} from '../figure-sequences/session-adapter';
import {
  startDeadlineTicker,
  formatRemaining,
} from '../figure-sequences/timer';
import { savePracticeSession } from '../history/practice-history';
import type {
  FigureSequenceOption,
  FigureSequenceQuestionV2,
} from '../figure-sequences/model';

type QuestionContentProps = {
  question: FigureSequenceQuestionV2;
  state: FigureSequenceSessionState;
  theme: ReturnType<typeof useTheme>;
  onSelect: (optionId: string) => void;
  onSkip: () => void;
  onSubmit: () => void;
  onNext: () => void;
};

function AnimatedOption({
  option,
  optionIndex,
  selected,
  status,
  correct,
  theme,
  onPress,
}: {
  option: FigureSequenceOption;
  optionIndex: number;
  selected: boolean;
  status: 'active' | 'submitted' | 'expired';
  correct: boolean;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}) {
  const [entrance] = useState(() => new Animated.Value(0));
  const [pressScale] = useState(() => new Animated.Value(1));
  const [feedback] = useState(() => new Animated.Value(0));
  const selectable = status === 'active';

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 220,
      delay: optionIndex * 35,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance, optionIndex]);

  useEffect(() => {
    if (status !== 'submitted') return;
    Animated.sequence([
      Animated.timing(feedback, {
        toValue: correct ? 1 : -1,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(feedback, {
        toValue: 0,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [correct, feedback, status]);

  return (
    <Animated.View
      style={{
        width: '48%',
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
          {
            translateX: feedback.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [-3, 0, 3],
            }),
          },
          {
            scale: Animated.multiply(
              entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
              }),
              pressScale,
            ),
          },
        ],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Answer option ${optionIndex + 1}`}
        disabled={!selectable}
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(pressScale, {
            toValue: 0.97,
            useNativeDriver: true,
            speed: 30,
            bounciness: 0,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(pressScale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 0,
          }).start()
        }
        style={[
          styles.option,
          { borderColor: theme.border, backgroundColor: theme.surface },
          selected && { backgroundColor: theme.accentGreen, borderWidth: 2 },
          status === 'submitted' &&
            correct && { backgroundColor: theme.accentGreen },
          status === 'submitted' &&
            selected &&
            !correct && { backgroundColor: theme.accentPink },
          !selectable && styles.optionDisabled,
        ]}
      >
        <View style={styles.optionHeader}>
          <View style={[styles.optionBadge, { borderColor: theme.border }]}>
            <ThemedText type="label">
              {String.fromCharCode(65 + optionIndex)}
            </ThemedText>
          </View>
          <ThemedText type="caption" themeColor="textMuted">
            MISSING PAIR
          </ThemedText>
        </View>
        <View style={styles.optionPair}>
          <FigureMatrixRenderer matrix={option.first} size={62} />
          <ThemedText type="label">+</ThemedText>
          <FigureMatrixRenderer matrix={option.second} size={62} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function QuestionContent({
  question,
  state,
  theme,
  onSelect,
  onSkip,
  onSubmit,
  onNext,
}: QuestionContentProps) {
  const [entrance] = useState(() => new Animated.Value(0));
  const status = state.questionStatus;
  const currentIndex = state.session.currentQuestionIndex;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          {
            translateX: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [14, 0],
            }),
          },
        ],
      }}
    >
      <AppCard color="surface" style={styles.questionCard}>
        <View style={styles.questionCardHeader}>
          <ThemedText type="label" themeColor="accentPurple">
            PATTERN CHALLENGE
          </ThemedText>
          <ThemedText type="caption" themeColor="textMuted">
            Look for the rule
          </ThemedText>
        </View>
        <ThemedText type="title" style={styles.questionTitle}>
          Which pair completes the pattern?
        </ThemedText>
        <View style={styles.sequence}>
          {question.sequence.map((matrix, matrixIndex) => (
            <View
              key={`${question.id}-sequence-${matrixIndex}`}
              style={[
                styles.figureTile,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
            >
              <FigureMatrixRenderer matrix={matrix} size={54} />
            </View>
          ))}
          <View
            style={[
              styles.figureTile,
              styles.missing,
              {
                borderColor: theme.border,
                backgroundColor: theme.surfaceElevated,
              },
            ]}
          >
            <ThemedText type="display">? + ?</ThemedText>
          </View>
        </View>
      </AppCard>

      <View style={styles.answerHeading}>
        <ThemedText type="label">CHOOSE THE MISSING PAIR</ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          One answer is correct
        </ThemedText>
      </View>
      <View style={styles.options}>
        {question.options.map((option, optionIndex) => (
          <AnimatedOption
            key={`${question.id}-${option.id}`}
            option={option}
            optionIndex={optionIndex}
            selected={state.selectedAnswer === option.id}
            status={status}
            correct={option.id === question.correctOptionId}
            theme={theme}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </View>
      {status === 'active' && (
        <Pressable
          accessibilityRole="button"
          onPress={onSkip}
          style={styles.skip}
        >
          <ThemedText type="button" themeColor="textSecondary">
            Skip question
          </ThemedText>
        </Pressable>
      )}
      {status !== 'expired' && (
        <AppButton
          label={
            status === 'submitted'
              ? currentIndex === state.questions.length - 1
                ? 'View Results'
                : 'Next Question'
              : 'Submit Answer'
          }
          onPress={status === 'submitted' ? onNext : onSubmit}
          variant={state.selectedAnswer === null ? 'outline' : 'dark'}
        />
      )}
    </Animated.View>
  );
}

function QuestionTimer({
  remaining,
  status,
}: {
  remaining: number;
  status: string;
}) {
  const [pulse] = useState(() => new Animated.Value(1));
  const warning = status === 'expired' || remaining <= 5_000;

  useEffect(() => {
    if (!warning) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, warning]);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <ThemedText
        type="button"
        themeColor={
          status === 'expired'
            ? 'accentPink'
            : warning
              ? 'warning'
              : 'textPrimary'
        }
      >
        {status === 'expired' ? '00:00' : formatRemaining(remaining)}　♡
      </ThemedText>
    </Animated.View>
  );
}

export function FigureSequencesScreen() {
  const theme = useTheme();
  const [state, setState] = useState<FigureSequenceSessionState | null>(null);
  const [remaining, setRemaining] = useState(60_000);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistedRef = useRef(false);

  useEffect(() => {
    // The active session is created once when this route mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(createFigureSequenceSession(Date.now()));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const currentIndex = state?.session.currentQuestionIndex ?? 0;
  const questionDeadlineAt = state?.questionDeadlineAt;
  const questionStatus = state?.questionStatus;

  useEffect(() => {
    if (
      !state ||
      questionStatus !== 'active' ||
      questionDeadlineAt === undefined
    )
      return;
    const stopTicker = startDeadlineTicker(
      questionDeadlineAt,
      setRemaining,
      () => {
        setState((current) =>
          current
            ? timeoutFigureSequenceQuestion(current, Date.now())
            : current,
        );
        timeoutRef.current = setTimeout(() => {
          setState((current) =>
            current
              ? advanceFigureSequenceSession(current, Date.now())
              : current,
          );
        }, 350);
      },
    );
    return stopTicker;
  }, [questionDeadlineAt, questionStatus, state]);

  useEffect(() => {
    if (!state || state.session.status !== 'completed' || persistedRef.current)
      return;
    persistedRef.current = true;
    const completedAt = state.session.completedAt ?? Date.now();
    const result = getFigureSequenceResult(state, completedAt);
    void savePracticeSession(toPracticeHistoryRecord(result)).then(() => {
      router.replace(
        `/practice/figure-sequences/results?module=Figure%20Sequences&sessionId=${encodeURIComponent(result.sessionId)}&total=${
          result.score.correctCount +
          result.score.incorrectCount +
          result.score.skippedCount
        }&correct=${result.score.correctCount}&incorrect=${result.score.incorrectCount}&skipped=${result.score.skippedCount}&percentage=${result.score.accuracyPercent}` as never,
      );
    });
  }, [state]);

  if (!state) {
    return (
      <AppScreen>
        <ThemedText type="title">Preparing your practice…</ThemedText>
      </AppScreen>
    );
  }

  const question = state.questions[currentIndex];
  const counts = state.session;
  const submit = () =>
    setState((current) =>
      current ? submitFigureSequenceAnswer(current, Date.now()) : current,
    );
  const next = () =>
    setState((current) =>
      current ? advanceFigureSequenceSession(current, Date.now()) : current,
    );
  const skip = () =>
    setState((current) =>
      current
        ? advanceFigureSequenceSession(
            skipFigureSequenceQuestion(current, Date.now()),
            Date.now(),
          )
        : current,
    );

  return (
    <AppScreen>
      <View style={styles.top}>
        <View>
          <ThemedText type="label" themeColor="accentPurple">
            FIGURE SEQUENCES
          </ThemedText>
          <ThemedText type="caption" themeColor="textMuted">
            Train your visual reasoning
          </ThemedText>
        </View>
        <QuestionTimer remaining={remaining} status={state.questionStatus} />
      </View>
      <View style={styles.counter}>
        <ThemedText type="title" style={styles.counterTitle}>
          Q. {String(currentIndex + 1).padStart(2, '0')}{' '}
          <ThemedText type="body" themeColor="textMuted">
            / {state.questions.length}
          </ThemedText>
        </ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          {counts.correctCount} correct · {counts.incorrectCount} incorrect ·{' '}
          {counts.skippedCount} skipped
        </ThemedText>
      </View>
      <ProgressBar
        value={((currentIndex + 1) / state.questions.length) * 100}
        color={theme.accentGreen}
      />
      <QuestionContent
        key={question.id}
        question={question}
        state={state}
        theme={theme}
        onSelect={(answerId) =>
          setState((current) =>
            current ? selectFigureSequenceAnswer(current, answerId) : current,
          )
        }
        onSkip={skip}
        onSubmit={submit}
        onNext={next}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  counter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.two,
  },
  counterTitle: { fontSize: 24, lineHeight: 28 },
  questionCard: {
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
    padding: Spacing.three,
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  questionTitle: { fontSize: 20, lineHeight: 25, marginBottom: Spacing.three },
  sequence: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.one,
  },
  figureTile: {
    flex: 1,
    minHeight: 68,
    borderWidth: 1.5,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missing: { borderStyle: 'dashed' },
  answerHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two,
    marginBottom: Spacing.two,
  },
  option: {
    minHeight: 130,
    borderWidth: 1.5,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
    gap: Spacing.two,
  },
  optionDisabled: { opacity: 0.92 },
  optionHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionBadge: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionPair: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  skip: { alignItems: 'center', paddingVertical: Spacing.two },
});
