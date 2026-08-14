import type { Equation, EquationSolution } from './model';

function satisfies(equations: Equation[], values: EquationSolution): boolean {
  return equations.every(
    (equation) =>
      equation.terms.reduce(
        (sum, term) => sum + term.coefficient * values[term.variable],
        0,
      ) === equation.constant,
  );
}

export function solveEquationSystem(
  equations: Equation[],
  variables: string[],
): EquationSolution[] {
  const solutions: EquationSolution[] = [];
  const values: EquationSolution = {};

  function search(index: number) {
    if (solutions.length > 1) return;
    if (index === variables.length) {
      if (satisfies(equations, values)) solutions.push({ ...values });
      return;
    }
    const variable = variables[index];
    for (let value = 1; value <= 20; value += 1) {
      values[variable] = value;
      search(index + 1);
    }
    delete values[variable];
  }

  search(0);
  return solutions;
}

export function equationSatisfied(
  equation: Equation,
  values: EquationSolution,
): boolean {
  return (
    equation.terms.reduce(
      (sum, term) => sum + term.coefficient * values[term.variable],
      0,
    ) === equation.constant
  );
}
