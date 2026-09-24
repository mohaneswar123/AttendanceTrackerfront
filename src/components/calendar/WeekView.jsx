import React from 'react';
import TimeGrid from './TimeGrid';
import AgendaView from './AgendaView';
import { weekDays } from '../../utils/calendarDate';

// Seven days from Sunday: an hour grid on desktop, a day-by-day list on phones, where
// seven hour columns would be too narrow to read
function WeekView({ currentDate, events, eventsByDate, compact, onSlotClick, onEventClick, onDayClick }) {
  const days = weekDays(currentDate);

  if (compact) {
    return (
      <section className="surface rounded-xl p-4" aria-label="Week">
        <AgendaView events={events} days={days} onEventClick={onEventClick} />
      </section>
    );
  }

  return (
    <TimeGrid
      days={days}
      eventsByDate={eventsByDate}
      onSlotClick={onSlotClick}
      onEventClick={onEventClick}
      onDayHeaderClick={onDayClick}
    />
  );
}

export default WeekView;
