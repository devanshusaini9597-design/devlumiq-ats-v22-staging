const now = new Date();
const formatDate = (d: Date) => d.toISOString();
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
const hoursAgo = (n: number) => new Date(now.getTime() - n * 60 * 60 * 1000);

export const mockDashboardData = {
  totalCandidates: 1247,
  thisMonth: 89,
  pendingReview: 23,
  candidateTrend: 12.5,
  pipeline: [
    { stage: 'Applied', count: 156 },
    { stage: 'Screening', count: 42 },
    { stage: 'Interview', count: 18 },
    { stage: 'Offer', count: 5 },
    { stage: 'Hired', count: 12 },
    { stage: 'Joined', count: 8 },
    { stage: 'Rejected', count: 34 },
    { stage: 'Dropped', count: 11 },
  ],
  recentCandidates: [
    { id: '1', name: 'Sarah Mitchell', email: 'sarah.m@email.com', position: 'Senior Software Engineer', source: 'LinkedIn', status: 'Interview', createdAt: formatDate(daysAgo(0.5)), phone: '+1 555-0101' },
    { id: '2', name: 'James Chen', position: 'Product Manager', source: 'Referral', status: 'Offer', createdAt: formatDate(daysAgo(1)), email: 'james.c@email.com', phone: '+1 555-0102' },
    { id: '3', name: 'Emily Rodriguez', position: 'UX Designer', source: 'Indeed', status: 'Screening', createdAt: formatDate(daysAgo(2)), email: 'emily.r@email.com', phone: '+1 555-0103' },
    { id: '4', name: 'Michael Thompson', position: 'DevOps Engineer', source: 'LinkedIn', status: 'Hired', createdAt: formatDate(daysAgo(3)), email: 'michael.t@email.com', phone: '+1 555-0104' },
    { id: '5', name: 'Priya Sharma', position: 'Data Analyst', source: 'Glassdoor', status: 'Applied', createdAt: formatDate(daysAgo(4)), email: 'priya.s@email.com', phone: '+1 555-0105' },
    { id: '6', name: 'David Kim', position: 'Frontend Developer', source: 'Company Website', status: 'Interview', createdAt: formatDate(daysAgo(5)), email: 'david.k@email.com', phone: '+1 555-0106' },
    { id: '7', name: 'Lisa Wang', position: 'QA Engineer', source: 'LinkedIn', status: 'Screening', createdAt: formatDate(daysAgo(6)), email: 'lisa.w@email.com', phone: '+1 555-0107' },
    { id: '8', name: 'Marcus Johnson', position: 'Backend Developer', source: 'Referral', status: 'Applied', createdAt: formatDate(daysAgo(7)), email: 'marcus.j@email.com', phone: '+1 555-0108' },
    { id: '9', name: 'Rachel Green', position: 'HR Specialist', source: 'Indeed', status: 'Offer', createdAt: formatDate(daysAgo(8)), email: 'rachel.g@email.com', phone: '+1 555-0109' },
    { id: '10', name: 'Kevin Patel', position: 'Security Engineer', source: 'Glassdoor', status: 'Rejected', createdAt: formatDate(daysAgo(9)), email: 'kevin.p@email.com', phone: '+1 555-0110' },
  ],
  /** Full list for Candidates page table (with pagination) */
  candidatesList: [
    { id: '1', name: 'Sarah Mitchell', email: 'sarah.m@email.com', position: 'Senior Software Engineer', source: 'LinkedIn', status: 'Interview', createdAt: formatDate(daysAgo(0.5)), phone: '+1 555-0101' },
    { id: '2', name: 'James Chen', email: 'james.c@email.com', position: 'Product Manager', source: 'Referral', status: 'Offer', createdAt: formatDate(daysAgo(1)), phone: '+1 555-0102' },
    { id: '3', name: 'Emily Rodriguez', email: 'emily.r@email.com', position: 'UX Designer', source: 'Indeed', status: 'Screening', createdAt: formatDate(daysAgo(2)), phone: '+1 555-0103' },
    { id: '4', name: 'Michael Thompson', email: 'michael.t@email.com', position: 'DevOps Engineer', source: 'LinkedIn', status: 'Hired', createdAt: formatDate(daysAgo(3)), phone: '+1 555-0104' },
    { id: '5', name: 'Priya Sharma', email: 'priya.s@email.com', position: 'Data Analyst', source: 'Glassdoor', status: 'Applied', createdAt: formatDate(daysAgo(4)), phone: '+1 555-0105' },
    { id: '6', name: 'David Kim', email: 'david.k@email.com', position: 'Frontend Developer', source: 'Company Website', status: 'Interview', createdAt: formatDate(daysAgo(5)), phone: '+1 555-0106' },
    { id: '7', name: 'Lisa Wang', email: 'lisa.w@email.com', position: 'QA Engineer', source: 'LinkedIn', status: 'Screening', createdAt: formatDate(daysAgo(6)), phone: '+1 555-0107' },
    { id: '8', name: 'Marcus Johnson', email: 'marcus.j@email.com', position: 'Backend Developer', source: 'Referral', status: 'Applied', createdAt: formatDate(daysAgo(7)), phone: '+1 555-0108' },
    { id: '9', name: 'Rachel Green', email: 'rachel.g@email.com', position: 'HR Specialist', source: 'Indeed', status: 'Offer', createdAt: formatDate(daysAgo(8)), phone: '+1 555-0109' },
    { id: '10', name: 'Kevin Patel', email: 'kevin.p@email.com', position: 'Security Engineer', source: 'Glassdoor', status: 'Rejected', createdAt: formatDate(daysAgo(9)), phone: '+1 555-0110' },
    { id: '11', name: 'Alex Rivera', email: 'alex.r@email.com', position: 'Full Stack Engineer', source: 'LinkedIn', status: 'Interview', createdAt: formatDate(daysAgo(10)), phone: '+1 555-0111' },
    { id: '12', name: 'Sofia Martinez', email: 'sofia.m@email.com', position: 'Product Designer', source: 'Referral', status: 'Screening', createdAt: formatDate(daysAgo(11)), phone: '+1 555-0112' },
    { id: '13', name: 'Daniel Brown', email: 'daniel.b@email.com', position: 'ML Engineer', source: 'Indeed', status: 'Applied', createdAt: formatDate(daysAgo(12)), phone: '+1 555-0113' },
    { id: '14', name: 'Olivia Wilson', email: 'olivia.w@email.com', position: 'Content Writer', source: 'Company Website', status: 'Offer', createdAt: formatDate(daysAgo(13)), phone: '+1 555-0114' },
    { id: '15', name: 'Ethan Davis', email: 'ethan.d@email.com', position: 'Sales Lead', source: 'LinkedIn', status: 'Hired', createdAt: formatDate(daysAgo(14)), phone: '+1 555-0115' },
    { id: '16', name: 'Mia Anderson', email: 'mia.a@email.com', position: 'Customer Success', source: 'Glassdoor', status: 'Interview', createdAt: formatDate(daysAgo(15)), phone: '+1 555-0116' },
    { id: '17', name: 'Noah Taylor', email: 'noah.t@email.com', position: 'Cloud Architect', source: 'Referral', status: 'Screening', createdAt: formatDate(daysAgo(16)), phone: '+1 555-0117' },
    { id: '18', name: 'Ava Thomas', email: 'ava.t@email.com', position: 'Marketing Manager', source: 'Indeed', status: 'Applied', createdAt: formatDate(daysAgo(17)), phone: '+1 555-0118' },
    { id: '19', name: 'Liam Jackson', email: 'liam.j@email.com', position: 'iOS Developer', source: 'LinkedIn', status: 'Rejected', createdAt: formatDate(daysAgo(18)), phone: '+1 555-0119' },
    { id: '20', name: 'Emma White', email: 'emma.w@email.com', position: 'Support Engineer', source: 'Company Website', status: 'Joined', createdAt: formatDate(daysAgo(19)), phone: '+1 555-0120' },
    { id: '21', name: 'Lucas Harris', email: 'lucas.h@email.com', position: 'Scrum Master', source: 'Referral', status: 'Interview', createdAt: formatDate(daysAgo(20)), phone: '+1 555-0121' },
    { id: '22', name: 'Chloe Clark', email: 'chloe.c@email.com', position: 'Legal Counsel', source: 'LinkedIn', status: 'Screening', createdAt: formatDate(daysAgo(21)), phone: '+1 555-0122' },
    { id: '23', name: 'Mason Lewis', email: 'mason.l@email.com', position: 'Data Engineer', source: 'Glassdoor', status: 'Offer', createdAt: formatDate(daysAgo(22)), phone: '+1 555-0123' },
    { id: '24', name: 'Zoe Walker', email: 'zoe.w@email.com', position: 'Brand Designer', source: 'Indeed', status: 'Applied', createdAt: formatDate(daysAgo(23)), phone: '+1 555-0124' },
  ],
  topPositions: [
    { position: 'Software Engineer', count: 45 },
    { position: 'Product Manager', count: 22 },
    { position: 'UX Designer', count: 18 },
    { position: 'Data Analyst', count: 15 },
    { position: 'DevOps Engineer', count: 12 },
    { position: 'Frontend Developer', count: 10 },
  ],
  topSources: [
    { source: 'LinkedIn', count: 420 },
    { source: 'Indeed', count: 256 },
    { source: 'Referral', count: 189 },
    { source: 'Glassdoor', count: 98 },
    { source: 'Company Website', count: 74 },
  ],
  dailySubmissions: [
    { date: 'Mon', count: 12 }, { date: 'Tue', count: 18 }, { date: 'Wed', count: 15 },
    { date: 'Thu', count: 22 }, { date: 'Fri', count: 14 }, { date: 'Sat', count: 5 }, { date: 'Sun', count: 3 },
  ],
  conversionRate: 8.2,
  rejectionRate: 3.6,
  avgTimeToHire: 24,
  openPositions: 12,
};

