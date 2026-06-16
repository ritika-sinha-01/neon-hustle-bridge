import { Router } from 'express';

import * as aiController from '../controllers/ai.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  generateOutreachValidation,
  listPaginationValidation,
} from '../validators/index.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.post(
  '/generate-outreach',
  validate(generateOutreachValidation),
  aiController.generateOutreach,
);

router.get(
  '/history',
  validate(listPaginationValidation),
  aiController.getHistory,
);

export default router;
