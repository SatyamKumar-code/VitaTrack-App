import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AssessmentHistoryItem } from '../types/report.types';
import { Colors } from '../../../shared/theme/colors';

interface Props {
  assessment: AssessmentHistoryItem;
  index: number;
  totalCount: number;
  onExportPdf?: (assessment: AssessmentHistoryItem) => void;
  isExporting?: boolean;
}

export const AssessmentHistoryCard: React.FC<Props> = ({
  assessment,
  index,
  totalCount,
  onExportPdf,
  isExporting = false
}) => {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(assessment.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getTierDetails = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'high':
        return {
          color: Colors.clinical.highRisk,
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.35)',
          label: 'HIGH RISK'
        };
      case 'moderate':
        return {
          color: Colors.clinical.moderateRisk,
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.35)',
          label: 'MODERATE RISK'
        };
      default:
        return {
          color: Colors.clinical.lowRisk,
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.35)',
          label: 'LOW RISK'
        };
    }
  };

  const tier = getTierDetails(assessment.riskTier);

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.recordNumberBadge}>
          <Text style={styles.recordNumberText}>#{totalCount - index}</Text>
        </View>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <View style={[styles.tierBadge, { backgroundColor: tier.bg, borderColor: tier.border }]}>
          <Text style={[styles.tierBadgeText, { color: tier.color }]}>{tier.label}</Text>
        </View>
      </View>

      {/* Main Score Row */}
      <View style={styles.mainScoreRow}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: tier.color }]}>
            {assessment.compositeScore}
          </Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </View>

        {/* Sub-score grid */}
        <View style={styles.subScoreGrid}>
          <View style={styles.subScoreItem}>
            <Text style={styles.subScoreLabel}>Symptoms</Text>
            <Text style={styles.subScoreVal}>{assessment.subScores.symptomScore}/45</Text>
          </View>
          <View style={styles.subScoreItem}>
            <Text style={styles.subScoreLabel}>Solar Deficit</Text>
            <Text style={styles.subScoreVal}>{assessment.subScores.solarDeficitScore}/25</Text>
          </View>
          <View style={styles.subScoreItem}>
            <Text style={styles.subScoreLabel}>Diet Deficit</Text>
            <Text style={styles.subScoreVal}>{assessment.subScores.dietaryDeficitScore}/20</Text>
          </View>
          <View style={styles.subScoreItem}>
            <Text style={styles.subScoreLabel}>Multiplier</Text>
            <Text style={styles.subScoreVal}>{assessment.subScores.medicalMultiplierScore}/10</Text>
          </View>
        </View>
      </View>

      {/* Doctor Alert Banner if flagged */}
      {assessment.doctorAlert && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertText}>
            Physician Consultation Required &bull;{' '}
            {assessment.consultationUrgency.replace(/_/g, ' ')}
          </Text>
        </View>
      )}

      {/* Expandable Details Accordion */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* AI Clinical Summary */}
          {assessment.aiExplanation?.summary && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>AI Clinical Rationale</Text>
              <Text style={styles.detailText}>{assessment.aiExplanation.summary}</Text>
            </View>
          )}

          {/* Key Contributing Factors */}
          {assessment.aiExplanation?.keyContributors &&
            assessment.aiExplanation.keyContributors.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Primary Risk Contributors</Text>
                {assessment.aiExplanation.keyContributors.map((c, i) => (
                  <Text key={i} style={styles.contributorItem}>
                    &bull; {c}
                  </Text>
                ))}
              </View>
            )}

          {/* Reported Symptoms Breakdown */}
          {assessment.symptoms && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Symptom Profile</Text>
              <Text style={styles.detailMetaText}>
                Fatigue: {assessment.symptoms.fatigueLevel.toUpperCase()} &bull; Bone Pain:{' '}
                {assessment.symptoms.bonePainLevel.toUpperCase()} &bull; Muscle Weakness:{' '}
                {assessment.symptoms.muscleWeaknessLevel.toUpperCase()} &bull; Mood:{' '}
                {assessment.symptoms.moodChanges.toUpperCase()} &bull; Infections:{' '}
                {assessment.symptoms.frequentInfections ? 'Frequent' : 'None'}
              </Text>
            </View>
          )}

          {/* Sun & Diet Breakdown */}
          {assessment.sunExposure && assessment.dietaryHabits && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Lifestyle Factors</Text>
              <Text style={styles.detailMetaText}>
                Sunlight: {assessment.sunExposure.dailyMinutesOutdoors} min outdoors ({assessment.sunExposure.timeOfDay},{' '}
                {assessment.sunExposure.clothingCoverage} coverage, SPF{' '}
                {assessment.sunExposure.regularSunscreenSPF30 ? '30+' : 'No'})
              </Text>
              <Text style={styles.detailMetaText}>
                Diet: {assessment.dietaryHabits.fattyFishServingsPerWeek} fish/wk,{' '}
                {assessment.dietaryHabits.fortifiedMilkServingsPerWeek} milk/wk,{' '}
                {assessment.dietaryHabits.eggYolksPerWeek} eggs/wk, Supplements:{' '}
                {assessment.dietaryHabits.takesVitaminDSupplement ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Card Actions Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? '▲ Hide Details' : '▼ View Clinical Breakdown'}
          </Text>
        </TouchableOpacity>

        {onExportPdf && (
          <TouchableOpacity
            style={styles.pdfExportButton}
            onPress={() => onExportPdf(assessment)}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.pdfExportButtonText}>📄 Clinician PDF</Text>
            )}
          </TouchableOpacity>
        )}
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
    marginBottom: 12
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  recordNumberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  recordNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate.textMuted
  },
  dateText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate.textMain
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  mainScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: '800'
  },
  scoreMax: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    fontWeight: '600',
    marginLeft: 2
  },
  subScoreGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  subScoreItem: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4
  },
  subScoreLabel: {
    fontSize: 9,
    color: Colors.slate.textMuted,
    textTransform: 'uppercase'
  },
  subScoreVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10
  },
  alertIcon: {
    fontSize: 13
  },
  alertText: {
    fontSize: 11,
    color: Colors.clinical.highRisk,
    fontWeight: '600'
  },
  expandedContent: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.slate.cardBorder
  },
  detailSection: {
    marginBottom: 10
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary.amber,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  detailText: {
    fontSize: 12,
    color: Colors.slate.textMain,
    lineHeight: 17
  },
  contributorItem: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    lineHeight: 16,
    marginLeft: 4
  },
  detailMetaText: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    lineHeight: 16
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)'
  },
  expandButton: {
    paddingVertical: 6
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.clinical.teal
  },
  pdfExportButton: {
    backgroundColor: '#0F766E',
    borderWidth: 1,
    borderColor: '#14B8A6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  pdfExportButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F0FDFA'
  }
});
