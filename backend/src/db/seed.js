import { pool } from '../config/database.js';
import { hashPassword } from '../utils/jwt.js';
import * as userModel from '../models/user.model.js';
import * as opportunityModel from '../models/opportunity.model.js';

async function seed() {
  const passwordHash = await hashPassword('Password1');

  const studentEmail = 'arjun@hustlebridge.dev';
  const clientEmail = 'techlearn@hustlebridge.dev';

  let student = await userModel.findByEmail(studentEmail);
  let client = await userModel.findByEmail(clientEmail);

  if (!student) {
    student = await userModel.create({
      email: studentEmail,
      passwordHash,
      role: 'student',
    });
    await userModel.createStudentProfile(student.id, { fullName: 'Arjun Sharma' });
    await userModel.updateStudentProfile(student.id, {
      headline: 'Full-stack developer & UI enthusiast',
      bio: 'Building products for startups while finishing my degree.',
      skills: ['React', 'Node.js', 'Figma', 'TypeScript'],
      profile_strength: 85,
      location: 'Bangalore, IN',
    });
    console.log('[seed] created student', studentEmail);
  }

  if (!client) {
    client = await userModel.create({
      email: clientEmail,
      passwordHash,
      role: 'client',
    });
    await userModel.createClientProfile(client.id, { companyName: 'TechLearn Academy' });
    await userModel.updateClientProfile(client.id, {
      industry: 'EdTech',
      description: 'Online coaching institute hiring student freelancers.',
      website: 'https://techlearn.example.com',
    });
    console.log('[seed] created client', clientEmail);
  }

  const existing = await pool.query(
    'SELECT id FROM opportunities WHERE client_id = $1 LIMIT 1',
    [client.id],
  );

  if (!existing.rows.length) {
    const samples = [
      {
        title: 'Build a Responsive Website for Coaching Institute',
        description: 'Need a modern responsive website with course listings and payment integration.',
        category: 'Web Development',
        budgetMin: 8000,
        budgetMax: 15000,
        skillsRequired: ['HTML', 'CSS', 'React'],
      },
      {
        title: 'Social Media Content Creator',
        description: 'Create Instagram reels and carousel posts for our brand.',
        category: 'Marketing',
        budgetMin: 5000,
        budgetMax: 10000,
        skillsRequired: ['SMM', 'Content Creation'],
      },
      {
        title: 'Mobile App UI/UX for Fitness Startup',
        description: 'Design end-to-end mobile app flows in Figma.',
        category: 'Design',
        budgetMin: 12000,
        budgetMax: 20000,
        skillsRequired: ['Figma', 'UI/UX'],
      },
    ];

    for (const sample of samples) {
      await opportunityModel.create({
        clientId: client.id,
        ...sample,
        workMode: 'remote',
        status: 'open',
      });
    }

    console.log('[seed] created sample opportunities');
  }

  console.log('[seed] complete');
  console.log('[seed] demo credentials:');
  console.log('  student ->', studentEmail, '/ Password1');
  console.log('  client  ->', clientEmail, '/ Password1');

  await pool.end();
}

seed().catch((error) => {
  console.error('[seed] failed', error);
  process.exit(1);
});
