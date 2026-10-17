import { Types } from 'mongoose';
import { Assessment, IAssessmentDocument } from '../models/assessment.model';
import { User } from '../../auth/models/user.model';
import { AssessmentSubmissionInput } from '../validators/assessment.validation';
import {
  AssessmentAiExplanation,
  AssessmentScoringResults,
  AssessmentSubScores,
  ConsultationUrgency,
  RiskTier
} from '../types/assessment.types';

export class AssessmentService {
  /**
   * Computes deterministic preliminary scoring results based on clinical parameters
   * Reference: VGU Vitamin D study, Slide 6 (Step 2) & Slide 7 (Sample User Analysis Table)
   */
  private static calculateScores(
    input: AssessmentSubmissionInput,
    medicalConditionsCount = 0
  ): { scoringResults: AssessmentScoringResults; aiExplanation: AssessmentAiExplanation } {
    const severityMap: Record<string, number> = {
      none: 0,
      mild: 6,
      moderate: 12,
      severe: 18
    };

    // 1. Symptom Score (0 - 45)
    let symptomScore =
      severityMap[input.symptoms.fatigueLevel] +
      severityMap[input.symptoms.bonePainLevel] +
      severityMap[input.symptoms.muscleWeaknessLevel] * 0.6 +
      severityMap[input.symptoms.moodChanges] * 0.5;

    if (input.symptoms.frequentInfections) {
      symptomScore += 8;
    }
    symptomScore = Math.min(45, Math.round(symptomScore));

    // 2. Solar Deficit Score (0 - 30)
    let solarDeficitScore = 0;
    if (input.sunExposure.dailyMinutesOutdoors < 15) {
      solarDeficitScore += 16;
    } else if (input.sunExposure.dailyMinutesOutdoors < 30) {
      solarDeficitScore += 10;
    } else if (input.sunExposure.dailyMinutesOutdoors < 60) {
      solarDeficitScore += 5;
    }

    if (input.sunExposure.clothingCoverage === 'high') {
      solarDeficitScore += 8;
    } else if (input.sunExposure.clothingCoverage === 'moderate') {
      solarDeficitScore += 4;
    }

    if (input.sunExposure.regularSunscreenSPF30) {
      solarDeficitScore += 5;
    }

    if (input.sunExposure.timeOfDay === 'midday') {
      solarDeficitScore = Math.max(0, solarDeficitScore - 4);
    }
    solarDeficitScore = Math.min(30, Math.round(solarDeficitScore));

    // 3. Dietary Deficit Score (0 - 20)
    let dietaryDeficitScore = 0;
    if (input.dietaryHabits.fattyFishServingsPerWeek === 0) {
      dietaryDeficitScore += 8;
    } else if (input.dietaryHabits.fattyFishServingsPerWeek < 2) {
      dietaryDeficitScore += 4;
    }

    if (input.dietaryHabits.fortifiedMilkServingsPerWeek === 0) {
      dietaryDeficitScore += 5;
    } else if (input.dietaryHabits.fortifiedMilkServingsPerWeek < 3) {
      dietaryDeficitScore += 2;
    }

    if (input.dietaryHabits.eggYolksPerWeek === 0) {
      dietaryDeficitScore += 4;
    }

    if (!input.dietaryHabits.mushroomsWeekly) {
      dietaryDeficitScore += 3;
    }

    if (input.dietaryHabits.takesVitaminDSupplement) {
      dietaryDeficitScore = Math.max(0, dietaryDeficitScore - 12);
    }
    dietaryDeficitScore = Math.min(20, Math.round(dietaryDeficitScore));

    // 4. Medical Multiplier Score (0 - 15)
    let medicalMultiplierScore = Math.min(15, medicalConditionsCount * 4);

    // Composite Score Calculation (0 - 100)
    const rawTotal =
      symptomScore + solarDeficitScore + dietaryDeficitScore + medicalMultiplierScore;
    const compositeScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

    // Risk Tier Stratification
    let riskTier: RiskTier = 'low';
    let consultationUrgency: ConsultationUrgency = 'routine_monitoring';
    let doctorConsultationRequired = false;

    if (compositeScore >= 70) {
      riskTier = 'high';
      consultationUrgency = 'urgent_medical_evaluation';
      doctorConsultationRequired = true;
    } else if (compositeScore >= 40) {
      riskTier = 'moderate';
      consultationUrgency = 'recommended_within_2_weeks';
      doctorConsultationRequired = true;
    }

    const subScores: AssessmentSubScores = {
      symptomScore,
      solarDeficitScore,
      dietaryDeficitScore,
      medicalMultiplierScore
    };

    // AI Explanation Key Contributors
    const keyContributors: string[] = [];
    if (input.symptoms.fatigueLevel === 'severe' || input.symptoms.fatigueLevel === 'moderate') {
      keyContributors.push(
        `Reported ${input.symptoms.fatigueLevel} fatigue strongly correlates with reduced serum 25(OH)D levels.`
      );
    }
    if (input.symptoms.bonePainLevel === 'severe' || input.symptoms.bonePainLevel === 'moderate') {
      keyContributors.push(
        `Elevated bone and joint discomfort indicates potential musculoskeletal strain from calcium/vitamin D deficiency.`
      );
    }
    if (input.symptoms.frequentInfections) {
      keyContributors.push(
        'Frequent infections suggest compromised immune resilience linked to suboptimal vitamin D levels.'
      );
    }
    if (solarDeficitScore >= 12) {
      keyContributors.push(
        `Sub-optimal direct sunlight exposure (${input.sunExposure.dailyMinutesOutdoors} min/day with ${input.sunExposure.clothingCoverage} clothing coverage) constrains cutaneous synthesis.`
      );
    }
    if (dietaryDeficitScore >= 10 && !input.dietaryHabits.takesVitaminDSupplement) {
      keyContributors.push(
        'Low intake of fatty fish, fortified dairy, and co-factors without supplementation contributes to dietary deficit.'
      );
    }

    if (keyContributors.length === 0) {
      keyContributors.push(
        'Healthy solar habits and balanced nutrient intake support robust Vitamin D equilibrium.'
      );
    }

    const summary =
      riskTier === 'high'
        ? `Your assessment reflects an elevated high-risk profile (Score: ${compositeScore}/100) primarily driven by severe symptoms and solar/dietary insufficiency. Clinical laboratory evaluation is strongly advised.`
        : riskTier === 'moderate'
        ? `Your assessment reflects a moderate risk profile (Score: ${compositeScore}/100) driven by reported symptoms and limited cutaneous solar synthesis. Lifestyle modifications and medical review are recommended.`
        : `Your assessment reflects a low risk profile (Score: ${compositeScore}/100). Maintain regular safe sun exposure and nutrient-rich dietary habits.`;

    const scoringResults: AssessmentScoringResults = {
      compositeScore,
      riskTier,
      subScores,
      doctorConsultationRequired,
      consultationUrgency,
      disclaimer:
        'VitaTrack is a self-assessment screening tool and does not provide medical diagnoses. Consult a qualified physician for serum blood testing.'
    };

    const aiExplanation: AssessmentAiExplanation = {
      summary,
      keyContributors
    };

    return { scoringResults, aiExplanation };
  }

