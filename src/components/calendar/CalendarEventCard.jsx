import React from 'react';
import { formatShortTime, timeLabel } from '../../utils/calendarDate';

// Events are violet, reminders amber
export const TYPE_STYLES = {
  EVENT: {
    chip: 'bg-primary-500/20 text-primary-100 border-primary-500/40 hover:bg-primary-500/30',
    block: 'bg-primary-500/25 border-primary-400 text-primary-50 hover:bg-primary-500/35',
    dot: 'bg-primary-400',
    badge: 'bg-primary-500/15 text-primary-200 border-primary-500/30'
  },
  REMINDER: {
    chip: 'bg-amber-500/15 text-amber-100 border-amber-500/40 hover:bg-amber-500/25',
    block: 'bg-amber-500/20 border-amber-400 text-amber-50 hover:bg-amber-500/30',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/15 text-amber-200 border-amber-500/30'
  }
};

export const TYPE_LABELS = { EVENT: 'Event', REMINDER: 'Reminder' };

const bell = (event) => (event.type === 'REMINDER' ? '🔔 ' : '');

// One entry: a one-line `chip` for month cells and the all-day row, or a `row` for lists
function CalendarEventCard({ event, variant = 'row', onClick }) {
  if (variant === 'chip') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
        // Keeps Enter on the chip from also reaching the day cell around it
        onKeyDown={(e) => e.stopPropagation()}
        title={`${event.title} · ${timeLabel(event)}`}
        className={`w-full text-left truncate px-1.5 py-0.5 rounded-md border text-[11px] font-medium transition-colors ${TYPE_STYLES[event.type].chip}`}
      >
        {bell(event)}
        {!event.allDay && <span className="opacity-70">{formatShortTime(event.startTime)} </span>}
        {event.title}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="w-full text-left flex items-stretch gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:bg-white/10 transition-colors"
    >
      <span className={`w-1.5 rounded-full shrink-0 ${TYPE_STYLES[event.type].dot}`} aria-hidden="true" />
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-slate-100 truncate">{bell(event)}{event.title}</span>
        <span className="block text-xs text-slate-400 mt-0.5">{timeLabel(event)}</span>
      </span>
    </button>
  );
}

export default CalendarEventCard;
