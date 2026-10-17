import React, { useState, useEffect } from 'react';
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
import { ReminderCard } from '../components/ReminderCard';
import { NotificationService } from '../services/notificationService';
import { RemindersApi } from '../services/remindersApi';
import { ReminderPreferences, ReminderType } from '../types/reminder.types';
import { useAuth } from '../../auth/context/AuthContext';

export default function RemindersScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<ReminderPreferences>({
    sunlightReminderEnabled: true,
    sunlightTime: '10:30',
    dietaryReminderEnabled: true,
    dietaryTime: '12:30',
    supplementReminderEnabled: true,
    supplementTime: '09:00',
    reassessmentReminderEnabled: true,
    reassessmentIntervalDays: 14
  });

  const [scheduledCount, setScheduledCount] = useState(0);

  // Initialize permissions & preferences on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Check notification permissions
        const status = await NotificationService.checkPermissions();
        setPermissionGranted(status === 'granted');

        // Fetch stored preferences (network or offline local)
        const prefs = await RemindersApi.fetchPreferences();
        setPreferences(prefs);

        // Refresh scheduled items count
        const scheduled = await NotificationService.getAllScheduled();
        setScheduledCount(scheduled.length);
      } catch (err) {
        console.warn('[RemindersScreen] Load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Request permissions
  const handleEnablePermissions = async () => {
    const granted = await NotificationService.requestPermissions();
    setPermissionGranted(granted);
    if (granted) {
      setStatusMessage('✅ Notifications authorized & Android channels configured!');
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device system settings to receive daily sunlight and clinical reminder alerts.'
      );
    }
  };

  // Save changes to API & reschedule local notification triggers
  const handleSaveAndSync = async () => {
    try {
      setSaving(true);
      setStatusMessage(null);

      // Save to backend & local storage
      const updated = await RemindersApi.updatePreferences(preferences);
      setPreferences(updated);

      // Synchronize with device OS notification schedulers
      await NotificationService.syncWithPreferences(updated);

      const scheduled = await NotificationService.getAllScheduled();
      setScheduledCount(scheduled.length);

      setStatusMessage('✅ Reminders saved & local schedules synchronized!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not synchronize reminder settings.');
    } finally {
      setSaving(false);
    }
  };

  // Immediate preview test
  const handlePreviewTest = async (type: ReminderType) => {
    try {
      setStatusMessage(`🔔 Dispatching preview for ${type}...`);
      await NotificationService.sendImmediateTestNotification(type);

      // Also request backend test payload synthesis
      await RemindersApi.requestBackendTest(type);

      setTimeout(() => {
        setStatusMessage(`✅ ${type.toUpperCase()} notification fired! Check device notification shade.`);
      }, 1500);

      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      Alert.alert('Preview Failed', err.message || 'Could not fire test alert.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary.amber} />
          <Text style={styles.loadingText}>Loading notification schedules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Navigation Row */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>&larr; Back</Text>
          </TouchableOpacity>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>Phase 7 Active</Text>
          </View>
        </View>

        {/* Title Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Smart Reminders</Text>
          <Text style={styles.tagline}>
            Context-Aware Daily Sunlight, Dietary &amp; Clinical Follow-Up Schedulers
          </Text>
        </View>

        {/* Status Toast Banner */}
        {statusMessage && (
          <View style={styles.toastBanner}>
            <Text style={styles.toastText}>{statusMessage}</Text>
          </View>
        )}

        {/* Permission Authorization Banner */}
        <View
          style={[
            styles.permissionBanner,
            permissionGranted ? styles.permissionGranted : styles.permissionPending
          ]}
        >
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionIcon}>{permissionGranted ? '🟢' : '⚠️'}</Text>
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionTitle}>
                {permissionGranted
                  ? 'System Notifications Enabled'
                  : 'Notification Permissions Needed'}
              </Text>
              <Text style={styles.permissionDescription}>
                {permissionGranted
                  ? `Android channels active • ${scheduledCount} alerts scheduled on device`
                  : 'Authorize notifications to receive timed solar windows and meal nudges.'}
              </Text>
            </View>
          </View>

          {!permissionGranted && (
            <TouchableOpacity style={styles.authButton} onPress={handleEnablePermissions}>
              <Text style={styles.authButtonText}>Enable</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SECTION 1: Daily Sunlight Exposure Alerts (TASK-P7-02) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Solar Exposure Schedulers</Text>
          <Text style={styles.sectionSubtitle}>
            Personalized based on Fitzpatrick Phototype {user?.skinType?.toUpperCase() || 'III'}
          </Text>
        </View>

        <ReminderCard
          icon="☀️"
          badgeColor="#F59E0B"
          title="Daily Sunlight Exposure Window"
          subtitle="Proactive daily reminder nudging you to step outside during safe UV hours for natural Vitamin D3 synthesis."
          enabled={preferences.sunlightReminderEnabled}
          onToggle={(val) =>
            setPreferences((prev) => ({ ...prev, sunlightReminderEnabled: val }))
          }
          time={preferences.sunlightTime}
          onTimeChange={(val) =>
            setPreferences((prev) => ({ ...prev, sunlightTime: val }))
          }
          presetTimes={['08:30', '09:45', '10:30', '11:15', '16:00']}
          onTestPress={() => handlePreviewTest('sunlight')}
        />

        {/* SECTION 2: Dietary & Supplement Alerts (TASK-P7-03) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nutrient &amp; Supplement Alerts</Text>
          <Text style={styles.sectionSubtitle}>
            Calibrated to your {user?.dietaryPreference || 'Omnivore'} nutrition profile
          </Text>
        </View>

        <ReminderCard
          icon="🥗"
          badgeColor="#10B981"
          title="Nutrient-Rich Meal Reminder"
          subtitle="Alerts you at mealtime to include dietary Vitamin D sources (fatty fish, egg yolks, fortified milk) with healthy fats."
          enabled={preferences.dietaryReminderEnabled}
          onToggle={(val) =>
            setPreferences((prev) => ({ ...prev, dietaryReminderEnabled: val }))
          }
          time={preferences.dietaryTime}
          onTimeChange={(val) =>
            setPreferences((prev) => ({ ...prev, dietaryTime: val }))
          }
          presetTimes={['12:00', '12:30', '13:15', '19:00', '19:45']}
          onTestPress={() => handlePreviewTest('dietary')}
        />

        <ReminderCard
          icon="💊"
          badgeColor="#8B5CF6"
          title="Physician-Prescribed Supplement"
          subtitle="Daily reminder for taking doctor-recommended Vitamin D3 capsules alongside Magnesium &amp; K2 co-factors."
          enabled={preferences.supplementReminderEnabled}
          onToggle={(val) =>
            setPreferences((prev) => ({ ...prev, supplementReminderEnabled: val }))
          }
          time={preferences.supplementTime}
          onTimeChange={(val) =>
            setPreferences((prev) => ({ ...prev, supplementTime: val }))
          }
          presetTimes={['08:00', '09:00', '10:00', '13:00', '20:30']}
          onTestPress={() => handlePreviewTest('supplement')}
        />

        {/* SECTION 3: Periodic Re-Assessment Scheduler (TASK-P7-04) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clinical Re-Assessment Schedule</Text>
          <Text style={styles.sectionSubtitle}>
            Longitudinal recovery monitoring &amp; symptom progression tracking
          </Text>
        </View>

        <ReminderCard
          icon="📋"
          badgeColor="#3B82F6"
          title="Periodic Clinical Re-Assessment"
          subtitle="Automatically schedules recurring reminders nudging you to re-evaluate fatigue, bone aches, and mood changes."
          enabled={preferences.reassessmentReminderEnabled}
          onToggle={(val) =>
            setPreferences((prev) => ({ ...prev, reassessmentReminderEnabled: val }))
          }
          intervalDays={preferences.reassessmentIntervalDays}
          onIntervalChange={(days) =>
            setPreferences((prev) => ({ ...prev, reassessmentIntervalDays: days }))
          }
          presetIntervals={[7, 14, 30]}
          onTestPress={() => handlePreviewTest('reassessment')}
        />

        {/* SECTION 4: Save & Sync CTA Button */}
        <View style={styles.syncCard}>
          <TouchableOpacity
            style={styles.primarySyncButton}
            onPress={handleSaveAndSync}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primarySyncButtonText}>💾 Save &amp; Sync Schedulers</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineTestButton}
            onPress={() => handlePreviewTest('test')}
          >
            <Text style={styles.outlineTestButtonText}>🔔 Fire Global Test Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Quick Links */}
        <View style={styles.quickLinksContainer}>
          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => router.push('/guidance')}
          >
            <Text style={styles.quickLinkIcon}>🥗</Text>
            <Text style={styles.quickLinkText}>View Nutrition &amp; Solar Guidance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.quickLinkIcon}>📈</Text>
            <Text style={styles.quickLinkText}>View History &amp; Clinician Reports</Text>
          </TouchableOpacity>
        </View>

        {/* Clinical Framing Disclaimer Banner */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚕️ Informational &amp; Wellness Aid</Text>
          <Text style={styles.disclaimerText}>
            VitaTrack reminder notifications are behavioral prompts designed to support safe lifestyle habits.
            They do not replace personalized direct medical advice from your physician or lab testing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  loadingText: {
    color: Colors.slate.textMuted,
    marginTop: 12,
    fontSize: 14
  },
  container: {
    padding: 20,
    paddingBottom: 48
  },
  navRow: {
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
    fontSize: 14,
    fontWeight: '600'
  },
  phaseBadge: {
    backgroundColor: Colors.primary.glow,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.amber
  },
  phaseBadgeText: {
    color: Colors.primary.amber,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.slate.textMain,
    letterSpacing: -0.5,
    marginBottom: 6
  },
  tagline: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    lineHeight: 18
  },
  toastBanner: {
    backgroundColor: Colors.primary.glow,
    borderWidth: 1,
    borderColor: Colors.primary.amber,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  toastText: {
    color: Colors.primary.amber,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 22
  },
  permissionGranted: {
    backgroundColor: '#064E3B30',
    borderColor: '#05966960'
  },
  permissionPending: {
    backgroundColor: '#78350F30',
    borderColor: '#D9770660'
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12
  },
  permissionIcon: {
    fontSize: 20,
    marginRight: 10
  },
  permissionTextContainer: {
    flex: 1
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  permissionDescription: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    marginTop: 2
  },
  authButton: {
    backgroundColor: Colors.primary.amber,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  authButtonText: {
    color: '#0B0F19',
    fontSize: 12,
    fontWeight: '700'
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 6
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginTop: 2
  },
  syncCard: {
    marginTop: 8,
    marginBottom: 20,
    gap: 10
  },
  primarySyncButton: {
    backgroundColor: Colors.primary.amber,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  primarySyncButtonText: {
    color: '#0B0F19',
    fontSize: 15,
    fontWeight: '700'
  },
  outlineTestButton: {
    backgroundColor: Colors.slate.card,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  outlineTestButtonText: {
    color: Colors.slate.textMain,
    fontSize: 13,
    fontWeight: '600'
  },
  quickLinksContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  quickLinkItem: {
    flex: 1,
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickLinkIcon: {
    fontSize: 20,
    marginBottom: 6
  },
  quickLinkText: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    textAlign: 'center',
    fontWeight: '600'
  },
  disclaimerCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 14
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.amber,
    marginBottom: 4
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    lineHeight: 16
  }
});
