import * as notificationService from '../services/notification.service.js';
import { asyncHandler, success, noContent, parsePagination, paginationMeta } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const unreadOnly = req.query.unreadOnly === 'true';
  const result = await notificationService.listNotifications(
    req.user.id,
    { limit, offset },
    unreadOnly,
  );
  return success(
    res,
    { notifications: result.notifications, unreadCount: result.unreadCount },
    200,
    paginationMeta(result.total, page, limit),
  );
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationRead(req.params.id, req.user.id);
  return success(res, notification);
});

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead(req.user.id);
  return success(res, result);
});

export const remove = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);
  return noContent(res);
});
