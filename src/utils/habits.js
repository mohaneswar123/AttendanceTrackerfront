// Helpers for habits. The server works out every streak and rate; everything here is
// about saying those figures in words, and about the choices the form offers.
//
// The Habits accent is teal-300, which is #0F766E in the light set and already has a dark
// counterpart in the palette, so nothing here hardcodes a colour.

export const CATEGORIES = [
  { value: 'STUDY', label: 'Study', icon: '📘' },
  { value: 'HEALTH', label: 'Health', icon: '🥗' },
  { value: 'SLEEP', label: 'Sleep', icon: '🌙' },
  { value: 'READING', label: 'Reading', icon: '📖' },
  { value: 'PERSONAL', label: 'Personal', icon: '🧘' }
];

export const categoryOf = (value) => CATEGORIES.find(c => c.value === value) || CATEGORIES[0];

// The same six colours the timetable modes use
export const COLORS = {
  VIOLET: { dot: 'bg-primary-500', soft: 'bg-primary-500/15 border-primary-500/40' },
  CYAN: { dot: 'bg-secondary-500', soft: 'bg-secondary-500/15 border-secondary-500/40' },
  EMERALD: { dot: 'bg-emerald-500', soft: 'bg-emerald-500/15 border-emerald-500/40' },
  AMBER: { dot: 'bg-amber-500', soft: 'bg-amber-500/15 border-amber-500/40' },
  ROSE: { dot: 'bg-rose-500', soft: 'bg-rose-500/15 border-rose-500/40' },
  SLATE: { dot: 'bg-slate-400', soft: 'bg-slate-500/15 border-slate-400/40' }
};

export const COLOR_NAMES = Object.keys(COLORS);
export const colorOf = (value) => COLORS[value] || COLORS.VIOLET;

export const SCHEDULES = [
  { value: 'DAILY', label: 'Every day' },
  { value: 'WEEKDAYS', label: 'Weekdays' },
  { value: 'CUSTOM_DAYS', label: 'Pick days' },
  { value: 'TIMES_PER_WEEK', label: 'Times / week' }
];

export const GOALS = [
  { value: 'YES_NO', label: 'Yes / No', hint: 'One tap and it is done' },
  { value: 'COUNT', label: 'Count', hint: 'Such as 8 glasses of water' },
  { value: 'DURATION', label: 'Time', hint: 'Such as 30 minutes. Focus sessions can count towards this.' }
];

export const GOAL_CHIP = { YES_NO: 'Yes / No', COUNT: 'Count', DURATION: 'Time' };

export const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const DAY_SHORT = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun'
};

export const STATUS_LABEL = { DONE: 'Done', MISSED: 'Missed', SKIPPED: 'Skipped' };

// How a marked day is drawn in the heatmap. A missed day is an outline rather than a
// block of red, so a bad fortnight does not look like a wall of failure.
export const STATUS_CELL = {
  DONE: 'bg-teal-500 text-white',
  SKIPPED: 'bg-slate-500/25 text-slate-400',
  MISSED: 'bg-transparent border border-line text-slate-500'
};

// Something to start from, so the first screen is not empty
export const TEMPLATES = [
  {
    name: 'Read 20 pages', icon: '📖', color: 'CYAN', category: 'READING',
    reason: 'Keeps me off my phone before bed',
    schedule: 'DAILY', goal: 'COUNT', target: 20, unit: 'pages', reminderTime: '21:00'
  },
  {
    name: 'Sleep by 12', icon: '😴', color: 'VIOLET', category: 'SLEEP',
    schedule: 'DAILY', goal: 'YES_NO', reminderTime: '23:30'
  },
  {
    name: 'Revise lecture', icon: '📘', color: 'VIOLET', category: 'STUDY',
    reason: 'Half an hour now saves a week before exams',
    schedule: 'WEEKDAYS', goal: 'DURATION', target: 30, reminderTime: '18:00'
  },
  {
    name: 'No phone after 11', icon: '🌙', color: 'SLATE', category: 'SLEEP',
    schedule: 'DAILY', goal: 'YES_NO', reminderTime: '22:45'
  },
  {
    name: 'Gym', icon: '🏃', color: 'ROSE', category: 'HEALTH',
    schedule: 'TIMES_PER_WEEK', timesPerWeek: 3, goal: 'YES_NO', reminderTime: '07:00'
  },
  {
    name: 'Drink 8 glasses of water', icon: '💧', color: 'CYAN', category: 'HEALTH',
    schedule: 'DAILY', goal: 'COUNT', target: 8, unit: 'glasses'
  }
];

