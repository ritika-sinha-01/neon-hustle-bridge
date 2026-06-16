import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerValidation,
  loginValidation,
  refreshValidation,
} from '../validators/index.js';

const router = Router();

router.post('/register', authLimiter, validate(registerValidation), authController.register);
router.post('/login', authLimiter, validate(loginValidation), authController.login);
router.post('/refresh', validate(refreshValidation), authController.refresh);
router.post('/logout', validate(refreshValidation), authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
