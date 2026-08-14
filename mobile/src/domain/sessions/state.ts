import type { AssessmentSession, SessionStatus } from './types';

const transitions: Record<SessionStatus, SessionStatus[]> = {
  'not-started': ['in-progress'],
  'in-progress': ['completed', 'expired', 'abandoned'],
  completed: [],
  expired: [],
  abandoned: [],
};

export function canTransition(from: SessionStatus, to: SessionStatus): boolean {
  return transitions[from].includes(to);
}

export function transitionSession(
  session: AssessmentSession,
  nextStatus: SessionStatus,
  at: number,
): AssessmentSession {
  if (!canTransition(session.status, nextStatus)) {
    throw new Error(
      `Invalid session transition: ${session.status} → ${nextStatus}`,
    );
  }
  return {
    ...session,
    status: nextStatus,
    ...(nextStatus === 'completed' || nextStatus === 'expired'
      ? { completedAt: at }
      : {}),
  };
}
