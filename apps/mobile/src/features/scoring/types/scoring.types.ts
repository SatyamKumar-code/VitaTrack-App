export type RiskTier = 'low' | 'moderate' | 'high';

export type ConsultationUrgency =
  | 'routine_monitoring'
  | 'recommended_within_2_weeks'
  | 'urgent_medical_evaluation';

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

export interface AssessmentResultData {
  assessmentId: string;
  timestamp: string;
  results: AssessmentScoringResults;
  aiExplanation: AssessmentAiExplanation;
}
