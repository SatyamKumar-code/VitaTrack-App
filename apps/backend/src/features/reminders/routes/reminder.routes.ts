import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';
import { authenticate } from '../../../core/middleware/authenticate';

const router = Router();

// All reminder preferences routes require valid patient authentication
router.use(authenticate);

router.get('/', ReminderController.getPreferences);
router.put('/', ReminderController.updatePreferences);
router.post('/test', ReminderController.testNotification);

export const reminderRouter = router;
