import * as aiService from '../services/ai.service.js';
import {
  asyncHandler,
  success,
  created,
  parsePagination,
  paginationMeta,
} from '../utils/helpers.js';

export const generateOutreach = asyncHandler(async (req, res) => {
  const outreach = await aiService.generateOutreach(req.user.id, req.body);
  return created(res, outreach);
});

export const getHistory = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await aiService.getOutreachHistory(req.user.id, { limit, offset });
  return success(res, result.history, 200, paginationMeta(result.total, page, limit));
});
