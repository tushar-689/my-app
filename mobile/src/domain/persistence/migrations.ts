import {
  SESSION_SCHEMA_VERSION,
  type AssessmentResult,
  type AssessmentScore,
  type AssessmentSession,
} from '../sessions/types';

export const PRACTICE_HISTORY_PERSISTENCE_VERSION = 2;

type LegacyRecord = {
  id: string;
  completedAt: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  percentage: number;
  durationMs?: number;
};

export interface MigratedPracticeRecord {
  session: AssessmentSession;
  result: AssessmentResult;
}

export interface PracticeHistoryMigration {
  version: typeof PRACTICE_HISTORY_PERSISTENCE_VERSION;
  records: MigratedPracticeRecord[];
  unmigratedRecords: unknown[];
}

function isLegacyRecord(value: unknown): value is LegacyRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.completedAt === 'string' &&
    typeof record.total === 'number' &&
    typeof record.correct === 'number' &&
    typeof record.incorrect === 'number' &&
    typeof record.skipped === 'number' &&
    typeof record.percentage === 'number'
  );
}

function migrateRecord(record: LegacyRecord): MigratedPracticeRecord | null {
  const completedAt = Date.parse(record.completedAt);
  if (!Number.isFinite(completedAt)) return null;
  const startedAt =
    record.durationMs !== undefined && Number.isFinite(record.durationMs)
      ? completedAt - record.durationMs
      : completedAt;
  const score: AssessmentScore = {
    correctCount: record.correct,
    incorrectCount: record.incorrect,
    skippedCount: record.skipped,
    accuracyPercent: record.percentage,
    score: record.correct,
  };
  const session: AssessmentSession = {
    id: record.id,
    module: 'core',
    taskType: 'figure-sequences',
    mode: 'practice',
    questionIds: [],
    currentQuestionIndex: record.total,
    answers: [],
    startedAt,
    completedAt,
    status: 'completed',
    score: record.correct,
    correctCount: record.correct,
    incorrectCount: record.incorrect,
    skippedCount: record.skipped,
    version: SESSION_SCHEMA_VERSION,
  };
  return {
    session,
    result: {
      sessionId: record.id,
      module: 'core',
      taskType: 'figure-sequences',
      mode: 'practice',
      score,
      durationMs: record.durationMs ?? 0,
      completedAt,
    },
  };
}

export function migratePracticeHistoryV1ToV2(
  records: readonly unknown[],
): PracticeHistoryMigration {
  const migrated: MigratedPracticeRecord[] = [];
  const unmigratedRecords: unknown[] = [];
  records.forEach((record) => {
    if (!isLegacyRecord(record)) {
      unmigratedRecords.push(record);
      return;
    }
    const migratedRecord = migrateRecord(record);
    if (migratedRecord) migrated.push(migratedRecord);
    else unmigratedRecords.push(record);
  });
  return {
    version: PRACTICE_HISTORY_PERSISTENCE_VERSION,
    records: migrated,
    unmigratedRecords,
  };
}
