import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FFFDF0',
    surface: '#FFFCEB',
    surfaceElevated: '#FFFFFF',
    ink: '#171717',
    muted: '#55574F',
    line: '#20211D',
    green: '#72D62B',
    greenDark: '#4E9D1C',
    purple: '#A66CF2',
    yellow: '#FFD23F',
    orange: '#FF9F43',
    pink: '#F28BC8',
    blue: '#8ED8E8',
    white: '#FFFFFF',
    textPrimary: '#171717',
    textSecondary: '#3F413A',
    textMuted: '#55574F',
    textInverse: '#FFFDF0',
    border: '#20211D',
    buttonPrimary: '#171717',
    buttonPrimaryText: '#FFFDF0',
    buttonSecondary: '#72D62B',
    success: '#4E9D1C',
    warning: '#D97916',
    accentGreen: '#72D62B',
    accentPurple: '#A66CF2',
    accentYellow: '#FFD23F',
    accentPink: '#F28BC8',
  },
  dark: {
    background: '#191A16',
    surface: '#25261F',
    surfaceElevated: '#303128',
    ink: '#F7F6E8',
    muted: '#C7C7B8',
    line: '#D8D8C8',
    green: '#5EAF28',
    greenDark: '#A2E878',
    purple: '#8C5BCE',
    yellow: '#B98616',
    orange: '#C97827',
    pink: '#B65B91',
    blue: '#8ED8E8',
    white: '#F7F6E8',
    textPrimary: '#F7F6E8',
    textSecondary: '#E1E0D1',
    textMuted: '#C7C7B8',
    textInverse: '#191A16',
    border: '#D8D8C8',
    buttonPrimary: '#F7F6E8',
    buttonPrimaryText: '#191A16',
    buttonSecondary: '#5EAF28',
    success: '#A2E878',
    warning: '#FFB15E',
    accentGreen: '#5EAF28',
    accentPurple: '#8C5BCE',
    accentYellow: '#B98616',
    accentPink: '#B65B91',
  },
} as const;

export type Theme = { [key in keyof typeof Colors.light]: string };
export type ThemeColor = keyof Theme;

export const SemanticColors = {
  background: 'background',
  surface: 'surface',
  elevatedSurface: 'surfaceElevated',
  textPrimary: 'textPrimary',
  textSecondary: 'textSecondary',
  textInverse: 'textInverse',
  accent: 'accentGreen',
  success: 'success',
  warning: 'warning',
  error: 'accentPink',
  xp: 'accentPurple',
  streak: 'accentYellow',
} as const satisfies Record<string, ThemeColor>;

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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  section: 32,
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

export const Motion = {
  micro: 100,
  fast: 180,
  standard: 280,
  emphasis: 520,
} as const;

export const MaxContentWidth = 520;
