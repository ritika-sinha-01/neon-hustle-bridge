import { query } from '../config/database.js';

export async function findById(id) {
  const result = await query(
    `SELECT id, email, role, is_active, last_login_at, created_at, updated_at
     FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] ?? null;
}

export async function create({ email, passwordHash, role }, client = null) {
  const executor = client ?? { query };
  const result = await executor.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role, is_active, created_at, updated_at`,
    [email, passwordHash, role],
  );
  return result.rows[0];
}

export async function updateLastLogin(userId) {
  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);
}

export async function createStudentProfile(userId, { fullName }, client = null) {
  const executor = client ?? { query };
  const result = await executor.query(
    `INSERT INTO student_profiles (user_id, full_name, profile_strength)
     VALUES ($1, $2, 25)
     RETURNING *`,
    [userId, fullName],
  );
  return result.rows[0];
}

export async function createClientProfile(userId, { companyName }, client = null) {
  const executor = client ?? { query };
  const result = await executor.query(
    `INSERT INTO client_profiles (user_id, company_name)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, companyName],
  );
  return result.rows[0];
}

export async function getStudentProfile(userId) {
  const result = await query(
    `SELECT sp.*, u.email, u.role
     FROM student_profiles sp
     JOIN users u ON u.id = sp.user_id
     WHERE sp.user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function getClientProfile(userId) {
  const result = await query(
    `SELECT cp.*, u.email, u.role
     FROM client_profiles cp
     JOIN users u ON u.id = cp.user_id
     WHERE cp.user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function getPublicStudentProfile(userId) {
  const result = await query(
    `SELECT user_id, full_name, headline, bio, skills, portfolio_url,
            avatar_url, location, profile_strength, hustle_score, created_at
     FROM student_profiles WHERE user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function updateStudentProfile(userId, fields) {
  const allowed = ['full_name', 'headline', 'bio', 'skills', 'portfolio_url', 'avatar_url', 'location', 'profile_strength'];
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

  if (!sets.length) return getStudentProfile(userId);

  values.push(userId);
  const result = await query(
    `UPDATE student_profiles SET ${sets.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0];
}

export async function updateClientProfile(userId, fields) {
  const allowed = ['company_name', 'industry', 'website', 'description', 'logo_url', 'location'];
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

  if (!sets.length) return getClientProfile(userId);

  values.push(userId);
  const result = await query(
    `UPDATE client_profiles SET ${sets.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0];
}
