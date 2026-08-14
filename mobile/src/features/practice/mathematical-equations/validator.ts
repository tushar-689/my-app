import type { Difficulty } from '@/domain/questions/types';
import type { MathematicalEquationQuestion } from './model';
import { solveEquationSystem } from './solver';

const difficulties: Difficulty[] = ['low', 'medium', 'high'];

export function validateMathematicalEquationQuestion(
  question: MathematicalEquationQuestion,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (question.taskType !== 'mathematical-equations') errors.push('task type');
  if (question.module !== 'core') errors.push('module');
  if (!difficulties.includes(question.difficulty)) errors.push('difficulty');
  if (question.generatorVersion !== 'mathematical-equation-v1')
    errors.push('generator version');
  if (!Number.isInteger(question.seed)) errors.push('seed');
  if (question.variables.length < 2 || question.variables.length > 4)
    errors.push('variable count');
  if (new Set(question.variables).size !== question.variables.length)
    errors.push('duplicate variables');
  if (question.equations.length < question.variables.length)
    errors.push('insufficient equations');
  for (const equation of question.equations) {
    if (!Number.isInteger(equation.constant)) errors.push('invalid constant');
    if (!equation.terms.length) errors.push('empty equation');
    for (const term of equation.terms) {
      if (!question.variables.includes(term.variable))
        errors.push('unknown variable');
      if (!Number.isInteger(term.coefficient) || term.coefficient === 0)
        errors.push('invalid coefficient');
    }
  }
  const solutions = solveEquationSystem(question.equations, question.variables);
  if (solutions.length !== 1) errors.push('solution is not unique');
  const solution = solutions[0];
  if (
    solution &&
    JSON.stringify(solution) !== JSON.stringify(question.solution)
  )
    errors.push('solution mismatch');
  if (question.options.length !== 4) errors.push('option count');
  const optionKeys = new Set(
    question.options.map((option) =>
      question.variables.map((variable) => option.values[variable]).join(','),
    ),
  );
  if (optionKeys.size !== question.options.length)
    errors.push('duplicate options');
  const correctOptions = question.options.filter((option) =>
    question.variables.every(
      (variable) => option.values[variable] === question.solution[variable],
    ),
  );
  if (correctOptions.length !== 1) errors.push('correct option');
  for (const option of question.options) {
    for (const variable of question.variables) {
      if (
        !Number.isInteger(option.values[variable]) ||
        option.values[variable] < 1 ||
        option.values[variable] > 20
      )
        errors.push('option value range');
    }
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}
