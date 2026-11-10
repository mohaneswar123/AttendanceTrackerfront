import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useCalendar, { MAX_SEARCH_RESULTS } from '../hooks/useCalendar';
import { todayLocal } from '../utils/date';
import {
  VIEWS,
  addMonths,
  defaultTimes,
  groupByDate,
  isSameMonth,
  longDate,
  shortDate,
  stepDate,
  weekDays,
  visibleRange
} from '../utils/calendarDate';
import FeatureShell from '../components/FeatureShell';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from '../components/icons';
import MonthGrid from '../components/calendar/MonthGrid';
import DayStrip from '../components/calendar/DayStrip';
import EventRow, { EventListRow } from '../components/calendar/EventRow';
import EventFormModal from '../components/calendar/EventFormModal';
import EventDetailsModal from '../components/calendar/EventDetailsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';

const UPCOMING_SHOWN = 8;
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'EVENT', label: 'Events' },
  { id: 'REMINDER', label: 'Reminders' }
];

// Which view each address shows. Events is the list, with no grid at all.
const VIEW_FOR_PATH = {
  '/calendar': VIEWS.MONTH,
  '/calendar/week': VIEWS.WEEK,
  '/calendar/events': 'EVENTS'
};
const PERIOD_NAMES = { [VIEWS.MONTH]: 'month', [VIEWS.WEEK]: 'week' };

function Calendar() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        title="Your calendar"
        message="Log in to keep your exams, deadlines and reminders in one place."
      />
    );
  }
  return <CalendarPage />;
}

// A new entry starts at the next whole hour today, or 9 AM on any other day
function newEntryTimes(date) {
  const now = new Date();
  return date === todayLocal() ? defaultTimes((now.getHours() + 1) * 60) : defaultTimes(9 * 60);
}

