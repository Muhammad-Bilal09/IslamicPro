import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111827',
    background: '#F6F8FB',
    backgroundElement: '#E2E8F0',
    backgroundSelected: '#CBD5E1',
    textSecondary: '#64748B',
    primary: '#094C3A',
    primaryDark: '#063528',
    primaryLight: '#E6F4EA',
    accent: '#F97316',
    cardBackground: '#FFFFFF',
    border: '#E2E8F0',
    textOnPrimary: '#FFFFFF',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#094C3A',
    success: '#10B981',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B0F19',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#94A3B8',
    primary: '#0D6850',
    primaryDark: '#094C3A',
    primaryLight: '#1E2E2A',
    accent: '#FB923C',
    cardBackground: '#151F32',
    border: '#1E293B',
    textOnPrimary: '#FFFFFF',
    tabIconDefault: '#64748B',
    tabIconSelected: '#0D6850',
    success: '#34D399',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
