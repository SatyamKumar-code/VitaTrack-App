import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { authenticate } from '../../../core/middleware/authenticate';

const router = Router();

// All assessment routes require authenticated session
router.use(authenticate);

// POST /api/v1/assessments - Submit questionnaire
router.post('/', AssessmentController.createAssessment);

// GET /api/v1/assessments/latest - Retrieve latest assessment
router.get('/latest', AssessmentController.getLatestAssessment);

// GET /api/v1/assessments/history - Retrieve paginated history
router.get('/history', AssessmentController.getAssessmentHistory);

export const assessmentRouter = router;
