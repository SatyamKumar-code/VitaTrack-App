import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../../../core/middleware/authenticate';

import { authRateLimiter } from '../../../core/security/rateLimiter';

const router = Router();

// Public auth endpoints protected by authRateLimiter
router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);

// Logout (can be called with or without auth token)
router.post('/logout', (req, res, next) => {
  // If authorization header is present, attempt authentication, otherwise proceed
  if (req.headers.authorization) {
    return authenticate(req, res, () => AuthController.logout(req, res, next));
  }
  return AuthController.logout(req, res, next);
});

export const authRouter = router;
