export type LevelProgress = {
  xp: number;
  level: number;
  xpForNextLevel: number;
  xpIntoLevel: number;
  progressPercent: number;
};
export function getLevelProgress(xp: number): LevelProgress {
  const safeXp = Math.max(0, Math.floor(xp));
  const level = Math.floor(Math.sqrt(safeXp / 100)) + 1;
  const start = (level - 1) ** 2 * 100;
  const next = level ** 2 * 100;
  return {
    xp: safeXp,
    level,
    xpForNextLevel: next - start,
    xpIntoLevel: safeXp - start,
    progressPercent: Math.round(((safeXp - start) / (next - start)) * 100),
  };
}
