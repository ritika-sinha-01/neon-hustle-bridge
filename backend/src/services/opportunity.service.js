import * as opportunityModel from '../models/opportunity.model.js';
import * as applicationModel from '../models/application.model.js';
import { mapApplication } from './client.service.js';
import { notFound, forbidden, badRequest } from '../utils/errors.js';
import { mapOpportunity } from './student.service.js';

export async function createOpportunity(clientId, payload) {
  if (Number(payload.budgetMax) < Number(payload.budgetMin)) {
    throw badRequest('budgetMax must be greater than or equal to budgetMin');
  }

  const created = await opportunityModel.create({
    clientId,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    budgetMin: payload.budgetMin,
    budgetMax: payload.budgetMax,
    workMode: payload.workMode,
    status: payload.status,
    skillsRequired: payload.skillsRequired,
    deadline: payload.deadline,
  });

  return mapOpportunity(created);
}

export async function getOpportunity(id, user = null) {
  const opportunity = await opportunityModel.findById(id);
  if (!opportunity) throw notFound('Opportunity not found');

  if (opportunity.status === 'draft' && user?.id !== opportunity.client_id) {
    throw forbidden('Draft opportunities are only visible to the owner');
  }

  return mapOpportunity(opportunity);
}

export async function listOpportunities(filters, pagination) {
  const { rows, total } = await opportunityModel.list(filters, pagination);
  return {
    opportunities: rows.map(mapOpportunity),
    total,
  };
}

export async function updateOpportunity(id, clientId, payload) {
  if (payload.budgetMin != null && payload.budgetMax != null) {
    if (Number(payload.budgetMax) < Number(payload.budgetMin)) {
      throw badRequest('budgetMax must be greater than or equal to budgetMin');
    }
  }

  const fields = {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    budget_min: payload.budgetMin,
    budget_max: payload.budgetMax,
    work_mode: payload.workMode,
    status: payload.status,
    skills_required: payload.skillsRequired,
    deadline: payload.deadline,
  };

  Object.keys(fields).forEach((key) => {
    if (fields[key] === undefined) delete fields[key];
  });

  const updated = await opportunityModel.update(id, clientId, fields);
  if (!updated) throw notFound('Opportunity not found or access denied');
  return mapOpportunity(updated);
}

export async function deleteOpportunity(id, clientId) {
  const deleted = await opportunityModel.remove(id, clientId);
  if (!deleted) throw notFound('Opportunity not found or access denied');
  return { deleted: true };
}

export async function listOpportunityApplications(opportunityId, clientId, pagination) {
  const opportunity = await opportunityModel.findById(opportunityId);
  if (!opportunity) throw notFound('Opportunity not found');
  if (opportunity.client_id !== clientId) {
    throw forbidden('You can only view applications for your own opportunities');
  }

  const { rows, total } = await applicationModel.listByOpportunity(
    opportunityId,
    clientId,
    pagination,
  );

  return { applications: rows.map(mapApplication), total };
}
