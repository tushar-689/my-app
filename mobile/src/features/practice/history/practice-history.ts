import AsyncStorage from '@react-native-async-storage/async-storage';

export type PracticeSession = {
  id: string;
  module:
    | 'Figure Sequences'
    | 'Mathematical Equations'
    | 'Latin Squares'
    | 'Core Mock';
  taskType?: 'figure-sequences' | 'mathematical-equations' | 'latin-squares';
  mode?: 'practice' | 'exam-simulation';
  completedAt: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  percentage: number;
  durationMs?: number;
};

const HISTORY_KEY = '@dmat/practice-history-v1';

export async function loadPracticeHistory(): Promise<PracticeSession[]> {
  const stored = await AsyncStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as PracticeSession[]) : [];
  } catch {
    return [];
  }
}

export async function savePracticeSession(session: PracticeSession) {
  const history = await loadPracticeHistory();
  if (history.some((item) => item.id === session.id)) return history;
  const nextHistory = [session, ...history];
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}

export function getPracticeSummary(history: PracticeSession[]) {
  const totalQuestions = history.reduce(
    (sum, session) => sum + session.total,
    0,
  );
  const correct = history.reduce((sum, session) => sum + session.correct, 0);
  return {
    totalSessions: history.length,
    totalQuestions,
    accuracy: totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0,
    latest: history[0],
  };
}
