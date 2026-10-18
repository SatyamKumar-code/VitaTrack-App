import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../../../core/middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// Public Admin Login endpoint
router.post('/auth/login', AdminController.login);

// Protected Admin Telemetry Endpoints (Requires valid JWT with role: 'admin')
router.get('/health', authenticate, requireAdmin, AdminController.getHealth);
router.get('/metrics', authenticate, requireAdmin, AdminController.getMetrics);
router.get('/audit-logs', authenticate, requireAdmin, AdminController.getAuditLogs);

export const adminRouter = router;
