import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration, formatPercent } from '@/lib/format';
import type { BreakdownEntry } from '@/types';

interface BreakdownListProps {
  title: string;
  entries: BreakdownEntry[];
  limit?: number;
}

export function BreakdownList({ title, entries, limit = 6 }: BreakdownListProps) {
  const theme = useTheme();
  const visible = entries.slice(0, limit);

  return (
    <Card style={styles.card}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {visible.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          No activity in this period.
        </ThemedText>
      ) : (
        visible.map((entry) => {
          const width = `${Math.min(100, Math.max(0, entry.percent))}%` as const;
          return (
            <View key={entry.name} style={styles.row}>
              <View style={styles.rowHeader}>
                <ThemedText type="small" numberOfLines={1} style={styles.name}>
                  {entry.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatDuration(entry.seconds)} · {formatPercent(entry.percent)}
                </ThemedText>
              </View>
              <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
                <View style={[styles.fill, { width, backgroundColor: theme.chart }]} />
              </View>
            </View>
          );
        })
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.one,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
