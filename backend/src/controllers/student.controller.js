import * as studentService from '../services/student.service.js';
import { asyncHandler, success } from '../utils/helpers.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.getProfile(req.user.id);
  return success(res, profile);
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.getPublicProfile(req.params.id);
  return success(res, profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.updateProfile(req.user.id, req.body);
  return success(res, profile);
});

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await studentService.getDashboard(req.user.id);
  return success(res, dashboard);
});

export const getRecommended = asyncHandler(async (req, res) => {
  const dashboard = await studentService.getDashboard(req.user.id);
  return success(res, dashboard.recommendedOpportunities);
});
