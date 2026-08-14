import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type AppCardProps = ViewProps & { color?: keyof typeof Colors.light };

export function AppCard({ color = 'surface', style, ...props }: AppCardProps) {
  return (
    <View
      style={[styles.card, { backgroundColor: Colors.light[color] }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: Colors.light.line,
    borderWidth: 1.5,
    borderRadius: Radius.medium,
    padding: Spacing.four,
  },
});
