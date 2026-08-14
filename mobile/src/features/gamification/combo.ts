export type ComboState = { current: number; best: number };
export function createComboState(): ComboState {
  return { current: 0, best: 0 };
}
export function recordComboAnswer(
  state: ComboState,
  result: 'correct' | 'incorrect' | 'skip' | 'timeout',
): ComboState {
  if (result !== 'correct') return { ...state, current: 0 };
  const current = state.current + 1;
  return { current, best: Math.max(state.best, current) };
}
