import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DailyPoint } from '@/types';

function axisLabel(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0';
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(hours)}h`;
}

export function DailyChart({ points }: { points: DailyPoint[] }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const total = points.reduce((sum, point) => sum + point.seconds, 0);
  const maxSeconds = points.reduce((max, point) => Math.max(max, point.seconds), 0);
  const maxValue = Math.max(3600, Math.ceil(maxSeconds / 1800) * 1800);

  const data = points.map((point) => ({
    value: point.seconds,
    label: point.label,
    frontColor: theme.chart,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold">Daily activity</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Last 7 days
        </ThemedText>
      </View>
      <View onLayout={onLayout} style={styles.chartArea}>
        {total <= 0 || width <= 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No coding activity recorded in the last 7 days.
          </ThemedText>
        ) : (
          <BarChart
            data={data}
            width={width}
            height={180}
            barWidth={22}
            spacing={16}
            initialSpacing={12}
            endSpacing={12}
            maxValue={maxValue}
            noOfSections={4}
            barBorderRadius={6}
            frontColor={theme.chart}
            disablePress
            hideRules
            hideYAxisText={false}
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisLabelWidth={40}
            yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 11 }}
            formatYLabel={(label) => axisLabel(Number(label))}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartArea: {
    minHeight: 180,
    justifyContent: 'center',
  },
});
