/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ApplicationStage = {
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING',
  INTERVIEW: 'INTERVIEW',
  OFFER: 'OFFER',
  HIRED: 'HIRED',
  JOINED: 'JOINED',
  REJECTED: 'REJECTED',
  DROPPED: 'DROPPED',
};

const MessageDirection = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
};

const JOB_TITLES = [
  { title: 'Senior Software Engineer', department: 'Engineering', location: 'San Francisco, CA', type: 'Full-time', applicants: 34, description: 'We are looking for an experienced Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining scalable web applications.', requirements: '5+ years experience with React, Node.js, TypeScript. Experience with cloud platforms (AWS/GCP). Strong problem-solving skills.' },
  { title: 'Product Manager', department: 'Product', location: 'Remote', type: 'Full-time', applicants: 18, description: 'Lead product development from conception to launch. Work closely with engineering, design, and marketing teams.', requirements: '3+ years PM experience in tech. Strong analytical skills. Experience with Agile methodologies.' },
  { title: 'UX Designer', department: 'Design', location: 'New York, NY', type: 'Full-time', applicants: 22, description: 'Create intuitive and engaging user experiences for our products. Conduct user research and usability testing.', requirements: 'Portfolio demonstrating UX/UI skills. Proficiency in Figma, Sketch. Experience with design systems.' },
  { title: 'Data Analyst', department: 'Data', location: 'Austin, TX', type: 'Full-time', applicants: 15, description: 'Analyze complex datasets to drive business decisions. Build dashboards and reports for stakeholders.', requirements: 'SQL, Python, Tableau or similar. Strong statistical knowledge. Bachelor\'s in related field.' },
  { title: 'DevOps Engineer', department: 'Engineering', location: 'Chicago, IL', type: 'Full-time', applicants: 9, description: 'Build and maintain CI/CD pipelines, infrastructure, and monitoring systems.', requirements: 'Docker, Kubernetes, Terraform, Jenkins. Cloud platform experience. Infrastructure as Code.' },
  { title: 'Frontend Developer', department: 'Engineering', location: 'Remote', type: 'Contract', applicants: 28, description: 'Develop responsive web applications using modern frameworks and tools.', requirements: '3+ years React/Vue/Angular. CSS, HTML5, JavaScript/TypeScript. Experience with responsive design.' },
  { title: 'HR Specialist', department: 'People', location: 'Boston, MA', type: 'Full-time', applicants: 12, status: 'Closed', description: 'Support recruitment, onboarding, and employee relations.', requirements: 'HR certification preferred. 2+ years experience. Strong interpersonal skills.' },
  { title: 'Machine Learning Engineer', department: 'Engineering', location: 'Seattle, WA', type: 'Full-time', applicants: 21, description: 'Build and deploy ML models for recommendation systems and data analysis.', requirements: 'Python, TensorFlow/PyTorch, SQL. Experience with model deployment. MS/PhD preferred.' },
  { title: 'Sales Representative', department: 'Sales', location: 'Denver, CO', type: 'Full-time', applicants: 16, description: 'Generate new business opportunities and maintain client relationships.', requirements: '2+ years B2B sales experience. Excellent communication skills. CRM experience.' },
  { title: 'Customer Success Manager', department: 'Customer Success', location: 'Remote', type: 'Full-time', applicants: 13, description: 'Ensure customer satisfaction and drive product adoption.', requirements: '3+ years in customer success. SaaS experience preferred. Strong problem-solving.' },
  { title: 'Marketing Manager', department: 'Marketing', location: 'Los Angeles, CA', type: 'Full-time', applicants: 19, description: 'Develop and execute marketing strategies across digital channels.', requirements: 'Digital marketing experience. SEO, SEM, social media. Analytics and reporting.' },
  { title: 'Security Engineer', department: 'Engineering', location: 'Washington, DC', type: 'Full-time', applicants: 8, description: 'Implement security best practices and conduct vulnerability assessments.', requirements: 'Security certifications (CISSP, CEH). Cloud security experience. Incident response.' },
];

