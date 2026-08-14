import type { QuestionAnswer } from '../questions/types';
import type { AssessmentScore } from './types';

export function calculateAccuracy(
  correctCount: number,
  totalQuestions: number,
): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((Math.max(0, correctCount) / totalQuestions) * 100);
}

export function calculateScore(correctCount: number): number {
  return Math.max(0, correctCount);
}

export function calculateAssessmentScore(
  answers: QuestionAnswer[],
  totalQuestions = answers.length,
): AssessmentScore {
  const correctCount = answers.filter(
    (answer) => answer.isCorrect === true,
  ).length;
  const incorrectCount = answers.filter(
    (answer) => answer.isCorrect === false,
  ).length;
  const skippedCount = Math.max(
    0,
    totalQuestions - correctCount - incorrectCount,
  );
  return {
    correctCount,
    incorrectCount,
    skippedCount,
    accuracyPercent: calculateAccuracy(correctCount, totalQuestions),
    score: calculateScore(correctCount),
  };
}
