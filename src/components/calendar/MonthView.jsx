import React from 'react';
import CalendarEventCard, { TYPE_STYLES } from './CalendarEventCard';
import { WEEKDAYS, isSameMonth, longDate, monthWeeks } from '../../utils/calendarDate';
import { todayLocal } from '../../utils/date';

const MAX_CHIPS = 3;

// The month grid, Sunday first. On desktop each day lists its entries and clicking an
// empty spot adds one; on phones (`compact`) days show coloured dots and tapping selects the day.
function MonthView({ currentDate, eventsByDate, compact, selectedDate, onDayClick, onEventClick, onMoreClick }) {
  const today = todayLocal();
  const days = monthWeeks(currentDate).flat();

  const dayNumber = (date) => (
    <span
      className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${date === today ? 'bg-primary-500 text-white font-bold' : 'text-slate-200'}`}
    >
      {Number(date.slice(8))}
    </span>
  );

  return (
    <div className="glass-panel rounded-3xl p-2 md:p-3">
      <div className="grid grid-cols-7 mb-1" aria-hidden="true">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-[11px] md:text-xs font-semibold text-slate-500 uppercase py-2">
            {compact ? day[0] : day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 md:gap-1">
        {days.map(date => {
          const entries = eventsByDate[date] || [];
          const dimmed = !isSameMonth(date, currentDate);

          if (compact) {
            const selected = date === selectedDate;
            return (
              <button
                key={date}
                type="button"
                onClick={() => onDayClick(date)}
                aria-label={`${longDate(date)}, ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
                aria-pressed={selected}
                className={`h-14 flex flex-col items-center justify-center rounded-xl transition-colors ${selected ? 'bg-primary-500/25 ring-1 ring-primary-500/50' : 'active:bg-white/10'} ${dimmed ? 'opacity-40' : ''}`}
              >
                {dayNumber(date)}
                <span className="flex gap-0.5 h-1.5 mt-1" aria-hidden="true">
                  {entries.slice(0, 3).map(entry => (
                    <span key={entry.id} className={`w-1.5 h-1.5 rounded-full ${TYPE_STYLES[entry.type].dot}`} />
                  ))}
                </span>
              </button>
            );
          }

          return (
            <div
              key={date}
              role="button"
              tabIndex={0}
              aria-label={`Add an entry on ${longDate(date)}`}
              onClick={() => onDayClick(date)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDayClick(date);
                }
              }}
              className={`min-h-[7.5rem] p-1.5 rounded-xl border cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${dimmed ? 'border-transparent opacity-50' : 'bg-slate-900/40 border-white/5 hover:border-primary-500/40'}`}
            >
              <div className="flex justify-end mb-1">{dayNumber(date)}</div>
              <div className="space-y-1">
                {entries.slice(0, MAX_CHIPS).map(entry => (
                  <CalendarEventCard key={entry.id} event={entry} variant="chip" onClick={onEventClick} />
                ))}
                {entries.length > MAX_CHIPS && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoreClick(date);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="px-1 text-[11px] font-semibold text-slate-400 hover:text-white"
                  >
                    +{entries.length - MAX_CHIPS} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthView;
