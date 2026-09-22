// Dates are handled as "YYYY-MM-DD" strings in the student's own time zone.

const pad = (n) => String(n).padStart(2, '0');

export const toIsoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// "YYYY-MM-DD" -> a Date at local midnight (new Date("YYYY-MM-DD") would be UTC midnight)
export const fromIsoDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Today's date in the student's own time zone
export const todayLocal = () => toIsoDate(new Date());

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
