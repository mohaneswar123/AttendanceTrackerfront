// Dates are handled as "YYYY-MM-DD" strings in Indian Standard Time.

/**
 * Every date in this app is a day in a student's life, and those days run on IST — not on
 * whatever zone the device happens to be set to.
 *
 * The server works the same way, and the two have to agree: when they did not, a student
 * opening the app at 1 AM was told that today "has not happened yet", because it was still
 * yesterday in UTC. Reading the clock through here is what keeps the two on the same day.
 */
export const APP_TIME_ZONE = 'Asia/Kolkata';

const pad = (n) => String(n).padStart(2, '0');

const FIELDS = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'short',
  hourCycle: 'h23'
});

/** The moment, broken into the pieces the app asks for, in IST */
const nowParts = (date = new Date()) => {
  const found = {};
  FIELDS.formatToParts(date).forEach(part => { found[part.type] = part.value; });
  return found;
};

export const toIsoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// "YYYY-MM-DD" -> a Date at local midnight (new Date("YYYY-MM-DD") would be UTC midnight)
export const fromIsoDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Today's date in IST, whatever the device's own zone says
export const todayLocal = (date) => {
  const now = nowParts(date);
  return `${now.year}-${now.month}-${now.day}`;
};

/** The time of day in IST as "HH:mm", for comparing against stored times */
export const nowTime = (date) => {
  const now = nowParts(date);
  return `${now.hour}:${now.minute}`;
};

/** Minutes since midnight in IST, for the timetable's now-and-next */
export const nowMinutes = (date) => {
  const now = nowParts(date);
  return Number(now.hour) * 60 + Number(now.minute);
};

/** The hour in IST, for greetings and for the time a new entry starts at */
export const nowHour = (date) => Number(nowParts(date).hour);

/** The weekday in IST as "Mon", "Tue", … */
export const nowWeekdayShort = (date) => nowParts(date).weekday;

/** The year in IST */
export const nowYear = (date) => Number(nowParts(date).year);

export const addDays = (isoDate, days) => {
  const date = fromIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

// "Today", "Tomorrow", "Yesterday", or a short date such as "12 Sep" (with the year when it isn't this year)
export const dateLabel = (isoDate) => {
  const today = todayLocal();
  if (isoDate === today) return 'Today';
  if (isoDate === addDays(today, 1)) return 'Tomorrow';
  if (isoDate === addDays(today, -1)) return 'Yesterday';
  const date = fromIsoDate(isoDate);
  const sameYear = date.getFullYear() === fromIsoDate(today).getFullYear();
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
};
