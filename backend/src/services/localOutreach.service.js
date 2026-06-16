const FALLBACK_MODEL = 'local-template-fallback';

function firstName(fullName) {
  return fullName?.trim().split(/\s+/)[0] ?? 'there';
}

function formatBudget(opportunity) {
  const min = Number(opportunity.budget_min).toLocaleString('en-IN');
  const max = Number(opportunity.budget_max).toLocaleString('en-IN');
  return `₹${min} - ₹${max}`;
}

function normalizeSkill(skill) {
  return skill.trim().toLowerCase();
}

function getMatchingSkills(profileSkills, requiredSkills) {
  const profileSet = new Set((profileSkills ?? []).map(normalizeSkill));
  return (requiredSkills ?? []).filter((skill) => profileSet.has(normalizeSkill(skill)));
}

function pickSkills(profile, opportunity) {
  const matching = getMatchingSkills(profile.skills, opportunity.skills_required);
  if (matching.length > 0) return matching;
  return (profile.skills ?? []).slice(0, 4);
}

function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text ?? '';
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function summarizeDescription(description, maxLength = 160) {
  const cleaned = (description ?? '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'the requirements you outlined';
  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0];
  return truncate(firstSentence, maxLength);
}

function workModeLabel(workMode) {
  const labels = {
    remote: 'remote',
    hybrid: 'hybrid',
    onsite: 'on-site',
  };
  return labels[workMode] ?? workMode ?? 'flexible';
}

function buildContext(profile, opportunity) {
  const skills = pickSkills(profile, opportunity);
  const matchingSkills = getMatchingSkills(profile.skills, opportunity.skills_required);
  const headline = profile.headline?.trim() || 'freelance professional';
  const company = opportunity.company_name?.trim() || 'your team';
  const title = opportunity.title?.trim() || 'this project';
  const category = opportunity.category?.trim() || 'freelance';
  const bio = profile.bio?.trim();
  const portfolio = profile.portfolio_url?.trim();
  const location = profile.location?.trim();
  const budget = formatBudget(opportunity);
  const workMode = workModeLabel(opportunity.work_mode);
  const descriptionSummary = summarizeDescription(opportunity.description);

  return {
    name: profile.full_name?.trim() || 'Student Freelancer',
    first: firstName(profile.full_name),
    headline,
    company,
    title,
    category,
    bio,
    portfolio,
    location,
    budget,
    workMode,
    skills,
    matchingSkills,
    skillsText: skills.length > 0 ? skills.join(', ') : 'relevant project delivery',
    matchingSkillsText:
      matchingSkills.length > 0 ? matchingSkills.join(', ') : skills.join(', ') || 'your required skills',
    descriptionSummary,
  };
}

function generateProposal(ctx) {
  const bioLine = ctx.bio
    ? `${ctx.bio.split(/(?<=[.!?])\s+/)[0]}`
    : `I bring hands-on experience in ${ctx.skillsText} and a strong focus on quality delivery.`;

  const portfolioLine = ctx.portfolio ? `\nPortfolio: ${ctx.portfolio}` : '';
  const locationLine = ctx.location ? `\n${ctx.location}` : '';

  return `Dear ${ctx.company} Team,

Thank you for posting "${ctx.title}" on HustleBridge. I am ${ctx.name}, ${ctx.headline}, and I would like to submit my proposal for this ${ctx.category} opportunity.

Understanding Your Project
${ctx.descriptionSummary} Your budget range of ${ctx.budget} and ${ctx.workMode} work mode align well with how I typically engage on projects like this.

Why I Am a Strong Fit
${bioLine} My skills in ${ctx.matchingSkillsText} map closely to what you are looking for, and I am confident I can add value from day one.

My Approach
I would start with a brief alignment call to confirm scope and milestones, then deliver in clear phases with regular updates. I prioritize transparent communication, realistic timelines, and outcomes that match your expectations.

Next Steps
I am available to begin soon and would welcome the chance to discuss timelines, deliverables, and any questions you may have about my fit for this role.

Best regards,
${ctx.name}${portfolioLine}${locationLine}`.trim();
}

function generateColdEmail(ctx) {
  const subjectSkill = ctx.matchingSkills[0] ?? ctx.skills[0] ?? ctx.category;
  const bioSnippet = ctx.bio ? truncate(ctx.bio, 120) : `I work across ${ctx.skillsText} with a client-first mindset.`;
  const portfolioLine = ctx.portfolio ? `\nPortfolio: ${ctx.portfolio}` : '';

  return `Subject: ${ctx.title} — ${ctx.first} | ${subjectSkill} specialist

Hi ${ctx.company} team,

I noticed your posting for "${ctx.title}" and wanted to reach out directly. I am ${ctx.name}, ${ctx.headline}, and your project caught my attention because it aligns with my experience in ${ctx.matchingSkillsText}.

${bioSnippet} Given your ${ctx.workMode} setup and budget of ${ctx.budget}, I believe I can help you move this forward efficiently while keeping quality high.

Would you be open to a quick 15-minute call this week to see if we are a good fit?

Best regards,
${ctx.name}${portfolioLine}`.trim();
}

function generateLinkedIn(ctx) {
  const message = `Hi, I saw your "${ctx.title}" opening at ${ctx.company}. I am ${ctx.first}, ${ctx.headline}, with experience in ${ctx.matchingSkillsText}. Would love to connect and discuss how I can support this ${ctx.category} project.`;
  return truncate(message, 500);
}

function generateWhatsApp(ctx) {
  return `Hi! I am ${ctx.first}, ${ctx.headline}. I came across your post for "${ctx.title}" at ${ctx.company} and think my background in ${ctx.matchingSkillsText} could be a great fit for this ${ctx.workMode} project. Would you have a few minutes to chat about it?`;
}

const GENERATORS = {
  proposal: generateProposal,
  cold_email: generateColdEmail,
  linkedin: generateLinkedIn,
  whatsapp: generateWhatsApp,
};

export function generateLocalOutreach(type, profile, opportunity) {
  const ctx = buildContext(profile, opportunity);
  const generator = GENERATORS[type];
  return generator(ctx);
}

export { FALLBACK_MODEL };
