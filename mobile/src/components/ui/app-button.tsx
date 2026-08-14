import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';

type AppButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'dark' | 'outline';
};

export function AppButton({
  label,
  variant = 'dark',
  style,
  ...props
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed, hovered }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed, hovered }) : style,
      ]}
      {...props}
    >
      <ThemedText
        type="button"
        themeColor={variant === 'primary' ? 'ink' : 'background'}
      >
        {label}
      </ThemedText>
      <ThemedText
        type="title"
        themeColor={variant === 'primary' ? 'ink' : 'background'}
        style={styles.arrow}
      >
        →
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.light.line,
  },
  primary: {
    backgroundColor: Colors.light.green,
    borderColor: Colors.light.green,
  },
  dark: { backgroundColor: Colors.light.ink },
  outline: { backgroundColor: Colors.light.surface },
  arrow: { marginLeft: Spacing.four },
  pressed: { opacity: 0.7 },
});
