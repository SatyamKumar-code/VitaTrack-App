import { Request, Response, NextFunction } from 'express';
import { GuidanceService } from '../services/guidance.service';
import { EducationalKnowledgeBase } from '../services/educationalKnowledgeBase';
import { DietaryPreference, SkinType } from '../types/guidance.types';

export class GuidanceController {
  /**
   * GET /api/v1/recommendations/current
   * Returns active personalized nutritional, sunlight, and exercise guidance.
   */
  public static async getCurrentGuidance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required', statusCode: 401 }
        });
        return;
      }

      // Check optional query overrides
      let dietType: DietaryPreference | undefined;
      const dietQuery = req.query.diet as string;
      if (['omnivore', 'vegetarian', 'vegan'].includes(dietQuery)) {
        dietType = dietQuery as DietaryPreference;
      }

      let skinType: SkinType | undefined;
      const skinQuery = req.query.skinType as string;
      if (
        ['type_1', 'type_2', 'type_3', 'type_4', 'type_5', 'type_6'].includes(
          skinQuery
        )
      ) {
        skinType = skinQuery as SkinType;
      }

      const guidance = await GuidanceService.getCurrentGuidance(userId, {
        dietType,
        skinType
      });

      res.status(200).json({
        success: true,
        data: guidance
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/recommendations/education
   * Returns the educational article library.
   */
  public static async getEducationalArticles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = req.query.category as
        | 'synthesis'
        | 'clinical'
        | 'nutrition'
        | 'safety'
        | undefined;

      const articles = category
        ? EducationalKnowledgeBase.getArticlesByCategory(category)
        : EducationalKnowledgeBase.getAllArticles();

      res.status(200).json({
        success: true,
        count: articles.length,
        data: articles
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/recommendations/education/:id
   * Returns a specific educational article by ID.
   */
  public static async getEducationalArticleById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const articleId = req.params.id;
      const article = EducationalKnowledgeBase.getArticleById(articleId);

      if (!article) {
        res.status(404).json({
          success: false,
          error: {
            message: `Educational article with ID '${articleId}' not found.`,
            statusCode: 404
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: article
      });
    } catch (error) {
      next(error);
    }
  }
}