const CANDIDATES = [
  { name: 'Sarah Mitchell', email: 'sarah.m@email.com', phone: '+1 555-0101', source: 'LinkedIn', skills: 'React,Node.js,TypeScript,AWS', tags: 'senior,urgent', experience: 7, location: 'San Francisco, CA' },
  { name: 'James Chen', email: 'james.c@email.com', phone: '+1 555-0102', source: 'Referral', skills: 'Product Strategy,Agile,Jira,SQL', tags: 'leadership,referral', experience: 5, location: 'New York, NY' },
  { name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '+1 555-0103', source: 'Indeed', skills: 'Figma,Sketch,User Research,Prototyping', tags: 'creative,top-candidate', experience: 4, location: 'Los Angeles, CA' },
  { name: 'Michael Thompson', email: 'michael.t@email.com', phone: '+1 555-0104', source: 'LinkedIn', skills: 'Python,SQL,Tableau,Excel', tags: 'analytics', experience: 3, location: 'Austin, TX' },
  { name: 'Priya Sharma', email: 'priya.s@email.com', phone: '+1 555-0105', source: 'Glassdoor', skills: 'Docker,Kubernetes,CI/CD,Terraform', tags: 'devops,remote', experience: 6, location: 'Remote' },
  { name: 'David Kim', email: 'david.k@email.com', phone: '+1 555-0106', source: 'Company Website', skills: 'Vue.js,React,CSS,GraphQL', tags: 'frontend', experience: 3, location: 'Seattle, WA' },
  { name: 'Lisa Wang', email: 'lisa.w@email.com', phone: '+1 555-0107', source: 'LinkedIn', skills: 'Java,Spring Boot,Microservices,PostgreSQL', tags: 'senior,backend', experience: 8, location: 'Boston, MA' },
  { name: 'Marcus Johnson', email: 'marcus.j@email.com', phone: '+1 555-0108', source: 'Referral', skills: 'Go,Python,Redis,MongoDB', tags: 'referral,backend', experience: 5, location: 'Chicago, IL' },
  { name: 'Rachel Green', email: 'rachel.g@email.com', phone: '+1 555-0109', source: 'Indeed', skills: 'React,Next.js,Tailwind,TypeScript', tags: 'frontend,junior', experience: 2, location: 'Denver, CO' },
  { name: 'Kevin Patel', email: 'kevin.p@email.com', phone: '+1 555-0110', source: 'Glassdoor', skills: 'Machine Learning,Python,TensorFlow,R', tags: 'data-science', experience: 4, location: 'San Jose, CA' },
  { name: 'Alex Rivera', email: 'alex.r@email.com', phone: '+1 555-0111', source: 'LinkedIn', skills: 'Python,Pandas,SQL,Power BI', tags: 'analytics', experience: 2, location: 'Miami, FL' },
  { name: 'Sofia Martinez', email: 'sofia.m@email.com', phone: '+1 555-0112', source: 'Referral', skills: 'AWS,Azure,Linux,Ansible', tags: 'devops,referral', experience: 5, location: 'Phoenix, AZ' },
  { name: 'Daniel Brown', email: 'daniel.b@email.com', phone: '+1 555-0113', source: 'Indeed', skills: 'React,Angular,Node.js,MongoDB', tags: 'fullstack', experience: 4, location: 'Portland, OR' },
  { name: 'Olivia Wilson', email: 'olivia.w@email.com', phone: '+1 555-0114', source: 'Company Website', skills: 'HR,Recruiting,ATS,Communication', tags: 'hr,internal', experience: 6, location: 'Atlanta, GA' },
  { name: 'Ethan Davis', email: 'ethan.d@email.com', phone: '+1 555-0115', source: 'LinkedIn', skills: 'Java,Python,System Design,AWS', tags: 'senior,top-candidate', experience: 9, location: 'San Francisco, CA' },
  { name: 'Mia Anderson', email: 'mia.a@email.com', phone: '+1 555-0116', source: 'Glassdoor', skills: 'Scrum,Product Management,Analytics,UX', tags: 'leadership', experience: 5, location: 'New York, NY' },
  { name: 'Noah Taylor', email: 'noah.t@email.com', phone: '+1 555-0117', source: 'Referral', skills: 'UI/UX,Adobe XD,CSS,HTML', tags: 'design,referral', experience: 3, location: 'Los Angeles, CA' },
  { name: 'Ava Thomas', email: 'ava.t@email.com', phone: '+1 555-0118', source: 'Indeed', skills: 'SQL,Python,Data Visualization,ETL', tags: 'data', experience: 2, location: 'Dallas, TX' },
  { name: 'Liam Jackson', email: 'liam.j@email.com', phone: '+1 555-0119', source: 'LinkedIn', skills: 'Docker,GCP,Terraform,Jenkins', tags: 'devops,senior', experience: 7, location: 'Remote' },
  { name: 'Emma White', email: 'emma.w@email.com', phone: '+1 555-0120', source: 'Company Website', skills: 'React,TypeScript,Next.js,Tailwind', tags: 'frontend,top-candidate', experience: 4, location: 'Seattle, WA' },
  { name: 'William Martinez', email: 'william.m@email.com', phone: '+1 555-0121', source: 'LinkedIn', skills: 'Ruby on Rails,PostgreSQL,Redis', tags: 'backend', experience: 6, location: 'San Francisco, CA' },
  { name: 'Charlotte Lee', email: 'charlotte.l@email.com', phone: '+1 555-0122', source: 'Indeed', skills: 'Marketing,SEO,Content Strategy,Analytics', tags: 'marketing', experience: 4, location: 'Chicago, IL' },
  { name: 'Benjamin Clark', email: 'benjamin.c@email.com', phone: '+1 555-0123', source: 'Glassdoor', skills: 'Salesforce,CRM,Sales,B2B', tags: 'sales', experience: 5, location: 'New York, NY' },
  { name: 'Amelia Lewis', email: 'amelia.l@email.com', phone: '+1 555-0124', source: 'Referral', skills: 'Customer Success,SaaS,Onboarding', tags: 'customer-success', experience: 3, location: 'Austin, TX' },
  { name: 'Lucas Hall', email: 'lucas.h@email.com', phone: '+1 555-0125', source: 'LinkedIn', skills: 'iOS,Swift,Mobile Development,Firebase', tags: 'mobile', experience: 5, location: 'Los Angeles, CA' },
  { name: 'Harper Young', email: 'harper.y@email.com', phone: '+1 555-0126', source: 'Indeed', skills: 'Android,Kotlin,Mobile,Java', tags: 'mobile', experience: 4, location: 'Seattle, WA' },
  { name: 'Alexander King', email: 'alexander.k@email.com', phone: '+1 555-0127', source: 'Company Website', skills: 'Blockchain,Solidity,Ethereum,Web3', tags: 'blockchain', experience: 3, location: 'Remote' },
  { name: 'Evelyn Wright', email: 'evelyn.w@email.com', phone: '+1 555-0128', source: 'LinkedIn', skills: 'QA,Selenium,Automation,Testing', tags: 'qa', experience: 4, location: 'Denver, CO' },
  { name: 'Henry Lopez', email: 'henry.l@email.com', phone: '+1 555-0129', source: 'Glassdoor', skills: 'PHP,Laravel,MySQL,Backend', tags: 'backend', experience: 6, location: 'Miami, FL' },
  { name: 'Abigail Hill', email: 'abigail.h@email.com', phone: '+1 555-0130', source: 'Referral', skills: 'Technical Writing,Documentation,API', tags: 'technical-writing', experience: 5, location: 'Boston, MA' },
  { name: 'Sebastian Scott', email: 'sebastian.s@email.com', phone: '+1 555-0131', source: 'Indeed', skills: 'Network Security,CISSP,Firewalls', tags: 'security', experience: 7, location: 'Washington, DC' },
  { name: 'Ella Green', email: 'ella.g@email.com', phone: '+1 555-0132', source: 'LinkedIn', skills: 'Data Engineering,Spark,Hadoop,Scala', tags: 'data-engineering', experience: 5, location: 'San Jose, CA' },
  { name: 'Jack Adams', email: 'jack.a@email.com', phone: '+1 555-0133', source: 'Glassdoor', skills: 'Game Development,Unity,C#,3D', tags: 'gaming', experience: 4, location: 'Los Angeles, CA' },
  { name: 'Victoria Baker', email: 'victoria.b@email.com', phone: '+1 555-0134', source: 'Company Website', skills: 'AR/VR,Unity,3D Modeling,C++', tags: 'ar-vr', experience: 3, location: 'Seattle, WA' },
  { name: 'Owen Nelson', email: 'owen.n@email.com', phone: '+1 555-0135', source: 'Referral', skills: 'Database Administration,Oracle,SQL Server', tags: 'dba', experience: 8, location: 'New York, NY' },
  { name: 'Grace Carter', email: 'grace.c@email.com', phone: '+1 555-0136', source: 'Indeed', skills: 'Social Media,Content Marketing,Instagram', tags: 'social-media', experience: 2, location: 'Austin, TX' },
  { name: 'Samuel Mitchell', email: 'samuel.m@email.com', phone: '+1 555-0137', source: 'LinkedIn', skills: 'Cloud Architecture,Solutions Architecture,AWS', tags: 'cloud', experience: 10, location: 'San Francisco, CA' },
  { name: 'Chloe Perez', email: 'chloe.p@email.com', phone: '+1 555-0138', source: 'Glassdoor', skills: 'UX Research,Usability Testing,User Interviews', tags: 'ux-research', experience: 4, location: 'Chicago, IL' },
  { name: 'Daniel Roberts', email: 'daniel.r@email.com', phone: '+1 555-0139', source: 'Company Website', skills: 'Full Stack,JavaScript,Python,AWS', tags: 'fullstack,senior', experience: 7, location: 'Remote' },
  { name: 'Lily Turner', email: 'lily.t@email.com', phone: '+1 555-0140', source: 'LinkedIn', skills: 'Product Design,Design Systems,Figma', tags: 'product-design', experience: 5, location: 'New York, NY' },
  { name: 'Matthew Phillips', email: 'matthew.p@email.com', phone: '+1 555-0141', source: 'Referral', skills: 'Backend,Go,Rust,Microservices', tags: 'backend,systems', experience: 6, location: 'Seattle, WA' },
  { name: 'Zoe Campbell', email: 'zoe.c@email.com', phone: '+1 555-0142', source: 'Indeed', skills: 'Frontend,Web Performance,Accessibility', tags: 'frontend,a11y', experience: 4, location: 'San Francisco, CA' },
  { name: 'Gabriel Evans', email: 'gabriel.e@email.com', phone: '+1 555-0143', source: 'Glassdoor', skills: 'AI/ML,Computer Vision,OpenCV,Python', tags: 'ai-ml', experience: 5, location: 'Boston, MA' },
  { name: 'Natalie Edwards', email: 'natalie.e@email.com', phone: '+1 555-0144', source: 'LinkedIn', skills: 'Project Management,PMP,Agile,Scrum', tags: 'pm', experience: 8, location: 'Chicago, IL' },
  { name: 'Julian Collins', email: 'julian.c@email.com', phone: '+1 555-0145', source: 'Company Website', skills: 'Site Reliability Engineering,SRE,Monitoring', tags: 'sre', experience: 6, location: 'Austin, TX' },
  { name: 'Leah Stewart', email: 'leah.s@email.com', phone: '+1 555-0146', source: 'Referral', skills: 'HR Business Partner,Talent Acquisition', tags: 'hr', experience: 7, location: 'Denver, CO' },
  { name: 'Christopher Morris', email: 'christopher.m@email.com', phone: '+1 555-0147', source: 'Indeed', skills: 'Finance,FP&A,Excel,Financial Modeling', tags: 'finance', experience: 5, location: 'New York, NY' },
  { name: 'Hannah Sanchez', email: 'hannah.s@email.com', phone: '+1 555-0148', source: 'LinkedIn', skills: 'Legal,Contracts,Compliance,IP Law', tags: 'legal', experience: 6, location: 'San Francisco, CA' },
  { name: 'Andrew Reed', email: 'andrew.r@email.com', phone: '+1 555-0149', source: 'Glassdoor', skills: 'Operations,Supply Chain,Logistics', tags: 'operations', experience: 4, location: 'Chicago, IL' },
  { name: 'Samantha Cook', email: 'samantha.c@email.com', phone: '+1 555-0150', source: 'Company Website', skills: 'Recruiting,Talent Acquisition,Sourcing', tags: 'recruiting', experience: 3, location: 'Los Angeles, CA' },
  { name: 'Joshua Morgan', email: 'joshua.m@email.com', phone: '+1 555-0151', source: 'LinkedIn', skills: 'Business Development,Partnerships,Strategy', tags: 'bd', experience: 7, location: 'Seattle, WA' },
  { name: 'Isabella Bell', email: 'isabella.b@email.com', phone: '+1 555-0152', source: 'Referral', skills: 'Customer Support,Help Desk,Technical Support', tags: 'support', experience: 2, location: 'Remote' },
];

