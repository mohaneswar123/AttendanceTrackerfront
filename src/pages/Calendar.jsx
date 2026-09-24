import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useCalendar, { MAX_SEARCH_RESULTS } from '../hooks/useCalendar';
import useMediaQuery from '../hooks/useMediaQuery';
import { todayLocal } from '../utils/date';
import {
  VIEWS,
  addMonths,
  defaultTimes,
  groupByDate,
  isSameMonth,
  shortDate,
  stepDate,
  viewTitle,
  visibleRange
} from '../utils/calendarDate';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarToolbar from '../components/calendar/CalendarToolbar';
import MiniMonth from '../components/calendar/MiniMonth';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import DayView from '../components/calendar/DayView';
import AgendaView from '../components/calendar/AgendaView';
import EventFormModal from '../components/calendar/EventFormModal';
import EventDetailsModal from '../components/calendar/EventDetailsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';
import { PlusIcon } from '../components/icons';

const UPCOMING_SHOWN = 8;
const PERIOD_NAMES = { [VIEWS.MONTH]: 'month', [VIEWS.WEEK]: 'week', [VIEWS.DAY]: 'day' };

function Calendar() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        title="Your calendar"
        message="Log in to keep track of exams, deadlines and important dates."
      />
    );
  }
  return <CalendarPage />;
}

// Start times for a new entry: the next full hour today, 9 AM on other days
function newEntryTimes(date) {
  const now = new Date();
  return date === todayLocal() ? defaultTimes((now.getHours() + 1) * 60) : defaultTimes(9 * 60);
}

function CalendarPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [view, setView] = useState(VIEWS.MONTH);
  const [currentDate, setCurrentDate] = useState(todayLocal);
  const [selectedDate, setSelectedDate] = useState(todayLocal); // the phone month's chosen day
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState(null);          // { event } to edit, or { initial } to create
  const [details, setDetails] = useState(null);    // the entry being viewed
  const [deleting, setDeleting] = useState(null);  // the entry waiting for delete confirmation
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

  const goTo = (date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };
  const goToDay = (date) => {
    setView(VIEWS.DAY);
    goTo(date);
  };

  const openCreate = (initial) => setForm({ initial });
  const openCreateOn = (date) => openCreate({ date, allDay: false, ...newEntryTimes(date) });

  // Month grid: desktop adds an entry on the clicked day; phones select the day
  const handleMonthDayClick = (date) => {
    if (isDesktop) {
      openCreateOn(date);
    } else {
      setSelectedDate(date);
      if (!isSameMonth(date, currentDate)) setCurrentDate(date);
    }
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
      } else if (!isDesktop) {
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

  // A search result opens its day (the one case where search changes the view)
  const openSearchResult = (entry) => {
    setSearchQuery('');
    goToDay(entry.date);
    setDetails(entry);
  };

  const title = view === VIEWS.DAY && !isDesktop
    ? `${shortDate(currentDate, true)}, ${currentDate.slice(0, 4)}`
    : viewTitle(view, currentDate);

  const results = calendar.results;
  const query = searchQuery.trim();

  return (
    <div className="space-y-4 md:space-y-5 pb-24 md:pb-0">
      <CalendarHeader
        loading={calendar.loading}
        searchOpen={searchOpen}
        onToggleSearch={toggleSearch}
        onAdd={() => openCreateOn(today)}
        showAdd={isDesktop}
      />

      <CalendarToolbar
        view={view}
        onViewChange={setView}
        title={title}
        periodName={PERIOD_NAMES[view]}
        onToday={() => goTo(today)}
        onPrevious={() => goTo(stepDate(view, currentDate, -1))}
        onNext={() => goTo(stepDate(view, currentDate, 1))}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {notice && (
        <div className="notice notice-info" role="status">
          {notice}
        </div>
      )}

      {calendar.error && (
        <div className="notice notice-danger" role="alert">
          <span className="flex-1">{calendar.error}</span>
          <button onClick={calendar.clearError} className="text-rose-300 hover:text-white text-xs font-semibold">Dismiss</button>
        </div>
      )}

      {/* The side panel sits beside Month and Day on wide screens; Week keeps the full width for its seven columns */}
      <div className={`grid gap-5 items-start ${view === VIEWS.WEEK ? '' : 'lg:grid-cols-[minmax(0,1fr)_20rem]'}`}>
        <div className="space-y-4 min-w-0">
          {searching ? (
            <section aria-label="Search results" className="surface rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-bold text-white">
                  {results === null
                    ? 'Searching…'
                    : `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query}”`}
                </h2>
                <button type="button" onClick={() => setSearchQuery('')} className="text-sm font-semibold text-primary-300 hover:text-primary-200">
                  Clear search
                </button>
              </div>
              {results?.length === MAX_SEARCH_RESULTS && (
                <p className="mb-3 text-sm text-slate-400">Showing the first 100 matches. Type more to narrow it down.</p>
              )}
              {results && (
                <AgendaView events={results} onEventClick={openSearchResult} emptyMessage="No entries match your search." />
              )}
            </section>
          ) : (
            <>
              {view === VIEWS.MONTH && (
                <MonthView
                  currentDate={currentDate}
                  eventsByDate={eventsByDate}
                  compact={!isDesktop}
                  selectedDate={selectedDate}
                  onDayClick={handleMonthDayClick}
                  onEventClick={setDetails}
                  onMoreClick={goToDay}
                />
              )}
              {view === VIEWS.WEEK && (
                <WeekView
                  currentDate={currentDate}
                  events={calendar.events}
                  eventsByDate={eventsByDate}
                  compact={!isDesktop}
                  onSlotClick={(date, minutes) => openCreate({ date, allDay: false, ...defaultTimes(minutes) })}
                  onEventClick={setDetails}
                  onDayClick={goToDay}
                />
              )}
              {view === VIEWS.DAY && (
                <DayView
                  currentDate={currentDate}
                  eventsByDate={eventsByDate}
                  onEventClick={setDetails}
                  onEdit={(event) => setForm({ event })}
                  onDelete={setDeleting}
                  onAdd={openCreateOn}
                />
              )}

              {/* Phones: the chosen day's entries under the month grid */}
              {view === VIEWS.MONTH && !isDesktop && (
                <section className="surface rounded-xl p-4" aria-label="Selected day">
                  <AgendaView events={eventsByDate[selectedDate] || []} days={[selectedDate]} onEventClick={setDetails} />
                  <button
                    type="button"
                    onClick={() => openCreateOn(selectedDate)}
                    className="mt-3 w-full py-3 rounded-xl border border-dashed border-line text-sm font-semibold text-slate-300 active:bg-white/5"
                  >
                    + Add on {shortDate(selectedDate, true)}
                  </button>
                </section>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          {isDesktop && (
            <MiniMonth
              currentDate={currentDate}
              selectedDate={selectedDate}
              eventsByDate={eventsByDate}
              onSelect={goTo}
              onStepMonth={(step) => goTo(addMonths(currentDate, step))}
            />
          )}

          <aside className="surface rounded-xl p-4 md:p-5" aria-label="Upcoming">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Upcoming Events</h2>
              {upcoming.length > UPCOMING_SHOWN && (
                <button type="button" onClick={() => setShowAllUpcoming(all => !all)} className="text-xs font-semibold text-primary-300 hover:text-primary-200">
                  {showAllUpcoming ? 'Show less' : 'See all'}
                </button>
              )}
            </div>
            <AgendaView
              events={showAllUpcoming ? upcoming : upcoming.slice(0, UPCOMING_SHOWN)}
              onEventClick={setDetails}
              emptyMessage="Nothing coming up."
            />
          </aside>
        </div>
      </div>

      {/* Add button within thumb reach on phones, above the bottom navigation */}
      {!isDesktop && !form && (
        <button
          type="button"
          onClick={() => openCreateOn(view === VIEWS.MONTH ? selectedDate : view === VIEWS.DAY ? currentDate : today)}
          aria-label="Add event"
          className="fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 text-primary-foreground flex items-center justify-center shadow-lg transition-colors"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      )}

      {form && (
        <EventFormModal event={form.event} initial={form.initial} onSave={handleSave} onClose={closeForm} />
      )}

      {details && !form && !deleting && (
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
          message={`"${deleting.title}" will be removed from your calendar.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default Calendar;
