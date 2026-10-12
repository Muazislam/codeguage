import cors from 'cors';
import express, { type Request, type Response } from 'express';

import { isOAuthConfigured, type ServerConfig } from './config.js';
import {
  exchangeAuthorizationCode,
  refreshAccessToken,
  revokeAccessToken,
} from './wakatime.js';

function respondError(res: Response, error: unknown): void {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('[codeguage]', message);
  res.status(502).json({ error: 'upstream_error', message });
}

export function createApp(config: ServerConfig) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true, oauthConfigured: isOAuthConfigured(config) });
  });

  app.post('/api/oauth/exchange', async (req: Request, res: Response) => {
    if (!isOAuthConfigured(config)) {
      res.status(500).json({ error: 'oauth_not_configured' });
      return;
    }
    const { code, codeVerifier, redirectUri } = req.body ?? {};
    if (typeof code !== 'string' || typeof redirectUri !== 'string') {
      res.status(400).json({ error: 'invalid_request', message: 'code and redirectUri are required' });
      return;
    }
    if (config.allowedRedirects.length > 0 && !config.allowedRedirects.includes(redirectUri)) {
      res.status(400).json({ error: 'redirect_uri_not_allowed' });
      return;
    }
    try {
      const tokens = await exchangeAuthorizationCode({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        code,
        redirectUri,
        codeVerifier: typeof codeVerifier === 'string' ? codeVerifier : undefined,
      });
      res.json(tokens);
    } catch (error) {
      respondError(res, error);
    }
  });

  app.post('/api/oauth/refresh', async (req: Request, res: Response) => {
    if (!isOAuthConfigured(config)) {
      res.status(500).json({ error: 'oauth_not_configured' });
      return;
    }
    const { refreshToken } = req.body ?? {};
    if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
      res.status(400).json({ error: 'invalid_request', message: 'refreshToken is required' });
      return;
    }
    try {
      const tokens = await refreshAccessToken({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken,
      });
      res.json(tokens);
    } catch (error) {
      respondError(res, error);
    }
  });

  app.post('/api/oauth/revoke', async (req: Request, res: Response) => {
    if (!isOAuthConfigured(config)) {
      res.status(500).json({ error: 'oauth_not_configured' });
      return;
    }
    const { token } = req.body ?? {};
    if (typeof token !== 'string' || token.length === 0) {
      res.status(400).json({ error: 'invalid_request', message: 'token is required' });
      return;
    }
    try {
      const ok = await revokeAccessToken({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        token,
      });
      res.json({ ok });
    } catch (error) {
      respondError(res, error);
    }
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'not_found' });
  });

  return app;
}
