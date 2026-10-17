import { Types } from 'mongoose';
import { User, IUser } from '../../auth/models/user.model';
import { Assessment, IAssessmentDocument } from '../../assessment/models/assessment.model';
import { Recommendation } from '../models/recommendation.model';
import {
  DietaryPreference,
  SkinType,
  PersonalizedGuidancePayload
} from '../types/guidance.types';
import { NutritionalEngine } from './nutritionalEngine';
import { SolarCalculatorEngine } from './solarCalculatorEngine';
import { ExerciseGuideModule } from './exerciseGuideModule';
import { logger } from '../../../core/logger/logger';

export class GuidanceService {
  /**
   * Retrieves or computes current personalized guidance for the user based on profile and latest assessment.
   */
  public static async getCurrentGuidance(
    userId: string | Types.ObjectId,
    overrides?: {
      dietType?: DietaryPreference;
      skinType?: SkinType;
    }
  ): Promise<PersonalizedGuidancePayload> {
    const userObjectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    // Fetch user profile baseline
    const user = (await User.findById(userObjectId)) as IUser | null;

    // Fetch latest completed assessment (if any)
    const latestAssessment = (await (Assessment.findOne({ userId: userObjectId }).sort({
      completedAt: -1
    }) as any)) as IAssessmentDocument | null;

    // Resolve parameters
    const dietType: DietaryPreference =
      overrides?.dietType ||
      (user?.dietaryPreference as DietaryPreference) ||
      'omnivore';

    const skinType: SkinType =
      overrides?.skinType ||
      (user?.skinType as SkinType) ||
      'type_3';

    const riskTier = latestAssessment?.scoringResults?.riskTier || 'moderate';
    const medicalConditions = user?.medicalConditions || [];

    const bonePainLevel = latestAssessment?.symptoms?.bonePainLevel || 'none';
    const muscleWeaknessLevel =
      latestAssessment?.symptoms?.muscleWeaknessLevel || 'none';

    // Generate subsystem guidance
    const nutrition = NutritionalEngine.generateNutritionalGuidance(
      dietType,
      riskTier,
      medicalConditions
    );

    const sunlight = SolarCalculatorEngine.calculateSunlightGuidance(skinType);

    const exercise = ExerciseGuideModule.generateExerciseGuidance(
      bonePainLevel,
      muscleWeaknessLevel
    );

    const payload: PersonalizedGuidancePayload = {
      nutrition,
      sunlight,
      exercise,
      riskTier,
      assessmentId: latestAssessment?._id?.toString(),
      generatedAt: new Date().toISOString()
    };

    // Asynchronously persist recommendation history
    try {
      await Recommendation.create({
        userId: userObjectId,
        assessmentId: latestAssessment?._id,
        nutritionPlan: nutrition,
        sunlightSchedule: sunlight,
        exerciseSuggestions: exercise,
        generatedAt: new Date()
      });
    } catch (err) {
      logger.warn(`Failed to persist recommendation record for user ${userId}: ${err}`);
    }

    return payload;
  }
}
