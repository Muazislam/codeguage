import { Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useSession } from '@/auth/session';
import { LoadingView } from '@/components/state-views';
import { ThemedView } from '@/components/themed-view';

export default function IndexScreen() {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <ThemedView style={styles.container}>
        <LoadingView label="Starting CodeGuage…" />
      </ThemedView>
    );
  }

  if (status === 'connected') {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/connect" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
