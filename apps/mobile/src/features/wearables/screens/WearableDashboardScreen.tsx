import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../../shared/theme/colors';
import {
  DeviceHealthConnectStatus,
  WearableMetricRecord,
  WearableCorrelationInsights
} from '../types/wearable.types';
import { HealthConnectBridge } from '../services/healthConnectBridge';
import { WearableApiService } from '../services/wearableApiService';
import { ConnectionStatusBanner } from '../components/ConnectionStatusBanner';
import { BiometricMetricCard } from '../components/BiometricMetricCard';
import { WearableCorrelationCard } from '../components/WearableCorrelationCard';
import { WearableHistorySparkline } from '../components/WearableHistorySparkline';
import { VendorGuideSection } from '../components/VendorGuideSection';
import { getFriendlyErrorMessage } from '../../../shared/utils/errorMasking';

export const WearableDashboardScreen: React.FC = () => {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [status, setStatus] = useState<DeviceHealthConnectStatus | null>(null);
  const [latestMetric, setLatestMetric] = useState<WearableMetricRecord | null>(null);
  const [history, setHistory] = useState<WearableMetricRecord[]>([]);
  const [insights, setInsights] = useState<WearableCorrelationInsights | null>(null);

  // Selected device profile for simulation and demonstration
  const [selectedDevice, setSelectedDevice] = useState<{ manufacturer: string; model: string }>({
    manufacturer: 'Samsung',
    model: 'Galaxy Watch 6'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const connStatus = await HealthConnectBridge.checkAvailability();
      setStatus(connStatus);

      const [latest, hist, corInsights] = await Promise.all([
        WearableApiService.getLatestMetrics(),
        WearableApiService.getMetricsHistory(7),
        WearableApiService.getCorrelationInsights()
      ]);

      setLatestMetric(latest);
      setHistory(hist);
      setInsights(corInsights);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncNow = async () => {
    try {
      setSyncing(true);

      const hasPerms = await HealthConnectBridge.requestPermissions();
      if (!hasPerms && status?.tier === 'tier2_install_needed') {
        setSyncing(false);
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const queried = await HealthConnectBridge.queryBiometricsForDate(todayStr, selectedDevice);

      const result = await WearableApiService.syncBiometrics({
        deviceInfo: queried.deviceInfo,
        metricsDate: todayStr,
        data: queried.data
      });

      setLatestMetric(result.metric);

      // Refresh history and correlation insights
      const [updatedHist, updatedInsights] = await Promise.all([
        WearableApiService.getMetricsHistory(7),
        WearableApiService.getCorrelationInsights()
      ]);
      setHistory(updatedHist);
      setInsights(updatedInsights);

      Alert.alert(
        'Sync Complete',
        `Successfully synced biometric data from ${selectedDevice.manufacturer} ${selectedDevice.model} via Android Health Connect.`
      );
    } catch (err: any) {
      Alert.alert('Sync Notice', getFriendlyErrorMessage(err));
    } finally {
      setSyncing(false);
    }
  };

  const handleDeviceChange = (manufacturer: string, model: string) => {
    setSelectedDevice({ manufacturer, model });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.amber} />
          <Text style={styles.loadingText}>Connecting to Android Health Connect...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const steps = latestMetric?.stepCount || 0;
  const hr = latestMetric?.restingHeartRate;
  const spO2 = latestMetric?.avgSpO2;
  const sleepMin = latestMetric?.sleepDurationMinutes;
  const deepSleepMin = latestMetric?.deepSleepMinutes;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Navigation & Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>&larr; Back</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Connected Telemetry</Text>
          </View>
        </View>

        <Text style={styles.screenTitle}>Smartwatch &amp; Wearables</Text>
        <Text style={styles.screenSubtitle}>
          Real-time biometric telemetry synced via Google Android Health Connect
        </Text>

        {/* Health Connect Status Banner */}
        <ConnectionStatusBanner
          status={status}
          lastSyncedAt={latestMetric?.syncedAt || null}
          isSyncing={syncing}
          onSyncPress={handleSyncNow}
          pairedDeviceName={`${selectedDevice.manufacturer} ${selectedDevice.model}`}
        />

        {/* Hardware Preset / Ecosystem Selector (TASK-P8-05 & Testing) */}
        <View style={styles.presetSection}>
          <Text style={styles.presetLabel}>Select Paired Ecosystem / Device:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
            {[
              { m: 'Samsung', d: 'Galaxy Watch 6' },
              { m: 'Google', d: 'Pixel Watch 3' },
              { m: 'Garmin', d: 'Forerunner 265' },
              { m: 'Noise', d: 'ColorFit Pro 5' },
              { m: 'Fire-Boltt', d: 'Invincible Plus' }
            ].map((item) => {
              const isSelected =
                selectedDevice.manufacturer === item.m && selectedDevice.model === item.d;
              return (
                <TouchableOpacity
                  key={item.d}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  onPress={() => handleDeviceChange(item.m, item.d)}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      isSelected && styles.presetChipTextActive
                    ]}
                  >
                    {item.m} {item.d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Biometrics 2x2 Grid / Cards */}
        <Text style={styles.sectionHeading}>Today's Normalized Biometrics</Text>

        {/* Daily Steps */}
        <BiometricMetricCard
          icon="👟"
          title="Daily Steps & Mobility"
          value={steps > 0 ? steps.toLocaleString() : '—'}
          unit="steps"
          subtitle={
            steps >= 10000
              ? 'Optimal mobility target achieved'
              : `${Math.max(10000 - steps, 0).toLocaleString()} steps remaining to goal`
          }
          progressPercent={(steps / 10000) * 100}
          accentColor={steps >= 10000 ? Colors.clinical.lowRisk : Colors.primary.amber}
          badgeLabel={steps >= 7500 ? 'Active' : steps >= 4000 ? 'Moderate' : 'Sedentary'}
          badgeType={steps >= 7500 ? 'success' : steps >= 4000 ? 'info' : 'warning'}
        />

        {/* Resting Heart Rate */}
        <BiometricMetricCard
          icon="❤️"
          title="Resting Heart Rate"
          value={hr !== undefined && hr !== null ? hr : '—'}
          unit="bpm"
          subtitle="Basal cardiovascular recovery & autonomic baseline"
          progressPercent={hr ? ((hr - 40) / 80) * 100 : 50}
          accentColor="#F43F5E"
          badgeLabel={hr && hr <= 72 ? 'Optimal Resting' : 'Elevated Resting'}
          badgeType={hr && hr <= 72 ? 'success' : 'info'}
        />

        {/* Blood Oxygen Saturation */}
        <BiometricMetricCard
          icon="🫁"
          title="Blood Oxygen (SpO₂)"
          value={spO2 !== undefined && spO2 !== null ? `${spO2}%` : '—'}
          unit=""
          subtitle="Arterial hemoglobin oxygen saturation"
          progressPercent={spO2 ? ((spO2 - 90) / 10) * 100 : 80}
          accentColor={Colors.clinical.teal}
          badgeLabel={spO2 && spO2 >= 95 ? 'Normal (95-100%)' : 'Suboptimal'}
          badgeType={spO2 && spO2 >= 95 ? 'success' : 'warning'}
        />

        {/* Sleep Duration & Architecture */}
        <BiometricMetricCard
          icon="🌙"
          title="Sleep Duration & Stages"
          value={sleepMin ? `${Math.floor(sleepMin / 60)}h ${sleepMin % 60}m` : '—'}
          unit=""
          subtitle={
            deepSleepMin
              ? `Deep Sleep: ${deepSleepMin}m • Stage restorative ratio: ${(
                  (deepSleepMin / (sleepMin || 1)) *
                  100
                ).toFixed(0)}%`
              : 'Circadian restorative cycle duration'
          }
          progressPercent={sleepMin ? (sleepMin / 480) * 100 : 75}
          accentColor="#8B5CF6"
          badgeLabel={sleepMin && sleepMin >= 420 ? 'Optimal (7h+)' : 'Sleep Debt'}
          badgeType={sleepMin && sleepMin >= 420 ? 'success' : 'warning'}
        />

        {/* TASK-P8-06: Wearable Correlation Insights Card */}
        <WearableCorrelationCard insights={insights} />

        {/* 7-Day Trend Chart */}
        <WearableHistorySparkline history={history} />

        {/* Vendor Companion App Instructions */}
        <VendorGuideSection />

        {/* Quick Navigation Footnotes */}
        <View style={styles.footerNav}>
          <TouchableOpacity
            style={styles.footerNavButton}
            onPress={() => router.push('/assessment')}
          >
            <Text style={styles.footerNavButtonText}>
              Take Self-Assessment &rarr;
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerNavButton, styles.footerNavButtonSecondary]}
            onPress={() => router.push('/guidance')}
          >
            <Text style={styles.footerNavButtonTextSecondary}>
              Personalized Guidance &rarr;
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  container: {
    padding: 20,
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.slate.textMuted
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.slate.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  backButtonText: {
    color: Colors.slate.textMain,
    fontSize: 13,
    fontWeight: '700'
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  badgeText: {
    color: Colors.primary.amber,
    fontSize: 11,
    fontWeight: '700'
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.slate.textMain,
    marginBottom: 4
  },
  screenSubtitle: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    lineHeight: 18,
    marginBottom: 18
  },
  presetSection: {
    marginBottom: 16
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate.textMuted,
    marginBottom: 8
  },
  presetRow: {
    flexDirection: 'row'
  },
  presetChip: {
    backgroundColor: Colors.slate.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    marginRight: 8
  },
  presetChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.primary.amber
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate.textMuted
  },
  presetChipTextActive: {
    color: Colors.primary.amber,
    fontWeight: '800'
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate.textMain,
    marginTop: 4,
    marginBottom: 12
  },
  footerNav: {
    marginTop: 16,
    gap: 10
  },
  footerNavButton: {
    backgroundColor: Colors.primary.amber,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  footerNavButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800'
  },
  footerNavButtonSecondary: {
    backgroundColor: Colors.slate.card,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  footerNavButtonTextSecondary: {
    color: Colors.slate.textMain,
    fontSize: 14,
    fontWeight: '700'
  }
});
