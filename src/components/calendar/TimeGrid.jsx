import React, { useEffect, useRef, useState } from 'react';
import CalendarEventCard, { TYPE_STYLES } from './CalendarEventCard';
import {
  HOUR_HEIGHT,
  WEEKDAYS,
  formatTime,
  fromMinutes,
  layoutOverlaps,
  longDate,
  timeLabel
} from '../../utils/calendarDate';
import { fromIsoDate, todayLocal } from '../../utils/date';
import { BellIcon } from '../icons';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const SLOTS = Array.from({ length: 48 }, (_, slot) => slot); // half hours
const SLOT_HEIGHT = HOUR_HEIGHT / 2;
// Entries leave this strip free on the right of each day, so the time slots under
// an entry can still be clicked to add another one at the same time
const FREE_STRIP = '10px';

function useNowMinutes() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  return now.getHours() * 60 + now.getMinutes();
}

// One day's column: clickable half-hour slots, the day's timed entries side by side
// where they overlap, and the "now" line on today
function DayColumn({ date, events, isToday, nowMinutes, onSlotClick, onEventClick }) {
  return (
    <div className="relative border-l border-line" style={{ height: 24 * HOUR_HEIGHT }}>
      {SLOTS.map(slot => (
        <button
          key={slot}
          type="button"
          tabIndex={-1}
          aria-label={`Add an entry on ${longDate(date)} at ${formatTime(fromMinutes(slot * 30))}`}
          onClick={() => onSlotClick(date, slot * 30)}
          className={`absolute inset-x-0 hover:bg-white/5 ${slot % 2 === 0 ? 'border-t border-line' : ''}`}
          style={{ top: slot * SLOT_HEIGHT, height: SLOT_HEIGHT }}
        />
      ))}

      {layoutOverlaps(events).map(({ event, start, end, column, columns }) => (
        <button
          key={event.id}
          type="button"
          onClick={() => onEventClick(event)}
          title={`${event.title} · ${timeLabel(event)}`}
          className={`absolute z-[1] rounded-lg border-l-4 px-1.5 py-0.5 text-left overflow-hidden text-[11px] leading-tight transition-colors ${TYPE_STYLES[event.type].block}`}
          style={{
            top: (start / 60) * HOUR_HEIGHT + 1,
            height: Math.max(((end - start) / 60) * HOUR_HEIGHT - 2, 20),
            left: `calc((100% - ${FREE_STRIP}) * ${column / columns} + 2px)`,
            width: `calc((100% - ${FREE_STRIP}) / ${columns} - 4px)`
          }}
        >
          <span className="block font-semibold truncate">{event.type === 'REMINDER' && <BellIcon className="w-3 h-3 inline-block mr-0.5 -mt-0.5" />}{event.title}</span>
          <span className="block opacity-80 truncate">{timeLabel(event)}</span>
        </button>
      ))}

      {isToday && (
        <div
          className="absolute inset-x-0 z-[2] h-0.5 bg-rose-500 pointer-events-none"
          style={{ top: (nowMinutes / 60) * HOUR_HEIGHT }}
          aria-hidden="true"
        >
          <span className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
        </div>
      )}
    </div>
  );
}

// The Week and Day time grid: day headers, an all-day row, then 24 hours
function TimeGrid({ days, eventsByDate, onSlotClick, onEventClick, onDayHeaderClick }) {
  const scrollRef = useRef(null);
  const nowMinutes = useNowMinutes();
  const today = todayLocal();
  const columns = { gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` };

  // Start the day at 7 AM, with its label fully in view
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_HEIGHT - 12;
  }, []);

  return (
    <div className="surface rounded-xl overflow-hidden">
      <div className="grid border-b border-line" style={columns}>
        <div />
        {days.map(date => (
          <button
            key={date}
            type="button"
            onClick={() => onDayHeaderClick?.(date)}
            disabled={!onDayHeaderClick}
            aria-label={onDayHeaderClick ? `Open ${longDate(date)}` : longDate(date)}
            className="py-2 text-center disabled:cursor-default"
          >
            <span className="block text-[11px] uppercase text-slate-500 font-semibold">{WEEKDAYS[fromIsoDate(date).getDay()]}</span>
            <span className={`mx-auto mt-0.5 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${date === today ? 'bg-primary-500 text-primary-foreground' : 'text-slate-200'}`}>
              {Number(date.slice(8))}
            </span>
          </button>
        ))}
      </div>

      <div className="grid border-b border-line" style={columns}>
        <div className="text-[10px] text-slate-500 text-right pr-2 pt-2">all-day</div>
        {days.map(date => (
          <div key={date} className="p-1 space-y-1 min-h-[2.25rem] border-l border-line">
            {(eventsByDate[date] || []).filter(event => event.allDay).map(event => (
              <CalendarEventCard key={event.id} event={event} variant="chip" onClick={onEventClick} />
            ))}
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="overflow-y-auto h-[60vh] md:h-[36rem]" data-testid="time-grid-scroll">
        <div className="grid" style={columns}>
          <div className="relative" style={{ height: 24 * HOUR_HEIGHT }} aria-hidden="true">
            {HOURS.filter(hour => hour > 0).map(hour => (
              <span
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-[10px] text-slate-500 whitespace-nowrap"
                style={{ top: hour * HOUR_HEIGHT }}
              >
                {formatTime(fromMinutes(hour * 60)).replace(':00', '')}
              </span>
            ))}
          </div>
          {days.map(date => (
            <DayColumn
              key={date}
              date={date}
              events={(eventsByDate[date] || []).filter(event => !event.allDay)}
              isToday={date === today}
              nowMinutes={nowMinutes}
              onSlotClick={onSlotClick}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimeGrid;
