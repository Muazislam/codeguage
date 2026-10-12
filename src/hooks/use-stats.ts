import { useCallback, useEffect, useRef, useState } from 'react';

import { useSession } from '@/auth/session';
import { aggregateBreakdown, averageSeconds, dailySeries, totalSeconds } from '@/lib/stats';
import { fetchSummaries } from '@/lib/wakatime';
import type { BreakdownKind, BreakdownEntry, DashboardData, WakaTimeSummary } from '@/types';

export const BREAKDOWN_KINDS: BreakdownKind[] = ['languages', 'projects', 'editors'];

function summarize(
  data: WakaTimeSummary[]
): Record<BreakdownKind, BreakdownEntry[]> {
  return {
    languages: aggregateBreakdown(data, 'languages'),
    projects: aggregateBreakdown(data, 'projects'),
    editors: aggregateBreakdown(data, 'editors'),
  };
}

export interface StatsState {
  data: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: unknown;
  refresh: () => Promise<void>;
}

export function useStats(): StatsState {
  const { status, getAuthHeader } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'initial') {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const headers = await getAuthHeader();
        const [today, week, month] = await Promise.all([
          fetchSummaries(headers, 'today', controller.signal),
          fetchSummaries(headers, 'last_7_days', controller.signal),
          fetchSummaries(headers, 'last_30_days', controller.signal),
        ]);

        const todayData = today.data ?? [];
        const weekData = week.data ?? [];
        const monthData = month.data ?? [];

        setData({
          todaySeconds: totalSeconds(todayData),
          sevenDaySeconds: totalSeconds(weekData),
          thirtyDaySeconds: totalSeconds(monthData),
          sevenDayAverageSeconds: averageSeconds(weekData),
          daily: dailySeries(weekData),
          breakdowns: {
            today: summarize(todayData),
            last_7_days: summarize(weekData),
            last_30_days: summarize(monthData),
          },
          fetchedAt: Date.now(),
        });
      } catch (caught) {
        if (!(caught instanceof Error && caught.name === 'AbortError')) {
          setError(caught);
        }
      } finally {
        if (controllerRef.current === controller) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [getAuthHeader]
  );

  useEffect(() => {
    if (status !== 'connected') {
      return;
    }
    load('initial');
    return () => controllerRef.current?.abort();
  }, [status, load]);

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  return { data, loading, refreshing, error, refresh };
}
