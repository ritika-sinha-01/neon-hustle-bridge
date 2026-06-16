/** In-memory presence tracking for connected users (multi-tab supported). */
const userSockets = new Map();

export function registerConnection(userId, socketId) {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socketId);
  return userSockets.get(userId).size === 1;
}

export function unregisterConnection(userId, socketId) {
  const sockets = userSockets.get(userId);
  if (!sockets) return false;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
    return true;
  }
  return false;
}

export function isUserOnline(userId) {
  return userSockets.has(userId);
}

export function getOnlineUserIds() {
  return [...userSockets.keys()];
}
