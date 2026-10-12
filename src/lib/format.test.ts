import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatDuration, formatPercent, shortDate, weekdayLabel } from './format';

test('formatDuration renders hours and minutes', () => {
  assert.equal(formatDuration(0), '0m');
  assert.equal(formatDuration(30), '<1m');
  assert.equal(formatDuration(60), '1m');
  assert.equal(formatDuration(3600), '1h 0m');
  assert.equal(formatDuration(12345.6), '3h 25m');
  assert.equal(formatDuration(-10), '0m');
});

test('formatPercent rounds to one decimal', () => {
  assert.equal(formatPercent(12.345), '12.3%');
  assert.equal(formatPercent(50), '50%');
  assert.equal(formatPercent(Number.NaN), '0%');
});

test('date helpers derive weekday and short date', () => {
  assert.equal(weekdayLabel('2024-03-04'), 'Mon');
  assert.equal(weekdayLabel('not-a-date'), 'not-a-date');
  assert.equal(shortDate('2024-03-04'), '3/4');
});
