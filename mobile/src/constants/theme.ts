import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FFFDF0',
    surface: '#FFFCEB',
    ink: '#171717',
    muted: '#6F7068',
    line: '#20211D',
    green: '#72D62B',
    greenDark: '#4E9D1C',
    purple: '#A66CF2',
    yellow: '#FFD23F',
    orange: '#FF9F43',
    pink: '#F28BC8',
    blue: '#8ED8E8',
    white: '#FFFFFF',
  },
  dark: {
    background: '#191A16',
    surface: '#25261F',
    ink: '#FFFDF0',
    muted: '#B8B8A9',
    line: '#FFFDF0',
    green: '#72D62B',
    greenDark: '#A2E878',
    purple: '#B98BF7',
    yellow: '#FFD23F',
    orange: '#FFAA59',
    pink: '#F49CD0',
    blue: '#8ED8E8',
    white: '#FFFFFF',
  },
} as const;

export type Theme = (typeof Colors)['light'];
export type ThemeColor = keyof Theme;

export const Fonts = Platform.select({
  ios: { sans: 'Avenir Next', display: 'Avenir Next', mono: 'Menlo' },
  android: {
    sans: 'sans-serif',
    display: 'sans-serif-condensed',
    mono: 'monospace',
  },
  default: { sans: 'sans-serif', display: 'sans-serif', mono: 'monospace' },
});

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
} as const;

export const Radius = {
  small: 10,
  medium: 16,
  large: 24,
  pill: 999,
} as const;

export const MaxContentWidth = 520;
