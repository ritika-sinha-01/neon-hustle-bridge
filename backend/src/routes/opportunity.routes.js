import { Router } from 'express';

import * as opportunityController from '../controllers/opportunity.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOpportunityValidation,
  updateOpportunityValidation,
  opportunityIdValidation,
  listOpportunitiesValidation,
  listPaginationValidation,
} from '../validators/index.js';

const router = Router();

router.get(
  '/',
  optionalAuth,
  validate([...listOpportunitiesValidation, ...listPaginationValidation]),
  opportunityController.list,
);

router.get(
  '/:id',
  optionalAuth,
  validate(opportunityIdValidation),
  opportunityController.getById,
);

router.post(
  '/',
  authenticate,
  authorize('client'),
  validate(createOpportunityValidation),
  opportunityController.create,
);

router.put(
  '/:id',
  authenticate,
  authorize('client'),
  validate(updateOpportunityValidation),
  opportunityController.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize('client'),
  validate(opportunityIdValidation),
  opportunityController.remove,
);

router.get(
  '/:id/applications',
  authenticate,
  authorize('client'),
  validate([...opportunityIdValidation, ...listPaginationValidation]),
  opportunityController.listApplications,
);

export default router;
