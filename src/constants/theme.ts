/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#101828',
    background: '#F7F8FA',
    backgroundElement: '#EEF1F5',
    backgroundSelected: '#E1E5EB',
    textSecondary: '#5A6472',
    card: '#FFFFFF',
    border: '#E3E8EF',
    primary: '#5B5FEF',
    primaryText: '#FFFFFF',
    positive: '#12A594',
    danger: '#E5484D',
    chart: '#5B5FEF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0B0F14',
    backgroundElement: '#151A22',
    backgroundSelected: '#1F2630',
    textSecondary: '#9BA1A6',
    card: '#12171E',
    border: '#232A33',
    primary: '#7B7FF2',
    primaryText: '#0B0F14',
    positive: '#2BC7A8',
    danger: '#FF6369',
    chart: '#7B7FF2',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
