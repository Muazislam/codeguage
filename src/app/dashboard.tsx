import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session';
import { BreakdownList } from '@/components/breakdown-list';
import { DailyChart } from '@/components/daily-chart';
import { SegmentedControl } from '@/components/segmented-control';
import { StatCard } from '@/components/stat-card';
import { ErrorView, LoadingView } from '@/components/state-views';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useStats } from '@/hooks/use-stats';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration } from '@/lib/format';
import type { SummaryRange } from '@/types';

const RANGE_OPTIONS = [
  { label: 'Today', value: 'today' as const },
  { label: 'Last 7 days', value: 'last_7_days' as const },
  { label: 'Last 30 days', value: 'last_30_days' as const },
];

function clockTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, authMethod } = useSession();
  const { data, loading, refreshing, error, refresh } = useStats();
  const [range, setRange] = useState<SummaryRange>('last_7_days');

  if (!data) {
    return (
      <ThemedView style={styles.root}>
        <SafeAreaView style={styles.flex}>
          {error ? (
            <ErrorView error={error} onRetry={() => void refresh()} />
          ) : (
            <LoadingView />
          )}
        </SafeAreaView>
      </ThemedView>
    );
  }

  const breakdowns = data.breakdowns[range];
  const displayName = user?.display_name ?? user?.username ?? 'WakaTime user';

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="small" themeColor="textSecondary">
              Signed in as
            </ThemedText>
            <ThemedText type="smallBold" numberOfLines={1}>
              {displayName}
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/settings')}
              style={[styles.pill, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">Settings</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh stats"
              onPress={() => void refresh()}
              disabled={refreshing}
              style={[styles.pill, { backgroundColor: theme.primary, opacity: refreshing ? 0.6 : 1 }]}>
              {refreshing ? (
                <ActivityIndicator color={theme.primaryText} size="small" />
              ) : (
                <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
                  Refresh
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={theme.text}
            />
          }>
          {error ? (
            <View style={[styles.banner, { backgroundColor: theme.backgroundElement, borderColor: theme.danger }]}>
              <ThemedText type="small" style={{ color: theme.danger }}>
                Could not refresh. Showing the last data loaded at {clockTime(data.fetchedAt)}.
              </ThemedText>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : null}

          <StatCard
            label="Today"
            value={formatDuration(data.todaySeconds)}
            hint="Total coding time logged today"
          />

          <View style={styles.row}>
            <StatCard
              label="Last 7 days"
              value={formatDuration(data.sevenDaySeconds)}
              hint={`Avg ${formatDuration(data.sevenDayAverageSeconds)}/active day`}
            />
            <StatCard label="Last 30 days" value={formatDuration(data.thirtyDaySeconds)} />
          </View>

          <DailyChart points={data.daily} />

          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Breakdowns</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {range === 'today' ? 'Today' : range === 'last_7_days' ? 'Last 7 days' : 'Last 30 days'}
            </ThemedText>
          </View>
          <SegmentedControl options={RANGE_OPTIONS} value={range} onChange={setRange} />

          <BreakdownList title="Languages" entries={breakdowns.languages} />
          <BreakdownList title="Projects" entries={breakdowns.projects} />
          <BreakdownList title="Editors" entries={breakdowns.editors} />

          <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
            {authMethod === 'apikey' ? 'Connected with API key' : 'Connected with OAuth'} · Updated{' '}
            {clockTime(data.fetchedAt)} · Read-only
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  headerText: {
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  banner: {
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  inlineLoading: {
    paddingVertical: Spacing.one,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
