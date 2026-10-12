import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isOAuthConfigured, loadConfig } from './config';

test('loadConfig applies defaults', () => {
  const config = loadConfig({});
  assert.equal(config.port, 8787);
  assert.deepEqual(config.allowedRedirects, ['codeguage://oauth']);
  assert.equal(isOAuthConfigured(config), false);
});

test('loadConfig parses redirect list and detects oauth', () => {
  const config = loadConfig({
    PORT: '9000',
    WAKATIME_CLIENT_ID: 'id',
    WAKATIME_CLIENT_SECRET: 'secret',
    ALLOWED_REDIRECT_URIS: 'a://x, b://y ,',
  });
  assert.equal(config.port, 9000);
  assert.deepEqual(config.allowedRedirects, ['a://x', 'b://y']);
  assert.equal(isOAuthConfigured(config), true);
});
