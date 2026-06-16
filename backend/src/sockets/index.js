import { Server } from 'socket.io';

import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';
import * as userModel from '../models/user.model.js';
import * as messageModel from '../models/message.model.js';
import * as messageService from '../services/message.service.js';
import { setRealtimeServer } from '../utils/realtime.js';
import {
  registerConnection,
  unregisterConnection,
} from './presence.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  setRealtimeServer(io);

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ??
        socket.handshake.headers?.authorization?.slice(7);

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

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    const isFirstConnection = registerConnection(userId, socket.id);
    socket.join(`user:${userId}`);

    if (isFirstConnection) {
      const partnerIds = await messageModel.listPartnerUserIds(userId);
      for (const partnerId of partnerIds) {
        io.to(`user:${partnerId}`).emit('user_online', { userId });
      }
    }

    socket.on('join_conversation', async (conversationId, callback) => {
      try {
        const conversation = await messageModel.findById(conversationId, userId);
        if (!conversation) {
          callback?.({ success: false, error: 'Conversation not found' });
          return;
        }
        socket.join(`conversation:${conversationId}`);
        callback?.({ success: true, conversationId });
      } catch (error) {
        callback?.({ success: false, error: error.message });
      }
    });

    socket.on('send_message', async (payload, callback) => {
      try {
        const { conversationId, content } = payload ?? {};
        if (!conversationId || !content?.trim()) {
          callback?.({ success: false, error: 'conversationId and content are required' });
          return;
        }

        const message = await messageService.sendMessage(
          conversationId,
          userId,
          content.trim(),
          { realtime: true },
        );

        callback?.({ success: true, data: message });
      } catch (error) {
        callback?.({ success: false, error: error.message });
      }
    });

    socket.on('message_read', async (payload, callback) => {
      try {
        const conversationId = payload?.conversationId;
        if (!conversationId) {
          callback?.({ success: false, error: 'conversationId is required' });
          return;
        }

        const result = await messageService.markConversationRead(
          conversationId,
          userId,
          { realtime: true },
        );
        callback?.({ success: true, data: result });
      } catch (error) {
        callback?.({ success: false, error: error.message });
      }
    });

    socket.on('typing_start', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('typing_start', {
        conversationId,
        userId,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('typing_stop', {
        conversationId,
        userId,
      });
    });

    socket.on('disconnect', async () => {
      const isLastConnection = unregisterConnection(userId, socket.id);

      if (isLastConnection) {
        const partnerIds = await messageModel.listPartnerUserIds(userId);
        for (const partnerId of partnerIds) {
          io.to(`user:${partnerId}`).emit('user_offline', { userId });
        }
      }
    });
  });

  return io;
}

export { isUserOnline } from './presence.js';

export function emitToUser(ioInstance, userId, event, payload) {
  ioInstance.to(`user:${userId}`).emit(event, payload);
}
