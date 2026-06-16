import { Router } from 'express';

import * as studentController from '../controllers/student.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateStudentProfileValidation,
} from '../validators/index.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/profile', studentController.getProfile);
router.put('/profile', validate(updateStudentProfileValidation), studentController.updateProfile);
router.get('/dashboard', studentController.getDashboard);
router.get('/recommended', studentController.getRecommended);

export default router;
