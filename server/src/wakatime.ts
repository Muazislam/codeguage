export const WAKATIME_TOKEN_ENDPOINT = 'https://wakatime.com/oauth/token';
export const WAKATIME_REVOKE_ENDPOINT = 'https://wakatime.com/oauth/revoke';

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope?: string;
}

export function buildExchangeBody(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}): URLSearchParams {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
    code: params.code,
  });
  if (params.codeVerifier) {
    body.set('code_verifier', params.codeVerifier);
  }
  return body;
}

export function buildRefreshBody(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): URLSearchParams {
  return new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: params.clientId,
    client_secret: params.clientSecret,
    refresh_token: params.refreshToken,
  });
}

export function parseTokenResponse(payload: unknown): TokenSet {
  let data: Record<string, unknown>;

  if (typeof payload === 'string') {
    data = Object.fromEntries(new URLSearchParams(payload));
  } else if (payload && typeof payload === 'object') {
    data = payload as Record<string, unknown>;
  } else {
    throw new Error('Unexpected token response from WakaTime');
  }

  const accessToken = data.access_token;
  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new Error('WakaTime token response is missing access_token');
  }

  const expiresIn = Number(data.expires_in);

  return {
    accessToken,
    refreshToken: typeof data.refresh_token === 'string' ? data.refresh_token : undefined,
    expiresIn: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3600,
    scope: typeof data.scope === 'string' ? data.scope : undefined,
  };
}

async function requestToken(body: URLSearchParams): Promise<TokenSet> {
  const response = await fetch(WAKATIME_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`WakaTime token endpoint responded with ${response.status}: ${text.slice(0, 200)}`);
  }

  let parsed: unknown = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  return parseTokenResponse(parsed);
}

export async function exchangeAuthorizationCode(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}): Promise<TokenSet> {
  return requestToken(buildExchangeBody(params));
}

export async function refreshAccessToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<TokenSet> {
  return requestToken(buildRefreshBody(params));
}

export async function revokeAccessToken(params: {
  clientId: string;
  clientSecret: string;
  token: string;
}): Promise<boolean> {
  const response = await fetch(WAKATIME_REVOKE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      token: params.token,
    }),
  });
  return response.ok;
}
