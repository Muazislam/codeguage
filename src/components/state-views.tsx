import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { userMessage } from '@/lib/errors';

export function LoadingView({ label = 'Loading your stats…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={theme.primary} size="large" />
      <ThemedText themeColor="textSecondary" style={styles.centerText}>
        {label}
      </ThemedText>
    </View>
  );
}

export function ErrorView({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <ThemedText type="subtitle" style={styles.centerText}>
        Could not load stats
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.centerText}>
        {userMessage(error)}
      </ThemedText>
      <PrimaryButton title="Try again" onPress={onRetry} />
    </View>
  );
}

export function EmptyView({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.centered}>
      <ThemedText type="subtitle" style={styles.centerText}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.centerText}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
});
