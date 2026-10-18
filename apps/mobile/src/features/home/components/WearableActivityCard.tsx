import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../shared/theme/colors';
import { triggerTabHaptic } from '../../../shared/utils/haptics';

interface WearableActivityCardProps {
  isAuthenticated: boolean;
  steps?: number;
  restingHeartRate?: number;
  sleepMinutes?: number;
  spO2?: number;
}

export const WearableActivityCard: React.FC<WearableActivityCardProps> = ({
  isAuthenticated,
  steps = 7420,
  restingHeartRate = 68,
  sleepMinutes = 465, // 7h 45m
  spO2 = 98.2
}) => {
  const router = useRouter();

  const handleCardPress = () => {
    triggerTabHaptic();
    router.push('/wearables' as any);
  };

  const sleepHours = Math.floor(sleepMinutes / 60);
  const sleepRemainderMinutes = sleepMinutes % 60;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCardPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.watchIcon}>⌚</Text>
          <View>
            <Text style={styles.cardTitle}>Connected Watch &amp; Activity Sync</Text>
            <Text style={styles.cardSubtitle}>
              {isAuthenticated ? 'Health Connect Sync' : 'Biometric Preview Mode'}
            </Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusDot}>●</Text>
          <Text style={styles.statusText}>
            {isAuthenticated ? 'Synced' : 'Preview'}
          </Text>
        </View>
      </View>

      {/* 4 Key Biometrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Daily Step Count</Text>
          <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
          <Text style={styles.metricSub}>Goal: 8,000</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Resting Heart Rate</Text>
          <Text style={styles.metricValue}>{restingHeartRate} bpm</Text>
          <Text style={styles.metricSub}>Normal Resting</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Sleep Duration</Text>
          <Text style={styles.metricValue}>
            {sleepHours}h {sleepRemainderMinutes}m
          </Text>
          <Text style={styles.metricSub}>Optimal Rest</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Blood Oxygen SpO₂</Text>
          <Text style={styles.metricValue}>{spO2}%</Text>
          <Text style={styles.metricSub}>Healthy Saturation</Text>
        </View>
      </View>

      {/* Footer Banner */}
      <View style={styles.footerRow}>
        <Text style={styles.footerNote}>
          {isAuthenticated
            ? 'Correlating activity with solar energy & fatigue resilience'
            : 'Explore sample wearable telemetry • Tap to view biometrics hub'}
        </Text>
        <Text style={styles.footerLink}>Wearables &rarr;</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 18,
    marginBottom: 20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  watchIcon: {
    fontSize: 22
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    marginTop: 2
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10
  },
  statusDot: {
    color: Colors.clinical.lowRisk,
    fontSize: 8
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.clinical.lowRisk
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14
  },
  metricBox: {
    width: '48%',
    backgroundColor: 'rgba(30, 41, 59, 0.50)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.45)',
    padding: 12
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.slate.textMuted,
    marginBottom: 4
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate.textMain
  },
  metricSub: {
    fontSize: 10,
    color: Colors.primary.amber,
    marginTop: 2,
    fontWeight: '500'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.50)',
    paddingTop: 12
  },
  footerNote: {
    flex: 1,
    fontSize: 11,
    color: Colors.slate.textMuted,
    paddingRight: 10
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.amber
  }
});
