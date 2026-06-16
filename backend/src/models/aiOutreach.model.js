import { query } from '../config/database.js';

const OUTREACH_SELECT = `
  SELECT ao.*,
         o.title AS opportunity_title,
         o.category AS opportunity_category,
         cp.company_name
  FROM ai_outreach ao
  JOIN opportunities o ON o.id = ao.opportunity_id
  JOIN client_profiles cp ON cp.user_id = o.client_id
`;

export async function create({ studentId, opportunityId, type, generatedText }) {
  const result = await query(
    `INSERT INTO ai_outreach (student_id, opportunity_id, type, generated_text)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [studentId, opportunityId, type, generatedText],
  );
  return findById(result.rows[0].id);
}

export async function findById(id) {
  const result = await query(`${OUTREACH_SELECT} WHERE ao.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function listByStudent(studentId, { limit, offset }) {
  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM ai_outreach WHERE student_id = $1`,
    [studentId],
  );

  const result = await query(
    `${OUTREACH_SELECT}
     WHERE ao.student_id = $1
     ORDER BY ao.created_at DESC
     LIMIT $2 OFFSET $3`,
    [studentId, limit, offset],
  );

  return { rows: result.rows, total: countResult.rows[0].total };
}
