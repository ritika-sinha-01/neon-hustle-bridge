import { Router } from 'express';

import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  notificationIdValidation,
  listPaginationValidation,
} from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listPaginationValidation), notificationController.list);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', validate(notificationIdValidation), notificationController.markRead);
router.delete('/:id', validate(notificationIdValidation), notificationController.remove);

export default router;
