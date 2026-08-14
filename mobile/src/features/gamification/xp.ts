export type SessionXpInput = {
  correct: number;
  completed: boolean;
  difficultyBonus?: number;
};
export function calculateSessionXp({
  correct,
  completed,
  difficultyBonus = 0,
}: SessionXpInput): number {
  return (
    Math.max(0, correct) * 10 +
    (completed ? 5 : 0) +
    Math.max(0, difficultyBonus)
  );
}
