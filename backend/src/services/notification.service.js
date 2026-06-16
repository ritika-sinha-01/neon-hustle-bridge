import * as notificationModel from '../models/notification.model.js';
import { notFound } from '../utils/errors.js';

function mapNotification(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    data: row.data,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export async function listNotifications(userId, pagination, unreadOnly = false) {
  const { rows, total } = await notificationModel.listByUser(userId, {
    ...pagination,
    unreadOnly,
  });
  const unreadCount = await notificationModel.countUnread(userId);

  return {
    notifications: rows.map(mapNotification),
    unreadCount,
    total,
  };
}

export async function markNotificationRead(id, userId) {
  const notification = await notificationModel.markRead(id, userId);
  if (!notification) throw notFound('Notification not found');
  return mapNotification(notification);
}

export async function markAllNotificationsRead(userId) {
  const count = await notificationModel.markAllRead(userId);
  return { markedRead: count };
}

export async function deleteNotification(id, userId) {
  const deleted = await notificationModel.remove(id, userId);
  if (!deleted) throw notFound('Notification not found');
  return { deleted: true };
}

export async function createNotification(payload) {
  const notification = await notificationModel.create(payload);
  return mapNotification(notification);
}

export { mapNotification };
