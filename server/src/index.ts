import 'dotenv/config';

import { createApp } from './app.js';
import { isOAuthConfigured, loadConfig } from './config.js';

const config = loadConfig();
const app = createApp(config);

app.listen(config.port, () => {
  console.log(`[codeguage] server listening on http://localhost:${config.port}`);
  if (!isOAuthConfigured(config)) {
    console.warn(
      '[codeguage] WAKATIME_CLIENT_ID / WAKATIME_CLIENT_SECRET are not set. OAuth endpoints will return 500.'
    );
  }
  console.log(`[codeguage] allowed redirect URIs: ${config.allowedRedirects.join(', ') || '(any)'}`);
});
