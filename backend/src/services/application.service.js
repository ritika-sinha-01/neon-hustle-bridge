import * as applicationModel from '../models/application.model.js';
import * as opportunityModel from '../models/opportunity.model.js';
import * as notificationModel from '../models/notification.model.js';
import { badRequest, notFound, forbidden, conflict } from '../utils/errors.js';
import { mapApplication } from './client.service.js';

export async function submitApplication(studentId, { opportunityId, coverLetter }) {
  const opportunity = await opportunityModel.findById(opportunityId);
  if (!opportunity) throw notFound('Opportunity not found');
  if (opportunity.status !== 'open') {
    throw badRequest('This opportunity is not accepting applications');
  }

  const existing = await applicationModel.findByStudentAndOpportunity(studentId, opportunityId);
  if (existing) {
    throw conflict('You have already applied to this opportunity');
  }

  const application = await applicationModel.create({
    opportunityId,
    studentId,
    coverLetter,
  });

  await notificationModel.create({
    userId: opportunity.client_id,
    type: 'application_received',
    title: 'New application received',
    message: `A student applied to "${opportunity.title}"`,
    data: {
      applicationId: application.id,
      opportunityId,
      studentId,
    },
  });

  return mapApplication(application);
}

export async function getApplication(id, user) {
  const application = await applicationModel.findById(id);
  if (!application) throw notFound('Application not found');

  const isStudent = user.role === 'student' && application.student_id === user.id;
  const isOwner = user.role === 'client' && application.client_id === user.id;

  if (!isStudent && !isOwner) {
    throw forbidden('Access denied');
  }

  return mapApplication(application);
}

export async function listMyApplications(studentId, pagination) {
  const { rows, total } = await applicationModel.listByStudent(studentId, pagination);
  return {
    applications: rows.map(mapApplication),
    total,
  };
}

export async function updateApplicationStatus(id, user, status) {
  if (user.role === 'student' && status !== 'withdrawn') {
    throw forbidden('Students can only withdraw applications');
  }

  const current = await applicationModel.findById(id);
  if (!current) throw notFound('Application not found');

  const updated = await applicationModel.updateStatus(id, status, user.id, user.role);
  if (!updated) {
    throw forbidden('Unable to update application status');
  }

  const notifyUserId = user.role === 'client' ? current.student_id : current.client_id;
  await notificationModel.create({
    userId: notifyUserId,
    type: 'application_status',
    title: 'Application status updated',
    message: `Application for "${current.opportunity_title}" is now ${status.replace('_', ' ')}`,
    data: {
      applicationId: id,
      opportunityId: current.opportunity_id,
      status,
    },
  });

  return mapApplication(updated);
}

export async function getStudentApplicationStats(studentId) {
  return applicationModel.getStudentStats(studentId);
}
