import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session';
import { Card } from '@/components/card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  OAUTH_REDIRECT_PATH,
  OAUTH_SCOPES,
  WAKATIME_AUTHORIZE_URL,
  WAKATIME_CLIENT_ID,
} from '@/config';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { userMessage } from '@/lib/errors';

WebBrowser.maybeCompleteAuthSession();

const WAKATIME_TOKEN_ENDPOINT = 'https://wakatime.com/oauth/token';
const WAKATIME_API_KEY_URL = 'https://wakatime.com/settings/api-key';

export default function ConnectScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { status, completeOAuth, connectWithApiKey } = useSession();

  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState<'oauth' | 'apikey' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const oauthConfigured = WAKATIME_CLIENT_ID.length > 0;
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'codeguage',
    path: OAUTH_REDIRECT_PATH,
  });

  const discovery: AuthSession.DiscoveryDocument = {
    authorizationEndpoint: WAKATIME_AUTHORIZE_URL,
    tokenEndpoint: WAKATIME_TOKEN_ENDPOINT,
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: WAKATIME_CLIENT_ID || 'codeguage',
      scopes: OAUTH_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (status === 'connected') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleAuthResponse = useCallback(
    async (result: AuthSession.AuthSessionResult) => {
      if (result.type === 'success') {
        const code = result.params.code;
        if (!code) {
          setBusy(null);
          setError('WakaTime did not return an authorization code.');
          return;
        }
        setBusy('oauth');
        try {
          await completeOAuth({ code, codeVerifier: request?.codeVerifier ?? '', redirectUri });
          setBusy(null);
          router.replace('/dashboard');
        } catch (caught) {
          setBusy(null);
          setError(userMessage(caught));
        }
        return;
      }

      if (result.type === 'error') {
        setBusy(null);
        setError(result.error?.message ?? 'WakaTime authorization failed.');
        return;
      }

      if (result.type === 'dismiss') {
        setBusy(null);
      }
    },
    [completeOAuth, redirectUri, request, router]
  );

  useEffect(() => {
    if (response) {
      void handleAuthResponse(response);
    }
  }, [response, handleAuthResponse]);

  const startOAuth = useCallback(() => {
    setError(null);
    setBusy('oauth');
    promptAsync().catch((caught) => {
      setBusy(null);
      setError(userMessage(caught));
    });
  }, [promptAsync]);

  const submitApiKey = useCallback(async () => {
    setError(null);
    setBusy('apikey');
    try {
      await connectWithApiKey(apiKey);
      router.replace('/dashboard');
    } catch (caught) {
      setError(userMessage(caught));
    } finally {
      setBusy(null);
    }
  }, [apiKey, connectWithApiKey, router]);

  const openApiKeyPage = useCallback(() => {
    WebBrowser.openBrowserAsync(WAKATIME_API_KEY_URL).catch(() => undefined);
  }, []);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <View style={styles.hero}>
              <ThemedText type="title" style={styles.title}>
                CodeGuage
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Connect your WakaTime account to see your coding activity, read-only.
              </ThemedText>
            </View>

            {error ? (
              <Card style={[styles.errorCard, { borderColor: theme.danger }]}>
                <ThemedText type="smallBold" style={{ color: theme.danger }}>
                  Connection failed
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {error}
                </ThemedText>
              </Card>
            ) : null}

            <Card style={styles.card}>
              <ThemedText type="smallBold">Recommended</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Sign in with WakaTime using OAuth 2.0. Your client secret stays on the CodeGuage
                server and is never included in the app.
              </ThemedText>
              <PrimaryButton
                title={oauthConfigured ? 'Connect with WakaTime' : 'OAuth not configured'}
                loading={busy === 'oauth'}
                disabled={!oauthConfigured || !request}
                onPress={startOAuth}
              />
              {!oauthConfigured ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Set EXPO_PUBLIC_WAKATIME_CLIENT_ID and EXPO_PUBLIC_API_URL to enable OAuth.
                </ThemedText>
              ) : null}
            </Card>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <ThemedText type="small" themeColor="textSecondary">
                or
              </ThemedText>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

            <Card style={styles.card}>
              <ThemedText type="smallBold">Use an API key</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Paste a WakaTime API key to connect instantly. It is stored in encrypted secure
                storage on this device only.
              </ThemedText>
              <TextInput
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="waka_xxxxxxxx"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement },
                ]}
              />
              <PrimaryButton
                title="Connect with API key"
                variant="ghost"
                loading={busy === 'apikey'}
                disabled={apiKey.trim().length === 0}
                onPress={submitApiKey}
              />
              <ThemedText type="small" themeColor="textSecondary" onPress={openApiKeyPage}>
                Where do I find my API key?
              </ThemedText>
            </Card>

            <Card style={styles.card}>
              <ThemedText type="smallBold">OAuth redirect URI</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Register this exact redirect URI on your WakaTime OAuth app:
              </ThemedText>
              <ThemedText type="code">{redirectUri}</ThemedText>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  hero: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    gap: Spacing.two,
  },
  errorCard: {
    gap: Spacing.one,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  input: {
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
