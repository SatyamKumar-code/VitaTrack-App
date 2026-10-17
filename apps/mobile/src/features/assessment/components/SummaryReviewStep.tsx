import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import {
  AssessmentDraft,
  AssessmentResponse
} from '../types/assessment.types';

interface SummaryReviewStepProps {
  draft: AssessmentDraft;
  onEditStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submissionError: string | null;
  submissionResult: AssessmentResponse | null;
  onFinish: () => void;
}

export const SummaryReviewStep: React.FC<SummaryReviewStepProps> = ({
  draft,
  onEditStep,
  onSubmit,
  isSubmitting,
  submissionError,
  submissionResult,
  onFinish
}) => {
  const { symptoms, sunExposure, dietaryHabits } = draft;

  const capitalize = (s: string) => {
    return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Overview Intro */}
      <View style={styles.introBox}>
        <Text style={styles.introTitle}>Ready to Calculate Your Profile</Text>
        <Text style={styles.introBody}>
          Review your answers below. You can quickly edit any section before submitting for
          multi-factor clinical risk scoring.
        </Text>
      </View>

      {/* Section 1: Symptoms Summary Card */}
      <View style={styles.reviewCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>1. Symptom Inventory</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEditStep(1)}
            activeOpacity={0.7}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Fatigue Severity:</Text>
          <Text style={styles.itemValue}>{capitalize(symptoms.fatigueLevel)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Bone / Back Pain:</Text>
          <Text style={styles.itemValue}>{capitalize(symptoms.bonePainLevel)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Muscle Weakness:</Text>
          <Text style={styles.itemValue}>{capitalize(symptoms.muscleWeaknessLevel)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Mood Changes:</Text>
          <Text style={styles.itemValue}>{capitalize(symptoms.moodChanges)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Frequent Infections:</Text>
          <Text style={[styles.itemValue, symptoms.frequentInfections && styles.alertText]}>
            {symptoms.frequentInfections ? 'Yes (3+ recently)' : 'None / Rare'}
          </Text>
        </View>
      </View>

      {/* Section 2: Sunlight Summary Card */}
      <View style={styles.reviewCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>2. Sunlight & Solar Exposure</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEditStep(2)}
            activeOpacity={0.7}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Daily Outdoor Sun:</Text>
          <Text style={styles.itemValue}>{sunExposure.dailyMinutesOutdoors} Minutes / Day</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Exposure Window:</Text>
          <Text style={styles.itemValue}>{capitalize(sunExposure.timeOfDay)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Clothing Coverage:</Text>
          <Text style={styles.itemValue}>{capitalize(sunExposure.clothingCoverage)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Routine Sunscreen SPF 30+:</Text>
          <Text style={styles.itemValue}>
            {sunExposure.regularSunscreenSPF30 ? 'Yes (Applied Regularly)' : 'No / Rarely'}
          </Text>
        </View>
      </View>

      {/* Section 3: Dietary Patterns Card */}
      <View style={styles.reviewCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>3. Dietary Patterns & Habits</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEditStep(3)}
            activeOpacity={0.7}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Fatty Fish:</Text>
          <Text style={styles.itemValue}>{dietaryHabits.fattyFishServingsPerWeek} servings / wk</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Fortified Milk / Dairy:</Text>
          <Text style={styles.itemValue}>{dietaryHabits.fortifiedMilkServingsPerWeek} glasses / wk</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Egg Yolks:</Text>
          <Text style={styles.itemValue}>{dietaryHabits.eggYolksPerWeek} yolks / wk</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>UV-Exposed Mushrooms:</Text>
          <Text style={styles.itemValue}>{dietaryHabits.mushroomsWeekly ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Takes Vitamin D Supplement:</Text>
          <Text style={[styles.itemValue, dietaryHabits.takesVitaminDSupplement && styles.tealText]}>
            {dietaryHabits.takesVitaminDSupplement ? 'Yes (Supplementing)' : 'No Supplement'}
          </Text>
        </View>
      </View>

      {/* Medical Disclaimer Banner */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Clinical Screening Notice</Text>
        <Text style={styles.disclaimerBody}>
          VitaTrack calculates deterministic multi-factor risk scores according to established
          endocrinology literature. This self-assessment is an informational screening aid and
          does not substitute for clinical serum 25(OH)D lab testing.
        </Text>
      </View>

      {/* Error Notice */}
      {submissionError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{submissionError}</Text>
        </View>
      )}

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={onSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Clinical Assessment &rarr;</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Confirmation Modal */}
      {submissionResult && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconRing}>
                <Text style={styles.modalIconText}>☀️</Text>
              </View>

              <Text style={styles.modalTitle}>Assessment Recorded!</Text>
              <Text style={styles.modalSubtitle}>
                Your multi-factor assessment has been securely persisted to the clinical registry.
              </Text>

              {/* Score Preview Pill */}
              <View style={styles.scorePill}>
                <Text style={styles.scorePillLabel}>Risk Tier:</Text>
                <Text
                  style={[
                    styles.scorePillValue,
                    submissionResult.results.riskTier === 'high'
                      ? styles.scorePillRed
                      : submissionResult.results.riskTier === 'moderate'
                      ? styles.scorePillAmber
                      : styles.scorePillGreen
                  ]}
                >
                  {capitalize(submissionResult.results.riskTier)} (Score:{' '}
                  {submissionResult.results.compositeScore}/100)
                </Text>
              </View>

              {/* Primary Contributors */}
              {submissionResult.aiExplanation?.keyContributors && (
                <View style={styles.contributorsContainer}>
                  <Text style={styles.contributorsHeader}>Primary Contributing Factors:</Text>
                  {submissionResult.aiExplanation.keyContributors.map((c, i) => (
                    <Text key={i} style={styles.contributorItem}>
                      &bull; {c}
                    </Text>
                  ))}
                </View>
              )}

              {submissionResult.results.doctorConsultationRequired && (
                <View style={styles.doctorAlertBox}>
                  <Text style={styles.doctorAlertTitle}>Doctor Consultation Advised</Text>
                  <Text style={styles.doctorAlertBody}>
                    Your profile suggests potential deficiency strain. Consider discussing serum
                    25(OH)D testing with a physician.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={onFinish}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>Return to Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40
  },
  introBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: 16,
    marginBottom: 16
  },
  introTitle: {
    color: Colors.primary.amber,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  introBody: {
    color: Colors.slate.textMuted,
    fontSize: 12.5,
    lineHeight: 18
  },
  reviewCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate.cardBorder,
    paddingBottom: 10,
    marginBottom: 10
  },
  cardHeaderTitle: {
    color: Colors.slate.textMain,
    fontSize: 15,
    fontWeight: '700'
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  editBtnText: {
    color: Colors.primary.amber,
    fontSize: 12,
    fontWeight: '700'
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5
  },
  itemLabel: {
    color: Colors.slate.textMuted,
    fontSize: 13
  },
  itemValue: {
    color: Colors.slate.textMain,
    fontSize: 13,
    fontWeight: '600'
  },
  alertText: {
    color: Colors.primary.amber,
    fontWeight: '700'
  },
  tealText: {
    color: Colors.clinical.teal,
    fontWeight: '700'
  },
  disclaimerBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 14,
    marginBottom: 16
  },
  disclaimerTitle: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  disclaimerBody: {
    color: Colors.slate.textMuted,
    fontSize: 11.5,
    lineHeight: 16
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.clinical.highRisk,
    padding: 12,
    marginBottom: 16
  },
  errorBannerText: {
    color: Colors.clinical.highRisk,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  submitContainer: {
    marginTop: 4
  },
  submitBtn: {
    backgroundColor: Colors.primary.amber,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContent: {
    backgroundColor: Colors.slate.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 24,
    width: '100%',
    alignItems: 'center'
  },
  modalIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: Colors.primary.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  modalIconText: {
    fontSize: 30
  },
  modalTitle: {
    color: Colors.slate.textMain,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center'
  },
  modalSubtitle: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    marginBottom: 16,
    gap: 8
  },
  scorePillLabel: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  scorePillValue: {
    fontSize: 14,
    fontWeight: '700'
  },
  scorePillGreen: {
    color: Colors.clinical.lowRisk
  },
  scorePillAmber: {
    color: Colors.primary.amber
  },
  scorePillRed: {
    color: Colors.clinical.highRisk
  },
  contributorsContainer: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14
  },
  contributorsHeader: {
    color: Colors.slate.textMain,
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6
  },
  contributorItem: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4
  },
  doctorAlertBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary.amber,
    padding: 12,
    marginBottom: 16,
    width: '100%'
  },
  doctorAlertTitle: {
    color: Colors.primary.amber,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  doctorAlertBody: {
    color: Colors.slate.textMain,
    fontSize: 12,
    lineHeight: 16
  },
  modalConfirmBtn: {
    backgroundColor: Colors.primary.amber,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
  },
  modalConfirmBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700'
  }
});
