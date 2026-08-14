import type { PracticeSession } from '@/features/practice/history/practice-history';
import { evaluateAchievements } from '@/features/progress/achievements';

const session = (day: number, correct = 0): PracticeSession => ({
  id: String(day),
  module: 'Figure Sequences',
  completedAt: new Date(2026, 0, day, 12).toISOString(),
  total: 10,
  correct,
  incorrect: 10 - correct,
  skipped: 0,
  percentage: correct * 10,
});
const find = (history: PracticeSession[], id: string) =>
  evaluateAchievements(history, new Date(2026, 0, 10)).find(
    (item) => item.id === id,
  )!;

describe('achievement rules', () => {
  it('evaluates centralized rules deterministically', () => {
    expect(find([], 'first-mock').unlocked).toBe(false);
    expect(find([session(10)], 'first-mock').unlocked).toBe(true);
    expect(
      find(
        [
          session(1, 10),
          session(2, 10),
          session(3, 10),
          session(4, 10),
          session(5, 10),
        ],
        'figure-master',
      ).unlocked,
    ).toBe(true);
    expect(
      find(
        [1, 2, 3, 4, 5, 6, 7].map((day) => session(day)),
        'consistent',
      ).unlocked,
    ).toBe(true);
    expect(find([session(10, 10)], 'speedster').unlocked).toBe(false);
    expect(evaluateAchievements([session(10)], new Date(2026, 0, 10))).toEqual(
      evaluateAchievements([session(10)], new Date(2026, 0, 10)),
    );
  });
});
