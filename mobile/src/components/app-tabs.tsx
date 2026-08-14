import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/ui/themed-text';

const icons = {
  Home: '⌂',
  Practice: '✦',
  Exam: '▣',
  Progress: '⌁',
  Profile: '○',
} as const;

type AppTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options?: { title?: string } }>;
  navigation: { navigate: (name: string) => void };
};

export function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.bar}>
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
              <View style={[styles.icon, focused && styles.activeIcon]}>
                <ThemedText
                  type="title"
                  themeColor={focused ? 'background' : 'ink'}
                  style={styles.iconText}
                >
                  {icons[label as keyof typeof icons]}
                </ThemedText>
              </View>
              <ThemedText type="caption" themeColor={focused ? 'ink' : 'muted'}>
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
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.line,
    borderWidth: 1.5,
    borderRadius: Radius.large,
    paddingVertical: Spacing.two,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  icon: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small,
  },
  activeIcon: { backgroundColor: Colors.light.green },
  iconText: { fontSize: 20, lineHeight: 22 },
});
