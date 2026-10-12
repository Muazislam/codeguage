import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { Colors, type ThemeColors } from '@/constants/theme';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedScheme = 'light' | 'dark';

interface ThemePreferenceValue {
  mode: ThemeMode;
  scheme: ResolvedScheme;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'codeguage.themeMode';

const ThemePreferenceContext = createContext<ThemePreferenceValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (isThemeMode(value)) setModeState(value);
      })
      .catch(() => undefined);
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  };

  const scheme: ResolvedScheme =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<ThemePreferenceValue>(
    () => ({ mode, scheme, colors: Colors[scheme], setMode }),
    [mode, scheme]
  );

  return (
    <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreferenceValue {
  const value = useContext(ThemePreferenceContext);
  if (!value) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }
  return value;
}
