import { StyleSheet } from 'react-native';
import { AppCard } from '@/components/ui/app-card';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import type {
  Equation,
  EquationSolution,
  MathematicalEquationOption,
} from './model';

function equationText(equation: Equation) {
  const terms = equation.terms.map((term, index) => {
    const sign = term.coefficient < 0 ? '−' : index === 0 ? '' : '+';
    const coefficient =
      Math.abs(term.coefficient) === 1 ? '' : Math.abs(term.coefficient);
    return `${sign} ${coefficient}${term.variable}`.trim();
  });
  return `${terms.join(' ')} = ${equation.constant}`;
}

export function MathematicalEquationRenderer({
  equations,
}: {
  equations: Equation[];
}) {
  return (
    <AppCard color="yellow" style={styles.problem}>
      {equations.map((equation, index) => (
        <ThemedText key={index} type="title" style={styles.equation}>
          {equationText(equation)}
        </ThemedText>
      ))}
    </AppCard>
  );
}

export function EquationOption({
  option,
  variables,
  selected,
}: {
  option: MathematicalEquationOption;
  variables: string[];
  selected: boolean;
}) {
  return (
    <AppCard color={selected ? 'green' : 'surface'} style={styles.option}>
      <ThemedText type="button">
        {variables
          .map((variable) => `${variable} = ${option.values[variable]}`)
          .join('   ')}
      </ThemedText>
    </AppCard>
  );
}

export function solutionLabel(solution: EquationSolution, variables: string[]) {
  return variables
    .map((variable) => `${variable} = ${solution[variable]}`)
    .join(', ');
}

const styles = StyleSheet.create({
  problem: { gap: Spacing.two, marginVertical: Spacing.four },
  equation: { textAlign: 'center' },
  option: { marginBottom: Spacing.two },
});
