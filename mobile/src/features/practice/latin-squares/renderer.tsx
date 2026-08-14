import { StyleSheet, View } from 'react-native';
import { AppCard } from '@/components/ui/app-card';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import type {
  LatinSquareOption as LatinSquareOptionModel,
  LatinSquareQuestion,
} from './model';

export function LatinSquareRenderer({
  question,
}: {
  question: LatinSquareQuestion;
}) {
  return (
    <AppCard color="purple" style={styles.grid}>
      {question.puzzle.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((value, c) => (
            <View key={c} style={styles.cell}>
              <ThemedText type="button">{value ?? '?'}</ThemedText>
            </View>
          ))}
        </View>
      ))}
    </AppCard>
  );
}
export function LatinSquareOption({
  option,
  selected,
}: {
  option: LatinSquareOptionModel;
  selected: boolean;
}) {
  return (
    <AppCard
      color={selected ? 'green' : 'surface'}
      style={styles.option}
      accessibilityLabel={`Value ${option.value}`}
    >
      <ThemedText type="button">{option.value}</ThemedText>
    </AppCard>
  );
}
const styles = StyleSheet.create({
  grid: {
    alignSelf: 'center',
    marginVertical: Spacing.four,
    padding: Spacing.two,
  },
  row: { flexDirection: 'row' },
  cell: {
    width: 48,
    height: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: { flex: 1, alignItems: 'center', marginHorizontal: Spacing.two },
});
