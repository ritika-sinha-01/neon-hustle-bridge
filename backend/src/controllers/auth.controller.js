import * as authService from '../services/auth.service.js';
import { asyncHandler, success, created, noContent } from '../utils/helpers.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return created(res, result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return success(res, result);
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body);
  return success(res, result);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body);
  return noContent(res);
});

export const me = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user.id);
  return success(res, result);
});
