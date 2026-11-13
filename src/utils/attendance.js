// Attendance maths, in one place so the summary card and the reports agree.
// Everything is weighted by class length in hours, and "No Class" never counts.

export const TARGET = 75;

const hoursOf = (record) => Number(record.classNumber) || 1;

// { attended, counted, missed, percentage } for a set of records
export const tally = (records) => {
  let attended = 0, counted = 0, missed = 0, present = 0, absent = 0;
  records.forEach(record => {
    const hours = hoursOf(record);
    if (record.status === 'Present') { attended += hours; present += 1; }
    else if (record.status === 'Absent') { missed += hours; absent += 1; }
    if (record.status !== 'No Class') counted += hours;
  });
  return {
    attended,
    counted,
    missed,
    present,
    absent,
    percentage: counted > 0 ? Math.round((attended / counted) * 100) : null
  };
};

/**
 * How many more one-hour classes can be missed and still finish on or above the target.
 *
 * Missing `m` more hours gives attended / (counted + m), so the largest m that keeps
 * that at or above the target is attended*100/target - counted.
 */
export const canMiss = ({ attended, counted }, target = TARGET) => {
  if (counted === 0) return null;
  return Math.max(0, Math.floor((attended * 100) / target - counted));
};

/**
 * How many more one-hour classes must be attended in a row to reach the target.
 * Attending `n` more gives (attended + n) / (counted + n).
 */
export const needToAttend = ({ attended, counted }, target = TARGET) => {
  if (counted === 0) return null;
  if ((attended * 100) / counted >= target) return 0;
  return Math.ceil((target * counted - attended * 100) / (100 - target));
};

export const isOnTrack = (percentage, target = TARGET) => percentage !== null && percentage >= target;

/**
 * A subject's colour, in the three forms the pages need: a solid dot, the quiet tint a
 * card sits on, and the circle its initial goes in.
 *
 * The 300 shades are the theme-aware ones, so the initial stays readable in both colour
 * sets, and the 500s are only ever used as fills.
 */
export const SUBJECT_COLORS = {
  CYAN: { dot: 'bg-secondary-500', tint: 'bg-secondary-500/15', avatar: 'bg-secondary-500/20 text-secondary-300' },
  AMBER: { dot: 'bg-amber-500', tint: 'bg-amber-500/15', avatar: 'bg-amber-500/20 text-amber-300' },
  EMERALD: { dot: 'bg-emerald-500', tint: 'bg-emerald-500/15', avatar: 'bg-emerald-500/20 text-emerald-300' },
  ROSE: { dot: 'bg-rose-500', tint: 'bg-rose-500/15', avatar: 'bg-rose-500/20 text-rose-300' },
  VIOLET: { dot: 'bg-violet-500', tint: 'bg-violet-500/15', avatar: 'bg-violet-500/20 text-violet-300' },
  SLATE: { dot: 'bg-slate-400', tint: 'bg-slate-500/15', avatar: 'bg-slate-500/20 text-slate-300' }
};

export const SUBJECT_COLOR_NAMES = Object.keys(SUBJECT_COLORS);

// The order new subjects are given colours in, so the first few never clash
const FALLBACK_ORDER = ['CYAN', 'AMBER', 'EMERALD', 'ROSE', 'VIOLET', 'SLATE'];

/**
 * The colour a subject was given, or one worked out from its name for subjects saved
 * before colours could be chosen. Deriving it from the name means it is stable — the same
 * subject looks the same on every screen — but it also means renaming one would change
 * its colour, which is why a chosen colour wins.
 */
export const subjectTone = (subject) => {
  const name = typeof subject === 'string' ? subject : subject?.name || '';
  const chosen = typeof subject === 'object' ? subject?.color : null;
  if (chosen && SUBJECT_COLORS[chosen]) return SUBJECT_COLORS[chosen];

  let sum = 0;
  for (let i = 0; i < name.length; i++) sum = (sum + name.charCodeAt(i)) % 997;
  return SUBJECT_COLORS[FALLBACK_ORDER[sum % FALLBACK_ORDER.length]];
};

export const initialOf = (name = '?') => name.trim().charAt(0).toUpperCase() || '?';

// "Tuesday, 29 September"
export const longWeekday = (iso) => {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
};

// "Today, 29 Sep" / "Mon, 28 Sep"
export const dayLabel = (iso, today) => {
  const date = new Date(`${iso}T00:00:00`);
  const short = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  if (iso === today) return `Today, ${short}`;
  return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${short}`;
};

/** The week as the plan stores it, Monday first, with the labels the chips wear */
export const PLAN_WEEK = [
  { key: 'MONDAY', short: 'Mon', long: 'Monday' },
  { key: 'TUESDAY', short: 'Tue', long: 'Tuesday' },
  { key: 'WEDNESDAY', short: 'Wed', long: 'Wednesday' },
  { key: 'THURSDAY', short: 'Thu', long: 'Thursday' },
  { key: 'FRIDAY', short: 'Fri', long: 'Friday' },
  { key: 'SATURDAY', short: 'Sat', long: 'Saturday' },
  { key: 'SUNDAY', short: 'Sun', long: 'Sunday' }
];

// "2026-11-12" -> "THURSDAY", for looking a date up in the plan
export const weekdayKeyOf = (iso) => {
  const names = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return names[new Date(`${iso}T00:00:00`).getDay()];
};

/**
 * Pairs a day's planned classes with the records already made for that day.
 *
 * Records carry no idea of which planned slot they came from — the form can make them
 * too — so the pairing is worked out fresh each render: within a subject, a record claims
 * the planned class with the same hours first, and failing that any planned class of that
 * subject still open. Two identical maths classes are interchangeable, so which of the
 * two shows as marked does not matter; that one of them does is what the student needs.
 *
 * Returns [{ subjectId, hours, record|null }] in the plan's own order.
 */
export const pairPlanWithRecords = (planned, dayRecords) => {
  const rows = (planned || []).map(planClass => ({ ...planClass, record: null }));
  const unclaimed = [...(dayRecords || [])];

  const claim = (matches) => {
    rows.forEach(row => {
      if (row.record) return;
      const index = unclaimed.findIndex(record => matches(row, record));
      if (index !== -1) {
        row.record = unclaimed[index];
        unclaimed.splice(index, 1);
      }
    });
  };

  claim((row, record) => record.subjectId === row.subjectId
    && (Number(record.classNumber) || 1) === row.hours);
  claim((row, record) => record.subjectId === row.subjectId);
  return rows;
};