const STAGES_ORDER = [
  ApplicationStage.APPLIED,
  ApplicationStage.APPLIED,
  ApplicationStage.SCREENING,
  ApplicationStage.SCREENING,
  ApplicationStage.INTERVIEW,
  ApplicationStage.INTERVIEW,
  ApplicationStage.OFFER,
  ApplicationStage.HIRED,
  ApplicationStage.JOINED,
  ApplicationStage.REJECTED,
  ApplicationStage.APPLIED,
  ApplicationStage.SCREENING,
  ApplicationStage.INTERVIEW,
  ApplicationStage.APPLIED,
  ApplicationStage.OFFER,
  ApplicationStage.INTERVIEW,
  ApplicationStage.SCREENING,
  ApplicationStage.APPLIED,
  ApplicationStage.REJECTED,
  ApplicationStage.JOINED,
];

async function main() {
  // Create or get company first
  const companyData = {
    name: 'Devlumiq',
    slug: 'devlumiq',
    description: 'Leading technology company building innovative solutions',
    website: 'https://devlumiq.com',
    metaTitle: 'Devlumiq — Open Positions',
    metaDescription: 'Explore exciting career opportunities at Devlumiq. Join our team and help us build the future of recruitment technology.',
    isPublished: true,
  };
  const company = await prisma.company.upsert({
    where: { slug: 'devlumiq' },
    update: companyData,
    create: companyData,
  });

  const user = await prisma.user.upsert({
    where: { email: 'demo@devlumiq.com' },
    update: {},
    create: {
      name: 'Alex Johnson',
      email: 'demo@devlumiq.com',
      role: 'RECRUITER',
    },
  });

  await prisma.notification.deleteMany({});
  await prisma.candidateNote.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.interviewEvent.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.messageThread.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.job.deleteMany({});

  await prisma.job.createMany({
    data: JOB_TITLES.map((j) => ({
      companyId: company.id,
      title: j.title,
      department: j.department,
      location: j.location,
      type: j.type,
      status: j.status || 'Active',
      applicants: j.applicants,
      description: j.description,
      requirements: j.requirements,
    })),
  });

  const jobRecords = await prisma.job.findMany();
  const jobIds = jobRecords.map((j) => j.id);

  for (let i = 0; i < CANDIDATES.length; i++) {
    const c = CANDIDATES[i];
    const stage = STAGES_ORDER[i % STAGES_ORDER.length] || ApplicationStage.APPLIED;
    const jobId = jobIds[i % jobIds.length];
    await prisma.candidate.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        source: c.source,
        location: c.location,
        skills: c.skills ? c.skills.split(',').map(s => s.trim()) : [],
        tags: c.tags ? c.tags.split(',').map(t => t.trim()) : [],
        experience: c.experience,
        applications: {
          create: { jobId, stage },
        },
      },
    });
  }

  const candidates = await prisma.candidate.findMany({ include: { applications: { include: { job: true } } } });
  const baseTime = Date.now();

  const interviewData = candidates.slice(0, 8).map((c, idx) => {
    const start = new Date(baseTime + (idx + 1) * 60 * 60 * 1000);
    return {
      title: `Interview with ${c.name}`,
      type: idx % 2 === 0 ? 'Technical' : 'Behavioral',
      start,
      candidateId: c.id,
      jobId: c.applications[0]?.jobId ?? jobIds[0],
      assignedToId: user.id,
      interviewers: JSON.stringify([{ name: user.name, email: user.email, status: 'confirmed' }]),
      location: 'Video call',
    };
  });
  await prisma.interviewEvent.createMany({ data: interviewData });

  const activityPayloads = [
    { type: 'candidate_added', user: user.name, candidate: 'David Kim', position: 'Frontend Developer', icon: 'user-plus' },
    { type: 'status_changed', user: 'Sarah Mitchell', from: 'Screening', to: 'Interview', icon: 'arrow-right' },
    { type: 'interview_scheduled', user: user.name, candidate: 'James Chen', date: new Date().toISOString().slice(0, 10), icon: 'calendar' },
    { type: 'offer_sent', user: 'Emily Rodriguez', candidate: 'Emily Rodriguez', position: 'UX Designer', icon: 'file-check' },
    { type: 'candidate_added', user: user.name, candidate: 'Lisa Wang', position: 'Senior Software Engineer', icon: 'user-plus' },
    { type: 'hired', user: user.name, candidate: 'Marcus Johnson', position: 'Backend Developer', icon: 'award' },
    { type: 'job_posted', user: user.name, job: 'Security Engineer', department: 'Engineering', icon: 'briefcase' },
    { type: 'status_changed', user: user.name, from: 'Applied', to: 'Screening', icon: 'arrow-right' },
    { type: 'interview_scheduled', user: user.name, candidate: 'Sarah Mitchell', date: new Date().toISOString().slice(0, 10), icon: 'calendar' },
    { type: 'candidate_added', user: user.name, candidate: 'William Martinez', position: 'Ruby Developer', icon: 'user-plus' },
    { type: 'status_changed', user: user.name, from: 'Interview', to: 'Offer', icon: 'arrow-right' },
    { type: 'interview_completed', user: user.name, candidate: 'Priya Sharma', position: 'DevOps Engineer', icon: 'check-circle' },
    { type: 'rejection_sent', user: user.name, candidate: 'Michael Thompson', position: 'Data Analyst', icon: 'x-circle' },
    { type: 'candidate_added', user: user.name, candidate: 'Charlotte Lee', position: 'Marketing Manager', icon: 'user-plus' },
    { type: 'job_posted', user: user.name, job: 'Machine Learning Engineer', department: 'Engineering', icon: 'briefcase' },
    { type: 'status_changed', user: user.name, from: 'Screening', to: 'Rejected', icon: 'arrow-right' },
    { type: 'interview_scheduled', user: user.name, candidate: 'Ethan Davis', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), icon: 'calendar' },
    { type: 'offer_accepted', user: user.name, candidate: 'Sofia Martinez', position: 'Cloud Engineer', icon: 'award' },
  ];

  for (let i = 0; i < activityPayloads.length; i++) {
    const p = activityPayloads[i];
    await prisma.activityLog.create({
      data: {
        type: p.type,
        payload: { ...p, time: new Date(baseTime - (activityPayloads.length - i) * 3600000).toISOString() },
      },
    });
  }

  const announcements = [
    { type: 'announcement', title: 'Smart Match is here', summary: 'AI-powered candidate fit scores are now live. See match % on every candidate and profile.', timeLabel: 'Today', cta: 'View candidates', href: '/dashboard/candidates' },
    { type: 'announcement', title: 'Scheduled maintenance', summary: 'Brief maintenance window Sunday 2–4 AM UTC. No action needed.', timeLabel: 'Mar 8' },
    { type: 'news', title: 'Q1 hiring goals on track', summary: 'You\'re at 89 new hires this month — 12% ahead of last quarter. Keep it up!', timeLabel: '2h ago', cta: 'See analytics', href: '/dashboard/analytics' },
    { type: 'news', title: 'New integration: LinkedIn', summary: 'One-click import of LinkedIn applications into your pipeline. Available in Settings.', timeLabel: 'Yesterday' },
    { type: 'reminder', title: '3 callbacks due this week', summary: 'Sarah Mitchell, James Chen, and Emily Rodriguez have follow-ups scheduled. Review callback reminders.', timeLabel: 'Due soon', cta: 'View callbacks', href: '/dashboard' },
    { type: 'reminder', title: '5 candidates pending review', summary: 'Resume reviews are waiting in your pipeline. Move them to the next stage or add notes.', timeLabel: 'Pending', cta: 'Open pipeline', href: '/dashboard/kanban' },
  ];
  await prisma.announcement.createMany({ data: announcements });

  await prisma.messageThread.create({
    data: {
      subject: 'Senior Software Engineer application',
      messages: {
        create: [
          { fromName: 'Sarah Mitchell', fromEmail: 'sarah.m@email.com', body: 'Hi, I am interested in the Senior Software Engineer role.', direction: MessageDirection.INBOUND },
          { fromName: user.name, fromEmail: user.email, body: 'Thanks Sarah, we have received your application and will get back to you shortly.', direction: MessageDirection.OUTBOUND },
        ],
      },
    },
  });

  const thread2 = await prisma.messageThread.create({
    data: {
      subject: 'Product Manager role',
      messages: {
        create: [
          { fromName: 'James Chen', fromEmail: 'james.c@email.com', body: 'I would like to discuss the PM opportunity.', direction: MessageDirection.INBOUND },
        ],
      },
    },
  });

  await prisma.messageThread.create({
    data: {
      subject: 'Can you send the shortlist by EOD?',
      messages: {
        create: [
          { fromName: 'Sarah Lee', fromEmail: 'sarah.lee@company.com', body: 'Hi, do we have an update on the Senior Engineer role?', direction: MessageDirection.INBOUND },
          { fromName: user.name, fromEmail: user.email, body: 'Yes, we have 3 in the final round. I\'ll share the shortlist by today.', direction: MessageDirection.OUTBOUND },
          { fromName: 'Sarah Lee', fromEmail: 'sarah.lee@company.com', body: 'Can you send the shortlist by EOD?', direction: MessageDirection.INBOUND },
        ],
      },
    },
  });

  await prisma.messageThread.create({
    data: {
      subject: 'Technical round scheduled for Sarah M.',
      messages: {
        create: [
          { fromName: 'Mike Chen', fromEmail: 'mike.chen@company.com', body: 'Technical round scheduled for Sarah M. at 10 AM tomorrow.', direction: MessageDirection.INBOUND },
          { fromName: user.name, fromEmail: user.email, body: 'Thanks, I\'ve added it to the calendar.', direction: MessageDirection.OUTBOUND },
        ],
      },
    },
  });

  const candList = await prisma.candidate.findMany({ take: 5 });
  if (candList.length >= 2) {
    await prisma.candidateNote.create({
      data: { candidateId: candList[0].id, authorName: user.name, body: 'Strong fit for the role. Recommend moving to technical round.' },
    });
    await prisma.candidateNote.create({
      data: { candidateId: candList[0].id, authorName: 'Sarah Lee', body: 'Agreed. Let\'s schedule for next week.' },
    });
    await prisma.candidateNote.create({
      data: { candidateId: candList[1].id, authorName: user.name, body: 'Good technical skills. Proceeding to offer stage.' },
    });
  }

  // Seed notifications
  const now = Date.now();
  const notifications = [
    { title: 'New application received', message: 'Sarah Mitchell applied for Senior Software Engineer.', type: 'info', isRead: false, href: '/dashboard/candidates', createdAt: new Date(now - 15 * 60000) },
    { title: 'Interview scheduled', message: 'Technical interview with James Chen is set for tomorrow at 10 AM.', type: 'interview', isRead: false, href: '/dashboard/calendar', createdAt: new Date(now - 45 * 60000) },
    { title: 'Offer accepted!', message: 'Emily Rodriguez accepted the UX Designer offer. Welcome aboard!', type: 'success', isRead: false, href: '/dashboard/candidates', createdAt: new Date(now - 2 * 3600000) },
    { title: 'Callback reminder', message: 'Follow-up call with Priya Sharma is due today.', type: 'callback', isRead: false, href: '/dashboard', createdAt: new Date(now - 3 * 3600000) },
    { title: 'New referral', message: 'Marcus Johnson was referred by David Kim for the Backend Developer role.', type: 'info', isRead: true, href: '/dashboard/candidates', createdAt: new Date(now - 5 * 3600000) },
    { title: 'Pipeline milestone', message: 'You have 20+ candidates in the pipeline this month — a new record!', type: 'success', isRead: true, href: '/dashboard/analytics', createdAt: new Date(now - 8 * 3600000) },
    { title: 'Job posting expiring', message: 'HR Specialist posting expires in 3 days. Consider renewing or closing.', type: 'warning', isRead: true, href: '/dashboard/jobs', createdAt: new Date(now - 24 * 3600000) },
    { title: 'Weekly report ready', message: 'Your hiring summary for this week is available in Analytics.', type: 'info', isRead: true, href: '/dashboard/analytics', createdAt: new Date(now - 48 * 3600000) },
  ];
  await prisma.notification.createMany({ data: notifications });

  // Seed assessment templates
  const assessmentTemplates = [
    {
      name: 'React & TypeScript Technical Assessment',
      description: 'Comprehensive evaluation of React hooks, TypeScript fundamentals, and modern frontend development patterns.',
      category: 'technical',
      type: 'MULTIPLE_CHOICE',
      duration: 45,
      difficulty: 'intermediate',
      passingScore: 70,
      isActive: true,
      questions: [
        { type: 'multiple_choice', question: 'What is the purpose of useEffect hook?', description: 'Testing React hooks knowledge', options: ['State management', 'Side effects', 'Event handling', 'Style manipulation'], correctAnswer: 'Side effects', points: 10 },
        { type: 'multiple_choice', question: 'Which TypeScript feature allows defining custom types?', description: 'TypeScript basics', options: ['Interfaces', 'Variables', 'Functions', 'Loops'], correctAnswer: 'Interfaces', points: 10 },
        { type: 'open_ended', question: 'Explain the Virtual DOM and its benefits', description: 'React architecture understanding', points: 20 },
        { type: 'multiple_choice', question: 'What is JSX?', description: 'React syntax knowledge', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON Xchange', 'JavaScript Extension'], correctAnswer: 'JavaScript XML', points: 10 },
        { type: 'coding', question: 'Create a custom useCounter hook', description: 'Custom hooks implementation', points: 25, language: 'javascript' },
      ]
    },
    {
      name: 'JavaScript Algorithms & Data Structures',
      description: 'Coding challenges testing algorithmic thinking, problem-solving, and JavaScript proficiency.',
      category: 'technical',
      type: 'CODING',
      duration: 60,
      difficulty: 'advanced',
      passingScore: 60,
      isActive: true,
      questions: [
        { type: 'coding', question: 'Implement binary search algorithm', description: 'Search algorithm', points: 25, language: 'javascript' },
        { type: 'coding', question: 'Solve the two-sum problem efficiently', description: 'Array manipulation', points: 25, language: 'javascript' },
        { type: 'multiple_choice', question: 'Time complexity of binary search?', description: 'Big O notation', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 'O(log n)', points: 15 },
        { type: 'coding', question: 'Implement a debounce function', description: 'Advanced JavaScript', points: 20, language: 'javascript' },
        { type: 'open_ended', question: 'Explain event loop in JavaScript', description: 'Core JS concepts', points: 15 },
      ]
    },
    {
      name: 'Personality & Culture Fit Assessment',
      description: 'Evaluate cultural alignment, teamwork approach, and soft skills for company values fit.',
      category: 'personality',
      type: 'PERSONALITY',
      duration: 30,
      difficulty: 'beginner',
      passingScore: 50,
      isActive: true,
      questions: [
        { type: 'open_ended', question: 'How do you handle conflicts in a team?', description: 'Conflict resolution', points: 20 },
        { type: 'open_ended', question: 'Describe your ideal work environment', description: 'Work style', points: 20 },
        { type: 'multiple_choice', question: 'How do you prefer to receive feedback?', description: 'Communication style', options: ['Face-to-face', 'Written', 'Both equally', 'Depends on context'], points: 15 },
        { type: 'open_ended', question: 'Tell us about a time you made a mistake and learned from it', description: 'Growth mindset', points: 25 },
        { type: 'open_ended', question: 'What motivates you in your work?', description: 'Motivation drivers', points: 20 },
      ]
    },
    {
      name: 'Logical Reasoning & Problem Solving',
      description: 'Cognitive assessment testing logical thinking, pattern recognition, and analytical skills.',
      category: 'cognitive',
      type: 'LOGICAL_REASONING',
      duration: 40,
      difficulty: 'intermediate',
      passingScore: 65,
      isActive: true,
      questions: [
        { type: 'multiple_choice', question: 'Complete the pattern: 2, 6, 12, 20, 30, ?', description: 'Pattern recognition', options: ['40', '42', '44', '46'], correctAnswer: '42', points: 10 },
        { type: 'multiple_choice', question: 'If all Bloops are Bleeps and all Bleeps are Blops, are all Bloops Blops?', description: 'Logical deduction', options: ['Yes', 'No', 'Cannot be determined', 'Some are'], correctAnswer: 'Yes', points: 15 },
        { type: 'multiple_choice', question: 'A bat and ball cost $11. The bat costs $10 more than the ball. How much is the ball?', description: 'Math problem solving', options: ['$0.50', '$1', '$1.50', '$0.10'], correctAnswer: '$0.50', points: 20 },
        { type: 'open_ended', question: 'How would you estimate the number of gas stations in a city?', description: 'Fermi estimation', points: 25 },
        { type: 'multiple_choice', question: 'Which number is next: 1, 1, 2, 3, 5, 8, ?', description: 'Sequence logic', options: ['11', '12', '13', '21'], correctAnswer: '13', points: 10 },
      ]
    },
    {
      name: 'English Language Proficiency',
      description: 'Assess written communication skills, grammar, and professional email writing.',
      category: 'language',
      type: 'LANGUAGE',
      duration: 35,
      difficulty: 'intermediate',
      passingScore: 75,
      isActive: true,
      questions: [
        { type: 'multiple_choice', question: 'Choose the correct sentence:', description: 'Grammar', options: ['Their going to the store.', 'They\'re going to the store.', 'There going to the store.', 'Thier going to the store.'], correctAnswer: 'They\'re going to the store.', points: 10 },
        { type: 'multiple_choice', question: 'Which word is spelled correctly?', description: 'Spelling', options: ['Accomodate', 'Accommodate', 'Acommodate', 'Accommodatte'], correctAnswer: 'Accommodate', points: 10 },
        { type: 'open_ended', question: 'Write a professional email declining a job offer politely', description: 'Professional writing', points: 30 },
        { type: 'multiple_choice', question: 'Select the best synonym for "meticulous":', description: 'Vocabulary', options: ['Careless', 'Thorough', 'Quick', 'Lazy'], correctAnswer: 'Thorough', points: 10 },
        { type: 'open_ended', question: 'Summarize the following paragraph in 2-3 sentences...', description: 'Comprehension', points: 20 },
      ]
    },
  ];

  // Create assessment templates
  const createdTemplates = [];
  for (const templateData of assessmentTemplates) {
    const { questions, ...templateInfo } = templateData;
    const template = await prisma.assessmentTemplate.create({
      data: {
        ...templateInfo,
        questions: {
          create: questions.map((q, idx) => ({
            type: q.type,
            question: q.question,
            description: q.description,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer || null,
            points: q.points,
            sortOrder: idx,
            language: q.language || null,
          })),
        },
      },
    });
    createdTemplates.push(template);
  }

  // Get candidates for assignments
  const allCandidates = await prisma.candidate.findMany({ take: 10 });
  const demoUser = await prisma.user.findFirst({ where: { email: 'demo@devlumiq.com' } });

  // Create assessment assignments with realistic data
  const assignmentStatuses = ['pending', 'in_progress', 'completed', 'completed', 'completed'];
  const passOutcomes = [true, true, true, false, true];

  for (let i = 0; i < Math.min(8, allCandidates.length); i++) {
    const candidate = allCandidates[i];
    const template = createdTemplates[i % createdTemplates.length];
    const status = assignmentStatuses[i % assignmentStatuses.length];
    const passed = status === 'completed' ? passOutcomes[i % passOutcomes.length] : null;
    const percentage = status === 'completed' ? (passed ? 82 : 45) : null;
    const score = status === 'completed' ? (passed ? 82 : 45) : null;
    const maxScore = 100;

    const startedAt = status !== 'pending' ? new Date(Date.now() - (i + 1) * 86400000) : null;
    const submittedAt = status === 'completed' ? new Date(Date.now() - i * 43200000) : null;

    await prisma.assessmentAssignment.create({
      data: {
        templateId: template.id,
        candidateId: candidate.id,
        assignedById: demoUser?.id || 'demo-user',
        status,
        startedAt,
        submittedAt,
        score,
        maxScore,
        percentage,
        passed,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
  }

  // Create background checks with realistic data
  const bgCheckStatuses = ['clear', 'pending', 'consider', 'clear', 'in_progress'];
  const bgCheckTypes = [
    ['criminal', 'employment', 'education'],
    ['criminal', 'identity'],
    ['criminal', 'employment', 'education', 'credit'],
    ['criminal'],
    ['criminal', 'employment', 'identity', 'motor_vehicle'],
  ];

  for (let i = 0; i < Math.min(5, allCandidates.length); i++) {
    const candidate = allCandidates[i];
    const status = bgCheckStatuses[i % bgCheckStatuses.length];
    const checkTypes = bgCheckTypes[i % bgCheckTypes.length];
    const completedAt = ['clear', 'consider'].includes(status)
      ? new Date(Date.now() - i * 86400000 * 2)
      : null;
    const resultSummary = status === 'clear' ? 'clear' : status === 'consider' ? 'consider' : null;

    await prisma.backgroundCheck.create({
      data: {
        candidateId: candidate.id,
        requestedById: demoUser?.id || 'demo-user',
        provider: 'CHECKR',
        status,
        checkTypes,
        resultSummary,
        completedAt,
        consentObtained: true,
        consentDate: new Date(Date.now() - (i + 1) * 86400000),
        externalId: `checkr-${Date.now()}-${i}`,
      },
    });
  }

  // Seed email templates
  const emailTemplates = [
    {
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{position}} at {{companyName}}',
      body: 'Dear {{candidateName}},\n\nWe are impressed with your background and would like to invite you for an interview for the {{position}} position at {{companyName}}.\n\nInterview Details:\nDate: {{interviewDate}}\nTime: {{interviewTime}}\nFormat: {{interviewFormat}}\n\nPlease confirm your availability by replying to this email.\n\nBest regards,\n{{companyName}} Recruitment Team',
      category: 'interview',
      variables: ['candidateName', 'position', 'companyName', 'interviewDate', 'interviewTime', 'interviewFormat'],
      isDefault: true
    },
    {
      name: 'Job Offer',
      subject: 'Job Offer - {{position}} at {{companyName}}',
      body: 'Dear {{candidateName}},\n\nWe are delighted to offer you the position of {{position}} at {{companyName}}!\n\nPOSITION DETAILS\nPosition: {{position}}\nDepartment: {{department}}\nStart Date: {{startDate}}\n\nCOMPENSATION\nAnnual Salary: {{salary}}\nCurrency: {{currency}}\n\nWe are excited about you joining our team. Please review the attached offer letter and let us know if you have any questions.\n\nWelcome aboard!\n\nBest regards,\n{{companyName}} HR Team',
      category: 'offer',
      variables: ['candidateName', 'position', 'companyName', 'department', 'startDate', 'salary', 'currency'],
      isDefault: true
    },
    {
      name: 'Application Rejection',
      subject: 'Update on your application - {{position}}',
      body: 'Dear {{candidateName}},\n\nThank you for your interest in the {{position}} position at {{companyName}} and for taking the time to interview with us.\n\nAfter careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.\n\nWe appreciate your interest in joining our team and wish you all the best in your job search.\n\nBest regards,\n{{companyName}} Recruitment Team',
      category: 'rejection',
      variables: ['candidateName', 'position', 'companyName'],
      isDefault: true
    }
  ];
  await prisma.emailTemplate.createMany({ data: emailTemplates });

  // Seed interview scores for first candidate
  const interviewScores = [
    { criteria: 'Technical Skills', score: 4, maxScore: 5, notes: 'Strong React and Node.js knowledge', scoredBy: 'Tech Lead' },
    { criteria: 'Communication', score: 5, maxScore: 5, notes: 'Excellent communication skills', scoredBy: 'Tech Lead' },
    { criteria: 'Problem Solving', score: 4, maxScore: 5, notes: 'Good approach to system design questions', scoredBy: 'Tech Lead' },
    { criteria: 'Cultural Fit', score: 5, maxScore: 5, notes: 'Great alignment with company values', scoredBy: 'HR Manager' },
    { criteria: 'Experience', score: 4, maxScore: 5, notes: '7 years relevant experience', scoredBy: 'HR Manager' }
  ];

  // Seed comments for team collaboration
  const comments = [
    { body: 'Excellent technical skills. Recommended for final round. @Sarah please schedule follow-up.', authorName: 'Mike (Tech Lead)', authorEmail: 'mike@company.com', mentions: 'Sarah' },
    { body: 'Great cultural fit! Loved their enthusiasm. @Mike agreed on technical assessment.', authorName: 'Sarah (HR)', authorEmail: 'sarah@company.com', mentions: 'Mike' },
    { body: 'Portfolio looks impressive. Let\'s move forward with design challenge.', authorName: 'Lisa (Design Lead)', authorEmail: 'lisa@company.com' }
  ];

  const finalCandidates = await prisma.candidate.count();
  const finalJobs = await prisma.job.count();
  const finalApplications = await prisma.application.count();
  const finalAssessmentTemplates = await prisma.assessmentTemplate.count();
  const finalAssignments = await prisma.assessmentAssignment.count();
  const finalBackgroundChecks = await prisma.backgroundCheck.count();

  console.log('Database seeded successfully:', {
    users: 1,
    jobs: finalJobs,
    candidates: finalCandidates,
    applications: finalApplications,
    interviews: 8,
    threads: 4,
    announcements: announcements.length,
    notifications: notifications.length,
    emailTemplates: emailTemplates.length,
    interviewScores: interviewScores.length,
    comments: comments.length,
    activities: activityPayloads.length,
    assessmentTemplates: finalAssessmentTemplates,
    assessmentAssignments: finalAssignments,
    backgroundChecks: finalBackgroundChecks,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
