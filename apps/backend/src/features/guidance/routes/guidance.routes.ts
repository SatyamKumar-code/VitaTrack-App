import { Router } from 'express';
import { GuidanceController } from '../controllers/guidance.controller';
import { authenticate } from '../../../core/middleware/authenticate';

const router = Router();

// Public educational reading articles
router.get('/education', GuidanceController.getEducationalArticles);
router.get('/education/:id', GuidanceController.getEducationalArticleById);

// Protected personalized guidance endpoints (requires Bearer JWT)
router.get('/current', authenticate, GuidanceController.getCurrentGuidance);

export const guidanceRouter = router;