export const mockJobs = [
  { id: 'j1', title: 'Senior Software Engineer', department: 'Engineering', location: 'San Francisco, CA', type: 'Full-time', applicants: 34, status: 'Active', postedAt: formatDate(daysAgo(5)) },
  { id: 'j2', title: 'Product Manager', department: 'Product', location: 'Remote', type: 'Full-time', applicants: 18, status: 'Active', postedAt: formatDate(daysAgo(7)) },
  { id: 'j3', title: 'UX Designer', department: 'Design', location: 'New York, NY', type: 'Full-time', applicants: 22, status: 'Active', postedAt: formatDate(daysAgo(3)) },
  { id: 'j4', title: 'Data Analyst', department: 'Data', location: 'Austin, TX', type: 'Full-time', applicants: 15, status: 'Active', postedAt: formatDate(daysAgo(10)) },
  { id: 'j5', title: 'DevOps Engineer', department: 'Engineering', location: 'Chicago, IL', type: 'Full-time', applicants: 9, status: 'Active', postedAt: formatDate(daysAgo(2)) },
  { id: 'j6', title: 'Frontend Developer', department: 'Engineering', location: 'Remote', type: 'Contract', applicants: 28, status: 'Active', postedAt: formatDate(daysAgo(4)) },
  { id: 'j7', title: 'HR Specialist', department: 'People', location: 'Boston, MA', type: 'Full-time', applicants: 12, status: 'Closed', postedAt: formatDate(daysAgo(20)) },
];

