import { query } from '../config/database.js';

const APPLICATION_SELECT = `
  SELECT a.*,
         o.title AS opportunity_title,
         o.category AS opportunity_category,
         o.budget_min,
         o.budget_max,
         o.client_id,
         cp.company_name,
         sp.full_name AS student_name,
         sp.avatar_url AS student_avatar
  FROM applications a
  JOIN opportunities o ON o.id = a.opportunity_id
  JOIN client_profiles cp ON cp.user_id = o.client_id
  JOIN student_profiles sp ON sp.user_id = a.student_id
`;

export async function create({ opportunityId, studentId, coverLetter }) {
  const result = await query(
    `INSERT INTO applications (opportunity_id, student_id, cover_letter)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [opportunityId, studentId, coverLetter],
  );
  return findById(result.rows[0].id);
}

export async function findById(id) {
  const result = await query(`${APPLICATION_SELECT} WHERE a.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function findByStudentAndOpportunity(studentId, opportunityId) {
  const result = await query(
    `SELECT * FROM applications WHERE student_id = $1 AND opportunity_id = $2`,
    [studentId, opportunityId],
  );
  return result.rows[0] ?? null;
}

export async function listByStudent(studentId, { limit, offset }) {
  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM applications WHERE student_id = $1`,
    [studentId],
  );

  const result = await query(
    `${APPLICATION_SELECT}
     WHERE a.student_id = $1
     ORDER BY a.created_at DESC
     LIMIT $2 OFFSET $3`,
    [studentId, limit, offset],
  );

  return { rows: result.rows, total: countResult.rows[0].total };
}

export async function listByOpportunity(opportunityId, clientId, { limit, offset }) {
  const countResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM applications a
     JOIN opportunities o ON o.id = a.opportunity_id
     WHERE a.opportunity_id = $1 AND o.client_id = $2`,
    [opportunityId, clientId],
  );

  const result = await query(
    `${APPLICATION_SELECT}
     WHERE a.opportunity_id = $1 AND o.client_id = $2
     ORDER BY a.created_at DESC
     LIMIT $3 OFFSET $4`,
    [opportunityId, clientId, limit, offset],
  );

  return { rows: result.rows, total: countResult.rows[0].total };
}

export async function listByClient(clientId, { limit, offset }) {
  const countResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM applications a
     JOIN opportunities o ON o.id = a.opportunity_id
     WHERE o.client_id = $1`,
    [clientId],
  );

  const result = await query(
    `${APPLICATION_SELECT}
     WHERE o.client_id = $1
     ORDER BY a.created_at DESC
     LIMIT $2 OFFSET $3`,
    [clientId, limit, offset],
  );

  return { rows: result.rows, total: countResult.rows[0].total };
}

export async function updateStatus(id, status, actorId, actorRole) {
  let sql = `${APPLICATION_SELECT} WHERE a.id = $1`;
  const params = [id];

  if (actorRole === 'student') {
    sql = `
      UPDATE applications SET status = $2
      WHERE id = $1 AND student_id = $3 AND status IN ('pending', 'in_review')
      RETURNING id
    `;
    const result = await query(sql, [id, status, actorId]);
    if (!result.rows[0]) return null;
    return findById(id);
  }

  const result = await query(
    `UPDATE applications a SET status = $2
     FROM opportunities o
     WHERE a.id = $1
       AND a.opportunity_id = o.id
       AND o.client_id = $3
     RETURNING a.id`,
    [id, status, actorId],
  );

  if (!result.rows[0]) return null;
  return findById(id);
}

export async function getStudentStats(studentId) {
  const result = await query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
       COUNT(*) FILTER (WHERE status = 'in_review')::int AS in_review,
       COUNT(*) FILTER (WHERE status = 'interview')::int AS interview,
       COUNT(*) FILTER (WHERE status = 'hired')::int AS hired,
       COUNT(*)::int AS total
     FROM applications WHERE student_id = $1`,
    [studentId],
  );
  return result.rows[0];
}

export async function getClientStats(clientId) {
  const result = await query(
    `SELECT
       COUNT(DISTINCT o.id)::int AS total_opportunities,
       COUNT(a.id) FILTER (WHERE a.status = 'pending')::int AS pending_applications,
       COUNT(a.id) FILTER (WHERE a.status = 'in_review')::int AS in_review_applications,
       COUNT(a.id) FILTER (WHERE a.status = 'hired')::int AS hired_count
     FROM opportunities o
     LEFT JOIN applications a ON a.opportunity_id = o.id
     WHERE o.client_id = $1`,
    [clientId],
  );
  return result.rows[0];
}
