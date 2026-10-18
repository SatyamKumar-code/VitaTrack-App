import { Router } from 'express';
import { WearableController } from '../controllers/wearable.controller';
import { authenticate } from '../../../core/middleware/authenticate';

const router = Router();

// All wearable biometric routes require valid patient authentication
router.use(authenticate);

// POST /api/v1/wearables/sync
router.post('/sync', WearableController.sync);

// GET /api/v1/wearables/latest
router.get('/latest', WearableController.getLatest);

// GET /api/v1/wearables/history
router.get('/history', WearableController.getHistory);

// GET /api/v1/wearables/insights
router.get('/insights', WearableController.getInsights);

export const wearableRouter = router;
