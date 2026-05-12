import { addDays, subDays, setHours, setMinutes } from 'date-fns';

const base = new Date();
export const mockCalendarEvents = [
  { id: 'e1', title: 'Sarah M. - Technical', start: setMinutes(setHours(addDays(base, 0), 10), 0), end: setMinutes(setHours(addDays(base, 0), 11), 0), type: 'interview', candidate: 'Sarah Mitchell' },
  { id: 'e2', title: 'James C. - Behavioral', start: setMinutes(setHours(addDays(base, 1), 14), 0), end: setMinutes(setHours(addDays(base, 1), 15), 0), type: 'interview', candidate: 'James Chen' },
  { id: 'e3', title: 'David K. - Technical', start: setMinutes(setHours(addDays(base, 0), 16), 30), end: setMinutes(setHours(addDays(base, 0), 17), 30), type: 'interview', candidate: 'David Kim' },
  { id: 'e4', title: 'Callback - Emily R.', start: setMinutes(setHours(addDays(base, 2), 9), 0), end: setMinutes(setHours(addDays(base, 2), 9), 30), type: 'callback', candidate: 'Emily Rodriguez' },
  { id: 'e5', title: 'Offer review - Rachel G.', start: setMinutes(setHours(addDays(base, 3), 11), 0), end: setMinutes(setHours(addDays(base, 3), 12), 0), type: 'offer', candidate: 'Rachel Green' },
];