// "Every day", "Weekdays", "Mon, Wed, Fri", "3 times a week"
export const scheduleLabel = (habit) => {
  if (habit.schedule === 'DAILY') return 'Every day';
  if (habit.schedule === 'WEEKDAYS') return 'Weekdays';
  if (habit.schedule === 'TIMES_PER_WEEK') {
    return `${habit.timesPerWeek} ${habit.timesPerWeek === 1 ? 'time' : 'times'} a week`;
  }
  const days = DAYS.filter(day => (habit.weekdays || []).includes(day));
  if (days.length === 7) return 'Every day';
  return days.map(day => DAY_SHORT[day]).join(', ') || 'No days chosen';
};

// "8 glasses", "30 min", or nothing at all for a yes/no habit
export const goalLabel = (habit) => {
  if (habit.goal === 'DURATION') return `${habit.target} min`;
  if (habit.goal === 'COUNT') return `${habit.target}${habit.unit ? ` ${habit.unit}` : ''}`;
  return '';
};

/**
 * The line under a habit's name on the Today list. It answers the question the student
 * is actually asking: how much is left of this one.
 */
export const metaLabel = (habit) => {
  if (habit.goal !== 'YES_NO') {
    const done = habit.today?.amount ?? 0;
    const unit = habit.goal === 'DURATION' ? 'min' : habit.unit || '';
    return `${done} / ${habit.target}${unit ? ` ${unit}` : ''}`;
  }
  if (habit.schedule === 'TIMES_PER_WEEK') {
    return `${habit.doneThisWeek} of ${habit.timesPerWeek} this week`;
  }
  return scheduleLabel(habit);
};

// How far through the goal today's marking is, as a fraction
export const goalProgress = (habit) => {
  if (habit.goal === 'YES_NO') return isDone(habit) ? 1 : 0;
  return Math.min(1, (habit.today?.amount ?? 0) / Math.max(1, habit.target));
};

// -1 means nothing was due, which reads differently from 0%
export const rateLabel = (rate) => (rate < 0 ? '—' : `${rate}%`);

// "up 13 points on last week"
export const rateChange = (thisWeek, lastWeek) => {
  if (thisWeek < 0 || lastWeek < 0) return '';
  const change = thisWeek - lastWeek;
  if (change === 0) return 'the same as last week';
  return `${change > 0 ? 'up' : 'down'} ${Math.abs(change)} ${Math.abs(change) === 1 ? 'point' : 'points'} on last week`;
};

// A streak is counted in days, except for a "times a week" habit, counted in weeks
export const streakUnit = (habit, count) => {
  const unit = habit.schedule === 'TIMES_PER_WEEK' ? 'week' : 'day';
  return `${count} ${count === 1 ? unit : `${unit}s`}`;
};

export const isDone = (habit) => habit.today?.status === 'DONE';
export const isSkipped = (habit) => habit.today?.status === 'SKIPPED';

// Habits due today, in reminder order so the day reads top to bottom. Habits with no
// reminder sit at the end rather than pretending to be due at midnight.
export const dueOrder = (habits) => [...habits]
  .filter(habit => habit.dueToday)
  .sort((a, b) => (a.reminderTime || '99:99').localeCompare(b.reminderTime || '99:99'));

const pad = (n) => String(n).padStart(2, '0');
const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// The local date as YYYY-MM-DD, matching what the server expects
export const todayIso = () => iso(new Date());

export const addDays = (isoDate, days) => {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return iso(date);
};

// The last seven days ending today, oldest first, for the strip on the progress card
export const lastSevenDays = () => Array.from({ length: 7 }, (_, i) => addDays(todayIso(), i - 6));

/**
 * Five weeks of Monday-start columns ending with the week today is in, for the heatmap.
 * Rows are weeks and columns are weekdays, which is what makes a gap easy to spot.
 */
export const heatmapWeeks = (weeks = 5) => {
  const today = new Date();
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const out = [];
  for (let week = weeks - 1; week >= 0; week--) {
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() - week * 7);
    out.push(Array.from({ length: 7 }, (_, day) => {
      const date = new Date(start);
      date.setDate(start.getDate() + day);
      return iso(date);
    }));
  }
  return out;
};

// "9 Nov"
export const shortDay = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

export const weekdayInitial = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
