import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../../shared/theme/colors';
import {
  AssessmentDraft,
  AssessmentResponse,
  INITIAL_ASSESSMENT_DRAFT,
  SymptomsData,
  SunExposureData,
  DietaryHabitsData
} from '../types/assessment.types';
import { DraftStorage } from '../storage/draftStorage';
import { AssessmentApi } from '../services/assessmentApi';
import { AssessmentProgressBar } from '../components/AssessmentProgressBar';
import { SymptomStep } from '../components/SymptomStep';
import { SolarExposureStep } from '../components/SolarExposureStep';
import { DietaryHabitsStep } from '../components/DietaryHabitsStep';
import { SummaryReviewStep } from '../components/SummaryReviewStep';

const STEP_INFO = [
  {
    title: 'Symptom Inventory',
    subtitle: 'Evaluate classic musculoskeletal, fatigue, and immune deficiency indicators'
  },
  {
    title: 'Solar & Sunlight Habits',
    subtitle: 'Quantify daily outdoor dermal UV-B exposure window and clothing barrier'
  },
  {
    title: 'Dietary Intake & Supplements',
    subtitle: 'Measure weekly consumption of foods rich in Vitamin D3/D2 and co-factors'
  },
  {
    title: 'Summary & Clinical Scoring',
    subtitle: 'Review inputs and calculate your multi-factor Vitamin D risk profile'
  }
];

export const AssessmentWizardScreen: React.FC = () => {
  const router = useRouter();

  const [draft, setDraft] = useState<AssessmentDraft>(INITIAL_ASSESSMENT_DRAFT);
  const [existingDraftFound, setExistingDraftFound] = useState<AssessmentDraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<AssessmentResponse | null>(null);

  // Check for saved offline draft on mount (TASK-P3-06)
  useEffect(() => {
    let isMounted = true;
    DraftStorage.loadDraft().then((saved) => {
      if (isMounted && saved) {
        setExistingDraftFound(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-save draft whenever draft state updates (TASK-P3-06)
  const autoSave = useCallback((updated: AssessmentDraft) => {
    setDraft(updated);
    DraftStorage.saveDraft(updated);
  }, []);

  const handleResumeDraft = () => {
    if (existingDraftFound) {
      setDraft(existingDraftFound);
      setExistingDraftFound(null);
    }
  };

  const handleDiscardDraft = async () => {
    await DraftStorage.clearDraft();
    setExistingDraftFound(null);
    setDraft({ ...INITIAL_ASSESSMENT_DRAFT, lastSavedAt: new Date().toISOString() });
  };

  // Step transitions
  const goToNextStep = () => {
    if (draft.currentStep < 4) {
      const nextStep = draft.currentStep + 1;
      autoSave({ ...draft, currentStep: nextStep });
    }
  };

  const goToPreviousStep = () => {
    if (draft.currentStep > 1) {
      const prevStep = draft.currentStep - 1;
      autoSave({ ...draft, currentStep: prevStep });
    } else {
      router.back();
    }
  };

  const jumpToStep = (stepNumber: number) => {
    autoSave({ ...draft, currentStep: stepNumber });
  };

  // Handlers for step updates
  const handleSymptomsChange = (symptoms: SymptomsData) => {
    autoSave({ ...draft, symptoms });
  };

  const handleSunExposureChange = (sunExposure: SunExposureData) => {
    autoSave({ ...draft, sunExposure });
  };

  const handleDietaryHabitsChange = (dietaryHabits: DietaryHabitsData) => {
    autoSave({ ...draft, dietaryHabits });
  };

  // Submission handler (TASK-P3-02)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        symptoms: draft.symptoms,
        sunExposure: draft.sunExposure,
        dietaryHabits: draft.dietaryHabits
      };

      const result = await AssessmentApi.submitAssessment(payload);
      setSubmissionResult(result);

      // Successfully submitted -> Clear offline draft
      await DraftStorage.clearDraft();
    } catch (err: any) {
      setSubmissionError(err?.message || 'Failed to submit clinical assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    router.replace('/results');
  };

  const currentInfo = STEP_INFO[draft.currentStep - 1] || STEP_INFO[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Progress Bar & Header */}
      <AssessmentProgressBar
        currentStep={draft.currentStep}
        totalSteps={4}
        stepTitle={currentInfo.title}
        stepSubtitle={currentInfo.subtitle}
        onBack={goToPreviousStep}
        canGoBack={true}
        lastSavedAt={draft.lastSavedAt}
      />

      {/* Offline Resume Draft Banner (TASK-P3-06) */}
      {existingDraftFound && (
        <View style={styles.draftBanner}>
          <View style={styles.draftBannerLeft}>
            <Text style={styles.draftBannerTitle}>Unfinished Assessment Found</Text>
            <Text style={styles.draftBannerSub}>
              Resume where you left off (Step {existingDraftFound.currentStep} of 4)?
            </Text>
          </View>
          <View style={styles.draftBannerActions}>
            <TouchableOpacity
              style={styles.resumeBtn}
              onPress={handleResumeDraft}
              activeOpacity={0.7}
            >
              <Text style={styles.resumeBtnText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.discardBtn}
              onPress={handleDiscardDraft}
              activeOpacity={0.7}
            >
              <Text style={styles.discardBtnText}>Start Fresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step Render Area */}
      <View style={styles.stepContainer}>
        {draft.currentStep === 1 && (
          <SymptomStep
            data={draft.symptoms}
            onChange={handleSymptomsChange}
            onNext={goToNextStep}
          />
        )}

        {draft.currentStep === 2 && (
          <SolarExposureStep
            data={draft.sunExposure}
            onChange={handleSunExposureChange}
            onNext={goToNextStep}
          />
        )}

        {draft.currentStep === 3 && (
          <DietaryHabitsStep
            data={draft.dietaryHabits}
            onChange={handleDietaryHabitsChange}
            onNext={goToNextStep}
          />
        )}

        {draft.currentStep === 4 && (
          <SummaryReviewStep
            draft={draft}
            onEditStep={jumpToStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submissionError={submissionError}
            submissionResult={submissionResult}
            onFinish={handleFinish}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  draftBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary.amber,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  draftBannerLeft: {
    flex: 1
  },
  draftBannerTitle: {
    color: Colors.primary.amber,
    fontSize: 13,
    fontWeight: '700'
  },
  draftBannerSub: {
    color: Colors.slate.textMuted,
    fontSize: 11.5,
    marginTop: 2
  },
  draftBannerActions: {
    flexDirection: 'row',
    gap: 8
  },
  resumeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary.amber,
    borderRadius: 8
  },
  resumeBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700'
  },
  discardBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  discardBtnText: {
    color: Colors.slate.textMuted,
    fontSize: 12
  },
  stepContainer: {
    flex: 1
  }
});
