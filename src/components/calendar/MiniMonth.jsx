import React from 'react';
import { WEEKDAYS, isSameMonth, longDate, monthWeeks, viewTitle, VIEWS } from '../../utils/calendarDate';
import { todayLocal } from '../../utils/date';

// The small month beside the calendar, for jumping to a date at a glance
function MiniMonth({ currentDate, selectedDate, eventsByDate, onSelect, onStepMonth }) {
  const today = todayLocal();
  const days = monthWeeks(currentDate).flat();

  return (
    <section className="glass-panel rounded-3xl p-4" aria-label="Jump to a date">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="text-sm font-bold text-white truncate">{viewTitle(VIEWS.MONTH, currentDate)}</h2>
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={() => onStepMonth(-1)} aria-label="Previous month in the small calendar" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button type="button" onClick={() => onStepMonth(1)} aria-label="Next month in the small calendar" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7" aria-hidden="true">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-semibold text-slate-500 py-1">{day.slice(0, 2)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map(date => {
          const count = (eventsByDate[date] || []).length;
          const selected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              aria-label={`${longDate(date)}, ${count} ${count === 1 ? 'entry' : 'entries'}`}
              aria-pressed={selected}
              className={`h-8 flex flex-col items-center justify-center rounded-lg text-xs transition-colors ${isSameMonth(date, currentDate) ? '' : 'opacity-40'} ${selected ? 'ring-1 ring-primary-500/60' : 'hover:bg-white/5'}`}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full ${date === today ? 'bg-primary-500 text-white font-bold' : 'text-slate-200'}`}>
                {Number(date.slice(8))}
              </span>
              <span className="h-1 flex items-center" aria-hidden="true">
                {count > 0 && <span className="w-1 h-1 rounded-full bg-primary-400" />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default MiniMonth;
