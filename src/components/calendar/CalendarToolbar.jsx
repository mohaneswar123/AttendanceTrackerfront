import React, { useEffect, useRef } from 'react';
import { VIEWS } from '../../utils/calendarDate';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, SearchIcon } from '../icons';

const VIEW_LABELS = { [VIEWS.MONTH]: 'Month', [VIEWS.WEEK]: 'Week', [VIEWS.DAY]: 'Day' };

const navButton = 'w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-line bg-white/5 text-slate-300 hover:bg-white/10 transition-colors';

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
          <button type="button" onClick={onToday} className="btn btn-secondary">Today</button>
          <button type="button" onClick={onPrevious} aria-label={`Previous ${periodName}`} className={navButton}>
            <ChevronLeftIcon className="w-[18px] h-[18px]" />
          </button>
          <button type="button" onClick={onNext} aria-label={`Next ${periodName}`} className={navButton}>
            <ChevronRightIcon className="w-[18px] h-[18px]" />
          </button>
          <h2 data-testid="calendar-period" className="w-full sm:w-auto sm:ml-1 min-w-0 truncate text-base font-semibold text-white">{title}</h2>
        </div>

        <div className="segmented grid grid-cols-3 w-full sm:w-auto sm:inline-flex" role="tablist" aria-label="Calendar view">
          {Object.values(VIEWS).map(option => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={view === option}
              onClick={() => onViewChange(option)}
              className="segmented-item"
            >
              {VIEW_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {searchOpen && (
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onSearchChange('')}
            placeholder="Search your calendar"
            aria-label="Search your calendar"
            className="input pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-white/10"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarToolbar;
