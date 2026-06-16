import { Router } from 'express';

import * as applicationController from '../controllers/application.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createApplicationValidation,
  updateApplicationStatusValidation,
  applicationIdValidation,
  listPaginationValidation,
} from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('student'),
  validate(createApplicationValidation),
  applicationController.submit,
);

router.get(
  '/',
  authorize('student'),
  validate(listPaginationValidation),
  applicationController.listMine,
);

router.get('/stats', authorize('student'), applicationController.getStats);

router.get(
  '/:id',
  validate(applicationIdValidation),
  applicationController.getById,
);

router.patch(
  '/:id/status',
  validate(updateApplicationStatusValidation),
  applicationController.updateStatus,
);

export default router;
