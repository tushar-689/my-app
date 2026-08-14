import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getPracticeSummary,
  loadPracticeHistory,
  savePracticeSession,
  type PracticeSession,
} from '@/features/practice/history/practice-history';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const session: PracticeSession = {
  id: 'session-1',
  module: 'Figure Sequences',
  completedAt: '2026-01-01T00:00:00.000Z',
  total: 10,
  correct: 7,
  incorrect: 2,
  skipped: 1,
  percentage: 70,
};

beforeEach(() => {
  jest.clearAllMocks();
  storage.getItem.mockResolvedValue(null);
  storage.setItem.mockResolvedValue(undefined);
});

describe('practice history', () => {
  it('persists a completed session and does not persist it twice', async () => {
    await savePracticeSession(session);
    storage.getItem.mockResolvedValue(JSON.stringify([session]));
    await savePracticeSession(session);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it('loads stored history', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify([session]));

    await expect(loadPracticeHistory()).resolves.toEqual([session]);
  });

  it('derives basic totals and accuracy', () => {
    expect(getPracticeSummary([session])).toMatchObject({
      totalSessions: 1,
      totalQuestions: 10,
      accuracy: 70,
    });
  });
});
