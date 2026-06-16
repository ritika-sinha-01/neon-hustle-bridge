import * as clientService from '../services/client.service.js';
import { asyncHandler, success, parsePagination, paginationMeta } from '../utils/helpers.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await clientService.getProfile(req.user.id);
  return success(res, profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await clientService.updateProfile(req.user.id, req.body);
  return success(res, profile);
});

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await clientService.getDashboard(req.user.id);
  return success(res, dashboard);
});

export const listApplicants = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await clientService.listApplicants(req.user.id, { page, limit, offset });
  return success(res, result.applicants, 200, paginationMeta(result.total, page, limit));
});
