import type { Difficulty } from '@/domain/questions/types';
import type { LatinSquareQuestion } from './model';

export function validateLatinSquareQuestion(question: LatinSquareQuestion): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const { size, solution, puzzle, symbols } = question;
  if (question.taskType !== 'latin-squares' || question.module !== 'core')
    errors.push('identity');
  if (
    !(['low', 'medium', 'high'] as Difficulty[]).includes(question.difficulty)
  )
    errors.push('difficulty');
  if (
    question.generatorVersion !== 'latin-square-v1' ||
    !Number.isInteger(question.seed)
  )
    errors.push('metadata');
  if (
    !Number.isInteger(size) ||
    size < 3 ||
    size > 5 ||
    symbols.length !== size
  )
    errors.push('dimensions');
  if (
    solution.length !== size ||
    puzzle.length !== size ||
    solution.some((row) => row.length !== size) ||
    puzzle.some((row) => row.length !== size)
  )
    errors.push('grid dimensions');
  const validSymbols = new Set(symbols);
  const checkLine = (line: number[]) =>
    line.length === size &&
    new Set(line).size === size &&
    line.every((value) => validSymbols.has(value));
  solution.forEach((row) => {
    if (!checkLine(row)) errors.push('invalid row');
  });
  for (let column = 0; column < size; column += 1)
    if (!checkLine(solution.map((row) => row[column])))
      errors.push('invalid column');
  let holes = 0;
  puzzle.forEach((row, r) =>
    row.forEach((value, c) => {
      if (value === null) holes += 1;
      else if (value !== solution[r]?.[c] || !validSymbols.has(value))
        errors.push('invalid puzzle cell');
    }),
  );
  if (holes < 1) errors.push('no missing cells');
  const target = question.target;
  if (puzzle[target?.row]?.[target?.column] !== null)
    errors.push('invalid target');
  if (
    solution[target.row]?.[target.column] !==
    question.options.find((option) => option.id === question.correctOptionId)
      ?.value
  )
    errors.push('wrong correct answer');
  if (
    question.options.length < 3 ||
    question.options.length > 4 ||
    new Set(question.options.map((option) => option.value)).size !==
      question.options.length
  )
    errors.push('duplicate options');
  if (question.options.some((option) => !validSymbols.has(option.value)))
    errors.push('invalid option');
  if (
    question.options.filter(
      (option) => option.value === solution[target.row]?.[target.column],
    ).length !== 1
  )
    errors.push('correct option');
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}
