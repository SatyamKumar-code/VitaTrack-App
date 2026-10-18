import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { Colors } from '../../../shared/theme/colors';
import { WearableMetricRecord } from '../types/wearable.types';

interface WearableHistorySparklineProps {
  history: WearableMetricRecord[];
}

export const WearableHistorySparkline: React.FC<WearableHistorySparklineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  // Ensure chronological order (oldest to newest, left to right)
  const sorted = [...history].sort((a, b) => a.metricsDate.localeCompare(b.metricsDate)).slice(-7);

  const maxSteps = Math.max(...sorted.map((r) => r.stepCount || 0), 10000);
  const chartHeight = 80;
  const chartWidth = 280;
  const barWidth = 24;
  const gap = (chartWidth - sorted.length * barWidth) / (sorted.length + 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>7-Day Daily Movement Trend</Text>
        <Text style={styles.legendText}>Goal: 10,000 steps</Text>
      </View>

      <View style={styles.svgWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* 10,000 steps benchmark line */}
          <Line
            x1="0"
            y1={chartHeight - (10000 / maxSteps) * (chartHeight - 10)}
            x2={chartWidth}
            y2={chartHeight - (10000 / maxSteps) * (chartHeight - 10)}
            stroke="#334155"
            strokeDasharray="4,4"
            strokeWidth="1"
          />

          {sorted.map((item, index) => {
            const x = gap + index * (barWidth + gap);
            const barHeight = Math.max(((item.stepCount || 0) / maxSteps) * (chartHeight - 15), 4);
            const y = chartHeight - barHeight;
            const isTargetMet = (item.stepCount || 0) >= 10000;

            return (
              <Rect
                key={item.metricsDate || index}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={isTargetMet ? Colors.clinical.lowRisk : Colors.primary.amber}
                opacity={0.9}
              />
            );
          })}
        </Svg>
      </View>

      {/* Date Labels */}
      <View style={[styles.datesRow, { width: chartWidth }]}>
        {sorted.map((item) => {
          const parts = item.metricsDate.split('-');
          const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : item.metricsDate;
          return (
            <Text key={item.metricsDate} style={styles.dateLabel}>
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.slate.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center'
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.slate.textMain
  },
  legendText: {
    fontSize: 11,
    color: Colors.slate.textMuted
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.slate.textMuted,
    fontWeight: '600'
  }
});
