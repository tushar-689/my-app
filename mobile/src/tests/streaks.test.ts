import { getStreakSummary, localDateKey } from '@/features/progress/streaks';
import type { PracticeSession } from '@/features/practice/history/practice-history';

const session = (day: Date, id = day.toISOString()): PracticeSession => ({
  id,
  module: 'Figure Sequences',
  completedAt: day.toISOString(),
  total: 10,
  correct: 1,
  incorrect: 0,
  skipped: 0,
  percentage: 10,
});
const date = (day: number, hour = 12) => new Date(2026, 0, day, hour);

describe('streak calculation', () => {
  it('handles empty, same-day, consecutive, and gapped activity', () => {
    expect(getStreakSummary([], date(10)).currentStreak).toBe(0);
    expect(getStreakSummary([session(date(10))], date(10)).currentStreak).toBe(
      1,
    );
    expect(
      getStreakSummary([session(date(10, 9)), session(date(10, 18))], date(10))
        .activeDays,
    ).toBe(1);
    expect(
      getStreakSummary(
        [session(date(8)), session(date(9)), session(date(10))],
        date(10),
      ).currentStreak,
    ).toBe(3);
    expect(
      getStreakSummary([session(date(8)), session(date(10))], date(10))
        .currentStreak,
    ).toBe(1);
  });
  it('calculates longest streak and deduplicated weekly activity', () => {
    const history = [
      session(date(1)),
      session(date(2)),
      session(date(3)),
      session(date(3, 20)),
      session(date(6)),
      session(date(7)),
    ];
    const summary = getStreakSummary(history, date(7));
    expect(summary.longestStreak).toBe(3);
    expect(summary.weeklyActivity.filter((day) => day.active)).toHaveLength(5);
  });
  it('uses local calendar dates consistently', () => {
    const local = date(10, 23);
    expect(localDateKey(local)).toBe('2026-01-10');
    expect(getStreakSummary([session(local)], date(10, 23)).currentStreak).toBe(
      1,
    );
  });
});
