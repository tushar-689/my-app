import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'body'
    | 'label'
    | 'title'
    | 'display'
    | 'caption'
    | 'button'
    | 'hero'
    | 'technical'
    | 'numeric';
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = 'body',
  themeColor = 'textPrimary',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[styles[type], { color: theme[themeColor] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: Fonts?.sans, fontSize: 15, lineHeight: 22 },
  label: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: Fonts?.display,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  display: {
    fontFamily: Fonts?.display,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 44,
  },
  caption: { fontFamily: Fonts?.sans, fontSize: 11, lineHeight: 16 },
  button: { fontFamily: Fonts?.sans, fontSize: 14, fontWeight: '800' },
  hero: {
    fontFamily: Fonts?.display,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  technical: {
    fontFamily: Fonts?.mono,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  numeric: {
    fontFamily: Fonts?.display,
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 50,
    letterSpacing: -1,
  },
});
