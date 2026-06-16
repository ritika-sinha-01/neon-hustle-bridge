import { body, param, query } from 'express-validator';

export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
  body('role').isIn(['student', 'client']).withMessage('Role must be student or client'),
  body('fullName')
    .if(body('role').equals('student'))
    .trim()
    .notEmpty()
    .withMessage('Full name is required for students'),
  body('companyName')
    .if(body('role').equals('client'))
    .trim()
    .notEmpty()
    .withMessage('Company name is required for clients'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const refreshValidation = [body('refreshToken').notEmpty()];

export const updateStudentProfileValidation = [
  body('fullName').optional().trim().isLength({ min: 2, max: 120 }),
  body('headline').optional().trim().isLength({ max: 200 }),
  body('bio').optional().trim().isLength({ max: 2000 }),
  body('skills').optional().isArray({ max: 30 }),
  body('skills.*').optional().trim().isLength({ min: 1, max: 50 }),
  body('portfolioUrl').optional({ values: 'null' }).isURL(),
  body('avatarUrl').optional({ values: 'null' }).isURL(),
  body('location').optional().trim().isLength({ max: 120 }),
];

export const updateClientProfileValidation = [
  body('companyName').optional().trim().isLength({ min: 2, max: 200 }),
  body('industry').optional().trim().isLength({ max: 120 }),
  body('website').optional({ values: 'null' }).isURL(),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('logoUrl').optional({ values: 'null' }).isURL(),
  body('location').optional().trim().isLength({ max: 120 }),
];

export const createOpportunityValidation = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty().isLength({ max: 5000 }),
  body('category').trim().notEmpty().isLength({ max: 80 }),
  body('budgetMin').isFloat({ min: 0 }),
  body('budgetMax').isFloat({ min: 0 }),
  body('workMode').optional().isIn(['remote', 'hybrid', 'onsite']),
  body('status').optional().isIn(['draft', 'open', 'closed', 'filled']),
  body('skillsRequired').optional().isArray({ max: 20 }),
  body('skillsRequired.*').optional().trim().isLength({ min: 1, max: 50 }),
  body('deadline').optional({ values: 'null' }).isISO8601(),
];

export const updateOpportunityValidation = [
  param('id').isUUID(),
  ...createOpportunityValidation.map((rule) => rule.optional()),
];

export const opportunityIdValidation = [param('id').isUUID()];

export const listOpportunitiesValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().trim(),
  query('workMode').optional().isIn(['remote', 'hybrid', 'onsite']),
  query('status').optional().isIn(['draft', 'open', 'closed', 'filled']),
  query('search').optional().trim().isLength({ max: 100 }),
  query('minBudget').optional().isFloat({ min: 0 }),
  query('maxBudget').optional().isFloat({ min: 0 }),
];

export const createApplicationValidation = [
  body('opportunityId').isUUID(),
  body('coverLetter').trim().notEmpty().isLength({ max: 3000 }),
];

export const updateApplicationStatusValidation = [
  param('id').isUUID(),
  body('status').isIn(['pending', 'in_review', 'interview', 'hired', 'rejected', 'withdrawn']),
];

export const applicationIdValidation = [param('id').isUUID()];

export const createConversationValidation = [
  body('participantId').isUUID(),
  body('opportunityId').optional().isUUID(),
  body('initialMessage').optional().trim().isLength({ max: 2000 }),
];

export const sendMessageValidation = [
  param('id').isUUID(),
  body('content').trim().notEmpty().isLength({ max: 2000 }),
];

export const conversationIdValidation = [param('id').isUUID()];

export const notificationIdValidation = [param('id').isUUID()];

export const uuidParamValidation = [param('id').isUUID()];

export const listPaginationValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

export const generateOutreachValidation = [
  body('opportunityId').isUUID().withMessage('Valid opportunityId is required'),
  body('type')
    .isIn(['proposal', 'cold_email', 'linkedin', 'whatsapp'])
    .withMessage('type must be proposal, cold_email, linkedin, or whatsapp'),
];