  /**
   * Submit completed self-assessment questionnaire
   */
  public static async submitAssessment(
    userId: string,
    payload: AssessmentSubmissionInput
  ): Promise<{
    assessmentId: string;
    timestamp: string;
    results: AssessmentScoringResults;
    aiExplanation: AssessmentAiExplanation;
  }> {
    // Check user profile for medical conditions
    let medicalCount = 0;
    try {
      const user = await User.findById(userId);
      if (user && user.medicalConditions) {
        medicalCount = user.medicalConditions.length;
      }
    } catch {
      // Non-fatal if user lookup fails
    }

    const { scoringResults, aiExplanation } = this.calculateScores(payload, medicalCount);

    const assessment = await Assessment.create({
      userId: new Types.ObjectId(userId),
      completedAt: new Date(),
      symptoms: payload.symptoms,
      sunExposure: payload.sunExposure,
      dietaryHabits: payload.dietaryHabits,
      scoringResults,
      aiExplanation
    });

    return {
      assessmentId: assessment._id.toString(),
      timestamp: assessment.completedAt.toISOString(),
      results: assessment.scoringResults,
      aiExplanation: assessment.aiExplanation!
    };
  }

  /**
   * Retrieve the most recent assessment for the user
   */
  public static async getLatestAssessment(userId: string): Promise<IAssessmentDocument | null> {
    const assessment = await Assessment.findOne({
      userId: new Types.ObjectId(userId)
    }).sort({ completedAt: -1 });

    return assessment;
  }

  /**
   * Retrieve chronological assessment history with pagination
   */
  public static async getAssessmentHistory(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{
    pagination: { total: number; page: number; pages: number };
    data: Array<{
      id: string;
      date: string;
      compositeScore: number;
      riskTier: string;
      doctorAlert: boolean;
      subScores: AssessmentSubScores;
    }>;
  }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const userObjectId = new Types.ObjectId(userId);

    const [total, assessments] = await Promise.all([
      Assessment.countDocuments({ userId: userObjectId }),
      Assessment.find({ userId: userObjectId })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(safeLimit)
    ]);

    const pages = Math.ceil(total / safeLimit) || 1;

    const data = assessments.map((a) => ({
      id: a._id.toString(),
      date: a.completedAt.toISOString(),
      compositeScore: a.scoringResults.compositeScore,
      riskTier: a.scoringResults.riskTier,
      doctorAlert: a.scoringResults.doctorConsultationRequired,
      subScores: a.scoringResults.subScores
    }));

    return {
      pagination: {
        total,
        page: safePage,
        pages
      },
      data
    };
  }
}
