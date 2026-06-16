import { validationResult } from 'express-validator';

import { badRequest } from '../utils/errors.js';

export function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        badRequest('Validation failed', 'VALIDATION_ERROR', errors.array()),
      );
    }

    return next();
  };
}
