import { calculateSessionXp } from '@/features/gamification/xp';
import { getLevelProgress } from '@/features/gamification/levels';
import {
  createComboState,
  recordComboAnswer,
} from '@/features/gamification/combo';
import {
  awardSessionXp,
  GAMIFICATION_KEY,
} from '@/features/gamification/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('gamification', () => {
  it('calculates simple session XP', () => {
    expect(calculateSessionXp({ correct: 3, completed: true })).toBe(35);
    expect(calculateSessionXp({ correct: 0, completed: true })).toBe(5);
    expect(
      calculateSessionXp({ correct: 3, completed: true, difficultyBonus: 4 }),
    ).toBe(39);
  });
  it('calculates levels and boundaries', () => {
    expect(getLevelProgress(0).level).toBe(1);
    expect(getLevelProgress(99).level).toBe(1);
    expect(getLevelProgress(100).level).toBe(2);
    expect(getLevelProgress(100).xpIntoLevel).toBe(0);
  });
  it('increments combo and resets it', () => {
    let combo = createComboState();
    combo = recordComboAnswer(combo, 'correct');
    combo = recordComboAnswer(combo, 'correct');
    expect(combo).toEqual({ current: 2, best: 2 });
    expect(recordComboAnswer(combo, 'skip').current).toBe(0);
  });
  it('persists and deduplicates awards', async () => {
    let stored: string | null = null;
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async () => stored);
    (AsyncStorage.setItem as jest.Mock).mockImplementation(
      async (_key, value) => {
        stored = value;
      },
    );
    expect((await awardSessionXp('s1', 2)).earned).toBe(25);
    expect((await awardSessionXp('s1', 2)).earned).toBe(0);
    expect(
      JSON.parse((await AsyncStorage.getItem(GAMIFICATION_KEY)) ?? '{}')
        .totalXp,
    ).toBe(25);
  });
});
