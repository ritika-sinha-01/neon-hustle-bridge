import { GoogleGenerativeAI } from '@google/generative-ai';

import { env } from '../config/env.js';
import * as userModel from '../models/user.model.js';
import * as opportunityModel from '../models/opportunity.model.js';
import * as aiOutreachModel from '../models/aiOutreach.model.js';
import { AppError, notFound, badRequest } from '../utils/errors.js';
import {
  FALLBACK_MODEL,
  generateLocalOutreach,
} from './localOutreach.service.js';

const GEMINI_MODEL = 'gemini-2.0-flash';

const OUTREACH_TYPES = ['proposal', 'cold_email', 'linkedin', 'whatsapp'];

const TYPE_INSTRUCTIONS = {
  proposal: `Write a professional freelance proposal for a marketplace application.
Structure: greeting, understanding of the project, relevant experience/skills match,
approach to delivery, timeline estimate, and a confident closing call-to-action.
Tone: polished, confident, client-focused. Length: 200-350 words.`,

  cold_email: `Write a cold outreach email to a business owner who posted this opportunity.
Structure: compelling subject line on the first line prefixed with "Subject: ",
personalized opening, value proposition, brief proof of capability,
and a soft call-to-action to reply or schedule a call.
Tone: professional but warm, not salesy. Length: 150-250 words.`,

  linkedin: `Write a LinkedIn connection request or direct message to the hiring contact.
Keep it concise, personalized, and reference the specific opportunity.
No generic templates. Include a clear reason to connect.
Tone: professional, approachable. Length: under 300 characters if possible, max 500 characters.`,

  whatsapp: `Write a short WhatsApp outreach message to a potential client about this opportunity.
Keep it casual-professional, friendly, and direct. Use short sentences.
Include a greeting and one clear ask. No bullet points.
Tone: conversational, respectful. Length: 2-4 short sentences, under 100 words.`,
};

function mapOutreach(row) {
  if (!row) return null;
  return {
    id: row.id,
    studentId: row.student_id,
    opportunityId: row.opportunity_id,
    opportunityTitle: row.opportunity_title,
    opportunityCategory: row.opportunity_category,
    companyName: row.company_name,
    type: row.type,
    generatedText: row.generated_text,
    model: row.model,
    createdAt: row.created_at,
  };
}

function buildPrompt(type, profile, opportunity) {
  const skills = (profile.skills ?? []).join(', ') || 'Not specified';
  const skillsRequired = (opportunity.skills_required ?? []).join(', ') || 'Not specified';
  const budget = `₹${Number(opportunity.budget_min).toLocaleString('en-IN')} - ₹${Number(opportunity.budget_max).toLocaleString('en-IN')}`;

  const studentContext = `
Student Profile:
- Name: ${profile.full_name}
- Headline: ${profile.headline ?? 'Freelance professional'}
- Bio: ${profile.bio ?? 'Not provided'}
- Skills: ${skills}
- Location: ${profile.location ?? 'Not specified'}
- Portfolio: ${profile.portfolio_url ?? 'Not provided'}
`.trim();

  const opportunityContext = `
Opportunity Details:
- Title: ${opportunity.title}
- Company: ${opportunity.company_name}
- Category: ${opportunity.category}
- Description: ${opportunity.description}
- Required Skills: ${skillsRequired}
- Budget: ${budget}
- Work Mode: ${opportunity.work_mode}
`.trim();

  return `
You are an expert outreach copywriter for HustleBridge, a student freelancer marketplace.

${TYPE_INSTRUCTIONS[type]}

Use the student profile and opportunity details below to write highly personalized content.
Highlight skill overlap where relevant. Do not invent credentials not implied by the profile.
Do not include placeholder brackets like [Name] — use actual details provided.
Return only the outreach message text, no preamble or explanation.

${studentContext}

${opportunityContext}
`.trim();
}

function getGeminiClient() {
  if (!env.geminiApiKey) {
    throw new AppError(
      'AI service is not configured. Set GEMINI_API_KEY in environment.',
      503,
      'AI_NOT_CONFIGURED',
    );
  }
  return new GoogleGenerativeAI(env.geminiApiKey);
}

function collectErrorText(error) {
  const details = error?.details;
  const detailMessage = typeof details === 'string' ? details : details?.message;

  const parts = [
    error?.message,
    detailMessage,
    error?.statusText,
    error?.cause?.message,
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function isGeminiFallbackError(error) {
  if (!(error instanceof AppError)) return false;

  if (error.code === 'AI_NOT_CONFIGURED') return true;

  if (error.code !== 'AI_GENERATION_FAILED' && error.code !== 'AI_EMPTY_RESPONSE') {
    return false;
  }

  const text = collectErrorText(error);
  const details = error.details;
  const status = typeof details === 'object' && details !== null
    ? details.status
    : null;

  if (status === 429 || status === 403 || status === 401 || status === 404) {
    return true;
  }

  return (
    text.includes('429')
    || text.includes('quota')
    || text.includes('rate limit')
    || text.includes('rate-limit')
    || text.includes('resource exhausted')
    || text.includes('too many requests')
    || text.includes('permission denied')
    || text.includes('api key')
    || text.includes('invalid api key')
    || text.includes('not found')
    || text.includes('models/')
    || text.includes('model is not')
    || text.includes('model not found')
    || text.includes('does not exist')
    || text.includes('access')
  );
}

async function generateWithGemini(prompt) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim();

    if (!text) {
      throw new AppError('AI returned an empty response', 502, 'AI_EMPTY_RESPONSE');
    }

    return { text, model: GEMINI_MODEL };
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(
      'Failed to generate outreach content',
      502,
      'AI_GENERATION_FAILED',
      {
        message: error.message,
        status: error.status ?? error.statusCode ?? null,
      },
    );
  }
}

export async function generateOutreach(studentId, { opportunityId, type }) {
  if (!OUTREACH_TYPES.includes(type)) {
    throw badRequest(
      `Invalid outreach type. Supported: ${OUTREACH_TYPES.join(', ')}`,
      'INVALID_OUTREACH_TYPE',
    );
  }

  const profile = await userModel.getStudentProfile(studentId);
  if (!profile) {
    throw notFound('Student profile not found');
  }

  const opportunity = await opportunityModel.findById(opportunityId);
  if (!opportunity) {
    throw notFound('Opportunity not found');
  }

  if (opportunity.status !== 'open') {
    throw badRequest('Outreach can only be generated for open opportunities');
  }

  const prompt = buildPrompt(type, profile, opportunity);

  let generatedText;
  let model;

  try {
    const result = await generateWithGemini(prompt);
    generatedText = result.text;
    model = result.model;
  } catch (error) {
    if (!isGeminiFallbackError(error)) throw error;

    generatedText = generateLocalOutreach(type, profile, opportunity);
    model = FALLBACK_MODEL;
  }

  const saved = await aiOutreachModel.create({
    studentId,
    opportunityId,
    type,
    generatedText,
    model,
  });

  return mapOutreach(saved);
}

export async function getOutreachHistory(studentId, pagination) {
  const { rows, total } = await aiOutreachModel.listByStudent(studentId, pagination);
  return {
    history: rows.map(mapOutreach),
    total,
  };
}
