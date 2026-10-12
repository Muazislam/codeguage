import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildExchangeBody, buildRefreshBody, parseTokenResponse } from './wakatime';

test('buildExchangeBody includes required OAuth fields', () => {
  const body = buildExchangeBody({
    clientId: 'cid',
    clientSecret: 'sec',
    code: 'abc',
    redirectUri: 'codeguage://oauth',
    codeVerifier: 'ver',
  });

  assert.equal(body.get('grant_type'), 'authorization_code');
  assert.equal(body.get('client_id'), 'cid');
  assert.equal(body.get('client_secret'), 'sec');
  assert.equal(body.get('redirect_uri'), 'codeguage://oauth');
  assert.equal(body.get('code'), 'abc');
  assert.equal(body.get('code_verifier'), 'ver');
});

test('buildRefreshBody sets refresh_token grant', () => {
  const body = buildRefreshBody({ clientId: 'cid', clientSecret: 'sec', refreshToken: 'r' });
  assert.equal(body.get('grant_type'), 'refresh_token');
  assert.equal(body.get('refresh_token'), 'r');
});

test('parseTokenResponse handles JSON payloads', () => {
  assert.deepEqual(
    parseTokenResponse({ access_token: 't', refresh_token: 'r', expires_in: 7200, scope: 'email' }),
    { accessToken: 't', refreshToken: 'r', expiresIn: 7200, scope: 'email' }
  );
});

test('parseTokenResponse handles form-encoded payloads', () => {
  const parsed = parseTokenResponse('access_token=t2&refresh_token=r2&expires_in=60');
  assert.equal(parsed.accessToken, 't2');
  assert.equal(parsed.refreshToken, 'r2');
  assert.equal(parsed.expiresIn, 60);
});

test('parseTokenResponse defaults expiry and rejects missing token', () => {
  assert.equal(parseTokenResponse({ access_token: 'x' }).expiresIn, 3600);
  assert.throws(() => parseTokenResponse({}), /access_token/);
});
