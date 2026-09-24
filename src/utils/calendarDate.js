// Calendar maths on "YYYY-MM-DD" strings and "HH:mm" times. Dates are built at local
// midnight (see utils/date.js), never parsed as UTC, so a day can't shift.
import { addDays, fromIsoDate, toIsoDate } from './date';

export const VIEWS = { MONTH: 'MONTH', WEEK: 'WEEK', DAY: 'DAY' };

// Weeks start on Sunday everywhere in the calendar
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HOUR_HEIGHT = 48; // px per hour in the Week and Day time grids
// Entries without an end time, or shorter than this, are drawn this long so they stay tappable
export const MIN_BLOCK_MINUTES = 30;

export const startOfWeek = (iso) => addDays(iso, -fromIsoDate(iso).getDay());

export const isSameMonth = (a, b) => a.slice(0, 7) === b.slice(0, 7);

// Same day of the month, clamped for shorter months (Jan 31 + 1 month = Feb 28)
export const addMonths = (iso, months) => {
  const date = fromIsoDate(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, daysInMonth));
  return toIsoDate(date);
};

// The weeks a month grid shows: Sunday on or before the 1st to Saturday on or after the last day
export const monthWeeks = (iso) => {
  const date = fromIsoDate(iso);
  const first = toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
  const last = toIsoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  const weeks = [];
  for (let day = startOfWeek(first); day <= last; day = addDays(day, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(day, i)));
  }
  return weeks;
};

export const weekDays = (iso) => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(iso), i));

// The dates a view shows, used to load its entries
export const visibleRange = (view, iso) => {
  if (view === VIEWS.MONTH) {
    const weeks = monthWeeks(iso);
    return { from: weeks[0][0], to: weeks[weeks.length - 1][6] };
  }
  if (view === VIEWS.WEEK) {
    const start = startOfWeek(iso);
    return { from: start, to: addDays(start, 6) };
  }
  return { from: iso, to: iso };
};

// Previous (-1) or next (+1) month, week or day
export const stepDate = (view, iso, direction) => {
  if (view === VIEWS.MONTH) return addMonths(iso, direction);
  if (view === VIEWS.WEEK) return addDays(iso, 7 * direction);
  return addDays(iso, direction);
};

const format = (iso, options) => fromIsoDate(iso).toLocaleDateString('en-US', options);

// "Sep 23", or "Wed, Sep 23" with the weekday
export const shortDate = (iso, withWeekday = false) =>
  format(iso, { ...(withWeekday ? { weekday: 'short' } : {}), month: 'short', day: 'numeric' });

// "Wednesday, September 23, 2026"
export const longDate = (iso) => format(iso, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// "September 2026", "Sep 20 – 26, 2026" or "Tuesday, September 22, 2026"
export const viewTitle = (view, iso) => {
  if (view === VIEWS.MONTH) return format(iso, { month: 'long', year: 'numeric' });
  if (view === VIEWS.DAY) return longDate(iso);
  const days = weekDays(iso);
  const [first, last] = [days[0], days[6]];
  if (first.slice(0, 4) !== last.slice(0, 4)) {
    return `${format(first, { month: 'short', day: 'numeric', year: 'numeric' })} – ${format(last, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  const end = isSameMonth(first, last) ? format(last, { day: 'numeric' }) : format(last, { month: 'short', day: 'numeric' });
  return `${format(first, { month: 'short', day: 'numeric' })} – ${end}, ${first.slice(0, 4)}`;
};

// "14:30" -> "2:30 PM"
export const formatTime = (hhmm) => {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

// Short times for small chips: "14:00" -> "2pm", "14:30" -> "2:30pm"
export const formatShortTime = (hhmm) => {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const suffix = hours < 12 ? 'am' : 'pm';
  return `${hours % 12 || 12}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}${suffix}`;
};

// "All day", "9:00 AM" or "9:00 AM – 10:30 AM"
export const timeLabel = (event) => {
  if (event.allDay) return 'All day';
  return event.endTime ? `${formatTime(event.startTime)} – ${formatTime(event.endTime)}` : formatTime(event.startTime);
};

// How long an entry runs: "1 hour", "30 minutes", "1 hour 30 minutes", or null when it has no end
export const eventDuration = (event) => {
  if (event.allDay || !event.endTime) return null;
  const minutes = toMinutes(event.endTime) - toMinutes(event.startTime);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts = [];
  if (hours) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  if (rest) parts.push(`${rest} minute${rest === 1 ? '' : 's'}`);
  return parts.join(' ') || null;
};

export const toMinutes = (hhmm) => {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
};

export const fromMinutes = (total) =>
  `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

// A start time and a one-hour end for a new timed entry, kept within the day
export const defaultTimes = (startMinutes) => {
  const start = Math.min(Math.max(startMinutes, 0), 23 * 60);
  return { startTime: fromMinutes(start), endTime: fromMinutes(Math.min(start + 60, 23 * 60 + 59)) };
};

// Places a day's timed entries in side-by-side columns wherever they overlap, so none is
// hidden. Returns { event, start, end, column, columns } with times in minutes.
export const layoutOverlaps = (events) => {
  const items = events
    .filter(event => !event.allDay)
    .map(event => {
      const start = toMinutes(event.startTime);
      const end = event.endTime ? toMinutes(event.endTime) : start;
      return { event, start, end: Math.min(Math.max(end, start + MIN_BLOCK_MINUTES), 24 * 60) };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const placed = [];
  let group = [];
  let groupEnd = -1;
  const finishGroup = () => {
    const columnEnds = [];
    group.forEach(item => {
      let column = columnEnds.findIndex(end => end <= item.start);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(item.end);
      } else {
        columnEnds[column] = item.end;
      }
      item.column = column;
    });
    group.forEach(item => placed.push({ ...item, columns: columnEnds.length }));
    group = [];
    groupEnd = -1;
  };

  items.forEach(item => {
    if (group.length && item.start >= groupEnd) finishGroup();
    group.push(item);
    groupEnd = Math.max(groupEnd, item.end);
  });
  finishGroup();
  return placed;
};

// Entries grouped by date: { "2026-09-22": [...], ... }, keeping the server's order
export const groupByDate = (events) =>
  events.reduce((groups, event) => {
    (groups[event.date] ||= []).push(event);
    return groups;
  }, {});
