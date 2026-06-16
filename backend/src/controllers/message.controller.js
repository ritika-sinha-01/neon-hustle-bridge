import * as messageService from '../services/message.service.js';
import { asyncHandler, success, created, parsePagination, paginationMeta } from '../utils/helpers.js';

export const listConversations = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await messageService.listConversations(req.user.id, { limit, offset });
  return success(res, result.conversations, 200, paginationMeta(result.total, page, limit));
});

export const getConversation = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query, { page: 1, limit: 50, maxLimit: 200 });
  const result = await messageService.getConversation(req.params.id, req.user.id, { limit, offset });
  return success(res, result, 200, paginationMeta(result.total, page, limit));
});

export const createConversation = asyncHandler(async (req, res) => {
  const result = await messageService.createConversation(req.user.id, req.body);
  return created(res, result);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(req.params.id, req.user.id, req.body.content);
  return created(res, message);
});

export const markRead = asyncHandler(async (req, res) => {
  const result = await messageService.markConversationRead(req.params.id, req.user.id);
  return success(res, result);
});
