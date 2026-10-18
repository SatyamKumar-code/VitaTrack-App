import {
  AssessmentDraft,
  SymptomsData,
  SunExposureData,
  DietaryHabitsData
} from '../../assessment/types/assessment.types';
import {
  AssessmentScoringResults,
  AssessmentSubScores,
  RiskTier,
  ConsultationUrgency
} from '../types/scoring.types';

export interface DemographicContext {
  age?: number;
  skinType?: string;
  dietaryPreference?: string;
  medicalConditions?: string[];
}

export const SCORING_WEIGHTS = {
  SYMPTOMS: {
    MAX_POINTS: 45,
    FATIGUE: { none: 0, mild: 3, moderate: 7, severe: 12 },
    BONE_PAIN: { none: 0, mild: 3, moderate: 6, severe: 10 },
    MUSCLE_WEAKNESS: { none: 0, mild: 2, moderate: 5, severe: 8 },
    MOOD_CHANGES: { none: 0, mild: 2, moderate: 4, severe: 7 },
    FREQUENT_INFECTIONS: { yes: 8, no: 0 }
  },
  SOLAR: {
    MAX_POINTS: 25,
    EXPOSURE_MINUTES: {
      MINIMAL: { threshold: 10, points: 15 },
      MODERATE: { threshold: 25, points: 7 },
      OPTIMAL: { points: 0 }
    },
    SUNSCREEN_SPF30: 5,
    CLOTHING_COVERAGE: { high: 5, moderate: 2, low: 0 }
  },
  DIET: {
    MAX_POINTS: 20,
    FATTY_FISH: { threshold: 1, points: 7 },
    FORTIFIED_MILK: { threshold: 3, points: 5 },
    EGG_YOLKS: { threshold: 2, points: 3 },
    VEGAN_OR_VEGETARIAN_UNSUPPLEMENTED: 5,
    SUPPLEMENT_OFFSET: 15
  },
  MEDICAL: {
    MAX_POINTS: 10,
    ELDERLY_AGE_THRESHOLD: 60,
    ELDERLY_POINTS: 4,
    FITZPATRICK_HIGH_MELANIN_SKIN_TYPES: ['type_5', 'type_6'],
    HIGH_MELANIN_POINTS: 3,
    CHRONIC_CONDITION_POINTS: 3
  },
  TIERS: {
    LOW: {
      min: 0,
      max: 39,
      tier: 'low' as RiskTier,
      doctorConsultationRequired: false,
      consultationUrgency: 'routine_monitoring' as ConsultationUrgency
    },
    MODERATE: {
      min: 40,
      max: 69,
      tier: 'moderate' as RiskTier,
      doctorConsultationRequired: true,
      consultationUrgency: 'recommended_routine' as ConsultationUrgency
    },
    HIGH: {
      min: 70,
      max: 100,
      tier: 'high' as RiskTier,
      doctorConsultationRequired: true,
      consultationUrgency: 'urgent' as ConsultationUrgency
    }
  },
  DISCLAIMER:
    'VitaTrack is an informational self-assessment screening aid. It does not provide medical diagnoses or replace laboratory blood serum testing.'
};

export class ClientScoringEngine {
  public static calculateSymptomScore(symptoms: SymptomsData): number {
    let score = 0;
    score += SCORING_WEIGHTS.SYMPTOMS.FATIGUE[symptoms.fatigueLevel] ?? 0;
    score += SCORING_WEIGHTS.SYMPTOMS.BONE_PAIN[symptoms.bonePainLevel] ?? 0;
    score += SCORING_WEIGHTS.SYMPTOMS.MUSCLE_WEAKNESS[symptoms.muscleWeaknessLevel] ?? 0;
    score += SCORING_WEIGHTS.SYMPTOMS.MOOD_CHANGES[symptoms.moodChanges] ?? 0;
    if (symptoms.frequentInfections) {
      score += SCORING_WEIGHTS.SYMPTOMS.FREQUENT_INFECTIONS.yes;
    }
    return Math.min(SCORING_WEIGHTS.SYMPTOMS.MAX_POINTS, Math.max(0, Math.round(score)));
  }

