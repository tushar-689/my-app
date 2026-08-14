import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateSessionXp } from './xp';
import { getLevelProgress, type LevelProgress } from './levels';

export const GAMIFICATION_KEY = '@dmat/gamification-v1';
export type GamificationState = {
  totalXp: number;
  awardedSessionIds: string[];
  bestCombo: number;
};
const empty: GamificationState = {
  totalXp: 0,
  awardedSessionIds: [],
  bestCombo: 0,
};
export async function loadGamification(): Promise<GamificationState> {
  try {
    const value = await AsyncStorage.getItem(GAMIFICATION_KEY);
    return {
      ...empty,
      ...(value ? (JSON.parse(value) as Partial<GamificationState>) : {}),
    };
  } catch {
    return empty;
  }
}
export async function awardSessionXp(
  sessionId: string,
  correct: number,
  bestCombo = 0,
  difficultyBonus = 0,
): Promise<{ earned: number; state: GamificationState; level: LevelProgress }> {
  const current = await loadGamification();
  if (current.awardedSessionIds.includes(sessionId))
    return {
      earned: 0,
      state: current,
      level: getLevelProgress(current.totalXp),
    };
  const earned = calculateSessionXp({
    correct,
    completed: true,
    difficultyBonus,
  });
  const state = {
    totalXp: current.totalXp + earned,
    awardedSessionIds: [...current.awardedSessionIds, sessionId],
    bestCombo: Math.max(current.bestCombo, bestCombo),
  };
  await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(state));
  return { earned, state, level: getLevelProgress(state.totalXp) };
}
