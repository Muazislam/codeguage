import type {
  BreakdownEntry,
  BreakdownKind,
  DailyPoint,
  WakaTimeSummary,
} from '../types';
import { weekdayLabel } from './format';

export function totalSeconds(summaries: WakaTimeSummary[]): number {
  return summaries.reduce((sum, summary) => sum + (summary.grand_total?.total_seconds ?? 0), 0);
}

export function aggregateBreakdown(
  summaries: WakaTimeSummary[],
  kind: BreakdownKind
): BreakdownEntry[] {
  const totals = new Map<string, number>();
  for (const summary of summaries) {
    const items = summary[kind] ?? [];
    for (const item of items) {
      const name = item.name?.trim() || 'Unknown';
      totals.set(name, (totals.get(name) ?? 0) + (item.total_seconds ?? 0));
    }
  }
  const grandTotal = [...totals.values()].reduce((sum, value) => sum + value, 0);
  return [...totals.entries()]
    .map(([name, seconds]) => ({
      name,
      seconds,
      percent: grandTotal > 0 ? (seconds / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.seconds - a.seconds);
}

export function dailySeries(summaries: WakaTimeSummary[]): DailyPoint[] {
  return summaries
    .map((summary) => ({
      date: summary.range?.date ?? '',
      seconds: summary.grand_total?.total_seconds ?? 0,
    }))
    .filter((point) => point.date.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((point) => ({
      date: point.date,
      label: weekdayLabel(point.date),
      seconds: point.seconds,
    }));
}

export function averageSeconds(summaries: WakaTimeSummary[]): number {
  const active = summaries.filter((summary) => (summary.grand_total?.total_seconds ?? 0) > 0);
  if (active.length === 0) return 0;
  return totalSeconds(summaries) / active.length;
}
