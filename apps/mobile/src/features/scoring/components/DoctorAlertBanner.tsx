import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConsultationUrgency, RiskTier } from '../types/scoring.types';
import { Colors } from '../../../shared/theme/colors';

interface DoctorAlertBannerProps {
  required: boolean;
  urgency: ConsultationUrgency;
  riskTier: RiskTier;
  disclaimer?: string;
}

export const DoctorAlertBanner: React.FC<DoctorAlertBannerProps> = ({
  required,
  urgency,
  riskTier,
  disclaimer
}) => {
  const isHigh = riskTier === 'high';
  const isModerate = riskTier === 'moderate';

  const getAlertDetails = () => {
    if (isHigh) {
      return {
        title: 'Priority Clinical Evaluation Advised',
        badge: 'URGENT ACTION',
        badgeBg: 'rgba(239, 68, 68, 0.2)',
        badgeColor: Colors.clinical.highRisk,
        borderColor: 'rgba(239, 68, 68, 0.5)',
        bgColor: 'rgba(239, 68, 68, 0.08)',
        icon: '🚨',
        actionTimeline: 'Prompt Physician Consultation Recommended',
        description:
          'Your multi-factor assessment indicates pronounced clinical markers and high insufficiency risk. Please schedule a formal medical consultation.'
      };
    }

    if (isModerate) {
      return {
        title: 'Clinical Consultation Recommended',
        badge: 'ACTION RECOMMENDED',
        badgeBg: 'rgba(245, 158, 11, 0.2)',
        badgeColor: Colors.primary.amber,
        borderColor: 'rgba(245, 158, 11, 0.45)',
        bgColor: 'rgba(245, 158, 11, 0.08)',
        icon: '⚠️',
        actionTimeline: 'Physician Review Recommended Within 2 Weeks',
        description:
          'Moderate risk factors detected. Discussing your symptoms and solar/dietary habits with a primary care clinician can determine whether lab testing is appropriate.'
      };
    }

    return {
      title: 'Routine Health Monitoring',
      badge: 'STABLE PROFILE',
      badgeBg: 'rgba(16, 185, 129, 0.2)',
      badgeColor: Colors.clinical.lowRisk,
      borderColor: 'rgba(16, 185, 129, 0.35)',
      bgColor: 'rgba(16, 185, 129, 0.06)',
      icon: '🛡️',
      actionTimeline: 'Standard Preventive Wellness Checks',
      description:
        'Your profile reflects low clinical suspicion of Vitamin D insufficiency. Continue regular safe outdoor habits and nutrient-rich dietary choices.'
    };
  };

  const details = getAlertDetails();

  return (
    <View
      style={[
        styles.bannerContainer,
        {
          borderColor: details.borderColor,
          backgroundColor: details.bgColor
        }
      ]}
    >
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>{details.icon}</Text>
          <Text style={styles.title}>{details.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: details.badgeBg }]}>
          <Text style={[styles.badgeText, { color: details.badgeColor }]}>{details.badge}</Text>
        </View>
      </View>

      {/* Action Timeline Pill */}
      <View style={styles.timelineBox}>
        <Text style={styles.timelineLabel}>Recommended Timeline:</Text>
        <Text style={[styles.timelineValue, { color: details.badgeColor }]}>
          {details.actionTimeline}
        </Text>
      </View>

      {/* Clinical Guidance Text */}
      <Text style={styles.description}>{details.description}</Text>

      {/* Laboratory Serum Testing Education Box */}
      <View style={styles.labEducationBox}>
        <Text style={styles.labHeader}>🧪 Clinical Serum Testing Guidance [25(OH)D]</Text>
        <Text style={styles.labBody}>
          Only a venous blood test measuring total <Text style={styles.boldText}>25-hydroxyvitamin D [25(OH)D]</Text> can definitively confirm clinical deficiency. Reference clinical ranges:
        </Text>
        <View style={styles.rangesList}>
          <Text style={styles.rangeItem}>
            • <Text style={styles.boldText}>Deficient:</Text> &lt; 20 ng/mL (&lt; 50 nmol/L)
          </Text>
          <Text style={styles.rangeItem}>
            • <Text style={styles.boldText}>Insufficient:</Text> 20 – 29 ng/mL (50 – 74 nmol/L)
          </Text>
          <Text style={styles.rangeItem}>
            • <Text style={styles.boldText}>Sufficient:</Text> 30 – 50 ng/mL (75 – 125 nmol/L)
          </Text>
        </View>
      </View>

      {/* Mandatory Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          {disclaimer ||
            'VitaTrack is a clinical self-assessment screening tool and does not provide formal medical diagnoses or prescriptions. Always consult a qualified physician.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginVertical: 12
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  icon: {
    fontSize: 20
  },
  title: {
    color: Colors.slate.textMain,
    fontSize: 15,
    fontWeight: '800',
    flex: 1
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  timelineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    gap: 6
  },
  timelineLabel: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  timelineValue: {
    fontSize: 12,
    fontWeight: '700'
  },
  description: {
    color: Colors.slate.textMain,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12
  },
  labEducationBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    marginBottom: 10
  },
  labHeader: {
    color: Colors.primary.amber,
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6
  },
  labBody: {
    color: Colors.slate.textMuted,
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 6
  },
  boldText: {
    color: Colors.slate.textMain,
    fontWeight: '700'
  },
  rangesList: {
    gap: 2
  },
  rangeItem: {
    color: Colors.slate.textMuted,
    fontSize: 11.5
  },
  disclaimerBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8
  },
  disclaimerText: {
    color: Colors.slate.textMuted,
    fontSize: 10.5,
    lineHeight: 14,
    fontStyle: 'italic'
  }
});
