import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { WakaTimeSummary } from '../types';
import { aggregateBreakdown, averageSeconds, dailySeries, totalSeconds } from './stats';

function summary(
  date: string,
  seconds: number,
  extra: Partial<WakaTimeSummary> = {}
): WakaTimeSummary {
  return {
    grand_total: { total_seconds: seconds, text: '' },
    range: { date, start: '', end: '' },
    ...extra,
  };
}

test('totalSeconds sums grand totals', () => {
  assert.equal(totalSeconds([summary('2024-03-01', 100), summary('2024-03-02', 200)]), 300);
});

test('aggregateBreakdown merges names and computes percent', () => {
  const summaries: WakaTimeSummary[] = [
    summary('2024-03-01', 300, {
      languages: [
        { name: 'TypeScript', total_seconds: 200, text: '' },
        { name: 'Rust', total_seconds: 100, text: '' },
      ],
    }),
    summary('2024-03-02', 100, {
      languages: [
        { name: 'TypeScript', total_seconds: 50, text: '' },
        { name: 'Rust', total_seconds: 50, text: '' },
      ],
    }),
  ];

  const result = aggregateBreakdown(summaries, 'languages');
  assert.deepEqual(result, [
    { name: 'TypeScript', seconds: 250, percent: 62.5 },
    { name: 'Rust', seconds: 150, percent: 37.5 },
  ]);
});

test('aggregateBreakdown handles empty input', () => {
  assert.deepEqual(aggregateBreakdown([], 'projects'), []);
});

test('dailySeries sorts by date and labels weekday', () => {
  const series = dailySeries([
    summary('2024-03-05', 300),
    summary('2024-03-04', 100),
  ]);
  assert.deepEqual(series, [
    { date: '2024-03-04', label: 'Mon', seconds: 100 },
    { date: '2024-03-05', label: 'Tue', seconds: 300 },
  ]);
});

test('averageSeconds divides by active days only', () => {
  assert.equal(averageSeconds([summary('2024-03-01', 0), summary('2024-03-02', 600)]), 600);
  assert.equal(averageSeconds([]), 0);
});
