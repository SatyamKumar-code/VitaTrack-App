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
   * Retrieve single assessment by ID for authorized user
   */
  public static async getAssessmentById(
    userId: string,
    assessmentId: string
  ): Promise<IAssessmentDocument | null> {
    if (!Types.ObjectId.isValid(assessmentId)) {
      return null;
    }

    return Assessment.findOne({
      _id: new Types.ObjectId(assessmentId),
      userId: new Types.ObjectId(userId)
    });
  }

  /**
   * Retrieve chronological assessment history with pagination, date filters, and summary metrics
   * Reference: TASK-P6-01
   */
  public static async getAssessmentHistory(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    summary: {
      totalAssessments: number;
      averageScore: number;
      latestScore: number | null;
      earliestScore: number | null;
      scoreDelta: number | null;
      highestScore: number | null;
      lowestScore: number | null;
      riskDistribution: { low: number; moderate: number; high: number };
      trendDirection: 'improving' | 'worsening' | 'stable' | 'insufficient_data';
    };
    pagination: { total: number; page: number; pages: number };
    data: Array<{
      id: string;
      date: string;
      compositeScore: number;
      riskTier: string;
      doctorAlert: boolean;
      consultationUrgency: string;
      subScores: AssessmentSubScores;
      symptoms: any;
      sunExposure: any;
      dietaryHabits: any;
      aiExplanation?: AssessmentAiExplanation;
    }>;
  }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const userObjectId = new Types.ObjectId(userId);

    const query: Record<string, any> = { userId: userObjectId };

    if (options.startDate || options.endDate) {
      query.completedAt = {};
      if (options.startDate) {
        const parsedStart = new Date(options.startDate);
        if (!isNaN(parsedStart.getTime())) {
          query.completedAt.$gte = parsedStart;
        }
      }
      if (options.endDate) {
        const parsedEnd = new Date(options.endDate);
        if (!isNaN(parsedEnd.getTime())) {
          query.completedAt.$lte = parsedEnd;
        }
      }
    }

    // Retrieve paginated subset and overall matching set for trend analytics
    const [total, assessments, allMatching] = await Promise.all([
      Assessment.countDocuments(query),
      Assessment.find(query)
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit),
      Assessment.find(query).sort({ completedAt: 1 }) // Chronological order for trend delta
    ]);

    const pages = Math.ceil(total / limit) || 1;

    // Calculate Summary Metrics
    let averageScore = 0;
    let latestScore: number | null = null;
    let earliestScore: number | null = null;
    let scoreDelta: number | null = null;
    let highestScore: number | null = null;
    let lowestScore: number | null = null;
    const riskDistribution = { low: 0, moderate: 0, high: 0 };
    let trendDirection: 'improving' | 'worsening' | 'stable' | 'insufficient_data' =
      'insufficient_data';

    if (allMatching.length > 0) {
      const scores = allMatching.map((a) => a.scoringResults.compositeScore);
      const totalScore = scores.reduce((sum, val) => sum + val, 0);
      averageScore = Math.round((totalScore / scores.length) * 10) / 10;

      earliestScore = scores[0];
      latestScore = scores[scores.length - 1];
      scoreDelta = latestScore - earliestScore;

      highestScore = Math.max(...scores);
      lowestScore = Math.min(...scores);

      for (const a of allMatching) {
        const tier = a.scoringResults.riskTier as keyof typeof riskDistribution;
        if (riskDistribution[tier] !== undefined) {
          riskDistribution[tier] += 1;
        }
      }

      if (allMatching.length >= 2) {
        // Lower score indicates reduced deficiency risk -> improving!
        if (scoreDelta <= -5) {
          trendDirection = 'improving';
        } else if (scoreDelta >= 5) {
          trendDirection = 'worsening';
        } else {
          trendDirection = 'stable';
        }
      }
    }

    const data = assessments.map((a) => ({
      id: a._id.toString(),
      date: a.completedAt.toISOString(),
      compositeScore: a.scoringResults.compositeScore,
      riskTier: a.scoringResults.riskTier,
      doctorAlert: a.scoringResults.doctorConsultationRequired,
      consultationUrgency: a.scoringResults.consultationUrgency,
      subScores: a.scoringResults.subScores,
      symptoms: a.symptoms,
      sunExposure: a.sunExposure,
      dietaryHabits: a.dietaryHabits,
      aiExplanation: a.aiExplanation
    }));

    return {
      summary: {
        totalAssessments: total,
        averageScore,
        latestScore,
        earliestScore,
        scoreDelta,
        highestScore,
        lowestScore,
        riskDistribution,
        trendDirection
      },
      pagination: {
        total,
        page,
        pages
      },
      data
    };
  }
}
