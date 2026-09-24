import React from 'react';
import { PlusIcon, SearchIcon } from '../icons';

// The page's own header: what this is, a search toggle, and Add event
// (phones use the floating + instead).
function CalendarHeader({ loading, searchOpen, onToggleSearch, onAdd, showAdd }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="page-title">Calendar</h1>
        <p className="page-subtitle hidden md:block">
          Events, deadlines and reminders{loading && ' · loading…'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleSearch}
          aria-label="Search"
          title="Search your calendar"
          aria-expanded={searchOpen}
          className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-line bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
        >
          <SearchIcon className="w-[18px] h-[18px]" />
        </button>
        {showAdd && (
          <button type="button" onClick={onAdd} className="btn btn-primary">
            <PlusIcon className="w-4 h-4" />
            Add event
          </button>
        )}
      </div>
    </div>
  );
}

export default CalendarHeader;
