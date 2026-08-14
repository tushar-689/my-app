export const QUESTION_DURATION_MS = 60_000;

export function getRemainingMs(deadlineTimestamp: number, now = Date.now()) {
  return Math.max(0, deadlineTimestamp - now);
}

export function formatRemaining(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function startDeadlineTicker(
  deadlineTimestamp: number,
  onTick: (remainingMs: number) => void,
  onExpire: () => void,
) {
  let expired = false;
  const interval = setInterval(() => {
    const remaining = getRemainingMs(deadlineTimestamp);
    onTick(remaining);
    if (remaining === 0 && !expired) {
      expired = true;
      onExpire();
    }
  }, 1000);
  return () => clearInterval(interval);
}
