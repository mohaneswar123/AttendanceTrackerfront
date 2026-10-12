// Helpers for the admin portal.
import { todayLocal } from './date';

export const EXPIRING_SOON_DAYS = 7;

// Whole days from today until the account lapses; null when it has no date
export const daysLeft = (user) => {
  if (!user?.paidTill) return null;
  const end = new Date(`${String(user.paidTill).slice(0, 10)}T00:00:00`);
  const today = new Date(`${todayLocal()}T00:00:00`);
  return Math.round((end - today) / 86400000);
};

// 'inactive' | 'expired' | 'expiring' | 'active'
export const accessState = (user) => {
  if (!user?.active) return 'inactive';
  const left = daysLeft(user);
  if (left === null) return 'active';
  if (left < 0) return 'expired';
  if (left <= EXPIRING_SOON_DAYS) return 'expiring';
  return 'active';
};

export const STATE_LABEL = {
  active: 'Active',
  expiring: 'Expiring',
  expired: 'Expired',
  inactive: 'Inactive'
};

export const STATE_BADGE = {
  active: 'badge-success',
  expiring: 'badge-warning',
  expired: 'badge-danger',
  inactive: 'badge-neutral'
};

// "14 days left", "today", "3 days ago"
export const accessSummary = (user) => {
  if (!user?.active) return 'No access';
  const left = daysLeft(user);
  if (left === null) return 'No end date';
  if (left === 0) return 'Ends today';
  if (left < 0) return `Ended ${-left} ${-left === 1 ? 'day' : 'days'} ago`;
  return `${left} ${left === 1 ? 'day' : 'days'} left`;
};

export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(`${String(value).slice(0, 10)}T00:00:00`)
    .toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// "27 Sep, 14:32"
export const formatMoment = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  });
};

export const ACTION_LABEL = {
  ACTIVATE: 'Activated',
  EXTEND: 'Extended',
  DEACTIVATE: 'Deactivated',
  SET_PASSWORD: 'Password set',
  DELETE: 'Deleted'
};

export const ACTION_BADGE = {
  ACTIVATE: 'badge-success',
  EXTEND: 'badge-info',
  DEACTIVATE: 'badge-warning',
  SET_PASSWORD: 'badge-neutral',
  DELETE: 'badge-danger'
};

// What a student did. The log records the kind of thing and what happened to it,
// never what they wrote, so these labels are all it can ever say.
export const FEATURE_LABEL = {
  ATTENDANCE: 'Attendance',
  SUBJECT: 'Subjects',
  TASK: 'Tasks',
  CALENDAR: 'Calendar',
  TIMETABLE: 'Timetable',
  FOCUS: 'Focus'
};

// The order the features are shown in, so the panel reads the same every time
export const FEATURE_ORDER = ['ATTENDANCE', 'SUBJECT', 'TASK', 'CALENDAR', 'TIMETABLE', 'FOCUS'];

export const USER_ACTION_LABEL = { CREATE: 'Added', UPDATE: 'Changed', DELETE: 'Removed' };

export const USER_ACTION_BADGE = {
  CREATE: 'badge-success',
  UPDATE: 'badge-info',
  DELETE: 'badge-danger'
};

// { TASK: { CREATE: 2 } } -> 2
export const totalActions = (counts) =>
  Object.values(counts || {}).reduce(
    (sum, perAction) => sum + Object.values(perAction).reduce((a, b) => a + b, 0), 0);
