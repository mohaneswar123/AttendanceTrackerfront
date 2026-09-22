import React from 'react';
import TimeGrid from './TimeGrid';

// One day's schedule as an hour grid, on desktop and phones
function DayView({ currentDate, eventsByDate, onSlotClick, onEventClick }) {
  return (
    <TimeGrid
      days={[currentDate]}
      eventsByDate={eventsByDate}
      onSlotClick={onSlotClick}
      onEventClick={onEventClick}
    />
  );
}

export default DayView;
