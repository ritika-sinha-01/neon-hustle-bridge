import { withTransaction } from '../config/database.js';
import * as messageModel from '../models/message.model.js';
import * as notificationModel from '../models/notification.model.js';
import * as userModel from '../models/user.model.js';
import { notFound, badRequest, forbidden } from '../utils/errors.js';

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

function mapConversation(row) {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    lastMessage: row.last_message,
    unreadCount: row.unread_count,
    participants: row.participants ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listConversations(userId, pagination) {
  const { rows, total } = await messageModel.listForUser(userId, pagination);
  return {
    conversations: rows.map(mapConversation),
    total,
  };
}

export async function getConversation(conversationId, userId, pagination) {
  const conversation = await messageModel.findById(conversationId, userId);
  if (!conversation) throw notFound('Conversation not found');

  const { rows, total } = await messageModel.listMessages(conversationId, pagination);
  await messageModel.markConversationRead(conversationId, userId);

  return {
    conversation: mapConversation({ ...conversation, unread_count: 0, participants: [] }),
    messages: rows.map(mapMessage),
    total,
  };
}

export async function createConversation(userId, { participantId, opportunityId, initialMessage }) {
  if (userId === participantId) {
    throw badRequest('Cannot start a conversation with yourself');
  }

  const participant = await userModel.findById(participantId);
  if (!participant) throw notFound('Participant not found');

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

  await notificationModel.create({
    userId: participantId,
    type: 'message',
    title: 'New conversation',
    message: initialMessage?.slice(0, 120) ?? 'You have a new message',
    data: { conversationId: conversation.id },
  });

  return getConversation(conversation.id, userId, { limit: 50, offset: 0 });
}

export async function sendMessage(conversationId, senderId, content) {
  const conversation = await messageModel.findById(conversationId, senderId);
  if (!conversation) throw notFound('Conversation not found');

  const message = await messageModel.createMessage({
    conversationId,
    senderId,
    content,
  });

  const recipients = await messageModel.getOtherParticipants(conversationId, senderId);
  await Promise.all(
    recipients.map((userId) =>
      notificationModel.create({
        userId,
        type: 'message',
        title: 'New message',
        message: content.slice(0, 120),
        data: { conversationId, messageId: message.id },
      }),
    ),
  );

  const enriched = await messageModel.listMessages(conversationId, { limit: 1, offset: 0 });
  return mapMessage(enriched.rows[enriched.rows.length - 1] ?? message);
}

export async function markConversationRead(conversationId, userId) {
  const conversation = await messageModel.findById(conversationId, userId);
  if (!conversation) throw forbidden('Conversation not found');

  await messageModel.markConversationRead(conversationId, userId);
  return { read: true };
}

export { mapMessage, mapConversation };
