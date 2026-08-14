export const CORE_MOCK_CONFIG = {
  questionCount: 30,
  durationSeconds: 600,
  questionsPerModule: 10,
  label: 'Core Practice Mock',
} as const;
export type CoreModule =
  'figure-sequences' | 'mathematical-equations' | 'latin-squares';
