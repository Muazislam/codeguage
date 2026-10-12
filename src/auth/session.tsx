import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { exchangeCode, refreshTokens, revokeToken } from '@/api/backend';
import { AppError } from '@/lib/errors';
import {
  apiKeyHeader,
  bearerHeader,
  fetchCurrentUser,
  type AuthHeader,
} from '@/lib/wakatime';
import {
  clearAll,
  loadCredentials,
  loadUser,
  saveCredentials,
  saveUser,
  type Credentials,
} from '@/storage/credentials';
import type { WakaTimeUser } from '@/types';

export type SessionStatus = 'loading' | 'connected' | 'disconnected';

interface SessionValue {
  status: SessionStatus;
  user: WakaTimeUser | null;
  authMethod: 'oauth' | 'apikey' | null;
  completeOAuth: (params: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }) => Promise<void>;
  connectWithApiKey: (apiKey: string) => Promise<void>;
  disconnect: () => Promise<void>;
  getAuthHeader: () => Promise<AuthHeader>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<WakaTimeUser | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const credentialsRef = useRef<Credentials | null>(null);

  const applyCredentials = useCallback((next: Credentials | null) => {
    credentialsRef.current = next;
    setCredentials(next);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [storedCredentials, storedUser] = await Promise.all([loadCredentials(), loadUser()]);
      if (!active) return;
      applyCredentials(storedCredentials);
      setUser(storedUser);
      setStatus(storedCredentials ? 'connected' : 'disconnected');
    })();
    return () => {
      active = false;
    };
  }, [applyCredentials]);

  const completeOAuth = useCallback(
    async (params: { code: string; codeVerifier: string; redirectUri: string }) => {
      const tokens = await exchangeCode(params);
      const next: Credentials = {
        method: 'oauth',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + tokens.expiresIn * 1000,
        scope: tokens.scope,
      };
      const me = await fetchCurrentUser(bearerHeader(next.accessToken));
      await saveCredentials(next);
      await saveUser(me);
      applyCredentials(next);
      setUser(me);
      setStatus('connected');
    },
    [applyCredentials]
  );

  const connectWithApiKey = useCallback(
    async (apiKey: string) => {
      const trimmed = apiKey.trim();
      if (!trimmed) {
        throw new AppError('auth', 'Please enter your WakaTime API key.');
      }
      const me = await fetchCurrentUser(apiKeyHeader(trimmed));
      const next: Credentials = { method: 'apikey', apiKey: trimmed };
      await saveCredentials(next);
      await saveUser(me);
      applyCredentials(next);
      setUser(me);
      setStatus('connected');
    },
    [applyCredentials]
  );

  const disconnect = useCallback(async () => {
    const current = credentialsRef.current;
    if (current?.method === 'oauth') {
      try {
        await revokeToken(current.accessToken);
      } catch {
        /* best effort */
      }
    }
    await clearAll();
    applyCredentials(null);
    setUser(null);
    setStatus('disconnected');
  }, [applyCredentials]);

  const getAuthHeader = useCallback(async (): Promise<AuthHeader> => {
    const current = credentialsRef.current;
    if (!current) {
      throw new AppError('auth', 'You are not connected to WakaTime.');
    }
    if (current.method === 'apikey') {
      return apiKeyHeader(current.apiKey);
    }
    if (current.expiresAt - 60_000 > Date.now()) {
      return bearerHeader(current.accessToken);
    }
    if (!current.refreshToken) {
      throw new AppError('auth', 'Your WakaTime session expired. Please reconnect.');
    }
    const tokens = await refreshTokens(current.refreshToken);
    const next: Credentials = {
      method: 'oauth',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? current.refreshToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
      scope: tokens.scope ?? current.scope,
    };
    await saveCredentials(next);
    applyCredentials(next);
    return bearerHeader(next.accessToken);
  }, [applyCredentials]);

  const value = useMemo<SessionValue>(
    () => ({
      status,
      user,
      authMethod: credentials?.method ?? null,
      completeOAuth,
      connectWithApiKey,
      disconnect,
      getAuthHeader,
    }),
    [status, user, credentials, completeOAuth, connectWithApiKey, disconnect, getAuthHeader]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return value;
}
