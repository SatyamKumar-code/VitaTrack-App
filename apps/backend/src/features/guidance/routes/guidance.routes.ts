import { Router } from 'express';
import { GuidanceController } from '../controllers/guidance.controller';
import { authenticate } from '../../../core/middleware/authenticate';

const router = Router();

// Public educational reading articles
router.get('/education', GuidanceController.getEducationalArticles);
router.get('/education/:id', GuidanceController.getEducationalArticleById);

// Public UV Solar Forecast endpoint (Redis cached with 1h TTL, Open-Meteo integrated)
router.get('/solar-forecast', GuidanceController.getUvForecast);
router.get('/uv-forecast', GuidanceController.getUvForecast);

// Public Diet Recommendations endpoint (Redis cached with 24h TTL)
router.get('/diet/:category', GuidanceController.getPublicDietContent);

// Protected personalized guidance endpoints (requires Bearer JWT)
router.get('/current', authenticate, GuidanceController.getCurrentGuidance);

export const guidanceRouter = router;