/** "9 – 15 November", or "28 Oct – 3 Nov" when a week straddles two months */
const weekRangeLabel = (iso) => {
  const days = weekDays(iso);
  const [first, last] = [days[0], days[6]];
  const sameMonth = first.slice(0, 7) === last.slice(0, 7);
  const start = new Date(`${first}T00:00:00`);
  const end = new Date(`${last}T00:00:00`);
  return sameMonth
    ? `${start.getDate()} – ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'long' })}`
    : `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
};

/** "Today · Tue, 10 Nov" for the day being looked at */
const dayHeading = (iso, today) => {
  const label = new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short'
  });
  return iso === today ? `Today · ${label}` : label;
};

/**
 * The week as a list of days rather than a grid of hours.
 *
 * Days with nothing on them collapse into one dashed line, so a quiet week is a few rows
 * instead of seven empty columns, and the days that do have something keep the room.
 */
const weekSections = (days, eventsByDate) => {
  const sections = [];
  let empties = [];
  const flush = () => {
    if (empties.length === 0) return;
    sections.push({ id: `empty-${empties[0]}`, empty: true, from: empties[0], to: empties[empties.length - 1] });
    empties = [];
  };

  days.forEach(date => {
    const entries = eventsByDate[date] || [];
    if (entries.length === 0) {
      empties.push(date);
      return;
    }
    flush();
    sections.push({ id: date, date, entries });
  });
  flush();
  return sections;
};

function CalendarPage() {
  const { pathname } = useLocation();
  const routeView = VIEW_FOR_PATH[pathname] || VIEWS.MONTH;
  const eventsOnly = routeView === 'EVENTS';
  const view = eventsOnly ? VIEWS.MONTH : routeView;

  const [currentDate, setCurrentDate] = useState(todayLocal);
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(null);
  const [details, setDetails] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [notice, setNotice] = useState('');

  const range = useMemo(() => visibleRange(view, currentDate), [view, currentDate]);
  const calendar = useCalendar(range, searchQuery);
  const eventsByDate = useMemo(() => groupByDate(calendar.events), [calendar.events]);
  const searching = searchQuery.trim() !== '';
  const today = todayLocal();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Today's entries drop off the list once they're over
  const upcoming = useMemo(() => {
    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return calendar.upcoming.filter(entry =>
      entry.date > today || entry.allDay || (entry.endTime || entry.startTime) >= nowTime);
  }, [calendar.upcoming, today]);

  const filtered = useMemo(
    () => (filter === 'all' ? upcoming : upcoming.filter(entry => entry.type === filter)),
    [upcoming, filter]
  );

  // The list page groups by how soon, not by date: "Today" then "This week" then the rest
  const listGroups = useMemo(() => {
    const weekEnd = weekDays(today)[6];
    const groups = [
      { id: 'today', title: 'Today', entries: filtered.filter(entry => entry.date === today) },
      { id: 'week', title: 'This week', entries: filtered.filter(entry => entry.date > today && entry.date <= weekEnd) },
      { id: 'later', title: 'Later', entries: filtered.filter(entry => entry.date > weekEnd) }
    ];
    return groups.filter(group => group.entries.length > 0);
  }, [filtered, today]);

  const goTo = (date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };

  const openCreate = (initial) => setForm({ initial });
  const openCreateOn = (date) => openCreate({ date, allDay: false, ...newEntryTimes(date) });

  const handleDayClick = (date) => {
    setSelectedDate(date);
    if (!isSameMonth(date, currentDate) && view === VIEWS.MONTH) setCurrentDate(date);
  };

  const closeForm = useCallback(() => setForm(null), []);
  const closeDetails = useCallback(() => setDetails(null), []);
  const cancelDelete = useCallback(() => setDeleting(null), []);

  const toggleSearch = () => {
    setSearchOpen(open => {
      if (open) setSearchQuery('');
      return !open;
    });
  };

  const handleSave = async (entry) => {
    const result = await calendar.saveEvent(form.event?.id, entry);
    if (result.success) {
      setForm(null);
      const saved = result.event;
      if (saved.date < range.from || saved.date > range.to) {
        setNotice(`Saved on ${shortDate(saved.date, true)}.`);
      } else {
        setSelectedDate(saved.date);
      }
    }
    return result;
  };

  const handleDelete = async () => {
    const entry = deleting;
    setDeleting(null);
    const result = await calendar.deleteEvent(entry.id);
    if (result.success) setDetails(null);
    else setNotice(result.message);
  };

  // A search result opens its day
  const openSearchResult = (entry) => {
    setSearchQuery('');
    setSearchOpen(false);
    goTo(entry.date);
    setDetails(entry);
  };

  // null while the search is still in flight, which is not the same as "no matches"
  const results = calendar.results;
  const query = searchQuery.trim();

  const title = eventsOnly
    ? 'Events'
    : view === VIEWS.WEEK
      ? 'This week'
      : new Date(`${currentDate}T00:00:00`).toLocaleDateString('en-US', { month: 'long' });

  const subtitle = eventsOnly
    ? 'Everything coming up'
    : view === VIEWS.WEEK
      ? weekRangeLabel(currentDate)
      : currentDate.slice(0, 4);

  const dayEntries = eventsByDate[selectedDate] || [];
  const sections = view === VIEWS.WEEK ? weekSections(weekDays(currentDate), eventsByDate) : [];

  return (
    <FeatureShell
      title={title}
      subtitle={subtitle}
      onAdd={() => openCreateOn(eventsOnly ? today : selectedDate)}
      actions={(
        <button
          type="button"
          onClick={toggleSearch}
          aria-label="Search"
          aria-expanded={searchOpen}
          className="w-11 h-11 md:w-10 md:h-10 rounded-full grid place-items-center bg-background-paper text-slate-400 hover:text-white transition-colors"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      )}
    >
      {!eventsOnly && (
        <div className="flex items-center justify-end gap-2 -mt-2">
          <button
            type="button"
            onClick={() => goTo(todayLocal())}
            className="h-10 px-3.5 rounded-full text-sm font-bold text-slate-400 hover:text-white"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => goTo(view === VIEWS.MONTH ? addMonths(currentDate, -1) : stepDate(view, currentDate, -1))}
            aria-label={`Previous ${PERIOD_NAMES[view]}`}
            className="w-11 h-11 rounded-full grid place-items-center bg-background-paper text-slate-300 hover:text-white"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(view === VIEWS.MONTH ? addMonths(currentDate, 1) : stepDate(view, currentDate, 1))}
            aria-label={`Next ${PERIOD_NAMES[view]}`}
            className="w-11 h-11 rounded-full grid place-items-center bg-background-paper text-slate-300 hover:text-white"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {(searchOpen || eventsOnly) && (
        <div className="surface flex items-center gap-3 px-3 h-12">
          <SearchIcon className="w-5 h-5 shrink-0 text-slate-500" aria-hidden="true" />
          <input
            autoFocus={searchOpen}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events"
            aria-label="Search your calendar"
            className="flex-1 min-w-0 bg-transparent border-0 p-0 text-base md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      )}

      {notice && <div className="notice notice-info" role="status">{notice}</div>}

      {calendar.error && (
        <div className="notice notice-danger" role="alert">
          <span className="flex-1">{calendar.error}</span>
          <button onClick={calendar.clearError} className="text-rose-300 hover:text-white text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {searching ? (
        <section aria-label="Search results" className="space-y-2">
          <h2 className="text-xl font-bold text-white px-1">
            {results === null
              ? `Searching for “${query}”…`
              : results.length === 0
                ? `No match for “${query}”`
                : `${results.length}${results.length === MAX_SEARCH_RESULTS ? '+' : ''} result${results.length === 1 ? '' : 's'} for “${query}”`}
          </h2>
          <ul className="space-y-2">
            {(results || []).map(entry => (
              <EventListRow key={entry.id} event={entry} today={today} onClick={openSearchResult} />
            ))}
          </ul>
        </section>
      ) : eventsOnly ? (
        <>
          <div className="flex gap-2" role="tablist" aria-label="Filter entries">
            {FILTERS.map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={`h-11 px-5 rounded-full text-sm font-bold transition-colors ${filter === item.id
                  ? 'bg-light-primary text-background'
                  : 'surface text-slate-300 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {listGroups.length === 0 ? (
            <section className="surface p-8 text-center" aria-label="Nothing coming up">
              <h2 className="font-semibold text-white">Nothing coming up</h2>
              <p className="text-sm text-slate-500 mt-1">
                Entries you add appear here, soonest first.
              </p>
            </section>
          ) : (
            listGroups.map(group => (
              <section key={group.id} aria-label={group.title}>
                <div className="flex items-center gap-2 px-1 mb-2">
                  <h2 className="text-xl font-bold text-white">{group.title}</h2>
                  <span className="text-sm text-slate-500">{group.entries.length}</span>
                </div>
                <ul className="space-y-2">
                  {group.entries
                    .slice(0, group.id === 'later' && !showAllUpcoming ? UPCOMING_SHOWN : undefined)
                    .map(entry => (
                      <EventListRow key={entry.id} event={entry} today={today} onClick={setDetails} />
                    ))}
                </ul>
                {group.id === 'later' && group.entries.length > UPCOMING_SHOWN && (
                  <button
                    type="button"
                    onClick={() => setShowAllUpcoming(open => !open)}
                    className="mt-2 text-sm font-semibold text-calendar hover:underline px-1"
                  >
                    {showAllUpcoming ? 'Show less' : `Show all ${group.entries.length}`}
                  </button>
                )}
              </section>
            ))
          )}
        </>
      ) : view === VIEWS.MONTH ? (
        <>
          <MonthGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            today={today}
            eventsByDate={eventsByDate}
            onSelect={handleDayClick}
          />

          <section aria-label="Selected day">
            <div className="flex items-baseline justify-between gap-3 px-1 mb-2">
              <h2 className="text-xl font-bold text-white">{dayHeading(selectedDate, today)}</h2>
              <span className="text-sm text-slate-500 shrink-0">
                {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {dayEntries.length > 0 && (
              <ul className="space-y-2">
                {dayEntries.map(entry => (
                  <EventRow key={entry.id} event={entry} onClick={setDetails} />
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => openCreateOn(selectedDate)}
              className="mt-2 w-full h-12 rounded-xl border border-dashed border-line text-sm font-bold text-slate-400 hover:text-white hover:border-slate-500 inline-flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add to {shortDate(selectedDate, true)}
            </button>
          </section>

          {upcoming.length > 0 && (
            <section aria-label="Coming up">
              <h2 className="text-xl font-bold text-white px-1 mb-2">Coming up</h2>
              <ul className="space-y-2">
                {upcoming
                  .filter(entry => entry.date !== selectedDate)
                  .slice(0, showAllUpcoming ? undefined : 3)
                  .map(entry => (
                    <EventListRow key={entry.id} event={entry} today={today} onClick={setDetails} />
                  ))}
              </ul>
              {upcoming.filter(entry => entry.date !== selectedDate).length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllUpcoming(open => !open)}
                  className="mt-2 text-sm font-semibold text-calendar hover:underline px-1"
                >
                  {showAllUpcoming ? 'Show less' : 'See all'}
                </button>
              )}
            </section>
          )}
        </>
      ) : (
        <>
          <DayStrip
            currentDate={currentDate}
            selectedDate={selectedDate}
            today={today}
            eventsByDate={eventsByDate}
            onSelect={handleDayClick}
          />

          {sections.map(section => (section.empty ? (
            <div
              key={section.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-line text-sm text-slate-500"
            >
              <span aria-hidden="true">—</span>
              <span>
                <span className="font-bold text-slate-300">
                  {section.from === section.to
                    ? shortDate(section.from, true)
                    : `${shortDate(section.from, true)} – ${shortDate(section.to, true)}`}
                </span>
                {' · Nothing planned'}
              </span>
            </div>
          ) : (
            <section key={section.id} aria-label={dayHeading(section.date, today)}>
              <div className="flex items-baseline gap-2 px-1 mb-2">
                <h2 className={`text-xl font-bold ${section.date === today ? 'text-calendar' : 'text-white'}`}>
                  {dayHeading(section.date, today)}
                </h2>
                <span className="text-sm text-slate-500">
                  {section.entries.length} {section.entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <ul className="space-y-2">
                {section.entries.map(entry => (
                  <EventRow key={entry.id} event={entry} onClick={setDetails} />
                ))}
              </ul>
            </section>
          )))}

          <button
            type="button"
            onClick={() => openCreateOn(selectedDate)}
            className="w-full h-12 rounded-xl border border-dashed border-line text-sm font-bold text-slate-400 hover:text-white hover:border-slate-500 inline-flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add to {shortDate(selectedDate, true)}
          </button>
        </>
      )}

      {form && (
        <EventFormModal
          event={form.event}
          initial={form.initial}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {details && (
        <EventDetailsModal
          event={details}
          onEdit={() => {
            setForm({ event: details });
            setDetails(null);
          }}
          onDelete={() => setDeleting(details)}
          onClose={closeDetails}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this entry?"
          message={`“${deleting.title}” on ${longDate(deleting.date)} will be removed.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={cancelDelete}
        />
      )}
    </FeatureShell>
  );
}

export default Calendar;
