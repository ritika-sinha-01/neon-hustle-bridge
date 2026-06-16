import * as userModel from '../models/user.model.js';
import * as applicationModel from '../models/application.model.js';
import * as opportunityModel from '../models/opportunity.model.js';
import { notFound } from '../utils/errors.js';
import { mapOpportunity } from './student.service.js';

function mapClientProfile(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    email: row.email,
    companyName: row.company_name,
    industry: row.industry,
    website: row.website,
    description: row.description,
    logoUrl: row.logo_url,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(userId) {
  const profile = await userModel.getClientProfile(userId);
  if (!profile) throw notFound('Client profile not found');
  return mapClientProfile(profile);
}

export async function updateProfile(userId, payload) {
  const fields = {
    company_name: payload.companyName,
    industry: payload.industry,
    website: payload.website,
    description: payload.description,
    logo_url: payload.logoUrl,
    location: payload.location,
  };

  Object.keys(fields).forEach((key) => {
    if (fields[key] === undefined) delete fields[key];
  });

  const current = await userModel.getClientProfile(userId);
  if (!current) throw notFound('Client profile not found');

  const updated = await userModel.updateClientProfile(userId, fields);
  return mapClientProfile({ ...updated, email: current.email });
}

export async function getDashboard(userId) {
  const profile = await getProfile(userId);
  const stats = await applicationModel.getClientStats(userId);
  const { rows: recentOpportunities } = await opportunityModel.list(
    { clientId: userId, includeDraft: true },
    { limit: 5, offset: 0 },
  );

  return {
    profile,
    stats: {
      totalOpportunities: stats.total_opportunities,
      pendingApplications: stats.pending_applications,
      inReviewApplications: stats.in_review_applications,
      hiredCount: stats.hired_count,
    },
    recentOpportunities: recentOpportunities.map(mapOpportunity),
  };
}

export async function listApplicants(userId, { page, limit, offset }) {
  const { rows, total } = await applicationModel.listByClient(userId, { limit, offset });
  return {
    applicants: rows.map(mapApplication),
    total,
    page,
    limit,
  };
}

function mapApplication(row) {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    opportunityTitle: row.opportunity_title,
    opportunityCategory: row.opportunity_category,
    studentId: row.student_id,
    studentName: row.student_name,
    studentAvatar: row.student_avatar,
    coverLetter: row.cover_letter,
    status: row.status,
    budgetMin: Number(row.budget_min),
    budgetMax: Number(row.budget_max),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export { mapApplication };
