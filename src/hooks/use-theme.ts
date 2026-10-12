import { useThemePreference } from '@/theme/theme-context';

export function useTheme() {
  return useThemePreference().colors;
}
