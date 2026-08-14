import { StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

export function ProgressBar({
  value,
  color = Colors.light.green,
}: {
  value: number;
  color?: string;
}) {
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: '#E8E6D5',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: Radius.pill },
});
