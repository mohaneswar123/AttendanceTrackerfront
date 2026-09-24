// Helpers for weekly routines. Times are "HH:mm" and are turned into minutes only to
// compare and display them here; the server decides what is stored and what is refused.
import { formatTime, toMinutes } from './calendarDate';

export const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const DAY_SHORT = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun'
};

export const DAY_LONG = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
  FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday'
};

// Today's weekday name, so the page opens on the day the student is living
export const todayDay = () => DAYS[(new Date().getDay() + 6) % 7];

// `block` colours the activity card in the day's timeline; the emoji labels the category
// in the form's dropdown.
export const CATEGORIES = [
  { value: null, label: 'None', icon: '⚪', block: 'bg-slate-500/10 border-slate-400/30 text-slate-100' },
  { value: 'CLASS', label: 'Class', icon: '📘', block: 'bg-violet-500/15 border-violet-500/40 text-violet-50' },
  { value: 'STUDY', label: 'Study', icon: '📖', block: 'bg-sky-500/15 border-sky-500/40 text-sky-50' },
  { value: 'BREAK', label: 'Break', icon: '☕', block: 'bg-orange-500/15 border-orange-500/40 text-orange-50' },
  { value: 'MEAL', label: 'Meal', icon: '🍽️', block: 'bg-amber-500/15 border-amber-500/40 text-amber-50' },
  { value: 'EXERCISE', label: 'Exercise', icon: '🏃', block: 'bg-rose-500/15 border-rose-500/40 text-rose-50' },
  { value: 'SLEEP', label: 'Sleep', icon: '😴', block: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-50' },
  { value: 'TRAVEL', label: 'Travel', icon: '🚌', block: 'bg-teal-500/15 border-teal-500/40 text-teal-50' },
  { value: 'PERSONAL', label: 'Personal', icon: '🧘', block: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-50' },
  { value: 'OTHER', label: 'Other', icon: '📌', block: 'bg-slate-500/15 border-slate-400/40 text-slate-50' }
];

export const categoryOf = (value) => CATEGORIES.find(category => category.value === (value || null)) || CATEGORIES[0];

// The colours a mode can have
export const MODE_COLORS = {
  VIOLET: { dot: 'bg-primary-500', soft: 'bg-primary-500/15 border-primary-500/40' },
  CYAN: { dot: 'bg-secondary-500', soft: 'bg-secondary-500/15 border-secondary-500/40' },
  EMERALD: { dot: 'bg-emerald-500', soft: 'bg-emerald-500/15 border-emerald-500/40' },
  AMBER: { dot: 'bg-amber-500', soft: 'bg-amber-500/15 border-amber-500/40' },
  ROSE: { dot: 'bg-rose-500', soft: 'bg-rose-500/15 border-rose-500/40' },
  SLATE: { dot: 'bg-slate-400', soft: 'bg-slate-500/15 border-slate-400/40' }
};

export const COLOR_NAMES = { VIOLET: 'Violet', CYAN: 'Cyan', EMERALD: 'Emerald', AMBER: 'Amber', ROSE: 'Rose', SLATE: 'Slate' };

// The four offered first; the rest open behind the "…" button
export const MODE_ICONS = ['🎓', '🏠', '💼', '📖', '📚', '🧪', '🎯', '🌙', '☀️', '🎨', '🧘', '⚡'];
export const FIRST_ICONS = 4;

// "9:00 AM – 10:30 AM"
export const timeRange = (activity) => `${formatTime(activity.startTime)} – ${formatTime(activity.endTime)}`;

// "1h 30m", "45m"
export const durationLabel = (activity) => {
  const minutes = activity.endMinutes - activity.startMinutes;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

// The activity already on that day that a new start/end would run into, if any.
// Mirrors the server's rule: touching edges are fine.
export const findOverlap = (dayActivities, startTime, endTime, ignoreId) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  return dayActivities.find(activity =>
    activity.id !== ignoreId && activity.startMinutes < end && activity.endMinutes > start) || null;
};

// Activities grouped by weekday: { MONDAY: [...], ... }, keeping the server's order
export const groupByDay = (activities) =>
  DAYS.reduce((days, day) => {
    days[day] = activities.filter(activity => activity.dayOfWeek === day);
    return days;
  }, {});
