import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? 'http://localhost:8787';

export const WAKATIME_CLIENT_ID =
  process.env.EXPO_PUBLIC_WAKATIME_CLIENT_ID ?? extra.wakatimeClientId ?? '';

export const WAKATIME_AUTHORIZE_URL = 'https://wakatime.com/oauth/authorize';
export const OAUTH_SCOPES = ['email', 'read_stats'];
export const OAUTH_REDIRECT_PATH = 'oauth';

export const isConfigured = API_BASE_URL.length > 0 && WAKATIME_CLIENT_ID.length > 0;
