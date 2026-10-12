import assert from 'node:assert/strict';
import { test } from 'node:test';

import { base64Encode } from './base64';

test('encodes ascii strings', () => {
  assert.equal(base64Encode('waka_123'), 'd2FrYV8xMjM=');
  assert.equal(base64Encode('abc'), 'YWJj');
  assert.equal(base64Encode('a'), 'YQ==');
  assert.equal(base64Encode(''), '');
});

test('encodes utf-8 strings', () => {
  assert.equal(base64Encode('é'), 'w6k=');
  assert.equal(base64Encode('✓ check'), '4pyTIGNoZWNr');
});
