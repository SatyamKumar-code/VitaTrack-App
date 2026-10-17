export type SymptomSeverity = 'none' | 'mild' | 'moderate' | 'severe';
export type TimeOfDay = 'early_morning' | 'midday' | 'late_afternoon' | 'mixed';
export type ClothingCoverage = 'low' | 'moderate' | 'high';
export type RiskTier = 'low' | 'moderate' | 'high';
export type ConsultationUrgency =
  | 'routine_monitoring'
  | 'recommended_within_2_weeks'
  | 'urgent_medical_evaluation';

export interface SymptomsData {
  fatigueLevel: SymptomSeverity;
  bonePainLevel: SymptomSeverity;
  muscleWeaknessLevel: SymptomSeverity;
  moodChanges: SymptomSeverity;
  frequentInfections: boolean;
}

export interface SunExposureData {
  dailyMinutesOutdoors: number;
  timeOfDay: TimeOfDay;
  clothingCoverage: ClothingCoverage;
  regularSunscreenSPF30: boolean;
}

export interface DietaryHabitsData {
  fattyFishServingsPerWeek: number;
  fortifiedMilkServingsPerWeek: number;
  eggYolksPerWeek: number;
  mushroomsWeekly: boolean;
  takesVitaminDSupplement: boolean;
}

export interface AssessmentSubScores {
  symptomScore: number;
  solarDeficitScore: number;
  dietaryDeficitScore: number;
  medicalMultiplierScore: number;
}

export interface AssessmentScoringResults {
  compositeScore: number;
  riskTier: RiskTier;
  subScores: AssessmentSubScores;
  doctorConsultationRequired: boolean;
  consultationUrgency: ConsultationUrgency;
  disclaimer: string;
}

export interface AssessmentAiExplanation {
  summary: string;
  keyContributors: string[];
}

export interface AssessmentPayload {
  symptoms: SymptomsData;
  sunExposure: SunExposureData;
  dietaryHabits: DietaryHabitsData;
}

export interface AssessmentResponse {
  assessmentId: string;
  timestamp: string;
  results: AssessmentScoringResults;
  aiExplanation: AssessmentAiExplanation;
}

export interface AssessmentDraft {
  currentStep: number;
  symptoms: SymptomsData;
  sunExposure: SunExposureData;
  dietaryHabits: DietaryHabitsData;
  lastSavedAt: string;
}

export const INITIAL_ASSESSMENT_DRAFT: AssessmentDraft = {
  currentStep: 1,
  symptoms: {
    fatigueLevel: 'none',
    bonePainLevel: 'none',
    muscleWeaknessLevel: 'none',
    moodChanges: 'none',
    frequentInfections: false
  },
  sunExposure: {
    dailyMinutesOutdoors: 20,
    timeOfDay: 'midday',
    clothingCoverage: 'moderate',
    regularSunscreenSPF30: false
  },
  dietaryHabits: {
    fattyFishServingsPerWeek: 1,
    fortifiedMilkServingsPerWeek: 3,
    eggYolksPerWeek: 2,
    mushroomsWeekly: false,
    takesVitaminDSupplement: false
  },
  lastSavedAt: new Date().toISOString()
};
