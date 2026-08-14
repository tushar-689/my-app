import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppCardProps = ViewProps & { color?: keyof typeof Colors.light };

export function AppCard({ color = 'surface', style, ...props }: AppCardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme[color], borderColor: theme.border },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: Radius.medium,
    padding: Spacing.four,
    shadowColor: '#171717',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
    elevation: 1,
  },
});
