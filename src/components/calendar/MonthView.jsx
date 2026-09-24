import React from 'react';
import CalendarEventCard, { TYPE_STYLES } from './CalendarEventCard';
import { WEEKDAYS, isSameMonth, longDate, monthWeeks } from '../../utils/calendarDate';
import { todayLocal } from '../../utils/date';

const MAX_CHIPS = 3;

// The month grid, Sunday first. On desktop it is one grid divided by hairlines and each
// day lists its entries; on phones (`compact`) days show dots and tapping selects the day.
function MonthView({ currentDate, eventsByDate, compact, selectedDate, onDayClick, onEventClick, onMoreClick }) {
  const today = todayLocal();
  const days = monthWeeks(currentDate).flat();

  const dayNumber = (date, dimmed) => (
    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs tabular-nums ${date === today
      ? 'bg-primary-600 text-primary-foreground font-semibold'
      : dimmed ? 'text-slate-500' : 'text-slate-300'}`}>
      {Number(date.slice(8))}
    </span>
  );

  if (compact) {
    return (
      <div className="surface p-2">
        <div className="grid grid-cols-7" aria-hidden="true">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-[11px] font-medium text-slate-500 py-2">{day[0]}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(date => {
            const entries = eventsByDate[date] || [];
            const selected = date === selectedDate;
            return (
              <button
                key={date}
                type="button"
                onClick={() => onDayClick(date)}
                aria-label={`${longDate(date)}, ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
                aria-pressed={selected}
                className={`h-12 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors ${selected ? 'bg-white/10' : ''} ${isSameMonth(date, currentDate) ? '' : 'opacity-60'}`}
              >
                {dayNumber(date, !isSameMonth(date, currentDate))}
                <span className="flex gap-0.5 h-1" aria-hidden="true">
                  {entries.slice(0, 3).map(entry => (
                    <span key={entry.id} className={`w-1 h-1 rounded-full ${TYPE_STYLES[entry.type].dot}`} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden">
      <div className="grid grid-cols-7 border-b border-line" aria-hidden="true">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">{day}</div>
        ))}
      </div>

      {/* One grid split by hairlines, so every cell reads as part of the same month */}
      <div className="grid grid-cols-7 gap-px bg-line">
        {days.map(date => {
          const entries = eventsByDate[date] || [];
          const dimmed = !isSameMonth(date, currentDate);
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
              className={`min-h-[6.5rem] p-1.5 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${dimmed ? 'bg-background-paper/50' : 'bg-background-paper hover:bg-white/5'}`}
            >
              <div className="flex justify-end">{dayNumber(date, dimmed)}</div>
              <div className="mt-1 space-y-1">
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
                    className="px-1 text-[11px] font-medium text-slate-400 hover:text-white"
                  >
                    {entries.length - MAX_CHIPS} more
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
