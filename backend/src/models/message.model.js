import { query } from '../config/database.js';

export async function createConversation({ opportunityId = null }, client) {
  const executor = client ?? { query };
  const result = await executor.query(
    `INSERT INTO conversations (opportunity_id) VALUES ($1) RETURNING *`,
    [opportunityId],
  );
  return result.rows[0];
}

export async function addParticipant(conversationId, userId, client) {
  const executor = client ?? { query };
  await executor.query(
    `INSERT INTO conversation_participants (conversation_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [conversationId, userId],
  );
}

export async function findConversationBetween(userA, userB, opportunityId = null) {
  const result = await query(
    `SELECT c.*
     FROM conversations c
     JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = $1
     JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = $2
     WHERE ($3::uuid IS NULL OR c.opportunity_id = $3)
     ORDER BY c.updated_at DESC
     LIMIT 1`,
    [userA, userB, opportunityId],
  );
  return result.rows[0] ?? null;
}

export async function findById(conversationId, userId) {
  const result = await query(
    `SELECT c.*
     FROM conversations c
     JOIN conversation_participants cp ON cp.conversation_id = c.id
     WHERE c.id = $1 AND cp.user_id = $2`,
    [conversationId, userId],
  );
  return result.rows[0] ?? null;
}

export async function listForUser(userId, { limit, offset }) {
  const countResult = await query(
    `SELECT COUNT(DISTINCT c.id)::int AS total
     FROM conversations c
     JOIN conversation_participants cp ON cp.conversation_id = c.id
     WHERE cp.user_id = $1`,
    [userId],
  );

  const result = await query(
    `SELECT c.*,
            (
              SELECT row_to_json(m)
              FROM (
                SELECT msg.id, msg.content, msg.sender_id, msg.created_at
                FROM messages msg
                WHERE msg.conversation_id = c.id
                ORDER BY msg.created_at DESC
                LIMIT 1
              ) m
            ) AS last_message,
            (
              SELECT COUNT(*)::int
              FROM messages msg
              LEFT JOIN conversation_participants cp_read
                ON cp_read.conversation_id = c.id AND cp_read.user_id = $1
              WHERE msg.conversation_id = c.id
                AND msg.sender_id != $1
                AND msg.created_at > COALESCE(cp_read.last_read_at, '1970-01-01'::timestamptz)
            ) AS unread_count,
            (
              SELECT json_agg(json_build_object(
                'userId', cp2.user_id,
                'fullName', COALESCE(sp.full_name, cp3.company_name),
                'avatarUrl', COALESCE(sp.avatar_url, cp3.logo_url),
                'role', u.role
              ))
              FROM conversation_participants cp2
              JOIN users u ON u.id = cp2.user_id
              LEFT JOIN student_profiles sp ON sp.user_id = cp2.user_id
              LEFT JOIN client_profiles cp3 ON cp3.user_id = cp2.user_id
              WHERE cp2.conversation_id = c.id AND cp2.user_id != $1
            ) AS participants
     FROM conversations c
     JOIN conversation_participants cp ON cp.conversation_id = c.id
     WHERE cp.user_id = $1
     ORDER BY c.updated_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return { rows: result.rows, total: countResult.rows[0].total };
}

export async function listMessages(conversationId, { limit, offset }) {
  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM messages WHERE conversation_id = $1`,
    [conversationId],
  );

  const result = await query(
    `SELECT m.*,
            COALESCE(sp.full_name, cp.company_name) AS sender_name,
            COALESCE(sp.avatar_url, cp.logo_url) AS sender_avatar
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     LEFT JOIN student_profiles sp ON sp.user_id = m.sender_id
     LEFT JOIN client_profiles cp ON cp.user_id = m.sender_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at ASC
     LIMIT $2 OFFSET $3`,
    [conversationId, limit, offset],
  );

  return { rows: result.rows, total: countResult.rows[0].total };
}

export async function createMessage({ conversationId, senderId, content }, client) {
  const executor = client ?? { query };
  const result = await executor.query(
    `INSERT INTO messages (conversation_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [conversationId, senderId, content],
  );

  await executor.query(
    `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
    [conversationId],
  );

  return result.rows[0];
}

export async function markConversationRead(conversationId, userId) {
  await query(
    `UPDATE conversation_participants
     SET last_read_at = NOW()
     WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId],
  );
}

export async function getOtherParticipants(conversationId, userId) {
  const result = await query(
    `SELECT user_id FROM conversation_participants
     WHERE conversation_id = $1 AND user_id != $2`,
    [conversationId, userId],
  );
  return result.rows.map((row) => row.user_id);
}

export async function getParticipants(conversationId) {
  const result = await query(
    `SELECT user_id FROM conversation_participants WHERE conversation_id = $1`,
    [conversationId],
  );
  return result.rows.map((row) => row.user_id);
}

export async function listPartnerUserIds(userId) {
  const result = await query(
    `SELECT DISTINCT cp2.user_id
     FROM conversation_participants cp1
     JOIN conversation_participants cp2
       ON cp2.conversation_id = cp1.conversation_id AND cp2.user_id != $1
     WHERE cp1.user_id = $1`,
    [userId],
  );
  return result.rows.map((row) => row.user_id);
}

export async function getParticipantsEnriched(conversationId, excludeUserId = null) {
  const values = [conversationId];
  let excludeClause = '';

  if (excludeUserId) {
    values.push(excludeUserId);
    excludeClause = 'AND cp.user_id != $2';
  }

  const result = await query(
    `SELECT cp.user_id,
            cp.last_read_at,
            u.role,
            COALESCE(sp.full_name, cl.company_name) AS full_name,
            COALESCE(sp.avatar_url, cl.logo_url) AS avatar_url
     FROM conversation_participants cp
     JOIN users u ON u.id = cp.user_id
     LEFT JOIN student_profiles sp ON sp.user_id = cp.user_id
     LEFT JOIN client_profiles cl ON cl.user_id = cp.user_id
     WHERE cp.conversation_id = $1 ${excludeClause}
     ORDER BY cp.joined_at ASC`,
    values,
  );

  return result.rows;
}
