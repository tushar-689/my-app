import { generateFigureSequenceQuestion } from '@/features/practice/figure-sequences/generator';
import type { FigureSequenceQuestionV2 } from '@/features/practice/figure-sequences/model';
import { generateMathematicalEquationQuestion } from '@/features/practice/mathematical-equations/generator';
import type { MathematicalEquationQuestion } from '@/features/practice/mathematical-equations/model';
import { generateLatinSquareQuestion } from '@/features/practice/latin-squares/generator';
import type { LatinSquareQuestion } from '@/features/practice/latin-squares/model';
import { CORE_MOCK_CONFIG, type CoreModule } from './config';

export type ExamQuestion =
  | { module: 'figure-sequences'; question: FigureSequenceQuestionV2 }
  | { module: 'mathematical-equations'; question: MathematicalEquationQuestion }
  | { module: 'latin-squares'; question: LatinSquareQuestion };
export function selectCoreMockQuestions(seed = 4400): ExamQuestion[] {
  const questions: ExamQuestion[] = [];
  const modules: CoreModule[] = [
    'figure-sequences',
    'mathematical-equations',
    'latin-squares',
  ];
  modules.forEach((module, moduleIndex) => {
    for (
      let index = 0;
      index < CORE_MOCK_CONFIG.questionsPerModule;
      index += 1
    ) {
      const questionSeed = seed + moduleIndex * 100 + index;
      if (module === 'figure-sequences')
        questions.push({
          module,
          question: generateFigureSequenceQuestion({
            seed: questionSeed,
            difficulty: index < 4 ? 'low' : index < 8 ? 'medium' : 'high',
          }),
        });
      if (module === 'mathematical-equations')
        questions.push({
          module,
          question: generateMathematicalEquationQuestion({
            seed: questionSeed,
            difficulty: index < 4 ? 'low' : index < 8 ? 'medium' : 'high',
          }),
        });
      if (module === 'latin-squares')
        questions.push({
          module,
          question: generateLatinSquareQuestion({
            seed: questionSeed,
            difficulty: index < 4 ? 'low' : index < 8 ? 'medium' : 'high',
          }),
        });
    }
  });
  return questions;
}
