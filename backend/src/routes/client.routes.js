import { Router } from 'express';

import * as clientController from '../controllers/client.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateClientProfileValidation,
  listPaginationValidation,
} from '../validators/index.js';

const router = Router();

router.use(authenticate, authorize('client'));

router.get('/profile', clientController.getProfile);
router.put('/profile', validate(updateClientProfileValidation), clientController.updateProfile);
router.get('/dashboard', clientController.getDashboard);
router.get('/applicants', validate(listPaginationValidation), clientController.listApplicants);

export default router;
