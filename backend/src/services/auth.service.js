import { withTransaction } from '../config/database.js';
import * as userModel from '../models/user.model.js';
import * as refreshTokenModel from '../models/refreshToken.model.js';
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  sanitizeUser,
} from '../utils/jwt.js';
import { badRequest, unauthorized, conflict } from '../utils/errors.js';

function buildAuthResponse(user, accessToken, refreshToken) {
  return {
    user: sanitizeUser(user),
    tokens: {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    },
  };
}

function getRefreshExpiryDate() {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function register({ email, password, role, fullName, companyName }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw conflict('Email is already registered');
  }

  const passwordHash = await hashPassword(password);

  const user = await withTransaction(async (client) => {
    const created = await userModel.create({ email, passwordHash, role }, client);

    if (role === 'student') {
      await userModel.createStudentProfile(created.id, { fullName }, client);
    } else {
      await userModel.createClientProfile(created.id, { companyName }, client);
    }

    return created;
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  await refreshTokenModel.saveRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshExpiryDate(),
  });

  return buildAuthResponse(user, accessToken, refreshToken);
}

export async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw unauthorized('Invalid email or password');
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw unauthorized('Invalid email or password');
  }

  if (!user.is_active) {
    throw unauthorized('Account is deactivated');
  }

  await userModel.updateLastLogin(user.id);

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  await refreshTokenModel.saveRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshExpiryDate(),
  });

  return buildAuthResponse(user, accessToken, refreshToken);
}

export async function refresh({ refreshToken }) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw unauthorized('Invalid refresh token');
  }

  const stored = await refreshTokenModel.findRefreshToken(hashToken(refreshToken));
  if (!stored || !stored.is_active) {
    throw unauthorized('Refresh token revoked or expired');
  }

  const user = await userModel.findById(decoded.sub);
  if (!user) {
    throw unauthorized('User not found');
  }

  await refreshTokenModel.revokeRefreshToken(hashToken(refreshToken));

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const newRefreshToken = signRefreshToken({ sub: user.id });

  await refreshTokenModel.saveRefreshToken({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: getRefreshExpiryDate(),
  });

  return buildAuthResponse(user, accessToken, newRefreshToken);
}

export async function logout({ refreshToken }) {
  if (!refreshToken) {
    throw badRequest('Refresh token is required');
  }

  await refreshTokenModel.revokeRefreshToken(hashToken(refreshToken));
  return { loggedOut: true };
}

export async function getMe(userId) {
  const user = await userModel.findById(userId);
  if (!user) {
    throw unauthorized('User not found');
  }

  let profile = null;
  if (user.role === 'student') {
    profile = await userModel.getStudentProfile(userId);
  } else {
    profile = await userModel.getClientProfile(userId);
  }

  return {
    user: sanitizeUser(user),
    profile,
  };
}
