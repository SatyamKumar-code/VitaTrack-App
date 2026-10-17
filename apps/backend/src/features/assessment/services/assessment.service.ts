import { Types } from 'mongoose';
import { Assessment, IAssessmentDocument } from '../models/assessment.model';
import { User } from '../../auth/models/user.model';
import { AssessmentSubmissionInput } from '../validators/assessment.validation';
import {
  AssessmentAiExplanation,
  AssessmentScoringResults,
  AssessmentSubScores
} from '../types/assessment.types';
import {
  DeterministicScoringEngine,
  DemographicContext
} from '../scoring/deterministicScoring.engine';
import { AiExplainerService } from '../scoring/aiExplainer.service';

export class AssessmentService {
  /**
   * Computes deterministic scoring results and AI explanation based on clinical parameters
   * Reference: VGU Vitamin D study, Slide 6 (Step 2) & Slide 7 (Sample User Analysis Table)
   */
  public static async calculateScores(
    input: AssessmentSubmissionInput,
    demographics?: DemographicContext
  ): Promise<{ scoringResults: AssessmentScoringResults; aiExplanation: AssessmentAiExplanation }> {
    const { results, primaryContributors } = DeterministicScoringEngine.computeScore(
      input,
      demographics
    );

    const aiExplanation = await AiExplainerService.generateExplanation(
      input,
      results,
      primaryContributors,
      demographics
    );

    return { scoringResults: results, aiExplanation };
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
    // Extract user profile for demographic and medical multipliers
    const demographics: DemographicContext = {};

    try {
      const user = await User.findById(userId);
      if (user) {
        if (user.dateOfBirth) {
          const ageDiffMs = Date.now() - new Date(user.dateOfBirth).getTime();
          demographics.age = Math.floor(ageDiffMs / (365.25 * 24 * 60 * 60 * 1000));
        }
        demographics.skinType = user.skinType;
        demographics.dietaryPreference = user.dietaryPreference;
        demographics.medicalConditions = user.medicalConditions;
      }
    } catch {
      // Non-fatal if user lookup fails
    }

    const { scoringResults, aiExplanation } = await this.calculateScores(payload, demographics);

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
