import React from 'react';
import { WEEKDAYS, categoryOf, isSameMonth, longDate, monthWeeks } from '../../utils/calendarDate';

/**
 * The month, as a grid you choose a day in.
 *
 * Entries are dots rather than titles: at this size a title is unreadable anyway, and the
 * month's job is to show the shape of a month — which weeks are busy — and to let you pick
 * a day. The day's own entries are listed underneath, where there is room to read them.
 */
function MonthGrid({ currentDate, selectedDate, today, eventsByDate, onSelect }) {
  const weeks = monthWeeks(currentDate);

  return (
    <section className="surface p-3 max-[359px]:p-1.5" aria-label="Month">
      <div className="grid grid-cols-7 mb-1" aria-hidden="true">
        {WEEKDAYS.map(day => (
          <span key={day} className="text-center text-xs font-semibold text-slate-400 py-1">
            {day.slice(0, 1)}
          </span>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map(week => (
          <div key={week[0]} className="grid grid-cols-7">
            {week.map(date => {
              const entries = eventsByDate[date] || [];
              const inMonth = isSameMonth(date, currentDate);
              const isToday = date === today;
              const chosen = date === selectedDate;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => onSelect(date)}
                  aria-label={`${longDate(date)}, ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
                  aria-current={isToday ? 'date' : undefined}
                  className="h-12 flex flex-col items-center justify-center gap-1"
                >
                  <span
                    className={`w-9 h-9 rounded-full grid place-items-center text-sm tabular-nums transition-colors ${isToday
                      ? 'bg-calendar text-white font-bold'
                      : chosen
                        ? 'bg-calendar-tint text-calendar font-bold'
                        : inMonth
                          ? 'text-white font-medium hover:bg-white/5'
                          : 'text-slate-400'}`}
                  >
                    {Number(date.slice(8, 10))}
                  </span>
                  {/* Up to three dots, coloured by what the entries are about */}
                  <span className="flex gap-0.5 h-1" aria-hidden="true">
                    {entries.slice(0, 3).map(event => (
                      <span key={event.id} className={`w-1 h-1 rounded-full ${categoryOf(event).dot}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

export default MonthGrid;
