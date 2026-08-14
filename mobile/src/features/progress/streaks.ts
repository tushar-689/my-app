import type { PracticeSession } from '@/features/practice/history/practice-history';

export type WeeklyActivity = {
  dateKey: string;
  active: boolean;
  label: string;
};
export type StreakSummary = {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  weeklyActivity: WeeklyActivity[];
};

export function localDateKey(date: Date): string {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) =>
      index === 0 ? String(part) : String(part).padStart(2, '0'),
    )
    .join('-');
}

function keyDate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getActiveDateKeys(history: PracticeSession[]): string[] {
  return [
    ...new Set(
      history
        .map((session) => new Date(session.completedAt))
        .filter((date) => !Number.isNaN(date.getTime()))
        .map(localDateKey),
    ),
  ].sort();
}

export function getStreakSummary(
  history: PracticeSession[],
  now = new Date(),
): StreakSummary {
  const keys = getActiveDateKeys(history);
  const active = new Set(keys);
  let currentStreak = 0;
  if (active.has(localDateKey(now))) {
    for (let day = now; active.has(localDateKey(day)); day = addDays(day, -1))
      currentStreak += 1;
  }
  let longestStreak = 0;
  let run = 0;
  for (let index = 0; index < keys.length; index += 1) {
    run =
      index > 0 &&
      localDateKey(addDays(keyDate(keys[index - 1]), 1)) === keys[index]
        ? run + 1
        : 1;
    longestStreak = Math.max(longestStreak, run);
  }
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(now, index - 6);
    return {
      dateKey: localDateKey(date),
      active: active.has(localDateKey(date)),
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
    };
  });
  return {
    currentStreak,
    longestStreak,
    activeDays: keys.length,
    weeklyActivity,
  };
}
