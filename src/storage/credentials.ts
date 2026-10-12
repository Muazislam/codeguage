import type { WakaTimeUser } from '../types';
import { deleteItem, getItem, setItem } from './kv';

export type Credentials =
  | {
      method: 'oauth';
      accessToken: string;
      refreshToken?: string;
      expiresAt: number;
      scope?: string;
    }
  | { method: 'apikey'; apiKey: string };

const CREDENTIALS_KEY = 'codeguage.credentials';
const USER_KEY = 'codeguage.user';

export async function saveCredentials(credentials: Credentials): Promise<void> {
  await setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

export async function loadCredentials(): Promise<Credentials | null> {
  const raw = await getItem(CREDENTIALS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Credentials;
    if (parsed.method === 'oauth' || parsed.method === 'apikey') return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function saveUser(user: WakaTimeUser): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function loadUser(): Promise<WakaTimeUser | null> {
  const raw = await getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WakaTimeUser;
  } catch {
    return null;
  }
}

export async function clearAll(): Promise<void> {
  await deleteItem(CREDENTIALS_KEY);
  await deleteItem(USER_KEY);
}
