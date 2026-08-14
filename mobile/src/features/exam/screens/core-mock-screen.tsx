import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import { FigureMatrixRenderer } from '@/features/practice/figure-sequences/matrix-renderer';
import { MathematicalEquationRenderer } from '@/features/practice/mathematical-equations/renderer';
import {
  LatinSquareOption,
  LatinSquareRenderer,
} from '@/features/practice/latin-squares/renderer';
import {
  advanceExamQuestion,
  completeCoreMock,
  createCoreMockSession,
  getCoreMockResult,
  selectExamAnswer,
  skipExamQuestion,
  submitExamAnswer,
  type CoreMockState,
} from '../session-adapter';
import { savePracticeSession } from '@/features/practice/history/practice-history';

export function CoreMockScreen() {
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<CoreMockState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (
      !state ||
      state.finalized ||
      !state.session.deadlineAt ||
      now < state.session.deadlineAt
    )
      return;
    const timeout = setTimeout(
      () =>
        setState((current) =>
          current ? completeCoreMock(current, Date.now()) : current,
        ),
      0,
    );
    return () => clearTimeout(timeout);
  }, [now, state]);
  useEffect(() => {
    if (!state?.finalized) return;
    const result = getCoreMockResult(
      state,
      state.session.completedAt ?? Date.now(),
    );
    void savePracticeSession({
      id: result.sessionId,
      module: 'Core Mock',
      taskType: undefined,
      mode: 'exam-simulation',
      completedAt: new Date(result.completedAt).toISOString(),
      total: 30,
      correct: result.score.correctCount,
      incorrect: result.score.incorrectCount,
      skipped: result.score.skippedCount,
      percentage: result.score.accuracyPercent,
      durationMs: result.durationMs,
    }).then(() =>
      router.replace({
        pathname: '/practice/figure-sequences/results',
        params: {
          module: 'CORE MOCK',
          sessionId: result.sessionId,
          total: '30',
          correct: String(result.score.correctCount),
          incorrect: String(result.score.incorrectCount),
          skipped: String(result.score.skippedCount),
          percentage: String(result.score.accuracyPercent),
        },
      }),
    );
  }, [state]);
  if (!started)
    return (
      <AppScreen>
        <ThemedText type="label" themeColor="muted">
          EXAM MODE
        </ThemedText>
        <ThemedText type="display" style={styles.title}>
          Core Practice Mock
        </ThemedText>
        <AppCard color="accentYellow" style={styles.intro}>
          <ThemedText type="title">30 questions · 10 minutes</ThemedText>
          <ThemedText>
            Mixed questions from Figure Sequences, Mathematical Equations, and
            Latin Squares.
          </ThemedText>
          <ThemedText type="caption">
            Alpha practice mock — not an official exam simulation.
          </ThemedText>
        </AppCard>
        <AppButton
          label="Start Mock"
          onPress={() => {
            setState(createCoreMockSession(Date.now()));
            setStarted(true);
          }}
        />
        <AppButton
          label="Back Home"
          variant="outline"
          onPress={() => router.replace('/' as never)}
        />
      </AppScreen>
    );
  if (!state) return null;
  const item = state.questions[state.session.currentQuestionIndex];
  const submitted = state.session.answers.some(
    (answer) => answer.questionId === item.question.id,
  );
  const remaining = Math.max(
    0,
    Math.ceil(((state.session.deadlineAt ?? now) - now) / 1000),
  );
  const finish = () =>
    setState((current) =>
      current ? advanceExamQuestion(current, Date.now()) : current,
    );
  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <ThemedText type="label" themeColor="muted">
            {item.module.replace('-', ' ').toUpperCase()}
          </ThemedText>
          <ThemedText type="title">
            Question {state.session.currentQuestionIndex + 1} / 30
          </ThemedText>
        </View>
        <ThemedText type="button">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
        </ThemedText>
      </View>
      <QuestionContent
        item={item}
        selected={state.selectedAnswer}
        disabled={submitted}
        onSelect={(id) =>
          setState((current) =>
            current ? selectExamAnswer(current, id) : current,
          )
        }
      />
      <View style={styles.actions}>
        {submitted ? (
          <AppButton
            label={
              state.session.currentQuestionIndex === 29 ? 'Finish Mock' : 'Next'
            }
            onPress={finish}
          />
        ) : (
          <>
            <AppButton
              label="Submit Answer"
              disabled={!state.selectedAnswer}
              onPress={() =>
                setState((current) =>
                  current ? submitExamAnswer(current, Date.now()) : current,
                )
              }
            />
            <AppButton
              label="Skip"
              variant="outline"
              onPress={() =>
                setState((current) =>
                  current ? skipExamQuestion(current, Date.now()) : current,
                )
              }
            />
          </>
        )}
      </View>
    </AppScreen>
  );
}
function QuestionContent({
  item,
  selected,
  disabled,
  onSelect,
}: {
  item: CoreMockState['questions'][number];
  selected: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  if (item.module === 'figure-sequences')
    return (
      <>
        <AppCard color="surface" style={styles.figure}>
          <FigureMatrixRenderer
            matrix={item.question.sequence[item.question.sequence.length - 1]}
            size={180}
          />
        </AppCard>
        <View style={styles.options}>
          {item.question.options.map((option) => (
            <Pressable
              key={option.id}
              disabled={disabled}
              onPress={() => onSelect(option.id)}
            >
              <AppCard
                color={selected === option.id ? 'accentGreen' : 'surface'}
                style={styles.option}
              >
                <FigureMatrixRenderer matrix={option.first} size={58} />
                <FigureMatrixRenderer matrix={option.second} size={58} />
              </AppCard>
            </Pressable>
          ))}
        </View>
      </>
    );
  if (item.module === 'mathematical-equations')
    return (
      <>
        <MathematicalEquationRenderer equations={item.question.equations} />
        <View style={styles.options}>
          {item.question.options.map((option) => (
            <Pressable
              key={option.id}
              disabled={disabled}
              onPress={() => onSelect(option.id)}
            >
              <AppCard
                color={selected === option.id ? 'accentGreen' : 'surface'}
                style={styles.option}
              >
                <ThemedText type="button">
                  {item.question.variables
                    .map((variable) => `${variable}=${option.values[variable]}`)
                    .join('   ')}
                </ThemedText>
              </AppCard>
            </Pressable>
          ))}
        </View>
      </>
    );
  return (
    <>
      <LatinSquareRenderer question={item.question} />
      <View style={styles.options}>
        {item.question.options.map((option) => (
          <Pressable
            key={option.id}
            disabled={disabled}
            onPress={() => onSelect(option.id)}
          >
            <LatinSquareOption
              option={option}
              selected={selected === option.id}
            />
          </Pressable>
        ))}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  title: { marginVertical: Spacing.four },
  intro: { gap: Spacing.three, marginBottom: Spacing.four },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  figure: { alignItems: 'center', marginVertical: Spacing.four },
  options: { gap: Spacing.two, marginVertical: Spacing.four },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  actions: { marginTop: 'auto' },
});
