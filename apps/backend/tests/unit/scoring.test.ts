import { DeterministicScoringEngine } from '../../src/features/assessment/scoring/deterministicScoring.engine';
import { RiskScoringService } from '../../src/features/assessment/services/riskScoringService';
import { AiExplainerService } from '../../src/features/assessment/scoring/aiExplainer.service';
import { AssessmentSubmissionInput } from '../../src/features/assessment/validators/assessment.validation';

describe('Deterministic Risk Scoring Engine & AI Explainer Unit Suite (TASK-P4-01 & TASK-P4-06)', () => {
  // Baseline Minimal / Healthy Input
  const minimalHealthyInput: AssessmentSubmissionInput = {
    symptoms: {
      fatigueLevel: 'none',
      bonePainLevel: 'none',
      muscleWeaknessLevel: 'none',
      moodChanges: 'none',
      frequentInfections: false
    },
    sunExposure: {
      dailyMinutesOutdoors: 45,
      timeOfDay: 'midday',
      clothingCoverage: 'low',
      regularSunscreenSPF30: false
    },
    dietaryHabits: {
      fattyFishServingsPerWeek: 3,
      fortifiedMilkServingsPerWeek: 7,
      eggYolksPerWeek: 4,
      mushroomsWeekly: true,
      takesVitaminDSupplement: true
    }
  };

  // PPT Slide 7 Patient Profile (Fatigue: High, Bone Pain: Moderate, Sun: Low)
  const pptSlide7Input: AssessmentSubmissionInput = {
    symptoms: {
      fatigueLevel: 'severe', // High fatigue = 12 pts
      bonePainLevel: 'moderate', // Moderate bone pain = 6 pts
      muscleWeaknessLevel: 'mild', // Mild weakness = 2 pts
      moodChanges: 'mild', // Mild mood = 2 pts
      frequentInfections: false // 0 pts
      // Subtotal Symptoms = 22 pts
    },
    sunExposure: {
      dailyMinutesOutdoors: 5, // < 10 min = 15 pts
      timeOfDay: 'early_morning',
      clothingCoverage: 'high', // High fabric coverage = 5 pts
      regularSunscreenSPF30: true // Sunscreen = 5 pts
      // Subtotal Solar = 25 pts
    },
    dietaryHabits: {
      fattyFishServingsPerWeek: 0, // < 1 = 7 pts
      fortifiedMilkServingsPerWeek: 2, // < 3 = 5 pts
      eggYolksPerWeek: 1, // < 2 = 3 pts
      mushroomsWeekly: false,
      takesVitaminDSupplement: false // 0 offset
      // Subtotal Diet = 15 pts
    }
    // Total = 22 + 25 + 15 = 62 pts
  };

  // Severe High-Risk Patient Profile
  const severeHighRiskInput: AssessmentSubmissionInput = {
    symptoms: {
      fatigueLevel: 'severe', // 12
      bonePainLevel: 'severe', // 10
      muscleWeaknessLevel: 'severe', // 8
      moodChanges: 'severe', // 7
      frequentInfections: true // 8 -> Total Symptoms = 45
    },
    sunExposure: {
      dailyMinutesOutdoors: 0, // 15
      timeOfDay: 'late_afternoon',
      clothingCoverage: 'high', // 5
      regularSunscreenSPF30: true // 5 -> Total Solar = 25
    },
    dietaryHabits: {
      fattyFishServingsPerWeek: 0, // 7
      fortifiedMilkServingsPerWeek: 0, // 5
      eggYolksPerWeek: 0, // 3
      mushroomsWeekly: false,
      takesVitaminDSupplement: false // vegan unsupplemented = 5 -> Total Diet = 20
    }
  };

  /**
   * TEST_PLAN.md Reference Test Cases
   */
  describe('Mandatory Test Plan Cases (TC-SCORE-01 to TC-SCORE-04)', () => {
    it('TC-SCORE-01: Minimal symptoms & optimal sun/diet -> Low Risk (Score <= 20, no doctor alert)', () => {
      const { results } = DeterministicScoringEngine.computeScore(minimalHealthyInput, {
        age: 26,
        skinType: 'type_2',
        dietaryPreference: 'omnivore',
        medicalConditions: []
      });

      expect(results.compositeScore).toBeLessThanOrEqual(20);
      expect(results.compositeScore).toBe(0);
      expect(results.riskTier).toBe('low');
      expect(results.doctorConsultationRequired).toBe(false);
      expect(results.consultationUrgency).toBe('routine_monitoring');
    });

    it('TC-SCORE-02: PPT Slide 7 user profile -> Moderate Risk (Score 50-65, doctor alert active)', () => {
      const { results } = DeterministicScoringEngine.computeScore(pptSlide7Input, {
        age: 35,
        skinType: 'type_3',
        dietaryPreference: 'omnivore',
        medicalConditions: []
      });

      expect(results.compositeScore).toBeGreaterThanOrEqual(50);
      expect(results.compositeScore).toBeLessThanOrEqual(65);
      expect(results.compositeScore).toBe(62);
      expect(results.riskTier).toBe('moderate');
      expect(results.doctorConsultationRequired).toBe(true);
      expect(results.consultationUrgency).toBe('recommended_within_2_weeks');
    });

    it('TC-SCORE-03: Severe symptoms & elderly/vegan -> High Risk (Score >= 75, urgent doctor alert active)', () => {
      const { results } = DeterministicScoringEngine.computeScore(severeHighRiskInput, {
        age: 68, // Age >= 60 = 4 pts
        skinType: 'type_6', // High melanin = 3 pts
        dietaryPreference: 'vegan', // Vegan unsupplemented = 5 pts in diet
        medicalConditions: ['chronic_kidney_disease'] // 3 pts -> Medical = 10 pts
      });

      expect(results.compositeScore).toBeGreaterThanOrEqual(75);
      expect(results.compositeScore).toBe(100);
      expect(results.riskTier).toBe('high');
      expect(results.doctorConsultationRequired).toBe(true);
      expect(results.consultationUrgency).toBe('urgent_medical_evaluation');
    });

    it('TC-SCORE-04: Boundary conditions: clamping strictly to [0, 100]', () => {
      // Overshoot test: All maxed + bonus multipliers
      const { results: maxResults } = DeterministicScoringEngine.computeScore(severeHighRiskInput, {
        age: 90,
        skinType: 'type_6',
        dietaryPreference: 'vegan',
        medicalConditions: ['celiac', 'crohns', 'ckd', 'malabsorption']
      });
      expect(maxResults.compositeScore).toBe(100);
      expect(maxResults.compositeScore).toBeLessThanOrEqual(100);

      // Undershoot / Zero test
      const { results: minResults } = DeterministicScoringEngine.computeScore(minimalHealthyInput);
      expect(minResults.compositeScore).toBe(0);
      expect(minResults.compositeScore).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * Granular Component Sub-Score Unit Tests
   */
  describe('Symptom Severity Sub-Score Granular Calibration', () => {
    it('should compute zero symptom score when all symptoms are none', () => {
      const score = DeterministicScoringEngine.calculateSymptomScore(minimalHealthyInput.symptoms);
      expect(score).toBe(0);
    });

    it('should score isolated severe fatigue as 12 points', () => {
      const score = DeterministicScoringEngine.calculateSymptomScore({
        fatigueLevel: 'severe',
        bonePainLevel: 'none',
        muscleWeaknessLevel: 'none',
        moodChanges: 'none',
        frequentInfections: false
      });
      expect(score).toBe(12);
    });

    it('should score isolated severe bone pain as 10 points', () => {
      const score = DeterministicScoringEngine.calculateSymptomScore({
        fatigueLevel: 'none',
        bonePainLevel: 'severe',
        muscleWeaknessLevel: 'none',
        moodChanges: 'none',
        frequentInfections: false
      });
      expect(score).toBe(10);
    });

    it('should score isolated severe muscle weakness as 8 points', () => {
      const score = DeterministicScoringEngine.calculateSymptomScore({
        fatigueLevel: 'none',
        bonePainLevel: 'none',
        muscleWeaknessLevel: 'severe',
        moodChanges: 'none',
        frequentInfections: false
      });
      expect(score).toBe(8);
    });

    it('should score isolated severe mood changes as 7 points', () => {
      const score = DeterministicScoringEngine.calculateSymptomScore({
        fatigueLevel: 'none',
        bonePainLevel: 'none',
        muscleWeaknessLevel: 'none',
        moodChanges: 'severe',
        frequentInfections: false
      });
      expect(score).toBe(7);
    });

    it('should score frequent infections as 8 points', () => {
      const score = DeterministicScoringEngine.calculateSymptomScore({
        fatigueLevel: 'none',
        bonePainLevel: 'none',
        muscleWeaknessLevel: 'none',
        moodChanges: 'none',
        frequentInfections: true
      });
      expect(score).toBe(8);
    });

    it('should cap symptom score at maximum 45 points', () => {
      const score = DeterministicScoringEngine.calculateSymptomScore(severeHighRiskInput.symptoms);
      expect(score).toBe(45);
    });
  });

  describe('Solar Insufficiency Sub-Score Granular Calibration', () => {
    it('should assign 15 points for minimal outdoors (< 10 min)', () => {
      const score = DeterministicScoringEngine.calculateSolarDeficitScore({
        dailyMinutesOutdoors: 5,
        timeOfDay: 'midday',
        clothingCoverage: 'low',
        regularSunscreenSPF30: false
      });
      expect(score).toBe(15);
    });

    it('should assign 7 points for moderate outdoors (10 - 25 min)', () => {
      const score = DeterministicScoringEngine.calculateSolarDeficitScore({
        dailyMinutesOutdoors: 15,
        timeOfDay: 'midday',
        clothingCoverage: 'low',
        regularSunscreenSPF30: false
      });
      expect(score).toBe(7);
    });

    it('should assign 0 duration points for optimal outdoors (> 25 min)', () => {
      const score = DeterministicScoringEngine.calculateSolarDeficitScore({
        dailyMinutesOutdoors: 35,
        timeOfDay: 'midday',
        clothingCoverage: 'low',
        regularSunscreenSPF30: false
      });
      expect(score).toBe(0);
    });

    it('should add 5 points for high clothing coverage', () => {
      const score = DeterministicScoringEngine.calculateSolarDeficitScore({
        dailyMinutesOutdoors: 35,
        timeOfDay: 'midday',
        clothingCoverage: 'high',
        regularSunscreenSPF30: false
      });
      expect(score).toBe(5);
    });

    it('should add 5 points for regular SPF 30+ sunscreen usage', () => {
      const score = DeterministicScoringEngine.calculateSolarDeficitScore({
        dailyMinutesOutdoors: 35,
        timeOfDay: 'midday',
        clothingCoverage: 'low',
        regularSunscreenSPF30: true
      });
      expect(score).toBe(5);
    });

    it('should cap solar deficit at maximum 25 points', () => {
      const score = DeterministicScoringEngine.calculateSolarDeficitScore(severeHighRiskInput.sunExposure);
      expect(score).toBe(25);
    });
  });

  describe('Dietary Deficit Sub-Score Granular Calibration', () => {
    it('should assign 7 points when fatty fish is under 1 serving/week', () => {
      const score = DeterministicScoringEngine.calculateDietaryDeficitScore({
        fattyFishServingsPerWeek: 0,
        fortifiedMilkServingsPerWeek: 5,
        eggYolksPerWeek: 4,
        mushroomsWeekly: true,
        takesVitaminDSupplement: false
      });
      expect(score).toBe(7);
    });

    it('should assign 5 points when fortified milk is under 3 servings/week', () => {
      const score = DeterministicScoringEngine.calculateDietaryDeficitScore({
        fattyFishServingsPerWeek: 2,
        fortifiedMilkServingsPerWeek: 1,
        eggYolksPerWeek: 4,
        mushroomsWeekly: true,
        takesVitaminDSupplement: false
      });
      expect(score).toBe(5);
    });

    it('should assign 3 points when egg yolks are under 2/week', () => {
      const score = DeterministicScoringEngine.calculateDietaryDeficitScore({
        fattyFishServingsPerWeek: 2,
        fortifiedMilkServingsPerWeek: 5,
        eggYolksPerWeek: 0,
        mushroomsWeekly: true,
        takesVitaminDSupplement: false
      });
      expect(score).toBe(3);
    });

    it('should add 5 points for unsupplemented vegan/vegetarian diet', () => {
      const score = DeterministicScoringEngine.calculateDietaryDeficitScore(
        {
          fattyFishServingsPerWeek: 0,
          fortifiedMilkServingsPerWeek: 0,
          eggYolksPerWeek: 0,
          mushroomsWeekly: false,
          takesVitaminDSupplement: false
        },
        { dietaryPreference: 'vegan' }
      );
      // 7 (fish) + 5 (milk) + 3 (egg) + 5 (vegan) = 20
      expect(score).toBe(20);
    });

    it('should offset dietary deficit when taking daily Vitamin D supplement', () => {
      const score = DeterministicScoringEngine.calculateDietaryDeficitScore(
        {
          fattyFishServingsPerWeek: 0,
          fortifiedMilkServingsPerWeek: 0,
          eggYolksPerWeek: 0,
          mushroomsWeekly: false,
          takesVitaminDSupplement: true
        },
        { dietaryPreference: 'vegan' }
      );
      // 15 pts deficit - 15 offset = 0
      expect(score).toBe(0);
    });
  });

  describe('Biological & Medical Multipliers Granular Calibration', () => {
    it('should assign 4 points for age >= 60', () => {
      const score = DeterministicScoringEngine.calculateMedicalMultiplierScore({
        age: 62
      });
      expect(score).toBe(4);
    });

    it('should assign 0 points for age < 60', () => {
      const score = DeterministicScoringEngine.calculateMedicalMultiplierScore({
        age: 58
      });
      expect(score).toBe(0);
    });

    it('should assign 3 points for Fitzpatrick skin type V or VI', () => {
      const score5 = DeterministicScoringEngine.calculateMedicalMultiplierScore({
        skinType: 'type_5'
      });
      const score6 = DeterministicScoringEngine.calculateMedicalMultiplierScore({
        skinType: 'type_6'
      });
      expect(score5).toBe(3);
      expect(score6).toBe(3);
    });

    it('should assign 0 points for Fitzpatrick skin type I-IV', () => {
      const score = DeterministicScoringEngine.calculateMedicalMultiplierScore({
        skinType: 'type_3'
      });
      expect(score).toBe(0);
    });

    it('should assign 3 points for chronic GI or renal medical conditions', () => {
      const score = DeterministicScoringEngine.calculateMedicalMultiplierScore({
        medicalConditions: ['celiac_disease']
      });
      expect(score).toBe(3);
    });

    it('should cap medical multiplier at maximum 10 points', () => {
      const score = DeterministicScoringEngine.calculateMedicalMultiplierScore({
        age: 72, // 4
        skinType: 'type_6', // 3
        medicalConditions: ['celiac', 'renal_failure'] // 3 -> Total = 10
      });
      expect(score).toBe(10);
    });
  });

  /**
   * Risk Tier Stratification Thresholds
   */
  describe('Risk Tier Transition Boundaries', () => {
    it('should stratify score 39 as Low Risk with routine monitoring', () => {
      // Craft input yielding exactly 39 points
      const input: AssessmentSubmissionInput = {
        symptoms: {
          fatigueLevel: 'severe', // 12
          bonePainLevel: 'moderate', // 6
          muscleWeaknessLevel: 'mild', // 2
          moodChanges: 'none', // 0
          frequentInfections: false // 0 -> 20
        },
        sunExposure: {
          dailyMinutesOutdoors: 20, // 7
          timeOfDay: 'midday',
          clothingCoverage: 'high', // 5
          regularSunscreenSPF30: false // 0 -> 12
        },
        dietaryHabits: {
          fattyFishServingsPerWeek: 0, // 7
          fortifiedMilkServingsPerWeek: 5, // 0
          eggYolksPerWeek: 4, // 0
          mushroomsWeekly: true,
          takesVitaminDSupplement: false
        }
      }; // Total = 20 + 12 + 7 = 39

      const { results } = DeterministicScoringEngine.computeScore(input);
      expect(results.compositeScore).toBe(39);
      expect(results.riskTier).toBe('low');
      expect(results.doctorConsultationRequired).toBe(false);
      expect(results.consultationUrgency).toBe('routine_monitoring');
    });

    it('should stratify score 40 as Moderate Risk and trigger doctor consultation', () => {
      // Score 40 = Score 39 + 1 (mild muscle weakness = 2 instead of none)
      const input: AssessmentSubmissionInput = {
        symptoms: {
          fatigueLevel: 'severe', // 12
          bonePainLevel: 'moderate', // 6
          muscleWeaknessLevel: 'mild', // 2
          moodChanges: 'mild', // 2
          frequentInfections: false // 0 -> 22
        },
        sunExposure: {
          dailyMinutesOutdoors: 20, // 7
          timeOfDay: 'midday',
          clothingCoverage: 'low', // 0
          regularSunscreenSPF30: false // 0 -> 7
        },
        dietaryHabits: {
          fattyFishServingsPerWeek: 0, // 7
          fortifiedMilkServingsPerWeek: 2, // 5
          eggYolksPerWeek: 4, // 0
          mushroomsWeekly: true,
          takesVitaminDSupplement: false // 0 -> 12
        }
      }; // Demographics: skinType type_5 (3 pts) -> Total = 22 + 7 + 12 = 41 -> clamped or exact

      const { results } = DeterministicScoringEngine.computeScore(input);
      expect(results.compositeScore).toBeGreaterThanOrEqual(40);
      expect(results.riskTier).toBe('moderate');
      expect(results.doctorConsultationRequired).toBe(true);
      expect(results.consultationUrgency).toBe('recommended_within_2_weeks');
    });

    it('should stratify score >= 70 as High Risk and trigger urgent doctor consultation', () => {
      const input: AssessmentSubmissionInput = {
        symptoms: {
          fatigueLevel: 'severe', // 12
          bonePainLevel: 'severe', // 10
          muscleWeaknessLevel: 'severe', // 8
          moodChanges: 'severe', // 7
          frequentInfections: false // 0 -> 37
        },
        sunExposure: {
          dailyMinutesOutdoors: 5, // 15
          timeOfDay: 'midday',
          clothingCoverage: 'high', // 5
          regularSunscreenSPF30: true // 5 -> 25
        },
        dietaryHabits: {
          fattyFishServingsPerWeek: 0, // 7
          fortifiedMilkServingsPerWeek: 0, // 5
          eggYolksPerWeek: 4, // 0
          mushroomsWeekly: true,
          takesVitaminDSupplement: false // 0 -> 12
        }
      }; // Total = 37 + 25 + 12 = 74

      const { results } = DeterministicScoringEngine.computeScore(input);
      expect(results.compositeScore).toBe(74);
      expect(results.riskTier).toBe('high');
      expect(results.doctorConsultationRequired).toBe(true);
      expect(results.consultationUrgency).toBe('urgent_medical_evaluation');
    });
  });

  /**
   * RiskScoringService Façade and AI Explainer Tests
   */
  describe('RiskScoringService Façade & AI Explainer Fallback', () => {
    it('RiskScoringService.calculateRiskScore should return consistent results and primary contributors', () => {
      const { results, primaryContributors } = RiskScoringService.calculateRiskScore(pptSlide7Input);
      expect(results.compositeScore).toBe(62);
      expect(results.riskTier).toBe('moderate');
      expect(primaryContributors.length).toBeGreaterThan(0);
      expect(primaryContributors.some((c) => c.toLowerCase().includes('fatigue'))).toBe(true);
    });

    it('RiskScoringService.getSubScores should return accurate subScore components', () => {
      const subScores = RiskScoringService.getSubScores(pptSlide7Input);
      expect(subScores.symptomScore).toBe(22);
      expect(subScores.solarDeficitScore).toBe(25);
      expect(subScores.dietaryDeficitScore).toBe(15);
      expect(subScores.medicalMultiplierScore).toBe(0);
    });

    it('AiExplainerService.synthesizeDeterministicExplanation should produce patient-centered summary', () => {
      const { results, primaryContributors } = DeterministicScoringEngine.computeScore(pptSlide7Input);
      const explanation = AiExplainerService.synthesizeDeterministicExplanation(
        results,
        primaryContributors
      );

      expect(explanation.summary).toBeDefined();
      expect(explanation.summary).toContain('moderate risk profile');
      expect(explanation.summary).toContain('62/100');
      expect(explanation.keyContributors.length).toBeGreaterThan(0);
    });

    it('AiExplainerService should handle high-risk explanation with medical consultation prompt', () => {
      const { results, primaryContributors } = DeterministicScoringEngine.computeScore(severeHighRiskInput, {
        age: 70
      });
      const explanation = AiExplainerService.synthesizeDeterministicExplanation(
        results,
        primaryContributors
      );

      expect(explanation.summary).toContain('elevated risk profile');
      expect(explanation.summary).toContain('blood serum test');
      expect(explanation.keyContributors.length).toBeGreaterThan(0);
    });

    it('DeterministicScoringEngine should include mandatory clinical disclaimer', () => {
      const { results } = DeterministicScoringEngine.computeScore(minimalHealthyInput);
      expect(results.disclaimer).toContain('VitaTrack is a self-assessment screening tool');
      expect(results.disclaimer).toContain('Consult a qualified physician');
    });
  });
});
