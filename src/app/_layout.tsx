import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionProvider } from '@/auth/session';
import { ThemePreferenceProvider, useThemePreference } from '@/theme/theme-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { scheme } = useThemePreference();

  return (
    <NavigationThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="connect" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true, title: 'Settings' }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemePreferenceProvider>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </ThemePreferenceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
