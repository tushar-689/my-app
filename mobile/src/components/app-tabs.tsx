import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/hooks/use-theme';

const icons = {
  Home: '⌂',
  Practice: '✧',
  Exam: '□',
  Progress: '⌁',
  Profile: '●',
} as const;

type AppTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options?: { title?: string } }>;
  navigation: { navigate: (name: string) => void };
};

export function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  const theme = useTheme();
  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.bar,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options;
          const label = options?.title ?? route.name;
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => navigation.navigate(route.name)}
              style={styles.item}
            >
              <View
                style={[
                  styles.icon,
                  focused && styles.activeIcon,
                  focused && { backgroundColor: theme.accentGreen },
                ]}
              >
                <ThemedText
                  type="title"
                  themeColor={focused ? 'textPrimary' : 'textSecondary'}
                  style={styles.iconText}
                >
                  {icons[label as keyof typeof icons]}
                </ThemedText>
              </View>
              <ThemedText
                type="caption"
                themeColor={focused ? 'textPrimary' : 'textSecondary'}
                style={styles.label}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  bar: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: Radius.large,
    paddingVertical: Spacing.two,
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 3,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  icon: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small,
  },
  activeIcon: {
    borderRadius: Radius.pill,
    width: 34,
    height: 28,
  },
  iconText: { fontSize: 20, lineHeight: 22 },
  label: { fontWeight: '700' },
});
