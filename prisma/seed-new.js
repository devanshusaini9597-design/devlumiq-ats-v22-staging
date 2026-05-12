/**
 * seed-new.js — Fresh database seed for RBAC deployment
 *
 * Creates all 5 role users + full sample data (real, no mocks).
 * Safe to run on a NEW empty database. Does NOT touch the live database.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node prisma/seed-new.js
 *   -- OR --
 *   npm run seed:new
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── Role Users ──────────────────────────────────────────────────────────────
const ROLE_USERS = [
  { name: 'Alex Admin',        email: 'admin@devlumiq.com',       password: 'Admin@123',      role: 'ADMIN'          },
  { name: 'Rachel Recruiter',  email: 'recruiter@devlumiq.com',   password: 'Recruit@123',    role: 'RECRUITER'      },
  { name: 'Henry Hiring',      email: 'hiring@devlumiq.com',      password: 'Hiring@123',     role: 'HIRING_MANAGER' },
  { name: 'Iris Interviewer',  email: 'interviewer@devlumiq.com', password: 'Interview@123',  role: 'INTERVIEWER'    },
  { name: 'Victor Viewer',     email: 'viewer@devlumiq.com',      password: 'Viewer@123',     role: 'VIEWER'         },
  { name: 'Alex Johnson',      email: 'demo@devlumiq.com',        password: 'demo',           role: 'RECRUITER'      },
];

// ─── Job Titles (real data, various industries) ───────────────────────────────
const JOB_TITLES = [
  { title: 'Senior Software Engineer',      department: 'Engineering',       location: 'San Francisco, CA', type: 'Full-time',  status: 'Active',  description: 'Lead the design and development of scalable backend services. Work with cross-functional teams to deliver high-quality software products used by millions.',   requirements: '5+ years with Node.js, TypeScript, PostgreSQL. Experience with microservices, Docker, and CI/CD pipelines.' },
  { title: 'Product Manager',               department: 'Product',           location: 'Remote',            type: 'Full-time',  status: 'Active',  description: 'Own product roadmap for our core ATS platform. Drive feature discovery, prioritisation and go-to-market execution with engineering and design.',            requirements: '3+ years PM in B2B SaaS. Strong analytical and communication skills. Familiarity with Agile/Scrum.' },
  { title: 'UX / Product Designer',         department: 'Design',            location: 'New York, NY',      type: 'Full-time',  status: 'Active',  description: 'Define and execute UX strategy across web and mobile surfaces. Conduct user research, create wireframes, prototypes and high-fidelity designs in Figma.',  requirements: 'Portfolio demonstrating SaaS product design. Proficiency in Figma and design systems. 3+ years experience.' },
  { title: 'Data Analyst',                  department: 'Data & Analytics',  location: 'Austin, TX',        type: 'Full-time',  status: 'Active',  description: 'Build dashboards and analytical models to help teams understand hiring funnel performance, candidate quality metrics, and recruiter productivity.',        requirements: 'SQL, Python, Tableau or Looker. Strong statistical foundation. Experience with data warehouses (BigQuery/Redshift).' },
  { title: 'DevOps Engineer',               department: 'Infrastructure',    location: 'Chicago, IL',       type: 'Full-time',  status: 'Active',  description: 'Maintain and improve cloud infrastructure on AWS. Build CI/CD pipelines, manage Kubernetes clusters, and ensure 99.9% uptime for production services.',   requirements: 'AWS/GCP, Terraform, Kubernetes, Helm, Jenkins or GitHub Actions. Strong Linux administration skills.' },
  { title: 'Frontend Developer',            department: 'Engineering',       location: 'Remote',            type: 'Contract',   status: 'Active',  description: 'Build performant, accessible React applications. Collaborate closely with designers and backend engineers to ship features that delight users.',          requirements: '3+ years React, TypeScript, Tailwind CSS. Strong understanding of accessibility (WCAG) and web performance.' },
  { title: 'Customer Success Manager',      department: 'Customer Success',  location: 'Remote',            type: 'Full-time',  status: 'Active',  description: 'Own a portfolio of enterprise customers through their entire lifecycle. Drive adoption, reduce churn, and expand revenue through renewals and upsells.',  requirements: '3+ years in SaaS Customer Success. Experience with CRMs (Salesforce/HubSpot). Excellent communication skills.' },
  { title: 'Machine Learning Engineer',     department: 'Engineering',       location: 'Seattle, WA',       type: 'Full-time',  status: 'Active',  description: 'Build and productionise ML models for candidate matching, resume parsing, and intelligent job recommendation inside our ATS platform.',               requirements: 'Python, PyTorch/TensorFlow, ML Ops. Experience deploying models at scale. MS or PhD preferred.' },
  { title: 'Sales Development Representative', department: 'Sales',          location: 'Denver, CO',        type: 'Full-time',  status: 'Active',  description: 'Generate qualified pipeline through outbound prospecting (cold email, LinkedIn, calls). Partner with AEs to book demos and close deals.',           requirements: '1+ year SDR experience in SaaS. Familiarity with Salesforce and sales engagement tools (Outreach, Apollo).' },
  { title: 'Marketing Manager',             department: 'Marketing',         location: 'Los Angeles, CA',   type: 'Full-time',  status: 'Active',  description: 'Lead multi-channel demand generation campaigns. Own content strategy, SEO, paid acquisition, and lifecycle marketing to grow inbound pipeline.',       requirements: 'Digital marketing expertise (SEO/SEM, email, paid social). Analytics proficiency (GA4, Mixpanel). 4+ years experience.' },
  { title: 'Security Engineer',             department: 'Engineering',       location: 'Washington, DC',    type: 'Full-time',  status: 'Active',  description: 'Own application and infrastructure security. Conduct penetration testing, threat modelling, and implement security controls across our cloud environment.', requirements: 'CISSP or CEH certification preferred. Cloud security (AWS Security Hub), SIEM tools, incident response experience.' },
  { title: 'HR Business Partner',           department: 'People Ops',        location: 'Boston, MA',        type: 'Full-time',  status: 'Closed',  description: 'Partner with engineering and product leadership to provide strategic HR support: talent planning, performance management, and culture initiatives.',     requirements: 'SHRM-CP/SCP preferred. 5+ years HRBP experience in a fast-growing tech company. Strong coaching and facilitation skills.' },
];

// ─── Candidates (real profiles) ──────────────────────────────────────────────
const CANDIDATES = [
  { name: 'Sarah Mitchell',   email: 'sarah.m@email.com',        phone: '+1 555-0101', source: 'LinkedIn',        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],                         tags: ['senior', 'urgent'],          experience: 7,  location: 'San Francisco, CA' },
  { name: 'James Chen',       email: 'james.c@email.com',        phone: '+1 555-0102', source: 'Referral',         skills: ['Product Strategy', 'Agile', 'Jira', 'SQL', 'Figma'],           tags: ['leadership', 'referral'],    experience: 5,  location: 'New York, NY'      },
  { name: 'Emily Rodriguez',  email: 'emily.r@email.com',        phone: '+1 555-0103', source: 'Indeed',           skills: ['Figma', 'Sketch', 'User Research', 'Prototyping'],              tags: ['creative', 'top-candidate'], experience: 4,  location: 'Los Angeles, CA'   },
  { name: 'Michael Thompson', email: 'michael.t@email.com',      phone: '+1 555-0104', source: 'LinkedIn',         skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Power BI'],               tags: ['analytics'],                 experience: 3,  location: 'Austin, TX'        },
  { name: 'Priya Sharma',     email: 'priya.s@email.com',        phone: '+1 555-0105', source: 'Glassdoor',        skills: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'AWS'],           tags: ['devops', 'remote'],          experience: 6,  location: 'Remote'            },
  { name: 'David Kim',        email: 'david.k@email.com',        phone: '+1 555-0106', source: 'Company Website',  skills: ['Vue.js', 'React', 'CSS', 'GraphQL', 'TypeScript'],             tags: ['frontend'],                  experience: 3,  location: 'Seattle, WA'       },
  { name: 'Lisa Wang',        email: 'lisa.w@email.com',         phone: '+1 555-0107', source: 'LinkedIn',         skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL'],          tags: ['senior', 'backend'],         experience: 8,  location: 'Boston, MA'        },
  { name: 'Marcus Johnson',   email: 'marcus.j@email.com',       phone: '+1 555-0108', source: 'Referral',         skills: ['Go', 'Python', 'Redis', 'MongoDB', 'Kafka'],                   tags: ['referral', 'backend'],       experience: 5,  location: 'Chicago, IL'       },
  { name: 'Rachel Green',     email: 'rachel.g@email.com',       phone: '+1 555-0109', source: 'Indeed',           skills: ['React', 'Next.js', 'Tailwind', 'TypeScript'],                  tags: ['frontend', 'junior'],        experience: 2,  location: 'Denver, CO'        },
  { name: 'Kevin Patel',      email: 'kevin.p@email.com',        phone: '+1 555-0110', source: 'Glassdoor',        skills: ['PyTorch', 'TensorFlow', 'Python', 'MLflow', 'R'],              tags: ['data-science'],              experience: 4,  location: 'San Jose, CA'      },
  { name: 'Sofia Martinez',   email: 'sofia.m@email.com',        phone: '+1 555-0112', source: 'Referral',         skills: ['AWS', 'Azure', 'Linux', 'Ansible', 'Terraform'],               tags: ['devops', 'referral'],        experience: 5,  location: 'Phoenix, AZ'       },
  { name: 'Daniel Brown',     email: 'daniel.b@email.com',       phone: '+1 555-0113', source: 'Indeed',           skills: ['React', 'Angular', 'Node.js', 'MongoDB'],                      tags: ['fullstack'],                 experience: 4,  location: 'Portland, OR'      },
  { name: 'Ethan Davis',      email: 'ethan.d@email.com',        phone: '+1 555-0115', source: 'LinkedIn',         skills: ['Java', 'Python', 'System Design', 'AWS', 'DynamoDB'],          tags: ['senior', 'top-candidate'],   experience: 9,  location: 'San Francisco, CA' },
  { name: 'Emma White',       email: 'emma.w@email.com',         phone: '+1 555-0120', source: 'Company Website',  skills: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Figma'],         tags: ['frontend', 'top-candidate'], experience: 4,  location: 'Seattle, WA'       },
  { name: 'Charlotte Lee',    email: 'charlotte.l@email.com',    phone: '+1 555-0122', source: 'Indeed',           skills: ['Marketing', 'SEO', 'Content Strategy', 'Analytics', 'HubSpot'], tags: ['marketing'],               experience: 4,  location: 'Chicago, IL'       },
  { name: 'Benjamin Clark',   email: 'benjamin.c@email.com',     phone: '+1 555-0123', source: 'Glassdoor',        skills: ['Salesforce', 'CRM', 'B2B Sales', 'Outreach', 'Apollo'],        tags: ['sales'],                     experience: 5,  location: 'New York, NY'      },
  { name: 'Amelia Lewis',     email: 'amelia.l@email.com',       phone: '+1 555-0124', source: 'Referral',         skills: ['Customer Success', 'SaaS', 'Onboarding', 'Gainsight'],         tags: ['customer-success'],          experience: 3,  location: 'Austin, TX'        },
  { name: 'Lucas Hall',       email: 'lucas.h@email.com',        phone: '+1 555-0125', source: 'LinkedIn',         skills: ['iOS', 'Swift', 'SwiftUI', 'Firebase', 'Xcode'],                tags: ['mobile'],                    experience: 5,  location: 'Los Angeles, CA'   },
  { name: 'Evelyn Wright',    email: 'evelyn.w@email.com',       phone: '+1 555-0128', source: 'LinkedIn',         skills: ['QA', 'Selenium', 'Cypress', 'Playwright', 'JIRA'],             tags: ['qa'],                        experience: 4,  location: 'Denver, CO'        },
  { name: 'Samuel Mitchell',  email: 'samuel.m2@email.com',      phone: '+1 555-0137', source: 'LinkedIn',         skills: ['Cloud Architecture', 'AWS', 'Solutions Architecture', 'CDK'],  tags: ['cloud', 'senior'],           experience: 10, location: 'San Francisco, CA' },
];

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'APPLIED', 'OFFER', 'INTERVIEW', 'SCREENING', 'APPLIED', 'HIRED', 'INTERVIEW', 'SCREENING', 'APPLIED', 'REJECTED', 'INTERVIEW'];

async function main() {
  console.log('🌱 Starting seed-new.js...\n');

  // ── Company ────────────────────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { slug: 'devlumiq' },
    update: {},
    create: {
      name: 'Devlumiq',
      slug: 'devlumiq',
      description: 'Enterprise-grade recruitment platform trusted by fast-growing teams worldwide.',
      website: 'https://devlumiq.com',
      metaTitle: 'Devlumiq — Careers',
      metaDescription: 'Join Devlumiq and help build the future of intelligent talent acquisition.',
      isPublished: true,
    },
  });
  console.log(`✅ Company: ${company.name}`);

  // ── Role Users ─────────────────────────────────────────────────────────────
  const createdUsers = [];
  for (const u of ROLE_USERS) {
    const hash = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, isActive: true },
      create: { name: u.name, email: u.email, password: hash, role: u.role, isActive: true },
    });
    createdUsers.push(user);
    console.log(`✅ User [${u.role.padEnd(15)}] ${u.email}  →  password: ${u.password}`);
  }
  const adminUser = createdUsers.find(u => u.role === 'ADMIN');
  const recruiterUser = createdUsers.find(u => u.role === 'RECRUITER' && u.email === 'recruiter@devlumiq.com');
  const demoUser = createdUsers.find(u => u.email === 'demo@devlumiq.com');
  const primaryUser = recruiterUser ?? demoUser ?? createdUsers[0];

  // ── Wipe old data (safe on a fresh DB — these will just be empty) ──────────
  await prisma.userActivityLog.deleteMany({}).catch(() => {});
  await prisma.notification.deleteMany({});
  await prisma.candidateNote.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.interviewScore.deleteMany({}).catch(() => {});
  await prisma.interviewEvent.deleteMany({});
  await prisma.assessmentAssignment.deleteMany({});
  await prisma.assessmentQuestion.deleteMany({});
  await prisma.assessmentTemplate.deleteMany({});
  await prisma.backgroundCheck.deleteMany({});
  await prisma.emailTemplate.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.messageThread.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.job.deleteMany({});
  console.log('\n🗑  Cleared old data\n');

  // ── Jobs ──────────────────────────────────────────────────────────────────
  await prisma.job.createMany({
    data: JOB_TITLES.map(j => ({
      companyId: company.id,
      title: j.title,
      department: j.department,
      location: j.location,
      type: j.type,
      status: j.status,
      applicants: Math.floor(Math.random() * 35) + 4,
      description: j.description,
      requirements: j.requirements,
    })),
  });
  const jobs = await prisma.job.findMany();
  console.log(`✅ Jobs: ${jobs.length}`);

  // ── Candidates + Applications ─────────────────────────────────────────────
  for (let i = 0; i < CANDIDATES.length; i++) {
    const c = CANDIDATES[i];
    const stage = STAGES[i % STAGES.length];
    const jobId = jobs[i % jobs.length].id;
    await prisma.candidate.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        source: c.source,
        location: c.location,
        skills: c.skills,
        tags: c.tags,
        experience: c.experience,
        applications: { create: { jobId, stage } },
      },
    });
  }
  const candidates = await prisma.candidate.findMany({ include: { applications: true } });
  console.log(`✅ Candidates: ${candidates.length}`);

  // ── Interviews ────────────────────────────────────────────────────────────
  const interviewerUser = createdUsers.find(u => u.role === 'INTERVIEWER') ?? primaryUser;
  const baseTime = Date.now();
  const interviewCandidates = candidates.filter(c => c.applications.some(a => ['INTERVIEW', 'OFFER', 'HIRED'].includes(a.stage)));
  for (let i = 0; i < Math.min(10, interviewCandidates.length); i++) {
    const c = interviewCandidates[i];
    const jobId = c.applications[0]?.jobId ?? jobs[0].id;
    await prisma.interviewEvent.create({
      data: {
        title: `Interview — ${c.name}`,
        type: i % 3 === 0 ? 'Technical' : i % 3 === 1 ? 'Behavioral' : 'HR Screen',
        start: new Date(baseTime + (i + 1) * 2 * 3600 * 1000),
        candidateId: c.id,
        jobId,
        assignedToId: interviewerUser.id,
        interviewers: JSON.stringify([{ name: interviewerUser.name, email: interviewerUser.email, status: 'confirmed' }]),
        location: i % 2 === 0 ? 'Google Meet' : 'Zoom',
      },
    });
  }
  console.log(`✅ Interview events: ${Math.min(10, interviewCandidates.length)}`);

  // ── Candidate Notes ───────────────────────────────────────────────────────
  const hiringManager = createdUsers.find(u => u.role === 'HIRING_MANAGER') ?? primaryUser;
  if (candidates.length >= 3) {
    await prisma.candidateNote.createMany({
      data: [
        { candidateId: candidates[0].id, authorName: primaryUser.name,    body: 'Strong technical fundamentals. Recommend moving to technical round immediately.' },
        { candidateId: candidates[0].id, authorName: hiringManager.name,  body: 'Agreed. Scheduling for next Tuesday at 10 AM.' },
        { candidateId: candidates[1].id, authorName: primaryUser.name,    body: 'Excellent leadership presence. References checked out — very positive feedback.' },
        { candidateId: candidates[2].id, authorName: hiringManager.name,  body: 'Portfolio is outstanding. Proceeding to offer stage.' },
        { candidateId: candidates[2].id, authorName: primaryUser.name,    body: 'Offer letter drafted. Awaiting final approval from ADMIN.' },
      ],
    });
  }
  console.log(`✅ Candidate notes: 5`);

  // ── Announcements ─────────────────────────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      { type: 'announcement', title: 'RBAC is live!',           summary: 'Role-based access control is now enforced. Each user sees only what their role permits.', timeLabel: 'Today',     cta: 'View Users', href: '/dashboard/settings/users' },
      { type: 'news',         title: 'Q2 hiring on track',      summary: 'You are at 89 new hires this quarter — 12% ahead of last quarter. Keep it up!',            timeLabel: '2h ago',    cta: 'See analytics', href: '/dashboard/analytics' },
      { type: 'reminder',     title: '3 callbacks due this week', summary: 'Sarah Mitchell, James Chen, and Emily Rodriguez have pending follow-ups.',                  timeLabel: 'Due soon',  cta: 'View pipeline', href: '/dashboard/kanban' },
      { type: 'announcement', title: 'New integration: LinkedIn', summary: 'One-click import of LinkedIn applications is now available in Settings → Integrations.',   timeLabel: 'Yesterday', href: '/dashboard/integrations' },
    ],
  });
  console.log(`✅ Announcements: 4`);

  // ── Notifications ─────────────────────────────────────────────────────────
  const now = Date.now();
  await prisma.notification.createMany({
    data: [
      { title: 'New application received',   message: 'Sarah Mitchell applied for Senior Software Engineer.',           type: 'info',      isRead: false, href: '/dashboard/candidates', createdAt: new Date(now - 15 * 60000) },
      { title: 'Interview scheduled',        message: 'Technical interview with James Chen tomorrow at 10 AM.',         type: 'interview', isRead: false, href: '/dashboard/calendar',   createdAt: new Date(now - 45 * 60000) },
      { title: 'Offer accepted!',            message: 'Emily Rodriguez accepted the UX Designer offer. Welcome aboard!', type: 'success',   isRead: false, href: '/dashboard/candidates', createdAt: new Date(now - 2 * 3600000) },
      { title: 'Callback reminder',          message: 'Follow-up call with Priya Sharma is due today.',                  type: 'callback',  isRead: false, href: '/dashboard',            createdAt: new Date(now - 3 * 3600000) },
      { title: 'Pipeline milestone',         message: '20+ candidates in pipeline this month — a new record!',          type: 'success',   isRead: true,  href: '/dashboard/analytics',  createdAt: new Date(now - 8 * 3600000) },
      { title: 'Job posting expiring',       message: 'HR Business Partner posting expires in 3 days.',                  type: 'warning',   isRead: true,  href: '/dashboard/jobs',       createdAt: new Date(now - 24 * 3600000) },
    ],
  });
  console.log(`✅ Notifications: 6`);

  // ── Message Threads ───────────────────────────────────────────────────────
  await prisma.messageThread.create({
    data: {
      subject: 'Senior Software Engineer application — Sarah Mitchell',
      messages: {
        create: [
          { fromName: 'Sarah Mitchell',  fromEmail: 'sarah.m@email.com',        body: 'Hi, I am very interested in the Senior Software Engineer role. I have 7 years of Node.js experience.', direction: 'INBOUND'  },
          { fromName: primaryUser.name,  fromEmail: primaryUser.email,           body: 'Hi Sarah! Thank you for reaching out. We have reviewed your profile and would like to schedule a technical screen. Are you available this week?', direction: 'OUTBOUND' },
          { fromName: 'Sarah Mitchell',  fromEmail: 'sarah.m@email.com',        body: 'Absolutely! I am free Tuesday or Wednesday afternoon.', direction: 'INBOUND' },
        ],
      },
    },
  });
  await prisma.messageThread.create({
    data: {
      subject: 'Shortlist update — Senior Engineer role',
      messages: {
        create: [
          { fromName: hiringManager.name, fromEmail: hiringManager.email,        body: 'Hi, do we have an update on the Senior Engineer shortlist? We need to move quickly.', direction: 'INBOUND'  },
          { fromName: primaryUser.name,   fromEmail: primaryUser.email,           body: 'Yes — we have 3 strong candidates in final round. Sending the shortlist now.', direction: 'OUTBOUND' },
        ],
      },
    },
  });
  console.log(`✅ Message threads: 2`);

  // ── Activity Log ──────────────────────────────────────────────────────────
  const activities = [
    { type: 'candidate_added',       payload: { user: primaryUser.name, candidate: 'Sarah Mitchell',  position: 'Senior Software Engineer', icon: 'user-plus'   } },
    { type: 'status_changed',        payload: { user: primaryUser.name, from: 'Screening', to: 'Interview',  candidate: 'James Chen',            icon: 'arrow-right' } },
    { type: 'interview_scheduled',   payload: { user: primaryUser.name, candidate: 'Emily Rodriguez', date: new Date().toISOString().slice(0, 10),                    icon: 'calendar'    } },
    { type: 'offer_sent',            payload: { user: hiringManager.name, candidate: 'Priya Sharma',  position: 'DevOps Engineer',            icon: 'file-check'  } },
    { type: 'hired',                 payload: { user: primaryUser.name, candidate: 'Marcus Johnson',  position: 'Backend Developer',          icon: 'award'       } },
    { type: 'job_posted',            payload: { user: adminUser?.name ?? primaryUser.name, job: 'Security Engineer', department: 'Engineering', icon: 'briefcase'  } },
    { type: 'role_change',           payload: { user: adminUser?.name ?? primaryUser.name, target: 'Rachel Recruiter', fromRole: 'VIEWER', toRole: 'RECRUITER',    icon: 'shield'      } },
    { type: 'candidate_added',       payload: { user: primaryUser.name, candidate: 'Ethan Davis',     position: 'Senior Software Engineer',   icon: 'user-plus'   } },
  ];
  for (let i = 0; i < activities.length; i++) {
    await prisma.activityLog.create({
      data: {
        type: activities[i].type,
        payload: { ...activities[i].payload, time: new Date(baseTime - (activities.length - i) * 3600000).toISOString() },
      },
    });
  }
  console.log(`✅ Activity logs: ${activities.length}`);

  // ── User Activity Logs (for Audit Log page) ───────────────────────────────
  if (adminUser) {
    for (const u of createdUsers.slice(1)) {
      await prisma.userActivityLog.create({
        data: {
          userId: adminUser.id,
          action: 'role_change',
          metadata: { targetUserId: u.id, targetEmail: u.email, fromRole: 'VIEWER', toRole: u.role },
        },
      }).catch(() => {});
    }
  }
  console.log(`✅ Audit logs: ${createdUsers.length - 1}`);

  // ── Assessment Templates ──────────────────────────────────────────────────
  const templates = [
    {
      name: 'React & TypeScript Assessment', description: 'Evaluate React hooks, TypeScript, and modern frontend patterns.',
      category: 'technical', type: 'MULTIPLE_CHOICE', duration: 45, difficulty: 'intermediate', passingScore: 70, isActive: true,
      questions: [
        { type: 'multiple_choice', question: 'What is the purpose of the useEffect hook?', options: ['State management', 'Side effects', 'Event handling', 'Styling'], correctAnswer: 'Side effects', points: 10, sortOrder: 0 },
        { type: 'multiple_choice', question: 'What does TypeScript add over JavaScript?', options: ['Faster runtime', 'Static typing', 'DOM manipulation', 'Async support'], correctAnswer: 'Static typing', points: 10, sortOrder: 1 },
        { type: 'open_ended',      question: 'Explain the Virtual DOM and its benefits.', points: 20, sortOrder: 2 },
        { type: 'coding',          question: 'Write a custom usePrevious hook.', points: 25, sortOrder: 3, language: 'javascript' },
      ],
    },
    {
      name: 'Logical Reasoning', description: 'Cognitive assessment testing pattern recognition and analytical thinking.',
      category: 'cognitive', type: 'LOGICAL_REASONING', duration: 30, difficulty: 'intermediate', passingScore: 65, isActive: true,
      questions: [
        { type: 'multiple_choice', question: 'Next in sequence: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], correctAnswer: '42', points: 15, sortOrder: 0 },
        { type: 'multiple_choice', question: 'A bat and ball cost $11. The bat costs $10 more. How much is the ball?', options: ['$0.50', '$1.00', '$1.50', '$0.10'], correctAnswer: '$0.50', points: 20, sortOrder: 1 },
        { type: 'open_ended',      question: 'How would you estimate the number of gas stations in a city of 1M people?', points: 25, sortOrder: 2 },
      ],
    },
  ];
  for (const t of templates) {
    const { questions, ...info } = t;
    await prisma.assessmentTemplate.create({
      data: { ...info, questions: { create: questions.map(q => ({ ...q, options: q.options ? JSON.stringify(q.options) : null, description: q.question, language: q.language ?? null, correctAnswer: q.correctAnswer ?? null })) } },
    });
  }
  console.log(`✅ Assessment templates: ${templates.length}`);

  // ── Email Templates ───────────────────────────────────────────────────────
  await prisma.emailTemplate.createMany({
    data: [
      { name: 'Interview Invitation', subject: 'Interview Invitation — {{position}} at {{companyName}}', body: 'Dear {{candidateName}},\n\nWe are impressed with your background and would like to invite you for an interview for the {{position}} position.\n\nDate: {{interviewDate}}\nTime: {{interviewTime}}\nFormat: {{interviewFormat}}\n\nPlease confirm your availability by replying.\n\nBest regards,\n{{companyName}} Recruitment Team', category: 'interview', variables: ['candidateName', 'position', 'companyName', 'interviewDate', 'interviewTime', 'interviewFormat'], isDefault: true },
      { name: 'Job Offer',            subject: 'Offer Letter — {{position}} at {{companyName}}',         body: 'Dear {{candidateName}},\n\nWe are delighted to offer you the position of {{position}} at {{companyName}}!\n\nStart Date: {{startDate}}\nSalary: {{salary}}\n\nPlease review the attached offer letter. We look forward to having you on board!\n\nBest regards,\n{{companyName}} HR Team', category: 'offer', variables: ['candidateName', 'position', 'companyName', 'startDate', 'salary'], isDefault: true },
      { name: 'Application Rejection', subject: 'Update on your application — {{position}}',             body: 'Dear {{candidateName}},\n\nThank you for your interest in the {{position}} role at {{companyName}}. After careful consideration, we have decided to move forward with other candidates.\n\nWe appreciate your time and wish you well.\n\nBest regards,\n{{companyName}} Team', category: 'rejection', variables: ['candidateName', 'position', 'companyName'], isDefault: true },
    ],
  });
  console.log(`✅ Email templates: 3`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Role Users Created:');
  for (const u of ROLE_USERS) {
    console.log(`  ${u.role.padEnd(16)} ${u.email.padEnd(32)} password: ${u.password}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
