import React from 'react';

// The page's own header: what this is, a search toggle, and Add Event
// (phones use the floating + instead).
function CalendarHeader({ loading, searchOpen, onToggleSearch, onAdd, showAdd }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">Calendar</h1>
        <p className="hidden md:block text-slate-400">
          Manage your events, deadlines and important dates{loading && ' · loading…'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleSearch}
          aria-label="Search"
          title="Search your calendar"
          aria-expanded={searchOpen}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 active:bg-white/15"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        {showAdd && (
          <button type="button" onClick={onAdd} className="btn btn-primary whitespace-nowrap">
            + Add Event
          </button>
        )}
      </div>
    </div>
  );
}

export default CalendarHeader;
