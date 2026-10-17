import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../../../core/middleware/authenticate';

const router = Router();

// Profile endpoints (require authentication)
router.use(authenticate);

router.get('/profile', ProfileController.getProfile);
router.put('/profile', ProfileController.updateProfile);

export const userRouter = router;