export const mockActivities = [
  { id: 'a1', type: 'candidate_added', user: 'Alex Johnson', candidate: 'David Kim', position: 'Frontend Developer', time: formatDate(hoursAgo(1)), icon: 'user-plus' },
  { id: 'a2', type: 'status_changed', user: 'Sarah Mitchell', from: 'Screening', to: 'Interview', time: formatDate(hoursAgo(2)), icon: 'arrow-right' },
  { id: 'a3', type: 'interview_scheduled', user: 'James Chen', candidate: 'James Chen', date: 'Mar 8, 2025', time: formatDate(hoursAgo(4)), icon: 'calendar' },
  { id: 'a4', type: 'offer_sent', user: 'Emily Rodriguez', candidate: 'Emily Rodriguez', position: 'UX Designer', time: formatDate(hoursAgo(6)), icon: 'file-check' },
  { id: 'a5', type: 'candidate_added', user: 'Michael Thompson', candidate: 'Lisa Wang', position: 'QA Engineer', time: formatDate(hoursAgo(8)), icon: 'user-plus' },
  { id: 'a6', type: 'hired', user: 'Marcus Johnson', candidate: 'Marcus Johnson', position: 'Backend Developer', time: formatDate(hoursAgo(12)), icon: 'award' },
  { id: 'a7', type: 'job_posted', user: 'Alex Johnson', job: 'Security Engineer', department: 'Engineering', time: formatDate(hoursAgo(18)), icon: 'briefcase' },
];

