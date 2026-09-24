import React, { useEffect, useRef } from 'react';
import { VIEWS } from '../../utils/calendarDate';

const VIEW_LABELS = { [VIEWS.MONTH]: 'Month', [VIEWS.WEEK]: 'Week', [VIEWS.DAY]: 'Day' };

const navButton = 'w-11 h-11 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 active:bg-white/15';

// Today and previous/next with the period on show, then Month / Week / Day.
// The search field appears under them once the header's search button is pressed.
function CalendarToolbar({
  view, onViewChange, title, periodName, onToday, onPrevious, onNext,
  searchOpen, searchQuery, onSearchChange
}) {
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* On narrow phones the period drops to its own line rather than being cut off */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <button type="button" onClick={onToday} className="h-11 md:h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-slate-200 hover:bg-white/10 active:bg-white/15">
            Today
          </button>
          <button type="button" onClick={onPrevious} aria-label={`Previous ${periodName}`} className={navButton}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button type="button" onClick={onNext} aria-label={`Next ${periodName}`} className={navButton}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
          <h2 data-testid="calendar-period" className="w-full sm:w-auto sm:ml-1 min-w-0 truncate text-lg md:text-xl font-semibold text-white">{title}</h2>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-900/60 border border-white/10 w-full sm:w-64" role="tablist" aria-label="Calendar view">
          {Object.values(VIEWS).map(option => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={view === option}
              onClick={() => onViewChange(option)}
              className={`py-2.5 md:py-1.5 rounded-xl text-sm font-semibold transition-colors ${view === option ? 'bg-primary-500/25 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {VIEW_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {searchOpen && (
        <div className="relative">
          {/* z-10: the input's glass blur would otherwise be drawn over the icon */}
          <svg className="absolute z-10 left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onSearchChange('')}
            placeholder="Search your calendar"
            aria-label="Search your calendar"
            className="input pl-10 pr-11 py-2.5 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute z-10 right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarToolbar;
