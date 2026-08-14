import { getRemainingTime, isExpired } from '@/domain/sessions/timer';

export const QUESTION_DURATION_MS = 60_000;

export function getRemainingMs(deadlineTimestamp: number, now = Date.now()) {
  return getRemainingTime(deadlineTimestamp, now) ?? 0;
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
  const initialRemaining = getRemainingMs(deadlineTimestamp);
  onTick(initialRemaining);
  if (isExpired(deadlineTimestamp, Date.now())) {
    expired = true;
    onExpire();
  }
  const interval = setInterval(() => {
    const remaining = getRemainingMs(deadlineTimestamp);
    onTick(remaining);
    if (isExpired(deadlineTimestamp, Date.now()) && !expired) {
      expired = true;
      onExpire();
    }
  }, 1000);
  return () => clearInterval(interval);
}
