import { migratePracticeHistoryV1ToV2 } from '@/domain/persistence/migrations';
import {
  calculateAssessmentScore,
  calculateAccuracy,
} from '@/domain/sessions/scoring';
import { canTransition, transitionSession } from '@/domain/sessions/state';
import {
  createDeadline,
  getRemainingTime,
  isExpired,
} from '@/domain/sessions/timer';
import type { AssessmentSession, SessionConfig } from '@/domain/sessions/types';
import type { QuestionAnswer, TaskType } from '@/domain/questions/types';

const session = (): AssessmentSession => ({
  id: 'session-1',
  module: 'core',
  taskType: 'figure-sequences',
  mode: 'practice',
  questionIds: ['q-1', 'q-2'],
  currentQuestionIndex: 0,
  answers: [],
  startedAt: 1_000,
  status: 'not-started',
  correctCount: 0,
  incorrectCount: 0,
  skippedCount: 0,
  version: 1,
});

describe('generic dMAT domain contracts', () => {
  it('supports all domain task types and reproducible identity metadata', () => {
    const taskTypes: TaskType[] = [
      'figure-sequences',
      'mathematical-equations',
      'latin-squares',
      'subject-single-choice',
    ];
    expect(taskTypes).toHaveLength(4);
    expect({
      id: 'q-1',
      taskType: taskTypes[0],
      module: 'core',
      difficulty: 'medium',
      generatorVersion: 'figure-sequence-v1',
      seed: 42,
    }).toMatchObject({ seed: 42 });
  });

  it('keeps session configuration independent from session state', () => {
    const config: SessionConfig = {
      questionCount: 7,
      durationMs: undefined,
      allowPause: true,
      allowHints: false,
      showImmediateFeedback: true,
      allowAnswerChanges: true,
      showExplanationAfterAnswer: true,
    };
    expect(config.questionCount).toBe(7);
    expect(session().questionIds).toHaveLength(2);
  });

  it('allows only valid session transitions', () => {
    expect(canTransition('not-started', 'in-progress')).toBe(true);
    expect(canTransition('completed', 'in-progress')).toBe(false);
    const started = transitionSession(session(), 'in-progress', 2_000);
    expect(transitionSession(started, 'completed', 3_000).completedAt).toBe(
      3_000,
    );
    expect(() => transitionSession(started, 'in-progress', 3_000)).toThrow();
  });

  it('provides a deadline-based timer contract for timed and untimed sessions', () => {
    expect(createDeadline(1_000, 5_000)).toBe(6_000);
    expect(getRemainingTime(6_000, 5_999)).toBe(1);
    expect(getRemainingTime(6_000, 6_001)).toBe(0);
    expect(isExpired(6_000, 6_000)).toBe(true);
    expect(getRemainingTime(undefined, 6_000)).toBeUndefined();
    expect(isExpired(undefined, 6_000)).toBe(false);
  });

  it('calculates safe generic scores for mixed, empty, and skipped answers', () => {
    const answers: QuestionAnswer[] = [
      { questionId: 'q-1', answeredAt: 1, response: 'a', isCorrect: true },
      { questionId: 'q-2', answeredAt: 2, response: 'b', isCorrect: false },
    ];
    expect(calculateAssessmentScore(answers, 4)).toEqual({
      correctCount: 1,
      incorrectCount: 1,
      skippedCount: 2,
      accuracyPercent: 25,
      score: 1,
    });
    expect(calculateAccuracy(0, 0)).toBe(0);
    expect(calculateAssessmentScore([], 0).skippedCount).toBe(0);
  });

  it('migrates legacy Figure Sequence history without destroying incompatible records', () => {
    const legacy = {
      id: 'old-1',
      completedAt: '2026-01-01T00:00:10.000Z',
      total: 10,
      correct: 7,
      incorrect: 2,
      skipped: 1,
      percentage: 70,
      durationMs: 10_000,
    };
    const input = [legacy, { unknown: true }];
    const first = migratePracticeHistoryV1ToV2(input);
    const second = migratePracticeHistoryV1ToV2(input);
    expect(first).toEqual(second);
    expect(first.version).toBe(2);
    expect(first.records[0].session.module).toBe('core');
    expect(first.records[0].session.taskType).toBe('figure-sequences');
    expect(first.records[0].session.startedAt).toBe(
      Date.parse(legacy.completedAt) - 10_000,
    );
    expect(first.unmigratedRecords).toEqual([{ unknown: true }]);
  });
});
