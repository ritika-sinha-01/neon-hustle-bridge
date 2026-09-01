import { pool } from '../config/database.js';
import { hashPassword } from '../utils/jwt.js';
import * as userModel from '../models/user.model.js';
import * as opportunityModel from '../models/opportunity.model.js';

const DEMO_PASSWORD = 'DemoPass1';

const DEMO_ACCOUNTS = [
  {
    email: 'demo.student@hustlebridge.local',
    role: 'student',
    profile: { fullName: 'Demo Student' },
    studentExtras: {
      headline: 'Full-stack developer exploring freelance projects',
      bio: 'Demo student account for recruiter walkthroughs.',
      skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
      profile_strength: 75,
      location: 'Remote, India',
    },
  },
  {
    email: 'demo.client@hustlebridge.local',
    role: 'client',
    profile: { companyName: 'Demo Ventures Pvt Ltd' },
    clientExtras: {
      industry: 'Technology',
      description: 'Demo client account for posting and reviewing opportunities.',
      website: 'https://demo.hustlebridge.local',
      location: 'Bengaluru, India',
    },
  },
];

const DEMO_OPPORTUNITIES = [
  {
    title: 'React Developer for Startup Landing Page',
    description:
      'Build a responsive marketing website for an early-stage startup. Includes hero sections, pricing, and contact forms.',
    category: 'Web Development',
    budgetMin: 15000,
    budgetMax: 25000,
    workMode: 'remote',
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS'],
    daysUntilDeadline: 21,
  },
  {
    title: 'AI Chatbot Integration for Customer Support',
    description:
      'Integrate an AI chatbot into an existing customer support workflow with API hooks and fallback to human agents.',
    category: 'AI / Machine Learning',
    budgetMin: 25000,
    budgetMax: 40000,
    workMode: 'remote',
    skillsRequired: ['Python', 'APIs', 'LLM', 'FastAPI'],
    daysUntilDeadline: 30,
  },
  {
    title: 'UI/UX Designer for Mobile App',
    description:
      'Design a modern mobile application experience with onboarding, dashboard, and settings flows in Figma.',
    category: 'Design',
    budgetMin: 10000,
    budgetMax: 20000,
    workMode: 'remote',
    skillsRequired: ['Figma', 'UI/UX', 'Prototyping'],
    daysUntilDeadline: 18,
  },
  {
    title: 'Backend API Development',
    description:
      'Develop and document REST APIs for a SaaS platform including authentication, CRUD endpoints, and pagination.',
    category: 'Backend Development',
    budgetMin: 20000,
    budgetMax: 35000,
    workMode: 'hybrid',
    skillsRequired: ['Node.js', 'Express', 'PostgreSQL'],
    daysUntilDeadline: 28,
  },
  {
    title: 'Data Analysis Dashboard',
    description:
      'Build an analytics dashboard from business datasets with filters, charts, and exportable reports.',
    category: 'Data Science',
    budgetMin: 18000,
    budgetMax: 30000,
    workMode: 'remote',
    skillsRequired: ['Python', 'Pandas', 'SQL', 'Power BI'],
    daysUntilDeadline: 25,
  },
  {
    title: 'Android App Feature Development',
    description:
      'Implement new features in an existing Android application including offline sync and push notifications.',
    category: 'Mobile Development',
    budgetMin: 20000,
    budgetMax: 35000,
    workMode: 'remote',
    skillsRequired: ['Android', 'Kotlin', 'REST APIs'],
    daysUntilDeadline: 35,
  },
  {
    title: 'E-commerce Website Optimization',
    description:
      'Improve performance and user experience of an existing e-commerce website. Focus on Core Web Vitals and checkout flow.',
    category: 'Web Development',
    budgetMin: 12000,
    budgetMax: 22000,
    workMode: 'remote',
    skillsRequired: ['React', 'JavaScript', 'Performance Optimization'],
    daysUntilDeadline: 20,
  },
  {
    title: 'QA Automation Engineer Intern',
    description:
      'Create automated regression tests for a web application covering UI flows and API endpoints.',
    category: 'QA / Testing',
    budgetMin: 15000,
    budgetMax: 25000,
    workMode: 'remote',
    skillsRequired: ['Java', 'Selenium', 'API Testing', 'Postman'],
    daysUntilDeadline: 22,
  },
  {
    title: 'Social Media Content Designer',
    description:
      'Create social media graphics and short-form content templates for a technology startup brand.',
    category: 'Design / Marketing',
    budgetMin: 8000,
    budgetMax: 15000,
    workMode: 'remote',
    skillsRequired: ['Canva', 'Figma', 'Photoshop'],
    daysUntilDeadline: 14,
  },
  {
    title: 'Full Stack Developer for SaaS MVP',
    description:
      'Build features for an early-stage SaaS product including user onboarding, billing hooks, and admin panel.',
    category: 'Full Stack Development',
    budgetMin: 30000,
    budgetMax: 50000,
    workMode: 'hybrid',
    skillsRequired: ['React', 'Node.js', 'PostgreSQL'],
    daysUntilDeadline: 45,
  },
];

function deadlineFromDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

async function ensureDemoUser(account, passwordHash) {
  let user = await userModel.findByEmail(account.email);

  if (!user) {
    user = await userModel.create({
      email: account.email,
      passwordHash,
      role: account.role,
    });

    if (account.role === 'student') {
      await userModel.createStudentProfile(user.id, account.profile);
      await userModel.updateStudentProfile(user.id, account.studentExtras);
    } else {
      await userModel.createClientProfile(user.id, account.profile);
      await userModel.updateClientProfile(user.id, account.clientExtras);
    }

    console.log(`[seed] created ${account.role}`, account.email);
  }

  await pool.query('UPDATE users SET is_demo = TRUE WHERE id = $1', [user.id]);
  return user;
}

async function upsertDemoOpportunity(clientId, sample) {
  const existing = await pool.query(
    'SELECT id FROM opportunities WHERE title = $1 AND client_id = $2',
    [sample.title, clientId],
  );

  const deadline = deadlineFromDays(sample.daysUntilDeadline);

  if (existing.rows.length) {
    await pool.query(
      `UPDATE opportunities
       SET description = $1, category = $2, budget_min = $3, budget_max = $4,
           work_mode = $5, skills_required = $6, deadline = $7,
           status = 'open', is_demo = TRUE, updated_at = NOW()
       WHERE id = $8`,
      [
        sample.description,
        sample.category,
        sample.budgetMin,
        sample.budgetMax,
        sample.workMode,
        sample.skillsRequired,
        deadline,
        existing.rows[0].id,
      ],
    );
    return existing.rows[0].id;
  }

  const created = await opportunityModel.create({
    clientId,
    title: sample.title,
    description: sample.description,
    category: sample.category,
    budgetMin: sample.budgetMin,
    budgetMax: sample.budgetMax,
    workMode: sample.workMode,
    status: 'open',
    skillsRequired: sample.skillsRequired,
    deadline,
  });

  await pool.query('UPDATE opportunities SET is_demo = TRUE WHERE id = $1', [created.id]);
  console.log(`[seed] created opportunity "${sample.title}"`);
  return created.id;
}

async function seed() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const studentAccount = DEMO_ACCOUNTS.find((a) => a.role === 'student');
  const clientAccount = DEMO_ACCOUNTS.find((a) => a.role === 'client');

  await ensureDemoUser(studentAccount, passwordHash);
  const client = await ensureDemoUser(clientAccount, passwordHash);

  let created = 0;
  for (const sample of DEMO_OPPORTUNITIES) {
    const id = await upsertDemoOpportunity(client.id, sample);
    if (id) created += 1;
  }

  const countResult = await pool.query(
    "SELECT COUNT(*)::int AS total FROM opportunities WHERE is_demo = TRUE AND status = 'open'",
  );

  console.log('[seed] complete');
  console.log(`[seed] demo opportunities (open): ${countResult.rows[0].total}`);
  console.log('[seed] demo credentials (for recruiter demos only):');
  console.log(`  student -> ${studentAccount.email} / ${DEMO_PASSWORD}`);
  console.log(`  client  -> ${clientAccount.email} / ${DEMO_PASSWORD}`);
  console.log('[seed] run: cd backend && npm run db:migrate && npm run db:seed');

  await pool.end();
}

seed().catch((error) => {
  console.error('[seed] failed', error);
  process.exit(1);
});
