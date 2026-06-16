import { isUserOnline } from '../sockets/presence.js';

let io = null;

export function setRealtimeServer(serverIo) {
  io = serverIo;
}

export function getRealtimeServer() {
  return io;
}

export function broadcastToConversation(conversationId, event, payload) {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit(event, payload);
}

export function broadcastToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function broadcastPresence(userIds, event, payload) {
  if (!io || !userIds.length) return;
  for (const userId of userIds) {
    broadcastToUser(userId, event, payload);
  }
}

export function emitReceiveMessage(conversationId, recipientIds, payload) {
  broadcastToConversation(conversationId, 'receive_message', payload);
  for (const recipientId of recipientIds) {
    broadcastToUser(recipientId, 'receive_message', payload);
  }
}

export function emitMessageRead(conversationId, payload) {
  broadcastToConversation(conversationId, 'message_read', payload);
}

export function shouldNotifyOffline(userId) {
  return !isUserOnline(userId);
}
