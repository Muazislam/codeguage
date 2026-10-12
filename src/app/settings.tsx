import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session';
import { Card } from '@/components/card';
import { PrimaryButton } from '@/components/primary-button';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemePreference } from '@/theme/theme-context';

const THEME_OPTIONS = [
  { label: 'System', value: 'system' as const },
  { label: 'Light', value: 'light' as const },
  { label: 'Dark', value: 'dark' as const },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode } = useThemePreference();
  const { user, authMethod, disconnect } = useSession();
  const [busy, setBusy] = useState(false);

  const onDisconnect = async () => {
    setBusy(true);
    try {
      await disconnect();
      router.replace('/connect');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <ThemedText type="smallBold">Appearance</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Choose a theme or follow your device setting.
            </ThemedText>
            <SegmentedControl options={THEME_OPTIONS} value={mode} onChange={setMode} />
          </Card>

          <Card style={styles.card}>
            <ThemedText type="smallBold">Account</ThemedText>
            <View style={styles.row}>
              <ThemedText type="small" themeColor="textSecondary">
                Name
              </ThemedText>
              <ThemedText type="small">{user?.display_name ?? '—'}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText type="small" themeColor="textSecondary">
                Username
              </ThemedText>
              <ThemedText type="small">{user?.username ?? '—'}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText type="small" themeColor="textSecondary">
                Connected with
              </ThemedText>
              <ThemedText type="small">
                {authMethod === 'apikey' ? 'API key' : 'WakaTime OAuth'}
              </ThemedText>
            </View>
          </Card>

          <Card style={styles.card}>
            <ThemedText type="smallBold">Data & privacy</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              CodeGuage is read-only. It never writes heartbeats or changes your WakaTime data.
              Credentials are stored in encrypted secure storage on this device.
            </ThemedText>
          </Card>

          <PrimaryButton
            title="Disconnect WakaTime"
            variant="ghost"
            loading={busy}
            onPress={() => void onDisconnect()}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
});
