import { Request, Response, NextFunction } from 'express';
import { AssessmentService } from '../services/assessment.service';
import { AssessmentSubmissionSchema } from '../validators/assessment.validation';
import { ZodError } from 'zod';

export class AssessmentController {
  /**
   * POST /api/v1/assessments
   * Submits a completed multi-factor self-assessment questionnaire
   */
  public static async createAssessment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required to submit assessment.', statusCode: 401 }
        });
        return;
      }

      const validatedInput = AssessmentSubmissionSchema.parse(req.body);
      const result = await AssessmentService.submitAssessment(userId, validatedInput);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed for assessment questionnaire.',
            statusCode: 400,
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        });
        return;
      }
      next(error);
    }
  }

  /**
   * GET /api/v1/assessments/latest
   * Retrieves the most recent assessment results for the active user
   */
  public static async getLatestAssessment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required.', statusCode: 401 }
        });
        return;
      }

      const assessment = await AssessmentService.getLatestAssessment(userId);
      if (!assessment) {
        res.status(404).json({
          success: false,
          error: {
            message: 'No assessments found for this user.',
            statusCode: 404
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          assessmentId: assessment._id.toString(),
          timestamp: assessment.completedAt.toISOString(),
          symptoms: assessment.symptoms,
          sunExposure: assessment.sunExposure,
          dietaryHabits: assessment.dietaryHabits,
          results: assessment.scoringResults,
          aiExplanation: assessment.aiExplanation
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/assessments/history
   * Retrieves chronological assessment history with pagination
   */
  public static async getAssessmentHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required.', statusCode: 401 }
        });
        return;
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const history = await AssessmentService.getAssessmentHistory(userId, page, limit);

      res.status(200).json({
        success: true,
        pagination: history.pagination,
        data: history.data
      });
    } catch (error) {
      next(error);
    }
  }
}
