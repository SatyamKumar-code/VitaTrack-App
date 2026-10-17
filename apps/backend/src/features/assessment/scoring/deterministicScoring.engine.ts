import { AssessmentSubmissionInput } from '../validators/assessment.validation';
import {
  AssessmentScoringResults,
  AssessmentSubScores,
  ConsultationUrgency,
  RiskTier
} from '../types/assessment.types';
import { SCORING_WEIGHTS } from './scoringRules.config';

export interface DemographicContext {
  age?: number;
  skinType?: string;
  dietaryPreference?: string;
  medicalConditions?: string[];
}

export class DeterministicScoringEngine {
  /**
   * Evaluates Symptom Severity Sub-Score (0 - 45 points)
   */
  public static calculateSymptomScore(symptoms: AssessmentSubmissionInput['symptoms']): number {
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

  /**
   * Evaluates Solar Insufficiency Sub-Score (0 - 25 points)
   */
  public static calculateSolarDeficitScore(
    sunExposure: AssessmentSubmissionInput['sunExposure']
  ): number {
    let score = 0;

    // Outdoor duration
    if (sunExposure.dailyMinutesOutdoors < SCORING_WEIGHTS.SOLAR.EXPOSURE_MINUTES.MINIMAL.threshold) {
      score += SCORING_WEIGHTS.SOLAR.EXPOSURE_MINUTES.MINIMAL.points;
    } else if (
      sunExposure.dailyMinutesOutdoors <= SCORING_WEIGHTS.SOLAR.EXPOSURE_MINUTES.MODERATE.threshold
    ) {
      score += SCORING_WEIGHTS.SOLAR.EXPOSURE_MINUTES.MODERATE.points;
    }

    // Fabric clothing coverage
    score += SCORING_WEIGHTS.SOLAR.CLOTHING_COVERAGE[sunExposure.clothingCoverage] ?? 0;

    // Uniform sunscreen use
    if (sunExposure.regularSunscreenSPF30) {
      score += SCORING_WEIGHTS.SOLAR.SUNSCREEN_SPF30;
    }

    return Math.min(SCORING_WEIGHTS.SOLAR.MAX_POINTS, Math.max(0, Math.round(score)));
  }

  /**
   * Evaluates Dietary Deficit Sub-Score (0 - 20 points)
   */
  public static calculateDietaryDeficitScore(
    dietaryHabits: AssessmentSubmissionInput['dietaryHabits'],
    demographics?: DemographicContext
  ): number {
    let score = 0;

    // Fatty fish
    if (dietaryHabits.fattyFishServingsPerWeek < SCORING_WEIGHTS.DIET.FATTY_FISH.threshold) {
      score += SCORING_WEIGHTS.DIET.FATTY_FISH.points;
    }

    // Fortified dairy / plant beverages
    if (dietaryHabits.fortifiedMilkServingsPerWeek < SCORING_WEIGHTS.DIET.FORTIFIED_MILK.threshold) {
      score += SCORING_WEIGHTS.DIET.FORTIFIED_MILK.points;
    }

    // Egg yolks
    if (dietaryHabits.eggYolksPerWeek < SCORING_WEIGHTS.DIET.EGG_YOLKS.threshold) {
      score += SCORING_WEIGHTS.DIET.EGG_YOLKS.points;
    }

    // Vegan / Vegetarian vulnerability without supplementation
    const isPlantBased =
      demographics?.dietaryPreference === 'vegan' ||
      demographics?.dietaryPreference === 'vegetarian';

    if (isPlantBased && !dietaryHabits.takesVitaminDSupplement) {
      score += SCORING_WEIGHTS.DIET.VEGAN_OR_VEGETARIAN_UNSUPPLEMENTED;
    }

    // Supplement offset
    if (dietaryHabits.takesVitaminDSupplement) {
      score = Math.max(0, score - SCORING_WEIGHTS.DIET.SUPPLEMENT_OFFSET);
    }

    return Math.min(SCORING_WEIGHTS.DIET.MAX_POINTS, Math.max(0, Math.round(score)));
  }

  /**
   * Evaluates Biological & Medical Multiplier Sub-Score (0 - 10 points)
   */
  public static calculateMedicalMultiplierScore(demographics?: DemographicContext): number {
    if (!demographics) return 0;
    let score = 0;

    // Age multiplier
    if (
      demographics.age !== undefined &&
      demographics.age >= SCORING_WEIGHTS.MEDICAL.ELDERLY_AGE_THRESHOLD
    ) {
      score += SCORING_WEIGHTS.MEDICAL.ELDERLY_POINTS;
    }

    // Melanin / Skin Phototype multiplier
    if (
      demographics.skinType &&
      SCORING_WEIGHTS.MEDICAL.FITZPATRICK_HIGH_MELANIN_SKIN_TYPES.includes(demographics.skinType)
    ) {
      score += SCORING_WEIGHTS.MEDICAL.HIGH_MELANIN_POINTS;
    }

    // Chronic GI, renal or malabsorption conditions
    if (demographics.medicalConditions && demographics.medicalConditions.length > 0) {
      score += SCORING_WEIGHTS.MEDICAL.CHRONIC_CONDITION_POINTS;
    }

    return Math.min(SCORING_WEIGHTS.MEDICAL.MAX_POINTS, Math.max(0, Math.round(score)));
  }

  /**
   * Computes the complete deterministic clinical risk score and stratification
   */
  public static computeScore(
    input: AssessmentSubmissionInput,
    demographics?: DemographicContext
  ): {
    results: AssessmentScoringResults;
    primaryContributors: string[];
  } {
    const symptomScore = this.calculateSymptomScore(input.symptoms);
    const solarDeficitScore = this.calculateSolarDeficitScore(input.sunExposure);
    const dietaryDeficitScore = this.calculateDietaryDeficitScore(input.dietaryHabits, demographics);
    const medicalMultiplierScore = this.calculateMedicalMultiplierScore(demographics);

    // Sum and clamp to [0, 100]
    const rawSum = symptomScore + solarDeficitScore + dietaryDeficitScore + medicalMultiplierScore;
    const compositeScore = Math.min(100, Math.max(0, Math.round(rawSum)));

    // Stratification & Clinical Consultation alerts
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

    // Primary clinical contributors
    const primaryContributors: string[] = [];
    if (input.symptoms.fatigueLevel === 'severe' || input.symptoms.fatigueLevel === 'moderate') {
      primaryContributors.push(
        `Reported ${input.symptoms.fatigueLevel} fatigue correlates strongly with suboptimal serum 25(OH)D levels.`
      );
    }
    if (input.symptoms.bonePainLevel === 'severe' || input.symptoms.bonePainLevel === 'moderate') {
      primaryContributors.push(
        `Persistent ${input.symptoms.bonePainLevel} bone/joint discomfort reflects potential musculoskeletal mineralization deficit.`
      );
    }
    if (input.symptoms.frequentInfections) {
      primaryContributors.push(
        'Recurrent respiratory or immune infections point to compromised innate immune resistance.'
      );
    }
    if (solarDeficitScore >= 12) {
      primaryContributors.push(
        `Minimal direct midday solar irradiance (${input.sunExposure.dailyMinutesOutdoors} min/day with ${input.sunExposure.clothingCoverage} clothing coverage) restricts endogenous cutaneous synthesis.`
      );
    }
    if (dietaryDeficitScore >= 10 && !input.dietaryHabits.takesVitaminDSupplement) {
      primaryContributors.push(
        'Low nutritional intake of fatty fish, fortified dairy, and co-factors without active Vitamin D supplementation.'
      );
    }
    if (demographics?.age && demographics.age >= 60) {
      primaryContributors.push(
        `Age ${demographics.age} reduces dermal 7-dehydrocholesterol photo-conversion efficiency.`
      );
    }
    if (
      demographics?.skinType &&
      SCORING_WEIGHTS.MEDICAL.FITZPATRICK_HIGH_MELANIN_SKIN_TYPES.includes(demographics.skinType)
    ) {
      primaryContributors.push(
        'Elevated epidermal melanin density (Fitzpatrick V/VI) naturally filters solar UV-B rays.'
      );
    }

    if (primaryContributors.length === 0) {
      primaryContributors.push(
        'Consistent sun exposure, nutrient-dense diet, and lack of symptoms maintain a healthy Vitamin D profile.'
      );
    }

    const results: AssessmentScoringResults = {
      compositeScore,
      riskTier,
      subScores,
      doctorConsultationRequired,
      consultationUrgency,
      disclaimer: SCORING_WEIGHTS.DISCLAIMER
    };

    return { results, primaryContributors };
  }
}
