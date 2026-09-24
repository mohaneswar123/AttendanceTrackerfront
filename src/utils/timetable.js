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

export const CATEGORIES = [
  { value: null, label: 'None', chip: 'bg-slate-600 text-white border-slate-500', badge: 'bg-white/5 text-slate-300 border-white/10' },
  { value: 'CLASS', label: 'Class', chip: 'bg-violet-500/25 text-violet-100 border-violet-400', badge: 'bg-violet-500/15 text-violet-200 border-violet-500/30' },
  { value: 'STUDY', label: 'Study', chip: 'bg-cyan-500/25 text-cyan-100 border-cyan-400', badge: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/30' },
  { value: 'BREAK', label: 'Break', chip: 'bg-amber-500/25 text-amber-100 border-amber-400', badge: 'bg-amber-500/15 text-amber-200 border-amber-500/30' },
  { value: 'MEAL', label: 'Meal', chip: 'bg-orange-500/25 text-orange-100 border-orange-400', badge: 'bg-orange-500/15 text-orange-200 border-orange-500/30' },
  { value: 'EXERCISE', label: 'Exercise', chip: 'bg-emerald-500/25 text-emerald-100 border-emerald-400', badge: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30' },
  { value: 'SLEEP', label: 'Sleep', chip: 'bg-indigo-500/25 text-indigo-100 border-indigo-400', badge: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/30' },
  { value: 'TRAVEL', label: 'Travel', chip: 'bg-sky-500/25 text-sky-100 border-sky-400', badge: 'bg-sky-500/15 text-sky-200 border-sky-500/30' },
  { value: 'PERSONAL', label: 'Personal', chip: 'bg-rose-500/25 text-rose-100 border-rose-400', badge: 'bg-rose-500/15 text-rose-200 border-rose-500/30' },
  { value: 'OTHER', label: 'Other', chip: 'bg-slate-500/30 text-slate-100 border-slate-400', badge: 'bg-slate-500/15 text-slate-200 border-slate-500/30' }
];

export const categoryOf = (value) => CATEGORIES.find(category => category.value === (value || null)) || CATEGORIES[0];

// The colours a mode can have
export const MODE_COLORS = {
  VIOLET: { dot: 'bg-primary-500', soft: 'bg-primary-500/15 border-primary-500/40 text-primary-100', ring: 'ring-primary-500/60' },
  CYAN: { dot: 'bg-secondary-500', soft: 'bg-secondary-500/15 border-secondary-500/40 text-secondary-100', ring: 'ring-secondary-500/60' },
  EMERALD: { dot: 'bg-emerald-500', soft: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100', ring: 'ring-emerald-500/60' },
  AMBER: { dot: 'bg-amber-500', soft: 'bg-amber-500/15 border-amber-500/40 text-amber-100', ring: 'ring-amber-500/60' },
  ROSE: { dot: 'bg-rose-500', soft: 'bg-rose-500/15 border-rose-500/40 text-rose-100', ring: 'ring-rose-500/60' },
  SLATE: { dot: 'bg-slate-400', soft: 'bg-slate-500/15 border-slate-400/40 text-slate-100', ring: 'ring-slate-400/60' }
};

export const MODE_ICONS = ['🎓', '🏠', '💼', '📚', '🧪', '🏋️', '🎯', '🌙', '☀️', '🎨', '🧘', '⚡'];

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
