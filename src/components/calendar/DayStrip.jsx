import React from 'react';
import { WEEKDAYS, categoryOf, longDate, weekDays, weekdayIndex } from '../../utils/calendarDate';

/**
 * The seven days of a week, as a row you choose from.
 *
 * It is the week's table of contents: which days have something on them, and where today
 * sits among them. The entries themselves are listed below it.
 */
function DayStrip({ currentDate, selectedDate, today, eventsByDate, onSelect }) {
  const days = weekDays(currentDate);

  return (
    <section className="surface p-3" aria-label="This week">
      <div className="grid grid-cols-7">
        {days.map(date => {
          const entries = eventsByDate[date] || [];
          const isToday = date === today;
          const chosen = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              aria-label={`${longDate(date)}, ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
              aria-current={isToday ? 'date' : undefined}
              className="flex flex-col items-center gap-1.5 py-1"
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-calendar' : 'text-slate-400'}`}>
                {WEEKDAYS[weekdayIndex(date)].slice(0, 1)}
              </span>
              <span
                className={`w-10 h-10 rounded-full grid place-items-center text-base tabular-nums transition-colors ${isToday
                  ? 'bg-calendar text-white font-bold'
                  : chosen
                    ? 'bg-calendar-tint text-calendar font-bold'
                    : 'text-white font-medium hover:bg-white/5'}`}
              >
                {Number(date.slice(8, 10))}
              </span>
              <span className="flex gap-0.5 h-1" aria-hidden="true">
                {entries.slice(0, 3).map(event => (
                  <span key={event.id} className={`w-1 h-1 rounded-full ${categoryOf(event).dot}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default DayStrip;