  public static calculateSolarDeficitScore(sunExposure: SunExposureData): number {
    let score = 0;
    if (sunExposure.dailyMinutesOutdoors < SCORING_WEIGHTS.SOLAR.EXPOSURE_MINUTES.MINIMAL.threshold) {
      score += SCORING_WEIGHTS.SOLAR.EXPOSURE_MINUTES.MINIMAL.points;
    } else if (sunExposure.dailyMinutesOutdoors <= SCORING_WEIGHTS.SOLAR.EXPOSURE_MINUTES.MODERATE.threshold) {
      score += SCORING_WEIGHTS.SOLAR.EXPOSURE_MINUTES.MODERATE.points;
    }
    score += SCORING_WEIGHTS.SOLAR.CLOTHING_COVERAGE[sunExposure.clothingCoverage] ?? 0;
    if (sunExposure.regularSunscreenSPF30) {
      score += SCORING_WEIGHTS.SOLAR.SUNSCREEN_SPF30;
    }
    return Math.min(SCORING_WEIGHTS.SOLAR.MAX_POINTS, Math.max(0, Math.round(score)));
  }

  public static calculateDietaryDeficitScore(
    dietaryHabits: DietaryHabitsData,
    demographics?: DemographicContext
  ): number {
    let score = 0;
    if (dietaryHabits.fattyFishServingsPerWeek < SCORING_WEIGHTS.DIET.FATTY_FISH.threshold) {
      score += SCORING_WEIGHTS.DIET.FATTY_FISH.points;
    }
    if (dietaryHabits.fortifiedMilkServingsPerWeek < SCORING_WEIGHTS.DIET.FORTIFIED_MILK.threshold) {
      score += SCORING_WEIGHTS.DIET.FORTIFIED_MILK.points;
    }
    if (dietaryHabits.eggYolksPerWeek < SCORING_WEIGHTS.DIET.EGG_YOLKS.threshold) {
      score += SCORING_WEIGHTS.DIET.EGG_YOLKS.points;
    }
    const isPlantBased =
      demographics?.dietaryPreference === 'vegan' || demographics?.dietaryPreference === 'vegetarian';
    if (isPlantBased && !dietaryHabits.takesVitaminDSupplement) {
      score += SCORING_WEIGHTS.DIET.VEGAN_OR_VEGETARIAN_UNSUPPLEMENTED;
    }
    if (dietaryHabits.takesVitaminDSupplement) {
      score = Math.max(0, score - SCORING_WEIGHTS.DIET.SUPPLEMENT_OFFSET);
    }
    return Math.min(SCORING_WEIGHTS.DIET.MAX_POINTS, Math.max(0, Math.round(score)));
  }

  public static calculateMedicalMultiplierScore(demographics?: DemographicContext): number {
    if (!demographics) return 0;
    let score = 0;
    if (demographics.age !== undefined && demographics.age >= SCORING_WEIGHTS.MEDICAL.ELDERLY_AGE_THRESHOLD) {
      score += SCORING_WEIGHTS.MEDICAL.ELDERLY_POINTS;
    }
    if (
      demographics.skinType &&
      SCORING_WEIGHTS.MEDICAL.FITZPATRICK_HIGH_MELANIN_SKIN_TYPES.includes(demographics.skinType)
    ) {
      score += SCORING_WEIGHTS.MEDICAL.HIGH_MELANIN_POINTS;
    }
    if (demographics.medicalConditions && demographics.medicalConditions.length > 0) {
      score += SCORING_WEIGHTS.MEDICAL.CHRONIC_CONDITION_POINTS;
    }
    return Math.min(SCORING_WEIGHTS.MEDICAL.MAX_POINTS, Math.max(0, Math.round(score)));
  }

