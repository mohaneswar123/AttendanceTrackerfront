// Attendance maths, in one place so the summary card, the subject rows and the reports
// all agree. Everything is weighted by class length in hours, and "No Class" never counts.

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

// A stable colour per subject, so the same subject always looks the same.
// No red in here: a red bar would read as "failing" rather than "this is Chemistry".
const SUBJECT_TONES = [
  { avatar: 'bg-emerald-500/15 text-emerald-600', bar: 'bg-emerald-500' },
  { avatar: 'bg-orange-500/15 text-orange-600', bar: 'bg-orange-500' },
  { avatar: 'bg-primary-500/15 text-primary-600', bar: 'bg-primary-500' },
  { avatar: 'bg-violet-500/15 text-violet-600', bar: 'bg-violet-500' },
  { avatar: 'bg-teal-500/15 text-teal-600', bar: 'bg-teal-500' },
  { avatar: 'bg-amber-500/15 text-amber-600', bar: 'bg-amber-500' }
];

export const subjectTone = (name = '') => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum = (sum + name.charCodeAt(i)) % 997;
  return SUBJECT_TONES[sum % SUBJECT_TONES.length];
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
