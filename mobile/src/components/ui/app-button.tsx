import {
  Animated,
  Pressable,
  StyleSheet,
  type PressableProps,
} from 'react-native';
import { useState } from 'react';

import { Radius, Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/services/haptics';
import { sound } from '@/services/sound';

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
  const [scale] = useState(() => new Animated.Value(1));
  const theme = useTheme();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        style={({ pressed, hovered }) => [
          styles.button,
          styles[variant],
          { borderColor: theme.border },
          variant === 'primary'
            ? { backgroundColor: theme.buttonSecondary }
            : variant === 'dark'
              ? { backgroundColor: theme.buttonPrimary }
              : { backgroundColor: theme.surface },
          pressed && styles.pressed,
          typeof style === 'function' ? style({ pressed, hovered }) : style,
        ]}
        {...props}
        onPressIn={(event) => {
          void haptics.tap();
          void sound.tap();
          Animated.spring(scale, {
            toValue: 0.98,
            useNativeDriver: true,
            speed: 30,
            bounciness: 0,
          }).start();
          props.onPressIn?.(event);
        }}
        onPressOut={(event) => {
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 0,
          }).start();
          props.onPressOut?.(event);
        }}
      >
        <ThemedText
          type="button"
          themeColor={
            variant === 'primary' ? 'textPrimary' : 'buttonPrimaryText'
          }
        >
          {label}
        </ThemedText>
        <ThemedText
          type="title"
          themeColor={
            variant === 'primary' ? 'textPrimary' : 'buttonPrimaryText'
          }
          style={styles.arrow}
        >
          →
        </ThemedText>
      </Pressable>
    </Animated.View>
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
  },
  primary: {},
  dark: {},
  outline: {},
  arrow: { marginLeft: Spacing.four },
  pressed: { opacity: 0.7 },
});
