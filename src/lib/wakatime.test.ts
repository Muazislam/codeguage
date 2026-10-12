import assert from 'node:assert/strict';
import { test } from 'node:test';

import { AppError, classifyStatus, userMessage } from './errors';
import { apiKeyHeader, bearerHeader, currentUserUrl, summariesUrl } from './wakatime';

test('builds WakaTime URLs', () => {
  assert.equal(summariesUrl('last_7_days'), 'https://wakatime.com/api/v1/users/current/summaries?range=last_7_days');
  assert.equal(currentUserUrl(), 'https://wakatime.com/api/v1/users/current');
});

test('builds authorization headers without leaking raw keys', () => {
  assert.equal(bearerHeader('waka_tok_123').Authorization, 'Bearer waka_tok_123');
  assert.equal(apiKeyHeader('waka_123').Authorization, 'Basic d2FrYV8xMjM=');
});

test('classifyStatus maps HTTP codes to error types', () => {
  assert.equal(classifyStatus(401), 'auth');
  assert.equal(classifyStatus(403), 'auth');
  assert.equal(classifyStatus(429), 'rate_limit');
  assert.equal(classifyStatus(500), 'server');
  assert.equal(classifyStatus(400), 'unknown');
});

test('userMessage produces human readable text', () => {
  assert.match(userMessage(new AppError('network', 'boom')), /internet connection/i);
  assert.match(userMessage(new AppError('rate_limit', 'boom')), /rate limiting/i);
  assert.equal(userMessage(new Error('custom failure')), 'custom failure');
});
