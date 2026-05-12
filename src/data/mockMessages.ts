const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);

export const mockChatThreads = [
  { id: 't1', name: 'Sarah Lee', role: 'Hiring Manager', avatar: 'SL', lastMessage: 'Can you send the shortlist by EOD?', time: hoursAgo(0.5), unread: 2 },
  { id: 't2', name: 'Mike Chen', role: 'Tech Lead', avatar: 'MC', lastMessage: 'Technical round scheduled for Sarah M.', time: hoursAgo(2), unread: 0 },
  { id: 't3', name: 'HR Team', role: 'People', avatar: 'HR', lastMessage: 'Offer letter sent to James Chen.', time: hoursAgo(5), unread: 0 },
];

export const mockChatMessages: Record<string, { from: string; text: string; time: Date }[]> = {
  t1: [
    { from: 'Sarah Lee', text: 'Hi, do we have an update on the Senior Engineer role?', time: hoursAgo(3) },
    { from: 'You', text: 'Yes, we have 3 in the final round. I\'ll share the shortlist by today.', time: hoursAgo(2.5) },
    { from: 'Sarah Lee', text: 'Can you send the shortlist by EOD?', time: hoursAgo(0.5) },
  ],
  t2: [
    { from: 'Mike Chen', text: 'Technical round scheduled for Sarah M. at 10 AM tomorrow.', time: hoursAgo(2) },
    { from: 'You', text: 'Thanks, I\'ve added it to the calendar.', time: hoursAgo(1.5) },
  ],
  t3: [
    { from: 'HR Team', text: 'Offer letter sent to James Chen. Awaiting response.', time: hoursAgo(6) },
    { from: 'HR Team', text: 'Offer letter sent to James Chen.', time: hoursAgo(5) },
  ],
};
