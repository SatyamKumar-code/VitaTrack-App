import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../shared/theme/colors';

interface AssessmentProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepSubtitle: string;
  onBack: () => void;
  canGoBack: boolean;
  lastSavedAt?: string;
}

export const AssessmentProgressBar: React.FC<AssessmentProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  stepSubtitle,
  onBack,
  canGoBack,
  lastSavedAt
}) => {
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  const formatSavedTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return `Draft saved ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Draft saved';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Row */}
      <View style={styles.topRow}>
        {canGoBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>&larr; Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        {lastSavedAt ? (
          <View style={styles.autoSaveIndicator}>
            <View style={styles.autoSaveDot} />
            <Text style={styles.autoSaveText}>{formatSavedTime(lastSavedAt)}</Text>
          </View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Segmented Progress Track */}
      <View style={styles.trackContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>

      {/* Step Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.stepTitle}>{stepTitle}</Text>
        <Text style={styles.stepSubtitle}>{stepSubtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate.cardBorder,
    backgroundColor: Colors.slate.bg
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.slate.cardBorder
  },
  backButtonText: {
    color: Colors.slate.textMain,
    fontSize: 13,
    fontWeight: '600'
  },
  placeholder: {
    width: 60
  },
  stepBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  stepBadgeText: {
    color: Colors.primary.amber,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  autoSaveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  autoSaveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.clinical.lowRisk
  },
  autoSaveText: {
    color: Colors.slate.textMuted,
    fontSize: 11
  },
  trackContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.slate.cardBorder,
    overflow: 'hidden',
    marginBottom: 14
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary.amber,
    borderRadius: 3
  },
  headerContainer: {
    marginTop: 2
  },
  stepTitle: {
    color: Colors.slate.textMain,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  stepSubtitle: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18
  }
});
