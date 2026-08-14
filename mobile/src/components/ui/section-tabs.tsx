import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

export function SectionTabs({
  items,
  active,
  onChange,
}: {
  items: string[];
  active: string;
  onChange: (item: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.surfaceElevated }]}>
      {items.map((item) => (
        <Pressable
          key={item}
          onPress={() => onChange(item)}
          style={[
            styles.tab,
            item === active && { backgroundColor: theme.buttonPrimary },
          ]}
        >
          <ThemedText
            type="label"
            themeColor={item === active ? 'buttonPrimaryText' : 'textPrimary'}
          >
            {item}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    padding: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
});