export const mockCallbacks = [
  { id: '1', candidateName: 'Sarah Mitchell', candidatePosition: 'Senior Software Engineer', callBackDate: '2025-03-07', daysRemaining: 1, priority: 'urgent' as const },
  { id: '2', candidateName: 'James Chen', candidatePosition: 'Product Manager', callBackDate: '2025-03-08', daysRemaining: 2, priority: 'high' as const },
  { id: '3', candidateName: 'Emily Rodriguez', candidatePosition: 'UX Designer', callBackDate: '2025-03-10', daysRemaining: 4, priority: 'medium' as const },
  { id: '4', candidateName: 'David Kim', candidatePosition: 'Frontend Developer', callBackDate: '2025-03-11', daysRemaining: 5, priority: 'medium' as const },
];

export const mockUpcomingInterviews = [
  { id: 'i1', candidate: 'Sarah Mitchell', position: 'Senior Software Engineer', time: '10:00 AM', type: 'Technical', interviewer: 'Alex Johnson' },
  { id: 'i2', candidate: 'James Chen', position: 'Product Manager', time: '2:00 PM', type: 'Behavioral', interviewer: 'Sarah Lee' },
  { id: 'i3', candidate: 'David Kim', position: 'Frontend Developer', time: '4:30 PM', type: 'Technical', interviewer: 'Mike Chen' },
];

export const mockUser = { name: 'Alex Johnson', email: 'demo@devlumiq.com', initials: 'AJ', role: 'Recruitment Manager' };

export const mockNotifications = [
  { id: 'n1', title: 'Callback: Sarah Mitchell', message: 'Schedule follow-up for Senior Software Engineer interview. Due tomorrow.', isRead: false, time: formatDate(hoursAgo(2)), type: 'callback' },
  { id: 'n2', title: 'New candidate added', message: 'David Kim was added to Frontend Developer pipeline.', isRead: true, time: formatDate(hoursAgo(5)), type: 'candidate' },
  { id: 'n3', title: 'Callback: James Chen', message: 'Product Manager interview follow-up in 2 days.', isRead: false, time: formatDate(hoursAgo(8)), type: 'callback' },
  { id: 'n4', title: 'Interview scheduled', message: 'Sarah Mitchell - Technical Interview at 10:00 AM.', isRead: false, time: formatDate(hoursAgo(12)), type: 'interview' },
  { id: 'n5', title: 'Offer accepted', message: 'Emily Rodriguez accepted the UX Designer offer.', isRead: true, time: formatDate(hoursAgo(24)), type: 'offer' },
];
