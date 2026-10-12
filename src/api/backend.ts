import { API_BASE_URL } from '../config';
import { AppError } from '../lib/errors';

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope?: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AppError('network', 'Could not reach the CodeGuage server');
  }

  if (!response.ok) {
    let detail = '';
    try {
      detail = await response.text();
    } catch {
      detail = '';
    }
    const suffix = detail ? `: ${detail.slice(0, 200)}` : '';
    throw new AppError('server', `CodeGuage server responded with ${response.status}${suffix}`, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new AppError('bad_response', 'CodeGuage server returned invalid JSON');
  }
}

export async function exchangeCode(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<TokenSet> {
  return postJson<TokenSet>('/api/oauth/exchange', params);
}

export async function refreshTokens(refreshToken: string): Promise<TokenSet> {
  return postJson<TokenSet>('/api/oauth/refresh', { refreshToken });
}

export async function revokeToken(token: string): Promise<void> {
  await postJson<{ ok: boolean }>('/api/oauth/revoke', { token });
}
