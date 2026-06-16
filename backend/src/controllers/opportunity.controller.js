import * as opportunityService from '../services/opportunity.service.js';
import { asyncHandler, success, created, parsePagination, paginationMeta, noContent } from '../utils/helpers.js';

export const create = asyncHandler(async (req, res) => {
  const opportunity = await opportunityService.createOpportunity(req.user.id, req.body);
  return created(res, opportunity);
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = {
    category: req.query.category,
    workMode: req.query.workMode,
    status: req.query.status,
    search: req.query.search,
    minBudget: req.query.minBudget,
    maxBudget: req.query.maxBudget,
    clientId: req.user?.role === 'client' ? req.query.mine === 'true' ? req.user.id : undefined : undefined,
    includeDraft: req.user?.role === 'client' && req.query.mine === 'true',
  };

  const result = await opportunityService.listOpportunities(filters, { limit, offset });
  return success(res, result.opportunities, 200, paginationMeta(result.total, page, limit));
});

export const getById = asyncHandler(async (req, res) => {
  const opportunity = await opportunityService.getOpportunity(req.params.id, req.user);
  return success(res, opportunity);
});

export const update = asyncHandler(async (req, res) => {
  const opportunity = await opportunityService.updateOpportunity(
    req.params.id,
    req.user.id,
    req.body,
  );
  return success(res, opportunity);
});

export const remove = asyncHandler(async (req, res) => {
  await opportunityService.deleteOpportunity(req.params.id, req.user.id);
  return noContent(res);
});

export const listApplications = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await opportunityService.listOpportunityApplications(
    req.params.id,
    req.user.id,
    { limit, offset },
  );
  return success(res, result.applications, 200, paginationMeta(result.total, page, limit));
});
