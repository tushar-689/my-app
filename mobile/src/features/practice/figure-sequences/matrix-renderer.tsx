import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { FigureRenderer } from './figure-renderer';
import type { FigureMatrix } from './model';
import { useTheme } from '@/hooks/use-theme';

export function FigureMatrixRenderer({
  matrix,
  size = 96,
}: {
  matrix: FigureMatrix;
  size?: number;
}) {
  const theme = useTheme();
  const cellSize = size / 3;
  return (
    <View
      accessibilityLabel="figure matrix"
      style={[
        styles.matrix,
        {
          width: size,
          height: size,
          borderColor: theme.border,
          backgroundColor: theme.background,
        },
      ]}
    >
      {matrix.cells.flatMap((row, rowIndex) =>
        row.map((cell, columnIndex) => (
          <View
            key={`${rowIndex}-${columnIndex}`}
            style={[
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
                borderColor: theme.surfaceElevated,
              },
            ]}
          >
            {cell.figures[0] && (
              <FigureRenderer figure={cell.figures[0]} size={cellSize} />
            )}
          </View>
        )),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  matrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1.5,
    borderRadius: Radius.small,
    overflow: 'hidden',
  },
  cell: {
    borderWidth: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
