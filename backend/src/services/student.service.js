import * as userModel from '../models/user.model.js';
import * as applicationModel from '../models/application.model.js';
import * as opportunityModel from '../models/opportunity.model.js';
import { notFound } from '../utils/errors.js';

function computeProfileStrength(profile) {
  let score = 25;
  if (profile.headline) score += 10;
  if (profile.bio) score += 15;
  if (profile.skills?.length >= 3) score += 20;
  if (profile.portfolio_url) score += 15;
  if (profile.avatar_url) score += 10;
  if (profile.location) score += 5;
  return Math.min(100, score);
}

function mapStudentProfile(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    headline: row.headline,
    bio: row.bio,
    skills: row.skills ?? [],
    portfolioUrl: row.portfolio_url,
    avatarUrl: row.avatar_url,
    location: row.location,
    profileStrength: row.profile_strength,
    hustleScore: row.hustle_score,
    totalEarnings: Number(row.total_earnings),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(userId) {
  const profile = await userModel.getStudentProfile(userId);
  if (!profile) throw notFound('Student profile not found');
  return mapStudentProfile(profile);
}

export async function getPublicProfile(userId) {
  const profile = await userModel.getPublicStudentProfile(userId);
  if (!profile) throw notFound('Student profile not found');
  return {
    userId: profile.user_id,
    fullName: profile.full_name,
    headline: profile.headline,
    bio: profile.bio,
    skills: profile.skills ?? [],
    portfolioUrl: profile.portfolio_url,
    avatarUrl: profile.avatar_url,
    location: profile.location,
    profileStrength: profile.profile_strength,
    hustleScore: profile.hustle_score,
    memberSince: profile.created_at,
  };
}

export async function updateProfile(userId, payload) {
  const fields = {
    full_name: payload.fullName,
    headline: payload.headline,
    bio: payload.bio,
    skills: payload.skills,
    portfolio_url: payload.portfolioUrl,
    avatar_url: payload.avatarUrl,
    location: payload.location,
  };

  Object.keys(fields).forEach((key) => {
    if (fields[key] === undefined) delete fields[key];
  });

  const current = await userModel.getStudentProfile(userId);
  if (!current) throw notFound('Student profile not found');

  const merged = { ...current, ...fields };
  fields.profile_strength = computeProfileStrength(merged);

  const updated = await userModel.updateStudentProfile(userId, fields);
  return mapStudentProfile({ ...updated, email: current.email });
}

export async function getDashboard(userId) {
  const profile = await getProfile(userId);
  const applicationStats = await applicationModel.getStudentStats(userId);
  const recommended = await opportunityModel.findRecommendedForStudent(
    userId,
    profile.skills,
  );

  return {
    profile,
    stats: {
      applied: applicationStats.total,
      pending: applicationStats.pending,
      inReview: applicationStats.in_review,
      interview: applicationStats.interview,
      hired: applicationStats.hired,
    },
    recommendedOpportunities: recommended.map(mapOpportunity),
    totalEarnings: profile.totalEarnings,
  };
}

export function mapOpportunity(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    budgetMin: Number(row.budget_min),
    budgetMax: Number(row.budget_max),
    workMode: row.work_mode,
    status: row.status,
    skillsRequired: row.skills_required ?? [],
    deadline: row.deadline,
    companyName: row.company_name,
    clientLogo: row.client_logo,
    applicationCount: row.application_count,
    isDemo: row.is_demo ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
