export type RiskTier = 'low' | 'moderate' | 'high';
export type TrendDirection = 'improving' | 'worsening' | 'stable' | 'insufficient_data';

export interface AssessmentSubScores {
  symptomScore: number;
  solarDeficitScore: number;
  dietaryDeficitScore: number;
  medicalMultiplierScore: number;
}

export interface AssessmentHistoryItem {
  id: string;
  date: string;
  compositeScore: number;
  riskTier: RiskTier;
  doctorAlert: boolean;
  consultationUrgency: string;
  subScores: AssessmentSubScores;
  symptoms?: {
    fatigueLevel: string;
    bonePainLevel: string;
    muscleWeaknessLevel: string;
    moodChanges: string;
    frequentInfections: boolean;
  };
  sunExposure?: {
    dailyMinutesOutdoors: number;
    timeOfDay: string;
    clothingCoverage: string;
    regularSunscreenSPF30: boolean;
  };
  dietaryHabits?: {
    fattyFishServingsPerWeek: number;
    fortifiedMilkServingsPerWeek: number;
    eggYolksPerWeek: number;
    mushroomsWeekly: boolean;
    takesVitaminDSupplement: boolean;
  };
  aiExplanation?: {
    summary: string;
    keyContributors: string[];
  };
}

export interface TrendSummaryMetrics {
  totalAssessments: number;
  averageScore: number;
  latestScore: number | null;
  earliestScore: number | null;
  scoreDelta: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
  };
  trendDirection: TrendDirection;
}

export interface HistoryApiResponse {
  success: boolean;
  summary: TrendSummaryMetrics;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  data: AssessmentHistoryItem[];
}

export interface PatientDemographics {
  fullName: string;
  email?: string;
  skinType?: string;
  dietaryPreference?: string;
  dateOfBirth?: string;
  age?: number;
  medicalConditions?: string[];
}

export interface ClinicianReportPayload {
  patient: PatientDemographics;
  latestAssessment: AssessmentHistoryItem;
  assessmentHistory: AssessmentHistoryItem[];
  summaryMetrics: TrendSummaryMetrics;
  generatedAt: string;
}
