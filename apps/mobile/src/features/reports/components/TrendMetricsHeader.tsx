import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendSummaryMetrics } from '../types/report.types';
import { Colors } from '../../../shared/theme/colors';

interface Props {
  metrics: TrendSummaryMetrics;
}

export const TrendMetricsHeader: React.FC<Props> = ({ metrics }) => {
  const getTrendIconAndColor = () => {
    switch (metrics.trendDirection) {
      case 'improving':
        return {
          icon: '📉',
          label: `Improving (${metrics.scoreDelta} pts)`,
          color: Colors.clinical.lowRisk,
          bg: 'rgba(16, 185, 129, 0.12)'
        };
      case 'worsening':
        return {
          icon: '📈',
          label: `Worsening (+${metrics.scoreDelta} pts)`,
          color: Colors.clinical.highRisk,
          bg: 'rgba(239, 68, 68, 0.12)'
        };
      case 'stable':
        return {
          icon: '➡️',
          label: 'Stable Trajectory',
          color: Colors.primary.amber,
          bg: 'rgba(245, 158, 11, 0.12)'
        };
      default:
        return {
          icon: '📊',
          label: 'Baseline Set',
          color: Colors.clinical.teal,
          bg: 'rgba(13, 148, 136, 0.12)'
        };
    }
  };

  const trend = getTrendIconAndColor();

  return (
    <View style={styles.container}>
      {/* Top Row: Average & Trend Direction */}
      <View style={styles.gridRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Average Risk Score</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValueLarge}>{metrics.averageScore}</Text>
            <Text style={styles.metricValueMax}>/ 100</Text>
          </View>
          <Text style={styles.metricSubtext}>Across all evaluations</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Progression Trend</Text>
          <View style={[styles.trendBadge, { backgroundColor: trend.bg }]}>
            <Text style={styles.trendIcon}>{trend.icon}</Text>
            <Text style={[styles.trendLabel, { color: trend.color }]}>{trend.label}</Text>
          </View>
          <Text style={styles.metricSubtext}>
            {metrics.totalAssessments >= 2
              ? `${metrics.earliestScore} → ${metrics.latestScore} composite`
              : 'Complete more tests to see trend'}
          </Text>
        </View>
      </View>

      {/* Bottom Row: Total, Range, and Distribution */}
      <View style={[styles.gridRow, { marginTop: 10 }]}>
        <View style={[styles.metricCardSmall, { flex: 1 }]}>
          <Text style={styles.smallLabel}>Completed</Text>
          <Text style={styles.smallValue}>{metrics.totalAssessments}</Text>
        </View>

        <View style={[styles.metricCardSmall, { flex: 1.2 }]}>
          <Text style={styles.smallLabel}>Score Range</Text>
          <Text style={styles.smallValue}>
            {metrics.lowestScore ?? '—'} <Text style={{ color: Colors.slate.textMuted }}>to</Text>{' '}
            {metrics.highestScore ?? '—'}
          </Text>
        </View>

        <View style={[styles.metricCardSmall, { flex: 1.6 }]}>
          <Text style={styles.smallLabel}>Distribution</Text>
          <View style={styles.distributionPills}>
            <View style={[styles.miniPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.miniPillText, { color: Colors.clinical.lowRisk }]}>
                {metrics.riskDistribution.low} Low
              </Text>
            </View>
            <View style={[styles.miniPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={[styles.miniPillText, { color: Colors.clinical.moderateRisk }]}>
                {metrics.riskDistribution.moderate} Mod
              </Text>
            </View>
            <View style={[styles.miniPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Text style={[styles.miniPillText, { color: Colors.clinical.highRisk }]}>
                {metrics.riskDistribution.high} High
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.slate.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 14,
    justifyContent: 'space-between'
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4
  },
  metricValueLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.slate.textMain
  },
  metricValueMax: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    fontWeight: '500'
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 4
  },
  trendIcon: {
    fontSize: 14
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: '700'
  },
  metricSubtext: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    marginTop: 6
  },
  metricCardSmall: {
    backgroundColor: Colors.slate.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center'
  },
  smallLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.slate.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  smallValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  distributionPills: {
    flexDirection: 'row',
    gap: 4
  },
  miniPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4
  },
  miniPillText: {
    fontSize: 9,
    fontWeight: '700'
  }
});
