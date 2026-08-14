import type { PracticeSession } from '@/features/practice/history/practice-history';
import { getStreakSummary } from './streaks';

export type Achievement = {
  id: 'first-mock' | 'figure-master' | 'speedster' | 'consistent';
  title: string;
  description: string;
  unlocked: boolean;
  progress?: { current: number; target: number };
};

export function evaluateAchievements(
  history: PracticeSession[],
  now = new Date(),
): Achievement[] {
  const correct = history.reduce((sum, session) => sum + session.correct, 0);
  const streak = getStreakSummary(history, now).longestStreak;
  return [
    {
      id: 'first-mock',
      title: 'First Mock',
      description: 'Complete your first practice session.',
      unlocked: history.length > 0,
      progress: { current: Math.min(history.length, 1), target: 1 },
    },
    {
      id: 'figure-master',
      title: 'Figure Master',
      description: 'Answer 50 Figure Sequence questions correctly.',
      unlocked: correct >= 50,
      progress: { current: Math.min(correct, 50), target: 50 },
    },
    {
      id: 'speedster',
      title: 'Speedster',
      description: 'Timing data will be added later.',
      unlocked: false,
    },
    {
      id: 'consistent',
      title: 'Consistent',
      description: 'Practice for 7 consecutive days.',
      unlocked: streak >= 7,
      progress: { current: Math.min(streak, 7), target: 7 },
    },
  ];
}
