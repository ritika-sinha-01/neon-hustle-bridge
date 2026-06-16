import { verifyAccessToken } from '../utils/jwt.js';
import { unauthorized, forbidden } from '../utils/errors.js';
import * as userModel from '../models/user.model.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw unauthorized('Access token required');
    }

    const token = header.slice(7);
    const decoded = verifyAccessToken(token);
    const user = await userModel.findById(decoded.sub);

    if (!user || !user.is_active) {
      throw unauthorized('User account is inactive or not found');
    }

    req.user = user;
    req.auth = decoded;
    next();
  } catch (error) {
    if (error.name === 'AppError') return next(error);
    next(unauthorized('Invalid or expired access token'));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(unauthorized());
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(forbidden('Insufficient permissions for this resource'));
    }

    return next();
  };
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next();
  }

  return authenticate(req, res, next);
}
