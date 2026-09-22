import React from 'react';
import { VIEWS } from '../../utils/calendarDate';

const VIEW_LABELS = { [VIEWS.MONTH]: 'Month', [VIEWS.WEEK]: 'Week', [VIEWS.DAY]: 'Day' };

// Month / Week / Day, title search, and Add Event (phones use the floating + instead)
function CalendarToolbar({ view, onViewChange, searchQuery, onSearchChange, onAdd, showAdd }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2">
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-900/60 border border-white/10 md:w-72" role="tablist" aria-label="Calendar view">
        {Object.values(VIEWS).map(option => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={view === option}
            onClick={() => onViewChange(option)}
            className={`py-2.5 md:py-2 rounded-xl text-sm font-semibold transition-colors ${view === option ? 'bg-primary-500/25 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {VIEW_LABELS[option]}
          </button>
        ))}
      </div>

      <div className="relative flex-1">
        {/* z-10: the input's glass blur would otherwise be drawn over the icon */}
        <svg className="absolute z-10 left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
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

      {showAdd && (
        <button type="button" onClick={onAdd} className="btn btn-primary whitespace-nowrap">
          + Add Event
        </button>
      )}
    </div>
  );
}

export default CalendarToolbar;
