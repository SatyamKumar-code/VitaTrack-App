import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import { WearableCorrelationInsights } from '../types/wearable.types';

interface WearableCorrelationCardProps {
  insights: WearableCorrelationInsights | null;
}

export const WearableCorrelationCard: React.FC<WearableCorrelationCardProps> = ({ insights }) => {
  if (!insights) {
    return null;
  }

  const { assessmentCorrelation, sevenDayAverages, hasWearableData } = insights;
  const status = assessmentCorrelation.fatigueCorrelationStatus;

  const getStatusColor = () => {
    switch (status) {
      case 'aggravating':
        return {
          badgeBg: 'rgba(239, 68, 68, 0.15)',
          badgeText: Colors.clinical.highRisk,
          border: 'rgba(239, 68, 68, 0.3)',
          label: 'Lifestyle Aggravation Flag'
        };
      case 'contributing':
        return {
          badgeBg: 'rgba(245, 158, 11, 0.15)',
          badgeText: Colors.clinical.moderateRisk,
          border: 'rgba(245, 158, 11, 0.3)',
          label: 'Contributing Factor'
        };
      case 'optimal':
        return {
          badgeBg: 'rgba(16, 185, 129, 0.15)',
          badgeText: Colors.clinical.lowRisk,
          border: 'rgba(16, 185, 129, 0.3)',
          label: 'Biometric Balance'
        };
      default:
        return {
          badgeBg: 'rgba(148, 163, 184, 0.15)',
          badgeText: Colors.slate.textMuted,
          border: 'rgba(148, 163, 184, 0.3)',
          label: 'Awaiting Wearable Data'
        };
    }
  };

  const statusTheme = getStatusColor();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>🔬</Text>
          <Text style={styles.title}>Wearable Lifestyle Correlation</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusTheme.badgeBg, borderColor: statusTheme.border }
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: statusTheme.badgeText }]}>
            {statusTheme.label}
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Correlating 7-day movement &amp; sleep telemetry with your clinical assessment fatigue scores
      </Text>

      {/* 7-Day Micro Stats Grid */}
      {hasWearableData && (
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>7-Day Avg Steps</Text>
            <Text style={styles.metricValue}>
              {sevenDayAverages.avgSteps.toLocaleString()}
            </Text>
            <Text style={styles.metricSub}>
              {assessmentCorrelation.activityEvaluation.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>7-Day Avg Sleep</Text>
            <Text style={styles.metricValue}>
              {sevenDayAverages.avgSleepMinutes
                ? `${(sevenDayAverages.avgSleepMinutes / 60).toFixed(1)}h`
                : '—'}
            </Text>
            <Text style={styles.metricSub}>
              {assessmentCorrelation.sleepEvaluation.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Reported Fatigue</Text>
            <Text style={[styles.metricValue, { color: Colors.primary.amber }]}>
              {assessmentCorrelation.reportedFatigueLevel.toUpperCase()}
            </Text>
            <Text style={styles.metricSub}>SURVEY</Text>
          </View>
        </View>
      )}

      {/* Clinical Synergy Insight Callout */}
      <View style={styles.insightBox}>
        <Text style={styles.insightTitle}>Clinical Synthesis &amp; Action Plan</Text>
        <Text style={styles.insightBody}>
          {assessmentCorrelation.clinicalSynergyInsight}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.slate.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    fontSize: 18,
    marginRight: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate.textMain
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginBottom: 14,
    lineHeight: 16
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0B0F19',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  metricItem: {
    flex: 1,
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.slate.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate.textMain
  },
  metricSub: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.clinical.teal,
    marginTop: 2
  },
  insightBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.amber,
    padding: 12
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary.amber,
    marginBottom: 4
  },
  insightBody: {
    fontSize: 12,
    color: Colors.slate.textMain,
    lineHeight: 18
  }
});
