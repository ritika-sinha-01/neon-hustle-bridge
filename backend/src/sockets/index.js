import { Server } from 'socket.io';

import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';
import * as userModel from '../models/user.model.js';
import * as messageModel from '../models/message.model.js';
import * as notificationModel from '../models/notification.model.js';

const userSockets = new Map();

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ?? socket.handshake.headers?.authorization?.slice(7);
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      const user = await userModel.findById(decoded.sub);

      if (!user?.is_active) {
        return next(new Error('Invalid user'));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    socket.join(`user:${userId}`);

    socket.on('conversation:join', async (conversationId, callback) => {
      try {
        const conversation = await messageModel.findById(conversationId, userId);
        if (!conversation) {
          callback?.({ success: false, error: 'Conversation not found' });
          return;
        }
        socket.join(`conversation:${conversationId}`);
        callback?.({ success: true });
      } catch (error) {
        callback?.({ success: false, error: error.message });
      }
    });

    socket.on('message:send', async (payload, callback) => {
      try {
        const { conversationId, content } = payload ?? {};
        if (!conversationId || !content?.trim()) {
          callback?.({ success: false, error: 'conversationId and content are required' });
          return;
        }

        const conversation = await messageModel.findById(conversationId, userId);
        if (!conversation) {
          callback?.({ success: false, error: 'Conversation not found' });
          return;
        }

        const message = await messageModel.createMessage({
          conversationId,
          senderId: userId,
          content: content.trim(),
        });

        const recipients = await messageModel.getOtherParticipants(conversationId, userId);
        await Promise.all(
          recipients.map(async (recipientId) => {
            const notification = await notificationModel.create({
              userId: recipientId,
              type: 'message',
              title: 'New message',
              message: content.trim().slice(0, 120),
              data: { conversationId, messageId: message.id },
            });

            io.to(`user:${recipientId}`).emit('notification:new', notification);
          }),
        );

        const eventPayload = {
          id: message.id,
          conversationId,
          senderId: userId,
          content: message.content,
          createdAt: message.created_at,
        };

        io.to(`conversation:${conversationId}`).emit('message:new', eventPayload);
        callback?.({ success: true, data: eventPayload });
      } catch (error) {
        callback?.({ success: false, error: error.message });
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return io;
}

export function emitToUser(io, userId, event, payload) {
  io.to(`user:${userId}`).emit(event, payload);
}