  public static computeScore(
    draft: Pick<AssessmentDraft, 'symptoms' | 'sunExposure' | 'dietaryHabits'>,
    demographics?: DemographicContext
  ): {
    results: AssessmentScoringResults;
    primaryContributors: string[];
    aiExplanation: string;
  } {
    const symptomScore = this.calculateSymptomScore(draft.symptoms);
    const solarDeficitScore = this.calculateSolarDeficitScore(draft.sunExposure);
    const dietaryDeficitScore = this.calculateDietaryDeficitScore(draft.dietaryHabits, demographics);
    const medicalMultiplierScore = this.calculateMedicalMultiplierScore(demographics);

    const rawSum = symptomScore + solarDeficitScore + dietaryDeficitScore + medicalMultiplierScore;
    const compositeScore = Math.min(100, Math.max(0, Math.round(rawSum)));

    let riskTier: RiskTier = 'low';
    let doctorConsultationRequired = false;
    let consultationUrgency: ConsultationUrgency = 'routine_monitoring';

    if (compositeScore >= SCORING_WEIGHTS.TIERS.HIGH.min) {
      riskTier = SCORING_WEIGHTS.TIERS.HIGH.tier;
      doctorConsultationRequired = SCORING_WEIGHTS.TIERS.HIGH.doctorConsultationRequired;
      consultationUrgency = SCORING_WEIGHTS.TIERS.HIGH.consultationUrgency;
    } else if (compositeScore >= SCORING_WEIGHTS.TIERS.MODERATE.min) {
      riskTier = SCORING_WEIGHTS.TIERS.MODERATE.tier;
      doctorConsultationRequired = SCORING_WEIGHTS.TIERS.MODERATE.doctorConsultationRequired;
      consultationUrgency = SCORING_WEIGHTS.TIERS.MODERATE.consultationUrgency;
    } else {
      riskTier = SCORING_WEIGHTS.TIERS.LOW.tier;
      doctorConsultationRequired = SCORING_WEIGHTS.TIERS.LOW.doctorConsultationRequired;
      consultationUrgency = SCORING_WEIGHTS.TIERS.LOW.consultationUrgency;
    }

    const subScores: AssessmentSubScores = {
      symptomScore,
      solarDeficitScore,
      dietaryDeficitScore,
      medicalMultiplierScore
    };

    const primaryContributors: string[] = [];
    if (draft.symptoms.fatigueLevel === 'severe' || draft.symptoms.fatigueLevel === 'moderate') {
      primaryContributors.push(
        `Reported ${draft.symptoms.fatigueLevel} fatigue correlates with suboptimal Vitamin D levels.`
      );
    }
    if (draft.symptoms.bonePainLevel === 'severe' || draft.symptoms.bonePainLevel === 'moderate') {
      primaryContributors.push(
        `Reported ${draft.symptoms.bonePainLevel} bone/joint pain reflects possible musculoskeletal mineralization deficit.`
      );
    }
    if (draft.symptoms.frequentInfections) {
      primaryContributors.push('Frequent respiratory infections may indicate suppressed innate immune resilience.');
    }
    if (solarDeficitScore >= 12) {
      primaryContributors.push(
        `Limited outdoor sunlight (${draft.sunExposure.dailyMinutesOutdoors} min/day) curtails cutaneous D3 synthesis.`
      );
    }
    if (dietaryDeficitScore >= 10 && !draft.dietaryHabits.takesVitaminDSupplement) {
      primaryContributors.push(
        'Low nutritional intake of fatty fish and fortified foods without daily Vitamin D supplementation.'
      );
    }

    if (primaryContributors.length === 0) {
      primaryContributors.push('Balanced sunlight exposure, regular nutrition, and low reported symptoms.');
    }

    const results: AssessmentScoringResults = {
      compositeScore,
      riskTier,
      subScores,
      doctorConsultationRequired,
      consultationUrgency,
      disclaimer: SCORING_WEIGHTS.DISCLAIMER
    };

    const aiExplanation = `Your Vitamin D evaluation indicates a composite risk score of ${compositeScore}/100 (${riskTier.toUpperCase()} RISK). Key contributors include ${primaryContributors.slice(0, 2).join(' ')} ${doctorConsultationRequired ? 'Consulting a healthcare provider for a 25(OH)D blood test is recommended.' : 'Maintain your current outdoor daylight habits and balanced nutrition.'}`;

    return { results, primaryContributors, aiExplanation };
  }
}
