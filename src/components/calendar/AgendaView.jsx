import React from 'react';
import CalendarEventCard from './CalendarEventCard';
import { groupByDate, longDate, shortDate } from '../../utils/calendarDate';
import { todayLocal } from '../../utils/date';

// Entries listed by date. Pass `days` to show those dates even when they're empty
// (the phone week and day agenda); otherwise only dates with entries are shown.
function AgendaView({ events, days, onEventClick, emptyMessage = 'Nothing planned.' }) {
  const groups = groupByDate(events);
  const dates = days || Object.keys(groups).sort();
  const today = todayLocal();

  if (dates.length === 0) {
    return <p className="text-sm text-slate-500 py-6 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {dates.map(date => {
        const entries = groups[date] || [];
        return (
          <section key={date} aria-label={longDate(date)}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${date === today ? 'text-primary-300' : 'text-slate-400'}`}>
              {date === today ? `Today · ${shortDate(date, true)}` : shortDate(date, true)}
            </h3>
            <div className="space-y-2">
              {entries.map(event => (
                <CalendarEventCard key={event.id} event={event} onClick={onEventClick} />
              ))}
              {entries.length === 0 && <p className="text-sm text-slate-500 px-1">Nothing planned.</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default AgendaView;
