export interface ServerConfig {
  port: number;
  clientId: string;
  clientSecret: string;
  allowedRedirects: string[];
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const parsedPort = Number(env.PORT ?? 8787);
  const allowedRedirects = (env.ALLOWED_REDIRECT_URIS ?? 'codeguage://oauth')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return {
    port: Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 8787,
    clientId: env.WAKATIME_CLIENT_ID ?? '',
    clientSecret: env.WAKATIME_CLIENT_SECRET ?? '',
    allowedRedirects,
  };
}

export function isOAuthConfigured(config: ServerConfig): boolean {
  return config.clientId.length > 0 && config.clientSecret.length > 0;
}
