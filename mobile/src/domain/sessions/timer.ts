export interface AssessmentTimer {
  startedAt: number;
  durationMs?: number;
  deadlineAt?: number;
}

export function createDeadline(
  startedAt: number,
  durationMs?: number,
): number | undefined {
  return durationMs === undefined ? undefined : startedAt + durationMs;
}

export function getRemainingTime(
  deadlineAt: number | undefined,
  now: number,
): number | undefined {
  return deadlineAt === undefined ? undefined : Math.max(0, deadlineAt - now);
}

export function isExpired(
  deadlineAt: number | undefined,
  now: number,
): boolean {
  return deadlineAt !== undefined && deadlineAt <= now;
}
