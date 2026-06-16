import * as applicationService from '../services/application.service.js';
import { asyncHandler, success, created, parsePagination, paginationMeta } from '../utils/helpers.js';

export const submit = asyncHandler(async (req, res) => {
  const application = await applicationService.submitApplication(req.user.id, req.body);
  return created(res, application);
});

export const listMine = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await applicationService.listMyApplications(req.user.id, { limit, offset });
  return success(res, result.applications, 200, paginationMeta(result.total, page, limit));
});

export const getById = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplication(req.params.id, req.user);
  return success(res, application);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    req.user,
    req.body.status,
  );
  return success(res, application);
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await applicationService.getStudentApplicationStats(req.user.id);
  return success(res, stats);
});
