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

export interface AssessmentDocumentData {
  id: string;
  userId: string;
  completedAt: Date;
  symptoms: SymptomsData;
  sunExposure: SunExposureData;
  dietaryHabits: DietaryHabitsData;
  scoringResults: AssessmentScoringResults;
  aiExplanation?: AssessmentAiExplanation;
}

export interface CreateAssessmentInput {
  symptoms: SymptomsData;
  sunExposure: SunExposureData;
  dietaryHabits: DietaryHabitsData;
}
