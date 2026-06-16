import { query } from '../config/database.js';

export async function create({ userId, type, title, message, data = {} }) {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, message, data)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, type, title, message, JSON.stringify(data)],
  );
  return result.rows[0];
}

export async function listByUser(userId, { limit, offset, unreadOnly = false }) {
  const conditions = ['user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (unreadOnly) {
    conditions.push('is_read = FALSE');
  }

  const where = conditions.join(' AND ');
  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM notifications WHERE ${where}`,
    values,
  );

  values.push(limit, offset);
  const result = await query(
    `SELECT * FROM notifications
     WHERE ${where}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    values,
  );

  return { rows: result.rows, total: countResult.rows[0].total };
}

export async function markRead(id, userId) {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId],
  );
  return result.rows[0] ?? null;
}

export async function markAllRead(userId) {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE user_id = $1 AND is_read = FALSE
     RETURNING id`,
    [userId],
  );
  return result.rowCount;
}

export async function remove(id, userId) {
  const result = await query(
    `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  );
  return result.rows[0] ?? null;
}

export async function countUnread(userId) {
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM notifications
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId],
  );
  return result.rows[0].count;
}
