import React from 'react';
import { categoryOf, formatShortTime, relativeDay, shortDuration } from '../../utils/calendarDate';
import { BellIcon, BookIcon, CalendarIcon, ClockIcon, StarIcon, UserIcon } from '../icons';

const CATEGORY_ICON = {
  CLASS: BookIcon,
  STUDY: StarIcon,
  EXAM: ClockIcon,
  DEADLINE: CalendarIcon,
  PERSONAL: UserIcon
};

/**
 * One entry on a day's list: when it is, what it is, and what it is about.
 *
 * The time sits in its own block on the left — start above end — because a list of a day
 * is read down the times first, and the category is named in words beside the colour, so
 * the tint is never the only thing saying what this is.
 */
function EventRow({ event, onClick }) {
  const tone = categoryOf(event);
  const Icon = CATEGORY_ICON[event.category] || (event.type === 'REMINDER' ? BellIcon : CalendarIcon);
  const length = shortDuration(event);

  return (
    <li>
      <button
        type="button"
        onClick={() => onClick(event)}
        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-opacity hover:opacity-90 ${tone.tint}`}
      >
        <span className="w-14 shrink-0 text-left">
          {event.allDay ? (
            <>
              <span className="block text-base font-bold text-white leading-tight">All</span>
              <span className="block text-xs text-slate-500">day</span>
            </>
          ) : (
            <>
              <span className="block text-base font-bold text-white leading-tight tabular-nums">
                {formatShortTime(event.startTime)}
              </span>
              {event.endTime && (
                <span className="block text-xs text-slate-500 tabular-nums">
                  {formatShortTime(event.endTime)}
                </span>
              )}
            </>
          )}
        </span>

        <span className="flex-1 min-w-0">
          <span className="block font-bold text-white truncate">{event.title}</span>
          <span className="block text-xs text-slate-500 truncate">
            {/* The category already says "Reminder" when there is no category to name */}
            {[tone.label, length, event.category && event.type === 'REMINDER' ? 'Reminder' : '']
              .filter(Boolean).join(' · ')}
          </span>
        </span>

        <span className={`w-10 h-10 shrink-0 rounded-xl grid place-items-center bg-background-paper ${tone.text}`} aria-hidden="true">
          <Icon className="w-5 h-5" />
        </span>
      </button>
    </li>
  );
}

/** The same entry in a list that spans days, where the date matters more than the hour */
export function EventListRow({ event, today, onClick }) {
  const tone = categoryOf(event);
  const date = new Date(`${event.date}T00:00:00`);

  return (
    <li>
      <button
        type="button"
        onClick={() => onClick(event)}
        className="w-full text-left surface flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
      >
        <span className={`w-12 h-12 shrink-0 rounded-xl grid place-items-center ${tone.tint}`} aria-hidden="true">
          <span className={`block text-[10px] font-bold uppercase ${tone.text}`}>
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
          <span className="block text-base font-bold text-white leading-none">{date.getDate()}</span>
        </span>

        <span className="flex-1 min-w-0">
          <span className="block font-bold text-white truncate">{event.title}</span>
          <span className="block text-xs text-slate-500 truncate">
            {event.allDay
              ? `All day · ${tone.label}${event.category && event.type === 'REMINDER' ? ' reminder' : ''}`
              : `${formatShortTime(event.startTime)}${event.endTime ? `–${formatShortTime(event.endTime)}` : ''} · ${tone.label}`}
          </span>
        </span>

        <span className="text-xs text-slate-500 shrink-0">{relativeDay(event.date, today)}</span>
      </button>
    </li>
  );
}

export default EventRow;
