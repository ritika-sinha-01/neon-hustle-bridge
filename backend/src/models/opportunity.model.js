import { query } from '../config/database.js';

const OPPORTUNITY_SELECT = `
  SELECT o.*,
         cp.company_name,
         cp.logo_url AS client_logo,
         (SELECT COUNT(*)::int FROM applications a WHERE a.opportunity_id = o.id) AS application_count
  FROM opportunities o
  JOIN client_profiles cp ON cp.user_id = o.client_id
`;

export async function create(data) {
  const result = await query(
    `INSERT INTO opportunities (
       client_id, title, description, category,
       budget_min, budget_max, work_mode, status, skills_required, deadline
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.clientId,
      data.title,
      data.description,
      data.category,
      data.budgetMin,
      data.budgetMax,
      data.workMode ?? 'remote',
      data.status ?? 'open',
      data.skillsRequired ?? [],
      data.deadline ?? null,
    ],
  );
  return findById(result.rows[0].id);
}

export async function findById(id) {
  const result = await query(`${OPPORTUNITY_SELECT} WHERE o.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function update(id, clientId, fields) {
  const allowed = [
    'title', 'description', 'category', 'budget_min', 'budget_max',
    'work_mode', 'status', 'skills_required', 'deadline',
  ];
  const sets = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(fields)) {
    const column = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    if (allowed.includes(column)) {
      sets.push(`${column} = $${idx++}`);
      values.push(value);
    }
  }

  if (!sets.length) return findById(id);

  values.push(id, clientId);
  const result = await query(
    `UPDATE opportunities SET ${sets.join(', ')}
     WHERE id = $${idx} AND client_id = $${idx + 1}
     RETURNING id`,
    values,
  );

  if (!result.rows[0]) return null;
  return findById(id);
}

export async function remove(id, clientId) {
  const result = await query(
    `DELETE FROM opportunities WHERE id = $1 AND client_id = $2 RETURNING id`,
    [id, clientId],
  );
  return result.rows[0] ?? null;
}

export async function list(filters, { limit, offset }) {
  const conditions = ['1=1'];
  const values = [];
  let idx = 1;

  if (filters.status) {
    conditions.push(`o.status = $${idx++}`);
    values.push(filters.status);
  } else if (!filters.includeDraft) {
    conditions.push(`o.status = 'open'`);
  }

  if (filters.category) {
    conditions.push(`o.category ILIKE $${idx++}`);
    values.push(`%${filters.category}%`);
  }

  if (filters.workMode) {
    conditions.push(`o.work_mode = $${idx++}`);
    values.push(filters.workMode);
  }

  if (filters.clientId) {
    conditions.push(`o.client_id = $${idx++}`);
    values.push(filters.clientId);
  }

  if (filters.search) {
    conditions.push(`(o.title ILIKE $${idx} OR o.description ILIKE $${idx})`);
    values.push(`%${filters.search}%`);
    idx += 1;
  }

  if (filters.minBudget != null) {
    conditions.push(`o.budget_max >= $${idx++}`);
    values.push(filters.minBudget);
  }

  if (filters.maxBudget != null) {
    conditions.push(`o.budget_min <= $${idx++}`);
    values.push(filters.maxBudget);
  }

  const where = conditions.join(' AND ');
  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM opportunities o WHERE ${where}`,
    values,
  );

  values.push(limit, offset);
  const result = await query(
    `${OPPORTUNITY_SELECT}
     WHERE ${where}
     ORDER BY o.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    values,
  );

  return { rows: result.rows, total: countResult.rows[0].total };
}

export async function findRecommendedForStudent(studentId, skills, limit = 8) {
  const result = await query(
    `${OPPORTUNITY_SELECT}
     WHERE o.status = 'open'
       AND NOT EXISTS (
         SELECT 1 FROM applications a
         WHERE a.opportunity_id = o.id AND a.student_id = $1
       )
     ORDER BY
       CASE WHEN o.skills_required && $2::text[] THEN 1 ELSE 0 END DESC,
       o.created_at DESC
     LIMIT $3`,
    [studentId, skills ?? [], limit],
  );
  return result.rows;
}
