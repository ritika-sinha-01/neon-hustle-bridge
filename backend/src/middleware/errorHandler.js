import { AppError } from '../utils/errors.js';
import { isProduction } from '../config/env.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    err = new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }

  if (err.code === '23505') {
    err = new AppError('Resource already exists', 409, 'DUPLICATE_ENTRY');
  }

  if (err.code === '23503') {
    err = new AppError('Related resource not found', 400, 'FOREIGN_KEY_VIOLATION');
  }

  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = err.isOperational ? err.message : 'Internal server error';

  if (!err.isOperational) {
    console.error('[error]', err);
  }

  const body = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (err.details) {
    body.error.details = err.details;
  }

  if (!isProduction && !err.isOperational) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
