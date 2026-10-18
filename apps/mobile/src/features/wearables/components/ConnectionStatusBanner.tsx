import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import { DeviceHealthConnectStatus } from '../types/wearable.types';

interface ConnectionStatusBannerProps {
  status: DeviceHealthConnectStatus | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  onSyncPress: () => void;
  pairedDeviceName?: string;
}

export const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
  status,
  lastSyncedAt,
  isSyncing,
  onSyncPress,
  pairedDeviceName = 'Samsung Galaxy Watch 6'
}) => {
  const formatLastSync = (isoString: string | null) => {
    if (!isoString) return 'Not yet synced';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isPlayStoreNeeded = status?.tier === 'tier2_install_needed';
  const isUnsupported = status?.tier === 'tier3_unsupported';

  return (
    <View style={styles.container}>
      {/* Top Status Row */}
      <View style={styles.topRow}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isSyncing
                  ? Colors.clinical.moderateRisk
                  : isUnsupported
                  ? '#64748B'
                  : isPlayStoreNeeded
                  ? Colors.clinical.highRisk
                  : Colors.clinical.lowRisk
              }
            ]}
          />
          <Text style={styles.statusLabel}>
            {isSyncing
              ? 'Syncing Biometrics...'
              : isUnsupported
              ? 'Manual Mode (No Health Connect)'
              : isPlayStoreNeeded
              ? 'Health Connect Required'
              : 'Health Connect Connected'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
          onPress={onSyncPress}
          disabled={isSyncing}
        >
          <Text style={styles.syncButtonText}>
            {isSyncing ? '⏳ Syncing' : '🔄 Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Device & Timestamp Info */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          📱 Device: <Text style={styles.metaValue}>{pairedDeviceName}</Text>
        </Text>
        <Text style={styles.metaText}>
          ⏱️ Last Synced: <Text style={styles.metaValue}>{formatLastSync(lastSyncedAt)}</Text>
        </Text>
      </View>

      {/* Explanatory Message / Alert Banner for Fallbacks */}
      {status && (
        <View
          style={[
            styles.alertBox,
            isUnsupported
              ? styles.alertBoxNeutral
              : isPlayStoreNeeded
              ? styles.alertBoxWarning
              : styles.alertBoxSuccess
          ]}
        >
          <Text style={styles.alertMessage}>{status.userMessage}</Text>
          {isPlayStoreNeeded && status.actionUrl && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Linking.openURL(status.actionUrl!)}
            >
              <Text style={styles.actionButtonText}>
                📥 Install Google Health Connect from Play Store &rarr;
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
    marginBottom: 16
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  syncButton: {
    backgroundColor: Colors.primary.amber,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  syncButtonDisabled: {
    opacity: 0.6
  },
  syncButtonText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10
  },
  metaText: {
    fontSize: 12,
    color: Colors.slate.textMuted
  },
  metaValue: {
    color: Colors.slate.textMain,
    fontWeight: '600'
  },
  alertBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1
  },
  alertBoxSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)'
  },
  alertBoxWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)'
  },
  alertBoxNeutral: {
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderColor: 'rgba(148, 163, 184, 0.2)'
  },
  alertMessage: {
    fontSize: 12,
    color: Colors.slate.textMain,
    lineHeight: 18
  },
  actionButton: {
    marginTop: 8,
    backgroundColor: Colors.clinical.teal,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
