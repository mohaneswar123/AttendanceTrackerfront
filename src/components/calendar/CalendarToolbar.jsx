import React, { useEffect, useRef } from 'react';
import Tabs from '../Tabs';
import { VIEWS } from '../../utils/calendarDate';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, SearchIcon } from '../icons';

const VIEW_ITEMS = [
  { value: VIEWS.MONTH, label: 'Month' },
  { value: VIEWS.WEEK, label: 'Week' },
  { value: VIEWS.DAY, label: 'Day' }
];

const stepButton = 'w-9 h-9 rounded-lg border border-line bg-background-paper text-slate-400 grid place-items-center hover:text-slate-200 transition-colors';

// Month / Week / Day with Today beside them, and the arrows for stepping through.
// The search field appears underneath once the header's search button is pressed.
function CalendarToolbar({
  view, onViewChange, period, periodName, onToday, onPrevious, onNext,
  searchOpen, searchQuery, onSearchChange
}) {
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tabs label="Calendar view" items={VIEW_ITEMS} value={view} onChange={onViewChange} className="flex-1" />
        <button type="button" onClick={onToday} className="h-11 px-4 rounded-xl surface text-sm font-semibold text-primary-400 shrink-0">
          Today
        </button>
      </div>

      {/* The period sits between its own arrows, the way a calendar reads */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button type="button" onClick={onPrevious} aria-label={`Previous ${periodName}`} className={stepButton}>
          <ChevronLeftIcon className="w-[18px] h-[18px]" />
        </button>
        <span data-testid="calendar-period" className="text-sm font-semibold text-white truncate">{period}</span>
        <button type="button" onClick={onNext} aria-label={`Next ${periodName}`} className={stepButton}>
          <ChevronRightIcon className="w-[18px] h-[18px]" />
        </button>
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
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-md text-slate-500 hover:text-white"
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
