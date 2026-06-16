import { withTransaction } from '../config/database.js';
import * as messageModel from '../models/message.model.js';
import * as notificationModel from '../models/notification.model.js';
import * as userModel from '../models/user.model.js';
import { isUserOnline } from '../sockets/presence.js';
import { notFound, badRequest, forbidden } from '../utils/errors.js';
import {
  emitMessageRead,
  emitReceiveMessage,
  shouldNotifyOffline,
  broadcastToUser,
} from '../utils/realtime.js';

function mapMessage(row) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapParticipant(row) {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    lastReadAt: row.last_read_at,
    isOnline: isUserOnline(row.user_id),
  };
}

function mapConversation(row, participants = row.participants ?? []) {
  const mappedParticipants = Array.isArray(participants)
    ? participants.map((p) =>
        typeof p === 'object' && 'userId' in p
          ? { ...p, isOnline: isUserOnline(p.userId) }
          : p,
      )
    : participants;

  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    lastMessage: row.last_message,
    unreadCount: row.unread_count,
    participants: mappedParticipants,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadConversationParticipants(conversationId, userId) {
  const rows = await messageModel.getParticipantsEnriched(conversationId, userId);
  return rows.map(mapParticipant);
}

export async function listConversations(userId, pagination) {
  const { rows, total } = await messageModel.listForUser(userId, pagination);
  return {
    conversations: rows.map((row) => mapConversation(row)),
    total,
  };
}

export async function getConversation(conversationId, userId, pagination) {
  const conversation = await messageModel.findById(conversationId, userId);
  if (!conversation) throw notFound('Conversation not found');

  const participants = await loadConversationParticipants(conversationId, userId);
  const { rows, total } = await messageModel.listMessages(conversationId, pagination);
  await messageModel.markConversationRead(conversationId, userId);

  return {
    conversation: mapConversation({ ...conversation, unread_count: 0 }, participants),
    messages: rows.map(mapMessage),
    total,
  };
}

function assertStudentClientPair(initiator, participant) {
  if (initiator.role === participant.role) {
    throw badRequest('Conversations are only allowed between a student and a client');
  }
}

export async function createConversation(userId, { participantId, opportunityId, initialMessage }) {
  if (userId === participantId) {
    throw badRequest('Cannot start a conversation with yourself');
  }

  const initiator = await userModel.findById(userId);
  const participant = await userModel.findById(participantId);
  if (!participant) throw notFound('Participant not found');

  assertStudentClientPair(initiator, participant);

  const existing = await messageModel.findConversationBetween(userId, participantId, opportunityId);
  if (existing) {
    if (initialMessage) {
      return sendMessage(existing.id, userId, initialMessage);
    }
    return getConversation(existing.id, userId, { limit: 50, offset: 0 });
  }

  const conversation = await withTransaction(async (client) => {
    const created = await messageModel.createConversation({ opportunityId }, client);
    await messageModel.addParticipant(created.id, userId, client);
    await messageModel.addParticipant(created.id, participantId, client);

    if (initialMessage) {
      await messageModel.createMessage(
        { conversationId: created.id, senderId: userId, content: initialMessage },
        client,
      );
    }

    return created;
  });

  if (shouldNotifyOffline(participantId)) {
    const notification = await notificationModel.create({
      userId: participantId,
      type: 'message',
      title: 'New conversation',
      message: initialMessage?.slice(0, 120) ?? 'You have a new message',
      data: { conversationId: conversation.id },
    });
    broadcastToUser(participantId, 'notification:new', notification);
  }

  return getConversation(conversation.id, userId, { limit: 50, offset: 0 });
}

export async function sendMessage(conversationId, senderId, content, options = {}) {
  const { realtime = false } = options;

  const conversation = await messageModel.findById(conversationId, senderId);
  if (!conversation) throw forbidden('Conversation not found');

  const message = await messageModel.createMessage({
    conversationId,
    senderId,
    content,
  });

  const enriched = await messageModel.listMessages(conversationId, { limit: 1, offset: 0 });
  const mapped = mapMessage(enriched.rows[enriched.rows.length - 1] ?? message);
  const recipients = await messageModel.getOtherParticipants(conversationId, senderId);

  if (realtime) {
    emitReceiveMessage(conversationId, recipients, mapped);
  }

  await Promise.all(
    recipients.map(async (recipientId) => {
      if (!shouldNotifyOffline(recipientId)) return;

      const notification = await notificationModel.create({
        userId: recipientId,
        type: 'message',
        title: 'New message',
        message: content.slice(0, 120),
        data: { conversationId, messageId: message.id },
      });
      broadcastToUser(recipientId, 'notification:new', notification);
    }),
  );

  return mapped;
}

export async function markConversationRead(conversationId, userId, options = {}) {
  const { realtime = false } = options;

  const conversation = await messageModel.findById(conversationId, userId);
  if (!conversation) throw forbidden('Conversation not found');

  await messageModel.markConversationRead(conversationId, userId);

  const readPayload = {
    conversationId,
    userId,
    readAt: new Date().toISOString(),
  };

  if (realtime) {
    emitMessageRead(conversationId, readPayload);
  }

  return { read: true, ...readPayload };
}

export { mapMessage, mapConversation };
